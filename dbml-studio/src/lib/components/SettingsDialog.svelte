<script lang="ts">
	import { tick } from 'svelte';
	import { Laptop, Moon, Sun, X } from '@lucide/svelte';
	import { LOCALES, messages, type Locale } from '$lib/i18n';
	import { type ThemePreference } from '$lib/theme';

	interface Props {
		locale: Locale;
		themePreference: ThemePreference;
		onclose: () => void;
		onlocalechange: (locale: Locale) => void;
		onthemechange: (preference: ThemePreference) => void;
	}

	let { locale, themePreference, onclose, onlocalechange, onthemechange }: Props = $props();
	let dialog: HTMLDivElement | undefined = $state();
	let text = $derived(messages[locale]);
	const themeOptions: {
		preference: ThemePreference;
		label: (text: typeof messages.ja) => string;
		icon: typeof Laptop;
	}[] = [
		{ preference: 'system', label: (text) => text.systemTheme, icon: Laptop },
		{ preference: 'light', label: (text) => text.lightTheme, icon: Sun },
		{ preference: 'dark', label: (text) => text.darkTheme, icon: Moon }
	];

	$effect(() => {
		tick().then(() => dialog?.focus());
	});

	function closeFromBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
			return;
		}

		if (event.key !== 'Tab' || !dialog) return;
		const focusable = Array.from(
			dialog.querySelectorAll<HTMLElement>(
				'button:not([disabled]), input:not([disabled]), select:not([disabled])'
			)
		);
		const first = focusable[0];
		const last = focusable.at(-1);
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	function changeLocale(event: Event) {
		onlocalechange((event.currentTarget as HTMLSelectElement).value as Locale);
	}

	function changeTheme(event: Event) {
		onthemechange((event.currentTarget as HTMLInputElement).value as ThemePreference);
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	role="presentation"
	onclick={closeFromBackdrop}
>
	<div
		bind:this={dialog}
		class="w-full max-w-xl rounded-lg border border-border bg-card shadow-xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="settings-dialog-title"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<section class="p-6">
			<div class="mb-6 flex items-center justify-between gap-4">
				<h2 id="settings-dialog-title" class="text-lg font-semibold">{text.settingsTitle}</h2>
				<button
					type="button"
					class="rounded p-1 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					onclick={onclose}
					aria-label={text.closeSettings}
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="divide-y divide-border border-y border-border">
				<div class="flex min-h-28 items-center justify-between gap-6 py-5">
					<label class="text-sm font-medium" for="settings-locale">{text.language}</label>
				<select
					id="settings-locale"
					class="h-10 min-w-44 rounded-md border border-input bg-background px-3 text-sm"
					value={locale}
					onchange={changeLocale}
				>
					{#each LOCALES as supportedLocale}
						<option value={supportedLocale}>{messages[supportedLocale].languageName}</option>
					{/each}
				</select>
				</div>

				<fieldset class="flex min-h-28 items-center justify-between gap-6 py-5">
					<legend class="text-sm font-medium">{text.theme}</legend>
					<div class="inline-flex rounded-xl bg-muted p-1" role="radiogroup" aria-label={text.theme}>
						{#each themeOptions as option}
							{@const Icon = option.icon}
							<label
								class="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-sm"
								title={option.label(text)}
							>
								<input
									type="radio"
									class="sr-only"
									name="theme"
									value={option.preference}
									checked={themePreference === option.preference}
									aria-label={option.label(text)}
									onchange={changeTheme}
								/>
								<Icon class="size-5" aria-hidden="true" />
							</label>
						{/each}
					</div>
				</fieldset>
			</div>
		</section>
	</div>
</div>
