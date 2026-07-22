# .claude/ — Claude Code ハーネスの地図

dbml-editor のエージェントハーネス。入口は `CLAUDE.md`（正本は `AGENTS.md` と `.claude/**`）。

## 外部依存

- **jq**（hooks が JSON 解析に使用。未導入なら各 hook は graceful skip する）
- **pnpm**（パッケージマネージャ・統一）
- semble MCP（コード検索・第一選択）/ Svelte MCP（Svelte ドキュメント）

## ディレクトリ

| パス | 内容 | 数 |
|---|---|---|
| `rules/common/` | 横断規約の正本 | 10 |
| `rules/svelte/` `rules/typescript/` | スタック別規約 | 2 |
| `hooks/` | ガードレール（PreToolUse/PostToolUse） | 9 |
| `agents/` | subagent 定義（設計/レビューは Opus 4.8 high、実装/検査/公開は Sonnet 5 medium） | 14 |
| `commands/` | スラッシュコマンド（薄いエントリ） | 15 |
| `workflows/` | 各コマンドの詳細手順 | 6 |
| `skills/` | 知識モジュール（description 自動ロード） | 2 |
| `contexts/` | dev / research / review の3モード | 3 |
| `scripts/` | ミラー同期スクリプト | 1 |
| `settings.json` | hook 配線・permissions・env | — |

## hooks 一覧（機械防御）

| 分類 | hook |
|---|---|
| ブロック | block-no-verify, block-force-push, detect-secrets, pre-commit-ci |
| 警告 | config-protection, warn-console-log, warn-scope-creep, require-plan-for-large-task, post-edit-file-size |

## agents 一覧

planner, planner-deep, code-explorer, code-reviewer, security-reviewer, svelte-reviewer, database-reviewer, performance-optimizer, tdd-guide, build-error-resolver, code-simplifier, doc-updater, git-publisher, git-checkpoint

## 数のドリフト防止

- 上表の数は `/sync-claude-md`（`.claude/workflows/sync-claude-md.md`）で実装と突き合わせる
- ハーネス構成を変えたらこの README を同一コミットで更新する（正本: `.claude/rules/common/doc-sync.md`）
