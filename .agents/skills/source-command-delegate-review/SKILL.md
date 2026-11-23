---
name: source-command-delegate-review
description: Run OCR in delegation mode — OCR handles file selection and rules, the host agent performs the actual review.
---

> migrated source command `delegate-review` を実行するよう求められたら、この skill を使う。
> 正本は `.claude/commands/delegate-review.md`。以下はその埋め込み。

---

---
description: Run OCR in delegation mode — OCR handles file selection and rules, the host agent performs the actual review.
---

Invoke OpenCodeReview (OCR) in delegation mode. OCR determines which files to review and provides review rules; you perform the actual code review using your own capabilities.

Delegate the diff reading and review (Step 3 onward) to the `ocr-delegate-reviewer` subagent, which pins the model per tool: Opus 5.5 / medium on Claude Code, GPT-6.1 Terra / medium on Codex, and Gemini 3.8 Flash / medium on Gemini CLI and Antigravity. If the subagent is unavailable, run the review with the current model and state which model was used in the report.

## Workflow

### Step 1: Preview

```bash
ocr delegate preview [user-args]
```

- Default (no user arguments): workspace mode (staged + unstaged + untracked).
- If the user provides `--commit` or `-c`: pass through as-is.
- If the user provides `--from` and `--to`: pass through as-is.
- (Optional) Provide `--background "context"` or `-b "context"` for business context.
- In cloud environments (Claude Code Cloud, Codex Cloud, etc., where `ocr` may not be installed), always run `npm i -g @alibaba-group/open-code-review` first and confirm with `ocr --version`. Locally, install it only if `ocr` is not found. If installation or execution fails, do not treat the review as complete; report the reason.

This outputs mode/ref metadata and the reviewable file list.

### Step 2: Get Rules

Pass all reviewable file paths to get their review checklists:

```bash
ocr delegate rule <path1> <path2> ...
```

### Step 3: Get Diffs and Review

Choose the diff command using the mode and refs from Step 1. Use `git --no-pager` for every Git call during the review.

The diff commands disable external diff programs, text conversion, and color to produce plain patches.

- Range: `git --no-pager diff --no-ext-diff --no-textconv --no-color <merge_base>..<to> -- "<path>"`
- Commit: `git --no-pager show --no-ext-diff --no-textconv --no-color <commit> -- "<path>"`
- Workspace: `git --no-pager diff --no-ext-diff --no-textconv --no-color HEAD -- "<path>"` (or `cat "<path>"` for untracked files)

To read context:

```bash
git --no-pager log --no-color --oneline -- "<path>"
git --no-pager blame --no-textconv -- "<path>"
git --no-pager show --no-ext-diff --no-textconv --no-color "<ref>:<path>"
```

For large diffs, add `--output="<absolute-diff-file>"` to the command for the selected mode. Choose a unique absolute path outside the repository and create its parent directory. Use the same path in file-reading tool calls:

```bash
git --no-pager diff --no-ext-diff --no-textconv --no-color --output="<absolute-diff-file>" <merge_base>..<to> -- "<path>"
```

After Git exits with code 0, read and review the entire file in chunks, then remove it. If Git fails or times out, retry or record `skipped` with the error. Check unexpectedly empty output against a fresh preview.

Then review focusing on: correctness, security, performance, error handling, concurrency, maintainability. Only comment on changed code (+ lines).

### Step 3b: Review Excluded Documents

Files that `ocr delegate preview` lists as Excluded (Markdown and other documents, unsupported extensions) cannot be reviewed by OCR. Read their diffs directly and review them yourself: factual errors, contradictions with existing specs, code, or other documents, stale text left behind, broken links, and reproducibility of procedures. Never treat an excluded file as done without review.

### Step 4: Report and Fix

Record each previewed `(path, status)` as `reviewed` or `skipped`, including the documents you reviewed directly in Step 3b. Give a reason for every skipped entry, and report `total_files`, `reviewed_files`, `skipped_files`, and `coverage_rate`. In the report, show the OCR-covered files and the directly reviewed documents separately.

Classify each issue by severity:

- **High**: Obvious bugs, security issues, data loss, or clear mistakes with precise fix proposals
- **Medium**: Reasonable concerns, performance suggestions, or fixes requiring manual work
- **Low**: Discard silently (likely false positives, nitpicks, or insufficient context)

Automatically fix High and Medium issues that are safe and well-defined.
