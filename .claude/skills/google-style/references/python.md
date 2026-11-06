# Python — Google Python Style Guide

適用範囲: `.py` ファイル。行長・インデント・クォート・空行は ruff / black / flake8 の設定に従い、ここでは扱わない。

## 命名

- モジュール / パッケージ: `lower_with_under`。ハイフンは使わない
- クラス / 例外: `CapWords`。例外クラスは `Error` で終える（`FooError`）。`Exception` 接尾辞は使わない
- 関数 / メソッド / 変数 / 引数: `lower_with_under`
- 定数: `CAPS_WITH_UNDER`
- モジュール内部専用: 先頭に `_`。クラス内部専用も `_`。ダブルアンダースコアの name mangling は使わない
- 1文字名は、カウンタ・イテレータ・`with` の受け（`f` for file）・例外の `e` に限る。`l` `O` `I` は使わない
- 型変数は `CapWords`。制約付きなら意味が分かる名前（`_T_co` のような接尾辞は共変を表す）
- 「型を名前に埋めない」。`name_string` ではなく `name`

## docstring

- 公開モジュール / クラス / 関数には docstring を書く。三重ダブルクォート `"""`
- 1行目は動詞で始まる要約文をピリオドで終える。呼び出し方の再掲ではなく「何をするか」を書く
- 引数・戻り値・送出例外がある関数は `Args:` `Returns:`（ジェネレータは `Yields:`）`Raises:` を書く
- 自明な短い関数（getter 等）は要約1行のみでよい。書かない選択はしない
- クラスは `Attributes:` で公開属性を説明する
- オーバーライドしたメソッドは、挙動が変わらないなら親の docstring を継承してよい

```python
def fetch_rows(table: str, keys: Sequence[str]) -> dict[str, list[str]]:
    """Fetches rows from a table.

    Args:
        table: Name of the table to read.
        keys: Row keys to retrieve.

    Returns:
        A dict mapping each key to its row values.

    Raises:
        KeyError: If a key is not present in the table.
    """
```

## 型アノテーション

- 公開 API の関数シグネチャには型を付ける。付けない場合は理由がある場合に限る
- 循環 import や未定義の前方参照は文字列リテラル、または `from __future__ import annotations`
- `typing.Any` は逃げ道。型が定まらない理由をコメントで残す
- `Optional[X]` を暗黙にしない。デフォルトが `None` なら型にも `| None` を明示する

## 例外

- bare `except:` を書かない。`except Exception:` も、再送出するか記録する場合に限る
- 例外は組み込みか、`Exception` を継承した自作クラスから送出する。文字列を raise しない
- `try` ブロックは最小限に。例外が起きうる行だけを囲む
- `finally` / `with` で確実に解放する。ファイルやロックは `with` を使う
- assert は前提条件の検証にのみ使う。ユーザー入力の検証や制御フローには使わない

## 関数と構造

- 可変オブジェクト（`[]` `{}` `set()`）をデフォルト引数にしない。`None` を既定にして関数内で生成する
- ネストした関数 / クロージャは、ローカル変数を閉じ込める目的があるときだけ使う
- 内包表記は「入力1つ・for 1つ・条件1つ」まで。それを超えるならループで書く
- lambda は1行に収まる短いものだけ。名前を付けたいなら `def` を使う
- プロパティは軽量な計算にだけ使う。重い処理や副作用があるならメソッドにする
- 条件式（三項演算子）は各部が1行に収まるときだけ
- グローバル変数（モジュールレベルの可変状態）は避ける。必要なら定数にするかクラスに閉じる
- 関数は1つのことをする。40行を超えたら分割を検討する

## import と実行

- import は `import x` か `from x import y` のみ。`from x import *` は使わない
- 相対 import を使わない。パッケージルートからの絶対 import で書く
- 順序は 標準ライブラリ → サードパーティ → 自リポジトリ。グループ間は空行で区切り、各グループ内はパス順にソート
- 型チェック専用の import は `if TYPE_CHECKING:` に入れる
- 実行可能スクリプトは処理を `main()` に入れ、`if __name__ == '__main__':` から呼ぶ。import 時に副作用を起こさない

## コメント

- 「なぜ」を書く。コードを読めば分かる「何を」は書かない
- 直感に反する箇所、非自明な計算、回避策には必ず理由コメントを付ける
- TODO は `# TODO: <文脈（issue URL 等）> - <やること>` の形式で書く。名前だけの TODO は残さない

原典: https://google.github.io/styleguide/pyguide.html
