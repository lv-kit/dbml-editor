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

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
	<div class="w-full max-w-md">
		<div class="mb-6">
			<a href="/signup" class="text-sm text-gray-500 hover:text-gray-700">← 利用形態の選択に戻る</a>
			<h1 class="mt-2 text-2xl font-bold text-gray-800">法人情報の入力</h1>
			<p class="mt-1 text-sm text-gray-500">組織の情報を入力してください</p>
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

					<Button type="submit" class="w-full">
						次へ
					</Button>
				</form>
			</CardContent>
		</Card>

		<div class="mt-4 flex justify-center">
			<div class="flex items-center gap-2 text-xs text-gray-400">
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
					>1</span
				>
				<span>法人情報</span>
				<span class="mx-1">→</span>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500"
					>2</span
				>
				<span>アカウント情報</span>
			</div>
		</div>
	</div>
</div>
