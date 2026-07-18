# prompt-design-guide（実装セッション向けプロンプトの正本）

管理セッションが実装セッション（Claude Code）へ渡すプロンプトは、必ず以下の**9要素**を含む。

## 必須9要素

1. **対象 Issue / PR**: 番号・URL・背景
2. **ブランチ**: `<tool>/<topic> → main`（既存 PR があれば head ブランチ名）
3. **推奨コマンド・エージェント**: `/take-task` `/plan` `/tdd` `/ci-all` `/pr` / planner・tdd-guide・各 reviewer
4. **実施内容**: 変更するファイルパスを明示。「良い感じに」「適宜」などの曖昧表現を禁止
5. **触ってよい範囲**: 変更を許可するパス
6. **触ってはいけない範囲**: 変更禁止のパス・公開API・データ形式
7. **テストコマンド**: そのまま実行できる形（例 `cd web && pnpm run check && pnpm run test:unit --run`）
8. **最終報告内容**: handoff で書くべき項目
9. **完了条件チェックリスト（最重要）**: 各項目に「証拠の在り処」を併記
   - 例: `[ ] 招待重複を拒否する — 証拠: members.spec.ts の "rejects duplicate invite"`

## 出力前ゲート（生成モード）

- 9要素すべてが埋まっているか自己チェックする。**1つでも欠けていたら出力しない**
- 4/5/6 は具体パスで書く。7/9 はコピペ実行・機械照合できる形にする

## 検証モード

- 9要素の 9（完了条件チェックリスト）を突合軸として、**実 git diff / 実テスト**で1項目ずつ確認する
- report の主張ではなく実 diff を正とする

## 種別別テンプレート

`prompts/` の種別別テンプレ（bugfix / refactor / db-change / auth-change / test-add / performance）を土台に、上記9要素を埋める。対応する詳細フローは `workflows/`。
