<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		canManageMembers,
		canEditMemberRole,
		canRemoveMember,
		type MemberRole
	} from '$lib/members';

	let { data, form } = $props();

	let showAddForm = $state(false);
	let newName = $state('');
	let newEmail = $state('');
	let newRole = $state<MemberRole>('member');

	const currentUserRole = $derived((data.currentUser?.role as MemberRole) ?? 'member');
	const isManager = $derived(canManageMembers(currentUserRole));

	function resetForm() {
		newName = '';
		newEmail = '';
		newRole = 'member';
		showAddForm = false;
	}

	function roleLabel(role: string): string {
		switch (role) {
			case 'owner':
				return 'オーナー';
			case 'admin':
				return '管理者';
			case 'member':
				return 'メンバー';
			default:
				return role;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6 flex items-center gap-4">
			<a
				href="/organizations"
				class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				>← 組織一覧</a
			>
			<h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
				{data.org?.name ?? '組織'} - メンバー管理
			</h1>
		</div>

		{#if data.error}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
				{data.error}
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
				操作が完了しました
			</div>
		{/if}

		{#if data.org}
			{#if isManager}
				<div class="mb-6">
					{#if !showAddForm}
						<button
							type="button"
							data-testid="add-member-button"
							onclick={() => (showAddForm = true)}
							class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
						>
							メンバーを追加
						</button>
					{:else}
						<div
							class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
							data-testid="add-member-form"
						>
							<h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
								メンバーを追加
							</h2>
							<form
								method="POST"
								action="?/add"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										if (form?.success) resetForm();
									};
								}}
							>
								<div class="mb-3">
									<label for="name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
										名前 <span class="text-red-500">*</span>
									</label>
									<input
										id="name"
										name="name"
										type="text"
										bind:value={newName}
										required
										placeholder="例: 田中太郎"
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
									/>
								</div>

								<div class="mb-3">
									<label
										for="email"
										class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										メールアドレス <span class="text-red-500">*</span>
									</label>
									<input
										id="email"
										name="email"
										type="email"
										bind:value={newEmail}
										required
										placeholder="例: tanaka@example.com"
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
									/>
								</div>

								<div class="mb-4">
									<label
										for="role"
										class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										権限
									</label>
									<select
										id="role"
										name="role"
										bind:value={newRole}
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
									>
										<option value="member">メンバー</option>
										<option value="admin">管理者</option>
										{#if currentUserRole === 'owner'}
											<option value="owner">オーナー</option>
										{/if}
									</select>
								</div>

								<div class="flex gap-3">
									<button
										type="submit"
										class="rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
									>
										追加
									</button>
									<button
										type="button"
										onclick={() => (showAddForm = false)}
										class="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									>
										キャンセル
									</button>
								</div>
							</form>
						</div>
					{/if}
				</div>
			{/if}

			{#if data.members.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-16 dark:border-gray-600 dark:bg-gray-800"
				>
					<p class="text-gray-500 dark:text-gray-400">メンバーがいません</p>
				</div>
			{:else}
				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<table class="w-full" data-testid="members-table">
						<thead>
							<tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
								<th
									class="px-5 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
									>名前</th
								>
								<th
									class="px-5 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
									>メールアドレス</th
								>
								<th
									class="px-5 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
									>権限</th
								>
								{#if isManager}
									<th
										class="px-5 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300"
										>操作</th
									>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each data.members as member}
								<tr
									class="border-b border-gray-100 last:border-b-0 dark:border-gray-700"
									data-testid="member-row"
								>
									<td class="px-5 py-3 text-sm text-gray-800 dark:text-gray-200">
										{member.name}
										{#if member.id === data.currentUser?.id}
											<span class="ml-1 text-xs text-gray-400">(自分)</span>
										{/if}
									</td>
									<td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-400"
										>{member.email}</td
									>
									<td class="px-5 py-3 text-sm">
										{#if isManager && canEditMemberRole(currentUserRole, member.role as MemberRole)}
											<form method="POST" action="?/updateRole" use:enhance class="inline">
												<input type="hidden" name="targetUserId" value={member.id} />
												<select
													name="role"
													data-testid="role-select-{member.id}"
													onchange={(e) => e.currentTarget.form?.requestSubmit()}
													class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
												>
													<option value="member" selected={member.role === 'member'}
														>メンバー</option
													>
													<option value="admin" selected={member.role === 'admin'}
														>管理者</option
													>
													{#if currentUserRole === 'owner'}
														<option value="owner" selected={member.role === 'owner'}
															>オーナー</option
														>
													{/if}
												</select>
											</form>
										{:else}
											<span
												class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium
													{member.role === 'owner'
													? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
													: member.role === 'admin'
														? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
														: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}"
											>
												{roleLabel(member.role)}
											</span>
										{/if}
									</td>
									{#if isManager}
										<td class="px-5 py-3 text-right">
											{#if canRemoveMember(currentUserRole, member.role as MemberRole)}
												<form method="POST" action="?/remove" use:enhance class="inline">
													<input type="hidden" name="targetUserId" value={member.id} />
													<button
														type="submit"
														data-testid="remove-member-{member.id}"
														class="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
													>
														削除
													</button>
												</form>
											{/if}
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>
</div>
