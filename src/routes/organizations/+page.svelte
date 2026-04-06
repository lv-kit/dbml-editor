<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';

	let { data } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-2xl">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="text-sm text-gray-500 hover:text-gray-700">← DBMLエディタ</a>
				<h1 class="text-2xl font-bold text-gray-800">組織一覧</h1>
			</div>
			<Button href="/organizations/new">
				組織を作成
			</Button>
		</div>

		{#if data.organizations.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16"
			>
				<p class="mb-4 text-gray-500">組織がまだありません</p>
				<Button href="/organizations/new">
					最初の組織を作成
				</Button>
			</div>
		{:else}
			<ul class="space-y-3">
				{#each data.organizations as org}
					<li>
						<Card>
							<CardContent class="px-5 py-4">
								<div class="flex items-center justify-between">
									<div>
										<p class="font-medium text-gray-800">{org.name}</p>
										<p class="mt-0.5 text-sm text-gray-400">{org.slug}</p>
									</div>
									<Button href="/organizations/{org.slug}/members" variant="outline" size="sm">
										メンバー管理
									</Button>
								</div>
							</CardContent>
						</Card>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
