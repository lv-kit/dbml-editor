# workflow: verify-task

`/verify-task` の詳細手順。**report を鵜呑みにせず、実 diff を正とする**（read-only）。

## 手順
1. `done/` のタスクファイルの引き継ぎノートを Read する
2. 実際の diff を取得する
   ```bash
   git diff --stat main...<branch>
   git diff main...<branch>
   ```
3. 突き合わせ（1項目ずつ）
   - 完了条件チェックリストの各項目を、**主張ではなく実 diff / 実テスト**で確認する
   - ノートが「変更した」と言う箇所が実 diff に存在するか
   - ノートに無い想定外の変更（スコープ逸脱）が diff に無いか
4. 検証は read-only。コードを書かない

## 判定
- **PASS**: 完了条件がすべて実 diff で裏付けられ、スコープ逸脱なし → 最終レビュー（reviewer）へ
- **FAIL**: 不足・逸脱・証拠不一致がある → `in-progress/` へ差し戻し、不足点を箇条書きで明記
  ```bash
  git mv .codex/tasks/done/TASK-XXX-*.md .codex/tasks/in-progress/
  ```

## 原則
- 「テストが通ったと書いてある」ではなく「テストを実際に確認した」で判定する
