# 環境変数と運用

## 環境変数（web/）

正本は `web/.env.example`。サーバコードは `$env/dynamic/private` から読む（`src/auth.ts` のみ Cloudflare Workers の `platform.env` を優先し、無ければ `$env/dynamic/private` にフォールバック）。

| 変数 | 必須 | 用途 | 未設定時の挙動 |
|---|---|---|---|
| `DATABASE_URL` | ○ | PostgreSQL 接続文字列（Drizzle / `postgres-js`） | 起動時に例外（`DATABASE_URL is not set`） |
| `AUTH_SECRET` | ○ | セッション JWT の HS256 署名鍵 | セッション発行・検証時に例外（`AUTH_SECRET is not set`） |
| `FIREBASE_API_KEY` | ○ | Firebase クライアント設定。**プロバイダ有効判定の前提条件** | 全ログイン方法が無効になり、ログイン画面は「ログイン方法が設定されていません」を表示 |
| `FIREBASE_AUTH_DOMAIN` | ○ | Firebase クライアント設定 | 空文字として渡り Firebase 初期化が失敗する |
| `FIREBASE_PROJECT_ID` | ○ | クライアント設定 ＋ **ID トークン検証の issuer / audience** | ID トークン検証時に例外（`FIREBASE_PROJECT_ID is not set`） |
| `FIREBASE_APP_ID` | ○ | Firebase クライアント設定 | 空文字として渡る |
| `FIREBASE_GOOGLE_ENABLED` | — | Google ログインの有効化 | 既定で有効（`'false'` のときのみ無効） |
| `FIREBASE_MICROSOFT_ENABLED` | — | Microsoft ログインの有効化 | 既定で無効（`'true'` のときのみ有効） |
| `FIREBASE_EMAIL_ENABLED` | — | メールリンクログインの有効化 | 既定で有効（`'false'` のときのみ無効） |

`AUTH_SECRET` は十分な長さのランダム文字列を使う。環境変数を追加・変更したら `web/.env.example` を同一コミットで更新する（`.claude/rules/common/doc-sync.md`）。

秘密情報をコードに直書きしないこと。`.env*` の読み取りは permissions.deny で禁止されている。

`dbml-studio/` に環境変数はない。

## ローカル実行

### web/

```bash
pnpm install
pnpm run dev
```

DB のみ Docker で起動する場合:

```bash
pnpm run db:start
```

`web/compose.yaml` は `db`（PostgreSQL、`root` / `mysecretpassword` / `local`、ポートは `POSTGRES_PORT` 既定 5432）と `web`（`Dockerfile` から build、5173 を公開、`DATABASE_URL` はコンテナ内 `db` を指す）を定義する。

`web/` を変更したときはコンテナ内検証を行う（`AGENTS.md`）:

```bash
docker compose up --build
```

### dbml-studio/

```bash
pnpm install
pnpm run tauri:dev
```

## 検証コマンド

| 領域 | 型/静的検査 | Lint / 整形 | テスト |
|---|---|---|---|
| `web/` | `pnpm run check` | `pnpm run lint` / `pnpm run format` | `pnpm run test:unit --run` / `pnpm run test:e2e` / `pnpm run test`（両方） |
| `dbml-studio/` | `pnpm run check` | web の Prettier 設定に準拠 | `pnpm run test` |

コード変更後は **対象テスト → `pnpm run check` → `pnpm run lint` → 全テスト** をすべて通す。UI を変更した場合は日本語フォントを確認したうえで Playwright のスクリーンショットを撮る。

### テスト構成（web/）

Vitest は3プロジェクトに分かれる（`web/vite.config.ts`）。アサーションが1つもないテストは失敗する（`expect.requireAssertions`）。

| プロジェクト | 対象 | 実行環境 |
|---|---|---|
| `client` | `src/**/*.svelte.{test,spec}.{js,ts}`（`src/lib/server/**` を除外） | Playwright Chromium（headless） |
| `server` | `src/**/*.{test,spec}.{js,ts}`（`*.svelte.*` を除外） | Node |
| `storybook` | `.storybook` の設定に基づくストーリー | Playwright Chromium（headless） |

E2E は Playwright（`**/*.e2e.{ts,js}`）。`pnpm run build && pnpm run preview`（`wrangler dev`、port 4173）を webServer として起動する。

既存のユニットテスト対象: `dbml-validator`、`members`、`file-system`、`dbml-diagram-parser`、`dbml-diagram-layout`、`DbmlDiagram.svelte`、`server/services/organization`。

## ビルド・デプロイ

| 対象 | コマンド |
|---|---|
| web ビルド | `pnpm run build`（出力 `.svelte-kit/cloudflare/`） |
| web ローカルプレビュー | `pnpm run preview`（`wrangler dev`、port 4173） |
| Cloudflare 型生成 | `pnpm run gen`（`wrangler types`） |
| studio ビルド | `pnpm run tauri:build` / `tauri:build:mac`（`.app`）/ `tauri:build:windows`（`nsis`, `msi`） |
| Storybook | `pnpm run storybook`（port 6006）/ `pnpm run build-storybook` |

`wrangler deploy` は permissions.deny で防御されている。デプロイは人間の承認を経て実施する。

## Git 運用

ベースブランチは `main`（保護対象）。作業ブランチは `<tool>/<topic>`。詳細は `.claude/rules/common/git-workflow.md`。
