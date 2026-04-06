<script lang="ts">
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';
	import { validateDbml, type ValidationResult } from '$lib/dbml-validator';
	import { isFileSystemAccessSupported, openDbmlFile, writeToFileHandle } from '$lib/file-system';

	let { data } = $props();

	let content = $state('');
	let savedContent = $state('');
	let isEdited = $derived(content !== savedContent);
	let isSaving = $state(false);
	let hasStarted = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let fileHandle = $state<FileSystemFileHandle | null>(null);
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';

	let isOverwriting = $state(false);
	let overwriteError = $state<string | null>(null);

	const NO_VALIDATION: ValidationResult = { valid: true, error: null };
	let validation = $derived(fileHandle ? validateDbml(content) : NO_VALIDATION);

	$effect(() => {
		content = data.project.dbmlContent;
		savedContent = data.project.dbmlContent;
		hasStarted = !!data.project.dbmlContent;
	});

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const text = await file.text();
		content = text;
		savedContent = data.project.dbmlContent;
		hasStarted = true;
	}

	async function handleFileSelectWithApi() {
		try {
			const result = await openDbmlFile();
			content = result.content;
			fileHandle = result.handle;
			savedContent = data.project.dbmlContent;
			hasStarted = true;
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') return;
			console.error('File open failed:', e);
		}
	}

	function startNew() {
		content = `// ${data.project.name}\n// 新しいDBMLスキーマを作成してください\n\nTable example {\n  id integer [primary key]\n  name varchar\n  created_at timestamp\n}\n`;
		savedContent = data.project.dbmlContent;
		hasStarted = true;
	}

	async function save() {
		isSaving = true;
		try {
			const formData = new FormData();
			formData.set('dbmlContent', content);
			formData.set('userId', data.userId);

			const response = await fetch(`/projects/${data.project.id}?/save`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				savedContent = content;
			}
		} finally {
			isSaving = false;
		}
	}

	async function overwriteLocalFile() {
		if (!fileHandle || !validation.valid) return;
		isOverwriting = true;
		overwriteError = null;
		try {
			await writeToFileHandle(fileHandle, content);
		} catch (e) {
			const message = e instanceof Error ? e.message : '不明なエラー';
			overwriteError = `ファイル上書きに失敗しました: ${message}`;
			console.error('ファイル上書きに失敗しました:', e);
		} finally {
			isOverwriting = false;
		}
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.project.name}.dbml`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

{#if !hasStarted}
	<div class="flex h-screen flex-col items-center justify-center bg-gray-50">
		<div class="mb-4">
			<a href="/projects?userId={data.userId}" class="text-sm text-gray-500 hover:text-gray-700">
				← プロジェクト一覧に戻る
			</a>
		</div>
		<h1 class="mb-2 text-2xl font-bold text-gray-800">{data.project.name}</h1>
		<p class="mb-8 text-gray-500">DBMLスキーマの作成方法を選択してください</p>

		<div class="flex gap-6">
			<button onclick={startNew} class="w-56 text-left">
				<Card class="h-full border-2 transition hover:border-blue-400 hover:shadow-md">
					<CardContent class="flex flex-col items-center p-8">
						<span class="mb-4 text-4xl">📝</span>
						<span class="mb-2 text-lg font-semibold text-gray-800">新規作成</span>
						<span class="text-center text-sm text-gray-500">
							テンプレートから<br />新しいスキーマを作成
						</span>
					</CardContent>
				</Card>
			</button>

			<button
				onclick={() => {
					if (isFileSystemAccessSupported()) {
						handleFileSelectWithApi();
					} else {
						fileInput?.click();
					}
				}}
				class="w-56 text-left"
			>
				<Card class="h-full border-2 transition hover:border-blue-400 hover:shadow-md">
					<CardContent class="flex flex-col items-center p-8">
						<span class="mb-4 text-4xl">📂</span>
						<span class="mb-2 text-lg font-semibold text-gray-800">ファイル選択</span>
						<span class="text-center text-sm text-gray-500">
							既存のDBMLファイルを<br />読み込んで編集
						</span>
					</CardContent>
				</Card>
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".dbml"
				class="hidden"
				onchange={handleFileSelect}
			/>
		</div>
	</div>
{:else}
	<div class="flex h-screen flex-col">
		<!-- Toolbar -->
		<header
			class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2"
		>
			<div class="flex items-center gap-3">
				<a href="/projects?userId={data.userId}" class="text-sm text-gray-400 hover:text-gray-200">
					← プロジェクト一覧
				</a>
				<span class="text-gray-600">|</span>
				<span class="text-sm font-medium text-gray-200">{data.project.name}</span>
				{#if isEdited}
					<Badge variant="outline" class="border-yellow-500/30 bg-yellow-500/20 text-yellow-300">
						未保存
					</Badge>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<Button
					class="bg-green-600 hover:bg-green-700"
					size="sm"
					onclick={save}
					disabled={!isEdited || isSaving}
				>
					{isSaving ? '保存中...' : '保存'}
				</Button>
				{#if fileHandle}
					<Button
						class="bg-orange-600 hover:bg-orange-700"
						size="sm"
						onclick={overwriteLocalFile}
						disabled={!validation.valid || isOverwriting}
						title={validation.error
							? `バリデーションエラー: ${validation.error}`
							: 'ローカルファイルを上書き'}
						aria-label={validation.error
							? `ファイル上書き（バリデーションエラー: ${validation.error}）`
							: 'ローカルファイルを上書き'}
						data-testid="overwrite-button"
					>
						{isOverwriting ? '上書き中...' : 'ファイル上書き'}
					</Button>
				{/if}
				<Button size="sm" onclick={download}>
					ダウンロード
				</Button>
				<HelpTooltip />
			</div>
		</header>

		{#if overwriteError}
			<div
				class="flex items-center justify-between bg-red-600 px-4 py-2 text-sm text-white"
				role="alert"
			>
				<span>{overwriteError}</span>
				<button
					onclick={() => (overwriteError = null)}
					class="ml-4 text-white hover:text-red-200"
					aria-label="エラーを閉じる"
				>
					✕
				</button>
			</div>
		{/if}

		<!-- Editor + Diagram split -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Code Editor -->
			<div class="h-full w-1/2 border-r border-gray-700">
				<DbmlCodeEditor value={content} onchange={(v) => (content = v)} />
			</div>

			<!-- Diagram -->
			<div class="h-full w-1/2">
				<DbmlDiagram dbml={content} onchange={(v) => (content = v)} />
			</div>
		</div>
	</div>
{/if}
