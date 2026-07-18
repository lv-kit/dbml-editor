# testing（テスト方針の正本）

> **正本**: テストスタック早見表・TDD サイクル・カバレッジ方針。
> テストを「いつ書くか」の原則は `AGENTS.md`（挙動変更は先に失敗するテスト）。

## 領域別テストスタック早見表

| 領域 | ユニット | E2E | その他 |
|---|---|---|---|
| `web/` | Vitest（`pnpm run test:unit --run`） | Playwright（`pnpm run test:e2e`） | Storybook（`pnpm run storybook`） |
| `dbml-studio/` | Vitest（`pnpm run test`） | — | — |

## TDD サイクル

1. **Red**: 挙動を変える前に、失敗するテストを追加/更新する
2. **Green**: テストを通す最小の実装を書く
3. **Refactor**: テストが緑のままリファクタする

- バグ修正には**再発テスト**を必ず付ける
- 認可・入力検証・データ更新は**正常系と拒否/失敗系の両方**を含める
- イベント値・フォーム値は境界で型と内容を検証するテストを書く

## UI 変更時の追加検証

- `web/` の UI を変更したら、**日本語フォントを確認**のうえ Playwright でスクリーンショットを撮る
- `web/` 変更時はコンテナ内検証（`web/` で `docker compose up --build`）を行う（正本 `AGENTS.md`）

## 変更後の必須実行

- 対象テスト → `pnpm run check` → `pnpm run lint` → 全テスト、がすべて成功していること
