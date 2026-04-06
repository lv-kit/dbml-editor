<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-2xl">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="text-sm text-gray-500 hover:text-gray-700">← DBMLエディタ</a>
				<h1 class="text-2xl font-bold text-gray-800">組織一覧</h1>
			</div>
			<a
				href="/organizations/new"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
			>
				組織を作成
			</a>
		</div>

		{#if data.organizations.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16"
			>
				<p class="mb-4 text-gray-500">組織がまだありません</p>
				<a
					href="/organizations/new"
					class="rounded-md bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
				>
					最初の組織を作成
				</a>
			</div>
		{:else}
			<ul class="space-y-3">
				{#each data.organizations as org}
					<li class="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-800">{org.name}</p>
								<p class="mt-0.5 text-sm text-gray-400">{org.slug}</p>
							</div>
							<a
								href="/organizations/{org.slug}/members"
								class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
							>
								メンバー管理
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
