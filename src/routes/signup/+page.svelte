<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent } from '$lib/components/ui/card';

	function selectPersonal() {
		goto('/signup/account?userType=personal');
	}

	function selectCorporate() {
		goto('/signup/organization');
	}

	function handleOptionKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key === 'Enter') {
			event.preventDefault();
			action();
			return;
		}

		if (event.key === ' ') {
			event.preventDefault();
		}
	}

	function handleOptionKeyup(event: KeyboardEvent, action: () => void) {
		if (event.key === ' ') {
			event.preventDefault();
			action();
		}
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
			onkeydown={(e) => handleOptionKeydown(e, selectPersonal)}
			onkeyup={(e) => handleOptionKeyup(e, selectPersonal)}
			class="w-64 cursor-pointer rounded-xl text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
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
			onkeydown={(e) => handleOptionKeydown(e, selectCorporate)}
			onkeyup={(e) => handleOptionKeyup(e, selectCorporate)}
			class="w-64 cursor-pointer rounded-xl text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
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
