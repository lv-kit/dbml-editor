---
name: source-command-handoff
description: 実装完了を引き継ぎノートに記録し、タスクを done へ移す（詳細 workflows/handoff.md）
---

> migrated source command `handoff` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/handoff.md`。以下はその埋め込み。

---

---
description: 実装完了を引き継ぎノートに記録し、タスクを done へ移す（詳細 workflows/handoff.md）
---
# /handoff

実装セッションの成果を管理セッションへ引き継ぐ。詳細は `.claude/workflows/handoff.md`。

## 手順
1. handoff 前に `/code-review` と変更内容に応じた専門 reviewer を実差分へ実行する
2. 指摘があれば修正し、影響する検査を再実行して同じ reviewer を再実行する。すべての reviewer の指摘がゼロになるまで次へ進まない
3. in-progress のタスクファイルの「引き継ぎノート」に以下を追記する
   - 実際に変更した diff の要点（証拠として `git diff --stat`）
   - 実行した検証コマンドと結果
   - 完了条件チェックリストの充足状況（各項目に証拠の在り処）
   - 未対応・要確認事項
4. タスクを `in-progress/` から `done/` へ移動する
5. PR がある場合は PR URL を記載する

## 関連
review → **handoff** → pr/git-publisher →（管理セッション）verify-task
