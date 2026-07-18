# prompt template: bugfix

> 9要素の骨格。正本は `prompt-design-guide.md`。`<...>` を埋めて実装セッションへ渡す。

```
1. 対象: Issue #<n> — <バグの症状>
2. ブランチ: claude/fix-<topic> → main（既存PRあれば: <head>）
3. 推奨: /take-task → /tdd（再発テストを先に）→ /ci-all → /code-review → /pr → /handoff
4. 実施内容:
   - <path> の <関数> が <条件> で <誤動作>。<期待動作> に修正する
5. 触ってよい範囲: <path(s)>
6. 触ってはいけない範囲: 公開API・データ形式・<他path>
7. テストコマンド:
   cd web && pnpm run check && pnpm run test:unit --run
8. 最終報告: 原因 / 修正 / 再発テスト名 / 検証結果
9. 完了条件チェックリスト:
   [ ] 再発テストが追加され、修正前は失敗・修正後は成功 — 証拠: <spec名>
   [ ] 既存テストが緑 — 証拠: test:unit 出力
   [ ] スコープ外変更なし — 証拠: git diff --stat
```
