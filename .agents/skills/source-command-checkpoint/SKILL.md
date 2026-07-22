---
name: source-command-checkpoint
description: 現在の作業状態をコミットで区切る（作業途中の安全な退避点）
---

> migrated source command `checkpoint` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/checkpoint.md`。以下はその埋め込み。

---

---
description: 現在の作業状態をコミットで区切る（作業途中の安全な退避点）
argument-hint: "<区切りの要約>"
---
# /checkpoint

作業を安全な区切りでコミットする（WIP の退避点）。commit は `git-checkpoint` 専用 agent に委譲し、push/PR は行わない。

## 手順
1. `git status` で変更を確認する
2. `/ci-all`（可能なら）で緑を確認する
3. `/code-review` と変更内容に応じた専門 reviewer の指摘ゼロを確認する
4. `git-checkpoint` に Conventional Commits（`.cursorrules`）で「$ARGUMENTS」をローカルコミットするよう依頼する（作業ブランチのみ）

## 注意
- `main` へは直接コミットしない（`.claude/rules/common/git-workflow.md`）
