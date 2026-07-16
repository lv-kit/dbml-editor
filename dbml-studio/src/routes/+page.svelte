<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ArrowLeft,
		Download,
		FilePlus2,
		FolderOpen,
		Save,
		SaveAll,
		Settings,
		X
	} from '@lucide/svelte';
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { validateDbml } from '$lib/dbml-validator';
	import {
		applyLocale,
		LOCALE_STORAGE_KEY,
		messages,
		resolveLocale,
		type Locale
	} from '$lib/i18n';
	import {
		applyDarkMode,
		LEGACY_THEME_STORAGE_KEY,
		resolveDarkMode,
		resolveThemePreference,
		THEME_STORAGE_KEY,
		type ThemePreference
	} from '$lib/theme';
	import {
		isTauriRuntime,
		openDbmlFile,
		readBrowserDbmlFile,
		saveDbmlFile,
		saveDbmlFileAs
	} from '$lib/file-system';

	let content = $state('');
	let savedContent = $state('');
	let currentPath = $state<string | null>(null);
	let currentFileName = $state('untitled.dbml');
	let hasStarted = $state(false);
	let isBusy = $state(false);
	let errorMessage = $state<string | null>(null);
	let isDark = $state(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
	let locale = $state<Locale>('ja');
	let themePreference = $state<ThemePreference>('system');
	let isSettingsOpen = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let settingsButton: HTMLButtonElement | null = $state(null);

	let isEdited = $derived(content !== savedContent);
	let text = $derived(messages[locale]);
	let validation = $derived(validateDbml(content, text.emptyDbml));

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		themePreference = resolveThemePreference(
			localStorage.getItem(THEME_STORAGE_KEY),
			localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
		);
		localStorage.setItem(THEME_STORAGE_KEY, themePreference);
		updateTheme(mediaQuery.matches);
		const handleSystemThemeChange = (event: MediaQueryListEvent) => {
			if (themePreference === 'system') updateTheme(event.matches);
		};
		mediaQuery.addEventListener('change', handleSystemThemeChange);
		locale = resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY), navigator.language);
		applyLocale(document.documentElement, locale);

		return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
	});

	function applyDarkClass(dark: boolean) {
		applyDarkMode(document.documentElement, dark);
	}

	function changeLocale(nextLocale: Locale) {
		locale = nextLocale;
		applyLocale(document.documentElement, locale);
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	}

	function updateTheme(prefersDark: boolean) {
		isDark = resolveDarkMode(themePreference, prefersDark);
		applyDarkClass(isDark);
	}

	function changeTheme(nextPreference: ThemePreference) {
		themePreference = nextPreference;
		localStorage.setItem(THEME_STORAGE_KEY, themePreference);
		updateTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
	}

	async function closeSettings() {
		isSettingsOpen = false;
		await tick();
		settingsButton?.focus();
	}

	function initialDbml() {
		return `// ${text.newDbmlComment}

Table users {
  id integer [primary key]
  email varchar [not null, unique]
  created_at timestamp
}
`;
	}

	function startNew() {
		content = initialDbml();
		savedContent = '';
		currentPath = null;
		currentFileName = text.untitledFileName;
		hasStarted = true;
		errorMessage = null;
	}

	function goHome() {
		hasStarted = false;
		errorMessage = null;
	}

	async function openFile() {
		if (!isTauriRuntime()) {
			fileInput?.click();
			return;
		}

		await runFileAction(async () => {
			const document = await openDbmlFile();
			if (!document) return;

			loadDocument(document);
		}, text.fileOpenFailed);
	}

	async function handleBrowserFileSelect(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		await runFileAction(async () => {
			loadDocument(await readBrowserDbmlFile(file));
		}, text.fileOpenFailed);
	}

	function loadDocument(document: { content: string; path: string | null; fileName: string }) {
		content = document.content;
		savedContent = document.content;
		currentPath = document.path;
		currentFileName = document.fileName;
		hasStarted = true;
	}

	async function saveFile() {
		if (!currentPath) {
			await saveFileAs();
			return;
		}

		await runFileAction(async () => {
			currentPath = await saveDbmlFile(currentPath!, content);
			savedContent = content;
		}, text.fileSaveFailed);
	}

	async function saveFileAs() {
		await runFileAction(async () => {
			const document = await saveDbmlFileAs(content, currentFileName);
			if (!document) return;

			currentPath = document.path;
			currentFileName = document.fileName;
			savedContent = content;
		}, text.fileSaveFailed);
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
			const message = error instanceof Error ? error.message : text.unknownError;
			errorMessage = `${fallbackMessage}: ${message}`;
		} finally {
			isBusy = false;
		}
	}
</script>

{#if !hasStarted}
	<main class="flex h-screen flex-col bg-background text-foreground">
		<input
			bind:this={fileInput}
			type="file"
			accept=".dbml,text/plain"
			class="sr-only"
			tabindex="-1"
			onchange={handleBrowserFileSelect}
		/>

		<header class="flex items-center justify-between border-b border-border bg-card px-5 py-3">
			<div>
				<h1 class="text-lg font-semibold">{text.appName}</h1>
			</div>
			<button
				bind:this={settingsButton}
				type="button"
				class="inline-flex size-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				onclick={() => (isSettingsOpen = true)}
				aria-label={text.settings}
			>
				<Settings />
			</button>
		</header>

		<section class="flex flex-1 items-center justify-center p-6">
			<div class="flex w-full max-w-2xl flex-col gap-4">
				{#if errorMessage}
					<Alert variant="destructive" class="border-destructive/50 bg-background text-foreground">
						<AlertDescription class="flex items-center justify-between gap-4">
							<span>{errorMessage}</span>
							<button
								type="button"
								onclick={() => (errorMessage = null)}
								class="rounded p-1 text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
								aria-label={text.closeError}
							>
								<X class="size-4" />
							</button>
						</AlertDescription>
					</Alert>
				{/if}

				<div class="grid gap-4 sm:grid-cols-2">
					<button
						type="button"
						onclick={startNew}
						disabled={isBusy}
						class="cursor-pointer rounded-lg text-left disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
					>
						<Card class="h-full transition hover:border-primary hover:shadow-md">
							<CardContent class="flex h-44 flex-col justify-center p-6">
								<FilePlus2 class="mb-5 size-8 text-sky-600 dark:text-sky-400" />
								<span class="mb-2 text-lg font-semibold">{text.newFile}</span>
								<span class="text-sm text-muted-foreground">
									{text.newFileDescription}
								</span>
							</CardContent>
						</Card>
					</button>

					<button
						type="button"
						onclick={openFile}
						disabled={isBusy}
						class="cursor-pointer rounded-lg text-left disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
					>
						<Card class="h-full transition hover:border-primary hover:shadow-md">
							<CardContent class="flex h-44 flex-col justify-center p-6">
								<FolderOpen class="mb-5 size-8 text-emerald-600 dark:text-emerald-400" />
								<span class="mb-2 text-lg font-semibold">{text.openFile}</span>
								<span class="text-sm text-muted-foreground">
									{text.openFileDescription}
								</span>
							</CardContent>
						</Card>
					</button>
				</div>
			</div>
		</section>
	</main>
{:else}
	<main class="flex h-screen flex-col bg-background text-foreground">
		<input
			bind:this={fileInput}
			type="file"
			accept=".dbml,text/plain"
			class="sr-only"
			tabindex="-1"
			onchange={handleBrowserFileSelect}
		/>

		<header class="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
			<div class="flex min-w-0 items-center gap-3">
				<Button
					class="shrink-0"
					variant="ghost"
					size="icon"
					onclick={goHome}
					aria-label={text.backToStart}
				>
					<ArrowLeft />
				</Button>
				<span class="truncate text-sm font-medium">{currentFileName}</span>
				{#if isEdited}
					<Badge
						variant="outline"
						class="border-amber-600/40 bg-amber-100 text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-100"
					>
						{text.unsaved}
					</Badge>
				{/if}
				{#if !validation.valid}
					<Badge
						variant="outline"
						class="border-red-600/40 bg-red-100 text-red-900 dark:border-red-300/40 dark:bg-red-300/15 dark:text-red-100"
					>
						{text.dbmlError}
					</Badge>
				{/if}
			</div>

			<div class="flex max-w-full items-center gap-2 overflow-x-auto pb-0.5">
				<Button class="shrink-0" variant="outline" size="sm" onclick={startNew} disabled={isBusy}>
					<FilePlus2 />
					{text.new}
				</Button>
				<Button class="shrink-0" variant="outline" size="sm" onclick={openFile} disabled={isBusy}>
					<FolderOpen />
					{text.open}
				</Button>
				<Button class="shrink-0" size="sm" onclick={saveFile} disabled={!isEdited || isBusy}>
					<Save />
					{isBusy ? text.saving : text.save}
				</Button>
				<Button class="shrink-0" variant="outline" size="sm" onclick={saveFileAs} disabled={isBusy}>
					<SaveAll />
					{text.saveAs}
				</Button>
				<Button
					class="shrink-0"
					variant="outline"
					size="icon"
					onclick={exportFile}
					disabled={isBusy}
					aria-label={text.export}
				>
					<Download />
				</Button>
				<button
					bind:this={settingsButton}
					type="button"
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					onclick={() => (isSettingsOpen = true)}
					aria-label={text.settings}
				>
					<Settings />
				</button>
				<HelpTooltip {locale} />
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
							aria-label={text.closeError}
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
				<DbmlCodeEditor value={content} onchange={(value) => (content = value)} darkMode={isDark} />
			</section>
			<section class="h-full w-1/2">
				<DbmlDiagram
					dbml={content}
					onchange={(value) => (content = value)}
					darkMode={isDark}
					{locale}
				/>
			</section>
		</div>
	</main>
{/if}

{#if isSettingsOpen}
	<SettingsDialog
		{locale}
		{themePreference}
		onclose={closeSettings}
		onlocalechange={changeLocale}
		onthemechange={changeTheme}
	/>
{/if}
