# バージョンアップの進め方

## 1. 基準を決める

上げ始める前に3つを確定させる。対話できる環境では**1問ずつ**聞く（まとめて投げない）。対話できない環境の扱いは `SKILL.md` の「対話できない環境での扱い」に従う。

**Q1. どこまで上げますか？**

- A) セキュリティ修正のみ — 脆弱性が報告されているものだけ。差分が最小で、影響範囲を読み切れる
- B) 最新の安定版 / LTS — メジャーは跨がず、その系列の最新へ
- C) 最新版 — メジャー跨ぎを含む
- D) 特定バージョン指定 — 目標が決まっている場合

**Q2. メジャーを跨いでよいですか？**

- A) 跨がない — 破壊的変更が入らない。既存コードの修正は原則不要
- B) 跨ぐ — 移行ガイドを読み、破壊的変更へ追随する作業が発生する

**Q3. 連鎖をどこまで許しますか？**

- A) 対象ライブラリのみ — 解決できなければそこで止めて報告する
- B) 周辺ライブラリまで — 依存解決に必要な範囲で他のライブラリも上げる
- C) 言語ランタイム・ビルド基盤まで — Python / Node / PHP / Dart / Rust の本体、CI イメージ、Dockerfile まで含む

決まった内容は作業開始前に一度読み上げて確認する。

## 2. 対象を上げる

**先回りして周辺を上げない。** 対象だけを上げ、依存解決が壊れてから範囲を広げる。

| 系統 | 上げる | 現状を見る |
|---|---|---|
| Python | `uv lock --upgrade-package <pkg>` / `pip install -U <pkg>` | `uv tree` / `pip list --outdated` |
| TypeScript / JavaScript | `npm install <pkg>@<ver>` / `pnpm up <pkg>` | `npm outdated` |
| PHP | `composer require <pkg>:^<ver>` / `composer update <pkg>` | `composer outdated` |
| Dart / Flutter | `flutter pub upgrade --major-versions <pkg>` | `flutter pub outdated` |
| Rust | `cargo update -p <pkg>` | `cargo outdated`（要 cargo-outdated） |

パッケージマネージャの種類はリポジトリの lock ファイルで判断する（`uv.lock` / `package-lock.json` / `pnpm-lock.yaml` / `composer.lock` / `pubspec.lock` / `Cargo.lock`）。**lock ファイルの種類を変えない。**

## 3. 壊れた分だけ追随する

解決エラーが出たら、そこに書かれた制約元を特定してから最小限だけ上げる。エラーを読まずに周辺を上げない。

| 系統 | 制約の場所 | 制約元を特定する |
|---|---|---|
| Python | `pyproject.toml` の `requires-python`、各依存の `Requires-Python` | 解決エラーの本文（uv / pip が競合元を出す） |
| TypeScript / JavaScript | `package.json` の `engines`、`peerDependencies` | `npm ls <pkg>` / インストール時の peer 警告 |
| PHP | `composer.json` の `require` の `php`、`config.platform` | `composer prohibits <pkg> <ver>`、`composer prohibits php 8.4`（`why-not` は同じもの） |
| Dart / Flutter | `pubspec.yaml` の `environment: sdk` と `flutter` | `flutter pub deps`、解決失敗時の出力 |
| Rust | `Cargo.toml` の `rust-version` | `cargo tree -i <crate>` |

**広げるたびに根拠を記録する。** 「なぜこれも上げたのか」を、解決エラーか制約元の出力とセットで残す。あとで差分を読む人が、連鎖と「ついでに上げたもの」を区別できるようにする。

Q3 で許した範囲を超える必要が出たら、そこで止めてユーザーに戻す。勝手に広げない。

## 4. 公式情報で挙動変化を確認する

メジャー・マイナー・パッチを問わず、上げたすべての対象（対象ライブラリ、連鎖して上げた周辺ライブラリ、言語ランタイム）について公式リリースノート/CHANGELOGを確認する。semver は必ずしも厳密に守られておらず、マイナー・パッチでも挙動が変わることがある。

1. `ctx7`（`find-docs` スキルの手順）でバージョン指定の library ID を引く。
2. `ctx7` が対象を持たない場合（言語ランタイム本体、対応外のライブラリなど）は `WebFetch` で公式のリリースノート/CHANGELOGページを直接確認する。
3. 既存コードが使っている API・挙動に関わる変更点を洗い出す。**既存機能を壊しうる変更が見つかったら、そこで作業を止めてユーザーに報告する。** 報告には変更点の引用元、影響を受ける既存コードの箇所、リスクの内容を含める。
4. 解消してから次へ進む。解消は次のいずれか。
   - 既存挙動を保つコード修正、またはリスクを検知するテストの追加
   - **ユーザーが挙動変化の受け入れを明示的に承認する**（上流が意図した仕様変更まで無理にコードで吸収しない）
5. メジャーバージョンを跨いだ場合は、上記に加えて移行ガイドに沿った破壊的変更への追随作業を行う。

## 5. 非推奨を是正する

`references/deprecation.md` に移る。バージョンを上げた直後は、それまで非推奨でなかった API が新たに非推奨になっていることが多い。

## 6. コミットを分ける

2つに分ける。

1. **依存の更新 + lock + 破壊的変更への最小追随** — ここは分けない。分けると途中にビルドできないコミットが残り、`git bisect` が使えなくなる
2. **非推奨の書き換え** — 挙動を変えない。単独で revert できる

## 7. 完了条件

そのリポジトリに存在するゲートをすべて緑にする。

- lint / formatter（ruff, eslint, PHP-CS-Fixer, `dart format`, `cargo fmt` 等）
- 型チェック（mypy, tsc, PHPStan, `dart analyze`）
- テスト
- ビルド

**通すために設定を緩めない。** `# type: ignore`、`@phpstan-ignore`、`// ignore:`、lint の除外設定を足して通すのは緑ではない。緑にできないときは Q1 の到達点を下げてユーザーに確認する。

報告には、採用した基準（Q1〜Q3 の答え）と、連鎖して上げたものとその根拠を必ず含める。
