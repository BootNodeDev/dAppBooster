#!/usr/bin/env bash
set -euo pipefail

me=$(gh api user --jq '.login' 2>/dev/null) || true

# Attempt: recent PR reviewers sorted by most-recent-first
reviewers=$(
  gh pr list --state all --limit 20 --json reviews \
    --jq "
      [ .[].reviews[]
        | { login: .author.login, ts: .submittedAt }
      ]
      | sort_by(.ts) | reverse
      | map(.login)
      | map(select(. != \"$me\"))
      | reduce .[] as \$x (
          { seen: {}, out: [] };
          if .seen[\$x] then . else { seen: (.seen | .[\$x] = true), out: (.out + [\$x]) } end
        )
      | .out[:4]
      | .[]
    " 2>/dev/null || true
)

if [[ -n "$reviewers" ]]; then
  echo "$reviewers"
  exit 0
fi

# Fallback: collaborators (alphabetical, excluding self)
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) || exit 0
gh api "/repos/$repo/collaborators" \
  --jq "[ .[].login | select(. != \"$me\") ] | sort | .[:4] | .[]" \
  2>/dev/null || true
