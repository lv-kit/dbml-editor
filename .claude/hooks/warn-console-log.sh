#!/bin/bash
# PreToolUse/Edit|Write: デバッグ出力(console.log/debugger)の残置を警告する（test/story は除外）
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping warn-console-log" >&2; exit 0; }

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

# テスト・ストーリー・設定は除外
case "$FILE" in
  *.spec.ts|*.test.ts|*.stories.*|*/vitest-examples/*|*.config.*) exit 0 ;;
esac

if echo "$CONTENT" | grep -Eq '(^|[^.[:alnum:]])console\.(log|debug)\(|(^|[^.[:alnum:]])debugger([[:space:]]|;|$)'; then
  echo "[警告] console.log / debugger が含まれています。デバッグ出力の残置に注意してください。" >&2
fi
exit 0
