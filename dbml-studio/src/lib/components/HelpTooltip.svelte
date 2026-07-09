<script lang="ts">
	let showTooltip = $state(false);
</script>

<div
	class="relative"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	role="tooltip"
>
	<span class="cursor-help text-sm font-medium text-muted-foreground hover:text-foreground">Help</span>

	{#if showTooltip}
		<div class="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl">
			<h3 class="mb-3 text-sm font-bold">操作ガイド</h3>
			<table class="w-full text-xs">
				<tbody>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">テーブル移動</td>
						<td class="py-1.5 text-muted-foreground">ヘッダーを左クリック + ドラッグ</td>
					</tr>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">カラム接続</td>
						<td class="py-1.5 text-muted-foreground">カラム行を左クリック + 別カラムへドラッグ</td>
					</tr>
					<tr class="border-b border-border">
						<td class="py-1.5 pr-3 font-medium">キャンバス移動</td>
						<td class="py-1.5 text-muted-foreground">中クリック or Shift + 左クリック + ドラッグ</td>
					</tr>
					<tr>
						<td class="py-1.5 pr-3 font-medium">ズーム</td>
						<td class="py-1.5 text-muted-foreground">Ctrl/Cmd + スクロール</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>
