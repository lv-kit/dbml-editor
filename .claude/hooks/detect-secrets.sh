#!/bin/bash
# PreToolUse/Edit|Write: 秘密情報のハードコードを検出しブロックする（env 参照は許可）
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping detect-secrets" >&2; exit 0; }

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
# Write は content、Edit は new_string を対象にする
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

# .env.example やドキュメントは対象外
case "$FILE" in
  *.env.example|*.md|*.mdx) exit 0 ;;
esac

# key = "literal value" 形式のハードコードを検出。env 参照/プレースホルダは許可
# 対象キー: password / passwd / api_key / apikey / secret / token / private_key
SUSPECT=$(echo "$CONTENT" | grep -Eni \
  '(password|passwd|api[_-]?key|secret|token|private[_-]?key)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{6,}' \
  || true)

if [ -n "$SUSPECT" ]; then
  # env 経由（process.env / $env / import.meta.env / getenv / placeholder）は許可
  FILTERED=$(echo "$SUSPECT" | grep -Eiv \
    'process\.env|import\.meta\.env|\$env|getenv|os\.environ|\{\{|<|xxx|placeholder|example|your[_-]|change[_-]?me|\.\.\.' \
    || true)
  if [ -n "$FILTERED" ]; then
    echo "[ブロック] 秘密情報のハードコードが疑われます:" >&2
    echo "$FILTERED" | sed 's/^/  /' >&2
    echo "env 経由（\$env/dynamic/private 等）で参照してください（正本: .claude/rules/common/security.md）。" >&2
    exit 2
  fi
fi
exit 0
