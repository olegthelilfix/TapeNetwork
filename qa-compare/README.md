# QA tooling spike: Playwright vs Robot Framework

Two throwaway scaffolds running the **same** smoke scenario against the public site, so you
compare the *tooling*, not the test.

Scenario (identical in both):
1. open `/`
2. page title contains `Tape`
3. click the `Shows` nav link (`a[href="/shows"]`)
4. land on `/shows` with an `<h1>Shows</h1>`

Both target `http://localhost:3000` — start the site first (`docker compose up --build` from the
repo root, or the web dev server). Override with the `BASE_URL` env var.

## Playwright (TypeScript — matches the repo language)

```bash
cd qa-compare/playwright
npm install
npx playwright install chromium   # one-time browser download
npm test                          # runs tests/smoke.spec.ts
npm run report                    # open the HTML report
npm run codegen                   # record clicks -> generated TS (try this!)
```

## Robot Framework (Python + keyword DSL)

```bash
cd qa-compare/robot
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
rfbrowser init                    # one-time: Browser lib pulls its own Playwright + chromium
robot smoke.robot                 # runs the suite, writes log.html / report.html
```

> Note: `robotframework-browser`'s `Browser` library is Playwright under the hood — with Robot you
> still ship Playwright, plus a Python runtime and the keyword DSL on top.

### Player e2e (issue #19)

`tests/e2e/player.robot` exercises the real `/watch` video player: a video with an
available stream plays and its controls (play/pause, mute, seek) work; a video with
no stream shows a "can't be played right now" message on play.

Preconditions: the full stack up (`docker compose up --build` from the repo root — the
seeded episode `semis-earnings-…` points at the bundled `tape-streamer`, which serves
HLS with CORS for `localhost:3000`) and a video prepared in the streamer.

Real HLS is **H.264**, which Playwright's bundled Chromium cannot decode — so the
playback tests drive the **system Chrome** channel by default:

```bash
robot -v BROWSER_CHANNEL:chrome tests/e2e/player.robot     # real decoded playback
```

Use `-v BROWSER_CHANNEL:msedge` for Edge, or `-v BROWSER_CHANNEL:` (empty) for bundled
Chromium — then only the DOM/fallback tests are meaningful, as playback can't decode.

## What to compare hands-on

| | Playwright | Robot Framework |
|---|---|---|
| Test source | `tests/smoke.spec.ts` (TS, same as the app) | `smoke.robot` (keyword DSL) |
| Setup | 1 npm dep + `playwright install` | Python venv + `pip` + `rfbrowser init` |
| Record a test | `npm run codegen` -> real TS | no first-party recorder |
| AI generation | official `@playwright/mcp`, this dashboard drives it natively | AI must know the keyword DSL |
| Debug | `--debug`, trace viewer, `--ui` | `log.html` step log |
| Reports | HTML reporter + trace | strong built-in `log.html` / `report.html` |
| Engine | Playwright | Playwright (wrapped) |

Open both test files side by side and skim the DX — that is the real decision.

## See exactly what the browser did

**Playwright** (this scaffold has `trace: "on"`, so every run is replayable):
- `npm run report` — HTML report; each test has a **Trace** you scrub step by step, with a
  before/after DOM snapshot, screenshot, network and console for every action.
- `npm run test:ui` — **UI mode**: interactive time-travel runner, watch each step, pick locators.
- `npm run test:headed` — watch it run live in a real browser window.
- `npx playwright test --debug` — Inspector, step through action by action.
- `npm run codegen` — the inverse: click around and it writes the TS for you.

**Robot Framework**:
- `log.html` (written every run) — step-by-step keyword log with screenshots embedded.
- Same Playwright engine underneath, so a full trace/video is available via `New Context` options
  (`tracing=`, `recordVideo`); open the saved trace with `playwright show-trace <file>`.
- No first-party UI mode / interactive time-travel runner.

## CI (GitHub Actions)

`.github/workflows/qa-e2e.yml` runs both suites against a deployed URL and uploads each report
as a downloadable artifact.

- Trigger: **Actions → QA E2E → Run workflow** (set `base_url`), or automatically on any push
  touching `qa-compare/**`. Tests hit the deployed site directly — the stack is not booted in CI.
- Download: open the run → **Artifacts** → `playwright-report` / `robot-report` (zip).
- View locally:
  - Playwright: unzip, then `npx playwright show-report <unzipped-folder>` (or just open `index.html`).
  - Robot: unzip and open `log.html` / `report.html` in a browser.
- Reports upload even when tests fail (`if: always()`), so you always get the trace/log to debug.

## API testing (no browser)

Both tools also test the HTTP API directly — auth, status codes, JSON assertions. The included
example logs into the **private** API, creates a `ticker`, then asserts it shows up in **both** the
private (`/api/admin/ticker/{id}`) and public (`/api/v1/ticker`) API, and deletes it afterwards.

These hit the **backend** (default `http://localhost:8080`), not the UI host — set `API_URL`
separately. Admin creds default to the dev pair; override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

```bash
# Playwright — tests/api.spec.ts (auto-skips unless API_URL is set)
cd qa-compare/playwright
API_URL=http://localhost:8080 npm test

# Robot — api.robot (run the file explicitly)
cd qa-compare/robot
robot -v API_URL:http://localhost:8080 api.robot
```

> Playwright uses its `request` context (`request.newContext`); Robot uses `RequestsLibrary`.
> The API test also proves cache eviction: the created ticker appears in the cached public endpoint
> immediately because the admin write evicts the cache.
>
> Not wired into CI on purpose — it creates and deletes real rows, so run it against a disposable
> environment. To add a CI job, pass `API_URL` + admin creds as secrets.
