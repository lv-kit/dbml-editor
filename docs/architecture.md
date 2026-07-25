# アーキテクチャ

## 技術スタック

### web/

| 領域 | 採用 |
|---|---|
| フレームワーク | SvelteKit 2 / Svelte 5（runes 強制: `svelte.config.js` の `dynamicCompileOptions`） |
| 実行環境 | Cloudflare Workers（`@sveltejs/adapter-cloudflare`、`wrangler.jsonc`） |
| DB | PostgreSQL + Drizzle ORM（`postgres-js` ドライバ） |
| 認証 | Firebase Authentication（クライアント SDK）+ 自前セッション JWT（`jose`） |
| UI | Tailwind CSS 4 + shadcn（`components.json`）、`bits-ui`、`tailwind-variants` |
| エディタ | CodeMirror 6 |
| DBML | `@dbml/core` |
| i18n | Paraglide（`@inlang/paraglide-js`、`en` / `es` / `ja`） |
| テスト | Vitest（client/server/storybook の3プロジェクト）、Playwright、Storybook |

### dbml-studio/

| 領域 | 採用 |
|---|---|
| フレームワーク | SvelteKit 2 / Svelte 5、`@sveltejs/adapter-static`（SPA、`ssr = false`） |
| デスクトップ | Tauri 2（Rust） |
| Tauri プラグイン | `dialog` / `fs` / `opener` |
| UI | Tailwind CSS 4 + shadcn、`@lucide/svelte` |
| エディタ / DBML | CodeMirror 6、`@dbml/core` |
| i18n | 自前実装（`src/lib/i18n.ts`） |
| テスト | Vitest（`pnpm run test`） |

パッケージマネージャは **pnpm に統一**（両アプリ `pnpm@11.2.2`）。

## web/ の層構造

| 層 | 場所 | 責務 |
|---|---|---|
| ルート/UI | `src/routes/**/+page.svelte`, `src/lib/components/` | 表示・入力のみ |
| サーバロード/アクション | `+page.server.ts` / `+server.ts` | 認可判定・データ取得・変換 |
| サーバ専用 | `src/lib/server/**` | DB クライアント、Firebase ID トークン検証、セッション、組織サービス |
| 純粋ドメイン | `src/lib/*.ts` | `dbml-validator` / `members` / `file-system` / `keyboard` |

- 認可判定と DB アクセスはすべてサーバ側。クライアントコードは `$lib/server/**` を import しない
- `src/lib/members.ts` はロール判定の純粋関数のみで、サーバ・クライアント双方から参照される（権限の最終判定はサーバのアクション内で行う）
- 組織サービス（`src/lib/server/services/organization.ts`）は `OrganizationRepository` インタフェースを介してドメインロジックを DB から分離し、ユニットテスト可能にしている

## リクエストの流れ（web/）

1. `src/hooks.ts` の `reroute` が Paraglide の `deLocalizeUrl` でロケール接頭辞を除去
2. `src/hooks.server.ts` の `handleSession` が `session` Cookie を検証して `event.locals.session` を設定（不正・不在なら `null`）
3. 続く `handleParaglide` がロケールを解決し、`%paraglide.lang%` / `%paraglide.dir%` を HTML へ差し込む
4. 各 `+page.server.ts` が `locals.session` を起点に認証・認可を判定

`App.Locals.session` の型は `SessionPayload`（`src/app.d.ts`）。

## 環境変数の参照方法

サーバコードは `$env/dynamic/private` を使う。`src/auth.ts` のみ **Cloudflare Workers の `platform.env` を優先** し、無ければ `$env/dynamic/private` にフォールバックする（`resolveEnv`）。

## ビルド・デプロイ

| 対象 | コマンド | 出力 |
|---|---|---|
| web 開発 | `pnpm run dev`（`web/`） | Vite dev server |
| web ビルド | `pnpm run build` | `.svelte-kit/cloudflare/` |
| web プレビュー | `pnpm run preview` | `wrangler dev`（port 4173） |
| studio 開発 | `pnpm run tauri:dev` | Tauri devUrl `http://localhost:1420` |
| studio ビルド | `pnpm run tauri:build`（`:mac` / `:windows` あり） | Tauri バンドル |

Cloudflare Workers 設定（`wrangler.jsonc`）: worker 名 `dblm`、`compatibility_date` `2026-03-19`、`compatibility_flags` に `nodejs_als`、静的アセットは `ASSETS` バインディング。

> `wrangler deploy` および `drizzle-kit push` / `migrate` は hook / permissions.deny で防御されている（`.claude/rules/common/security.md`）。
