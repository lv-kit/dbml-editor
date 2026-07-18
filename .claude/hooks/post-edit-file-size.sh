#!/bin/bash
# PostToolUse/Edit|Write: ファイル行数が閾値を超えたら分割を警告する
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping post-edit-file-size" >&2; exit 0; }

WARN=600   # 予告警告
LIMIT=800  # 分割強く推奨

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -f "$FILE" ] || exit 0

# 生成物・ロックは対象外
case "$FILE" in
  *pnpm-lock.yaml|*/.svelte-kit/*|*/paraglide/*|*.json) exit 0 ;;
esac

LINES=$(wc -l < "$FILE" | tr -d ' ')
if [ "$LINES" -ge "$LIMIT" ]; then
  echo "[警告] $FILE は ${LINES} 行です（${LIMIT} 行超）。1モジュール1責務へ分割を強く推奨します。" >&2
elif [ "$LINES" -ge "$WARN" ]; then
  echo "[予告] $FILE は ${LINES} 行です（${WARN} 行超）。責務が増えていないか確認してください。" >&2
fi
exit 0
