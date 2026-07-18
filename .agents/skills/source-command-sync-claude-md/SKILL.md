---
name: source-command-sync-claude-md
description: 実装とハーネス文書のドリフトを検出して同期する（詳細 workflows/sync-claude-md.md）
---

> migrated source command `sync-claude-md` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/sync-claude-md.md`。以下はその埋め込み。

---

---
description: 実装とハーネス文書のドリフトを検出して同期する（詳細 workflows/sync-claude-md.md）
---
# /sync-claude-md

CLAUDE.md / AGENTS.md / .claude/README.md と実装（hooks/agents/commands 数、パス参照）の乖離を検出する。詳細は `.claude/workflows/sync-claude-md.md`。

## 手順
1. `.claude/{hooks,agents,commands,workflows}` の実ファイル数を数える
2. `.claude/README.md` の記載数と突き合わせ、差分を報告する
3. CLAUDE.md / rules が参照するパスが実在するか確認する（デッドリンク検出）
4. 乖離があれば `doc-updater` で同期する

## 実行タイミング
- 大規模リファクタ・依存更新後、ハーネス構成変更後
