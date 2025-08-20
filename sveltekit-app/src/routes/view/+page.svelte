<script lang="ts">
	import { VodsClips, TwitchEmbed } from '$lib/components';
	import {
		channels,
		current_stream,
		hide_stream,
		mute_stream,
		render_source,
		stream_manager_open,
		toggle_mute
	} from '$lib/stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';
	import { settings } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Channel } from '$lib/types';
	import { uniqueId } from '@layerstack/utils';
	import { handle_keydown } from '$lib/helpers';
	import { receive, send } from '$lib/actions/transition';
	let { data } = $props();

	let change_url = () => {};

	let ch_len = $derived($channels.filter((ch) => !ch.hidden).length);

	$effect(() => {
		if ($channels) {
			change_url();
		}
	});

	onMount(() => {
		let view_channels = localStorage.getItem('/view');

		if (page.url.pathname === '/view' && view_channels) {
			let view_ch_list: string[] = JSON.parse(view_channels);

			if (view_ch_list.length > 0) {
				$channels = [];
				view_ch_list.forEach((ch) => {
					$channels = [
						...$channels,
						{
							id: uniqueId(),
							handle: ch,
							hidden: false,
							muted: true
						}
					];
				});
			}
		}

		change_url = () => {
			// let new_url = window.location.pathname;
			// if ($channels.length > 0) {
			// 	new_url = `${window.location.pathname}?${'channels=' + $channels.map((ch) => ch.handle).join(',')}`;
			// }
			localStorage.setItem('/view', JSON.stringify($channels.map((ch) => ch.handle)));
			// goto(new_url, { replaceState: true, state: page.state });
		};
	});

	function set_stream(channel: Channel) {
		if ($current_stream && $current_stream.id === channel.id) {
			$current_stream = null;
		} else {
			$current_stream = channel;
			toggle_mute(channel);
		}
	}
</script>

<svelte:head>
	<title>Multi-view</title>
	<meta name="description" content="Multi-view" />
</svelte:head>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<section class="flex h-full w-full items-center justify-center">
	<div
		class={cls(
			'grid h-full w-full',
			$channels.length > 0 ? 'grid-cols-12' : 'place-content-center'
		)}
	>
		{#if $channels.length > 0}
			{#each $channels.filter((ch) => !ch.hidden) as channel, i (channel.id)}
				<div
					animate:flip={{ duration: 150 }}
					in:receive={{ key: i }}
					out:send={{ key: i }}
					class={cls(
						channel.hidden && 'hidden',
						$current_stream && $current_stream.id !== channel.id ? 'hidden' : 'block',
						'relative',
						$current_stream?.id === channel.id && 'col-span-full'
					)}
					class:col-span-12={(ch_len === 3 && i === 0) ||
						ch_len === 2 ||
						(ch_len === 1 && !$current_stream)}
					class:col-span-6={(ch_len === 3 && i >= 1) ||
						(ch_len === 5 && (i === 0 || i === 1)) ||
						(ch_len === 4 && !$current_stream)}
					class:col-span-4={(ch_len === 5 && i > 1) ||
						ch_len === 6 ||
						(ch_len === 7 && i < 3) ||
						(ch_len === 9 && !$current_stream)}
					class:col-span-3={(ch_len === 7 && i > 2) || (ch_len === 8 && !$current_stream)}
				>
					{#if $settings.controls}
						<div
							class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-1 rounded-full bg-zinc-800 p-[2px]"
						>
							<div
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									handle_keydown(e, () => {
										set_stream(channel);
									});
								}}
								onclick={() => {
									set_stream(channel);
								}}
								class:text-zinc-400={!channel.hidden}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
							>
								<i
									class:text-yellow-300={$current_stream?.id === channel.id}
									class="fa-solid fa-star cursor-pointer text-sm"
								/>
							</div>
							<div
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									handle_keydown(e, () => {
										hide_stream(channel);
									});
								}}
								onclick={() => {
									hide_stream(channel);
								}}
								class:text-zinc-400={!channel.hidden}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
							>
								<i class="fa-solid fa-eye-slash cursor-pointer text-sm" />
							</div>
							<div
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									handle_keydown(e, () => {
										mute_stream(channel);
									});
								}}
								onclick={() => {
									mute_stream(channel);
								}}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
								class:text-zinc-400={channel.muted}
								class:text-danger={!channel.muted}
							>
								<i class="fa-solid fa-volume cursor-pointer text-sm" />
							</div>
							<VodsClips handle={channel.handle} supabase={data.supabase} />
						</div>
					{/if}
					<TwitchEmbed render_source={$render_source} {channel} initialMuted={channel.muted} />
				</div>
			{/each}
		{:else}
			<div
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						stream_manager_open.set(true);
					});
				}}
				onclick={() => {
					stream_manager_open.set(true);
				}}
				class="cursor-pointer items-center justify-center rounded-lg bg-zinc-800 px-3 py-1 duration-300 hover:bg-zinc-700"
			>
				<i class="fa-solid fa-plus mt-[5px] text-gray-400"></i>
			</div>
		{/if}
	</div>
</section>
