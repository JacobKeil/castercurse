<script lang="ts">
	let { data } = $props();
</script>

<section class="flex h-full max-w-[1200px] space-y-6 p-6">
	<h1 class="text-xl text-zinc-300">{data.event?.name}</h1>
	<div class="grid grid-cols-12 gap-3"></div>
</section>
