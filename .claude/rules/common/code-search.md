# code-search（コード検索ツール選択の正本）

> **正本**: コードを探すときのツール選択順。

## 選択順

1. **semble MCP を第一選択**（`search`）
   - 焦点を絞ったクエリで1回呼ぶと、ファイルパスと正確な行を返す
   - ローカルプロジェクトでは `repo` にプロジェクトルート（`/Users/takehiro/codes/stargazy/dbml-editor`）を渡す
   - 返ったパス:行へ直接移動する。同じ内容を grep で再検索しない
   - 類似コードは `find_related` で発見する
2. **フォールバック**: semble が使えない/ヒットしないときのみ `Grep` / `Glob`
3. 大量ファイルを横断する調査は `Explore` / `code-explorer` サブエージェントに委譲し、main context を汚さない

## ドキュメント検索

- ライブラリ/フレームワーク/CLI の API は **`find-docs` スキル**（または Svelte は Svelte MCP）を第一選択。訓練データに頼らない
