---
name: source-command-pr
description: セルフレビュー付きで PR を作成/更新する（base=main 固定・詳細 workflows/pr.md）
---

> migrated source command `pr` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/pr.md`。以下はその埋め込み。

---

---
description: セルフレビュー付きで PR を作成/更新する（base=main 固定・詳細 workflows/pr.md）
---
# /pr

base=`main` 固定で PR を作成する。詳細は `.claude/workflows/pr.md`。

## 手順
1. `/code-review` と変更内容に応じた専門 reviewer を実差分へ実行する
2. 指摘があれば修正し、影響する検査を再実行して同じ reviewer を再実行する。全 reviewer の指摘ゼロを確認する
3. `/ci-all` が緑であることを確認する。レビュー後に変更が入った場合は再実行する
4. `git-publisher` 専用 agent に commit/push/PR を委譲する
5. **既存 PR があれば新規作成せず、ユーザー承認後に head ブランチへ push する**
6. 新規 PR の場合は `gh pr create --base main` 実行前に人間の承認を得る

## 注意（要ユーザー承認）
- PR 作成・push は外部反映を伴うため、実行前にユーザー確認を得る

## 関連
review → **handoff** → pr/git-publisher →（管理セッション）verify-task
