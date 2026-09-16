repo_root=$(cd "$(dirname "$0")/.." && pwd)
"$repo_root/scripts/install-gitleaks.sh"
PATH="$repo_root/bin:$PATH"
