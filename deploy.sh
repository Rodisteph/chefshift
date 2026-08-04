#!/usr/bin/env bash
set -e
npm run build
find . -name "*.bak" -delete
git add -A
git commit -m "${1:-update}"
git push
