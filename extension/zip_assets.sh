#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXT_DIR="$REPO_ROOT/hint-viewer/extension"
OUT_ZIP="${1:-$EXT_DIR/hint-viewer-bundle.zip}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "repo: $REPO_ROOT"
echo "extension dir: $EXT_DIR"
echo "staging dir: $TMP_DIR"
echo "output zip: $OUT_ZIP"

# Build client
cd "$EXT_DIR"
echo "Installing deps and building..."
npm ci
npm run build

DIST_DIR="$EXT_DIR/dist"
if [ ! -d "$DIST_DIR" ]; then
  echo "Build output not found at $DIST_DIR" >&2
  exit 1
fi

# Copy build output
cp -a "$DIST_DIR/." "$TMP_DIR/"

# Include public assets (if you keep fonts/images in public)
if [ -d "$EXT_DIR/public" ]; then
  cp -a "$EXT_DIR/public/." "$TMP_DIR/" || true
fi

# If you created a separate assets zip, merge its contents (optional)
ASSET_ZIP="$EXT_DIR/hint-viewer-assets.zip"
if [ -f "$ASSET_ZIP" ]; then
  echo "Merging existing assets zip into bundle..."
  unzip -o "$ASSET_ZIP" -d "$TMP_DIR" >/dev/null
fi

# Safety: ensure assets are under assets/ path in the staging dir
echo "Contents to be zipped:"
( cd "$TMP_DIR" && find . -maxdepth 4 -print )

# Create the bundle zip with files at the root of the archive
( cd "$TMP_DIR" && zip -r "$OUT_ZIP" . >/dev/null )

echo "Bundle created: $OUT_ZIP"
ls -lh "$OUT_ZIP"
```# filepath: /home/cfox/hint-