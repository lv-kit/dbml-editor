# typescript/coding-style（TypeScript 規約の正本）

> **正本**: TypeScript 固有の型・命名規約。共通原則は `.claude/rules/common/coding-style.md`、
> 詳細は `AGENTS.md` の「TypeScript と設計」節（重複記載しない）。

## 型

- `any` / 無根拠な型アサーション / `@ts-ignore` を使わない
- 外部入力は `unknown` として受け、検証してから型を絞り込む
- 戻り値・副作用を型で明示する。関数の入出力を曖昧にしない

## 命名

- 役割を表す**完全な英単語**を使う
- 公開 API に略語や文脈依存の `data` / `utils` / `helper` / `handle` を使わない

## 設計

- 1 モジュール 1 責務。パース・検証・権限判定・変換は可能な限り純粋関数にする
- 副作用は境界に寄せる
- deprecated API を使わない。新規利用前に公式ドキュメント（`find-docs`）を確認する

## 検証

- 変更後は `pnpm run check`（svelte-check + tsc）でエラーゼロを確認する
