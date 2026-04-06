<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-2xl">
		<div class="mb-6 flex items-center gap-4">
			<a href="/organizations" class="text-sm text-gray-500 hover:text-gray-700">← 組織一覧</a>
			<h1 class="text-2xl font-bold text-gray-800">{data.organization.name}</h1>
		</div>

		{#if form?.error}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{form.error}</AlertDescription>
			</Alert>
		{/if}
		{#if form?.success}
			<Alert variant="success" class="mb-4">
				<AlertDescription>管理者を追加しました</AlertDescription>
			</Alert>
		{/if}

		<Card class="mb-6">
			<CardHeader>
				<CardTitle>メンバー</CardTitle>
			</CardHeader>
			<CardContent>
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
								<Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
									{member.role === 'owner'
										? 'オーナー'
										: member.role === 'admin'
											? '管理者'
											: 'メンバー'}
								</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>

		{#if data.currentUser?.role === 'owner' || data.currentUser?.role === 'admin'}
			<Card class="mb-6">
				<CardHeader>
					<CardTitle>管理者を追加</CardTitle>
				</CardHeader>
				<CardContent>
					<form method="POST" action="?/addAdmin" class="flex gap-3">
						<Input
							type="email"
							name="email"
							placeholder="メールアドレス"
							required
							class="flex-1"
						/>
						<Button type="submit">
							追加
						</Button>
					</form>
				</CardContent>
			</Card>
		{/if}

		{#if data.currentUser?.role === 'owner'}
			<Card class="border-red-200">
				<CardHeader>
					<CardTitle class="text-red-600">組織の削除</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-gray-500">
						この操作は元に戻せません。組織に紐づくすべてのプロジェクトも削除されます。
					</p>
					<form method="POST" action="?/delete">
						<Button type="submit" variant="destructive">
							組織を削除
						</Button>
					</form>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
