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
