#!/bin/bash
# PreToolUse/Bash: git commit 前にステージ済みファイルの整形チェックを実行し、失敗ならブロックする
# 高速な prettier --check を blocking ゲートにする。型検査/lint/テストの全量は /ci-all と CI で担保。
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping pre-commit-ci" >&2; exit 0; }

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git commit のみ対象（--amend や -m 問わず）
echo "$CMD" | grep -Eq 'git[[:space:]]+commit' || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT" || exit 0

# ステージ済みの web/ 配下ファイル（整形対象拡張子）
STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '^web/.*\.(ts|js|svelte|json|css|md)$' || true)
[ -z "$STAGED" ] && exit 0

# web/ からの相対パスに変換
REL=$(echo "$STAGED" | sed 's#^web/##')

if ! ( cd web && echo "$REL" | xargs pnpm exec prettier --check >/tmp/prettier-check.out 2>&1 ); then
  echo "[ブロック] 整形チェック(prettier)に失敗しました。コミット前に修正してください:" >&2
  sed 's/^/  /' /tmp/prettier-check.out >&2
  echo "修正: cd web && pnpm run format  /  全量検証: /ci-all（正本: .claude/rules/common/testing.md）" >&2
  exit 2
fi
exit 0
