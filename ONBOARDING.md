# Tape Network — Developer Onboarding

A step-by-step playbook to get the full stack running locally and to connect the
GitHub MCP server to the private repo. Works on **macOS** and **Windows**.

> In Claude Code, every ```bash``` / ```powershell``` block below has a **Run**
> button — you can execute each step by clicking it instead of copy-pasting.
> Read what a step does before running it; a few steps you must edit first
> (they contain a `REPLACE_ME` placeholder).

---

## What you need (versions are pinned to what the project actually builds with)

| Tool | Version | Why |
|---|---|---|
| **Git** | any recent | clone the repo |
| **Node.js** | **20 LTS** | `web/` (Next.js 15) + `cms/` (Vite 5) build on `node:20` |
| **JDK** | **21** (Azul Zulu) | `backend/` is Java 21 / Spring Boot 3, built with **Gradle** |
| **Podman** | recent | run the whole stack; Postgres comes from a container |

`backend/` builds with the committed Gradle wrapper (`./gradlew`) — you do **not**
need a separate Gradle install. You do **not** need to install Postgres either —
it runs as a container via compose. Local Node/JDK are only needed for
per-module development; the full `compose up` build uses containerized
toolchains.

**JDK 21** is installed by downloading it from Azul (same for macOS and Windows):
👉 https://www.azul.com/downloads/?version=java-21-lts&package=jdk — pick the
installer for your OS/arch and run it, then reopen your terminal.

> ⚠️ **Multiple JDKs installed?** The Gradle wrapper needs to *run* under JDK 21
> too (not just build the project as its target) — Gradle 8.14's embedded
> Kotlin script compiler (used to parse `build.gradle.kts`) fails on newer JDKs
> with a cryptic `IllegalArgumentException: 25`-style error if your default
> `java` is, say, JDK 25. If that happens, point `JAVA_HOME` at your JDK 21 for
> just that command instead of changing your global default:
> - macOS: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew build`
> - Windows (PowerShell): `$env:JAVA_HOME="C:\Program Files\Zulu\zulu-21"; .\gradlew.bat build`
>   (adjust the path to wherever the Azul installer put it)

---

## macOS

### 1. Install Homebrew (skip if you already have `brew`)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Git and Podman

```bash
brew install git
```

```bash
brew install podman
```

> JDK 21 is **not** installed here — grab it from Azul (link in the table above).

### 3. Set up nvm and switch to Node 20

Safe to run any number of times — it installs only what's missing, wires nvm
into `~/.zshrc` once, then switches to Node 20:

```bash
brew list nvm >/dev/null 2>&1 || brew install nvm
export NVM_DIR="$HOME/.nvm" && mkdir -p "$NVM_DIR"
grep -q 'NVM_DIR' ~/.zshrc || { echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc && echo "[ -s \"$(brew --prefix nvm)/nvm.sh\" ] && . \"$(brew --prefix nvm)/nvm.sh\"" >> ~/.zshrc; }
. "$(brew --prefix nvm)/nvm.sh"
nvm ls 20 >/dev/null 2>&1 || nvm install 20
nvm use 20 && nvm alias default 20
```

### 4. Initialize Podman (first time only)

```bash
podman machine init && podman machine start
```

### 5. Verify

```bash
git --version && node -v && java -version && podman --version
```

Expected: node **v20.x**, `openjdk version "21"`.

➡️ Now jump to [Get the code & run](#get-the-code--run).

---

## Windows

Run these in an **Administrator PowerShell**. They use `winget` (built into
Windows 10/11).

### 1. Install Git

```powershell
winget install --id Git.Git -e
```

> JDK 21 is **not** installed here — download it from Azul (link in the table
> above) and run the `.msi`. Gradle is **not** installed here either — the
> committed `backend/gradlew.bat` wrapper handles it.

### 2. Set up nvm and switch to Node 20

Node is managed by **nvm-windows**. Run this block in an **Administrator**
PowerShell — it installs only what's missing, then switches to Node 20. On the
very first run it installs nvm and tells you to reopen the shell; run it again
after reopening.

```powershell
if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
  winget install --id CoreyButler.NVMforWindows -e
  Write-Host "nvm installed. CLOSE and reopen PowerShell (as Administrator), then run this block again." -ForegroundColor Yellow
} else {
  if (-not (nvm list | Select-String '20\.')) { nvm install 20 }
  nvm use 20
  node -v
}
```

### 3. Install Podman

```powershell
winget install --id RedHat.Podman-Desktop -e
```

### 4. Verify

Open a **fresh** PowerShell so PATH updates apply, then:

```powershell
git --version ; node -v ; java -version ; podman --version
```

Expected: node **v20.x**, `openjdk version "21"`.

➡️ Continue to [Get the code & run](#get-the-code--run).

---

## Get the code & run

### 1. Create your local env file

```bash
cp .env.example .env
```

### 2. Bring up the whole stack

```bash
podman compose up --build
```

Services:

| App | URL |
|---|---|
| Public web (Next.js) | http://localhost:3000 |
| CMS (Refine/Vite) | http://localhost:5173 |
| Backend API (Spring) | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Postgres | localhost:5432 |

Dev CMS login: `admin@tape.local` / `password`.

### 3. Per-module dev (optional)

```bash
cd backend && ./gradlew build
```

> Getting `IllegalArgumentException: 25` (or similar) from Gradle? See the JDK
> 21 warning in the [prerequisites table](#what-you-need-versions-are-pinned-to-what-the-project-actually-builds-with) above —
> pin `JAVA_HOME` to JDK 21 for the command instead of your global default.

```bash
cd web && npm ci && npm test && npm run build
```

```bash
cd cms && npm ci && npm run build
```

---

## ✅ Verify my setup

Run the one-shot check for your OS. It prints `OK` / `MISSING` / `WRONG VERSION`
for every requirement so you can see at a glance what's left to fix.

**macOS / zsh:**

```bash
bash -c '
ok(){ printf "  \033[32mOK\033[0m       %s\n" "$1"; }
bad(){ printf "  \033[31mFAIL\033[0m     %s\n" "$1"; }
echo "Tape Network — environment check"; echo
command -v git >/dev/null   && ok "git: $(git --version | cut -d" " -f3)" || bad "git missing"
node -v 2>/dev/null | grep -q "^v20\." && ok "node $(node -v)" || bad "node 20.x required (got $(node -v 2>/dev/null || echo none))"
java -version 2>&1 | grep -q "version \"21" && ok "jdk 21" || bad "jdk 21 required (got $(java -version 2>&1 | head -1)) — run backend/gradlew with JAVA_HOME pinned to 21 if this is not your default"
command -v podman >/dev/null && ok "podman: $(podman --version | cut -d" " -f3)" || bad "podman missing"
[ -n "$GITHUB_PAT" ] && ok "GITHUB_PAT is set" || bad "GITHUB_PAT not set (needed for GitHub MCP)"
'
```

**Windows / PowerShell:**

```powershell
Write-Host "Tape Network - environment check`n"
function Ok($m){ Write-Host "  OK       $m" -ForegroundColor Green }
function Bad($m){ Write-Host "  FAIL     $m" -ForegroundColor Red }
if (Get-Command git -ErrorAction SilentlyContinue) { Ok "git: $((git --version).Split(' ')[2])" } else { Bad "git missing" }
if ((node -v 2>$null) -match '^v20\.') { Ok "node $(node -v)" } else { Bad "node 20.x required (got $(node -v 2>$null))" }
if ((java -version 2>&1) -match 'version "21') { Ok "jdk 21" } else { Bad "jdk 21 required" }
if (Get-Command podman -ErrorAction SilentlyContinue) { Ok "podman present" } else { Bad "podman missing" }
if ($env:GITHUB_PAT) { Ok "GITHUB_PAT is set" } else { Bad "GITHUB_PAT not set (needed for GitHub MCP)" }
```

All green? You're ready — [run the stack](#get-the-code--run). Any red line
points back to the matching install step above.

---

## Connect the GitHub MCP server (private repo)

The repo's `.mcp.json` already declares a `github` MCP server that reads your
token from the `GITHUB_PAT` environment variable. You just need to create a
token and export it. **Copilot is not required** — the GitHub MCP server is free
for any GitHub account.

### 1. Create a fine-grained Personal Access Token

1. Open **https://github.com/settings/personal-access-tokens/new**
2. **Token name**: e.g. `tape-network-mcp`
3. **Resource owner**: your account / the org that owns the repo
4. **Repository access** → **Only select repositories** → pick the Tape Network repo
5. **Repository permissions** (read + write):
   - **Contents** → Read and write
   - **Issues** → Read and write
   - **Pull requests** → Read and write
   - **Metadata** → Read-only (auto-selected)
6. **Generate token** and copy the `github_pat_…` value (shown only once).

> Prefer least privilege? Set the three permissions to **Read-only** for a
> read-only MCP instead.

### 2. Give the token to Claude Code

`.mcp.json` reads the token from the `GITHUB_PAT` environment variable — pick the
method that matches how you launch Claude Code.
**⚠️ Never put the token in a committed file** (`.mcp.json` is committed;
`.claude/settings.local.json` is git-ignored).

**A) Claude Code desktop app / IDE (recommended for most)** — GUI apps do **not**
read `~/.zshrc`, so use the git-ignored local settings file. Copy the template
and fill in your token:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

Then edit `.claude/settings.local.json` and replace `github_pat_REPLACE_ME` with
your token. It already sets both `enabledMcpjsonServers` (approves the server)
and `env.GITHUB_PAT`.

**B) Claude Code from a terminal (macOS / zsh):**

```bash
echo 'export GITHUB_PAT="github_pat_REPLACE_ME"' >> ~/.zshrc && source ~/.zshrc
```

**B) Claude Code from a terminal (Windows / PowerShell)** — reopen the terminal after:

```powershell
setx GITHUB_PAT "github_pat_REPLACE_ME"
```

### 3. Restart Claude Code

The token and `.mcp.json` are read at **process start** — fully quit and reopen
Claude Code (terminal users: relaunch from the shell where `GITHUB_PAT` is set).
On first launch you'll be asked to approve the project `github` MCP server (the
desktop template in step 2A pre-approves it). Then confirm:

```bash
claude mcp list
```

You should see `github: … ✔ Connected`.

---

## Troubleshooting

- **`node -v` shows the wrong version** — run `nvm use 20` in a fresh terminal
  (macOS: make sure the nvm lines are in `~/.zshrc`; Windows: use an
  Administrator shell).
- **`podman compose` not found** — install the compose provider
  (`pip install podman-compose`, or `brew install podman-compose` on macOS).
- **Ports already in use** (3000/5173/8080/5432) — stop the conflicting process
  or change the mapping in the compose file.
- **`GITHUB_PAT` not picked up** — env vars are read at process start, so fully
  restart Claude Code. Desktop app / IDE users: it will **never** see `~/.zshrc`
  — use `.claude/settings.local.json` (method 2A) instead.
- **MCP `github` shows failed/unauthorized** — the token expired or lacks the
  repo/permissions above; regenerate and re-export.

---

_Toolchain versions are derived from the repo's Dockerfiles and
`backend/build.gradle.kts`. If those change, update this guide (and the
version table)._
