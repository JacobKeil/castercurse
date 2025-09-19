<script lang="ts">
	import { TwitchEmbed, ControlOverlay } from '$lib/components';
	import {
		channels,
		current_stream,
		render_source,
		stream_manager_open
	} from '$lib/stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';
	import { settings } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { handle_keydown } from '$lib/helpers';
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
							id: ch,
							handle: ch,
							hidden: false,
							muted: true,
							paused: false,
							volume: 0.3
						}
					];
				});
			}
		}

		change_url = () => {
			localStorage.setItem('/view', JSON.stringify($channels.map((ch) => ch.handle)));
		};
	});
</script>

<svelte:head>
	<title>Custom View</title>
	<meta name="description" content="Custom View" />
</svelte:head>

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
						<ControlOverlay {channel} />
					{/if}
					<TwitchEmbed
						render_source={$render_source}
						{channel}
						initial_muted={channel.muted}
						initial_volume={channel.volume}
						initial_paused={channel.paused}
					/>
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
