---
name: source-command-build-fix
description: 型/lint/ビルド/テスト失敗を最小修正で解消する（build-error-resolver へ委譲）
---

> migrated source command `build-fix` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/build-fix.md`。以下はその埋め込み。

---

---
description: 型/lint/ビルド/テスト失敗を最小修正で解消する（build-error-resolver へ委譲）
---
# /build-fix

`build-error-resolver` エージェントに委譲する。根本原因を直し、握りつぶさない。

## 手順
1. `build-error-resolver` に失敗中のコマンドと出力を渡す
2. 根本原因を修正し、同じコマンドで緑を確認する

## 関連
ci-all → **build-fix** → ci-all（再検証）
