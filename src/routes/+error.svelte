<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="flex h-[calc(100vh_-_50px)] flex-col items-center justify-center gap-2">
	<h1 class="rounded-md bg-zinc-700 px-2 py-1 text-3xl text-red-400">{page.status}</h1>
	<h1 class="text-3xl font-light text-zinc-300">{page.error?.message}</h1>
</main>
