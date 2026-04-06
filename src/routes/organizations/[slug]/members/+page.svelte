<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		canManageMembers,
		canEditMemberRole,
		canRemoveMember,
		type MemberRole
	} from '$lib/members';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

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
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{data.error}</AlertDescription>
			</Alert>
		{/if}

		{#if form?.error}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{form.error}</AlertDescription>
			</Alert>
		{/if}

		{#if form?.success}
			<Alert variant="success" class="mb-4">
				<AlertDescription>操作が完了しました</AlertDescription>
			</Alert>
		{/if}

		{#if data.org}
			{#if isManager}
				<div class="mb-6">
					{#if !showAddForm}
						<Button
							type="button"
							data-testid="add-member-button"
							onclick={() => (showAddForm = true)}
						>
							メンバーを追加
						</Button>
					{:else}
						<Card data-testid="add-member-form">
							<CardHeader>
								<CardTitle>メンバーを追加</CardTitle>
							</CardHeader>
							<CardContent>
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
										<Label for="name" class="mb-1 block">
											名前 <span class="text-red-500">*</span>
										</Label>
										<Input
											id="name"
											name="name"
											type="text"
											value={newName}
											oninput={(e) => (newName = (e.target as HTMLInputElement).value)}
											required
											placeholder="例: 田中太郎"
										/>
									</div>

									<div class="mb-3">
										<Label for="email" class="mb-1 block">
											メールアドレス <span class="text-red-500">*</span>
										</Label>
										<Input
											id="email"
											name="email"
											type="email"
											value={newEmail}
											oninput={(e) => (newEmail = (e.target as HTMLInputElement).value)}
											required
											placeholder="例: tanaka@example.com"
										/>
									</div>

									<div class="mb-4">
										<Label for="role" class="mb-1 block">
											権限
										</Label>
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
										<Button type="submit">
											追加
										</Button>
										<Button
											type="button"
											variant="outline"
											onclick={() => (showAddForm = false)}
										>
											キャンセル
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
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
				<Card>
					<Table data-testid="members-table">
						<TableHeader>
							<TableRow>
								<TableHead class="px-5">名前</TableHead>
								<TableHead class="px-5">メールアドレス</TableHead>
								<TableHead class="px-5">権限</TableHead>
								{#if isManager}
									<TableHead class="px-5 text-right">操作</TableHead>
								{/if}
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each data.members as member}
								<TableRow data-testid="member-row">
									<TableCell class="px-5 py-3">
										{member.name}
										{#if member.id === data.currentUser?.id}
											<span class="ml-1 text-xs text-gray-400">(自分)</span>
										{/if}
									</TableCell>
									<TableCell class="px-5 py-3 text-gray-600 dark:text-gray-400">
										{member.email}
									</TableCell>
									<TableCell class="px-5 py-3">
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
											<Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
												{roleLabel(member.role)}
											</Badge>
										{/if}
									</TableCell>
									{#if isManager}
										<TableCell class="px-5 py-3 text-right">
											{#if canRemoveMember(currentUserRole, member.role as MemberRole)}
												<form method="POST" action="?/remove" use:enhance class="inline">
													<input type="hidden" name="targetUserId" value={member.id} />
													<Button
														type="submit"
														variant="ghost"
														size="sm"
														data-testid="remove-member-{member.id}"
														class="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
													>
														削除
													</Button>
												</form>
											{/if}
										</TableCell>
									{/if}
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</Card>
			{/if}
		{/if}
	</div>
</div>
