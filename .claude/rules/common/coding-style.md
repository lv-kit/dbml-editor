# coding-style（共通コーディング原則）

> **正本**: 具体的なコーディング規約（TS・命名・責務分割・副作用）は `AGENTS.md`。
> 本ファイルは横断原則と「領域別の実行コマンド早見表」の正本。

## 共通原則

- **不変性優先**: 破壊的変更より新しい値を返す。副作用は境界に寄せる（詳細 `AGENTS.md`）
- **KISS**: 最小の変更で要件を満たす。過度な抽象化を避ける
- **DRY**: 同一ロジックを複数箇所に置かない。ただし早すぎる共通化は避ける（YAGNI）
- **YAGNI**: 要件にない汎用化・拡張ポイントを先回りで作らない

## 領域別 実行コマンド早見表

| 領域 | 型/静的検査 | Lint/整形 | テスト |
|---|---|---|---|
| `web/` | `pnpm run check` | `pnpm run lint` / `pnpm run format` | `pnpm run test:unit --run` / `pnpm run test:e2e` |
| `dbml-studio/` | `pnpm run check` | （web の prettier 設定に準拠） | `pnpm run test` |

> パッケージマネージャは **pnpm に統一**。`npm` / `bun` / `yarn` のコマンド・ロックファイル・設定を追加しない。

## ファイルサイズ

- 1 モジュール 1 責務。**800 行超で分割を強く推奨**（600 行で予告警告）。hook `post-edit-file-size` が警告する
