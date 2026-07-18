# TASK-<番号>-<kebab-case>

> このテンプレのセクションはプロンプト必須9要素と対応する（正本: `.codex/prompts/prompt-design-guide.md`）。

## 前提状態
<現在の実装状態・関連 Issue/PR>

## 実施内容
<変更するファイルパスを明示。「良い感じに」禁止>

## 触ってよい範囲
- <path(s)>

## 触ってはいけない範囲
- <path・公開API・データ形式>

## 制約
- <パッケージマネージャ pnpm / スコープ厳守 / 既存挙動維持 など>

## テストコマンド（完了条件）
```bash
cd web && pnpm run check && pnpm run lint && pnpm run test:unit --run
```

## 完了条件チェックリスト（各項目に証拠の在り処を併記）
- [ ] <条件> — 証拠: <spec名 / path:line / コマンド出力>
- [ ] スコープ外変更なし — 証拠: git diff --stat

## 最終報告内容
<handoff で書く項目: 変更概要 / 実 diff / 検証結果 / 未対応>

## 引き継ぎノート
<!-- 実装セッションが /handoff で追記する -->
