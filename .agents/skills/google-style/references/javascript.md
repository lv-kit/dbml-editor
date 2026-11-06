# JavaScript — Google JavaScript Style Guide

適用範囲: `.js` `.jsx` `.mjs` `.cjs`。TypeScript のファイルには `typescript.md` を使う。行長・インデント・クォート・セミコロン・末尾カンマは prettier / eslint の設定に従い、ここでは扱わない。

## 変数と宣言

- `var` は使わない。再代入しないなら `const`、するなら `let`
- 1つの宣言につき変数1つ（`let a = 1, b = 2` と書かない）
- 変数は使う直前で宣言し、スコープを最小にする
- グローバルスコープに変数を作らない
- 宣言前に参照しない（巻き上げに頼らない）

## 命名

- クラス / インターフェース / 型 / enum: `UpperCamelCase`
- 変数 / 関数 / メソッド / プロパティ: `lowerCamelCase`
- 定数（不変かつスコープをまたぐもの）: `CONSTANT_CASE`。ローカルの不変値は `lowerCamelCase`
- private なプロパティは末尾に `_`（`this.counter_`）
- ファイル名は小文字。`-` か `_` のみ使う
- 略語は1単語として扱う（`loadHttpUrl`。`loadHTTPURL` ではない）
- 名前を短く削らない。意味が読み取れる長さにする

## 式と制御フロー

- `==` / `!=` は使わない。`===` / `!==` を使う。`x == null` で null と undefined を同時に判定する場合のみ例外
- `eval` と `Function` コンストラクタは使わない
- `with` 文は使わない
- 配列の反復に `for-in` を使わない（プロトタイプチェーンを辿るため）。`for-of` か配列メソッドを使う
- 文字列連結よりテンプレートリテラルを使う
- `switch` の各 case は `break` / `return` / `throw` で終える。フォールスルーさせるなら必ずコメントを書く
- 単文でも `if` / `for` / `while` の本体はブレースで囲む
- セミコロンの自動挿入に頼らず、明示的に書く

## 関数

- アロー関数を優先する。`this` の再束縛（`bind(this)` / `const self = this`）は書かない
- `arguments` を使わない。rest パラメータ（`...args`）を使う
- デフォルト引数に副作用のある式や関数呼び出しを置かない
- 関数宣言をブロック内（`if` の中など）に置かない
- ジェネレータの `*` は `function*` のように関数キーワード側に付ける

## クラスとオブジェクト

- `class` 構文を使う。`prototype` を直接いじらない
- 組み込みオブジェクトのプロトタイプを拡張しない
- 空のコンストラクタは書かない
- getter / setter に副作用を持たせない。値を返すだけにする
- 状態を持たない処理は、クラスにせずモジュールレベルの関数として export する
- オブジェクトリテラルではショートハンド（`{foo}`）とメソッド記法（`{foo() {}}`）を使う

## 例外

- `throw` するのは `Error`（またはそのサブクラス）だけ。文字列やリテラルを throw しない
- 空の catch ブロックを書かない。握り潰すなら理由をコメントで残す
- Promise を投げっぱなしにしない。`await` するか `.catch()` を付ける

## モジュール

- ES モジュール（`import` / `export`）を使う
- named export を使う。default export は使わない
- ファイルをまたぐ循環 import を作らない
- `goog.provide` / `namespace` のようなグローバル名前空間パターンは使わない

## コメント

- 公開する関数・クラス・ファイルには JSDoc（`/** */`）を書く。`@param` `@return` に型を書く（TypeScript と違い型注釈がないため）
- 実装の途中経過の説明は `//` で書く
- 「なぜ」を残し、コードを読めば分かる「何を」は書かない
- TODO は `// TODO: <文脈（issue URL 等）> - <やること>`

原典: https://google.github.io/styleguide/jsguide.html
