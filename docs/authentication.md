# 認証とサインアップ

対象は `web/` のみ。`dbml-studio/` に認証はない。

## 方式

1. ブラウザで **Firebase Authentication** によりサインインし、ID トークンを取得する
2. ID トークンを `POST /api/session` へ送る
3. サーバが Firebase の公開鍵で ID トークンを検証し、**自前のセッション JWT** を発行して `session` Cookie に格納する
4. 以降のリクエストは `hooks.server.ts` がこの Cookie を検証し `locals.session` を設定する

Firebase Admin SDK は使わず、JWKS による検証のみを行う（Workers 実行環境のため）。

## ログインプロバイダ

| ID | 表示名 | 実装 | 有効条件 |
|---|---|---|---|
| `google` | Google | `signInWithPopup` + `GoogleAuthProvider` | `FIREBASE_API_KEY` があり、`FIREBASE_GOOGLE_ENABLED !== 'false'` |
| `microsoft` | Microsoft | `signInWithPopup` + `OAuthProvider('microsoft.com')` | `FIREBASE_API_KEY` があり、`FIREBASE_MICROSOFT_ENABLED === 'true'`（明示的オプトイン） |
| `email` | Email | `sendSignInLinkToEmail` → メールリンク | `FIREBASE_API_KEY` があり、`FIREBASE_EMAIL_ENABLED !== 'false'` |

判定は `web/src/auth.ts` の `getProviderAvailability()`。有効なプロバイダが1つもない場合、ログイン画面は「現在、ログイン方法が設定されていません。管理者に連絡してください。」と表示する。

Firebase クライアント設定（`apiKey` / `authDomain` / `projectId` / `appId`）はサーバのロード関数から `firebaseConfig` として渡す。未設定の値は空文字になる。

## メールリンクサインイン

- 送信時のリダイレクト先は `${window.location.origin}/login/email-callback`、`handleCodeInApp: true`
- 送信したメールアドレスは `localStorage` の `emailForSignIn` に保持する
- `/login/email-callback` でリンクを検証してサインインを完了し、成功後 `localStorage` から削除する
- **別デバイス・別ブラウザでリンクを開いた場合**（`emailForSignIn` が無い）はメールアドレス入力フォームを表示し、入力値でサインインを完了させる
- リンクが無効な場合は「無効なリンクです。再度ログインを試みてください。」を表示し、ログイン画面へのリンクを出す
- 完了後は `/signup` へ遷移する

## ID トークン検証（`src/lib/server/firebase-auth.ts`）

- JWKS: `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`（初回取得後キャッシュ）
- `issuer`: `https://securetoken.google.com/{FIREBASE_PROJECT_ID}`
- `audience`: `FIREBASE_PROJECT_ID`
- `FIREBASE_PROJECT_ID` 未設定なら例外
- `email` クレームが無い場合は拒否（`Token does not contain email`）
- **email は `trim().toLowerCase()` で正規化** して返す
- プロバイダは `firebase.sign_in_provider` から取得する
- `uid` は `sub` クレーム

## セッション（`src/lib/server/session.ts`）

| 項目 | 値 |
|---|---|
| Cookie 名 | `session` |
| 署名 | HS256、鍵は `AUTH_SECRET`（未設定なら例外） |
| 有効期間 | 7日（`60 * 60 * 24 * 7` 秒） |
| ペイロード | `uid`, `email`, `name?`, `provider?` |
| Cookie 属性 | `path=/`, `httpOnly`, `secure`, `sameSite=lax`, `maxAge=7日` |

検証に失敗した場合は例外を投げず `null` を返し、未認証として扱う。

## `/api/session` エンドポイント

| メソッド | 入力 | 正常時 | 異常時 |
|---|---|---|---|
| `POST` | JSON `{ idToken: string }` | `{ ok: true }` + `session` Cookie 設定 | JSON 不正: `400 Invalid request body` / `idToken` 欠落・非文字列: `400 idToken is required` / 検証失敗: `401 Invalid or expired token` |
| `DELETE` | — | `{ ok: true }` + Cookie 削除 | — |

## 画面遷移と認可（web/）

| ルート | 未認証 | 認証済み・ユーザー未登録 | 認証済み・ユーザー登録済み |
|---|---|---|---|
| `/` | → `/login` | → `/signup` | → `/projects` |
| `/login` | ログイン画面 | → `returnTo`（既定 `/signup`） | → `returnTo`（既定 `/signup`） |
| `/signup` | → `/login?returnTo=/signup` | 利用形態選択を表示 | → `/projects` |
| `/signup/organization` | → `/login?returnTo=<現在パス>` | 組織情報入力 | 同左 |
| `/signup/account` | → `/login?returnTo=<現在パス>` | アカウント情報入力 | 登録済み判定で → `/projects` |
| `/projects`, `/projects/[id]` | → `/login` | → `/signup` | 表示 |
| `/organizations`, `/organizations/new` | → `/login?returnTo=<現在パス>` | → `/signup`（一覧のみ） | 表示 |

「ユーザー登録済み」の判定は、セッションの email に一致し `deleted_at IS NULL` の `user` 行が存在すること。

### returnTo のオープンリダイレクト対策

`/login` の `returnTo` は `getSafeReturnTo()` で検証する。次のいずれかに該当する場合はフォールバック（`/signup`）を使う。

- `null` または `/` で始まらない
- `//` で始まる（プロトコル相対 URL）
- 解決後のオリジンがリクエストのオリジンと異なる
- URL としてパースできない

通過した場合も `pathname + search + hash` のみを使う。

## サインアップフロー

```
/signup（利用形態の選択）
├── 個人利用 → /signup/account?userType=personal
└── 法人利用 → /signup/organization → /signup/account?userType=corporate&organizationId=<id>
                                    → /projects
```

### `/signup/organization`（法人の組織作成）

- 入力: 組織名 `name`、スラッグ `slug`
- 検証: `name` 必須（trim 後非空）、`slug` 必須、`slug` は `/^[a-z0-9-]+$/`（半角英数字とハイフンのみ）
- エラーメッセージ: `組織名を入力してください` / `スラッグを入力してください` / `スラッグは半角英数字とハイフンのみ使用できます` / `組織の作成に失敗しました`(500)
- 成功時は `organization` を作成し、`/signup/account?userType=corporate&organizationId=<id>` へ

### `/signup/account`（ユーザー登録）

- 入力: 名前 `name`（フォーム）、`userType`・`organizationId`（hidden）
- **email はフォームからではなくセッションの値を正規化して使う**（画面上は読み取り専用で表示）
- 検証:
  - 未認証: `401 認証が必要です。再度ログインしてください。`
  - `name` 必須: `名前を入力してください`
  - `organizationId` は正の整数のみ: `無効な組織IDです`
  - 指定組織が存在しない: `指定された組織が見つかりません`
- ロール決定:
  - `organizationId` なし（個人）→ `member`（スキーマ既定値）
  - `organizationId` あり → その組織に `role='owner'` の生存ユーザーが既に居れば `member`、居なければ `owner`
- `authProvider` はセッションの `provider`（無ければ `'unknown'`）、`authProviderId` はセッションの `uid`
- 既に同 email のユーザーが存在する場合は作成せず `/projects` へ
- 作成失敗時は `500 アカウントの作成に失敗しました`
- 成功時は `/projects` へ

## ログアウト

`DELETE /api/session` で Cookie を削除する。専用のログアウト UI は現状用意していない（[known-gaps.md](known-gaps.md)）。
