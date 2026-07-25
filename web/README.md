# DBML Editor

DBML をテキストと ER 図の双方向で編集する Web アプリ。SvelteKit + Cloudflare Workers で動作し、プロジェクト単位で DBML を PostgreSQL に保存する。

デスクトップ版は `../dbml-studio/`。仕様の正本は `../docs/` を参照する。

- 全体像: [../docs/overview.md](../docs/overview.md)
- 認証・サインアップ: [../docs/authentication.md](../docs/authentication.md)
- 組織とメンバー権限: [../docs/organizations-and-members.md](../docs/organizations-and-members.md)
- プロジェクトとファイル連携: [../docs/projects.md](../docs/projects.md)
- エディタ・ダイアグラム: [../docs/dbml-editor.md](../docs/dbml-editor.md)
- DB スキーマ: [../docs/schema.md](../docs/schema.md)

## 認証の設定

認証は **Firebase Authentication**（Google / Microsoft / メールリンク）で行う。ブラウザで取得した ID トークンを `POST /api/session` へ送り、サーバが検証して自前のセッション Cookie（HS256 JWT、7日間）を発行する。Firebase Admin SDK は使わず、JWKS による ID トークン検証のみを行う。

起動前に以下の環境変数を設定する（雛形は `.env.example`）。

必須:

- `DATABASE_URL` — PostgreSQL 接続文字列
- `AUTH_SECRET` — セッション JWT の署名鍵（十分な長さのランダム文字列）
- `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`

任意（ログイン方法の有効・無効）:

- `FIREBASE_GOOGLE_ENABLED` — 既定で有効。`false` のときのみ無効
- `FIREBASE_MICROSOFT_ENABLED` — 既定で無効。`true` のときのみ有効
- `FIREBASE_EMAIL_ENABLED` — 既定で有効。`false` のときのみ無効

いずれのログイン方法も `FIREBASE_API_KEY` が設定されていることが前提。有効なログイン方法が1つも無い場合、ログイン画面はその旨を表示する。

OAuth のリダイレクト URI は Firebase コンソール側で設定する。メールリンクのコールバックはアプリ内の `/login/email-callback` を使う。

## 利用方法

```sh
# install dependencies package
pnpm install

pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

DB だけを Docker で起動する場合は `pnpm run db:start`、アプリごとコンテナで検証する場合は `docker compose up --build` を使う。

## 検証

```sh
pnpm run check      # svelte-check + tsc
pnpm run lint       # prettier --check + eslint
pnpm run test:unit --run
pnpm run test:e2e
```

コマンドの一覧と環境変数の詳細は [../docs/environment-and-operations.md](../docs/environment-and-operations.md) を参照する。
