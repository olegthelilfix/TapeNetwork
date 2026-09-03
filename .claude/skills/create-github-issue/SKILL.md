---
name: create-github-issue
description: >-
  Create a well-structured GitHub issue for this repo (olegthelilfix/TapeNetwork)
  in a "What / Why / Acceptance Criteria / QA Validation" format, then add it to
  the TapeNetwork Kanban board with Status = Backlog. Use when the user wants to
  file a new task, ticket, issue, or bug, or says things like "create a task",
  "open an issue", "add a ticket", "put this on the board".
---

# Create GitHub Issue

Turn a request into a clear GitHub issue and place it on the TapeNetwork Kanban
board in **Backlog**. The whole issue body is written in **English**, regardless
of the language the user uses to ask.

## When to use

The user wants to file a new task / ticket / issue / bug for the project — e.g.
"create a task for X", "open an issue about Y", "put this on the board".

## Golden rule: ask before you create

**Never create the issue until you can fill every required section confidently.**
Infer as much as you can from the user's request, then ask about the genuine gaps
only — do not interrogate the user about things they already told you. Typical
gaps to resolve first:

- **Scope / What** — what exactly changes; which module (`backend/`, `web/`,
  `cms/`, `tasks/`)? Is it a feature, bug, or chore?
- **Why** — the user value or problem behind it. If missing, ask.
- **Acceptance Criteria** — the concrete, checkable conditions for "done". If the
  user only gave a vague goal, propose criteria and confirm them.
- **QA Validation** — the exact steps QA follows to verify it, including expected
  results and any test data / preconditions.
- **Title** — propose a concise, imperative title (e.g. "Add RSS feed to Shows
  page") and confirm.

Then show the drafted issue body and get a clear **yes** before creating it. Do
not create anything on a maybe.

## Required issue body format

Write the body in English using exactly these sections (GitHub-flavored
markdown):

```markdown
## What
<One or two sentences: what will be built/changed. Concrete and scoped.>

## Why
<The user value or the problem this solves. The motivation, not the mechanics.>

## Acceptance Criteria
- [ ] <Checkable condition 1 — behavior, not implementation>
- [ ] <Checkable condition 2>
- [ ] <...>

## QA Validation
<Step-by-step instructions for QA to verify the task is complete.>

**Preconditions:** <env / seed data / login, e.g. CMS admin@tape.local / password>

**Steps:**
1. <Action>
2. <Action>

**Expected result:** <What QA should observe if the task passes.>
```

Guidance:
- Acceptance Criteria describe *observable behavior and done-ness*, not code
  internals. Keep each one independently checkable.
- QA Validation must be reproducible by someone who did not write the code:
  concrete steps, concrete expected output. Reference the stack's known entry
  points where relevant (web `:3000`, cms `:5173`, backend `:8080` Swagger at
  `/swagger-ui.html`, dev CMS login `admin@tape.local` / `password`).

## Steps

1. **Gather & confirm.** Apply the Golden Rule above. Draft the title and the
   full body, show them to the user, get explicit approval.

2. **Create the issue** in this repo:
   ```bash
   gh issue create \
     --repo olegthelilfix/TapeNetwork \
     --title "<title>" \
     --body-file <path-to-drafted-body.md>
   ```
   Prefer `--body-file` (write the drafted body to a temp file in the scratchpad)
   so multi-line markdown survives intact. Add `--label` only if the user asked
   for a specific label. Capture the printed issue URL.

3. **Add to the Kanban board with Status = Backlog** using the helper:
   ```bash
   .claude/skills/create-github-issue/scripts/add-to-board.sh <issue-url>
   ```
   The script discovers the "TapeNetwork Kanban" Project (v2), adds the issue,
   and sets the single-select **Status** field to **Backlog**. Read its output —
   it prints what it did or a clear reason it could not.

4. **Report back** to the user with the issue URL, and confirm it landed on the
   board in Backlog (or relay the script's error).

## Prerequisites & gotchas

- **Project scope.** Adding to the board needs the `project` scope on the `gh`
  token. If the script fails with a scopes error, tell the user to run:
  ```bash
  gh auth refresh -s project,read:project
  ```
  and then re-run step 3. Do not silently skip the board step — the issue exists
  but is not on the board yet, so surface that clearly.
- **Board / status names may differ.** The helper matches the project by title
  substring "Kanban" and the status option by name "Backlog" (case-insensitive).
  If it reports it could not find them, list what exists
  (`gh project list --owner olegthelilfix`,
  `gh project field-list <n> --owner olegthelilfix`) and ask the user which to use.
- **Owner is `olegthelilfix`.** This repo's remote is
  `git@github.com:olegthelilfix/TapeNetwork.git`. The board is owned by the same
  user account.
- Do not commit the temp body file; write it in the session scratchpad.
