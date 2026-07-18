---
name: dbml-editor-usage-guide
description: dbml-editor のエージェントハーネス早見表。コマンド/エージェント/ワークフロー鎖・正本の所在・検証コマンドをまとめる。「どのコマンドを使う」「ハーネスの使い方」「正本はどこ」を問われたらロードする。個別のコード実装そのものにはトリガしない。
---

> ## ⚠️ dbml-editor 固有ガイダンス（最優先）
> - 正本の向き: **実装規約は `AGENTS.md`**、コミット規約は `.cursorrules`、詳細規約は `.claude/rules/**`
> - パッケージマネージャは **pnpm 統一**。npm/bun/yarn 禁止
> - `web/`（SvelteKit+Cloudflare Workers）と `dbml-studio/`（SvelteKit+Tauri）は独立プロジェクト

## コマンド早見表

| 目的 | コマンド | 委譲先 |
|---|---|---|
| 計画（小） | `/plan` | planner |
| 計画（横断/アーキ） | `/plan-deep` | planner-deep(Opus) |
| 実装 | `/tdd` | tdd-guide |
| 検証一括 | `/ci-all` | — |
| 検証エラー解消 | `/build-fix` | build-error-resolver |
| レビュー | `/code-review` `/security-review` `/db-review` | 各 reviewer |
| タスク受け渡し | `/take-task` `/handoff` `/verify-task` `/task-status` | タスクキュー |
| PR | `/pr`（base=main・要承認） | — |
| 運用 | `/checkpoint` `/sync-claude-md` | — |

## ワークフロー鎖

```
take-task → plan → tdd → ci-all → code-review →（security/db review）→ pr → handoff
                                                          ↑（管理セッション）verify-task
```

## 検証コマンド

| 領域 | 検証 |
|---|---|
| web/ | `pnpm run check` → `pnpm run lint` → `pnpm run test:unit --run`（UI変更時 `test:e2e`） |
| dbml-studio/ | `pnpm run check` → `pnpm run test` |

## 正本の所在

| 領域 | 正本 |
|---|---|
| 実装規約 | `AGENTS.md` |
| コミット規約 | `.cursorrules` |
| Git/PR | `.claude/rules/common/git-workflow.md` |
| セキュリティ | `.claude/rules/common/security.md` |
| トークン最適化 | `.claude/rules/common/claude-code-usage.md` |
| ハーネス全体地図 | `.claude/README.md` |
