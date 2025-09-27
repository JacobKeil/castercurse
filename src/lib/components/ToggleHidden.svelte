<script lang="ts">
	import { handle_keydown } from '../helpers';
	import { channels, unhide_all } from '../stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { fly } from 'svelte/transition';
</script>

{#if $channels.length > 0 && $channels.filter((c) => c.hidden || c.paused).length > 0}
	<div
		in:fly={{ duration: 100, x: 100 }}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			handle_keydown(e, () => {
				unhide_all();
			});
		}}
		onclick={() => {
			unhide_all();
		}}
		class={cls(
			'flex h-full w-fit cursor-pointer select-none items-center gap-2 overflow-hidden rounded-lg bg-zinc-800 px-3 py-1 text-gray-500 duration-200 hover:bg-zinc-700'
		)}
	>
		UNHIDE ALL
	</div>
{/if}
