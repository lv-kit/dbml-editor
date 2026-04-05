<script lang="ts">
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';

	let { data } = $props();

	let content = $state('');
	let savedContent = $state('');
	let isEdited = $derived(content !== savedContent);
	let isSaving = $state(false);

	$effect(() => {
		content = data.project.dbmlContent;
		savedContent = data.project.dbmlContent;
	});

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
</script>

<div class="flex h-screen flex-col">
	<!-- Toolbar -->
	<header class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
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
