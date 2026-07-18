# development-workflow（標準開発フローの正本）

> **正本**: 1タスクを完了させるまでの標準手順。

## 標準フロー

```
Understand → Plan → TDD → Review → CI → Commit → PR
```

1. **Understand**: semble/Read で既存コードと要件を把握。不明点は実装前に確認（`AGENTS.md` 推測禁止）
2. **Plan**: 複数ファイル変更は `/plan`（横断・高難度は `/plan-deep`）→ ユーザー確認
3. **TDD**: 失敗するテスト → 最小実装 → リファクタ（正本 `.claude/rules/common/testing.md`）
4. **Review**: `/code-review`（必要に応じ `/security-review` `/db-review`）
5. **CI**: `/ci-all` で lint/型検査/テスト一括。失敗は `/build-fix`
6. **Commit**: Conventional Commits（正本 `.cursorrules`）。pre-commit hook が CI を実行
7. **PR**: `/pr`（base=`main`）。既存 PR があれば head へ push

## 管理セッション併用時

- 管理セッション（`.codex/`）でタスク分解 → プロンプト生成 → `tasks/backlog/` へ
- 実装セッションで `/take-task` → 上記フロー → `/handoff`
- 管理セッションが `/verify-task`（report ではなく実 diff を正とする）
