---
name: sdlc:create-pr
description: Use when creating a pull request -- reads the PR template, auto-fills from git context and linked issue, confirms with the user, then creates via gh CLI.
---

# /sdlc:create-pr

Create a well-structured GitHub pull request by reading the repo's PR template and filling it from context.

**Core principle:** Templates own the format. Context owns the content. User owns the final word.

## Template Location

Read `.github/PULL_REQUEST_TEMPLATE.md` relative to the project root on every invocation. This path is fixed -- do not search for it.

## Core Pattern

1. **Gather** -- Collect all inputs silently. Ask only when auto-derivation fails.
2. **Draft** -- Fill every template section from the gathered context.
3. **Confirm** -- Show the full draft. Wait for explicit approval. Iterate.
4. **Create** -- Run `gh pr create` with `--body-file`. Report the URL.

## Step 1: Gather

**Auto-derive (no user interaction):**

- Read `.github/PULL_REQUEST_TEMPLATE.md`
- Run `git diff <base>...HEAD` -- the branch diff
- Run `git log <base>..HEAD --oneline` -- the commit history
- Extract issue number from branch name (pattern: `type/NNN-description`, e.g., `feat/17-add-skill` → `#17`)
- If issue number found, run `gh issue view NNN --json title,body,labels` and extract acceptance criteria from the body

**Ask when needed (use multiple-choice where possible):**

| Question | When | Options |
|----------|------|---------|
| "Which issue does this PR close?" | Branch name has no issue number | List of recent open issues (via `gh issue list --state open --limit 5 --json number,title`) + "None" + Other |
| "PR type?" | Always; pre-select "Ready for review" | "Ready for review" / "Draft" |
| "Base branch?" | Always; **must be asked even when auto-detected** -- the auto-detected value is the pre-selected default, not a reason to skip | Branch we branched from (auto-detected via `git merge-base` against known remote branches; pre-selected as default) / `develop` (if present in remote) / `main` / Other |
| "Who should review this PR?" | Always; multi-select | All reviewers returned by script (see below), in order, plus "Other" as the last option |
| "Who should this PR be assigned to?" | Always; pre-select "Me" | "Me" (resolved via `gh api user --jq '.login'`) / "Nobody" (default if "Me" feels presumptuous) / Other |
| "Which checklist items have you completed?" | Always; multi-select; zero selections is valid (means none completed yet) | "Self-reviewed my own diff" / "Tests added or updated" / "Docs updated (if applicable)" / "No unrelated changes bundled in" |
| "Will you add screenshots to this PR?" | Always | "Yes, I'll add them after creation" / "No" (default) |

### Helper scripts

**IMPORTANT:** Do NOT run `bash .claude/skills/create-pr/*.sh` directly -- that path only works for project-local installs. Always use the commands below, which resolve the script location first.

Auto-detect base branch:

```bash
if [[ -f .claude/skills/create-pr/get-base-branch.sh ]]; then bash .claude/skills/create-pr/get-base-branch.sh; elif [[ -f "$HOME/.claude/skills/create-pr/get-base-branch.sh" ]]; then bash "$HOME/.claude/skills/create-pr/get-base-branch.sh"; fi
```

It outputs the branch name (e.g., `main`, `develop`) whose merge-base with HEAD is most recent -- i.e., the branch we most likely forked from. Present it as the pre-selected default in the base branch question.

Fetch recent reviewers:

```bash
if [[ -f .claude/skills/create-pr/get-reviewers.sh ]]; then bash .claude/skills/create-pr/get-reviewers.sh; elif [[ -f "$HOME/.claude/skills/create-pr/get-reviewers.sh" ]]; then bash "$HOME/.claude/skills/create-pr/get-reviewers.sh"; fi
```

It outputs up to 4 reviewer logins, one per line, ordered most-recent-first (excludes the current user; falls back to alphabetical collaborators for new repos). Show every login the script returns as an option, in the exact order returned. Add "Other" as the last option. Do not add a "Skip" or "None" option -- if the user wants no reviewers, they select only "Other" and leave it empty.

Do not add labels to the PR. Labels are managed separately.

## Step 2: Draft

### PR Title

Conventional commit format: `type(scope): subject` or `type: subject`.

Allowed types: `feat`, `fix`, `docs`, `test`, `ci`, `refactor`, `perf`, `chore`, `revert`, `wip`, `build`, `style`, `release`.

<!-- Standard Conventional Commits prefixes only, matching the types documented in CLAUDE.md. Projects adopting this starter kit can extend this list to suit their conventions. -->

- Derive from branch name and commit history
- Scope is optional
- Subject: lowercase, imperative mood, no trailing period

### PR Body

Fill every section in template order. Strip all HTML comments (`<!-- ... -->`).

#### Summary

First line: `Closes #`

If no linked issue, first line: `No related issue. <one sentence motivation>`

Followed by 1-3 sentences synthesizing commits and issue description, focused on *why* not *what*. If no issue is linked, derive from commits and branch name only.

#### Changes

Bullet list. Each bullet = one discrete change from the diff or commit messages.

#### Acceptance criteria

- **Issue has AC:** Mirror as checkboxes. Check off items the diff demonstrates are fulfilled.
- **Issue has no AC, or no issue:** Suggest AC based on the changes made. Present as unchecked checkboxes.
- **AC diverged from issue:** Note it explicitly. Example: "Note: criterion X was moved to #M" or "Added: Y discovered during implementation."

#### Test plan

Two subsections, always present:

##### Automated tests
List test files added/modified in the diff and the command to run them. If none: `No automated tests added.`

##### Manual verification
If the change has user-facing or integration behavior, list manual steps. If purely internal: `No manual steps required.`

#### Breaking changes

If breaking changes detected (API changes, removed exports, schema changes): describe what breaks and migration steps.

If none: `None.`

#### Checklist

Render all four items based on the user's selections from the Gather step:

- Items selected by the user → `- [x] <item>`
- Items not selected → `- [ ] <item>`

The four items, in order:

1. Self-reviewed my own diff
2. Tests added or updated
3. Docs updated (if applicable)
4. No unrelated changes bundled in

#### Screenshots

Based on the Step 1 answer:

- "Yes": `To be added after PR creation.` (remind user to attach via GitHub UI)
- "No" (default): `None.`

**The section is always present.**

## Step 3: Confirm

Show to the user:
- PR title
- Complete body (all sections, no HTML comments)
- Target base branch
- The exact `gh pr create` command that will run

Wait for explicit approval. Accept edits to any section. Loop until approved.

## Step 4: Create

```bash
BODY_FILE=$(mktemp /tmp/gh_pr_body_XXXXXX)

# Replace the placeholder below with the actual drafted PR body:
cat > "$BODY_FILE" << 'EOF'
{{PR_BODY}}
EOF

gh pr create \
  --title "<title>" \
  --base "<base-branch>" \
  --body-file "$BODY_FILE" \
  [--reviewer <handle> ...] \
  [--assignee <handle>]
```

Add `--draft` if user selected "Draft" in Step 1. Add one `--reviewer <handle>` flag per reviewer selected in Step 1; if "Other" was selected, use the handle the user provided. Add `--assignee <handle>` using the resolved login if "Me" or "Other" was selected; omit if "Nobody".

After reporting the PR URL: if the user selected "Yes" for screenshots in Step 1, remind them to attach screenshots via the GitHub UI.

## Edge Cases

### Branch is behind base
Present options:
1. **Continue as-is** -- create the PR and note it's behind
2. **Rebase onto base** -- run `git rebase <base>`; if conflicts, help resolve
3. **Merge base in** -- run `git merge <base>`; if conflicts, help resolve
4. **Abort** -- stop; do not create the PR

### No commits ahead of base
Stop. "No commits ahead of `<base>`. Nothing to create a PR from."

## Common Mistakes

- **Reconstructing the template from memory** -- read `.github/PULL_REQUEST_TEMPLATE.md` every time.
- **Generating an ad-hoc format** -- every section from the template must appear, in template order.
- **Creating before confirmation** -- never run `gh pr create` without explicit user approval.
- **Leaving HTML comments** -- strip all `<!-- ... -->` from the output.
- **Silently omitting `Closes #`** -- if no issue, say so explicitly on the first line.
- **Deleting empty sections** -- Breaking changes and Screenshots are always present; use `None.`
- **Ignoring AC divergence** -- note explicitly when PR criteria differ from the issue's.
- **Skipping the base-branch question** -- always present it. Auto-detection provides the default, not the answer.

## Installation

This skill includes helper scripts alongside `SKILL.md`. When installing or updating, copy (or symlink) the **entire `create-pr/` directory** -- not just `SKILL.md`. All files in this directory are required:

- `SKILL.md` -- skill definition
- `get-base-branch.sh` -- auto-detects the base branch
- `get-reviewers.sh` -- fetches recent reviewer logins
