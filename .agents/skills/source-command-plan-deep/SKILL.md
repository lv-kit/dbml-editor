---
name: source-command-plan-deep
description: 横断・大規模・アーキ判断を伴う設計を行う（planner-deep エージェント・高推論へ委譲）
---

> migrated source command `plan-deep` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/plan-deep.md`。以下はその埋め込み。

---

---
description: 横断・大規模・アーキ判断を伴う設計を行う（planner-deep エージェント・高推論へ委譲）
argument-hint: "<設計したい内容>"
---
# /plan-deep

`planner-deep`（Opus）に委譲する。複数モジュール横断・DBスキーマ変更・認証フロー変更・大規模リファクタ専用。

## 手順
1. `planner-deep` サブエージェントを起動し、「$ARGUMENTS」の設計を依頼する
2. 設計案の比較・推奨案・フェーズ分割をユーザーに提示し、確認を得る

## 関連
**plan-deep** → plan（各フェーズ）→ tdd → ci-all → pr
