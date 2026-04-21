---
name: sdlc:issue
description: Use when creating a GitHub issue from a brief -- bug, feature, epic, or spike -- against the repo's GitHub issue templates via gh CLI.
---

# /sdlc:issue

Create a well-structured GitHub issue using the repo's own templates and `gh` CLI.

**Core principle:** Templates own the format. Skill owns the behavior.

## Core Pattern

1. **Classify** -- Determine type from brief: bug / feature / epic / spike. If unclear, ask once.
2. **Read** -- Load `.github/ISSUE_TEMPLATE/<type>.yml`. Extract all fields, required vs optional, and label. Do this every time -- never reconstruct from memory.
3. **Interview** -- Ask only for missing required fields. If the brief already covers a field, don't re-ask. Scale ceremony to issue weight.
4. **Draft** -- Build title and body. Sections follow template field order using `label` as heading. Omit empty optional fields.
5. **Confirm** -- Show full draft including labels. Wait for explicit approval. Iterate until approved.
6. **Create** -- Write body to temp file, run `gh issue create` with all labels, report issue URL.

## Title Format

Issue titles must be **natural language, sentence case** (code terms and command names retain their canonical casing) -- no conventional commit prefixes, no scope tags.

Conventional commit format (`type(scope): subject`) is for **commits and PR titles only**. It is not appropriate for issue titles, which appear in GitHub's issue list and must be scannable at a glance.

**Good:**
- `Issue skill defaults to conventional commit format for titles`
- `mktemp fails with .md suffix`
- `Add natural language title guidance to issue skill`

**Bad:**
- `fix(skills): mktemp fails with .md suffix`
- `fix: issue skill defaults to conventional commit format`
- `feat(issue): add title guidance`

Rule: if a reader has to mentally strip a prefix to understand the title, the title is wrong.

## Template Map

| Type    | File            | Type label    | Additional labels         |
|---------|-----------------|---------------|---------------------------|
| Bug     | `1-bug.yml`     | `bug`         | `priority: <level>`       |
| Feature | `2-feature.yml` | `enhancement` | `priority: <level>`       |
| Epic    | `3-epic.yml`    | `epic`        | `priority: <level>`       |
| Spike   | `4-spike.yml`   | `spike`       | --                        |

## Labels

Priority is applied as a label, not a form dropdown. See the Label Conventions section in `CLAUDE.md` for the full table and descriptions.

- Bugs, features, and epics each get a `priority: <level>` label.
- Spikes don't carry priority.
- If the brief doesn't specify a level, ask once using a numbered list -- never default silently:

  1. Critical
  2. High
  3. Medium
  4. Low

## gh Command

```bash
BODY_FILE=$(mktemp /tmp/gh_issue_body_XXXXXX)

cat > "$BODY_FILE" << 'EOF'
<body>
EOF

gh issue create \
  --title "<title>" \
  --label "<type-label>" \
  --label "<priority-label>" \  # omit for spikes
  --body-file "$BODY_FILE"
```

Multiple `--label` flags can be chained. The type label is always present. The priority label is added for bugs, features, and epics -- omit it for spikes.

Optional flags: `--assignee "<username>"`, `--milestone "<name>"`, `--project "<name>"`

## Common Mistakes

- **Skipping the template read** -- Field names and order come from the YAML, not assumptions. Read it every time.
- **Pre-emptively asking for optional fields** -- Required fields are the floor. Let the user volunteer the rest.
- **Creating before confirmation** -- Never run `gh` without explicit approval. Always show the full draft first.
- **Omitting priority labels** -- Form dropdowns do not survive `gh` CLI creation. Always apply these as labels.
