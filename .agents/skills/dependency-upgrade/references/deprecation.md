# 非推奨の検出と是正

## 手順

1. 触った箇所が非推奨 API を呼んでいるか、下の一次シグナルで確かめる
2. 出たものだけを、推奨される書き方へ変える
3. 一次シグナルに出ないが非推奨の疑いがあるときだけ、`ctx7`（`find-docs` スキル）でドキュメントを引く
4. 変更後、そのリポジトリのゲート（lint / 型チェック / テスト / ビルド）を通す

## 一次シグナル

| 系統 | マーカー | 検出 | 自動修正 |
|---|---|---|---|
| Python | `warnings.warn(..., DeprecationWarning)`、`@warnings.deprecated`（3.13+。それ以前は `typing_extensions.deprecated`） | 型チェッカの診断（mypy / pyright は PEP 702 のデコレータを読む）、`pytest -W error::DeprecationWarning` | なし |
| TypeScript / JavaScript | `@deprecated` JSDoc | `tsc` / tsserver の打ち消し線、eslint の `@typescript-eslint/no-deprecated` | なし |
| PHP | `@deprecated` PHPDoc、`#[\Deprecated]` | PHPStan（`method.deprecated` `property.deprecated` `property.deprecatedClass` 等の識別子で報告）、ランタイムの `E_DEPRECATED` / `E_USER_DEPRECATED` | Rector |
| Dart / Flutter | `@Deprecated('...')` | `dart analyze` / `flutter analyze` の `deprecated_member_use` | `dart fix` |
| Rust | `#[deprecated]` | `cargo build` の警告、`cargo clippy` | なし |

**PHP の注意**: PHPStan 2.x は非推奨の検出が本体に入っている。`phpstan-deprecation-rules` を別途足す前提で書かないこと。子クラスで再定義して非推奨を解除する場合は `@not-deprecated` を使う。

**Python の注意**: `DeprecationWarning` は既定で表示されない。`-W error::DeprecationWarning` を付けるか、テスト設定で昇格させないと見えない。`@warnings.deprecated` が付いていれば型チェッカが静的に拾えるので、そちらを先に見る。

## 自動修正ツールを使うとき

`dart fix` と Rector は**指定した範囲に一括で効く**。触った箇所だけという原則を破るので、必ず範囲を絞る。

### Rector

```bash
vendor/bin/rector <触ったファイルのパス> --dry-run
```

- 先に `--dry-run` で差分を見る。ファイルには書き込まれない
- パス引数を触ったファイルに限定する。プロジェクト全体に掛けない
- `--only <RuleClass>` で単一ルールに絞れる
- CI では `--dry-run` が変更を検出すると exit 1 になる

### dart fix

```bash
dart fix --dry-run
dart fix --apply
```

適用したら差分を確認し、触っていない箇所の変更は戻す。

## ctx7 を引く条件

一次シグナルは、ライブラリ側がコードにマーカーを付けている場合にだけ反応する。マーカーを付けずにドキュメントやリリースノートだけで非推奨を告知するライブラリもある（Python 系に多い）。

次のときだけ `find-docs` スキルの手順で `ctx7` を引く。

- メジャーバージョンを跨いだ直後で、移行ガイドに書かれた変更を追いたい
- 使っている API が古い記法に見えるが、一次シグナルには出ない
- 置き換え先の推奨形が分からない

引かないとき（`context7` ルールの除外に従う）: 通常のリファクタ、コードレビュー、業務ロジックのデバッグ。

## 是正して良いか迷ったら

置き換え先が挙動を変える場合は、**書き換えずに報告する**。非推奨の是正は挙動を変えないことが前提で、挙動が変わるなら別の判断が要る。
