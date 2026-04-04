<script lang="ts">
	import { getContext } from 'svelte';
	import DbmlCodeEditor from '$lib/components/DbmlCodeEditor.svelte';
	import DbmlDiagram from '$lib/components/DbmlDiagram.svelte';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import HelpTooltip from '$lib/components/HelpTooltip.svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';

	let { data } = $props();

	let fileInput = $state<HTMLInputElement>();
	let fileName = $state('');
	let content = $state('');
	let savedContent = $state('');
	let isEdited = $derived(content !== savedContent);
	const session = $derived(data.session ?? null);
	const providers = $derived(data.providers ?? []);
	const configuredProviders = $derived(providers.filter((provider) => provider.ready));
	const userName = $derived(session?.user?.name ?? session?.user?.email ?? 'ログイン済み');
	const userAvatar = $derived(session?.user?.image ?? '');
	let signingOut = $state(false);
	let activeProvider = $state<string | null>(null);

	const theme = getContext<{ isDark: boolean; toggle: () => void }>('darkMode');

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		fileName = file.name;
		const text = await file.text();
		content = text;
		savedContent = text;
	}

	function save() {
		savedContent = content;
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const baseName = fileName.replace(/\.dbml$/, '');
		a.href = url;
		a.download = `${baseName}_edited.dbml`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function openNewFile() {
		fileName = '';
		content = '';
		savedContent = '';
	}

	async function startSignIn(providerId: string) {
		activeProvider = providerId;
		try {
			await signIn(providerId, { redirectTo: '/' });
		} finally {
			activeProvider = null;
		}
	}

	async function startSignOut() {
		signingOut = true;
		try {
			await signOut({ redirectTo: '/' });
		} finally {
			signingOut = false;
		}
	}
</script>

{#if !fileName}
	<div class="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
		<div class="absolute top-4 right-4 flex flex-col items-end gap-2 px-4">
			<div class="flex max-w-md flex-wrap justify-end gap-2">
				{#if session}
					<div
						class="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-800 shadow dark:bg-gray-800/80 dark:text-gray-100"
					>
						{#if userAvatar}
							<img alt="profile" src={userAvatar} class="h-7 w-7 rounded-full object-cover" />
						{/if}
						<span class="max-w-[120px] truncate">{userName}</span>
						<button
							class="rounded bg-gray-900 px-2 py-1 text-xs font-semibold text-white hover:bg-black dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50"
							onclick={startSignOut}
							disabled={signingOut}
						>
							ログアウト
						</button>
					</div>
				{:else}
					{#if configuredProviders.length > 0}
						{#each configuredProviders as provider}
							<button
								class="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
								onclick={() => startSignIn(provider.id)}
								disabled={activeProvider === provider.id}
							>
								{provider.name}でログイン
							</button>
						{/each}
					{:else}
						<p class="text-xs text-gray-500 dark:text-gray-400">ログインプロバイダーが未設定です</p>
					{/if}
				{/if}
			</div>
			<DarkModeToggle
				isDark={theme.isDark}
				onclick={theme.toggle}
				class="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
			/>
		</div>
		<h1 class="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">DBML Editor</h1>
		<div
			class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16 dark:border-gray-600 dark:bg-gray-800"
		>
			<p class="mb-4 text-gray-600 dark:text-gray-300">DBMLファイルを選択してください</p>
			<button
				class="rounded-md bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
				onclick={() => fileInput?.click()}
			>
				ファイルを選択
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".dbml"
				class="hidden"
				onchange={handleFileSelect}
			/>
		</div>
	</div>
{:else}
	<div class="flex h-screen flex-col">
		<!-- Toolbar -->
		<header class="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-gray-200">{fileName}</span>
				{#if isEdited}
					<span class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
						未保存
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<DarkModeToggle
					isDark={theme.isDark}
					onclick={theme.toggle}
					class="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
				/>
				{#if session}
					<div class="flex items-center gap-2 rounded bg-gray-700 px-2 py-1 text-xs text-gray-100">
						{#if userAvatar}
							<img alt="profile" src={userAvatar} class="h-7 w-7 rounded-full object-cover" />
						{/if}
						<span class="max-w-[140px] truncate">{userName}</span>
						<button
							class="rounded bg-gray-600 px-2 py-1 font-semibold hover:bg-gray-500 disabled:opacity-50"
							onclick={startSignOut}
							disabled={signingOut}
						>
							ログアウト
						</button>
					</div>
				{:else if configuredProviders.length > 0}
					<div class="flex flex-wrap items-center gap-2">
						{#each configuredProviders as provider}
							<button
								class="rounded border border-gray-600 px-3 py-1 text-xs text-gray-200 transition hover:bg-gray-700 disabled:opacity-50"
								onclick={() => startSignIn(provider.id)}
								disabled={activeProvider === provider.id}
							>
								{provider.name}でログイン
							</button>
						{/each}
					</div>
				{:else}
					<p class="text-xs text-gray-400">ログインプロバイダーが未設定です</p>
				{/if}
				<button
					class="rounded px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
					onclick={openNewFile}
				>
					別のファイル
				</button>
				<button
					class="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-40"
					onclick={save}
					disabled={!isEdited}
				>
					保存
				</button>
				<button
					class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
					onclick={download}
				>
					ダウンロード
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
				<DbmlDiagram dbml={content} onchange={(v) => (content = v)} darkMode={theme.isDark} />
			</div>
		</div>
	</div>
{/if}
