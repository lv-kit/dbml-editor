# git-workflow（Git / ブランチ / PR 手順の正本）

> **正本**: ブランチ戦略・PR 手順・hook による防御。コミットメッセージ形式は `.cursorrules`。

## ブランチ戦略

- ベースブランチ: **`main`**（保護対象・force push 禁止）
- 作業ブランチ命名: **`<tool>/<topic>`**
  - `claude/<topic>` / `codex/<topic>` / `cursor/<topic>` / `copilot/<topic>`
  - `<topic>` は kebab-case で内容を表す（例: `claude/add-dbml-export`）
- `main` へ直接コミットしない。必ず作業ブランチを切る

## PR 手順

1. 作業ブランチで実装 → ローカル CI 相当（`.claude/rules/common/testing.md`）を通す
2. `/pr` でセルフレビュー付き PR 作成（base=`main` 固定）
3. **既存 PR がある場合は新規 PR を作らず、その head ブランチへ push する**
4. PR テンプレート（`.github/pull_request_template.md`）のレビュー観点を満たす

## hook による自動防御（Claude Code）

| hook | 防御内容 |
|---|---|
| `block-no-verify` | `git commit --no-verify` をブロック |
| `block-force-push` | `main` への force push をブロック |
| `pre-commit-ci` | `git commit` 前に lint/型検査を実行し、失敗ならコミット中止 |

詳細な hook 一覧は `.claude/README.md`。

## コミット粒度

- 1 コミット = 1 論理的変更。要件に無関係な整形・依存更新を混ぜない
- 変更したコード・テスト・設定の関係を追跡可能に保つ（正本 `.cursorrules`）
