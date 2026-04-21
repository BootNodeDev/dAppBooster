#!/usr/bin/env bash
set -euo pipefail

# Find the base branch: the most likely target for a pull request.
#
# Strategy: pick the remote branch whose merge-base with HEAD is most recent
# (i.e., the branch we most likely forked from). This works even when the
# base branch has advanced past the fork point.
#
# 1. Check well-known stable branches first (main, master, develop, staging).
#    Among those that exist, pick the one with the closest merge-base to HEAD.
# 2. If none match, fall back to any remote branch with the closest merge-base.

current=$(git rev-parse --abbrev-ref HEAD)

# Priority 1: well-known base branches -- pick closest merge-base
best_branch=""
best_ts=0

for candidate in main master develop staging; do
  ref="origin/$candidate"
  git rev-parse --verify "$ref" >/dev/null 2>&1 || continue
  [[ "$candidate" == "$current" ]] && continue
  mb=$(git merge-base HEAD "$ref" 2>/dev/null) || continue
  ts=$(git log -1 --format=%ct "$mb" 2>/dev/null) || continue
  [[ -n "$ts" ]] || continue
  if (( ts > best_ts )); then
    best_ts=$ts
    best_branch=$candidate
  fi
done

if [[ -n "$best_branch" ]]; then
  echo "$best_branch"
  exit 0
fi

# Priority 2: any other remote branch, pick closest merge-base
best_branch=""
best_ts=0

while IFS= read -r ref; do
  branch="${ref#origin/}"
  [[ "$branch" == "HEAD" ]] && continue
  [[ "$branch" == "$current" ]] && continue
  mb=$(git merge-base HEAD "$ref" 2>/dev/null) || continue
  ts=$(git log -1 --format=%ct "$mb" 2>/dev/null) || continue
  [[ -n "$ts" ]] || continue
  if (( ts > best_ts )); then
    best_ts=$ts
    best_branch=$branch
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/)

if [[ -z "$best_branch" ]]; then
  echo "No base branch found" >&2
  exit 1
fi

echo "$best_branch"
