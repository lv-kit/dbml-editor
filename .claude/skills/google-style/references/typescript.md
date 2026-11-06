# TypeScript — Google TypeScript Style Guide

適用範囲: `.ts` `.tsx` `.mts`。行長・インデント・クォート・セミコロン・末尾カンマは prettier / eslint の設定に従い、ここでは扱わない。JSX 内のマークアップと CSS-in-JS もこの reference の管轄（`html-css.md` は使わない）。

## 型

- `any` を書かない。値の形が不明なら `unknown` を使い、絞り込んでから触る。どうしても `any` が要るなら理由をコメントで残す
- 型アサーション（`as`）と非 null アサーション（`!`）は避ける。使うなら、なぜ安全かをコメントで書く。`as any` は使わない
- 型推論が効く箇所に冗長な型注釈を書かない（`const x: number = 5` ではなく `const x = 5`）。ただし公開 API のシグネチャには明示する
- オブジェクト型は `interface` を優先する。union / intersection / mapped type / 条件型が要るときだけ `type`
- `enum` の代わりに文字列リテラルの union（`type Mode = 'read' | 'write'`）を使う。使う場合も `const enum` は禁止
- `Array<T>` と `T[]` は、要素型が単純なら `T[]`、複雑なら `Array<T>`
- 変更しない配列 / プロパティには `readonly` を付ける
- `null` と `undefined` を混在させない。片方に統一する（省略可能を表すなら `undefined`）
- 型だけを import するときは `import type` を使う

## 命名

- 型 / クラス / インターフェース / enum: `UpperCamelCase`。インターフェースに `I` 接頭辞を付けない
- 変数 / 関数 / メソッド / プロパティ: `lowerCamelCase`
- グローバル定数: `CONSTANT_CASE`。ローカルの不変値は `lowerCamelCase` のままでよい
- private プロパティに `_` 接頭辞を付けない。`private` 修飾子を使う
- 略語は1単語として扱う（`HttpClient`、`XmlParser`。`HTTPClient` ではない）
- 型を名前に埋めない（`nameString` ではなく `name`）

## モジュール

- named export を使う。default export は使わない（import 側で名前がぶれるため）
- `import * as ns` は、名前空間として意味があるモジュールにだけ使う
- 循環 import を作らない
- 副作用だけの import（`import './polyfill'`）は最小限にし、理由をコメントで書く
- `namespace` / `module` キーワードは使わない。ES モジュールで表現する

## クラスと関数

- コンストラクタが空で何もしないなら書かない
- フィールドはコンストラクタのパラメータプロパティ（`constructor(private readonly foo: Foo)`）で簡潔に書いてよい
- 変更されないフィールドには `readonly` を付ける
- getter / setter に副作用を持たせない。重い処理はメソッドにする
- 状態を持たないならクラスにせず、モジュールレベルの関数として export する
- アロー関数を優先する。`this` の再束縛（`bind` / `self = this`）を書かない
- 引数のデフォルト値と rest パラメータを使い、`arguments` は使わない

## 制御フローと式

- `let` より `const`。`var` は使わない
- `==` / `!=` は使わない。`===` / `!==` を使う。ただし `x == null` で null と undefined を同時に判定する場合のみ例外
- `for-in` を配列に使わない。配列は `for-of` か配列メソッド
- 例外は `Error`（またはそのサブクラス）だけを throw する。文字列やオブジェクトを throw しない
- catch した値は `unknown` として扱い、`instanceof Error` で絞り込む
- Promise を投げっぱなしにしない。`await` するか、明示的に `.catch()` を付ける
- `eval` と `Function` コンストラクタは使わない

## コメント

- 公開 API には JSDoc（`/** */`）を書く。実装内部の説明は `//` で書く
- JSDoc に型を書かない。型は TypeScript の型注釈で表現する（`@param {string}` は書かない）
- 「なぜそう書いたか」を残す。コードを読めば分かることは書かない
- TODO は `// TODO: <文脈（issue URL 等）> - <やること>`

原典: https://google.github.io/styleguide/tsguide.html
