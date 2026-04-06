<script lang="ts">
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';
	import { validateDbml } from '$lib/dbml-validator';
	import { isFileSystemAccessSupported, openDbmlFile, writeToFileHandle } from '$lib/file-system';

	let { data } = $props();

	let content = $state('');
	let savedContent = $state('');
	let isEdited = $derived(content !== savedContent);
	let isSaving = $state(false);
	let hasStarted = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let fileHandle = $state<FileSystemFileHandle | null>(null);
	let isOverwriting = $state(false);

	let validation = $derived(validateDbml(content));

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
		try {
			await writeToFileHandle(fileHandle, content);
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
			<button
				onclick={startNew}
				class="flex w-56 flex-col items-center rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-400 hover:shadow-md"
			>
				<span class="mb-4 text-4xl">📝</span>
				<span class="mb-2 text-lg font-semibold text-gray-800">新規作成</span>
				<span class="text-center text-sm text-gray-500">
					テンプレートから<br />新しいスキーマを作成
				</span>
			</button>

			<button
				onclick={() => {
					if (isFileSystemAccessSupported()) {
						handleFileSelectWithApi();
					} else {
						fileInput?.click();
					}
				}}
				class="flex w-56 flex-col items-center rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-400 hover:shadow-md"
			>
				<span class="mb-4 text-4xl">📂</span>
				<span class="mb-2 text-lg font-semibold text-gray-800">ファイル選択</span>
				<span class="text-center text-sm text-gray-500">
					既存のDBMLファイルを<br />読み込んで編集
				</span>
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
					<span class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
						未保存
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-40"
					onclick={save}
					disabled={!isEdited || isSaving}
				>
					{isSaving ? '保存中...' : '保存'}
				</button>
				{#if fileHandle}
					<button
						class="rounded bg-orange-600 px-3 py-1.5 text-sm text-white hover:bg-orange-700 disabled:opacity-40"
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
					</button>
				{/if}
				<button
					class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
					onclick={download}
				>
					ダウンロード
				</button>
				<HelpTooltip />
			</div>
		</header>

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
