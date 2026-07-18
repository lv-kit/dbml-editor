#!/bin/bash
# PreToolUse/Edit|Write: スコープ外(両アプリ横断・共有モジュール)への変更を警告する
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping warn-scope-creep" >&2; exit 0; }

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ロック/生成物への手編集を警告
case "$FILE" in
  *pnpm-lock.yaml|*/.svelte-kit/*|*/paraglide/*|*/node_modules/*)
    echo "[警告] 生成物/ロックファイル '$FILE' を直接編集しようとしています。手編集は避けてください。" >&2
    ;;
esac
exit 0
