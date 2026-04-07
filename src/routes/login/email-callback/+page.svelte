<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { initFirebase, completeEmailSignIn } from '$lib/firebase';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { data } = $props();

	let status = $state<'processing' | 'needs-email' | 'error'>('processing');
	let errorMessage = $state('');
	let emailInput = $state('');

	onMount(async () => {
		initFirebase(data.firebaseConfig);
		try {
			const idToken = await completeEmailSignIn(window.location.href);
			if (idToken === null && window.localStorage.getItem('emailForSignIn') === null) {
				// No email in localStorage — user opened the link on a different device
				status = 'needs-email';
				return;
			}
			if (!idToken) {
				status = 'error';
				errorMessage = '無効なリンクです。再度ログインを試みてください。';
				return;
			}
			await submitSession(idToken);
		} catch (e) {
			status = 'error';
			errorMessage = e instanceof Error ? e.message : 'ログインに失敗しました';
		}
	});

	async function submitSession(idToken: string) {
		const res = await fetch('/api/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});
		if (!res.ok) throw new Error('セッションの作成に失敗しました');
		await goto('/signup');
	}

	async function handleEmailSubmit(event: Event) {
		event.preventDefault();
		if (!emailInput) return;
		status = 'processing';
		try {
			const { signInWithEmailLink, getAuth } = await import('firebase/auth');
			const result = await signInWithEmailLink(getAuth(), emailInput, window.location.href);
			window.localStorage.removeItem('emailForSignIn');
			const idToken = await result.user.getIdToken();
			await submitSession(idToken);
		} catch (e) {
			status = 'error';
			errorMessage = e instanceof Error ? e.message : 'ログインに失敗しました';
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
	{#if status === 'processing'}
		<p class="text-gray-600">ログイン処理中...</p>
	{:else if status === 'needs-email'}
		<div class="w-full max-w-md rounded-lg bg-white p-8 shadow">
			<h2 class="mb-4 text-xl font-bold text-gray-800">メールアドレスの確認</h2>
			<p class="mb-4 text-sm text-gray-600">
				別のデバイスでリンクを開いた場合は、メールアドレスを入力してください。
			</p>
			<form onsubmit={handleEmailSubmit} class="space-y-4">
				<div>
					<Label for="email">メールアドレス</Label>
					<Input
						id="email"
						type="email"
						value={emailInput}
						oninput={(e) => (emailInput = (e.target as HTMLInputElement).value)}
						required
						placeholder="example@email.com"
					/>
				</div>
				<Button type="submit" class="w-full">ログイン</Button>
			</form>
		</div>
	{:else}
		<div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow">
			<p class="mb-4 text-red-600">{errorMessage}</p>
			<a href="/login" class="text-blue-600 hover:underline">ログインページに戻る</a>
		</div>
	{/if}
</div>
