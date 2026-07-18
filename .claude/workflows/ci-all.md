# workflow: ci-all

`/ci-all` の詳細手順。ローカル CI 相当を対象領域に対して実行し、失敗時の分岐を定める。

## 判断: 対象領域の決定
- 引数指定（web/studio/all）があればそれに従う
- 無指定なら `git status --short` で変更のある領域を判定する
- 両方変更されていれば両方実行する

## web/ の手順
```bash
cd web
pnpm run check          # svelte-kit sync + svelte-check（型検査）
pnpm run lint           # prettier --check + eslint
pnpm run test:unit --run
# UI を変更した場合のみ:
pnpm run test:e2e       # Playwright（日本語フォント確認・スクショ）
```

## dbml-studio/ の手順
```bash
cd dbml-studio
pnpm run check
pnpm run test
```

## 失敗時の分岐
- 型/lint/テストが失敗 → `/build-fix`（`build-error-resolver`）で根本原因を修正 → 再実行
- prettier のみ失敗 → `pnpm run format` で整形 → 再実行
- E2E がフォント/表示で失敗 → スクリーンショットを確認し UI を修正

## 完了条件
- 対象領域すべてのコマンドが緑
