#!/usr/bin/env bash
# Renders all six clips. Usage: render-all.sh <python-with-bpy> <outdir> [W H samples]
set -e
PY="$1"; OUT="$2"; W="${3:-800}"; H="${4:-700}"; S="${5:-20}"
cd "$(dirname "$0")"
for k in 0 1 2 3 4 5; do
  "$PY" scene.py clip "$k" "$OUT/clip$k" "$W" "$H" "$S" > "$OUT/clip$k.log" 2>&1
  echo "clip $k done $(date +%T)"
done
