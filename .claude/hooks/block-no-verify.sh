#!/bin/bash
# PreToolUse/Bash: git commit/push の --no-verify をブロックする
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping block-no-verify" >&2; exit 0; }

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$CMD" | grep -Eq -- '--no-verify|(^|[[:space:]])-n([[:space:]]|$)'; then
  # -n は git commit の --no-verify 短縮。commit/push 文脈のみ対象
  if echo "$CMD" | grep -Eq 'git[[:space:]]+(commit|push)'; then
    echo "[ブロック] --no-verify は禁止です。pre-commit の検証をスキップしないでください。" >&2
    echo "検証が失敗する場合は原因を修正してからコミットしてください（正本: .cursorrules）。" >&2
    exit 2
  fi
fi
exit 0
