---
name: google-style
description: >-
  Google Style Guide に準拠したコードを書く / レビューするためのスキル。
  Python・TypeScript・JavaScript・Shell・HTML/CSS・JSON API・Markdown の7言語について、
  linter や formatter が機械的に直せない判断領域（命名、docstring / コメント、例外設計、
  モジュール構成、型の使い分け、API のレスポンス構造）の規約を提供する。
  コードを新規に書くとき、既存コードを変更するとき、コードレビューで指摘事項を洗い出すときに使う。
  「スタイルガイド」「規約」「コーディング規約」という単語が出ていなくても、
  上記いずれかの言語のファイルを書く / 直す / レビューする場面なら適用する。
  発火しない場面: 上記7言語以外のファイルのみを扱うとき。
  リポジトリに linter / formatter があっても発火する（衝突時の優先順位はスキル本体に書いてある）。
---

# Google Style Guide

## 使い方

1. 下の対応表から、**いま触るファイルに該当する reference を1本だけ**読む
2. 他の言語の reference は読まない。複数言語を同時に触るときだけ、該当するぶんを読む
3. reference に書かれていない論点は、リポジトリの既存コードに合わせる

## 対応表

| 拡張子 / 対象 | reference |
|---|---|
| `.py` | `references/python.md` |
| `.ts` `.tsx` `.mts` | `references/typescript.md` |
| `.js` `.jsx` `.mjs` `.cjs` | `references/javascript.md` |
| `.sh` `.bash` | `references/shell.md` |
| `.html` `.css` `.scss` | `references/html-css.md` |
| 自作 API の JSON リクエスト / レスポンス | `references/json-api.md` |
| 人間向けの `.md` | `references/markdown.md` |

## 優先順位

**リポジトリの既存規約が常に優先。** linter / formatter / 型チェックの設定
（ruff, black, eslint, prettier, shellcheck, tsconfig 等）と既存コードのスタイルに従い、
Google Style Guide は既存規約が沈黙している領域にだけ適用する。
衝突を解消するために設定ファイルを変更してはいけない。

各 reference は、この前提のもとで **formatter が自動で直さない判断領域だけ**を扱う。
インデント幅・行長・クォート・セミコロン・末尾カンマといった機械的に決まる項目は
どの reference にも書いていない。それらは formatter の設定に従う。

## 適用範囲を取り違えやすい3つ

| reference | 適用する | 適用しない |
|---|---|---|
| `json-api.md` | 自分たちが設計する API のリクエスト / レスポンス | `package.json` `tsconfig.json` 等の設定ファイル、外部仕様が決まっている JSON |
| `markdown.md` | README、`docs/`、設計メモ、PR 本文 | `CLAUDE.md` `AGENTS.md` `rules/*.md` `SKILL.md` などエージェント向け指示ファイル |
| `html-css.md` | `.html` `.css` `.scss` ファイル | JSX/TSX 内のマークアップ、Tailwind 等のユーティリティクラス、CSS-in-JS（`typescript.md` の管轄） |
