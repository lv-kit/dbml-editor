---
description: 引き継ぎノートの主張と実 git diff を read-only 照合する（詳細 workflows/verify-task.md）
argument-hint: "[TASK-番号]"
---
# /verify-task

管理セッション用。**report を鵜呑みにせず、実 diff を正とする**検証。詳細は `.claude/workflows/verify-task.md`。

## 手順
1. `done/` のタスクファイルの引き継ぎノートを読む
2. 実際の `git diff`（該当ブランチ/PR）と突き合わせる
3. 完了条件チェックリストを1項目ずつ実 diff で確認する
4. 判定:
   - **PASS** → reviewer と変更内容に応じた専門 reviewer で最終レビューへ
   - **FAIL** → `in-progress/` へ差し戻し、不足点を明記

## 関連
handoff → **verify-task** →（PASS）汎用+専門 final review /（FAIL）差し戻し
