---
paths:
  - "web/src/**/*.svelte"
  - "web/src/**/*.css"
  - "web/src/routes/**"
  - "web/src/stories/**"
  - "dbml-studio/src/**/*.svelte"
  - "dbml-studio/src/**/*.css"
  - "docs/design.md"
---

# ui-design（UI/UX デザインスキル適用の正本）

> **正本**: フロントエンド・UI/UX を実装・変更するときに参照するデザインスキルと動作ルール。shadcn・Tailwind・色トークンの規約は `AGENTS.md` の「Svelte と UI」節、Svelte 固有規約は `.claude/rules/svelte/patterns.md`。

## 優先順位

1. 既存デザインシステム（`components.json`、shadcn コンポーネント、既存の色・spacing・radius トークン、`docs/design.md` の決定事項）
2. 下記スキルの指針（既存デザインシステムが定めていない領域だけに適用する）

スキル同士の指針が衝突したら、既存デザインシステムに近い方を採る。

## 参照スキル

画面・コンポーネントを作るときは次を参照する。リポジトリ内にあるものは `.claude/skills/`（Codex などは `.agents/skills/`）を読み、無いものは URL を参照する。

| スキル | 参照先 | 主に使う観点 |
|---|---|---|
| frontend-design（Anthropic） | `.claude/skills/frontend-design` / https://github.com/anthropics/skills/tree/main/skills/frontend-design | 基本のフロントエンドデザインパターン、視覚的な仕上げ |
| Impeccable | https://impeccable.style | 既存デザインシステムとプロダクト文脈を踏まえた設計、デザイン決定の記録と引き継ぎ |
| Taste Skill | https://github.com/Leonxlnx/taste-skill | タイポグラフィとレイアウトの選択 |
| UI/UX Pro Max | `.claude/skills/ui-ux-pro-max` / https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | UI/UX パターン、インタラクションデザイン |
| emil-design-eng（Emil Kowalski） | `.claude/skills/emil-design-eng` / https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng | モーション、インタラクションの細部 |
| Web Interface Guidelines（Vercel） | `.claude/skills/web-design-guidelines` | タイポグラフィ、インタラクション、アクセシビリティ |
| Better UI（Jakub Krehel） | リポジトリ未導入。右列の観点をチェック項目として使う | タイポグラフィ、レイアウト、カラー、モーション、サーフェス。ネストした要素の radius 計算と光学的な整列 |
| Refero Design | https://refero.design | 複数ステップのフロー設計（スタイル・スクリーン・シーケンスの組み合わせ） |
| anti-ui-slop | `.claude/skills/anti-ui-slop` | 汎用的すぎる UI の回避、仕上げ前のゲート |

精度（見た目の完成度・一貫性・使いやすさ・実装の質）が上がる場合に限り、関連する他のスキル（`ooui`、`shadcn`、`frontend-implementation-checklist`、リポジトリ未導入の vercel-composition-patterns・sleek-design-mobile-apps・canvas-design など）も追加で適用する。寄与しないスキルは適用しない。

## 動作ルール

- コードを書く前に、適用するスキルとその理由を簡潔に宣言する。
- 新しい画面や大きなレイアウト変更では、実装前に画面を先に描画（Storybook、Playwright のスクリーンショット、モックなど）して確認する。
- 複数ステップのフローは、個々の画面ではなくジャーニー全体で設計する。
- 新たに確定したデザイン決定（トークンの追加、コンポーネントの使い分け、レイアウトの原則など）は `docs/design.md` に現在の仕様として記録し、次の作業へ引き継ぐ。ファイルが無ければ新設する。記録方法は `.claude/rules/common/doc-sync.md` に従う。

## 出力前の自己チェック

- 一貫性: spacing、radius、typography、color が既存トークンと揃っている
- アクセシビリティ: コントラスト、キーボード操作、フォーカス表示、ラベル、`prefers-reduced-motion`
- 光学的な整列: ネストした要素の radius（外側 radius = 内側 radius + padding）、アイコンとテキストの視覚的な中心
- 不要な装飾がない: 意味のないグラデーション、影、アニメーション、枠線を足していない
- ユーザー目的への適合: 画面の主要タスクが最短で達成できる
- ダークモードと日本語フォントで表示が崩れない
