# workflow: issue → PR（管理/実装セッション標準フロー）

## 全体像

```
[管理セッション: read-only]                     [実装セッション: Claude Code]
scripts/context-package.sh で現状収集
 → task-planner でタスク分解
 → prompt-designer でプロンプト生成（必須9要素・出力前ゲート）
 → tasks/backlog/TASK-XXX.md 保存 ───────────→ /take-task（backlog→in-progress）
                                                → /plan（or /plan-deep）→ ユーザー確認
                                                → /tdd → 実装
                                                → /ci-all（失敗は /build-fix）
                                                → /code-review（必要に応じ security/db review）
                                                → /pr（base=main・既存PR優先・要承認）
                                                → /handoff（引き継ぎノート + done へ）
 ← done/ を受領
 → /verify-task（引き継ぎノートの主張と実 git diff を read-only 照合）
    ├ PASS → reviewer で最終レビュー → 人間承認
    └ FAIL → in-progress へ差し戻し（実装セッションが再着手）
```

## 各ステージの要点

- **タスク分解**: 1タスク=1ブランチ=1PR。触ってよい/いけない範囲を明記
- **プロンプト**: 9要素。完了条件に証拠の在り処を併記（`prompts/prompt-design-guide.md`）
- **検証**: report を鵜呑みにせず実 diff を正とする
