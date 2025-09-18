<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { EventCreate, Event } from '$lib';

	let { data } = $props();
</script>

<section class="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-4">
	<h1 class="text-lg text-zinc-400">
		My Events - <span class="text-red-400">{data.user?.user_metadata.nickname}</span>
	</h1>
	<section class="grid grid-cols-4">
		<EventCreate
			invalidate_all={() => {
				invalidateAll();
			}}
		/>
	</section>
	<hr class="border-dashed opacity-70" />
	<div class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3">
		{#if data.events && data.events.length > 0}
			{#each data.events as event}
				<Event {event} to_edit is_draft={event.status === 'Draft'} />
			{/each}
		{/if}
	</div>
</section>
