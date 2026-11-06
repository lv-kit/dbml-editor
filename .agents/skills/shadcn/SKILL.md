---
name: shadcn
description: >-
  shadcn/ui コンポーネントの追加・カスタマイズを支援する。`npx shadcn add`
  でのコンポーネント導入、`components/ui` 配下のコンポーネント編集、
  Radix UI + Tailwind + CVA (class-variance-authority) を使った variant 設計、
  既存の `components.json` / パスエイリアス設定に沿った配置判断で使う。
  「shadcn」「shadcn/ui」という単語が出ていなくても、`components/ui`
  配下のコンポーネント追加・改変、`npx shadcn` コマンドの実行、
  Radix UI プリミティブ + Tailwind の組み合わせが既にプロジェクトに
  存在する場面なら適用する。
  ライブラリの最新オプション・API 詳細確認は `find-docs`（ctx7）を使う。
  このスキルはプロジェクトへの導入・配置・カスタマイズ方針だけを扱う。
  発火しない場面: shadcn/ui を使っていないプロジェクトでの他 UI ライブラリ
  （MUI、Chakra、Ant Design 等）の操作。
---

# shadcn/ui コンポーネント導入・カスタマイズ

shadcn/ui はnpmパッケージではない。**コンポーネントのソースコードをプロジェクトへコピーする方式**。導入後は自プロジェクトのコードとして直接編集する前提。

## 前提確認

作業前に必ず確認する。

- `components.json` の有無 → 無ければ初期化未実施。`npx shadcn@latest init` から
- `components.json` の `aliases`（`components`、`utils`、`ui` 等のパス設定）
- 既存 `components/ui/` 配下の命名・構成パターン
- Tailwind 設定（`tailwind.config.*` のテーマ拡張、CSS変数の有無）

既存プロジェクトに規約があれば、それを優先する。このスキルの型を押し付けて再編しない。

## コンポーネント追加

```bash
npx shadcn@latest add <component-name>
```

- 追加前に既存の有無を確認する。確認先は `components/ui/<component-name>.tsx` に固定しない。`components.json` の `aliases.ui`（例: `@/components/ui`）を `tsconfig.json` / `jsconfig.json` のパスエイリアス（例: `@/* -> ./src/*`）で実パスへ解決してから確認する。既存なら上書き確認が要る操作なので、既存カスタマイズ内容を把握してから実行する
- 複数コンポーネントは一括指定できる: `npx shadcn@latest add button dialog`
- 依存コンポーネント（例: `combobox` が `popover` と `command` に依存）は shadcn CLI が自動解決する。手動で個別追加を積み上げない

## カスタマイズ方針

- コピーされたコードは**直接編集が前提**。npmパッケージのように「上書き禁止」ではない
- 再度 `npx shadcn add` で同名コンポーネントを追加し直すと、直接編集した内容は上書きされる。カスタマイズ済みコンポーネントへの再追加は事前に差分を確認する
- variant 管理は `class-variance-authority`（CVA）の `cva()` に寄せる。独自の `if/switch` で className を組み立てない
- Radix UI プリミティブ（`@radix-ui/react-*`）が土台のコンポーネントは、アクセシビリティ挙動（フォーカストラップ、`aria-*`、キーボード操作）を保持したままスタイルだけ変更する。Radix の `asChild` や compound component 構造を崩さない
- 色・spacing 等のトークンは、プロジェクトの Tailwind テーマ拡張または CSS 変数（`components.json` の `tailwind.cssVariables`）に従う。ハードコードした色を直接コンポーネントへ書き込まない

## 配置判断

- `components/ui/` は shadcn 由来のプリミティブ専用に保つ。業務ロジックを含むコンポーネントをここへ置かない
- 業務固有の合成コンポーネント（複数の `ui/*` を組み合わせたもの）は、プロジェクトの既存ディレクトリ規約（例: `components/<feature>/`）に従って別途配置する
- UI 設計（画面構成・命名）自体は `ooui` ルールの対象。このスキルはコンポーネント実装の技術的な導入・カスタマイズに限定する

## 最新情報の確認

`npx shadcn` の CLI オプション、個別コンポーネントの API・props、Radix UI の破壊的変更は `find-docs` スキル（ctx7）で公式ドキュメントを確認してから使う。このスキル自体には API リファレンスを持たせない。

## よくある失敗

- `components.json` を確認せず追加し、既存のパスエイリアス設定と食い違ったディレクトリへ生成してしまう
- カスタマイズ済みコンポーネントに気づかず `npx shadcn add` を再実行し、編集内容を消してしまう
- CVA を使わず className を条件分岐で手組みし、variant が増えるたびに可読性が落ちる
- Radix プリミティブの compound component 構造（`<Dialog.Root>` 等）を崩し、キーボード操作やフォーカス管理が壊れる
- `components/ui/` へ業務ロジックを持ち込み、再利用不能な密結合コンポーネントにする
