# DBML Studio

DBML をテキストと ER 図の双方向で編集するデスクトップアプリ。Tauri 2 + SvelteKit（SPA）で動作し、ローカルの `.dbml` ファイルだけで完結する。認証・サーバ・DB は持たない。

Web 版は `../web/`。仕様の正本は `../docs/` を参照する。

- 全体像: [../docs/overview.md](../docs/overview.md)
- このアプリの仕様（ファイル操作 / 多言語 / テーマ）: [../docs/desktop-app.md](../docs/desktop-app.md)
- エディタ・ダイアグラム: [../docs/dbml-editor.md](../docs/dbml-editor.md)

## 主な機能

- 新規作成（テンプレート）、既存 `.dbml` の開く / 保存 / 名前を付けて保存 / エクスポート
- 左にコードエディタ、右に ER ダイアグラムの分割表示。どちらの編集も相互に反映される
- DBML の妥当性を常時検証し、エラーをバッジとバナーで表示
- UI 言語の切り替え（日本語 / 英語 / スペイン語）
- テーマ切り替え（ライト / ダーク / システム追従）

## 利用方法

```sh
pnpm install

# デスクトップアプリとして起動
pnpm run tauri:dev

# ブラウザで frontend のみ起動（ネイティブダイアログは使えない）
pnpm run dev
```

## ビルド

```sh
pnpm run tauri:build            # 現在のプラットフォーム向け
pnpm run tauri:build:mac        # .app
pnpm run tauri:build:windows    # nsis, msi
```

## 検証

```sh
pnpm run check   # svelte-kit sync + svelte-check
pnpm run test    # Vitest
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
