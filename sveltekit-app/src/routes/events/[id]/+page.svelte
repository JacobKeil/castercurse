<script lang="ts">
	import { VodsClips, TwitchEmbed } from '$lib/components';
	import {
		channels,
		current_stream,
		hide_stream,
		mute_stream,
		render_source,
		stream_manager_open,
		toggle_mute,
		unhide_all
	} from '$lib/stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';
	import { settings } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Channel, ChannelWithLive, EventWithChannelsLive, EventWithRelations, TeamWithChannelsLive } from '$lib/types';
	import { uniqueId } from '@layerstack/utils';
	import { handle_keydown } from '$lib/helpers';
	import { receive, send } from '$lib/actions/transition';
	import { current_event } from '$lib/stores/event';
	let { data } = $props();

	let change_url = () => {};

	let ch_len = $derived($channels.filter((ch) => !ch.hidden).length);

	$effect(() => {
		if ($channels) {
			change_url();
		}
	});

	onMount(() => {
		if (data.event) {
      const original_event: EventWithRelations = data.event;

      const transformed_teams: TeamWithChannelsLive[] = original_event.teams.map(
        (team_original) => {
          const transformed_channels: ChannelWithLive[] = team_original.channels.map(
            (channel_original) => {
              const is_live = true;
              return {
                ...channel_original,
                is_live,
              };
            }
          );

          const transformed_team: TeamWithChannelsLive = {
            id: team_original.id,
            name: team_original.name,
            callsign: team_original.callsign,
            logo_url: team_original.logo_url,
            region_id: team_original.region_id,
            created_by_id: team_original.created_by_id,
            created_at: team_original.created_at,
            updated_at: team_original.updated_at,
            channels: transformed_channels,
            created_by: team_original.created_by,
            region: team_original.region,
          };
          return transformed_team;
        }
      );

      const transformed_event: EventWithChannelsLive = {
        id: original_event.id,
        name: original_event.name,
        max_teams: original_event.max_teams,
        logo_url: original_event.logo_url,
        start_date: original_event.start_date,
        end_date: original_event.end_date,
        main_broadcast_id: original_event.main_broadcast_id,
        status_id: original_event.status_id,
        created_by_id: original_event.created_by_id,
        created_at: original_event.created_at,
        updated_at: original_event.updated_at,
        teams: transformed_teams,
        main_broadcast: original_event.main_broadcast,
        watch_parties: original_event.watch_parties,
        created_by: original_event.created_by,
        links: original_event.links,
        status: original_event.status,
      };

      // Set the store with the *transformed* event data
      current_event.set(transformed_event);			
    }

		let view_channels = localStorage.getItem('/events/' + page.params.id);

		if (page.url.pathname === '/events/' + page.params.id && view_channels) {
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

		if ($channels.length === 0) {
			stream_manager_open.set(true);
		}

		change_url = () => {
			localStorage.setItem(
				'/events/' + page.params.id,
				JSON.stringify($channels.map((ch) => ch.handle))
			);
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
	<title>{data.event?.name}</title>
	<meta name="description" content={data.event?.name} />
</svelte:head>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<section class="flex h-full w-full items-center justify-center">
	<div
		class={cls(
			'grid h-full w-full',
			$channels.some(ch => !ch.hidden)
				? 'grid-cols-12'
				: 'place-content-center'
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
			{#if $channels.every(ch => ch.hidden)}
				<div
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						handle_keydown(e, () => {
							unhide_all()
						});
					}}
					onclick={() => {
						unhide_all()
					}}
					class="cursor-pointer items-center justify-center rounded-lg bg-zinc-800 px-3 py-1 duration-300 hover:bg-zinc-700"
				>
					<i class="fa-solid fa-eye mt-[5px] text-gray-400"></i>
				</div>
			{/if}
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
