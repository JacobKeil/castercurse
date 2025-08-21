<script lang="ts">
	import { goto } from '$app/navigation';
	import moment from 'moment';

	interface EventType {
		id: string;
		name: string;
		start_date: Date;
		end_date: Date;
		logo_url: string | null;
		created_by: {
			id: string;
			handle: string;
			display_name: string;
			created_at: Date;
			updated_at: Date;
		};
		team_count: number;
		player_count: number;
	}

	let { 
		event, 
		is_live = false,
		is_completed = false
	}: { 
		event: EventType; 
		is_live?: boolean; 
		is_completed?: boolean 
	} = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onclick={() => {
		goto(`/events/${event.id}`);
	}}
	class="cursor-pointer rounded-md bg-zinc-800 p-4 duration-200 hover:-translate-y-1"
>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl text-zinc-200">{event.name}</h1>
		{#if is_live}
			<div class="bg-danger/90 w-fit rounded-md px-4 py-1">
				<h1>LIVE</h1>
			</div>
		{/if}
		{#if is_completed}
			<i class="fa-solid fa-check text-green-500"></i>
		{/if}
	</div>
	<section class="space-y-5">
		<div class="grid grid-cols-[auto_1fr_1fr] grid-rows-2 items-center gap-2">
			<img class="row-span-2 w-[80px] rounded-lg" src={event.logo_url} alt="" />
			<div class="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-700/50">
				<span class="text-zinc-300">{event.team_count}</span>
				<span class="text-zinc-400">{event.team_count === 1 ? 'Team' : 'Teams'}</span>
			</div>
			<div class="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-700/50">
				<span class="text-zinc-300">{event.player_count}</span>
				<span class="text-zinc-400">{event.player_count === 1 ? 'Player' : 'Players'}</span>
			</div>
			<div
				class="col-span-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-700/50"
			>
				<span class="flex items-center gap-2 text-zinc-300"
					><p>Hosted by</p>
					<span class="font-light text-[#9e7ddb]">{event.created_by.display_name}</span></span
				>
			</div>
		</div>
		<div>
			{#if is_completed}
				<h1 class="text-sm text-zinc-400">WAS LIVE ON</h1>
			{:else}
				<h1 class="text-sm text-zinc-400">LIVE ON</h1>
			{/if}
			<h1 class="text-zinc-300">
				{moment(event.start_date).format('dddd, MMMM Do YYYY [at] h:mmA')}
			</h1>
		</div>
	</section>
</div>
