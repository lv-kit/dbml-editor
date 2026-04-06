<script lang="ts">
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-2xl">
		<div class="mb-6 flex items-center gap-4">
			<a href="/organizations" class="text-sm text-gray-500 hover:text-gray-700">← 組織一覧</a>
			<h1 class="text-2xl font-bold text-gray-800">{data.organization.name}</h1>
		</div>

		{#if form?.error}
			<div class="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">{form.error}</div>
		{/if}
		{#if form?.success}
			<div class="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600">管理者を追加しました</div>
		{/if}

		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">メンバー</h2>
			{#if data.members.length === 0}
				<p class="text-sm text-gray-500">メンバーがいません</p>
			{:else}
				<ul class="space-y-2">
					{#each data.members as member}
						<li class="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
							<div>
								<p class="font-medium text-gray-800">{member.name}</p>
								<p class="text-sm text-gray-500">{member.email}</p>
							</div>
							<span
								class="rounded-full px-2.5 py-0.5 text-xs font-medium {member.role === 'owner'
									? 'bg-purple-100 text-purple-700'
									: member.role === 'admin'
										? 'bg-blue-100 text-blue-700'
										: 'bg-gray-100 text-gray-600'}"
							>
								{member.role === 'owner'
									? 'オーナー'
									: member.role === 'admin'
										? '管理者'
										: 'メンバー'}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if data.currentUser?.role === 'owner' || data.currentUser?.role === 'admin'}
			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">管理者を追加</h2>
				<form method="POST" action="?/addAdmin" class="flex gap-3">
					<input type="hidden" name="userId" value={data.userId} />
					<input
						type="email"
						name="email"
						placeholder="メールアドレス"
						required
						class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
					>
						追加
					</button>
				</form>
			</div>
		{/if}

		{#if data.currentUser?.role === 'owner'}
			<div class="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<h2 class="mb-2 text-lg font-semibold text-red-600">組織の削除</h2>
				<p class="mb-4 text-sm text-gray-500">
					この操作は元に戻せません。組織に紐づくすべてのプロジェクトも削除されます。
				</p>
				<form method="POST" action="?/delete">
					<input type="hidden" name="userId" value={data.userId} />
					<button
						type="submit"
						class="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
					>
						組織を削除
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
