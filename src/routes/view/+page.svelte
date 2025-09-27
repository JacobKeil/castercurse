<script lang="ts">
	import { TwitchEmbed, ControlOverlay } from '$lib/components';
	import {
		channels,
		current_stream,
		render_source,
		stream_manager_open,
		channels_order
	} from '$lib/stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { settings } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { data } = $props();
	let change_url = () => {};
	let ch_len = $derived($channels.filter((ch) => !ch.hidden).length);

	$effect(() => {
		if ($channels) change_url();
	});

	onMount(() => {
		const view_channels = localStorage.getItem('/view');

		if (page.url.pathname === '/view' && view_channels) {
			const view_ch_list: string[] = JSON.parse(view_channels);

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

	$effect(() => {
		if ($channels_order.length === 0 && $channels.length > 0) {
			channels_order.set($channels.map((c) => c.id));
		} else {
			const cur = $channels.map((c) => c.id);
			const setCur = new Set(cur);
			const next: string[] = [];
			for (const id of $channels_order) if (setCur.has(id)) next.push(id);
			for (const id of cur) if (!next.includes(id)) next.push(id);
			if (next.length !== $channels_order.length || next.some((v, i) => v !== $channels_order[i])) {
				channels_order.set(next);
			}
		}
	});

	function visualIndexFor(id: string): number {
		const idx = $channels_order.indexOf(id);
		return idx === -1 ? $channels_order.length : idx;
	}

	let containerEl: HTMLElement | null = null;
	type Rect = { left: number; top: number; width: number; height: number };
	let prevRects = new Map<string, Rect>();
	let flipScheduled = false;

	function measureNow(): Map<string, Rect> {
		const map = new Map<string, Rect>();
		if (!containerEl) return map;
		const els = containerEl.querySelectorAll<HTMLElement>('[data-flip-id]');
		els.forEach((wrapper) => {
			const id = wrapper.getAttribute('data-flip-id') || '';
			if (!id) return;
			const r = wrapper.getBoundingClientRect();
			map.set(id, { left: r.left, top: r.top, width: r.width, height: r.height });
		});
		return map;
	}

	function animateFromPrevTo(nextRects: Map<string, Rect>) {
		if (!containerEl) return;
		const wrappers = containerEl.querySelectorAll<HTMLElement>('[data-flip-id]');
		wrappers.forEach((wrapper) => {
			const id = wrapper.getAttribute('data-flip-id') || '';
			if (!id) return;

			const a = prevRects.get(id);
			const b = nextRects.get(id);
			if (!a || !b) return;

			const dx = a.left - b.left;
			const dy = a.top - b.top;
			if (!(dx || dy)) return;

			const shell = wrapper.querySelector<HTMLElement>(`[data-flip-shell="${id}"]`);
			if (!shell) return;

			shell.style.willChange = 'transform';
			shell.style.transform = `translate(${dx}px, ${dy}px)`;
			shell.style.transition = 'transform 0s';
			// @ts-ignore
			shell.offsetWidth;
			shell.style.transition = 'transform 300ms ease';
			shell.style.transform = 'translate(0,0)';

			const done = () => {
				shell.style.transition = '';
				shell.style.transform = '';
				shell.style.willChange = '';
				shell.removeEventListener('transitionend', done);
			};
			shell.addEventListener('transitionend', done);
		});

		prevRects = nextRects;
	}

	function scheduleFlipOnce() {
		if (flipScheduled) return;
		flipScheduled = true;
		requestAnimationFrame(() => {
			flipScheduled = false;
			const now = measureNow();
			animateFromPrevTo(now);
		});
	}

	function visual_order_for(id: string): number {
		const idx = $channels_order.indexOf(id);
		return idx === -1 ? $channels_order.length : idx;
	}

	// visible index among *actually visible* items (matches your hide/current logic)
	function visible_index_for(id: string): number {
		// Start from channels_order to preserve user order
		const ordered_ids = [...$channels_order];

		// Build the visible list honoring: not hidden AND (no current_stream OR is current)
		const visible_ids: string[] = [];

		for (const cid of ordered_ids) {
			const ch = $channels.find((c) => c.id === cid);
			if (!ch) continue;
			const is_current_only = Boolean($current_stream && $current_stream.id !== ch.id);
			const is_visible = !ch.hidden && !is_current_only;
			if (is_visible) visible_ids.push(ch.id);
		}

		// Append any channels not in channels_order yet (new/unsaved), if they’re visible
		for (const ch of $channels) {
			if (!visible_ids.includes(ch.id)) {
				const is_current_only = Boolean($current_stream && $current_stream.id !== ch.id);
				const is_visible = !ch.hidden && !is_current_only;
				if (is_visible) visible_ids.push(ch.id);
			}
		}

		return visible_ids.indexOf(id);
	}

	onMount(() => {
		requestAnimationFrame(() => {
			prevRects = measureNow();
		});
	});

	$effect(() => {
		// run FLIP when visual order or layout-affecting state changes
		void $channels_order;
		void $current_stream;
		void ch_len;
		scheduleFlipOnce();
	});

	$effect(() => {
		if ($channels.length === 0) {
			stream_manager_open.set(true);
		}
	});
</script>

<svelte:head>
	<title>Custom View</title>
	<meta name="description" content="Custom View" />
</svelte:head>

<section class="flex h-full w-full items-center justify-center">
	<div
		class={cls(
			// 👇 dense packing fills holes when spans differ
			'grid h-full w-full grid-flow-row-dense grid-cols-12',
			$channels.length > 0 ? '' : 'place-content-center'
		)}
		bind:this={containerEl}
	>
		{#if $channels.length > 0}
			{#each $channels.filter((ch) => !ch.hidden) as channel (channel.id)}
				{@const vi = visual_order_for(channel.id)}
				{@const v_idx = visible_index_for(channel.id)}

				<div
					data-flip-id={channel.id}
					class={cls(
						'relative h-full',
						channel.hidden && 'hidden',
						$current_stream && $current_stream.id !== channel.id ? 'hidden' : 'block',
						$current_stream?.id === channel.id && 'col-span-full'
					)}
					style={`order:${vi};`}
					class:col-span-12={(ch_len === 3 && v_idx === 0) ||
						ch_len === 2 ||
						(ch_len === 1 && !$current_stream)}
					class:col-span-6={(ch_len === 3 && v_idx >= 1) ||
						(ch_len === 5 && (v_idx === 0 || v_idx === 1)) ||
						(ch_len === 4 && !$current_stream)}
					class:col-span-4={(ch_len === 5 && v_idx > 1) ||
						ch_len === 6 ||
						(ch_len === 7 && v_idx < 3) ||
						(ch_len === 9 && !$current_stream)}
					class:col-span-3={(ch_len === 7 && v_idx > 2) || (ch_len === 8 && !$current_stream)}
				>
					<div data-flip-shell={channel.id} class="block h-full w-full">
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
				</div>
			{/each}
		{/if}
	</div>
</section>

<style>
	[data-flip-id] {
		height: 100%;
	}
	[data-flip-shell] {
		width: 100%;
		height: 100%;
	}
</style>
