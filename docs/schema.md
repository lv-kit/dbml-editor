# データベーススキーマ

正本は `web/src/lib/server/db/schema.ts`（Drizzle）。PostgreSQL。マイグレーションは `web/drizzle/`。

`dbml-studio/` は DB を持たない。

## テーブル

### `organization`

| カラム | 型 | 制約 |
|---|---|---|
| `id` | `serial` | PK |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE |
| `created_at` | `timestamp` | NOT NULL, DEFAULT `now()` |
| `deleted_at` | `timestamp` | NULL 可（論理削除） |

`slug` は `/^[a-z0-9-]+$/`（半角英数字とハイフン）のみを受け付ける（アプリ層の検証）。

### `user`

| カラム | 型 | 制約 |
|---|---|---|
| `id` | `serial` | PK |
| `name` | `text` | NOT NULL |
| `email` | `text` | NOT NULL（一意性は下記の部分ユニークインデックスで担保） |
| `user_type` | `text` | NOT NULL |
| `role` | `text` | NOT NULL, DEFAULT `'member'` |
| `organization_id` | `integer` | FK → `organization.id`、NULL 可 |
| `auth_provider` | `text` | NULL 可 |
| `auth_provider_id` | `text` | NULL 可 |
| `created_at` | `timestamp` | NOT NULL, DEFAULT `now()` |
| `deleted_at` | `timestamp` | NULL 可（論理削除） |

制約と運用ルール:

- `email` は保存前に `trim().toLowerCase()` で正規化する。照合も `lower(email)` で行う
- 一意性は部分ユニークインデックス `user_email_active_unique`（`lower(email)` かつ `deleted_at IS NULL`）で担保する。論理削除済みの行とは重複できるため、削除後に同じメールで再登録・再追加できる
- マイグレーション `0001` の適用前に、未削除行の重複が無いことを確認する: `SELECT lower(email), count(*) FROM "user" WHERE deleted_at IS NULL GROUP BY 1 HAVING count(*) > 1;`（1行でも返ると `CREATE UNIQUE INDEX` が失敗する）
- インデックス: `user_organization_id_idx`（`organization_id`）、`project_user_id_idx`（`project.user_id`）
- `user_type` の値は `'personal'`（個人利用）または `'corporate'`（法人利用）。DB 制約ではなくアプリ層の取り扱い
- `role` の値は `'owner'` / `'admin'` / `'member'`。DB 制約ではなくアプリ層で検証する（[organizations-and-members.md](organizations-and-members.md)）
- `organization_id` が NULL なら組織未所属。**1ユーザーは最大1組織**
- `auth_provider` は Firebase の `sign_in_provider`（不明時は `'unknown'`）、`auth_provider_id` は Firebase の `uid`。メンバー管理画面から追加されたユーザーは両方 NULL
- `deleted_at` が非 NULL の行は全クエリで除外する（`isNull(user.deletedAt)`）

### `project`

| カラム | 型 | 制約 |
|---|---|---|
| `id` | `serial` | PK |
| `name` | `text` | NOT NULL |
| `dbml_content` | `text` | NOT NULL, DEFAULT `''` |
| `user_id` | `integer` | NOT NULL, FK → `user.id` |
| `created_at` | `timestamp` | NOT NULL, DEFAULT `now()` |
| `updated_at` | `timestamp` | NOT NULL, DEFAULT `now()` |
| `deleted_at` | `timestamp` | NULL 可（論理削除） |

- `dbml_content` は DBML テキストそのもの。**DB 層・サーバ層では DBML の妥当性を検証しない**（不正な DBML も保存できる）
- `updated_at` は保存アクションで明示的に更新する（DB トリガはない）
- 所有はユーザー単位。組織単位の共有カラムはない

### `task`

| カラム | 型 | 制約 |
|---|---|---|
| `id` | `serial` | PK |
| `title` | `text` | NOT NULL |
| `priority` | `integer` | NOT NULL, DEFAULT `1` |

SvelteKit テンプレート由来で、アプリコードから参照していない（[known-gaps.md](known-gaps.md)）。

## 外部キー

| 参照元 | 参照先 | ON DELETE / ON UPDATE |
|---|---|---|
| `project.user_id` | `user.id` | NO ACTION / NO ACTION |
| `user.organization_id` | `organization.id` | NO ACTION / NO ACTION |

外部キーはカスケードしないため、削除はすべて論理削除で行う。

## 論理削除の伝播

| 操作 | 影響範囲 |
|---|---|
| メンバー削除 | 対象 `user` の `deleted_at` のみ。プロジェクトは残る |
| 組織削除 | 1トランザクションで、組織所属ユーザー全員の `project` を論理削除 → 所属ユーザーを未所属に戻す（`organization_id = NULL`, `role = 'member'`）→ `organization` を論理削除。`user` 行は残る |

## マイグレーション

- 設定: `web/drizzle.config.ts`（`dialect: postgresql`、`verbose`、`strict`、接続は `DATABASE_URL`）
- 既存: `web/drizzle/0000_pretty_marten_broadcloak.sql`（上記4テーブルと2つの外部キーを作成）
- 生成: `pnpm run db:generate`（`drizzle-kit generate`）
- スキーマを変更したら **同一コミットで** このドキュメントとマイグレーションを更新する（`.claude/rules/common/doc-sync.md`）

> `pnpm run db:push` / `db:migrate` は本番系への破壊的操作として permissions.deny で防御されている。開発時のみ利用する。
