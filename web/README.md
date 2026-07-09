# DBML Editor

This is a tool that allows you to edit DBML using a visual editor. While it currently offers only basic functionality, we plan to expand it gradually, so we appreciate your support.

## 認証の設定

GitHub / Google / Microsoft (Entra ID) のOAuthログインに対応しています。起動前に以下の環境変数を設定してください。

- `AUTH_SECRET`（最低32文字程度のランダム文字列）
- `AUTH_TRUST_HOST`（Cloudflareなど非Vercel環境では `true` を推奨）
- `GITHUB_ID`, `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_ENTRA_ID_CLIENT_ID`, `MICROSOFT_ENTRA_ID_CLIENT_SECRET`
- `MICROSOFT_ENTRA_ID_TENANT`（任意、省略時は `common`）

コールバックURLは `/auth/callback/<provider>`（例: `/auth/callback/github`）を設定してください。

## 利用方法


```sh
# install dependencies package
npm install

npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
