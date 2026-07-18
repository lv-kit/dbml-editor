# tasks/ — タスクキュー

管理セッションと実装セッションを接続する3ステージのキュー。

## ステージ

| ステージ | 意味 | 誰が動かすか |
|---|---|---|
| `backlog/` | 未着手（管理セッションが投入） | task-planner / prompt-designer |
| `in-progress/` | 着手中 | 実装セッション（`/take-task` で移動） |
| `done/` | 実装完了・検証待ち | 実装セッション（`/handoff` で移動） |

- `/verify-task` が done を検証し、FAIL なら in-progress へ差し戻す

## 命名規則

- `TASK-<番号>-<kebab-case>.md`（例: `TASK-007-add-dbml-export.md`）
- 番号は既存の最大値+1（全ステージ横断で一意）

## テンプレート

- 新規タスクは `TASK-TEMPLATE.md` をコピーして作る
- テンプレートのセクションは実装セッションへ渡すプロンプトの**必須9要素**とほぼ1対1対応
