<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let { data, form } = $props();

	let nameInput = $state(data.sessionName || '');

	$effect(() => {
		if (form?.name) nameInput = form.name as string;
	});

	let isCorporate = $derived(data.userType === 'corporate');
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
	<div class="w-full max-w-md">
		<div class="mb-6">
			{#if isCorporate}
				<a href="/signup/organization" class="text-sm text-gray-500 hover:text-gray-700"
					>← 法人情報の入力に戻る</a
				>
			{:else}
				<a href="/signup" class="text-sm text-gray-500 hover:text-gray-700"
					>← 利用形態の選択に戻る</a
				>
			{/if}
			<h1 class="mt-2 text-2xl font-bold text-gray-800">アカウント情報の入力</h1>
			<p class="mt-1 text-sm text-gray-500">アカウント情報を入力してください</p>
		</div>

		<Card>
			<CardContent class="p-6">
				{#if form?.error}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{form.error}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" use:enhance>
					<input type="hidden" name="userType" value={data.userType} />
					{#if data.organizationId}
						<input type="hidden" name="organizationId" value={data.organizationId} />
					{/if}

					<div class="mb-4">
						<Label for="email" class="mb-1 block">
							メールアドレス
						</Label>
						<Input
							id="email"
							type="email"
							value={data.sessionEmail}
							disabled
							class="bg-gray-100"
						/>
						<p class="mt-1 text-xs text-gray-500">
							認証されたメールアドレスが使用されます
						</p>
					</div>

					<div class="mb-6">
						<Label for="name" class="mb-1 block">
							名前 <span class="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							type="text"
							value={nameInput}
							oninput={(e) => (nameInput = (e.target as HTMLInputElement).value)}
							required
							placeholder="例: 田中太郎"
						/>
					</div>

					<Button type="submit" class="w-full">
						アカウントを作成
					</Button>
				</form>
			</CardContent>
		</Card>

		{#if isCorporate}
			<div class="mt-4 flex justify-center">
				<div class="flex items-center gap-2 text-xs text-gray-400">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"
						>✓</span
					>
					<span>法人情報</span>
					<span class="mx-1">→</span>
					<span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
						>2</span
					>
					<span>アカウント情報</span>
				</div>
			</div>
		{/if}
	</div>
</div>
