---
name: source-command-take-task
description: backlog のタスクを1つ受け取り in-progress へ移して着手する（詳細 workflows/take-task.md）
---

> migrated source command `take-task` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/take-task.md`。以下はその埋め込み。

---

---
description: backlog のタスクを1つ受け取り in-progress へ移して着手する（詳細 workflows/take-task.md）
argument-hint: "[TASK-番号]"
---
# /take-task

管理セッションが `.codex/tasks/backlog/` に置いたタスクを受け取る。詳細は `.claude/workflows/take-task.md`。

## 手順
1. `$ARGUMENTS`（無指定なら backlog の先頭）のタスクファイルを読む
2. `.codex/tasks/backlog/` から `.codex/tasks/in-progress/` へ移動する
3. タスクの「触ってよい/いけない範囲・完了条件」を確認し、`/plan` へ進む

## 関連
**take-task** → plan → tdd → ci-all → pr → handoff
