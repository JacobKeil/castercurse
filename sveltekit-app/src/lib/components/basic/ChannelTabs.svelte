<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { channels, current_stream, toggle_mute } from '$lib/stores/streams';
	import type { Channel } from '$lib/types';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';

	function set_stream(channel: Channel) {
		if ($current_stream && $current_stream.id === channel.id) {
			$current_stream = null;
		} else {
			$current_stream = channel;
			toggle_mute(channel);
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
					channel.muted = !channel.muted;
					if (channel.muted && channel.mute) {
						channel.mute();
					} else if (!channel.muted && channel.un_mute) {
						if (channel.hidden && channel.play) {
							channel.hidden = false;
							channel.play();
						}
						channel.un_mute();
						$channels.forEach((ch) => {
							if (ch.id !== channel.id && ch.mute) {
								ch.mute();
							}
						});
					}
				}}
				class="fa-solid fa-volume cursor-pointer text-sm"
			></i>
			<i
				class:text-zinc-600={channel.hidden}
				class:text-danger={!channel.hidden}
				onclick={() => {
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
				class="fa-solid fa-eye cursor-pointer text-sm"
			></i>
		</div>
	{/each}
</div>
