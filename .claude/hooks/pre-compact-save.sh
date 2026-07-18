#!/bin/bash
# PreCompact: 圧縮前に変更ファイル一覧を last-session-changes.md へ退避する
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

OUT="$ROOT/last-session-changes.md"
{
  echo "# 圧縮前スナップショット"
  echo ""
  echo "ブランチ: $(git branch --show-current 2>/dev/null || echo '?')"
  echo ""
  echo "## 未コミットの変更"
  echo '```'
  git status --short 2>/dev/null || true
  echo '```'
  echo ""
  echo "## 直近コミット"
  echo '```'
  git log --oneline -5 2>/dev/null || true
  echo '```'
} > "$OUT"
echo "[Hook] 変更ファイル一覧を last-session-changes.md へ退避しました。" >&2
exit 0
