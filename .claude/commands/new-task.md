# New Task — bootstrap a branch from a GitHub issue

You are starting a new task in TapeNetwork. The user provides an issue number, URL, or ticket ID as $ARGUMENTS.

## Step 1 — Verify clean git state

Run these checks:

```
git status --porcelain
git log @{u}.. --oneline 2>/dev/null
```

**If uncommitted changes exist** (staged, unstaged, or untracked):
→ Tell the user exactly what is dirty. Ask them to commit, stash, or discard, then re-run `/project:new-task`. **Stop here.**

**If unpushed commits exist** (`git log @{u}..` has output):
→ Tell the user they have N unpushed commits. Ask them to push first, then re-run. **Stop here.**

If clean, continue.

## Step 2 — Switch to main and pull

```bash
git checkout main && git pull --ff-only origin main
```

If pull fails, report the error and stop.

## Step 3 — Fetch the issue

```bash
gh issue view <number> --json title,body,labels,assignees,comments
```

Parse the JSON. If `gh` fails, tell the user to run `gh auth login` and stop.

## Step 4 — Create the branch

Branch name format: `<type>/TP-<number>-<slugified-title>`

- **Type**: `feature/` by default. Use `bugfix/` if the user said "bugfix", "fix", or if a label contains "bug".
- **Ticket ID**: `TP-<issue-number>` (TapeNetwork prefix).
- **Description**: slugify the issue title — lowercase, spaces→hyphens, drop non-alphanumeric, max 50 chars.

Example: `feature/TP-42-add-user-avatar-upload`

```bash
git checkout -b <branch-name>
```

## Step 5 — Analyze and present

Present in English:

1. **Issue title and number** as header
2. **Full description** — formatted for readability
3. **Labels and assignees** if any
4. **Key comments** — summarize important ones

Then analyze with project context:
- What needs to be done (the requirement)
- Which files/areas are affected — check across all modules:
  - `backend/` — Spring Boot (Java 21, Maven)
  - `web/` — Next.js 15, React 18, TypeScript
  - `cms/` — Refine CMS
  - `tasks/` — if a matching task file exists, mention it
- Ambiguities, missing acceptance criteria, open questions

## Step 6 — Questions or plan

**If unclear:** list specific questions, ask user to clarify.

**If clear:** propose an implementation plan:
- Files to create/modify
- High-level approach for each change
- Testing strategy (Vitest for web, JUnit for backend)
- Dependencies or risks

Respect `.kiro/steering/ai-commit-policy.md` — commit with AI trailers after changes.

All user-facing output in **English**.
