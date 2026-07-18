# dbml-editor — Claude Code 入口

DBML スキーマエディタ（`web/`: SvelteKit + Cloudflare Workers ／ `dbml-studio/`: SvelteKit + Tauri）。

> **正本は `AGENTS.md` と `.claude/**`。矛盾したらこの2つを優先する。**
> 本ファイルは Claude Code の薄い入口であり、実装規約を再掲しない。

## 参照順（トークン節約 — 一括で読まない）

1. まず `AGENTS.md`（実装ルールの正本）
2. 変更対象に応じて `.claude/rules/**` の該当ファイルだけ（下表）
3. `.claude/` 全体の地図が必要なら `.claude/README.md`

## 絶対に守ること（最優先ルール — rules/ より優先・例外なし）

### 推測で実装しない
- 不明点は必ず確認してから実装する。既存コードを Read / semble で把握してから変更する
- 依存 API を新規利用する前に公式ドキュメント（Svelte MCP / find-docs）を確認する

### スコープを超えない
- 指示されたファイル・機能だけを変更する（「ついでに直す」は禁止）
- linter / tsconfig / prettier などの設定ファイルは指示なく変更しない
- 既存の挙動・公開 API・データ形式は明示的な要件がない限り変更しない

### 計画なしに実装しない
- 複数ファイルにまたがる変更は `/plan` で計画 → ユーザー確認を得てから実装する

## ディレクトリ別ルール適用

| 変更対象 | 適用ルール（正本） |
|---|---|
| `web/**`（SvelteKit/UI/DB） | `AGENTS.md` + `.claude/rules/svelte/` + `.claude/rules/typescript/` |
| `dbml-studio/**`（Tauri） | `AGENTS.md` + `.claude/rules/svelte/`（Tauri固有は同ファイル末尾） |
| DB スキーマ（`web/src/lib/server/db/**`） | `.claude/rules/common/patterns.md` の DB 節 + `.claude/rules/common/doc-sync.md` |
| 認証（`web/src/auth.ts`, `hooks.server.ts`, `lib/server/session.ts`） | `.claude/rules/common/security.md` |
| すべて | `.claude/rules/common/`（横断規約） |

## 共通規約（各項目は正本へのポインタのみ）

- コード検索: **semble MCP を第一選択**（grep はフォールバック）— 正本 `.claude/rules/common/code-search.md`
- Git: `main` ← `<tool>/<topic>` — 正本 `.claude/rules/common/git-workflow.md`
- コミット: 日本語・Conventional Commits — 正本 `.cursorrules`
- ドキュメント同期 — 正本 `.claude/rules/common/doc-sync.md`
- トークン最適化・モデル選択 — 正本 `.claude/rules/common/claude-code-usage.md`

## エフォートポリシー / モデルルーティング

- 通常は中エフォート・**Sonnet**。単純編集は低エフォート・**Haiku**
- 複雑なデバッグ / 横断リファクタ / アーキテクチャ判断のみ高エフォート・**Opus**

## レビュー時のエージェント使い分け

| 観点 | エージェント |
|---|---|
| 一般コード品質 | `code-reviewer` |
| 認証・認可・秘密情報 | `security-reviewer` |
| Svelte/SvelteKit 固有 | `svelte-reviewer` |
| DB スキーマ / Drizzle | `database-reviewer` |
| パフォーマンス | `performance-optimizer` |

---

## Svelte MCP（必須）

Svelte / SvelteKit の作業では、最初に `list-sections` を実行し、関連する全セクションを `get-documentation` で取得する。Svelte コードを書いたら `svelte-autofixer` を問題がなくなるまで実行する。プロジェクト内のファイルへ書いた場合は Playground link を生成しない。
