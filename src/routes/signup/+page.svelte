<script lang="ts">
	import { goto } from '$app/navigation';

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
		<button
			onclick={selectPersonal}
			class="flex w-64 flex-col items-center rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-500 hover:shadow-md"
		>
			<span class="mb-3 text-4xl">👤</span>
			<span class="mb-2 text-lg font-semibold text-gray-800">個人利用</span>
			<span class="text-center text-sm text-gray-500">
				個人でDBMLエディタを<br />ご利用いただけます
			</span>
		</button>

		<button
			onclick={selectCorporate}
			class="flex w-64 flex-col items-center rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition hover:border-blue-500 hover:shadow-md"
		>
			<span class="mb-3 text-4xl">🏢</span>
			<span class="mb-2 text-lg font-semibold text-gray-800">法人利用</span>
			<span class="text-center text-sm text-gray-500">
				組織でDBMLエディタを<br />ご利用いただけます
			</span>
		</button>
	</div>
</div>
