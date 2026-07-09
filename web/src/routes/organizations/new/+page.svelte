<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

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

		<Card>
			<CardContent class="p-6">
				{#if form?.error}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{form.error}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" use:enhance>
					<div class="mb-4">
						<Label for="name" class="mb-1 block">
							組織名 <span class="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							type="text"
							value={nameInput}
							oninput={onNameInput}
							required
							placeholder="例: Acme Corporation"
						/>
					</div>

					<div class="mb-6">
						<Label for="slug" class="mb-1 block">
							スラッグ <span class="text-red-500">*</span>
						</Label>
						<Input
							id="slug"
							name="slug"
							type="text"
							value={slug}
							oninput={onSlugInput}
							required
							placeholder="例: acme-corporation"
							class="font-mono"
						/>
						<p class="mt-1 text-xs text-gray-400">半角英数字とハイフンのみ使用できます</p>
					</div>

					<div class="flex gap-3">
						<Button type="submit">
							作成
						</Button>
						<Button href="/organizations" variant="outline">
							キャンセル
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
</div>
