# workflow: pr

`/pr` の詳細手順。base=`main` 固定。

## 事前チェック
1. ブランチが `<tool>/<topic>` で、`main` でないこと
2. `/ci-all` が緑であること
3. コミットが Conventional Commits（`.cursorrules`）に沿うこと
4. スコープ外変更が混ざっていないこと（セルフレビュー）

## 既存 PR の確認（重要）
```bash
gh pr list --head "$(git branch --show-current)" --state open
```
- **既存 PR があれば新規作成しない**。head ブランチへ push するだけにする
```bash
git push origin "$(git branch --show-current)"
```

## 新規 PR 作成（要ユーザー承認）
- PR 作成・push は外部反映を伴う。実行前にユーザーへ内容を提示し承認を得る
```bash
gh pr create --base main --title "<type: 要約>" --body "<本文>"
```
- 本文は `.github/pull_request_template.md` のレビュー観点（日本語・脆弱性・SOLID・テスト・命名）を満たす

## 完了条件
- PR が作成/更新され、CI が緑、セルフレビュー済み
