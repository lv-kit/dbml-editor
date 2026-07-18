# .codex/ — 管理セッション（read-only）

管理セッション（Codex）はコードを書かない。**タスク分解・プロンプト生成・完了検証**のみを行い、実装は実装セッション（Claude Code）へタスクキュー経由で委譲する。

## 正本はどこか

- 実装規約の正本は **`AGENTS.md`** と **`.claude/**`**。このディレクトリはそれらを再掲しない
- 管理系エージェント・プロンプト・タスクキューの定義のみをここに置く

## ディレクトリ地図

| パス | 内容 |
|---|---|
| `config.toml` | Codex 起動設定（sandbox=read-only・MCP・マルチエージェント登録） |
| `AGENTS.md` | 管理セッション起動時の方針と Claude 環境マップ |
| `agents/*.toml` | 管理系エージェント5種 |
| `prompts/*.md` | 実装セッションへ渡すプロンプトテンプレート（正本: `prompts/prompt-design-guide.md`） |
| `workflows/*.md` | issue→PR 標準フロー等 |
| `tasks/` | タスクキュー（backlog → in-progress → done） |
| `scripts/context-package.sh` | 現状スナップショット生成（セッション冒頭に貼る） |

## 基本フロー

```
context-package.sh で現状収集
 → task-planner でタスク分解 → prompt-designer でプロンプト生成
 → tasks/backlog/TASK-XXX.md 保存
 →（実装セッション）/take-task → 実装 → /handoff → done
 → /verify-task（引き継ぎノートの主張と実 git diff を read-only 照合）
    ├ PASS → reviewer で最終レビュー
    └ FAIL → in-progress へ差し戻し
```

## 検証原則

- **report を鵜呑みにせず、実 diff を正とする。**
