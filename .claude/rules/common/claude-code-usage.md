# claude-code-usage（トークン最適化の正本）

> **正本**: モデル選択・subagent 委譲・context 管理の方針。

## 1. モデルルーティング（3段）

| 段 | モデル | 用途 |
|---|---|---|
| 軽量 | Haiku | 単純編集・定型テスト生成・小さな調べもの |
| 標準 | Sonnet | 通常の実装・レビュー・調査 |
| 高推論 | Opus | 複雑なデバッグ・横断リファクタ・アーキテクチャ判断のみ |

- 高推論モデルは**計画/設計系に限定**。単純作業に使わない

## 2. subagent 委譲

- 大量の tool call を伴う調査は `code-explorer` / `Explore` に委譲し、結果のダイジェストだけ受け取る（main context を汚さない）
- レビューは `code-reviewer` 等の専用エージェントへ。tools を最小化してコストを抑える
- agy（Antigravity/Gemini）への委譲は break-even を超える一括作業のみ（大量スキャフォールド・網羅テスト生成・移行）。小さいタスクは自分でやる

## 3. context 管理

- 検索は semble 第一選択（`.claude/rules/common/code-search.md`）。同じ内容を再検索しない
- 一度読んだファイルを検証目的で読み直さない
- context 残量が逼迫したら、圧縮前に状態を退避（`pre-compact-save` hook が変更ファイル一覧を `last-session-changes.md` へ保存）
- 長い調査結果は貼り戻さず、要点だけを残す
