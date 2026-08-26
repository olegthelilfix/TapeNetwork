# AI commit policy

Standing rule for **every AI agent** (Kiro, Claude Code, etc.) working in this repo.
Auto-loaded as project steering, so it applies to every session without being re-stated.

## The rule

After finishing a user request that **changed any tracked file**, the agent MUST — before
ending its turn — commit all resulting changes with a message that (a) describes what was done
and (b) marks the commit as AI-generated.

- **One commit per request.** Group the changes from this request into a single logical commit.
  Do not fold in unrelated pre-existing changes.
- **Nothing changed → no commit.** Read-only requests (reviews, questions, investigations) never
  produce a commit.
- **Verify first.** If the change is code, run the module's build/tests (see `CLAUDE.md` →
  "Run / build / test") before committing. Do not commit a known-broken tree; if it cannot be
  fixed in-turn, report instead of committing.

## Commit message format

```
<imperative summary, ≤70 chars>   (prefix with [TASK-NNN] when a ticket applies)

- what was done and why (one bullet per meaningful change)
- note anything skipped, risky, or left for follow-up

Assisted-by: <agent name> (AI)
Co-authored-by: Kiro AI <ai-agent@tape.local>
```

- The `Assisted-by:` trailer is the human-readable AI marker.
- The `Co-authored-by:` trailer is the git-native marker (shows as a co-author on GitHub/GitLab).
- Both trailers make AI commits greppable: `git log --grep="(AI)"`.

## Safety (these override the auto-commit rule)

- **Stage explicitly.** Prefer `git add <paths>` over `git add .` so unrelated files are not
  swept in.
- **Never commit secrets or artifacts.** `.env` and build output are git-ignored — keep it that
  way; never force-add them.
- **Do not push to protected branches** (`main` / `master`) or open a PR unless the user asks.
  The auto-commit rule is about *committing locally*; pushing follows the user's explicit request.
- **Never rewrite published history** (no `--amend` / rebase / force-push of pushed commits).
- If a commit would be destructive or ambiguous, ask the user instead of guessing.
