# workflow: sync-claude-md

`/sync-claude-md` の詳細手順。実装とハーネス文書のドリフトを検出する。

## 手順
1. 実ファイル数を数える
   ```bash
   ls .claude/hooks/*.sh    | wc -l
   ls .claude/agents/*.md   | wc -l
   ls .claude/commands/*.md | wc -l
   ls .claude/workflows/*.md| wc -l
   ```
2. `.claude/README.md` の記載数と突き合わせ、差分を報告する
3. デッドリンク検出（CLAUDE.md / rules / commands / workflows / agents が参照するパスの実在確認）
   ```bash
   grep -rhoE '\.claude/[A-Za-z0-9_./-]+' CLAUDE.md AGENTS.md .cursorrules .claude \
     | sort -u | while read -r p; do [ -e "$p" ] || echo "MISSING: $p"; done
   ```
4. 乖離があれば `doc-updater` エージェントで `.claude/README.md` を同期する

## 実行タイミング
- ハーネス構成変更後 / 大規模リファクタ後 / 依存更新後

## 背景
- ドキュメント記載の数と実装がずれる（ドリフト）実績があるため、この同期機構を用意している
