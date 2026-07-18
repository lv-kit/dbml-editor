# dbml-editor — Gemini 入口

> **正本は `AGENTS.md` と `.claude/**`。** 本ファイルは薄い入口であり実装規約を再掲しない。

## 参照順（トークン節約）

1. まず `AGENTS.md`（実装ルールの正本）を読み、すべて遵守する
2. 変更対象に応じて `.claude/rules/**` の該当ファイルだけを読む
3. コミット規約は `.cursorrules`

## Svelte MCP（必須）

Svelte / SvelteKit の作業では、最初に `list-sections` を実行し、関連する全セクションを `get-documentation` で取得する。Svelte コードを書いたら `svelte-autofixer` を問題がなくなるまで実行する。プロジェクト内のファイルへ書いた場合は Playground link を生成しない。
