# context: review（レビューモード）

diff をレビューするモード。コードは書かず、指摘と次アクションを返す。

## 姿勢
- 観点の正本: `.claude/rules/common/code-review.md`、PRテンプレ: `.github/pull_request_template.md`
- report を鵜呑みにせず、必要に応じテストを実行して裏取りする

## エージェント使い分け
- 一般品質: `code-reviewer` / 認証認可: `security-reviewer`
- Svelte固有: `svelte-reviewer` / DB: `database-reviewer` / 性能: `performance-optimizer`

## 判定
- PASS / 要確認 / 修正必要 ＋ 次アクション
