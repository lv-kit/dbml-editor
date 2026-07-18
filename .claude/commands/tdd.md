---
description: TDD で実装を進める（tdd-guide エージェントへ委譲）
argument-hint: "<実装する挙動>"
---
# /tdd

`tdd-guide` エージェントに委譲する。Red→Green→Refactor を厳守。

## 手順
1. `tdd-guide` サブエージェントに「$ARGUMENTS」の TDD 実装を依頼する
2. 失敗するテスト → 最小実装 → リファクタ の順で進める
3. Svelte 変更時は `svelte-autofixer` を問題ゼロまで実行
4. 完了後 `/ci-all` で検証する

## 関連
plan → **tdd** → ci-all → code-review
