# DBML Studio（デスクトップアプリ）

`dbml-studio/`。Tauri 2 + SvelteKit の SPA。認証・サーバ・DB を持たず、ローカルファイルだけで完結する。

## アプリ構成

| 項目 | 値 |
|---|---|
| 製品名 / バージョン | `dbml-studio` / `0.1.0` |
| バンドル識別子 | `com.stargazy.dbml-studio` |
| ウィンドウ初期サイズ | 800 × 600、タイトル `dbml-studio` |
| フロントエンド | `@sveltejs/adapter-static`（`fallback: index.html`）、`ssr = false` の SPA |
| 開発 URL | `http://localhost:1420` |
| ビルド出力 | `../build` を `frontendDist` として参照 |
| CSP | 未設定（`null`） |

Rust 側（`src-tauri/src/lib.rs`）は `dialog` / `fs` / `opener` プラグインを登録するだけで、独自コマンドは実装していない。

### Tauri 権限（`src-tauri/capabilities/default.json`）

`main` ウィンドウに対して以下を許可する。

- `core:default`
- `dialog:default`
- `fs:default`, `fs:allow-read-text-file`, `fs:allow-write-text-file`
- `opener:default`

ファイルシステムへのアクセスはテキストファイルの読み書きに限定されている。

## 画面

### 開始画面

- ヘッダー: アプリ名（`DBML Studio`）と設定ボタン
- カード2枚:
  | 選択肢 | 振る舞い |
  |---|---|
  | 新規作成 | テンプレート（`users` テーブル: `id integer [primary key]` / `email varchar [not null, unique]` / `created_at timestamp`）を投入して編集画面へ |
  | ファイルを開く | ネイティブダイアログで既存 `.dbml` を開く |
- エラーは閉じるボタン付きのアラートで表示する

### 編集画面

- ヘッダー左: 開始画面に戻るボタン、現在のファイル名、「未保存」バッジ、「DBMLエラー」バッジ
- ヘッダー右: 新規 / 開く / 保存 / 名前を付けて保存 / エクスポート（アイコン）/ 設定 / ヘルプ
- DBML が不正な場合、ヘッダー下に警告バナーでパースエラー内容を表示する
- 本体は左にコードエディタ、右にダイアグラム（各 50%）。仕様は [dbml-editor.md](dbml-editor.md)

ファイル操作中（`isBusy`）は新規・開く・保存・名前を付けて保存・エクスポートを無効化する。保存ボタンは未保存の変更があるときのみ有効。

## ファイル操作（`src/lib/file-system.ts`）

| 操作 | 振る舞い |
|---|---|
| 開く | ネイティブダイアログ（`.dbml` フィルタ、単一選択）→ `readTextFile`。キャンセル時は何もしない |
| 保存 | 現在のパスがあればそこへ `writeTextFile`。パスが無ければ「名前を付けて保存」に委譲する |
| 名前を付けて保存 | 保存ダイアログ（既定ファイル名は現在のファイル名）→ 書き込み。キャンセル時は何もしない |
| エクスポート | 「名前を付けて保存」と同一動作 |

- 保存パスは `ensureDbmlExtension()` で **拡張子が `.dbml` でなければ付与** する
- ファイル名はパスの区切り（`/` と `\` の両方）で分解して末尾を取る。空なら `untitled.dbml`
- 新規作成時のファイル名は `untitled.dbml`、パスは未設定

### Tauri 以外の実行環境（ブラウザで開発サーバを見る場合）

`isTauri()` が偽のとき「開く」は非表示の `<input type="file" accept=".dbml,text/plain">` にフォールバックする。読み込んだ内容はパスなし（`path: null`）として扱うため、以後の「保存」は必ず「名前を付けて保存」になる。ネイティブダイアログ用の関数を非 Tauri 環境で直接呼ぶと `Tauri環境ではないため、ネイティブファイルダイアログを使用できません` を投げる。

### エラー表示

すべてのファイル操作は共通ハンドラを通し、失敗時に `{操作別の文言}: {エラーメッセージ}` をアラートに表示する。文言は現在のロケールに従う（例: `ファイルを開けませんでした` / `保存に失敗しました`）。`Error` でない例外は `不明なエラー`（ローカライズ済み）とする。

## 国際化（`src/lib/i18n.ts`）

- 対応ロケール: `ja` / `en` / `es`
- 決定順: `localStorage` の `locale` が有効値ならそれ → ブラウザ / OS 言語の言語部分（`ja-JP` → `ja`）が有効値ならそれ → **既定 `ja`**
- 変更時は `document.documentElement.lang` を更新し、`localStorage` に保存する
- メッセージは3ロケール分を同一構造で定義し、型で網羅性を担保する（`satisfies Record<Locale, Record<string, string>>`）
- 対象範囲: アプリ名、メニュー・ボタン、設定ダイアログ、ヘルプ、エラー文言、ダイアグラムの空状態・エラー見出し、テンプレートのコメント文

## テーマ（`src/lib/theme.ts`）

- 設定値: `light` / `dark` / `system`（既定 `system`）
- 保存キー: `themePreference`
- **旧キー `darkMode` からの移行**: `themePreference` が無効なとき、`darkMode === 'true'` なら `dark`、`'false'` なら `light`、それ以外は `system` とする。解決後の値は `themePreference` に書き戻す
- `system` のときは `prefers-color-scheme: dark` を購読し、OS 設定の変更に追従する（`light` / `dark` 固定時は追従しない）
- 適用は `<html>` の `dark` クラスのトグル。コードエディタとダイアグラムの配色にも連動する

## 設定ダイアログ

- 「一般」セクションに **言語** と **テーマ** の選択を持つ
- 閉じると設定ボタンにフォーカスを戻す（`tick()` 後に `focus()`）
- 変更は即時反映され、`localStorage` に保存される

## 検証

`pnpm run check`（`svelte-kit sync` + `svelte-check`）、`pnpm run test`（Vitest）。ユニットテストは `dbml-validator` / `file-system` / `i18n` / `theme` / `dbml-diagram-parser` / `dbml-diagram-layout` に存在する。
