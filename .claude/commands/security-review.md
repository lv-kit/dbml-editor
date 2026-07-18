---
description: セキュリティ・認証・認可を監査する（security-reviewer へ委譲）
---
# /security-review

`security-reviewer` エージェントに委譲する。認証・認可を触る PR で必須。

## 手順
1. `security-reviewer` を起動し、diff と認証関連コードを監査する
2. ロール別（許可/拒否/管理者）の網羅を確認する

## 関連
code-review → **security-review** → pr
