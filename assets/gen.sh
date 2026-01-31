#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="$SCRIPT_DIR/.tmp"

# export DEBUG=1

rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR" && cd "$TMP_DIR"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

# https://github.com/pamburus/termframe

# termframe -o "$SCRIPT_DIR/add.svg" --padding 2 -H auto --title "npx skillman add" -- pnpx skillman add skills.sh/vercel-labs/skills/find-skills anthropics/skills:skill-creator

# termframe -o "$SCRIPT_DIR/install.svg" --padding 2 -H auto --title "npx skillman" -- pnpx skillman

termframe -o "$SCRIPT_DIR/detect.svg" --padding 2 -H auto --title "npx skillman detect" -- node ../../src/cli.ts detect

