---
name: plain-writing
description: >-
  Write or edit prose for this repo — commit messages, PR/issue descriptions,
  code comments, docs, READMEs, CLAUDE.md-style guidance — using Simplified
  Technical English (ASD-STE100) sentence discipline combined with the
  installed humanizer skill's natural-voice rules. Use whenever the task is
  to write, edit, or review prose in this repo, or when asked to make
  writing "plainer", "simpler", "less AI-sounding", or "clearer".
---

# Plain writing for TapeNetwork

Combine two style systems into one: **ASD-STE100** (Simplified Technical
English, a controlled-language standard from aerospace/defense maintenance
documentation) for sentence-level discipline, and the **humanizer** skill for
natural, non-AI-sounding voice. Applied together, not as alternatives.

## When to use

- Writing or editing commit messages, PR/issue descriptions, code comments,
  README sections, or CLAUDE.md-style docs in this repo.
- The user asks to make text "plainer," "simpler," "clearer," or "less
  AI-sounding."
- Reviewing someone else's (or your own) draft prose before it goes into the
  repo.

Does not apply to: user-facing marketing copy on `web/` (that can be more
expressive), legal text, or verbatim quotes/logs.

## Part 1 — Simplified Technical English (ASD-STE100)

ASD-STE100 is a real controlled-language standard published by ASD (the
AeroSpace and Defence Industries Association of Europe), used across
aircraft and defense maintenance documentation. It began as AECMA Simplified
English in 1986 and is now on Issue 9 (January 2025): about 53 writing rules
in 9 sections, plus a controlled dictionary of roughly 900 approved general
words. It has been free to download from asd-ste100.org since Issue 6
(2013) — it is not paywalled today, though the numbers below come from
public secondary sources (Wikipedia, technical-writing consultancies,
third-party paraphrases), not a page-by-page read of the licensed text, so
treat exact figures as "reported," not verbatim quotes of the standard.

Adapted for software writing (not aircraft manuals), the rules that transfer
directly:

1. **One idea per sentence.** Especially for instructions ("run the
   migration, then restart the service" → two sentences, or a numbered
   list). STE caps procedural sentences at roughly 20 words and descriptive
   sentences at roughly 25 words — treat these as soft ceilings for repo
   prose, not hard cutoffs.
2. **Active voice, and say who or what acts.** STE requires active voice for
   instructions ("Run `./gradlew test`," not "Tests should be run").
   Passive is acceptable in descriptive text only when the actor is
   genuinely unknown or irrelevant ("The table is seeded by Flyway" is fine
   because Flyway *is* named; "the config is validated" without saying by
   what is not).
3. **Simple, real verb tenses.** Prefer imperative (commit messages: "Fix
   the null check," not "Fixed the null check" or "Fixing the null check"),
   simple present for current behavior ("`MediaResolver` returns a relative
   path"), simple past for what changed. STE disallows present/past perfect
   ("has been changed") — use simple tense instead ("changed").
4. **One term per concept, used consistently.** STE's dictionary gives each
   approved word exactly one meaning and one part of speech (e.g. "oil" is
   a noun only). In this repo: don't alternate between "endpoint," "route,"
   and "API" for the same thing in one doc; don't let a noun and a verb use
   of the same word blur ("filter" the noun vs. "filter" the verb — fine if
   the reader can't confuse them, not fine if it reads ambiguously).
5. **Short noun clusters.** STE caps noun clusters at three words
   ("aircraft ground power unit control panel" is exactly the kind of
   pile-up it forbids). Same fix here: `AdminFooController` is a stable
   identifier and stays as-is, but don't write prose like "the show episode
   video media resolver logic" — break it up: "the logic that resolves
   media for a video on an episode."
6. **Technical names and nomenclature are exempt from the general
   dictionary.** STE explicitly allows domain/company-specific technical
   nouns and verbs (part names, tool names) even when they aren't in the
   ~900-word general list, as long as they come from the project's own
   official terms. Here: class names, endpoint paths, Gradle tasks, env var
   names, and terms already fixed by `CLAUDE.md` (`orm`, `model`, `api`,
   `service`, `application`, `DtoV1`, `MapStruct`) are exempt from the
   "plain word" rules — write them exactly as they appear in code, don't
   paraphrase them into plain English.
7. **No stacked qualifiers or hedged instructions.** An instruction is a
   command, not a suggestion with escape hatches ("You might want to
   consider possibly running the migration" → "Run the migration").

STE numeric limits (20/25 words, 3-word noun clusters) are reported
consistently across independent sources but are not something this skill
can quote verbatim from the licensed standard — apply them as a discipline,
not a lint rule with a hard word-counter.

## Part 2 — Humanizer (condensed)

The full pattern list (35 numbered AI-writing tells with before/after
examples) lives at `~/.agents/skills/humanizer/SKILL.md` — read it in full
before a heavier rewrite (blog-style docs, longer READMEs, PR descriptions
aimed at humans). For repo prose, the patterns that come up most:

- **No inflated claims or sales language.** Don't write "this represents a
  pivotal enhancement to the search architecture" — write what changed.
  (Patterns 1, 4.)
- **No unnamed authorities.** Don't write "this approach is generally
  considered best practice" — say why, or cite the actual constraint.
  (Pattern 5.)
- **Cut AI-tic filler words**: *leverage, robust, seamless, delve,
  streamline, comprehensive, crucial, ensure* used as a hedge. Say the
  concrete thing instead. (Pattern 7.)
- **Use "is/has," not "serves as/boasts."** "The mapper has three derived
  fields," not "The mapper boasts three derived fields." (Pattern 8.)
- **No forced rule-of-three lists** just to sound complete. Two items are
  fine; don't pad to three. (Pattern 10.)
- **No em dashes** in committed prose (commit messages, docs, comments) —
  use a period, comma, or parentheses instead. (Pattern 14.)
- **No bold-mini-heading list spam**, no title-case headings, no emoji
  decoration in commit messages or code comments. (Patterns 15–18.)
- **No chatbot leftovers**: "Let me know if you'd like me to expand this,"
  "I hope this helps," in a commit message or PR body. (Pattern 20.)
- **No fake candor or answered objections nobody raised** ("Honestly, this
  isn't really about performance, but..."). State the point. (Patterns
  33–34.)

Per the humanizer skill's own guidance: **keep reference, technical, and
factual text neutral.** Don't add personality, opinions, or first-person
color to a commit message, API doc, or code comment — that guidance is for
blog/essay prose, not this repo's technical writing. The goal here is
*natural*, not *chatty*.

## How the two systems interact

They mostly reinforce each other — both want active voice, one clear
subject per sentence, no filler, no padded qualifiers. Two places they can
pull in different directions, and how to resolve them here:

- **Terseness vs. natural rhythm.** STE pushes toward short, clipped,
  uniform sentences (it's designed for maintenance techs skimming under
  time pressure). Humanizer explicitly flags a *string* of short dramatic
  fragments as an AI tell (pattern 31) and prefers varied sentence length
  as a human trait. Resolution: keep STE's *one-idea-per-sentence* and
  *no-run-ons* discipline, but don't chop everything into a robotic staccato
  list — let sentence length vary naturally across a paragraph as long as
  no single sentence carries more than one instruction or idea.
- **"One term per concept" vs. "don't repeat the same word."** STE says use
  the same word for the same thing every time (a *show* is always a
  "show," never a "programme" or "series" mid-doc). Humanizer's synonym-
  cycling fix (pattern 11) is about not renaming the *same referent* with
  different words either, so these actually agree in practice — the
  tension is illusory. Where humanizer's "vary sentence openings" advice
  could tempt a rewrite into varying the *noun* instead of just the
  sentence structure, don't: fix the opening, keep the noun fixed.
- **STE's dictionary is a closed list; humanizer has no fixed vocabulary.**
  Don't try to literally restrict this repo's vocabulary to STE's ~900-word
  dictionary — that's built for physical maintenance procedures and has no
  entries for "endpoint," "migration," or "mapper." Take the *discipline*
  (one meaning, one part of speech, no synonym-swapping) and apply it to
  whatever software vocabulary the doc actually needs.

When in doubt: write the plain, active, one-idea sentence first (STE), then
read it aloud and remove anything that still sounds like a chatbot wrote it
(humanizer). Don't run the passes in the other order — starting from
"natural voice" and then trying to compress it tends to leave hedges and
run-ons that a plain first pass avoids from the start.

## Before / After

A clunky, AI-sounding draft of a commit-message-style PR paragraph:

> **Before:**
> This PR represents a significant enhancement to the media resolution
> pipeline, leveraging a more robust approach that has been carefully
> designed to ensure seamless handling of relative paths. Additionally, it
> is worth noting that the `MediaResolver` component — which plays a
> pivotal role in the broader media architecture — now boasts comprehensive
> support for uploaded and seeded assets alike, ensuring a consistent and
> reliable user experience going forward.

Applying STE first (one idea per sentence, active voice, simple tense, cut
the noun pile-up), then humanizer (cut inflated claims, filler words, the
em dash, "boasts"):

> **After:**
> `MediaResolver` now resolves both uploaded and seeded assets the same
> way. Before this change, it handled only uploaded paths; seeded assets
> (stored as relative `uploads/…` paths) fell through to a separate branch.
> This PR merges that branch into the same resolver method.

The after version is three short, varied sentences instead of two
overloaded ones, names the actual before/after behavior instead of
claiming importance, and drops "leveraging," "robust," "seamless,"
"pivotal," "boasts," "comprehensive," and the em dash.

## Sources

- [ASD-STE100 official site — About STE](https://www.asd-ste100.org/about_STE.html) and [FAQ](https://www.asd-ste100.org/STE_faq.html) — authoritative for structure (53 rules / 9 sections, ~900-word dictionary, free since Issue 6/2013), not for verbatim rule text.
- [Simplified Technical English — Wikipedia](https://en.wikipedia.org/wiki/Simplified_Technical_English) — independent summary; source for the 20/25-word sentence limits, 3-word noun cluster cap, permitted verb forms, and history.
- [TechScribe: ASD-STE100 Simplified Technical English](https://www.techscribe.co.uk/techw/asd-simplified-technical-english.htm) — independent technical-writing consultancy; corroborates sentence-length limits, verb-tense restrictions, and dictionary part-of-speech rules.
- `~/.agents/skills/humanizer/SKILL.md` and `AGENTS.md` — the installed humanizer skill (based on Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).

Numeric STE limits above (sentence length, noun-cluster size) are reported
consistently by multiple independent secondary sources but could not be
confirmed against the licensed standard's own text in this research pass —
flagged as approximate where it matters.
