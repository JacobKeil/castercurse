<script lang="ts">
	import { render_source, channels, MAX_CHANNELS, stream_manager_open } from '$lib/stores/streams';
	import {
		AddChannel,
		Settings,
		ToggleHidden,
		ToggleSource,
		Broadcast,
		TeamSection,
		FollowerSection
	} from '$lib';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import moment from 'moment';
	import { current_event } from '$lib/stores/event';
	import { fetch_live_data, handle_keydown } from '$lib/helpers';
	import { supabase } from '$lib/supabase_client';
	import Sortable from './sort/Sortable.svelte';
	import { fetch_followers_live_data, followers_live } from '$lib/stores/followers';

	let is_logged_in: boolean = $state(false);

	let toggle_source = () => {};
	let copy_url = () => {};
	let copied_link = false;

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			is_logged_in = !!data.session;
		});
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_evt, s) => {
			is_logged_in = !!s;
		});
		return () => subscription.unsubscribe();
	});

	onMount(() => {
		toggle_source = () => {
			localStorage.setItem('render_source', String(!$render_source));
			$render_source = !$render_source;
			set_source_all();
		};

		copy_url = () => {
			copied_link = true;
			navigator.clipboard.writeText(page.url.href);
			setTimeout(() => (copied_link = false), 5000);
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
		if ($stream_manager_open && page.url.pathname.includes('/events')) {
			fetch_live_data();
		} else if ($stream_manager_open && page.url.pathname.includes('/view')) {
			fetch_followers_live_data();
		}
	});
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
		onclick={() => {
			stream_manager_open.set(false);
		}}
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
					<Broadcast broadcast={$current_event?.main_broadcast} />
				{:else}
					<p class="text-gray-500">No main broadcast added to this event.</p>
				{/if}
			</div>
			<div class="space-y-2 pb-4">
				<h1 class="text-lg font-medium text-gray-400">Watch Parties</h1>
				{#if $current_event?.watch_parties}
					<section class="grid grid-cols-2 gap-2">
						{#each $current_event?.watch_parties as wp}
							<Broadcast broadcast={wp} />
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
			<ToggleHidden small />
			<ToggleSource />
		</div>
		<div class="flex h-fit flex-col gap-2">
			{#if $channels.length === 0}
				<p class="text-gray-500">No streams picked...</p>
			{/if}
			<Sortable axis="y" variant="manager" />
		</div>
		<Settings />
	</article>
	{#if page.url.pathname.includes('event')}
		<article>
			<div class="space-y-2">
				<h1 class="text-lg font-medium text-gray-400">Teams</h1>
				<div class="grid grid-cols-1 gap-2 tablet:grid-cols-3">
					{#if $current_event && $current_event.teams.length > 0}
						{#each $current_event.teams as team}
							<TeamSection {team} show_live_status={is_logged_in} />
						{/each}
					{:else}
						<p class="text-gray-500">No teams added to this event.</p>
					{/if}
				</div>
			</div>
		</article>
	{:else}
		<article>
			<div class="space-y-2">
				<h1 class="text-lg font-medium text-gray-400">Followed Channels</h1>

				<div class="grid grid-cols-1 gap-2 tablet:grid-cols-3">
					{#if $followers_live.length > 0}
						{#each $followers_live as follower}
							<FollowerSection
								channel={{
									handle: follower.handle,
									display_name: follower.display_name,
									is_live: true
								}}
								show_live_status={is_logged_in}
							/>
						{/each}
					{:else}
						<p class="text-gray-500">No followed channels are live.</p>
					{/if}
				</div>
				<br />
				<script
					async
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2106178219912204"
					crossorigin="anonymous"
				></script>
				<!-- Horizontal Display -->
				<ins
					class="adsbygoogle"
					style="display:block"
					data-ad-client="ca-pub-2106178219912204"
					data-ad-slot="2871264741"
					data-ad-format="auto"
					data-full-width-responsive="true"
				></ins>
				<script>
					(adsbygoogle = window.adsbygoogle || []).push({});
				</script>
			</div>
		</article>
	{/if}
</section>
