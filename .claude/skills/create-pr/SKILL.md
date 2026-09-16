---
name: sdlc:create-pr
description: Use when creating a pull request -- reads the PR template, auto-fills from git context and linked issue, confirms with the user, then creates via gh CLI.
---

# /sdlc:create-pr

Create a well-structured GitHub pull request by reading the repo's PR template and filling it from context.

**Core principle:** Templates own the format. Context owns the content. A human has to read this -- keep it short.

## Template Location

Read `.github/PULL_REQUEST_TEMPLATE.md` relative to the project root on every invocation. This path is fixed -- do not search for it.

## Core Pattern

0. **Scope check** -- Compare the diff against the issue. Settle any split *before* the wizard starts.
1. **Gather** -- Derive everything derivable. Ask one batched round of questions, nothing more.
2. **Draft** -- Fill every template section inside the body budget.
3. **Confirm** -- Show the full draft. Everything is editable here. Wait for explicit approval.
4. **Create** -- Run `gh pr create` with `--body-file`. Report the URL.

## Body Budget

The reader is a person with several PRs to review today. Optimise for their time, not for completeness.

| Rule | Limit |
|------|-------|
| Prose (every paragraph in the body, combined) | 150 words target, **200 words hard cap** |
| Deviations section prose | **100 words hard cap**, counted inside the 200 |
| Any list item | one ultra brief line, no sub-bullets, no trailing period |

The word limits above are hard caps, not guidelines. A body that exceeds one is not ready to post.

- Cut anything GitHub already shows: file names, paths, diff stats, commit hashes, branch names.
- Cut restatement. If a bullet re-says the summary in other words, delete the bullet.
- No preamble. `This PR adds...` → `Adds...`, then delete that too if the bullet below says it.
- Over a hard cap means delete content, never compress it into one long sentence.

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

## Step 0: Scope Check

Run this first. A developer must never discover at the end of the wizard that the branch should have been split.

1. Resolve the issue: branch name `type/NNN-description` → `#NNN`; else a `#NNN` in the commit messages. Found nothing? Ask once -- the 5 most recent open issues (`gh issue list --state open --limit 5 --json number,title`) plus "None". The scope check needs this answer, so it cannot wait for Step 1.
2. Read `git log <base>..HEAD --oneline` and `git diff <base>...HEAD --stat`, then the diff itself.
3. Sort every change into **in scope** (traceable to the issue's acceptance criteria or stated problem) or **deviation**. Deviations come in two kinds:
   - **Better judgment** -- the issue's own work, delivered differently than written: a criterion met by another mechanism, a renamed concept, a decision the issue got wrong. There is nothing to move to another branch. Report it in the Deviations section and move on. Where it proves the issue itself wrong, say so and suggest editing the issue.
   - **Extra scope** -- work that would still exist had the issue been followed to the letter: drive-by refactors, unrelated fixes, formatting sweeps, dependency bumps, renames nobody requested.

No linked issue: everything is in scope. Skip to Step 1.

### When to suggest a split

Only extra scope counts. Better judgment never triggers this, whatever its size.

Stop when either holds:

- Two or more distinct extra-scope concerns, each of which would merit its own issue
- Any single extra-scope concern that changes runtime behavior or public API

Size is not a trigger. A large formatting sweep costs a reviewer one glance; two unrelated fixes cost two review contexts, two rollback decisions, and two reasons for the PR to sit unmerged.

Neither trigger fires? Say nothing. Record the deviations for the Deviations section and continue.

### How to present the split

The explanation goes in the printed message, where it has room. The question carries only the decision.

Print, in this order:

- One line: how many extra-scope changes, and which trigger fired
- One ultra brief line per extra-scope change
- One or two sentences on what the reviewer pays for by having them here
- `Splitting is your call. Nothing has been created yet.`

Then ask, two options only:

1. **Keep everything in this PR** -- continue to the draft; the deviations land in the Deviations section
2. **Stop, I'll split it myself** -- halt the skill; create nothing

The split is the developer's to perform, not the skill's. Never cherry-pick, rebase, rewrite history, or create branches here. Stopping means stopping.

## Step 1: Gather

### Auto-derived -- never ask

| Input | Source |
|-------|--------|
| Template | `.github/PULL_REQUEST_TEMPLATE.md`, read every time |
| Diff and commits | `git diff <base>...HEAD`, `git log <base>..HEAD --oneline` |
| Linked issue | Number from branch or commits, then `gh issue view NNN --json title,body,labels` |
| Base branch | `get-base-branch.sh` (below) |
| Assignee | `gh api user --jq '.login'` -- the author is the assignee |
| Checklist | Derived from the diff, see Checklist in Step 2 |
| Screenshots | Yes only when the diff changes something visible on screen |
| Title | Conventional commit derived from branch name and commits |

### Asked -- one `AskUserQuestion` round, batched

| Question | Ask when | Options |
|----------|----------|---------|
| Who should review this PR? | Always; multi-select | Every login from `get-reviewers.sh`, in order, plus "Other" last |
| Ready or draft? | Always | "Ready for review" (default) / "Draft" |
| Base branch? | `get-base-branch.sh` fails, or returns a branch that is not `main`/`master`/`develop`/`staging` | Script's answer (default) / `develop` / `main` / Other |

The linked issue was already settled in Step 0. Do not ask again.

**The filter:** never ask a question whose answer the user could fix just as fast in Step 3. The draft is the question. Auto-detection is an answer, not a default to confirm.

### Helper scripts

**IMPORTANT:** Do NOT run `bash .claude/skills/create-pr/*.sh` directly -- that path only works for project-local installs. Always use the commands below, which resolve the script location first.

Auto-detect base branch:

```bash
if [[ -f .claude/skills/create-pr/get-base-branch.sh ]]; then bash .claude/skills/create-pr/get-base-branch.sh; elif [[ -f "$HOME/.claude/skills/create-pr/get-base-branch.sh" ]]; then bash "$HOME/.claude/skills/create-pr/get-base-branch.sh"; fi
```

It outputs the branch name (e.g., `main`, `develop`) whose merge-base with HEAD is most recent -- i.e., the branch we most likely forked from.

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

First line: `Closes #NNN`. No linked issue: `No related issue.`

Then one or two sentences on why this exists -- the problem, not the mechanics. If the title already says it, one sentence is enough.

#### Changes

One ultra brief line per change. What the software does differently now.

- No file names or paths -- GitHub's Files tab covers that
- Describe behaviour, not edits: `Header links to the block explorer`, not `Updated Header.tsx to add a link`
- Merge near-identical bullets into one

#### Deviations

Everything the reviewer would otherwise flag as a surprise, carried over from Step 0: extra scope the issue never asked for, and its own work delivered differently than it worded it.

- One ultra brief line each, prose **100 words hard cap** for the section (usually zero prose needed)
- Each bullet: what changed, and why it rode along or why the issue's version was not followed
- **Nothing to report: delete the whole section, heading included.** This is the one section that disappears when empty
- **Something to report but the template has no such heading: add it anyway, after Changes.** Older templates predate this section, and dropping the content silently is worse than adding a heading

#### Acceptance criteria

- **Issue has AC:** mirror it verbatim as checkboxes, in the issue's own words. Check off what the diff demonstrably fulfils.
- **No AC, or no issue:** write one-line criteria derived from the change, unchecked.
- **A criterion was met differently:** keep the issue's wording, check it off, and explain the difference in one Deviations bullet. Never silently reword the issue.
- Do not restate criteria that the Changes bullets already cover word for word -- cut the bullet, keep the criterion.

#### Test plan

Both subsections are **instructions a human executes**: numbered, imperative, one ultra brief line per step, no prior knowledge assumed. The final step states what they should observe.

##### Automated tests

Steps to run the checks covering this PR:

```
1. Run `pnpm install`
2. Run `pnpm test src/components/Header`
3. Expect 4 passing tests, no warnings
```

No test tooling in the repo, or nothing runnable: `None.`

##### Manual verification

Steps to see the change working. Step 1 is normally checkout plus start command; the last step is the observable result:

```
1. Check out this branch and run `pnpm dev`
2. Open http://localhost:3000 and connect a wallet
3. Click the transaction hash in the activity list
4. Expect the explorer to open in a new tab on that transaction
```

Purely internal change with nothing to look at: `No manual steps required.`

#### Breaking changes

`None.` unless the diff removes or renames a public export, changes an API contract, alters a schema, or requires a new env var. If it does: one line for what breaks, one line for the migration.

#### Checklist

Pre-mark every item from the diff. Do not ask -- Step 3 is where the user corrects them.

| Item | Checked when |
|------|--------------|
| Self-reviewed my own diff | Always -- the full diff was read while drafting, and the user approves it in Step 3 |
| Tests added or updated | The diff touches test files |
| Docs updated (if applicable) | The diff touches docs, **or** the change needs none (no user-facing or API surface) |
| No unrelated changes bundled in | Step 0 found no extra scope; better-judgment deviations do not uncheck it |

Render checked items as `- [x] <item>`, unchecked as `- [ ] <item>`, always all four, always in template order.

#### Screenshots

- Something visible changed: `To be added before review.` and remind the user after creation
- Otherwise: `None.`

## Step 3: Confirm

Show:
- One header line: PR title, base branch, reviewers, assignee, draft status
- The complete body, exactly as it will be posted
- The prose word count against the 150-word target and the 200-word hard cap, whenever it exceeds 150

**Never print the `gh pr create` command.** Every value in it is already in the header line, and showing it invites the developer to review flag syntax instead of the body. They approve content; the skill handles mechanics.

Call out the two things users most often change: the **pre-marked checklist** and the **Deviations** section. Accept edits to any section. Loop until approved.

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

Add `--draft` if the user selected "Draft". Add one `--reviewer <handle>` flag per reviewer selected; if "Other" was selected, use the handle the user provided. Add `--assignee` with the resolved login.

After reporting the PR URL: if Screenshots says `To be added before review.`, remind the user to attach them via the GitHub UI.

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
- **Asking what the diff already answers** -- base branch, assignee, checklist, and screenshots are derived, not asked.
- **Running the scope check late** -- it is Step 0 because a split after drafting wastes the developer's time.
- **Offering a split over better judgment** -- delivering the issue's own work a smarter way cannot be moved to another branch. Only extra scope can.
- **Performing the split** -- the skill suggests and stops. Branch surgery belongs to the developer.
- **Printing the `gh` command at confirmation** -- the header line already carries every value in it.
- **Listing file paths in Changes** -- the Files tab does that better.
- **Test plans that are not steps** -- "Tested manually" and a list of test file names are both failures. Write what the reader types and clicks.
- **Blowing the word budget** -- 200 words of prose is a hard cap, not a target to fill.
- **Creating before confirmation** -- never run `gh pr create` without explicit user approval.
- **Leaving HTML comments** -- strip all `<!-- ... -->` from the output.
- **Silently omitting `Closes #`** -- if no issue, say so explicitly on the first line.
- **Deleting empty sections** -- Breaking changes and Screenshots always render with `None.`; only Deviations disappears.

## Installation

This skill includes helper scripts alongside `SKILL.md`. When installing or updating, copy (or symlink) the **entire `create-pr/` directory** -- not just `SKILL.md`. All files in this directory are required:

- `SKILL.md` -- skill definition
- `get-base-branch.sh` -- auto-detects the base branch
- `get-reviewers.sh` -- fetches recent reviewer logins
