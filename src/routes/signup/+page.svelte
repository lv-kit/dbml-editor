<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent } from '$lib/components/ui/card';

	function selectPersonal() {
		goto('/signup/account?userType=personal');
	}

	function selectCorporate() {
		goto('/signup/organization');
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
	<h1 class="mb-2 text-3xl font-bold text-gray-800">DBML Editor</h1>
	<p class="mb-10 text-gray-500">ご利用形態を選択してください</p>

	<div class="flex gap-6">
		<div
			role="button"
			tabindex="0"
			onclick={selectPersonal}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					selectPersonal();
				}
			}}
			class="w-64 cursor-pointer text-left"
		>
			<Card class="h-full border-2 transition hover:border-blue-500 hover:shadow-md">
				<CardContent class="flex flex-col items-center p-8">
					<span class="mb-3 text-4xl">👤</span>
					<span class="mb-2 text-lg font-semibold text-gray-800">個人利用</span>
					<span class="text-center text-sm text-gray-500">
						個人でDBMLエディタを<br />ご利用いただけます
					</span>
				</CardContent>
			</Card>
		</div>

		<div
			role="button"
			tabindex="0"
			onclick={selectCorporate}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					selectCorporate();
				}
			}}
			class="w-64 cursor-pointer text-left"
		>
			<Card class="h-full border-2 transition hover:border-blue-500 hover:shadow-md">
				<CardContent class="flex flex-col items-center p-8">
					<span class="mb-3 text-4xl">🏢</span>
					<span class="mb-2 text-lg font-semibold text-gray-800">法人利用</span>
					<span class="text-center text-sm text-gray-500">
						組織でDBMLエディタを<br />ご利用いただけます
					</span>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
