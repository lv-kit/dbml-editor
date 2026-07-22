---
name: source-command-code-review
description: 現在の diff を一般コード品質観点でレビューする（code-reviewer へ委譲）
---

> migrated source command `code-review` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/code-review.md`。以下はその埋め込み。

---

---
description: 現在の diff を一般コード品質観点でレビューする（code-reviewer へ委譲）
---
# /code-review

`code-reviewer` エージェントに委譲する。認証は `/security-review`、Svelte固有は svelte-reviewer、DBは `/db-review` を併用する。

## 手順
1. `git diff` を対象に `code-reviewer` を起動する
2. 変更内容に応じて `security-reviewer`、`svelte-reviewer`、`database-reviewer` などの専門 reviewer も起動する
3. 1件でも指摘があれば実装担当へ修正を依頼し、影響するテスト・検査を再実行する
4. 同じ reviewer を再実行し、すべての reviewer の指摘がゼロになるまで 3 のループを続ける
5. 指摘ゼロの判定、実行した検査、未検証領域の根拠を記録する

## 関連
ci-all → **code-review** →（指摘ゼロまで修正・再検査・再レビュー）→ pr
