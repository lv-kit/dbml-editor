# context: research（調査モード）

コードや仕様の調査に集中するモード。実装しない。

## 姿勢
- `code-explorer` / `Explore` に大量調査を委譲し、main context を汚さない
- 出力は「事実 + path:line」に絞る。全文貼り付けをしない

## よく使う
- semble（`search` / `find_related`）、`find-docs`、Svelte MCP
- 調査結果には必ず「次に使うべきコマンド/エージェント」を添える
