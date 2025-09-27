<script lang="ts">
	import { handle_keydown } from '../../helpers';
	import { cls } from '@layerstack/tailwind';
	import { settings } from '../../stores/settings';
	import {
		current_stream,
		set_stream,
		toggle_hidden,
		toggle_mute,
		channels
	} from '../../stores/streams';
	import VodsClips from '../VodsClips.svelte';
	import type { Channel } from '../../types';

	let {
		item,
		variant = 'tabs' as 'tabs' | 'manager'
	}: {
		item: Channel;
		variant?: 'tabs' | 'manager';
	} = $props();
</script>

{#if variant === 'tabs'}
	<div
		class={cls(
			'flex select-none items-center gap-2 overflow-hidden rounded-lg border-2 bg-zinc-800',
			$current_stream?.id === item.id ? 'border-red-400/50' : 'border-zinc-700'
		)}
	>
		<div
			class="flex border-r border-zinc-700 text-sm"
			role="button"
			tabindex="0"
			class:text-gray-300={$current_stream?.id === item.id}
			class:text-gray-500={$current_stream?.id !== item.id}
			onclick={() => set_stream(item)}
			onkeydown={(e) => handle_keydown(e, () => set_stream(item))}
			onauxclick={(e) => {
				if (e.button !== 1) return;
				if (!$settings.middle_click_hide) return;
				if ($current_stream && item.id === $current_stream.id) current_stream.set(null);
				toggle_hidden(item);
			}}
		>
			<div class="drag-handle cursor-move border-r border-zinc-700 px-2 py-1">
				<i class="fa-sharp fa-solid fa-grip-dots-vertical fa-sm mt-1 text-gray-500"></i>
			</div>
			<p class="flex items-center px-2">{item.handle}</p>
		</div>

		<!-- other controls remain fully clickable -->
		<i
			role="button"
			tabindex="0"
			onkeydown={(e) => handle_keydown(e, () => toggle_mute(item))}
			onclick={() => toggle_mute(item)}
			class:text-zinc-600={item.muted}
			class:text-danger={!item.muted}
			class="fa-solid fa-volume cursor-pointer text-sm"
		></i>
		<i
			role="button"
			tabindex="0"
			onkeydown={(e) => handle_keydown(e, () => toggle_hidden(item))}
			onclick={() => toggle_hidden(item)}
			class:text-zinc-600={item.hidden}
			class:text-danger={!item.hidden}
			class="fa-solid fa-eye cursor-pointer pr-2 text-sm"
		></i>
	</div>
{:else}
	<div class="flex w-full items-center justify-between rounded-md bg-zinc-800">
		<div class="drag-handle flex flex-grow cursor-move items-center gap-3 pl-4">
			<!-- make ONLY this the drag handle -->
			<i class="fa-sharp fa-solid fa-grip-lines mt-1 text-gray-500"></i>
			<p
				class:text-gray-300={$current_stream?.id === item.id}
				class:text-gray-500={$current_stream?.id !== item.id}
			>
				{item.handle}
			</p>
		</div>
		<div class="flex items-center">
			<div
				class="group cursor-pointer p-2 hover:bg-zinc-700"
				role="button"
				tabindex="0"
				onkeydown={(e) => handle_keydown(e, () => toggle_hidden(item))}
				onclick={() => toggle_hidden(item)}
			>
				<i
					class="fa-solid fa-eye fa-sm cursor-pointer"
					class:text-gray-500={item.hidden}
					class:text-danger={!item.hidden}
				></i>
			</div>
			<VodsClips handle={item.handle} list_hover />
			<div
				class="group cursor-pointer rounded-r-md px-4 py-2 hover:bg-zinc-700"
				role="button"
				tabindex="0"
				onkeydown={(e) =>
					handle_keydown(e, () => {
						$channels = $channels.filter((ch) => ch.id !== item.id);
					})}
				onclick={() => {
					$channels = $channels.filter((ch) => ch.id !== item.id);
				}}
			>
				<i
					class="fa-solid fa-xmark cursor-pointer font-semibold text-gray-400 duration-200 group-hover:text-danger"
				></i>
			</div>
		</div>
	</div>
{/if}
