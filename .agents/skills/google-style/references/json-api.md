# JSON API — Google JSON Style Guide

適用範囲: **自分たちが設計する API のリクエスト / レスポンス JSON のみ**。`package.json` `tsconfig.json` `.eslintrc.json` などツールが形式を決めている設定ファイル、および外部仕様（OpenAPI で他社が定義したスキーマ、Web 標準の manifest 等）に従う JSON には適用しない。それらは元の仕様が優先。

## 基本

- トップレベルはオブジェクト。配列を直接返さない（後からメタ情報を足せなくなるため）
- プロパティ名は `lowerCamelCase` の文字列。ダブルクォートで囲む
- コメントを入れない
- 意味のないプロパティは出力しない。`null` を並べるより省略する
- ただし「値が無いこと」と「未設定であること」を区別する必要があるなら、明示的に `null` を返す
- 空の配列・空のオブジェクトは、要素が無いことを表すなら省略してよい

## 命名

- プロパティ名は英語、短く説明的に。予約語を避ける
- 配列を表すプロパティは複数形にする（`items`, `errors`）。それ以外は単数形
- 列挙値は文字列にする（数値のコードにしない）。値も一貫した記法に揃える
- 日付・時刻は RFC 3339 の文字列（`2026-08-02T10:00:00Z`）。エポック秒を使うならプロパティ名で単位が分かるようにする
- 期間は ISO 8601 の duration 文字列、時刻の範囲は開始と終了を別プロパティに分ける
- 数量に単位が伴うものは、単位をプロパティ名に含める（`timeoutMs`, `sizeBytes`）

## レスポンスの構造

- 1つのレスポンスに `data` と `error` を同時に入れない。成功なら `data`、失敗なら `error`
- ペイロードは `data` の下にまとめる。トップレベルに業務データを直接ばら撒かない
- コレクションは `data.items` に配列で入れ、ページングの情報を `data` 直下に置く
- リソースの種別を返す必要があるなら `kind`、識別子は `id`、自己参照 URL は `selfLink`
- ページングは `nextPageToken` のようなトークン方式を優先し、意味が固定できるときだけ `startIndex` / `totalItems` を使う

```json
{
  "data": {
    "kind": "user#list",
    "items": [
      {"id": "u_01", "displayName": "Taro", "createdAt": "2026-08-02T10:00:00Z"}
    ],
    "nextPageToken": "CAESB..."
  }
}
```

## エラー

- エラーは `error` オブジェクトにまとめ、`code`（数値または安定した文字列）と `message`（人間向け）を持たせる
- 詳細は `error.errors` の配列に入れ、各要素に `domain` `reason` `message` を持たせる
- `message` は UI にそのまま出せる想定で書く。内部のスタックトレースや SQL を含めない
- エラーコードは安定させる。文言だけを見て分岐させる設計にしない

```json
{
  "error": {
    "code": 404,
    "message": "User not found.",
    "errors": [
      {"domain": "user", "reason": "notFound", "message": "No user with id u_01."}
    ]
  }
}
```

## 予約プロパティ名

以下は意味が決まっている。別の用途に流用しない。

`data` / `error` / `items` / `kind` / `id` / `selfLink` / `etag` / `fields` / `nextPageToken` /
`totalItems` / `startIndex` / `itemsPerPage` / `updated` / `deleted` / `code` / `message` / `errors` / `domain` / `reason`

原典: https://google.github.io/styleguide/jsoncstyleguide.xml
