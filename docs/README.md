# docs — 仕様書インデックス

このディレクトリは **実装済みの仕様の正本**。実装規約（コードの書き方）は `AGENTS.md` と `.claude/rules/**` が正本で、こちらは重複しない。

会話・インタビュー・レビューで確定した仕様は、`.claude/rules/common/doc-sync.md` に従い実装と同一コミットでここへ反映する。

## 構成

| ドキュメント | 内容 |
|---|---|
| [overview.md](overview.md) | プロダクト概要、2つのアプリの位置づけ、機能一覧 |
| [architecture.md](architecture.md) | 技術スタック、層構造、ビルド・デプロイ構成 |
| [authentication.md](authentication.md) | Firebase 認証、セッション、ログイン/サインアップ導線 |
| [organizations-and-members.md](organizations-and-members.md) | 組織・ロール・権限マトリクス、メンバー操作 |
| [projects.md](projects.md) | プロジェクト管理、保存、ローカルファイル連携 |
| [dbml-editor.md](dbml-editor.md) | コードエディタとダイアグラムの編集仕様（両アプリ共通） |
| [desktop-app.md](desktop-app.md) | dbml-studio（Tauri デスクトップ）固有仕様 |
| [schema.md](schema.md) | DB スキーマとマイグレーション |
| [environment-and-operations.md](environment-and-operations.md) | 環境変数、検証コマンド、ローカル実行 |
| [known-gaps.md](known-gaps.md) | 既知の仕様差分・未実装・ドキュメント乖離 |

## 記載範囲

- 記載するのは **利用者向けの振る舞い、受け入れ条件、例外時の扱い、入出力・データ制約・権限** に関する決定事項
- 「現状の実装がこうなっている」という事実を記録する。将来計画は `known-gaps.md` に課題として書く
