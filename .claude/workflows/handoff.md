# workflow: handoff

`/handoff` の詳細手順。実装結果を検証可能な形で引き継ぐ。

## 引き継ぎノートに記載する内容（証拠必須）
```markdown
## 引き継ぎノート（YYYY-MM-DD）
### 変更概要
- <要点>
### 実際の変更（証拠）
$ git diff --stat main...HEAD
<出力を貼る>
### 実行した検証
- `pnpm run check`: <結果>
- `pnpm run lint`: <結果>
- `pnpm run test:unit --run`: <結果>
### 完了条件チェックリストの充足
- [x] <条件> — 証拠: <path:line / テスト名 / コマンド出力>
### 未対応・要確認
- <あれば>
### PR
- <URL>
```

## 手順
1. `/code-review` と変更内容に応じた専門 reviewer を実差分へ実行する
2. 指摘が1件でもあれば修正し、影響する検査を再実行して同じ reviewer を再実行する。全 reviewer の指摘ゼロになるまで 1 と 2 を繰り返す
3. 未検証領域があれば、必要な検査または検証できない根拠をノートへ記録する
4. 上記を in-progress のタスクファイルへ追記する
5. タスクを done へ移動する
   ```bash
   git mv .codex/tasks/in-progress/TASK-XXX-*.md .codex/tasks/done/
   ```
6. `/handoff` 後の通常コミット・push・PR は `/pr` の `git-publisher` 専用 agent に委譲する（Conventional Commits）。`/pr` は handoff の後に実行し、handoff から `/pr` を再度呼び出さない

## 原則
- **主張には必ず証拠（diff/テスト結果/path:line）を添える**。管理セッションが実 diff と突き合わせる
