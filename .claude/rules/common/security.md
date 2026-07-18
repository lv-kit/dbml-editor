# security（セキュリティの正本）

> **正本**: コミット前セキュリティチェックリストと hook 自動防御の対応表。
> 認証実装の詳細は該当コード（`web/src/auth.ts` / `hooks.server.ts` / `lib/server/session.ts`）を Read。

## コミット前チェックリスト

- [ ] 秘密情報（APIキー・パスワード・トークン）をコードに直書きしていない。必ず `$env/dynamic/private` 等の env 経由
- [ ] クライアントから DB・秘密情報・認可判定へ直接アクセスしていない（サーバ処理は `lib/server/` / `+page.server.ts` / `+server.ts`）
- [ ] 外部入力（フォーム・イベント・API）を `unknown` として検証してから型を絞っている
- [ ] SQL は Drizzle 経由。文字列連結でクエリを組み立てていない（SQLインジェクション対策）
- [ ] ユーザー入力を DOM へ入れる箇所で XSS を防いでいる（`{@html}` の未検証利用禁止）
- [ ] 認可: ロール別に「許可／拒否／管理者」の3系統をテストしている

## hook による自動防御 対応表

| hook | 防御内容 |
|---|---|
| `detect-secrets` | `password=` / `api_key=` 等のハードコードを Edit/Write 時にブロック（env 参照は許可） |
| `config-protection` | linter/formatter 設定変更を警告 |
| permissions.deny | `.env*` の Read 禁止、`wrangler deploy` / `drizzle-kit push,migrate` 等の破壊的操作を拒否 |

## 認証・認可（このプロジェクト固有）

- 認証は Firebase（`web/src/auth.ts`, `lib/server/firebase-auth.ts`）。プロバイダ可用性は env 依存
- セッションは `lib/server/session.ts`。クッキー/セッションの検証を経ない保護リソースアクセスを作らない
- 認可変更を伴う PR は `security-reviewer` エージェントでロール別網羅を確認する
