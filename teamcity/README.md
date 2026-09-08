# TeamCity — CI/CD experiment stack

A minimal TeamCity (server + one agent) on the prod VM, used to reproduce the
TapeNetwork CI/CD scenarios (build + perf) in TeamCity instead of GitHub Actions.

> **Scope:** experimental. Built-in HSQLDB, plain HTTP on `:8111`, one agent
> that shares the host Docker daemon (docker-out-of-docker). Not for real use.

## Pieces

| File | What it is |
|------|-----------|
| `teamcity/docker-compose.yml`        | server (`:8111`) + one agent, host Docker socket mounted |
| `.github/workflows/deploy-teamcity.yml` | GHA `workflow_dispatch` — scp compose to VM, `docker compose up -d`, wait for `:8111` |
| `.teamcity/settings.kts`             | Kotlin DSL — the **Build** and **Perf x4** build configs |
| `.teamcity/pom.xml`                  | Maven descriptor TeamCity uses to compile the DSL |
| `perf/ci-run-live-x4.sh`             | k6 ×4 against the already-deployed stack + median compare |
| `teamcity/sonar/sonar-init.gradle.kts` | applies the Sonar Gradle plugin at analysis time (keeps `build.gradle.kts` clean) |
| `web/sonar-project.properties`, `cms/sonar-project.properties` | Sonar scanner config for the JS/TS modules |

## One-time setup

1. **Open the firewall port** (managed manually via gcloud, not terraform — run
   in Cloud Shell, project `schwab-433114`):
   ```bash
   gcloud compute firewall-rules update tape-allow-http \
     --rules tcp:80,tcp:443,tcp:8080,tcp:8081,tcp:8082,tcp:8111,tcp:9000
   ```
2. **Deploy** — Actions → *Deploy TeamCity (SSH)* → Run workflow. It ships the
   compose and starts the stack on the VM. Reuses `secrets.SSH_PRIVATE_KEY`,
   `vars.SSH_USER`, `vars.VM_HOST` (same as `deploy-vm.yml`).
3. **Finish the wizard** at `http://<VM_HOST>:8111`:
   - Data directory → default.
   - Database → **Internal (HSQLDB)**.
   - Accept the licence (free: 3 agents / 100 build configs).
   - Create an admin user.
4. **Authorize the agent**: Agents → *Unauthorized* → authorize `agent-docker-1`.
   Check its params include `docker.version` (proves it sees the host daemon).
5. **Import the DSL**: create a VCS root for this GitHub repo, then
   Administration → **Versioned Settings** → *Synchronization enabled*,
   *Kotlin* format, that VCS root. TeamCity reads `.teamcity/settings.kts` and
   creates the **Build** and **Perf x4** configs automatically.

6. **SonarQube first login**: open `http://<VM_HOST>:9000`, log in `admin`/`admin`
   and change the password. Generate a token (My Account → Security → Generate),
   then on the **Sonar analysis** build config in TeamCity set the `SONAR_TOKEN`
   parameter to that token (it's a hidden/password param).

## The build configs

- **Build (backend + web + cms + images)** — mirrors `ci.yml` + `deploy.yml`:
  `./gradlew build` (zulu-21, shared `/opt/tape/ci/gradle` cache, stale-journal
  cleanup), `npm ci && test && build` for web/cms (with `--network host` + DNS
  for `next/font/google`), then `docker build` of all four images. Triggers on
  push. **Does not push images** — this proves the tree builds, like
  `pr-remote-build.yml`.

- **Perf x4 (live stack)** — runs `perf/ci-run-live-x4.sh`: primes the API,
  runs k6 `scenarios.js` **4 times** against the live stack
  (`host.docker.internal:8080/api/v1`), records each run with `compare.mjs`,
  then compares median(runs 1-2) vs median(runs 3-4) and fails on >15% drift.
  Publishes `comparison.md` + the JSON records as the `perf-report` artifact.
  Manual trigger — it hits the live prod stack on purpose.

- **Sonar analysis (backend + web + cms)** — static analysis into the SonarQube
  server on `:9000`. Backend runs `./gradlew ... sonar` with the plugin applied
  via `teamcity/sonar/sonar-init.gradle.kts` (so `build.gradle.kts` stays clean);
  web & cms run `sonarsource/sonar-scanner-cli` against their
  `sonar-project.properties`. Needs the `SONAR_TOKEN` param set (see setup step
  6). Triggers on push. Three Sonar projects appear: `tape-backend`, `tape-web`,
  `tape-cms`.

## Gotchas

- **Bind-mount permissions.** TeamCity server+agent run as `tcuser` (uid 1000)
  and SonarQube as uid 1000; the bind dirs (`data`, `logs`, `agent-conf`,
  `sonar-*`) must be owned by 1000 or the containers crash-loop with
  `Permission denied` / can't write their datadir. The deploy workflow
  `chown -R 1000:1000`s them before `up`. If you brought the stack up by hand:
  `sudo chown -R 1000:1000 data logs agent-conf sonar-data sonar-extensions sonar-logs && docker compose up -d`.
- **DooD = root on the host daemon.** The agent can see/affect the prod
  TapeNetwork containers. Acceptable for a single experiment box; know it.
- **Resource pressure.** Server (~2 GB) + agent + your Gradle/Node/Docker builds
  compete with the live stack on the same `c2d-standard-4`. Don't run **Build**
  and **Perf x4** at the same time as a real load.
- **SonarQube is heavy.** It runs an embedded Elasticsearch → needs the host
  sysctl `vm.max_map_count=262144` (the deploy workflow sets it) and ~1.5 GB
  even with the trimmed heaps in the compose. On top of the prod stack + TeamCity
  this box is now genuinely tight — expect swapping if everything runs at once.
  If Sonar won't start, check `docker compose logs sonarqube` for the
  `max virtual memory areas` / `bootstrap checks failed` ES error.
- **DSL version must match the server.** `version` in `settings.kts`, the
  `<version>` in `pom.xml`, and the `jetbrains/teamcity-server` image tag in
  `docker-compose.yml` are all `2025.03` — bump them together if you change the
  image.
- **Perf x4 measures the deployed stack**, so it reflects whatever is currently
  running there — not the checked-out branch. That's the point of "against the
  already-deployed stack"; to test a branch's perf, deploy it first.
