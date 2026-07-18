#!/bin/bash
# PreToolUse/Bash: 保護ブランチ(main)への force push をブロックする
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping block-force-push" >&2; exit 0; }

PROTECTED="main"

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git push かつ force 指定かどうか
if echo "$CMD" | grep -Eq 'git[[:space:]]+push' && echo "$CMD" | grep -Eq -- '--force([^-]|$)|--force-with-lease|(^|[[:space:]])-f([[:space:]]|$)'; then
  if echo "$CMD" | grep -Eq "(^|[[:space:]:/])${PROTECTED}([[:space:]]|$)" || echo "$CMD" | grep -Eq "HEAD:${PROTECTED}"; then
    echo "[ブロック] 保護ブランチ '${PROTECTED}' への force push は禁止です。" >&2
    echo "作業ブランチ (<tool>/<topic>) へ push し、PR 経由で反映してください（正本: .claude/rules/common/git-workflow.md）。" >&2
    exit 2
  fi
fi
exit 0
