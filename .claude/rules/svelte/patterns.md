---
paths:
  - "web/src/**/*.svelte"
  - "web/src/**/*.svelte.ts"
  - "dbml-studio/src/**/*.svelte"
  - "dbml-studio/src/**/*.svelte.ts"
  - "dbml-studio/src-tauri/**/*.rs"
---

# svelte/patterns（Svelte/SvelteKit 規約の正本）

> **正本**: Svelte 5 / SvelteKit 固有規約。共通規約・Svelte MCP の手順は `AGENTS.md`。

## Svelte 5

- **runes を使う**（`$state` / `$derived` / `$effect` / `$props`）。旧来の `export let` / reactive `$:` を新規に使わない

## SvelteKit

- サーバ専用処理は `+page.server.ts` / `+server.ts` / `src/lib/server/**` に置く（`.claude/rules/common/patterns.md`）
- ロード関数の戻り値・フォームアクションの入力は境界で検証する
- 環境変数は `$env/dynamic/private`（サーバ）/ `$env/static/public`（公開）を用途で使い分ける

## UI

- shadcn・Tailwind・色トークンは `AGENTS.md` の「Svelte と UI」節に従う（`components.json` 準拠）
- ダークモード対応を壊さない

## Tauri（dbml-studio/）

- Tauri 固有 API（`@tauri-apps/*`）はデスクトップアプリ内に閉じる。`web/` と共有する純粋ロジックへ持ち込まない
- ファイルシステム等のネイティブ機能は境界に寄せ、ドメインロジックは純粋関数に保つ
