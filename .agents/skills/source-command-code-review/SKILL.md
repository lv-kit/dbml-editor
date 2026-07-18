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
2. 判定（PASS/要確認/修正必要）と指摘・次アクションを提示する

## 関連
ci-all → **code-review** → （必要なら security-review / db-review）→ pr
