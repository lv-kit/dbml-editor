---
name: codebase-onboarding
description: dbml-editor のコードベースに素早く入るためのオンボーディング。ディレクトリ構成・主要モジュール・データフローの地図。「このリポの構成」「どこに何がある」「オンボーディング」を問われたらロードする。
---

> ## ⚠️ dbml-editor 固有ガイダンス（最優先）
> コード検索は **semble MCP を第一選択**（`.claude/rules/common/code-search.md`）。まず semble、次に Read。

## リポジトリ地図

| ディレクトリ | 内容 |
|---|---|
| `web/` | SvelteKit Web アプリ（Cloudflare Workers / Drizzle / Firebase Auth / shadcn+Tailwind4） |
| `dbml-studio/` | SvelteKit + Tauri デスクトップアプリ |
| `.claude/` | Claude Code ハーネス（rules/hooks/agents/commands/workflows/skills） |
| `.codex/` | 管理セッション（タスク分解・検証） |
| `.github/` | PR テンプレート |

## web/ 主要モジュール

| 場所 | 役割 |
|---|---|
| `src/routes/**` | ページ・API（`+page.svelte` / `+page.server.ts` / `+server.ts`） |
| `src/lib/server/db/schema.ts` | Drizzle スキーマ（DB の正本） |
| `src/lib/server/{session,firebase-auth,services}` | サーバ専用（認証/セッション） |
| `src/auth.ts` / `hooks.server.ts` | 認証設定・リクエストフック |
| `src/lib/{dbml-validator,members,file-system}.ts` | 純粋ドメインロジック |
| `src/lib/components/` | UI（shadcn ベース） |

## 入り方
1. `AGENTS.md` を読む（実装規約の正本）
2. 変更対象に応じて `.claude/rules/**` の該当ファイル
3. 対象コードを semble で特定して Read
4. Svelte/SvelteKit は Svelte MCP（`list-sections` → `get-documentation`）
