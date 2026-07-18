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
1. in-progress のタスクファイルの「引き継ぎノート」に以下を追記する
   - 実際に変更した diff の要点（証拠として `git diff --stat`）
   - 実行した検証コマンドと結果
   - 完了条件チェックリストの充足状況（各項目に証拠の在り処）
   - 未対応・要確認事項
2. タスクを `in-progress/` から `done/` へ移動する
3. PR がある場合は PR URL を記載する

## 関連
pr → **handoff** →（管理セッション）verify-task
