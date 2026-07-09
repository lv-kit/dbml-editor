## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, sveltekit-adapter, devtools-json, drizzle, paraglide, storybook, mcp

## rules

- Please avoid implementations that could lead to security vulnerabilities.
- Please handle matters that are better dealt with on the server side on the server side.
- 要件漏れがありそうな場合は、実装前に指摘する
- AI エージェントが読み書きしやすい命名・構造・記述を優先する
- SOLID 原則に従って実装する
- TDD を最優先する
- deprecated は一切利用しない
- 修正後に必ずtestを実施し、すべてのテストにパスすることを確認してください
- 各言語毎の Linter / Prettier に沿ったコード記述をしてください
- 1ファイル毎のサイズが大きくな李すぎないように可読性を保てる範囲内でファイル分割をしてください
- TypeScript を使用する。
- ESLint とエディタのフォーマッタを利用して、すべてのコードのスタイルを統一する。
- パッケージマネージャーは bun を利用する。
- UI は shadcn を最優先で利用し、TailwindCSS と組み合わせて使う。
- 視認性は極力よくしてください。テキストの色と背景の色が似すぎていて見えないなどはNGです。
- Secondary Color は Primary Color に合う色味を使う（一度適用したら固定）。
- ページの背景色は Primary Color が映える色味を使う（一度適用したら固定）。
- component 分割は可読性を保てる範囲内でできるだけ行ってください
- 全てのパスが通ったら最後に必ず変更したファイルに関連する画面のスクリーンショットを撮影してください。スクショ時に日本語フォントが文字化けすることが無いように。
- 動作確認は必ず docker compose up --build で起動したあとにdocker内でテストをするようにして。
- もし docker compose up --build を立ち上げる際にエラーやワーニングが出ればでなくなるまでトライアンドエラーして。

## スクリーンショットルール

- UIに変更があった場合は、必ずスクリーンショットを撮影してください。
- スクリーンショット撮影時は、日本語が文字化けしないように、事前に日本語フォント（例: `fonts-noto-cjk` や `fonts-ipafont`）をインストールしてください。
  - 例: `sudo apt-get install -y fonts-noto-cjk` をスクリーンショット撮影前に実行してください。
- スクリーンショットはブラウザ（Playwright等）で撮影し、UIの表示を確認してください。

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
