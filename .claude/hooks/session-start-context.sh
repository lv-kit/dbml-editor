#!/bin/bash
# SessionStart: 現在のブランチ・変更・直近コミットを表示する
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

BRANCH=$(git branch --show-current 2>/dev/null || echo "?")
echo "── セッション開始コンテキスト ──────────────" >&2
echo "ブランチ: $BRANCH" >&2

CHANGED=$(git status --short 2>/dev/null || true)
if [ -n "$CHANGED" ]; then
  echo "未コミットの変更:" >&2
  echo "$CHANGED" | head -15 | sed 's/^/  /' >&2
else
  echo "作業ツリー: clean" >&2
fi

echo "直近コミット:" >&2
git log --oneline -3 2>/dev/null | sed 's/^/  /' >&2
echo "────────────────────────────────────────────" >&2
exit 0
