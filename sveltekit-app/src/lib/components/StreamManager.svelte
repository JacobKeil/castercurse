<script lang="ts">
	import {
		render_source,
		channels,
		current_stream,
		MAX_CHANNELS,
		stream_manager_open,
		hide_stream
	} from '$lib/stores/streams';
	import { AddChannel, Settings, ToggleHidden, ToggleSource, Broadcast, TeamSection } from '$lib';
	import { onMount } from 'svelte';
	import { fly, slide } from 'svelte/transition';
	import { page } from '$app/state';
	import type { SupabaseClient, UserResponse } from '@supabase/supabase-js';
	import moment from 'moment';
	import { current_event } from '$lib/stores/event';
	import { fetch_live_data, handle_keydown } from '$lib/helpers';

	let auth_response: UserResponse;
	let is_logged_in: boolean = $state(false);

	let toggle_source = () => {};
	let copy_url = () => {};
	let copied_link = false;

	let { supabase }: { supabase: SupabaseClient<any, 'public', any>; } = $props();

	onMount(async () => {
		auth_response = await supabase.auth.getUser();
    is_logged_in = !!auth_response.data.user;
		
		toggle_source = () => {
			localStorage.setItem('render_source', String(!$render_source));
			$render_source = !$render_source;
			set_source_all();
		};

		copy_url = () => {
			copied_link = true;
			navigator.clipboard.writeText(page.url.href);
			setTimeout(() => {
				copied_link = false;
			}, 5000);
		};
	});
	
	function set_source_all() {
		if ($render_source) {
			$channels.forEach((ch) => {
				if (ch.set_quality) {
					ch.set_quality('chunked');
				}
			});
		} else {
			$channels.forEach((ch) => {
				if (ch.set_quality) {
					ch.set_quality('auto');
				}
			});
		}
	}
	
	$effect(() => {
		if ($stream_manager_open && $current_event) {
			fetch_live_data()
		}
	})
</script>

<div class="flex items-center justify-between p-4">
	<div class="flex items-center gap-2">
		<h1 class="rounded-lg bg-zinc-800 px-2 py-1 text-lg font-normal text-gray-500">
			Stream Manager
		</h1>
		{#if $channels.length > 0}
			<div
				in:slide={{ axis: 'x' }}
				out:slide={{ axis: 'x' }}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						channels.set([]);
					});
				}}
				onclick={() => {
					channels.set([]);
				}}
				class="group flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-800 px-2 py-1 duration-300 hover:bg-zinc-700"
			>
				<h1 class="text-lg text-gray-500 duration-300 group-hover:text-red-400">Reset</h1>
				<i
					class="fa-solid fa-arrows-rotate mt-[3px] text-gray-500 duration-300 group-hover:rotate-90"
				></i>
			</div>
		{/if}
	</div>
	<div
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			handle_keydown(e, () => {
				stream_manager_open.set(false);
			});
		}}
		onclick={() => { stream_manager_open.set(false); }}
		class="group cursor-pointer rounded-full bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
	>
		<i class="fa-solid fa-xmark fa-lg cursor-pointer text-gray-500 group-hover:text-gray-400"></i>
	</div>
</div>
<section class="grid grid-cols-1 gap-6 space-y-4 p-4 tablet:grid-cols-[1fr_1.5fr] tablet:space-y-0">
	<article class="space-y-4">
		{#if page.url.pathname.includes('event')}
			<div class="w-full space-y-1 rounded-md bg-zinc-800 px-5 py-4">
				<h1 class="text-2xl font-light text-zinc-400">{$current_event?.name}</h1>
				<div class="flex items-center gap-2">
					<p class="text-lg text-zinc-500">
						{moment($current_event?.start_date).format('MMMM Do YYYY [at] h:mmA')}
					</p>
					<p class="w-fit rounded-md bg-zinc-700 px-2 py-1 text-xs font-medium text-gray-400">
						North America
					</p>
				</div>
				<div class="flex items-center gap-2">
					<p class="text-lg text-zinc-500">Hosted by</p>
					<p class="text-lg text-danger/90">{$current_event?.created_by.display_name}</p>
				</div>
			</div>
			{#if $current_event?.links && $current_event.links.length > 0}
				<div class="grid grid-cols-2">
					{#each $current_event.links as link}
						<a
							href={link.url}
							target="_blank"
							class="flex w-full cursor-pointer items-center justify-center gap-2 space-y-1 rounded-md bg-zinc-800 px-4 py-3 text-zinc-400"
						>
							{link.label}
							<i class="fa-solid fa-sm fa-arrow-up-right-from-square"></i>
						</a>
					{/each}
				</div>
			{/if}
			<div class="space-y-2">
				<h1 class="text-lg font-medium text-gray-400">Main Broadcast</h1>
				{#if $current_event?.main_broadcast}
					<Broadcast broadcast={$current_event?.main_broadcast} {supabase} />
				{:else}
					<p class="text-gray-500">No main broadcast added to this event.</p>
				{/if}
			</div>
			<div class="space-y-2 pb-4">
				<h1 class="text-lg font-medium text-gray-400">Watch Parties</h1>
				{#if $current_event?.watch_parties}
					<section class="grid grid-cols-2 gap-2">
						{#each $current_event?.watch_parties as wp}
							<Broadcast broadcast={wp} {supabase} />
						{/each}
					</section>
				{:else}
					<p class="text-gray-500">No watch parties added to this event.</p>
				{/if}
			</div>
		{/if}
		<div
			class="grid grid-cols-[1fr_auto_auto] place-content-center gap-2"
			class:grid-cols-[1fr_auto_auto_auto]={$channels.some((ch) => ch.hidden)}
		>
			<AddChannel />
			<div
				class="flex items-center rounded-lg bg-zinc-800 px-3 font-medium text-gray-500"
				class:text-danger={$channels.length === MAX_CHANNELS}
			>
				{#if $channels.length === MAX_CHANNELS}
					<span class="mr-3 rounded-full font-normal text-gray-400">MAX</span>
				{/if}
				<p class="font-light" class:text-danger={$channels.length === MAX_CHANNELS}>
					{$channels.length} / {MAX_CHANNELS}
				</p>
			</div>
			<ToggleHidden />
			<ToggleSource />
		</div>
		<div class="flex h-fit flex-col gap-2">
			{#if $channels.length === 0}
				<p class="text-gray-500">No streams picked...</p>
			{/if}
			{#each $channels as channel, i (channel.id)}
				<div in:fly class="flex cursor-grab items-center justify-between rounded-md bg-zinc-800">
					<div class="flex items-center gap-3 pl-4">
						<i class="fa-sharp fa-solid fa-grip-dots mt-1 text-gray-500"></i>
						<p class="mt-1 text-xs text-gray-500">{i + 1}</p>
						<p
							class:text-gray-300={$current_stream?.id === channel.id}
							class:text-gray-500={$current_stream?.id !== channel.id}
						>
							{channel.handle}
						</p>
					</div>
					<div class="flex items-center">
						<div
							class="group cursor-pointer px-3 py-2 hover:bg-zinc-700"
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								handle_keydown(e, () => {
									hide_stream(channel)
								});
							}}
							onclick={() => { hide_stream(channel) }}
						>
							<i
								class="fa-solid fa-eye fa-sm cursor-pointer"
								class:text-gray-500={channel.hidden}
								class:text-danger={!channel.hidden}
							></i>
						</div>
						<div
							class="group cursor-pointer rounded-r-md px-4 py-2 hover:bg-zinc-700"
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								handle_keydown(e, () => {
									$channels = $channels.filter((ch) => ch.id !== channel.id);
								});
							}}
							onclick={() => {
								$channels = $channels.filter((ch) => ch.id !== channel.id);
							}}
						>
							<i
								class="fa-solid fa-xmark cursor-pointer font-semibold text-gray-400 duration-200 group-hover:text-danger"
							></i>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<Settings />
	</article>
	{#if page.url.pathname.includes('event')}
		<article>
			<div class="space-y-2">
				<h1 class="text-lg font-medium text-gray-400">Teams</h1>
				<div class="grid grid-cols-1 gap-2 tablet:grid-cols-3">
					{#if $current_event}
						{#each $current_event.teams as team}
							<TeamSection {supabase} {team} show_live_status={is_logged_in} />
						{/each}
					{:else}
						<p class="text-gray-500">No teams added to this event.</p>
					{/if}
				</div>
			</div>
		</article>
	{/if}
</section>
