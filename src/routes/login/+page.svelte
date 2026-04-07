<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import {
		initFirebase,
		signInWithGoogle,
		signInWithMicrosoft,
		sendEmailSignInLink
	} from '$lib/firebase';

	let { data } = $props();

	let email = $state('');
	let emailSent = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');
	let returnTo = $state('/signup');

	const googleProvider = $derived(data.providers.find((p) => p.id === 'google'));
	const microsoftProvider = $derived(data.providers.find((p) => p.id === 'microsoft'));
	const emailProvider = $derived(data.providers.find((p) => p.id === 'email'));

	onMount(() => {
		initFirebase(data.firebaseConfig);
		returnTo = new URLSearchParams(window.location.search).get('returnTo') ?? '/signup';
	});

	async function createSession(idToken: string) {
		const res = await fetch('/api/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});
		if (!res.ok) throw new Error('セッションの作成に失敗しました');
		await goto(returnTo);
	}

	async function handleGoogleLogin() {
		loading = true;
		errorMessage = '';
		try {
			const idToken = await signInWithGoogle();
			await createSession(idToken);
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Googleログインに失敗しました';
			loading = false;
		}
	}

	async function handleMicrosoftLogin() {
		loading = true;
		errorMessage = '';
		try {
			const idToken = await signInWithMicrosoft();
			await createSession(idToken);
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Microsoftログインに失敗しました';
			loading = false;
		}
	}

	async function handleEmailLogin(event: Event) {
		event.preventDefault();
		if (!email) return;
		loading = true;
		errorMessage = '';
		try {
			await sendEmailSignInLink(email);
			emailSent = true;
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'メールの送信に失敗しました';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-800">DBML Editor</h1>
			<p class="text-gray-500">ログインまたは新規登録</p>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>アカウントにログイン</CardTitle>
				<CardDescription>下記の方法でログインできます</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if errorMessage}
					<Alert variant="destructive">
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				{/if}

				{#if googleProvider?.ready}
					<Button
						type="button"
						variant="outline"
						class="w-full"
						disabled={loading}
						onclick={handleGoogleLogin}
					>
						<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Googleでログイン
					</Button>
				{/if}

				{#if microsoftProvider?.ready}
					<Button
						type="button"
						variant="outline"
						class="w-full"
						disabled={loading}
						onclick={handleMicrosoftLogin}
					>
						<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
							/>
						</svg>
						Microsoftでログイン
					</Button>
				{/if}

				{#if emailProvider?.ready}
					{#if googleProvider?.ready || microsoftProvider?.ready}
						<div class="relative">
							<div class="absolute inset-0 flex items-center">
								<span class="w-full border-t"></span>
							</div>
							<div class="relative flex justify-center text-xs uppercase">
								<span class="bg-white px-2 text-muted-foreground">または</span>
							</div>
						</div>
					{/if}

					{#if emailSent}
						<div class="rounded-lg bg-green-50 p-4 text-center">
							<p class="text-sm text-green-800">
								確認メールを送信しました！<br />
								メールに記載されたリンクをクリックしてログインしてください。
							</p>
						</div>
					{:else}
						<form onsubmit={handleEmailLogin}>
							<div class="space-y-2">
								<Label for="email">メールアドレス</Label>
								<Input
									id="email"
									type="email"
									placeholder="example@email.com"
									value={email}
									oninput={(e) => (email = (e.target as HTMLInputElement).value)}
									required
								/>
							</div>
							<Button type="submit" class="mt-4 w-full" disabled={loading}>
								メールリンクでログイン
							</Button>
						</form>
					{/if}
				{/if}

				{#if !googleProvider?.ready && !microsoftProvider?.ready && !emailProvider?.ready}
					<p class="text-center text-sm text-gray-500">
						現在、ログイン方法が設定されていません。<br />
						管理者に連絡してください。
					</p>
				{/if}
			</CardContent>
		</Card>

		<p class="mt-4 text-center text-xs text-gray-500">
			アカウントをお持ちでない場合は、ログイン後に新規登録できます
		</p>
	</div>
</div>
