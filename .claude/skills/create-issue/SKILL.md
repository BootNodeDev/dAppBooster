---
name: sdlc:create-issue
description: Use when creating a GitHub issue from a brief -- bug, feature, epic, or spike -- against the repo's GitHub issue templates via gh CLI.
---

# /sdlc:create-issue

Create a well-structured GitHub issue using the repo's own templates and `gh` CLI.

**Core principle:** Templates own the format. Skill owns the behavior. A human has to read this -- keep it short.

## Core Pattern

1. **Classify** -- Determine type from the brief: bug / feature / epic / spike.
2. **Read** -- Load `.github/ISSUE_TEMPLATE/<type>.yml`. Extract all fields, required vs optional, and labels. Do this every time -- never reconstruct from memory.
3. **Draft** -- Fill every required field from the brief, inside the body budget. Sections follow template field order using `label` as heading.
4. **Ask** -- One batched `AskUserQuestion` round, only for what the brief cannot answer.
5. **Confirm** -- Show the full draft including labels. Everything is editable here. Wait for explicit approval.
6. **Create** -- Write body to temp file, run `gh issue create` with all labels, report the URL.

## Body Budget

The reader is a person triaging a backlog. Optimise for their time, not for completeness.

| Rule | Limit |
|------|-------|
| Prose (every paragraph in the body, combined) | 150 words target, **200 words hard cap** |
| Any list item | one ultra brief line, no sub-bullets, no trailing period |

The word limit above is a hard cap, not a guideline. A body that exceeds it is not ready to post.

- One idea per section. If two sections say the same thing, cut one.
- No preamble, no restating the title, no "this issue tracks...". Start with the fact.
- Omit optional fields entirely rather than filling them with `N/A` or filler.
- Over the hard cap means delete content, never compress it into one long sentence.
- Steps and criteria are for a human to execute: numbered, imperative, one ultra brief line each, no assumed context.

## Writing Style

Avoid dense technical writing. Use clear, concise, and non-redundant prose. Examples: Simple English Wikipedia, Mr. Rogers, Ernest Hemingway.

Banned vocabulary: do not invent abbreviations, compound labels, framework names, or domain terms.

List of usual words to avoid:

- load-bearing
- blast radius
- footgun
- yak shaving
- belt-and-suspenders
- smoking gun
- spine
- seams
- gate
- substrate

If writing documentation pay special attention to use words a maintainer would search for in the codebase.

If something can be made a list, make it a list. It's easier to read. Prefer avoiding walls of text.

## Step 1: Classify

| Signal | Type |
|--------|------|
| Something works incorrectly today | Bug |
| New capability or improvement to existing behavior | Feature |
| Needs several PRs or several deliverables | Epic |
| A question to answer, no code shipped | Spike |

Decide from the brief. Only ask when two types are genuinely defensible, and batch it with Step 4.

## Step 2: Template Map

| Type    | File            | Type label    | Additional labels         |
|---------|-----------------|---------------|---------------------------|
| Bug     | `1-bug.yml`     | `bug`         | `priority: <level>`       |
| Feature | `2-feature.yml` | `enhancement` | `priority: <level>`       |
| Epic    | `3-epic.yml`    | `epic`        | `priority: <level>`       |
| Spike   | `4-spike.yml`   | `spike`       | --                        |

## Step 3: Draft

### Title

Natural language, sentence case (code terms and command names keep their canonical casing). No conventional commit prefixes, no scope tags.

Conventional commit format (`type(scope): subject`) is for **commits and PR titles only**. Issue titles appear in GitHub's issue list and must be scannable at a glance.

**Good:**
- `Issue skill defaults to conventional commit format for titles`
- `mktemp fails with .md suffix`
- `Add natural language title guidance to issue skill`

**Bad:**
- `fix(skills): mktemp fails with .md suffix`
- `fix: issue skill defaults to conventional commit format`
- `feat(issue): add title guidance`

Rule: if a reader has to mentally strip a prefix to understand the title, the title is wrong.

### Body

Required fields are the floor. Include an optional field only when the brief already supplies its content -- never to look thorough.

| Field kind | How to draft it |
|------------|-----------------|
| Description / problem statement | 1-3 sentences on what is wrong or missing, and for whom |
| Steps to reproduce | Numbered, one ultra brief line each, starting from a clean state; last step is the failure |
| Expected vs actual | One line each |
| Acceptance criteria | One ultra brief checkbox each, independently testable |
| Scope (epics) | Two bullet lists, in scope and out of scope, one ultra brief line each |
| Issue breakdown (epics) | One line per future issue, unchecked |
| Investigation approach (spikes) | Numbered steps the investigator follows |

Never invent specifics the brief did not provide: no fabricated version numbers, error strings, file paths, or timelines. A field with no basis in the brief is either omitted (optional) or asked about (required).

## Step 4: Ask

One batched round. Include only the questions that survive the filter:

| Question | Ask when | Options |
|----------|----------|---------|
| Issue type? | Two types are genuinely defensible | The candidate types, most likely first |
| Priority? | Always for bug / feature / epic; never for spike | Critical / High / Medium / Low, with the level inferred from the brief pre-selected |
| Time-box? | Spike, and the brief implies no duration | 2 hours / Half day / 1 day / 2 days / 3 days |
| `<required field>` | The brief gives no basis for it at all | 2-3 drafted candidates + Other |

**The filter:** never ask what the brief already answers, and never ask what the user could fix just as fast in Step 5. The draft is the question.

Priority is applied as a label, not a form dropdown -- the body carries no Priority heading. See the Label Conventions section in `CLAUDE.md` for the full table.

## Step 5: Confirm

Show the title, the complete body, and every label. Report the prose word count when it exceeds 150. Accept edits to any section. Loop until approved.

## Step 6: Create

```bash
BODY_FILE=$(mktemp /tmp/gh_issue_body_XXXXXX)

cat > "$BODY_FILE" << 'EOF'
<body>
EOF

gh issue create \
  --title "<title>" \
  --label "<type-label>" \
  --label "<priority-label>" \
  --body-file "$BODY_FILE"
```

**Spike exception:** omit the `--label "<priority-label>"` line -- spikes carry only the `spike` type label.

Multiple `--label` flags can be chained. The type label is always present. The priority label is added for bugs, features, and epics.

Optional flags: `--assignee "<username>"`, `--milestone "<name>"`, `--project "<name>"`

## Common Mistakes

- **Skipping the template read** -- field names and order come from the YAML, not assumptions. Read it every time.
- **Interviewing field by field** -- draft first, then ask one batched round for what is genuinely missing.
- **Pre-emptively filling optional fields** -- an empty optional field costs the reader nothing; a padded one costs them time.
- **Blowing the word budget** -- 200 words of prose is a hard cap, not a target to fill.
- **Reproduction steps that are not steps** -- "it fails when saving" is not reproducible. Write what the reader types and clicks.
- **Acceptance criteria that are not testable** -- "works well" cannot be checked off.
- **Creating before confirmation** -- never run `gh` without explicit approval. Always show the full draft first.
- **Omitting priority labels** -- form dropdowns do not survive `gh` CLI creation. Always apply these as labels.
