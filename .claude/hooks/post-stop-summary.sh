#!/bin/bash
# Stop: 応答完了時に変更ファイル一覧を表示する
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

CHANGED=$(git status --short 2>/dev/null || true)
if [ -n "$CHANGED" ]; then
  echo "── 変更ファイル ────────────────────────────" >&2
  echo "$CHANGED" | sed 's/^/  /' >&2
  echo "検証: /ci-all（正本: .claude/rules/common/testing.md）" >&2
  echo "────────────────────────────────────────────" >&2
fi
exit 0
