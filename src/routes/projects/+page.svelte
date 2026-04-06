<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showForm = $state(false);
	let projectName = $state('');
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-gray-200 bg-white px-6 py-4">
		<div class="mx-auto flex max-w-4xl items-center justify-between">
			<div>
				<h1 class="text-xl font-bold text-gray-800">プロジェクト一覧</h1>
				<p class="text-sm text-gray-500">{data.user.name}さんのプロジェクト</p>
			</div>
			<button
				onclick={() => (showForm = true)}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
			>
				新規プロジェクト
			</button>
		</div>
	</header>

	<main class="mx-auto max-w-4xl p-6">
		{#if showForm}
			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
				{#if form?.error}
					<div class="mb-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.error}
					</div>
				{/if}
				<form method="POST" action="?/create" use:enhance class="flex items-end gap-3">
					<input type="hidden" name="userId" value={data.user.id} />
					<div class="flex-1">
						<label for="project-name" class="mb-1 block text-sm font-medium text-gray-700">
							プロジェクト名
						</label>
						<input
							id="project-name"
							name="name"
							type="text"
							bind:value={projectName}
							required
							placeholder="例: マイプロジェクト"
							class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
						/>
					</div>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
					>
						作成
					</button>
					<button
						type="button"
						onclick={() => (showForm = false)}
						class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
					>
						キャンセル
					</button>
				</form>
			</div>
		{/if}

		{#if data.projects.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16"
			>
				<span class="mb-4 text-4xl">📁</span>
				<p class="mb-4 text-gray-500">プロジェクトがまだありません</p>
				<button
					onclick={() => (showForm = true)}
					class="rounded-md bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
				>
					最初のプロジェクトを作成
				</button>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.projects as proj}
					<a
						href="/projects/{proj.id}?userId={data.user.id}"
						class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
					>
						<h2 class="font-medium text-gray-800">{proj.name}</h2>
						<p class="mt-1 text-xs text-gray-400">
							作成日: {new Date(proj.createdAt).toLocaleDateString('ja-JP')}
						</p>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>
