<script lang="ts">
	import { Event } from '$lib/components';
	let { data } = $props();
</script>

<svelte:head>
	<title>Events</title>
	<meta name="description" content="Events" />
</svelte:head>

<section class="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-4">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-medium text-zinc-300">Ongoing Events</h1>
		{#if data.live_events.length > 0}
			<div class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3">
				{#each data.live_events as event}
					<Event {event} is_live />
				{/each}
			</div>
		{:else}
			<div class="flex h-72 w-full items-center justify-center rounded-lg bg-zinc-800/30">
				<h1 class="text-zinc-500">No events</h1>
			</div>
		{/if}
	</div>
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-medium text-zinc-300">Upcoming Events</h1>
		{#if data.upcoming_events.length > 0}
			<div class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3">
				{#each data.upcoming_events as event}
					<Event {event} />
				{/each}
			</div>
		{:else}
			<div class="flex h-72 w-full items-center justify-center rounded-lg bg-zinc-800/30">
				<h1 class="text-zinc-500">No events</h1>
			</div>
		{/if}
	</div>
	<!-- <div class="flex flex-col gap-2">
		<h1 class="text-zinc-300 text-2xl font-medium">Completed Events</h1>
		{#if data.completed_events.length > 0}
			<div class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3">
				{#each data.completed_events as event}
					<Event {event} is_completed />
				{/each}
			</div>
		{:else}
			<div class="flex items-center justify-center w-full h-72 bg-zinc-800/30 rounded-lg">
				<h1 class="text-zinc-500">No events</h1>
			</div>
		{/if}
	</div> -->
</section>
