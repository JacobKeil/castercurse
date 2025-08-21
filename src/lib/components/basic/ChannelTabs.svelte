<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { settings } from '$lib/stores/settings';
	import { channels, current_stream, toggle_hidden, toggle_mute, un_mute } from '$lib/stores/streams';
	import type { Channel } from '$lib/types';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';

	  function set_stream(channel: Channel) {
    if ($current_stream && $current_stream.id === channel.id) {
      $current_stream = null;
    } else {
      $current_stream = channel;
      un_mute(channel);
    }
  }
</script>

<div class="flex items-center gap-[5px]">
	{#each $channels as channel, i (channel.id)}
		<div
			animate:flip={{ duration: 100 }}
			class={cls(
				'flex select-none items-center gap-2 overflow-hidden rounded-lg border-2 bg-zinc-800 px-2',
				$current_stream?.id === channel.id ? 'border-zinc-400' : 'border-zinc-700'
			)}
		>
			<p class="text-sm text-gray-500">{i + 1}</p>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<h1
				class="cursor-grab border-r border-zinc-700 py-1 pr-3 text-sm"
				class:text-gray-300={$current_stream?.id === channel.id}
				class:text-gray-500={$current_stream?.id !== channel.id}
				onclick={() => set_stream(channel)}
				onauxclick={(e) => {
					if (e.button !== 1) return;
					if (!$settings.middle_click_hide) return;
					if (!channel.hidden && channel.mute && channel.pause) {
						channel.muted = true;
						channel.mute();
						channel.pause();

						if ($current_stream && channel.id === $current_stream.id) {
							$current_stream = null;
						}
					} else if (channel.hidden && channel.play) {
						channel.play();
					}
					channel.hidden = !channel.hidden;
				}}
			>
				{channel.handle}
			</h1>
			<i
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						toggle_mute(channel)
					});
				}}
				onclick={() => {
					toggle_mute(channel)
				}}
				class:text-zinc-600={channel.muted}
				class:text-danger={!channel.muted}
				class="fa-solid fa-volume cursor-pointer text-sm"
			></i>
			<i
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						toggle_hidden(channel)
					});
				}}
				onclick={() => {
					toggle_hidden(channel)
				}}
				class:text-zinc-600={channel.hidden}
				class:text-danger={!channel.hidden}
				class="fa-solid fa-eye cursor-pointer text-sm"
			></i>
		</div>
	{/each}
</div>

<!-- <script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { channels, current_stream, toggle_hidden, toggle_mute, un_mute } from '$lib/stores/streams';
  import type { Channel } from '$lib/types';
  import { cls } from '@layerstack/tailwind';
  import { dndzone } from 'svelte-dnd-action';

	let dnd_items: Channel[] = $derived($channels);

  const flip_duration_ms = 300;

  function handle_dnd_consider(e: CustomEvent<{ items: Channel[]; info: any }>) {
    dnd_items = e.detail.items;
  }

  function handle_dnd_finalize(e: CustomEvent<{ items: Channel[]; info: any }>) {
    const new_items_order = e.detail.items;
    
    channels.set(new_items_order);
  }

  function set_stream(channel: Channel) {
    if ($current_stream && $current_stream.id === channel.id) {
      $current_stream = null;
    } else {
      $current_stream = channel;
      un_mute(channel);
    }
  }
</script>

<div 
  class="flex items-center gap-[5px]"
  use:dndzone={{ items: dnd_items, flipDurationMs: flip_duration_ms }}
  onconsider={handle_dnd_consider}
  onfinalize={handle_dnd_finalize}
>
  {#each dnd_items as channel, i (channel.id)}
    <div
      class={cls(
        'flex select-none items-center gap-2 overflow-hidden rounded-lg border-2 bg-zinc-800 px-2',
        $current_stream?.id === channel.id ? 'border-zinc-400' : 'border-zinc-700'
      )}
    >
      <p class="text-sm text-gray-500">{i + 1}</p>
      <h1
        class="cursor-grab border-r border-zinc-700 py-1 pr-3 text-sm"
        class:text-gray-300={$current_stream?.id === channel.id}
        class:text-gray-500={$current_stream?.id !== channel.id}
        onclick={() => set_stream(channel)}
        onauxclick={(e) => {
          if (e.button !== 1) return;
          if (!$settings.middle_click_hide) return;
          if (!channel.hidden && channel.mute && channel.pause) {
            channel.muted = true;
            channel.mute();
            channel.pause();

            if ($current_stream && channel.id === $current_stream.id) {
              $current_stream = null;
            }
          } else if (channel.hidden && channel.play) {
            channel.play();
          }
          channel.hidden = !channel.hidden;
        }}
      >
        {channel.handle}
      </h1>
      <i
        class:text-zinc-600={channel.muted}
        class:text-danger={!channel.muted}
        onclick={() => {
          toggle_mute(channel)
        }}
        class="fa-solid fa-volume cursor-pointer text-sm"
      ></i>
      <i
        class:text-zinc-600={channel.hidden}
        class:text-danger={!channel.hidden}
        onclick={() => {
          toggle_hidden(channel)
        }}
        class="fa-solid fa-eye cursor-pointer text-sm"
      ></i>
    </div>
  {/each}
</div>

<style>
  :global(.dnd-placeholder) {
    @apply !bg-zinc-700;
  }

  :global(.dnd-drag-element) {
    @apply shadow-lg scale-105;
    transform-origin: center;
  }
</style> -->