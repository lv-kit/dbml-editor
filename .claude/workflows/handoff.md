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
1. 上記を in-progress のタスクファイルへ追記する
2. タスクを done へ移動する
   ```bash
   git mv .codex/tasks/in-progress/TASK-XXX-*.md .codex/tasks/done/
   ```
3. コミットする（Conventional Commits）

## 原則
- **主張には必ず証拠（diff/テスト結果/path:line）を添える**。管理セッションが実 diff と突き合わせる
