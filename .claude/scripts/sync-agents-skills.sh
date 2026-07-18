#!/bin/bash
# .claude/skills と .claude/commands を .agents/skills/ へミラーする（ツール非依存化）
# 編集の正本は常に .claude 側。.agents/skills は本スクリプトの出力であり直接編集しない。
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$ROOT"

SRC_SKILLS=".claude/skills"
SRC_CMDS=".claude/commands"
DST=".agents/skills"

mkdir -p "$DST"

# 1) skills を実体コピー（source-command-* を除いて一旦クリア）
find "$DST" -mindepth 1 -maxdepth 1 -type d ! -name 'source-command-*' -exec rm -rf {} +
if [ -d "$SRC_SKILLS" ]; then
  cp -R "$SRC_SKILLS"/. "$DST"/
fi

# 2) スラッシュコマンドを skill 形式へ再パッケージ
for cmd in "$SRC_CMDS"/*.md; do
  [ -e "$cmd" ] || continue
  name=$(basename "$cmd" .md)
  # description をフロントマターから抽出（無ければ既定文）
  desc=$(awk -F': ' '/^description:/{sub(/^description: /,""); print; exit}' "$cmd")
  [ -z "$desc" ] && desc="migrated source command ${name}"
  outdir="$DST/source-command-${name}"
  mkdir -p "$outdir"
  {
    echo "---"
    echo "name: source-command-${name}"
    echo "description: ${desc}"
    echo "---"
    echo ""
    echo "> migrated source command \`${name}\` を実行するよう求められたら、この skill を使う。"
    echo "> 正本は \`.claude/commands/${name}.md\`。以下はその埋め込み。"
    echo ""
    echo "---"
    echo ""
    cat "$cmd"
  } > "$outdir/SKILL.md"
done

echo "[sync] .agents/skills を更新しました（skills $(find "$SRC_SKILLS" -name SKILL.md 2>/dev/null | wc -l | tr -d ' ') 件 + source-command $(ls "$SRC_CMDS"/*.md 2>/dev/null | wc -l | tr -d ' ') 件）"
