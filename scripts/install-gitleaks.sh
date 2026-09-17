#!/usr/bin/env bash
# Installs the pinned gitleaks release into <repo>/bin, verified by checksum.
# Single source of truth for the version is <repo>/.gitleaks-version; the husky
# hooks, CI, and contributors (README) all run this, so local == CI, always.
# Fails closed: a leaked secret cannot be un-leaked, so any error aborts.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(cd -- "$script_dir/.." && pwd)
version=$(tr -d ' \t\n\r' <"$repo_root/.gitleaks-version")
bin_dir="$repo_root/bin"
target="$bin_dir/gitleaks"

# Idempotent: already at the pinned version means no download.
if [ -x "$target" ] && [ "$("$target" version 2>/dev/null | tr -d 'v \t\n\r')" = "$version" ]; then
  exit 0
fi

# Map uname to gitleaks' goreleaser asset naming (os_arch).
os=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$os" in
  darwin | linux) ;;
  *)
    echo "install-gitleaks: unsupported OS '$os'" >&2
    exit 1
    ;;
esac
arch=$(uname -m)
case "$arch" in
  x86_64 | amd64) arch=x64 ;;
  arm64 | aarch64) arch=arm64 ;;
  *)
    echo "install-gitleaks: unsupported architecture '$arch'" >&2
    exit 1
    ;;
esac

base="https://github.com/gitleaks/gitleaks/releases/download/v${version}"
tarball="gitleaks_${version}_${os}_${arch}.tar.gz"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

curl -fsSL -o "$tmp/$tarball" "$base/$tarball"
curl -fsSL -o "$tmp/checksums.txt" "$base/gitleaks_${version}_checksums.txt"

# Verify sha256 before trusting the binary (sha256sum on Linux, shasum on macOS).
(
  cd "$tmp"
  line=$(grep " ${tarball}\$" checksums.txt)
  if command -v sha256sum >/dev/null 2>&1; then
    printf '%s\n' "$line" | sha256sum -c -
  else
    printf '%s\n' "$line" | shasum -a 256 -c -
  fi
)

mkdir -p "$bin_dir"
tar -xzf "$tmp/$tarball" -C "$bin_dir" gitleaks
chmod +x "$target"

echo "install-gitleaks: gitleaks ${version} installed at ${target}"
