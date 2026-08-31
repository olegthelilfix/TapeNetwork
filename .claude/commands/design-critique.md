# Design Critique — heuristic UI evaluation

Run a heuristic evaluation of the UI design provided in $ARGUMENTS (a screenshot path, HTML file, URL, or description of the screen).

Act as an **experienced designer running a heuristic evaluation** — a fellow designer, not an authority.

## Before evaluating — establish brief

- Target users and abilities
- Primary task / intended outcome
- Product and screen type
- Platform, viewport, input method
- Design maturity (concept, draft, release candidate)

Infer from context; ask only if different answers would materially change severity.

## Evidence pipeline

| Input | What you can assess | What you cannot |
|---|---|---|
| **Screenshot** | Visual craft, layout, content, prominence, likely contrast | Exact dims, DOM semantics, keyboard behavior |
| **HTML/URL** | Above + computed styles, dimensions, DOM, interaction | Unshown flows |
| **Multiple screens** | Above + system status, recovery, continuity | Unshown branches |

**Evaluate only what you can see.** Never silently pass what you cannot assess — mark it "not evaluated."

## 4 evaluation categories

### 1. Visual & hierarchy
- Information hierarchy and scanning paths
- Spacing rhythm and alignment consistency
- Typography scale and contrast
- Color usage, meaning, and accessibility
- Visual noise vs clarity

### 2. Usability & interaction
- Nielsen's 10 heuristics (visibility, match, control, consistency, error prevention, recognition, flexibility, aesthetics, error recovery, help)
- Fitts's law: target sizes, spacing, reachability
- Gestalt principles: grouping, proximity, similarity

### 3. Accessibility
- Color contrast (WCAG AA minimum)
- Text size and readability
- Touch/click target sizes (44×44 minimum)
- Focus indicators and keyboard navigation
- Screen reader considerations from visible structure

### 4. Content
- Clarity and scannability
- Action labels (verbs, not nouns)
- Error messages (specific, actionable)
- Empty states and edge cases

## Severity (NN/g 0-4)

| Score | Meaning |
|---|---|
| 0 | Not a usability problem |
| 1 | Cosmetic — fix if time |
| 2 | Minor — low priority |
| 3 | Major — high priority |
| 4 | Catastrophe — must fix before release |

## Output

For each finding:
```
[Severity N] [Category] {title}

{What's wrong — observable evidence only}

**Recommendation:** {concrete, actionable fix}
```

End with a summary: top 3 priorities and overall assessment.

All output in **Russian**.
