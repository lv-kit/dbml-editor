---
description: 1〜3ファイル規模の実装計画を立てる（planner エージェントへ委譲）
argument-hint: "<変更したい内容>"
---
# /plan

`planner`（`claude-opus-4-8` / `high`）エージェントに委譲する。横断・大規模・アーキ判断が絡むなら `/plan-deep` を使う。

## 手順
1. `planner` サブエージェントを起動し、要件「$ARGUMENTS」の実装計画を依頼する
2. 計画（変更対象・TDD手順・影響範囲・要確認）をユーザーに提示し、確認を得る
3. 確認後に実装へ移る（`/tdd`）

## 関連
take-task → **plan** → tdd → ci-all → code-review → pr → handoff
