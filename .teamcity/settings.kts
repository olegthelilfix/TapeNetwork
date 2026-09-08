import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import jetbrains.buildServer.configs.kotlin.triggers.vcs

/*
 * TeamCity project for TapeNetwork CI/CD experiments (Variant 1).
 *
 * Imported by TeamCity via Versioned Settings (Administration → Versioned
 * Settings → Kotlin format, this repo). Two build configs:
 *
 *   Build   — mirror of ci.yml / deploy.yml: build+test backend & web & cms,
 *             then build the four Docker images on the agent's host daemon.
 *   PerfX4  — run k6 four times against the ALREADY-DEPLOYED live stack and
 *             compare the medians; gate on >15% run-to-run drift.
 *
 * The agent runs docker-out-of-docker (host socket mounted, see
 * teamcity/docker-compose.yml), so every `docker …` / `docker compose …` step
 * below talks to the host daemon — same as the SSH-based GH workflows do.
 */

version = "2025.03"

project {
    description = "TapeNetwork CI/CD experiments"

    // The repo is a self-hosted GitHub; the VCS root is configured in the UI
    // (URL + credentials). We attach to whatever root TeamCity resolves as the
    // versioned-settings root via DslContext.settingsRoot.
    val vcs = DslContext.settingsRoot

    buildType(Build)
    buildType(PerfX4)
    buildType(SonarScan)
}

object Build : BuildType({
    name = "Build (backend + web + cms + images)"
    description = "Compile & test all modules, then build the four Docker images (mirror of ci.yml + deploy.yml)."

    vcs { root(DslContext.settingsRoot) }

    params {
        // Shared Gradle cache on the host, mounted into the build container.
        param("env.GRADLE_CACHE", "/opt/tape/ci/gradle")
    }

    steps {
        // backend — Gradle build+test in a zulu-21 container, shared cache.
        // Drop the stale journal lock first (fresh-PID-namespace bug, see
        // pr-remote-build.yml) via a throwaway root container.
        script {
            name = "backend — gradle build"
            scriptContent = """
                set -euxo pipefail
                mkdir -p "${'$'}GRADLE_CACHE"
                docker run --rm -v "${'$'}GRADLE_CACHE:/root/.gradle" alpine \
                    rm -rf /root/.gradle/caches/journal-1
                docker run --rm -v "%teamcity.build.checkoutDir%/backend:/app" \
                    -v "${'$'}GRADLE_CACHE:/root/.gradle" -w /app \
                    azul/zulu-openjdk:21 sh -c './gradlew build --no-daemon'
            """.trimIndent()
        }
        // web — needs outbound DNS for next/font/google at build time.
        script {
            name = "web — npm ci && test && build"
            scriptContent = """
                set -euxo pipefail
                docker run --rm --network host --dns 8.8.8.8 --dns 1.1.1.1 \
                    -v "%teamcity.build.checkoutDir%/web:/app" -w /app \
                    node:20-alpine sh -c 'npm ci && npm test && npm run build'
            """.trimIndent()
        }
        script {
            name = "cms — npm ci && build"
            scriptContent = """
                set -euxo pipefail
                docker run --rm --network host --dns 8.8.8.8 --dns 1.1.1.1 \
                    -v "%teamcity.build.checkoutDir%/cms:/app" -w /app \
                    node:20-alpine sh -c 'npm ci && npm run build'
            """.trimIndent()
        }
        // images — build (not push) all four, proving the Dockerfiles are green.
        script {
            name = "build docker images"
            scriptContent = """
                set -euxo pipefail
                cd "%teamcity.build.checkoutDir%"
                docker build -t tape-backend:%build.number%  ./backend
                docker build -t tape-web:%build.number%      ./web
                docker build -t tape-cms:%build.number%      ./cms
                docker build -t tape-streamer:%build.number% ./streamer
            """.trimIndent()
        }
    }

    triggers {
        vcs { }   // build on every push to the watched VCS root
    }

    requirements {
        // Only agents that can reach the host Docker daemon (our DooD agent).
        exists("docker.version")
    }
})

object PerfX4 : BuildType({
    name = "Perf x4 (live stack)"
    description = "k6 four runs against the already-deployed stack; compare medians and fail on >15% drift."

    vcs { root(DslContext.settingsRoot) }

    params {
        // Live stack on the same VM, reached from the k6 container via
        // host.docker.internal. Override in the UI to point elsewhere.
        param("env.BASE_URL", "http://host.docker.internal:8080/api/v1")
        param("env.RUNS", "4")
        param("env.MAX_REGRESSION", "15")
        param("env.VUS", "20")
        param("env.RAMP", "30s")
        param("env.DURATION", "1m")
    }

    steps {
        script {
            name = "perf x4 + compare"
            scriptContent = """
                set -euxo pipefail
                cd "%teamcity.build.checkoutDir%"
                chmod +x perf/ci-run-live-x4.sh
                perf/ci-run-live-x4.sh
            """.trimIndent()
        }
    }

    artifactRules = "perf/results/comparison.md => perf-report\nperf/results/*.json => perf-report"

    // Manual only — perf against the live stack is deliberate, not on-push.
    requirements {
        exists("docker.version")
    }
})

object SonarScan : BuildType({
    name = "Sonar analysis (backend + web + cms)"
    description = "Static analysis: backend via the Gradle SonarQube plugin (applied through an init script), web & cms via sonar-scanner-cli. Results land in the SonarQube server on :9000."

    vcs { root(DslContext.settingsRoot) }

    params {
        // Sonar server reachable from the analysis containers on the host.
        param("env.SONAR_HOST_URL", "http://host.docker.internal:9000")
        // Generate a token in the SonarQube UI (My Account → Security) and set
        // it here (mark the field as a password/secret in the TeamCity UI).
        password("env.SONAR_TOKEN", "", display = ParameterDisplay.HIDDEN)
        param("env.GRADLE_CACHE", "/opt/tape/ci/gradle")
    }

    steps {
        // backend — apply the sonar plugin via init script, no build.gradle edit.
        script {
            name = "backend — gradle sonar"
            scriptContent = """
                set -euxo pipefail
                cd "%teamcity.build.checkoutDir%"
                mkdir -p "${'$'}GRADLE_CACHE"
                docker run --rm --network host \
                    -e SONAR_HOST_URL -e SONAR_TOKEN \
                    -v "%teamcity.build.checkoutDir%:/src" \
                    -v "${'$'}GRADLE_CACHE:/root/.gradle" -w /src/backend \
                    azul/zulu-openjdk:21 sh -c \
                    './gradlew --no-daemon --init-script /src/teamcity/sonar/sonar-init.gradle.kts build sonar'
            """.trimIndent()
        }
        // web — sonar-scanner-cli reads web/sonar-project.properties.
        script {
            name = "web — sonar-scanner"
            scriptContent = """
                set -euxo pipefail
                docker run --rm --network host \
                    -e SONAR_HOST_URL -e SONAR_TOKEN \
                    -v "%teamcity.build.checkoutDir%/web:/usr/src" \
                    sonarsource/sonar-scanner-cli
            """.trimIndent()
        }
        // cms — same, against cms/sonar-project.properties.
        script {
            name = "cms — sonar-scanner"
            scriptContent = """
                set -euxo pipefail
                docker run --rm --network host \
                    -e SONAR_HOST_URL -e SONAR_TOKEN \
                    -v "%teamcity.build.checkoutDir%/cms:/usr/src" \
                    sonarsource/sonar-scanner-cli
            """.trimIndent()
        }
    }

    triggers {
        vcs { }
    }

    requirements {
        exists("docker.version")
    }
})
