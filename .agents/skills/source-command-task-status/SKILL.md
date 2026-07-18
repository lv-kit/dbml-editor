---
name: source-command-task-status
description: タスクキュー(backlog/in-progress/done)の状況を一覧する
---

> migrated source command `task-status` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/task-status.md`。以下はその埋め込み。

---

---
description: タスクキュー(backlog/in-progress/done)の状況を一覧する
---
# /task-status

`.codex/tasks/` の3ステージの状況を表示する。

## 手順
1. `.codex/tasks/{backlog,in-progress,done}/` のタスクファイルを列挙する
2. 各ステージの件数とタスク名を表で示す

## 出力
```
| ステージ | 件数 | タスク |
| backlog | n | TASK-... |
| in-progress | n | ... |
| done | n | ... |
```
