<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, setContext } from 'svelte';

	let { children } = $props();

	let isDark = $state(false);

	onMount(() => {
		const stored = localStorage.getItem('darkMode');
		if (stored !== null) {
			isDark = stored === 'true';
		} else {
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		applyDarkClass(isDark);
	});

	function applyDarkClass(dark: boolean) {
		document.documentElement.classList.toggle('dark', dark);
	}

	function toggleDarkMode() {
		isDark = !isDark;
		applyDarkClass(isDark);
		localStorage.setItem('darkMode', String(isDark));
	}

	setContext('darkMode', {
		get isDark() {
			return isDark;
		},
		toggle: toggleDarkMode
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
