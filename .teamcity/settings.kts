import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import jetbrains.buildServer.configs.kotlin.triggers.vcs

/*
 * TapeNetwork CI/CD experiments (Variant 1). Three build configs:
 *   Build     — build+test backend/web/cms, then build the 4 Docker images.
 *   PerfX4    — k6 x4 against the ALREADY-DEPLOYED live stack, median compare.
 *   SonarScan — backend (Gradle sonar plugin via init script) + web/cms
 *               (sonar-scanner-cli) analysis into the SonarQube server.
 *
 * The agent runs docker-out-of-docker (host socket mounted), so every
 * `docker` / `docker compose` step talks to the host daemon.
 *
 * pom.xml is TeamCity-generated — do not hand-edit it.
 */

version = "2025.03"

project {
    buildType(Build)
    buildType(PerfX4)
    buildType(SonarScan)
}

object Build : BuildType({
    name = "Build (backend + web + cms + images)"
    description = "Compile & test all modules, then build the four Docker images."

    vcs { root(DslContext.settingsRoot) }

    params {
        param("env.GRADLE_CACHE", "/opt/tape/ci/gradle")
    }

    steps {
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
        vcs { }
    }

    requirements {
        exists("docker.version")
    }
})

object PerfX4 : BuildType({
    name = "Perf x4 (live stack)"
    description = "k6 four runs against the already-deployed stack; compare medians and fail on >15% drift."

    vcs { root(DslContext.settingsRoot) }

    params {
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

    requirements {
        exists("docker.version")
    }
})

object SonarScan : BuildType({
    name = "Sonar analysis (backend + web + cms)"
    description = "Static analysis: backend via the Gradle SonarQube plugin (init script), web & cms via sonar-scanner-cli. Results land in SonarQube on :9000."

    vcs { root(DslContext.settingsRoot) }

    params {
        param("env.SONAR_HOST_URL", "http://host.docker.internal:9000")
        password("env.SONAR_TOKEN", "", display = ParameterDisplay.HIDDEN)
        param("env.GRADLE_CACHE", "/opt/tape/ci/gradle")
    }

    steps {
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
