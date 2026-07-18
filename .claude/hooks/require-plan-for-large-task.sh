#!/bin/bash
# PreToolUse/Bash: 一括変更コマンド(find+sed 等)を警告し /plan を促す
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping require-plan-for-large-task" >&2; exit 0; }

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# find ... -exec / xargs sed / grep -rl | xargs 等の一括破壊的置換
if echo "$CMD" | grep -Eq 'find[[:space:]].*-exec|xargs[[:space:]].*(sed|perl)|sed[[:space:]].*-i.*\*'; then
  echo "[警告] 一括変更コマンドを検出しました。影響範囲が広い場合は /plan で計画し、ユーザー確認を得てから実行してください。" >&2
fi
exit 0
