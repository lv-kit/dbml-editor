---
description: Drizzle スキーマ・マイグレーション・クエリをレビューする（database-reviewer へ委譲）
---
# /db-review

`database-reviewer` エージェントに委譲する。DB を触る PR で使う。

## 手順
1. `database-reviewer` を起動し、`schema.ts` / `drizzle/` の変更を確認する
2. マイグレーション整合・ドキュメント同期・N+1/インデックスを確認する

## 関連
code-review → **db-review** → pr
