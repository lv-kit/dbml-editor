<script lang="ts">
	let fileInput = $state<HTMLInputElement>();
	let fileName = $state('');
	let content = $state('');
	let savedContent = $state('');
	let isEdited = $derived(content !== savedContent);

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		fileName = file.name;
		const text = await file.text();
		content = text;
		savedContent = text;
	}

	function save() {
		savedContent = content;
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const baseName = fileName.replace(/\.dbml$/, '');
		a.href = url;
		a.download = `${baseName}_edited.dbml`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="mx-auto max-w-5xl p-6">
	<h1 class="mb-6 text-2xl font-bold">DBML Editor</h1>

	{#if !fileName}
		<!-- Step 1: Select DBML file -->
		<div
			class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12"
		>
			<p class="mb-4 text-gray-600">DBMLファイルを選択してください</p>
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				onclick={() => fileInput?.click()}
			>
				ファイルを選択
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".dbml"
				class="hidden"
				onchange={handleFileSelect}
			/>
		</div>
	{:else}
		<!-- Step 2-5: Edit, Save, Download -->
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-gray-700">{fileName}</span>
				{#if isEdited}
					<span class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
						>未保存の変更あり</span
					>
				{/if}
			</div>
			<div class="flex gap-2">
				<button
					class="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
					onclick={() => {
						fileName = '';
						content = '';
						savedContent = '';
					}}
				>
					別のファイルを開く
				</button>
				<button
					class="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
					onclick={save}
					disabled={!isEdited}
				>
					保存
				</button>
				<button
					class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
					onclick={download}
				>
					ダウンロード
				</button>
			</div>
		</div>

		<textarea
			bind:value={content}
			class="h-[calc(100vh-200px)] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
			spellcheck="false"
		></textarea>
	{/if}
</div>
