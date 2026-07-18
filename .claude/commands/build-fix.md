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
