# prompt template: db-change

> 9要素の骨格。正本は `prompt-design-guide.md`。DB スキーマ変更用。

```
1. 対象: Issue #<n> — <スキーマ変更の目的>
2. ブランチ: claude/db-<topic> → main
3. 推奨: /take-task → /plan → /tdd → /ci-all → /db-review → /pr → /handoff
4. 実施内容:
   - web/src/lib/server/db/schema.ts に <テーブル/列> を <追加/変更>
   - drizzle-kit generate でマイグレーション生成
   - .env.example / スキーマ由来ドキュメントを同一コミットで同期（doc-sync）
5. 触ってよい範囲: web/src/lib/server/db/**, web/drizzle/**, 関連 services
6. 触ってはいけない範囲: 実DBへの push/migrate（禁止）、他テーブル定義
7. テストコマンド:
   cd web && pnpm run check && pnpm run test:unit --run
8. 最終報告: スキーマ差分 / 生成マイグレーション / ドキュメント同期状況
9. 完了条件チェックリスト:
   [ ] マイグレーションが生成されている（push 未使用）— 証拠: web/drizzle/ の新ファイル
   [ ] 型・制約が要件と一致 — 証拠: schema.ts diff
   [ ] ドキュメント同期済み — 証拠: 同一コミットの差分
```
