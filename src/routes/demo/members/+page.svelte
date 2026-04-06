<script lang="ts">
	import {
		canManageMembers,
		canEditMemberRole,
		canRemoveMember,
		type MemberRole
	} from '$lib/members';

	const mockOrg = { id: 1, name: 'Acme Corporation', slug: 'acme-corporation' };
	const mockCurrentUser = { id: 1, name: '山田太郎', email: 'yamada@example.com', role: 'owner' as MemberRole };
	const mockMembers = [
		{ id: 1, name: '山田太郎', email: 'yamada@example.com', role: 'owner' as MemberRole },
		{ id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: 'admin' as MemberRole },
		{ id: 3, name: '佐藤一郎', email: 'sato@example.com', role: 'member' as MemberRole },
		{ id: 4, name: '田中美咲', email: 'tanaka@example.com', role: 'member' as MemberRole }
	];

	let showAddForm = $state(false);
	const currentUserRole = mockCurrentUser.role;
	const isManager = canManageMembers(currentUserRole);

	function roleLabel(role: string): string {
		switch (role) {
			case 'owner': return 'オーナー';
			case 'admin': return '管理者';
			case 'member': return 'メンバー';
			default: return role;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-3xl">
		<div class="mb-6 flex items-center gap-4">
			<a href="/organizations" class="text-sm text-gray-500 hover:text-gray-700">← 組織一覧</a>
			<h1 class="text-2xl font-bold text-gray-800">
				{mockOrg.name} - メンバー管理
			</h1>
		</div>

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
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" data-testid="add-member-form">
						<h2 class="mb-4 text-lg font-semibold text-gray-800">メンバーを追加</h2>
						<form>
							<div class="mb-3">
								<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
									名前 <span class="text-red-500">*</span>
								</label>
								<input id="name" name="name" type="text" placeholder="例: 田中太郎"
									class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
							</div>
							<div class="mb-3">
								<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
									メールアドレス <span class="text-red-500">*</span>
								</label>
								<input id="email" name="email" type="email" placeholder="例: tanaka@example.com"
									class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
							</div>
							<div class="mb-4">
								<label for="role" class="mb-1 block text-sm font-medium text-gray-700">権限</label>
								<select id="role" name="role"
									class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
									<option value="member">メンバー</option>
									<option value="admin">管理者</option>
									{#if currentUserRole === 'owner'}
										<option value="owner">オーナー</option>
									{/if}
								</select>
							</div>
							<div class="flex gap-3">
								<button type="button"
									class="rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700">追加</button>
								<button type="button" onclick={() => (showAddForm = false)}
									class="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{/if}

		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="w-full" data-testid="members-table">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50">
						<th class="px-5 py-3 text-left text-sm font-medium text-gray-600">名前</th>
						<th class="px-5 py-3 text-left text-sm font-medium text-gray-600">メールアドレス</th>
						<th class="px-5 py-3 text-left text-sm font-medium text-gray-600">権限</th>
						{#if isManager}
							<th class="px-5 py-3 text-right text-sm font-medium text-gray-600">操作</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each mockMembers as member}
						<tr class="border-b border-gray-100 last:border-b-0" data-testid="member-row">
							<td class="px-5 py-3 text-sm text-gray-800">
								{member.name}
								{#if member.id === mockCurrentUser.id}
									<span class="ml-1 text-xs text-gray-400">(自分)</span>
								{/if}
							</td>
							<td class="px-5 py-3 text-sm text-gray-600">{member.email}</td>
							<td class="px-5 py-3 text-sm">
							{#if isManager && canEditMemberRole(currentUserRole, member.role)}
									<select
										class="rounded border border-gray-300 px-2 py-1 text-sm">
										<option value="member" selected={member.role === 'member'}>メンバー</option>
										<option value="admin" selected={member.role === 'admin'}>管理者</option>
										{#if currentUserRole === 'owner'}
											<option value="owner" selected={member.role === 'owner'}>オーナー</option>
										{/if}
									</select>
								{:else}
									<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium
										{member.role === 'owner'
										? 'bg-purple-100 text-purple-700'
										: member.role === 'admin'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-700'}">
										{roleLabel(member.role)}
									</span>
								{/if}
							</td>
							{#if isManager}
								<td class="px-5 py-3 text-right">
									{#if canRemoveMember(currentUserRole, member.role)}
										<button type="button"
											class="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50">削除</button>
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
