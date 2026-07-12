<script lang="ts">
	import { messages, type Locale } from '$lib/i18n';

	let { locale }: { locale: Locale } = $props();
	let text = $derived(messages[locale]);
	let showTooltip = $state(false);
</script>

<div
	class="relative"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	role="tooltip"
>
	<span class="cursor-help text-sm font-medium text-muted-foreground hover:text-foreground">{text.help}</span>

	{#if showTooltip}
		<div class="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl">
			<h3 class="mb-3 text-sm font-bold">{text.helpTitle}</h3>
			<table class="w-full text-xs">
				<tbody>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">{text.moveTable}</td>
						<td class="py-1.5 text-muted-foreground">{text.moveTableDescription}</td>
					</tr>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">{text.connectColumns}</td>
						<td class="py-1.5 text-muted-foreground">{text.connectColumnsDescription}</td>
					</tr>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">{text.moveCanvas}</td>
						<td class="py-1.5 text-muted-foreground">{text.moveCanvasDescription}</td>
					</tr>
					<tr>
						<td class="py-1.5 pr-3 font-medium">{text.zoom}</td>
						<td class="py-1.5 text-muted-foreground">{text.zoomDescription}</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>
