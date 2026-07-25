# 既知の仕様差分・未整備

現状の実装で意図的に未対応、または実装とドキュメント・設計が乖離している箇所の一覧。修正するときはここの該当行も同一コミットで更新する。

## 未接続・未使用のコード

| 箇所 | 内容 |
|---|---|
| `web/src/lib/components/DarkModeToggle.svelte` | どこからも import されていない |
| `dbml-studio/src/lib/components/DarkModeToggle.svelte` | 同様に未使用（設定ダイアログのテーマ選択に置き換わっている） |
| `web/src/routes/+layout.svelte` の `darkMode` コンテキスト | `setContext('darkMode', ...)` を設定しているが `getContext('darkMode')` の呼び出し側が存在しない。`localStorage` の `darkMode` を読んで `<html>` に `dark` クラスは付くが、切り替える UI がない |
| `web/` のダイアグラム配色 | `/projects/[id]` が `DbmlDiagram` に `darkMode` を渡していないため、`<html>` が dark でもダイアグラムは常にライト配色 |
| `web/` のコードエディタ | `oneDark` を常時適用しており、ライトテーマと組み合わせても暗いまま |
| `task` テーブル | スキーマとマイグレーションに存在するが、アプリコードから参照されていない（SvelteKit テンプレート由来） |
| `web/src/lib/vitest-examples/`, `web/src/stories/`, `web/src/routes/demo/` | テンプレート由来のサンプル。`/demo/members` は権限判定のモックデータによる表示確認用で、実データを扱わない |

## 機能の未整備

| 項目 | 現状 |
|---|---|
| ログアウト | `DELETE /api/session` は実装済みだが、呼び出す UI がない（`POST` のみログイン画面とメールコールバックから使用） |
| `web/` の UI 多言語化 | Paraglide は導入済み（`en` / `es` / `ja`、`reroute` と `%paraglide.lang%` も配線済み）だが、メッセージ定義は `hello_world` のみで、実際の UI 文言は日本語ハードコード。`/demo/paraglide` だけが `m` を使う。`dbml-studio/` は独自 i18n で3言語対応済み |
| プロジェクトの削除 | 論理削除カラムはあるが、ユーザー操作による削除機能がない（組織削除の副作用でのみ設定される） |
| プロジェクトの組織共有 | `project` は `user_id` 単位の所有のみ。組織メンバー間での共有・共同編集はできない |
| 複数組織所属 | `user.organization_id` の単一所属のみ。`/organizations` は実質「自分の1組織」の表示 |
| DBML の保存時検証 | `POST ?/save` は内容をパースしないため、不正な DBML も保存できる。`web/` の妥当性検証はローカルファイル上書きの可否判定にしか使われない |
| テーブル座標の永続化 | ダイアグラムでドラッグした座標はコンポーネント状態のみで、DBML にも DB にも保存されない。再読み込みで既定のグリッド配置に戻る |

## 構造上の重複

| 項目 | 内容 |
|---|---|
| 組織詳細の2系統 | `/organizations/[id]`（管理者追加・組織削除）と `/organizations/[slug]/members`（メンバー追加・ロール変更・削除）が並存し、メンバー一覧表示が重複する。組織一覧からは `slug` 系のみリンクされている |
| エディタ実装の二重管理 | `DbmlCodeEditor.svelte` / `DbmlDiagram.svelte` / `dbml-diagram-parser.ts` / `dbml-diagram-layout.ts` / `dbml-validator.ts` / `keyboard.ts` を両アプリが個別に保持する。差分はダークモードの具体色、`dbml-studio/` 側の `locale` prop とテーマ切り替え用 `Compartment`、`validateDbml` の空メッセージ引数のみ。**片方だけ変更すると仕様差分が生まれる**（`AGENTS.md` の禁止事項） |
| ロール判定の配置 | `web/src/lib/members.ts`（画面表示と `[slug]/members` アクション用）と `web/src/lib/server/services/organization.ts`（`canAddAdmin` / `canDeleteOrganization`）にロール判定が分かれている |

## 実装上の注意点

| 箇所 | 内容 |
|---|---|
| ダイアグラムの DBML 書き換え | テーブル・カラム・Ref の削除は `@dbml/core` の AST ではなく正規表現とブレース深度追跡による字句処理で行う。想定外の記法（複数行にまたがるカラム定義、`Ref` ブロック記法など）では削除できない場合がある |
| note の高さ概算 | ダイアグラムのレイアウトは note を「30文字超で2行」と概算するため、実際の折り返しとずれてテーブルが重なる可能性がある |
| `dbml-studio/` の CSP | `tauri.conf.json` で `csp: null`（未設定） |
