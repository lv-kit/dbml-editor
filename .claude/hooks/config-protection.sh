#!/bin/bash
# PreToolUse/Edit|Write: linter/formatter/ビルド設定の変更を警告する（ブロックはしない）
set -euo pipefail
command -v jq >/dev/null 2>&1 || { echo "[Hook] jq required; skipping config-protection" >&2; exit 0; }

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
BASE=$(basename "$FILE")

case "$BASE" in
  eslint.config.js|.prettierrc|.prettierignore|tsconfig.json|svelte.config.js|vite.config.ts|vite.config.js|components.json|drizzle.config.ts|wrangler.jsonc|pnpm-workspace.yaml|package.json)
    echo "[警告] 設定ファイル '$BASE' を変更しようとしています。指示なく設定を緩和/変更していないか確認してください（AGENTS.md: スコープを超えない）。" >&2
    ;;
esac
exit 0
