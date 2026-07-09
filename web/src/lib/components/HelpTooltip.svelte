<script lang="ts">
	let showTooltip = $state(false);
</script>

<div
	class="relative"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	role="tooltip"
>
	<span class="cursor-help text-sm text-gray-400 hover:text-gray-200">Help</span>

	{#if showTooltip}
		<div class="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-600 bg-gray-800 p-4 shadow-xl">
			<h3 class="mb-3 text-sm font-bold text-gray-100">操作ガイド</h3>
			<table class="w-full text-xs">
				<tbody>
					<tr class="border-b border-gray-700">
						<td class="py-1.5 pr-3 font-medium text-gray-300">テーブル移動</td>
						<td class="py-1.5 text-gray-400">ヘッダーを左クリック + ドラッグ</td>
					</tr>
					<tr class="border-b border-gray-700">
						<td class="py-1.5 pr-3 font-medium text-gray-300">カラム接続</td>
						<td class="py-1.5 text-gray-400">カラム行を左クリック + 別カラムへドラッグ</td>
					</tr>
					<tr class="border-b border-gray-700">
						<td class="py-1.5 pr-3 font-medium text-gray-300">キャンバス移動</td>
						<td class="py-1.5 text-gray-400">中クリック or Shift + 左クリック + ドラッグ</td>
					</tr>
					<tr>
						<td class="py-1.5 pr-3 font-medium text-gray-300">ズーム</td>
						<td class="py-1.5 text-gray-400">Ctrl/Cmd + スクロール</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>
