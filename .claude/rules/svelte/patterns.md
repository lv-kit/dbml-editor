# svelte/patterns（Svelte/SvelteKit 規約の正本）

> **正本**: Svelte 5 / SvelteKit のコーディングとUI規約。共通の責務分割は `AGENTS.md`。

## Svelte 5

- **runes を使う**（`$state` / `$derived` / `$effect` / `$props`）。旧来の `export let` / reactive `$:` を新規に使わない
- コンポーネントは表示・入力・状態・外部連携を混在させすぎない。独立してテストできるロジックは `.ts` へ分離する
- Svelte コードを書いたら **Svelte MCP の `svelte-autofixer` を問題がなくなるまで実行**する
- 新規 API 利用前に Svelte MCP（`list-sections` → `get-documentation`）で公式ドキュメントを確認する

## SvelteKit

- サーバ専用処理は `+page.server.ts` / `+server.ts` / `src/lib/server/**` に置く（`.claude/rules/common/patterns.md`）
- ロード関数の戻り値・フォームアクションの入力は境界で検証する
- 環境変数は `$env/dynamic/private`（サーバ）/ `$env/static/public`（公開）を用途で使い分ける

## UI

- **shadcn コンポーネントを優先**、Tailwind CSS で構成する（`components.json` 準拠）
- 色は既存トークンを再利用し、コントラストを確保する。独自スタイルをむやみに増やさない
- ダークモード対応を壊さない

## Tauri（dbml-studio/）

- Tauri 固有 API（`@tauri-apps/*`）はデスクトップアプリ内に閉じる。`web/` と共有する純粋ロジックへ持ち込まない
- ファイルシステム等のネイティブ機能は境界に寄せ、ドメインロジックは純粋関数に保つ
