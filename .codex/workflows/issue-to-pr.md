# workflow: issue → PR（管理/実装セッション標準フロー）

## 全体像

```
[管理セッション: read-only]                     [実装セッション: Claude Code / Codex implementer]
scripts/context-package.sh で現状収集
 → task-planner でタスク分解
 → prompt-designer でプロンプト生成（必須9要素・出力前ゲート）
 → tasks/backlog/TASK-XXX.md 保存 ───────────→ /take-task（backlog→in-progress）
                                                → /plan（or /plan-deep）→ ユーザー確認
                                                → implementer または Claude Code /tdd → 実装
                                                → /ci-all（失敗は /build-fix）
                                                → /code-review + security-auditor / svelte-reviewer / database-reviewer（該当時）
                                                → 指摘ゼロまで修正 → 影響検査 → 同じ reviewer で再レビュー
                                                → /handoff（引き継ぎノート + done へ）
                                                → git-publisher（base=main・既存PR優先・push/新規PRは要承認）
 ← done/ を受領
 → /verify-task（引き継ぎノートの主張と実 git diff を read-only 照合）
    ├ PASS → reviewer + security-auditor / svelte-reviewer / database-reviewer（該当時）で最終レビュー
    │         ├ 指摘あり → in-progress へ差し戻し → 修正・再検査・再レビュー
    │         └ 指摘ゼロ → 人間承認
    └ FAIL → in-progress へ差し戻し（実装セッションが再着手）
```

## 各ステージの要点

- **タスク分解**: 1タスク=1ブランチ=1PR。触ってよい/いけない範囲を明記
- **プロンプト**: 9要素。完了条件に証拠の在り処を併記（`prompts/prompt-design-guide.md`）
- **検証**: report を鵜呑みにせず実 diff を正とする。完了報告・handoff・commit・PR の前に reviewer の指摘ゼロを必須にする
