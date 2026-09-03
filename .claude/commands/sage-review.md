# Code Review — deep single-pass review

Review the PR/change specified in $ARGUMENTS (a PR number, URL, or branch name). Produce a thorough single-pass review covering design + 9 code dimensions.

## Core principle — Chain of Consequences

Every finding MUST trace to downstream impact: *cause → mechanism → user/system consequence.* If you cannot complete the chain to real harm, drop the finding.

## Design dimension — Problem Worth Solving & Solution Fit

Answer each with a consequence chain:
- **What is the problem?** One sentence, user's/system's perspective.
- **Does it matter?** Who is hurt, how often, how badly?
- **Is this the optimal fix?** Simpler, more general, lower-risk alternative?
- **Blast radius?** Sensitive paths, fan-out, guard removals.
- **Root cause vs symptom?** Does it fix the actual cause?

Verdict: PASS / CONCERNS / BLOCK. Reserve BLOCK for genuine design defects only.

## The 9 code dimensions

Review every changed hunk against ALL dimensions:

1. **Correctness & regression** — logic errors, edge cases, null handling, off-by-one, API backward compat, error-handling completeness
2. **Security** — explicit threat chain: *attacker input → trust boundary → exploit → impact*. Secrets, injection, auth, SSRF, XSS
3. **Test adequacy** — do tests cover new/changed paths, error paths, boundaries?
4. **Resource / memory** — unbounded growth, N+1, missing eviction, leaked handles
5. **Scope & description fidelity** — scope creep, description accuracy vs actual diff
6. **Cross-change conflict** — overlapping open changes, merge-order risk
7. **Design comparison** — consistency with existing patterns, reinvented helpers
8. **Maintainability & style** — naming, dead code, broad catches, magic constants
9. **Observability** — can an operator diagnose failures? Silent failure paths?

## Self-critique (before emitting findings)

1. **Filter** — kill findings with no consequence chain to real harm
2. **De-duplicate** — merge same root issue across dimensions, keep strongest chain
3. **Sharpen** — strengthen consequence chains, assign severity

## Severity

- **🔴 must-fix** — breaks now OR high-probability latent defect. Ship decision keys on this ONLY.
- **🟡 should-fix** — real issue but not blocking. Does NOT affect ship decision.
- Nice-to-have → dropped, never emitted.

## Output format

For each finding:
```
{severity} [{dimension}] {file}:{line}

{observation with consequence chain}

> {quoted offending code}

**Suggestion:** {concrete fix}
```

End with a ship summary: one line giving the reason for the verdict.

All output in **Russian** (the user's preferred language).
