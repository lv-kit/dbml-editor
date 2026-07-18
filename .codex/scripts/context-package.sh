#!/bin/bash
# 管理セッション冒頭に貼る現状スナップショットを read-only で生成する
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT"

echo "# コンテキストパッケージ（現状スナップショット）"
echo ""
echo "## Git"
echo '```'
echo "branch: $(git branch --show-current 2>/dev/null || echo '?')"
git status --short 2>/dev/null || true
echo "--- 直近コミット ---"
git log --oneline -8 2>/dev/null || true
echo '```'
echo ""

echo "## タスクキュー"
echo '```'
for d in backlog in-progress done; do
  n=$(find ".codex/tasks/$d" -maxdepth 1 -name 'TASK-*.md' 2>/dev/null | wc -l | tr -d ' ')
  echo "$d: $n 件"
  find ".codex/tasks/$d" -maxdepth 1 -name 'TASK-*.md' 2>/dev/null | sed 's#.*/#  - #'
done
echo '```'
echo ""

echo "## ハーネス構成（数）"
echo '```'
echo "hooks:     $(ls .claude/hooks/*.sh 2>/dev/null | wc -l | tr -d ' ')"
echo "agents:    $(ls .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "commands:  $(ls .claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "workflows: $(ls .claude/workflows/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "skills:    $(find .claude/skills -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
echo '```'
