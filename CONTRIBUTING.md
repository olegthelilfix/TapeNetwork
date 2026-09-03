# Contributing

Lightweight git conventions for this repo — for humans and AI agents alike. These cover
**how** to branch and format commits; they do **not** dictate whether or how often you commit.

## Work on a ticket branch (not master/main)

Don't work on `master`/`main` by default. Start a task by proposing (and creating, or asking
the user to create) a branch that names its ticket:

```
<type>/<TICKET-ID>-<short-slug>
```

- `type` ∈ `feature` | `bugfix` | `chore`  (use `bugfix` for fixes)
- e.g. `feature/TASK-0020-split-openapi`, `bugfix/TP-14-mobile-nav`

## Commit messages

Start the subject with a **bracketed ticket id** so IntelliJ issue-navigation links it:

```
[<TICKET-ID>] <imperative summary>
```

- e.g. `[TASK-0020] split OpenAPI definitions`, `[10] migrate backend to Gradle`
- The ticket number is the GitHub issue number; `TASK-`/`TP-` prefixes are also accepted.
- Enforced by the `commit-msg` hook in `.githooks/` (merge/revert commits are exempt).
  Enable it once per clone:

  ```bash
  git config core.hooksPath .githooks
  ```
