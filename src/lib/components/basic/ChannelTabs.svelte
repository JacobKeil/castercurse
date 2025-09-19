<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { settings } from '$lib/stores/settings';
	import {
		channels,
		current_stream,
		set_stream,
		toggle_hidden,
		toggle_mute,
		toggle_pause
	} from '$lib/stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';
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
			<div
				role="button"
				tabindex="0"
				class="cursor-grab border-r border-zinc-700 py-1 pr-3 text-sm"
				class:text-gray-300={$current_stream?.id === channel.id}
				class:text-gray-500={$current_stream?.id !== channel.id}
				onclick={() => set_stream(channel)}
				onkeydown={(e) => {
					handle_keydown(e, () => {
						set_stream(channel);
					});
				}}
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
			</div>
			<i
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						toggle_pause(channel);
					});
				}}
				onclick={() => {
					toggle_pause(channel);
				}}
				class:text-zinc-600={channel.paused}
				class:text-danger={!channel.paused}
				class="fa-solid fa-play cursor-pointer text-sm"
			></i>
			<i
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					handle_keydown(e, () => {
						toggle_mute(channel);
					});
				}}
				onclick={() => {
					toggle_mute(channel);
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
						toggle_hidden(channel);
					});
				}}
				onclick={() => {
					toggle_hidden(channel);
				}}
				class:text-zinc-600={channel.hidden}
				class:text-danger={!channel.hidden}
				class="fa-solid fa-eye cursor-pointer text-sm"
			></i>
		</div>
	{/each}
</div>
