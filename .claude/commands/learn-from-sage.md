# Learn from Review — detection-gap analysis

Analyze the fix/change specified in $ARGUMENTS (a PR number, commit, or branch) to find what a code reviewer should have caught but missed.

Learning is **not** summarizing what was found. It is finding issues that **leaked past review and shipped**, then working backwards to close the gap.

## Procedure

1. **Identify the fix** — read the change. Confirm it fixes a bug, reverts a mistake, or closes an incident.

2. **Trace to the introducing change** — use `git log --follow` / `git blame` on the fixed lines to find the commit that introduced the defect.

3. **Miss analysis** — would any of these 9 review dimensions have caught the introducing change?
   - Correctness & regression
   - Security
   - Test adequacy
   - Resource / memory
   - Scope & description fidelity
   - Cross-change conflict
   - Design comparison
   - Maintainability & style
   - Observability

4. **Identify the gap** — which dimension was blind, and what specific check would have caught this *class* of defect?

5. **Generalize** — write the lesson as high-level guidance (1-2 sentences) a reviewer can apply to future, unrelated changes:
   - No code snippets, no function/variable names, no specific CR numbers
   - Must describe a defect *class*, not this one bug
   - If it only restates this specific bug, lift to the class or drop it

## Output

For each learning:

```
### {title}
<!-- dimension: {which of the 9} -->
<!-- impact: {low/medium/high} -->

{1-2 sentence guidance — the durable review heuristic}
```

Prefer fewer, broader rules over many narrow ones. If the fix is trivial (a typo, a lint nit), there is nothing to learn — say so and stop.

All output in **Russian**.
