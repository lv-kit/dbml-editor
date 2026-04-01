<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();

	let slugOverride = $state('');
	let isSlugEdited = $state(false);

	let nameInput = $state('');

	$effect(() => {
		if (form?.name) nameInput = form.name as string;
		if (form?.slug) {
			slugOverride = form.slug as string;
			isSlugEdited = true;
		}
	});

	let slug = $derived(
		isSlugEdited
			? slugOverride
			: nameInput
					.toLowerCase()
					.replace(/\s+/g, '-')
					.replace(/[^a-z0-9-]/g, '')
					.replace(/-+/g, '-')
					.replace(/^-|-$/g, '')
	);

	function onNameInput(e: Event) {
		nameInput = (e.target as HTMLInputElement).value;
	}

	function onSlugInput(e: Event) {
		isSlugEdited = true;
		slugOverride = (e.target as HTMLInputElement).value;
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-lg">
		<div class="mb-6 flex items-center gap-4">
			<a href="/organizations" class="text-sm text-gray-500 hover:text-gray-700">← 組織一覧</a>
			<h1 class="text-2xl font-bold text-gray-800">組織を作成</h1>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			{#if form?.error}
				<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="mb-4">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
						組織名 <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={nameInput}
						oninput={onNameInput}
						required
						placeholder="例: Acme Corporation"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					/>
				</div>

				<div class="mb-6">
					<label for="slug" class="mb-1 block text-sm font-medium text-gray-700">
						スラッグ <span class="text-red-500">*</span>
					</label>
					<input
						id="slug"
						name="slug"
						type="text"
						value={slug}
						oninput={onSlugInput}
						required
						placeholder="例: acme-corporation"
						class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
					/>
					<p class="mt-1 text-xs text-gray-400">半角英数字とハイフンのみ使用できます</p>
				</div>

				<div class="flex gap-3">
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700"
					>
						作成
					</button>
					<a
						href="/organizations"
						class="rounded-md border border-gray-300 px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
					>
						キャンセル
					</a>
				</div>
			</form>
		</div>
	</div>
</div>
