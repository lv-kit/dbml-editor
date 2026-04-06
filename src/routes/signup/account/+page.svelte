<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let nameInput = $state('');
	let emailInput = $state('');

	$effect(() => {
		if (form?.name) nameInput = form.name as string;
		if (form?.email) emailInput = form.email as string;
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

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			{#if form?.error}
				<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.error}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<input type="hidden" name="userType" value={data.userType} />
				{#if data.organizationId}
					<input type="hidden" name="organizationId" value={data.organizationId} />
				{/if}

				<div class="mb-4">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
						名前 <span class="text-red-500">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={nameInput}
						oninput={(e) => (nameInput = (e.target as HTMLInputElement).value)}
						required
						placeholder="例: 田中太郎"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					/>
				</div>

				<div class="mb-6">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
						メールアドレス <span class="text-red-500">*</span>
					</label>
					<input
						id="email"
						name="email"
						type="email"
						value={emailInput}
						oninput={(e) => (emailInput = (e.target as HTMLInputElement).value)}
						required
						placeholder="例: taro@example.com"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-md bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700"
				>
					アカウントを作成
				</button>
			</form>
		</div>

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
