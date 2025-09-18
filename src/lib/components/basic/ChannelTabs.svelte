<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { settings } from '$lib/stores/settings';
	import {
		channels,
		channels_order,
		current_stream,
		toggle_hidden,
		toggle_mute,
		un_mute
	} from '$lib/stores/streams';
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

<!-- <script lang="ts">
	import { createSwapy, type Swapy } from 'swapy';
	import { onMount, onDestroy } from 'svelte';
	import {
		channels,
		channels_order,
		current_stream,
		toggle_hidden,
		toggle_mute,
		un_mute
	} from '$lib/stores/streams';
	import type { Channel } from '$lib/types';
	import { cls } from '@layerstack/tailwind';
	import { settings } from '$lib/stores/settings';
	import { handle_keydown } from '$lib/helpers';

	let container: HTMLDivElement;
	let swapy: Swapy | null = null;

	// Tabs data (real Channel objects) in visual order
	let tabItems: Channel[] = $derived(
		$channels_order.map((id) => $channels.find((c) => c.id === id)).filter(Boolean) as Channel[]
	);

	// Keep channels_order aligned with channels (append new ids, drop removed)
	$effect(() => {
		const nowIds = $channels.map((c) => c.id);
		const have = new Set(nowIds);

		// prune removed
		let next = $channels_order.filter((id) => have.has(id));
		// append new
		for (const id of nowIds) if (!next.includes(id)) next.push(id);

		if (next.length !== $channels_order.length || next.some((id, i) => id !== $channels_order[i])) {
			channels_order.set(next);
		}
	});

	// Persist order only (optional)
	$effect(() => {
		localStorage.setItem('/view_order', JSON.stringify($channels_order));
	});

	// Restore order (merge with whatever channels exist now)
	onMount(() => {
		const saved = localStorage.getItem('/view_order');
		if (saved) {
			const ids = JSON.parse(saved) as string[];
			const exist = new Set($channels.map((c) => c.id));
			const filtered = ids.filter((id) => exist.has(id));
			const missing = $channels.map((c) => c.id).filter((id) => !filtered.includes(id));
			channels_order.set([...filtered, ...missing]);
		}

		swapy = createSwapy(container, { dragAxis: 'x' });

		// IMPORTANT: do not mutate reactive state during drag; only on end.
		swapy.onSwapEnd((evt) => {
			// supports both shapes: {slotId,itemId} or {slot,item}
			const arr = (evt as any)?.newSlotItemMap?.asArray ?? (evt as any)?.slotItemMap?.asArray ?? [];
			if (!evt.hasChanged || arr.length === 0) return;

			const getSlot = (x: any) => Number(x.slotId ?? x.slot);
			const getItem = (x: any) => String(x.itemId ?? x.item);
			const ids = arr
				.slice()
				.sort((a: any, b: any) => getSlot(a) - getSlot(b))
				.map(getItem);

			// Only reorder the order store (never $channels)
			channels_order.set(ids);
		});
	});

	onDestroy(() => {
		swapy?.destroy();
		swapy = null;
	});

	// If the number of tabs changes, refresh Swapy’s bookkeeping
	$effect(() => {
		void tabItems.length;
		swapy?.update();
	});

	function set_stream(ch: Channel) {
		if ($current_stream && $current_stream.id === ch.id) {
			$current_stream = null;
		} else {
			$current_stream = ch;
			un_mute(ch);
		}
	}
</script>

<div class="container w-full" bind:this={container}>
	<div class="items flex gap-2">
		{#each tabItems as ch, i (ch.id)}
			<div class="slot" data-swapy-slot={String(i)}>
				<div
					data-swapy-item={ch.id}
					class={cls(
						'flex select-none items-center gap-2 overflow-hidden rounded-lg border-2 bg-zinc-800 px-2',
						$current_stream?.id === ch.id ? 'border-zinc-400' : 'border-zinc-700',
						ch.hidden && 'opacity-50'
					)}
				>
					<p class="text-sm text-gray-500">{i + 1}</p>
					<div
						data-swapy-handle
						role="button"
						tabindex="0"
						class="cursor-grab border-r border-zinc-700 py-1 pr-3 text-sm"
						class:text-gray-300={$current_stream?.id === ch.id}
						class:text-gray-500={$current_stream?.id !== ch.id}
						onclick={() => set_stream(ch)}
						onkeydown={(e) => handle_keydown(e, () => set_stream(ch))}
						onauxclick={(e) => {
							if (e.button !== 1 || !$settings.middle_click_hide) return;
							if (!ch.hidden && ch.mute && ch.pause) {
								ch.muted = true;
								ch.mute();
								ch.pause();
								if ($current_stream?.id === ch.id) $current_stream = null;
							} else if (ch.hidden && ch.play) {
								ch.play();
							}
							ch.hidden = !ch.hidden;
						}}
					>
						{ch.handle}
					</div>

					<i
						role="button"
						tabindex="0"
						onkeydown={(e) => handle_keydown(e, () => toggle_mute(ch))}
						onclick={() => toggle_mute(ch)}
						class:text-zinc-600={ch.muted}
						class:text-danger={!ch.muted}
						class="fa-solid fa-volume cursor-pointer text-sm"
					></i>
					<i
						role="button"
						tabindex="0"
						onkeydown={(e) => handle_keydown(e, () => toggle_hidden(ch))}
						onclick={() => toggle_hidden(ch)}
						class:text-zinc-600={ch.hidden}
						class:text-danger={!ch.hidden}
						class="fa-solid fa-eye cursor-pointer text-sm"
					></i>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	[data-swapy-item] {
		user-select: none;
	}
	[data-swapy-handle] {
		touch-action: none;
	}
</style> -->
