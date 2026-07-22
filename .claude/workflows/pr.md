# workflow: pr

`/pr` の詳細手順。base=`main` 固定。`/handoff` 完了後に実行する。

## 事前チェック
1. 現在のブランチを確認する。`main` なら候補ブランチ名・派生元・理由を人間へ提示し、確認前に作成・切替しない
2. `/ci-all` が緑であること
3. `/code-review` と変更内容に応じた専門 reviewer が実差分を確認していること
4. 指摘があれば修正 → 影響検査 → 同じ reviewer で再レビューを指摘ゼロまで繰り返すこと
5. コミットが Conventional Commits（`.cursorrules`）に沿うこと
6. スコープ外変更が混ざっていないこと

## 公開担当

- commit/push/PR は `git-publisher` 専用 agent に委譲する
- 現在の適切な作業ブランチを継続し、既存 PR があればその head ブランチを更新する
- push と新規 PR 作成は外部反映前に人間の承認を得る

## 既存 PR の確認（重要）
```bash
gh pr list --head "$(git branch --show-current)" --state open
```
- **既存 PR があれば新規作成しない**。ユーザー承認後に head ブランチへ push するだけにする
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
- すべての reviewer の指摘がゼロで、影響する検査が緑である
- 既存 PR があれば更新し、なければ承認後に新規 PR を作成する
