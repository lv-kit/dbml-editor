# .codex/ — 管理セッション（read-only）

管理セッション（Codex）は自身でコードを書かない。**タスク分解・プロンプト生成・完了検証**を行い、実装と Git 公開は登録済みの専用 agent（Codex `implementer` / `git-publisher` または Claude Code 側 agent）へ委譲する。

## 正本はどこか

- 実装規約の正本は **`AGENTS.md`** と **`.claude/**`**。このディレクトリはそれらを再掲しない
- 管理系エージェント・プロンプト・タスクキューの定義のみをここに置く

## ディレクトリ地図

| パス | 内容 |
|---|---|
| `config.toml` | Codex 起動設定（sandbox=read-only・MCP・マルチエージェント登録） |
| `AGENTS.md` | 管理セッション起動時の方針と Claude 環境マップ |
| `agents/*.toml` | 管理系5種 + 実装/公開専用2種 + 専門レビュー2種 |
| `prompts/*.md` | 実装セッションへ渡すプロンプトテンプレート（正本: `prompts/prompt-design-guide.md`） |
| `workflows/*.md` | issue→PR 標準フロー等 |
| `tasks/` | タスクキュー（backlog → in-progress → done） |
| `scripts/context-package.sh` | 現状スナップショット生成（セッション冒頭に貼る） |

## 基本フロー

```
context-package.sh で現状収集
 → task-planner でタスク分解 → prompt-designer でプロンプト生成
 → tasks/backlog/TASK-XXX.md 保存
 → implementer（または Claude Code /take-task）で実装 → reviewer / 専門 reviewer
 → 指摘ゼロまで修正・再検査・再レビュー → /handoff
 → git-publisher（commit/push/PR）→ done
 → /verify-task（引き継ぎノートの主張と実 git diff を read-only 照合）
    ├ PASS → reviewer と必要な専門 reviewer で最終レビュー
    └ FAIL → in-progress へ差し戻し
```

## モデル割り当て

- 設計・計画・セルフレビュー: `gpt-5.6-sol`, `model_reasoning_effort = "high"`
- 調査・実装・Git 公開: `gpt-5.6-terra`, `model_reasoning_effort = "medium"`
- 管理セッション自身は read-only。実装は `implementer`、commit/push/PR は `git-publisher` に委譲する
- Codex 側の専門レビューは `security-auditor`、`svelte-reviewer`、`database-reviewer` を変更内容に応じて使い分ける

## 検証原則

- **report を鵜呑みにせず、実 diff を正とする。**
