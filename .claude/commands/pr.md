---
description: セルフレビュー付きで PR を作成/更新する（base=main 固定・詳細 workflows/pr.md）
---
# /pr

base=`main` 固定で PR を作成する。詳細は `.claude/workflows/pr.md`。

## 手順
1. コミット規約（`.cursorrules`）を満たしているか確認する
2. `/ci-all` が緑であることを確認する
3. **既存 PR があれば新規作成せず head ブランチへ push する**
4. `gh pr create --base main`（新規時）。PR テンプレートのレビュー観点を満たす本文を書く
5. 作成前にセルフレビュー（差分の意図・スコープ逸脱の有無）を行う

## 注意（要ユーザー承認）
- PR 作成・push は外部反映を伴うため、実行前にユーザー確認を得る

## 関連
code-review → **pr** → handoff
