# プロダクト概要

DBML（Database Markup Language）をテキストと ER 図の双方向で編集するツール。同一のエディタ体験を **Web アプリ** と **デスクトップアプリ** の2形態で提供する。

## 2つのアプリ

| アプリ | ディレクトリ | 形態 | 保存先 | 認証 |
|---|---|---|---|---|
| DBML Editor | `web/` | SvelteKit Web（Cloudflare Workers） | PostgreSQL（プロジェクト単位）＋ ローカルファイル | Firebase 認証必須 |
| DBML Studio | `dbml-studio/` | SvelteKit + Tauri 2 デスクトップ | ローカルファイルのみ | なし（ローカル完結） |

両アプリは **エディタ・ダイアグラムの中核ロジックを同一仕様** で持つ（実装はコピーで並存。詳細は [known-gaps.md](known-gaps.md)）。

## 機能一覧

### 共通（[dbml-editor.md](dbml-editor.md)）

- CodeMirror 6 による DBML テキスト編集（行番号・折りたたみ・検索・補完・履歴）
- `@dbml/core` パーサ（`dbmlv2`）による解析と ER ダイアグラム描画
- ダイアグラム操作: テーブル移動、カラム間ドラッグでのリレーション作成、パン、ズーム、選択と削除
- 選択削除は **DBML テキストを書き換える**（ダイアグラムが正、テキストが唯一の状態）
- パースエラー時は直前の有効なダイアグラムを維持し、警告のみ表示
- カラムの note をホバーでツールチップ表示
- 操作ガイド（Help）

### Web アプリ固有

- Firebase 認証（Google / Microsoft / メールリンク）と自前セッション Cookie（[authentication.md](authentication.md)）
- 個人利用 / 法人利用のサインアップ導線
- 組織とメンバー管理、ロールベースの権限制御（[organizations-and-members.md](organizations-and-members.md)）
- プロジェクト（DBML 文書）の作成・一覧・編集・DB 保存（[projects.md](projects.md)）
- ローカル `.dbml` ファイルの読み込み・上書き・ダウンロード

### デスクトップアプリ固有（[desktop-app.md](desktop-app.md)）

- ネイティブファイルダイアログでの開く / 保存 / 名前を付けて保存
- 3言語 UI（日本語・英語・スペイン語）
- テーマ設定（ライト / ダーク / システム追従）
- DBML の妥当性を常時検証し、エラーをバッジとバナーで表示

## 対象外（現状）

- プロジェクトの組織内共有・共同編集（プロジェクトは作成ユーザー個人の所有）
- 1ユーザーの複数組織所属
- SQL などへのエクスポート（DBML テキストのみ）
