<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import {
		current_stream,
		toggle_hidden,
		toggle_pause,
		toggle_mute,
		set_stream
	} from '$lib/stores/streams';
	import type { Channel } from '$lib/types';
	import { VodsClips } from '.';

	let { channel }: { channel: Channel } = $props();
</script>

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
		></i>
	</div>
	<div
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
		class:text-zinc-400={!channel.hidden}
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
	>
		<i class="fa-solid fa-eye-slash cursor-pointer text-sm"></i>
	</div>
	<div
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
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
		class:text-zinc-400={channel.paused}
		class:text-danger={!channel.paused}
	>
		<i class="fa-solid fa-play cursor-pointer text-sm"></i>
	</div>
	<div
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
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
		class:text-zinc-400={channel.muted}
		class:text-danger={!channel.muted}
	>
		<i class="fa-solid fa-volume cursor-pointer text-sm"></i>
	</div>
	<VodsClips handle={channel.handle} />
</div>
