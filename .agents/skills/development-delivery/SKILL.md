---
name: development-delivery
description: >-
  実装を終えて完了報告・レビュー・コミット・push・PR作成または更新・CI待機・PRコメント確認・
  worktree削除に進むときの手順（開発ワークフローの手順4以降とWorktreeの後始末）。
  ファイルを変更する作業で、完了報告、差分レビュー、ブロッキング指摘の修正ループ、コミット、PR、CI、
  PRコメントの妥当性確認、worktreeの後始末のいずれかに入る前に必ず使う。会話要約の後も、この段階に入るときは読み直す。
  発火しない場面: 読み取りだけの調査、質問への回答、ファイルを変更しない作業。
---

# development-delivery

開発ワークフローの手順4以降（完了報告、レビューと修正のループ、コミット・push・PR・CI・PRコメント確認）と、Worktreeの後始末の手順。

手順の正本は `references/development-delivery.md`（リポジトリの `rules/development-delivery.md` への symlink）。作業を進める前に全文を読み、書かれた順序と条件どおりに実行する。このファイルに手順を複製しない。

手順1〜3（着手〜実装）と委譲時の取り決めは、常時読み込まれる `development-workflow` ルールにある。
