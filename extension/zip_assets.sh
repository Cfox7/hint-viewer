#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXT_DIR="$REPO_ROOT/hint-viewer/extension"
OUT_ZIP="${1:-$EXT_DIR/hint-viewer-bundle.zip}"
BUILD_MODE="${2:-}"
# Resolve OUT_ZIP to absolute path before any directory changes
[[ "$OUT_ZIP" = /* ]] || OUT_ZIP="$(pwd)/$OUT_ZIP"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "repo: $REPO_ROOT"
echo "extension dir: $EXT_DIR"
echo "staging dir: $TMP_DIR"
echo "output zip: $OUT_ZIP"

# Build client
cd "$EXT_DIR"
echo "Installing deps and building..."
if [ -n "$BUILD_MODE" ]; then
  npm run build -- --mode "$BUILD_MODE"
else
  npm run build
fi

DIST_DIR="$EXT_DIR/dist"
if [ ! -d "$DIST_DIR" ]; then
  echo "Build output not found at $DIST_DIR" >&2
  exit 1
fi

# Copy build output (Vite already copies public/ into dist/ during build)
cp -a "$DIST_DIR/." "$TMP_DIR/"

# Safety: ensure assets are under assets/ path in the staging dir
echo "Contents to be zipped:"
( cd "$TMP_DIR" && find . -maxdepth 4 -print )

rm -f "$OUT_ZIP"
( cd "$TMP_DIR" && zip -r "$OUT_ZIP" . >/dev/null )

echo "Bundle created: $OUT_ZIP"
ls -lh "$OUT_ZIP"