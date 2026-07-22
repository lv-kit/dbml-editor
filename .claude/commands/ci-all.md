---
description: lint/型検査/テストを一括実行する（詳細手順は workflows/ci-all.md）
argument-hint: "[web|studio|all]"
---
# /ci-all

ローカル CI 相当を一括実行する。詳細・失敗時の分岐は `.claude/workflows/ci-all.md`。

## 手順（対象: $ARGUMENTS、無指定なら変更のある領域）
1. `web/` 変更時: `cd web && pnpm run check && pnpm run lint && pnpm run test:unit --run`
2. `dbml-studio/` 変更時: `cd dbml-studio && pnpm run check && pnpm run test`
3. 失敗したら `/build-fix` で解消する

## 完了ゲート
- reviewer の指摘修正後にも、影響する対象領域の `/ci-all` を再実行する
- CI 成功だけでは完了にせず、汎用 reviewer と必要な専門 reviewer の指摘ゼロを確認する

## 関連
tdd → **ci-all** → code-review →（指摘ゼロまで再検査）→ pr
