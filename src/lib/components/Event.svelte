<script lang="ts">
	import { goto } from '$app/navigation';
	import { handle_keydown } from '../helpers';
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
		is_completed = false,
		is_draft = false,
		to_edit = false
	}: {
		event: EventType;
		is_live?: boolean;
		is_completed?: boolean;
		is_draft?: boolean;
		to_edit?: boolean;
	} = $props();

	const start = moment(event.start_date);
	const now = moment();

	const diff_hours = start.diff(now, 'hours', true);
	const is_soon = diff_hours >= 0 && diff_hours < 6;
	const hours_rounded = Math.max(1, Math.ceil(diff_hours));
</script>

<div
	role="button"
	tabindex="0"
	onclick={() => {
		if (to_edit) {
			goto(`/organize/${event.id}`);
		} else {
			goto(`/events/${event.id}`);
		}
	}}
	onkeydown={(e) => {
		handle_keydown(e, () => {
			if (to_edit) {
				goto(`/organize/${event.id}`);
			} else {
				goto(`/events/${event.id}`);
			}
		});
	}}
	class="cursor-pointer rounded-md bg-zinc-800 p-4 duration-200 hover:-translate-y-1"
>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl text-zinc-300">{event.name}</h1>
		{#if is_live}
			<div class="w-fit rounded-sm bg-danger/90 px-4 py-1 text-xs">
				<h1>LIVE</h1>
			</div>
		{/if}
		{#if is_draft}
			<div class="w-fit rounded-sm bg-yellow-500 px-4 py-1 text-xs font-medium text-zinc-800">
				<h1>DRAFT</h1>
			</div>
		{/if}
		{#if is_completed}
			<i class="fa-solid fa-check text-green-500"></i>
		{/if}
	</div>
	<section class="space-y-5">
		<div class="grid grid-cols-[auto_1fr_1fr] grid-rows-2 items-center gap-2">
			{#if event.logo_url}
				<img class="row-span-2 w-[80px] rounded-lg" src={event.logo_url} alt="" />
			{:else}
				<div
					class="group row-span-2 grid aspect-square h-full w-[88px] cursor-pointer place-content-center rounded-lg border-2 border-dashed border-zinc-600 bg-cover bg-center hover:border-red-400"
				>
					<i class="fa-solid fa-image text-zinc-400 group-hover:text-red-400"></i>
				</div>
			{/if}
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
					<span class="font-light text-red-400">{event.created_by.display_name}</span></span
				>
			</div>
		</div>
		<div>
			{#if !is_completed && is_soon}
				<h1 class="text-sm text-zinc-400">
					LIVE IN <span class="text-red-400"
						>{hours_rounded} {hours_rounded === 1 ? 'HOUR' : 'HOURS'}</span
					>
				</h1>
			{:else if is_completed}
				<h1 class="text-sm text-zinc-400">WAS LIVE ON</h1>
			{:else}
				<h1 class="text-sm text-zinc-400">LIVE ON</h1>
			{/if}

			<h1 class="text-zinc-300">
				{moment(event.start_date).format('dddd, MMMM Do YYYY [at] h:mm A')}
			</h1>
		</div>
	</section>
</div>
