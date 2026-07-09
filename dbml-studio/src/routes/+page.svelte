<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Download,
		FilePlus2,
		FolderOpen,
		Moon,
		Save,
		SaveAll,
		Sun,
		X
	} from '@lucide/svelte';
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { validateDbml } from '$lib/dbml-validator';
	import { openDbmlFile, saveDbmlFile, saveDbmlFileAs } from '$lib/file-system';
	import { handlePseudoButtonKeydown, handlePseudoButtonKeyup } from '$lib/keyboard';

	const INITIAL_DBML = `// 新しいDBMLスキーマを作成してください

Table users {
  id integer [primary key]
  email varchar [not null, unique]
  created_at timestamp
}
`;

	let content = $state('');
	let savedContent = $state('');
	let currentPath = $state<string | null>(null);
	let currentFileName = $state('untitled.dbml');
	let hasStarted = $state(false);
	let isBusy = $state(false);
	let errorMessage = $state<string | null>(null);
	let isDark = $state(false);

	let isEdited = $derived(content !== savedContent);
	let validation = $derived(validateDbml(content));

	onMount(() => {
		const stored = localStorage.getItem('darkMode');
		isDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
		applyDarkClass(isDark);
	});

	function applyDarkClass(dark: boolean) {
		document.documentElement.classList.toggle('dark', dark);
	}

	function toggleDarkMode() {
		isDark = !isDark;
		applyDarkClass(isDark);
		localStorage.setItem('darkMode', String(isDark));
	}

	function startNew() {
		content = INITIAL_DBML;
		savedContent = '';
		currentPath = null;
		currentFileName = 'untitled.dbml';
		hasStarted = true;
		errorMessage = null;
	}

	async function openFile() {
		await runFileAction(async () => {
			const document = await openDbmlFile();
			if (!document) return;

			content = document.content;
			savedContent = document.content;
			currentPath = document.path;
			currentFileName = document.fileName;
			hasStarted = true;
		}, 'ファイルを開けませんでした');
	}

	async function saveFile() {
		if (!currentPath) {
			await saveFileAs();
			return;
		}

		await runFileAction(async () => {
			currentPath = await saveDbmlFile(currentPath!, content);
			savedContent = content;
		}, '保存に失敗しました');
	}

	async function saveFileAs() {
		await runFileAction(async () => {
			const document = await saveDbmlFileAs(content, currentFileName);
			if (!document) return;

			currentPath = document.path;
			currentFileName = document.fileName;
			savedContent = content;
		}, '名前を付けて保存に失敗しました');
	}

	async function exportFile() {
		await saveFileAs();
	}

	async function runFileAction(action: () => Promise<void>, fallbackMessage: string) {
		isBusy = true;
		errorMessage = null;
		try {
			await action();
		} catch (error) {
			const message = error instanceof Error ? error.message : '不明なエラー';
			errorMessage = `${fallbackMessage}: ${message}`;
		} finally {
			isBusy = false;
		}
	}
</script>

{#if !hasStarted}
	<main class="flex h-screen flex-col bg-background text-foreground">
		<header class="flex items-center justify-between border-b border-border bg-card px-5 py-3">
			<div>
				<h1 class="text-lg font-semibold">DBML Studio</h1>
				<p class="text-sm text-muted-foreground">ローカルDBMLファイルを編集</p>
			</div>
			<Button variant="outline" size="icon" onclick={toggleDarkMode} aria-label="ダークモード切替">
				{#if isDark}
					<Sun />
				{:else}
					<Moon />
				{/if}
			</Button>
		</header>

		<section class="flex flex-1 items-center justify-center p-6">
			<div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
				<div
					role="button"
					tabindex="0"
					onclick={startNew}
					onkeydown={(e) => handlePseudoButtonKeydown(e, startNew)}
					onkeyup={(e) => handlePseudoButtonKeyup(e, startNew)}
					class="cursor-pointer rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					<Card class="h-full transition hover:border-primary hover:shadow-md">
						<CardContent class="flex h-44 flex-col justify-center p-6">
							<FilePlus2 class="mb-5 size-8 text-sky-600 dark:text-sky-400" />
							<span class="mb-2 text-lg font-semibold">新規作成</span>
							<span class="text-sm text-muted-foreground">
								テンプレートからDBMLファイルを作成
							</span>
						</CardContent>
					</Card>
				</div>

				<div
					role="button"
					tabindex="0"
					onclick={openFile}
					onkeydown={(e) => handlePseudoButtonKeydown(e, openFile)}
					onkeyup={(e) => handlePseudoButtonKeyup(e, openFile)}
					class="cursor-pointer rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					<Card class="h-full transition hover:border-primary hover:shadow-md">
						<CardContent class="flex h-44 flex-col justify-center p-6">
							<FolderOpen class="mb-5 size-8 text-emerald-600 dark:text-emerald-400" />
							<span class="mb-2 text-lg font-semibold">ファイルを開く</span>
							<span class="text-sm text-muted-foreground">
								既存の.dbmlファイルを読み込んで編集
							</span>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	</main>
{:else}
	<main class="flex h-screen flex-col bg-background text-foreground">
		<header class="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
			<div class="flex min-w-0 items-center gap-3">
				<span class="truncate text-sm font-medium">{currentFileName}</span>
				{#if isEdited}
					<Badge
						variant="outline"
						class="border-amber-600/40 bg-amber-100 text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-100"
					>
						未保存
					</Badge>
				{/if}
				{#if !validation.valid}
					<Badge
						variant="outline"
						class="border-red-600/40 bg-red-100 text-red-900 dark:border-red-300/40 dark:bg-red-300/15 dark:text-red-100"
					>
						DBMLエラー
					</Badge>
				{/if}
			</div>

			<div class="flex max-w-full items-center gap-2 overflow-x-auto pb-0.5">
				<Button class="shrink-0" variant="outline" size="sm" onclick={startNew} disabled={isBusy}>
					<FilePlus2 />
					新規
				</Button>
				<Button class="shrink-0" variant="outline" size="sm" onclick={openFile} disabled={isBusy}>
					<FolderOpen />
					開く
				</Button>
				<Button class="shrink-0" size="sm" onclick={saveFile} disabled={!isEdited || isBusy}>
					<Save />
					{isBusy ? '保存中' : '保存'}
				</Button>
				<Button class="shrink-0" variant="outline" size="sm" onclick={saveFileAs} disabled={isBusy}>
					<SaveAll />
					名前を付けて保存
				</Button>
				<Button
					class="shrink-0"
					variant="outline"
					size="icon"
					onclick={exportFile}
					disabled={isBusy}
					aria-label="エクスポート"
				>
					<Download />
				</Button>
				<Button
					class="shrink-0"
					variant="outline"
					size="icon"
					onclick={toggleDarkMode}
					aria-label="ダークモード切替"
				>
					{#if isDark}
						<Sun />
					{:else}
						<Moon />
					{/if}
				</Button>
				<HelpTooltip />
			</div>
		</header>

		{#if errorMessage}
			<div class="border-b border-destructive/40 bg-destructive/10 px-4 py-2">
				<Alert
					variant="destructive"
					class="border-destructive/50 bg-background text-foreground"
				>
					<AlertDescription class="flex items-center justify-between gap-4">
						<span>{errorMessage}</span>
						<button
							type="button"
							onclick={() => (errorMessage = null)}
							class="rounded p-1 text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
							aria-label="エラーを閉じる"
						>
							<X class="size-4" />
						</button>
					</AlertDescription>
				</Alert>
			</div>
		{/if}

		{#if !validation.valid}
			<div
				class="border-b border-amber-600/40 bg-amber-100 px-4 py-2 text-sm text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-100"
			>
				{validation.error}
			</div>
		{/if}

		<div class="flex flex-1 overflow-hidden">
			<section class="h-full w-1/2 border-r border-border">
				<DbmlCodeEditor value={content} onchange={(value) => (content = value)} />
			</section>
			<section class="h-full w-1/2">
				<DbmlDiagram dbml={content} onchange={(value) => (content = value)} darkMode={isDark} />
			</section>
		</div>
	</main>
{/if}
