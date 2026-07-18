# patterns（採用アーキテクチャの正本）

> **正本**: 層構造と各層の責務・禁止事項。プロジェクト境界の原則は `AGENTS.md`。

## アプリ境界

| アプリ | 種別 | 実行環境 |
|---|---|---|
| `web/` | SvelteKit Web | Cloudflare Workers（wrangler）+ Drizzle + Firebase Auth |
| `dbml-studio/` | SvelteKit + Tauri | デスクトップ（Tauri src-tauri） |

- ブラウザ固有 / Tauri 固有 / サーバ固有の API を**共有モジュールに持ち込まない**
- 両アプリで同一ロジックを変更するときは、片方だけ直して仕様差分を作らない

## web/ の層構造

| 層 | 場所 | 責務 | 禁止 |
|---|---|---|---|
| ルート/UI | `src/routes/**/+page.svelte`, `src/lib/components/` | 表示・入力 | 認可判定・DB直アクセス |
| サーバロード/アクション | `+page.server.ts` / `+server.ts` | 認可・データ取得・変換 | 表示ロジック混在 |
| サーバ専用 | `src/lib/server/**`（db, services, session, firebase-auth） | DB・秘密情報・セッション | クライアントから import |
| 純粋ドメイン | `src/lib/*.ts`（dbml-validator, members, file-system 等） | 依存の少ない純粋ロジック | 副作用の埋め込み |

## DB（Drizzle）

- スキーマの正本は `web/src/lib/server/db/schema.ts`
- スキーマ変更は `drizzle-kit generate`（マイグレーション生成）を経る。`push` は開発時のみ、本番系へは hook/permissions で防御
- スキーマを変更したら `.claude/rules/common/doc-sync.md` に従い関連ドキュメントを同一コミットで更新

## Svelte/UI

- shadcn コンポーネントを優先、Tailwind で構成。色は既存トークンを再利用（詳細 `.claude/rules/svelte/patterns.md`）
