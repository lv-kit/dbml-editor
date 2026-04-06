<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

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
			<Button onclick={() => (showForm = true)}>
				新規プロジェクト
			</Button>
		</div>
	</header>

	<main class="mx-auto max-w-4xl p-6">
		{#if showForm}
			<Card class="mb-6">
				<CardContent class="p-4">
					{#if form?.error}
						<Alert variant="destructive" class="mb-3">
							<AlertDescription>{form.error}</AlertDescription>
						</Alert>
					{/if}
					<form method="POST" action="?/create" use:enhance class="flex items-end gap-3">
						<input type="hidden" name="userId" value={data.user.id} />
						<div class="flex-1">
							<Label for="project-name" class="mb-1 block">
								プロジェクト名
							</Label>
							<Input
								id="project-name"
								name="name"
								type="text"
								value={projectName}
								oninput={(e) => (projectName = (e.target as HTMLInputElement).value)}
								required
								placeholder="例: マイプロジェクト"
							/>
						</div>
						<Button type="submit">
							作成
						</Button>
						<Button
							type="button"
							variant="outline"
							onclick={() => (showForm = false)}
						>
							キャンセル
						</Button>
					</form>
				</CardContent>
			</Card>
		{/if}

		{#if data.projects.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16"
			>
				<span class="mb-4 text-4xl">📁</span>
				<p class="mb-4 text-gray-500">プロジェクトがまだありません</p>
				<Button onclick={() => (showForm = true)}>
					最初のプロジェクトを作成
				</Button>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.projects as proj}
					<a
						href="/projects/{proj.id}?userId={data.user.id}"
						class="block"
					>
						<Card class="h-full transition hover:border-blue-300 hover:shadow-md">
							<CardContent class="p-5">
								<h2 class="font-medium text-gray-800">{proj.name}</h2>
								<p class="mt-1 text-xs text-gray-400">
									作成日: {new Date(proj.createdAt).toLocaleDateString('ja-JP')}
								</p>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>
