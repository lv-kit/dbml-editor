# git-workflow（Git / ブランチ / PR 手順の正本）

> **正本**: ブランチ戦略・PR 手順・hook による防御。コミットメッセージ形式は `.cursorrules`。

## ブランチ戦略

- ベースブランチ: **`main`**（保護対象・force push 禁止）
- 作業ブランチ命名: **`<tool>/<topic>`**
  - `claude/<topic>` / `codex/<topic>` / `cursor/<topic>` / `copilot/<topic>`
  - `<topic>` は kebab-case で内容を表す（例: `claude/add-dbml-export`）
- 現在のブランチが `main` の場合は直接コミットせず、候補名と派生元・理由を人間へ示して確認を得る。確認前に作成・切替しない
- 既存の適切な作業ブランチ上ではブランチを増やさず、そのブランチを継続する

## PR 手順

1. 作業ブランチで実装 → ローカル CI 相当（`.claude/rules/common/testing.md`）を通す
2. 汎用 reviewer と変更領域に応じた専門 reviewer を実差分へ実行する
3. 指摘があれば修正 → 影響検査 → 同じ reviewer で再レビューを、指摘ゼロまで繰り返す
4. `/pr` から専用 `git-publisher` に委譲する（base=`main` 固定）
5. **既存 PR がある場合は新規 PR を作らず、その head ブランチへ push して更新する**
6. PR テンプレート（`.github/pull_request_template.md`）のレビュー観点を満たす

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
- commit/push/PR は `git-publisher` 専用 agent が担当する。push と新規 PR は外部反映前に人間の承認を得る
