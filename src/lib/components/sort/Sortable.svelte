<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Action } from 'svelte/action';

	import DraggableChannel from './DraggableChannel.svelte';

	// stores
	import { channels, channels_order } from '$lib/stores/streams';
	import type { Channel } from '$lib/types';

	// ── Props (kept) ────────────────────────────────────────────────────────────
	let {
		axis = 'x' as 'x' | 'y',
		variant = 'tabs' as 'tabs' | 'manager',
		storage_key = 'channels_order',
		on_reorder = (_arr: Channel[]) => {}
	} = $props<{
		axis?: 'x' | 'y';
		variant?: 'tabs' | 'manager';
		storage_key?: string;
		on_reorder?: (arr: Channel[]) => void;
	}>();

	// ── Tunables ────────────────────────────────────────────────────────────────
	const HANDLE_SELECTOR = '.drag-handle';
	const SWAP_THRESHOLD = 0.5; // ~half overlap to step-swap

	// ── DOM & order state ────────────────────────────────────────────────────────
	let container_el: HTMLElement | null = null;

	let order = $state<string[]>([]);
	let by_id = $state(new Map<string, Channel>());
	const node_map = new Map<string, HTMLElement>();

	function arrays_equal(a: string[], b: string[]) {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	}

	function reconcile_ids(saved: string[], current: string[]): string[] {
		const set_current = new Set(current);
		const out: string[] = [];
		for (const id of saved) if (set_current.has(id)) out.push(id);
		for (const id of current) if (!out.includes(id)) out.push(id);
		return out;
	}

	// read saved order (browser only)
	onMount(() => {
		try {
			const raw = typeof window !== 'undefined' ? localStorage.getItem(storage_key) : null;
			const saved = raw ? (JSON.parse(raw) as string[]) : [];
			if (Array.isArray(saved) && saved.length) {
				order = reconcile_ids(
					saved,
					$channels.map((c) => c.id)
				);
				return;
			}
		} catch {}
		order = $channels.map((c) => c.id);
	});

	// keep lookup fresh & reconcile order as channels change
	$effect(() => {
		// build lookup map from current store
		by_id = new Map($channels.map((it) => [it.id, it]));
		// ensure order contains exactly/only current ids, preserving existing order first
		const current_ids = $channels.map((c) => c.id);
		const next = reconcile_ids(order, current_ids);
		if (!arrays_equal(next, order)) order = next;
	});

	// react to external order store (but not while dragging)
	$effect(() => {
		if (dragging !== null) return;
		const current_ids = $channels.map((c) => c.id);
		const next = reconcile_ids($channels_order, current_ids);
		if (!arrays_equal(next, order)) order = next;
	});

	// persist order (store + localStorage) – browser guard
	$effect(() => {
		if (!arrays_equal(order, $channels_order)) channels_order.set(order);
		if (typeof window !== 'undefined' && storage_key) {
			try {
				localStorage.setItem(storage_key, JSON.stringify(order));
			} catch {}
		}
	});

	// ── Node registration action ────────────────────────────────────────────────
	const set_ref: Action<HTMLElement, string> = (node, id) => {
		if (id != null) node_map.set(id, node);
		return {
			update(new_id) {
				if (new_id !== id) {
					if (id != null) node_map.delete(id);
					if (new_id != null) node_map.set(new_id, node);
					id = new_id;
				}
			},
			destroy() {
				if (id != null) node_map.delete(id);
			}
		};
	};

	// ── Drag state ───────────────────────────────────────────────────────────────
	let dragging: string | null = $state(null);
	let start_ptr = $state({ x: 0, y: 0 });
	let start_rect: DOMRect | null = $state(null);
	let cont_rect: DOMRect | null = $state(null);

	// primary-axis delta (dx for x, dy for y)
	let d_main = $state(0);
	let prev_d_main = $state(0);

	// overlay geometry (within container)
	let abs_left = $state(0);
	let abs_top = $state(0);
	let drag_w = $state(0);
	let drag_h = $state(0);

	// flow bookkeeping during drag
	let base_without = $state<string[]>([]);
	let spacer_index = $state(-1);

	const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

	// ── FLIP (siblings only) with rAF batching ───────────────────────────────────
	type RectMap = Map<string, DOMRect>;

	function measure_flow_rects(): RectMap {
		const m = new Map<string, DOMRect>();
		const ids = dragging === null ? order : base_without; // flow excludes absolute overlay
		for (const id of ids) {
			const el = node_map.get(id);
			if (el) m.set(id, el.getBoundingClientRect());
		}
		return m;
	}

	function flip(old_rects: RectMap, ids: string[]) {
		for (const id of ids) {
			const el = node_map.get(id);
			if (!el) continue;
			const a = old_rects.get(id);
			const b = el.getBoundingClientRect();
			if (!a || !b) continue;
			const tx = a.left - b.left;
			const ty = a.top - b.top;
			if (tx || ty) {
				el.style.transform = `translate(${tx}px, ${ty}px)`;
				el.style.transition = 'transform 0s';
				// @ts-ignore force reflow
				el.offsetWidth;
				el.style.transition = 'transform 150ms ease';
				el.style.transform = 'translate(0,0)';
				const done = () => {
					el.style.transition = '';
					el.removeEventListener('transitionend', done);
				};
				el.addEventListener('transitionend', done);
			}
		}
	}

	let pending_flip_ids: string[] | null = null;
	let pending_flip_rects: RectMap | null = null;
	let flip_scheduled = false;

	function schedule_flip(rects: RectMap, ids: string[]) {
		pending_flip_rects = rects;
		pending_flip_ids = ids;
		if (flip_scheduled) return;
		flip_scheduled = true;
		if (typeof window !== 'undefined') {
			requestAnimationFrame(() => {
				flip_scheduled = false;
				if (pending_flip_rects && pending_flip_ids) {
					flip(pending_flip_rects, pending_flip_ids);
					pending_flip_rects = null;
					pending_flip_ids = null;
				}
			});
		}
	}

	// ── Overlap-based step-swap ──────────────────────────────────────────────────
	function neighbor_overlap_ratio(drag_min: number, drag_max: number, neighbor_id: string): number {
		const el = node_map.get(neighbor_id);
		if (!el) return 0;
		const r = el.getBoundingClientRect();
		const n_min = axis === 'x' ? r.left : r.top;
		const n_max = axis === 'x' ? r.right : r.bottom;
		const size = Math.max(1, axis === 'x' ? r.width : r.height);
		const ov = Math.min(drag_max, n_max) - Math.max(drag_min, n_min);
		return ov > 0 ? ov / size : 0;
	}

	function try_swap_step(drag_min: number, drag_max: number) {
		const moving_pos = d_main > prev_d_main + 1e-4; // right/down
		const moving_neg = d_main < prev_d_main - 1e-4; // left/up
		const ids = base_without;

		if (moving_pos && spacer_index < ids.length) {
			const neighbor = ids[spacer_index];
			if (neighbor_overlap_ratio(drag_min, drag_max, neighbor) >= SWAP_THRESHOLD) {
				const before = measure_flow_rects();
				spacer_index += 1;
				schedule_flip(before, ids);
			}
		} else if (moving_neg && spacer_index > 0) {
			const neighbor = ids[spacer_index - 1];
			if (neighbor_overlap_ratio(drag_min, drag_max, neighbor) >= SWAP_THRESHOLD) {
				const before = measure_flow_rects();
				spacer_index -= 1;
				schedule_flip(before, ids);
			}
		}

		prev_d_main = d_main;
	}

	// ── Click suppression after drag (only handle clicks, tiny window) ───────────
	let drag_ended_at = 0;

	function should_suppress_click(ev: MouseEvent) {
		if (!drag_ended_at) return false;
		const dt =
			(typeof performance !== 'undefined' ? performance.now() : Date.now()) - drag_ended_at;
		if (dt > 60) return false;
		const target = ev.target as HTMLElement | null;
		if (!target) return false;
		return !!target.closest(HANDLE_SELECTOR);
	}

	function global_click_suppress(ev: MouseEvent) {
		if (should_suppress_click(ev)) {
			ev.stopPropagation();
			ev.preventDefault();
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('click', global_click_suppress, true);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('click', global_click_suppress, true);
		}
	});

	// ── Pointer handlers ─────────────────────────────────────────────────
	function is_in_handle(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		return !!target.closest(HANDLE_SELECTOR);
	}

	function on_down(e: PointerEvent, id: string) {
		if (!is_in_handle(e.target)) return;

		const el = node_map.get(id);
		if (!el || !container_el) return;

		const before = measure_flow_rects();

		dragging = id;
		start_ptr = { x: e.clientX, y: e.clientY };

		start_rect = el.getBoundingClientRect();
		cont_rect = container_el.getBoundingClientRect();

		drag_w = start_rect.width;
		drag_h = start_rect.height;

		abs_left = start_rect.left - cont_rect.left;
		abs_top = start_rect.top - cont_rect.top;
		d_main = 0;
		prev_d_main = 0;

		base_without = order.filter((x) => x !== id);
		spacer_index = order.indexOf(id);

		(el as any).draggable = false;
		el.setPointerCapture(e.pointerId);

		schedule_flip(before, base_without);

		if (typeof window !== 'undefined') {
			window.addEventListener('pointermove', on_move, { passive: false });
			window.addEventListener('pointerup', on_up, { passive: false });
		}
	}

	function on_move(e: PointerEvent) {
		if (!dragging || !start_rect || !cont_rect) return;
		e.preventDefault();

		if (axis === 'x') {
			const raw = e.clientX - start_ptr.x;
			const min = cont_rect.left - start_rect.left;
			const max = cont_rect.right - start_rect.right;
			d_main = clamp(raw, min, max);

			const drag_min = start_rect.left + d_main;
			const drag_max = drag_min + drag_w;
			try_swap_step(drag_min, drag_max);
		} else {
			const raw = e.clientY - start_ptr.y;
			const min = cont_rect.top - start_rect.top;
			const max = cont_rect.bottom - start_rect.bottom;
			d_main = clamp(raw, min, max);

			const drag_min = start_rect.top + d_main;
			const drag_max = drag_min + drag_h;
			try_swap_step(drag_min, drag_max);
		}
	}

	function on_up() {
		if (!dragging) return;

		const before = measure_flow_rects();

		const ids = base_without.slice();
		ids.splice(spacer_index, 0, dragging);

		// commit immediately (prevents snap-back)
		order = ids;
		channels_order.set(ids);
		if (typeof window !== 'undefined' && storage_key) {
			try {
				localStorage.setItem(storage_key, JSON.stringify(ids));
			} catch {}
		}

		// notify parent with full items (optional)
		const full = ids.map((id) => by_id.get(id)!).filter(Boolean);
		on_reorder(full);

		// reset drag state
		dragging = null;
		start_rect = null;
		cont_rect = null;
		base_without = [];
		spacer_index = -1;
		d_main = 0;
		prev_d_main = 0;

		// mark drag end for tiny ghost click window
		drag_ended_at = typeof performance !== 'undefined' ? performance.now() : Date.now();

		schedule_flip(before, ids);

		if (typeof window !== 'undefined') {
			window.removeEventListener('pointermove', on_move);
			window.removeEventListener('pointerup', on_up);
		}
	}

	// absolute overlay style (translate along axis)
	function dragged_style(id: string): string {
		if (id !== dragging) return '';
		const translate = axis === 'x' ? `translate(${d_main}px, 0)` : `translate(0, ${d_main}px)`;
		return `
      position: absolute;
      left: ${abs_left}px;
      top: ${abs_top}px;
      width: ${drag_w}px;
      height: ${drag_h}px;
      transform: ${translate};
      z-index: 10;
      opacity: 0.9;
      cursor: grabbing;
    `;
	}
</script>

<!-- Container: axis sets flow direction -->
<div
	class={`relative flex select-none ${axis === 'y' ? 'flex-col gap-2' : 'flex-row gap-[5px]'} items-stretch`}
	bind:this={container_el}
>
	{#if dragging === null}
		<!-- Normal render -->
		{#each order as id, index (id)}
			{#if by_id.get(id)}
				<div
					class="touch-none will-change-transform"
					use:set_ref={id}
					onpointerdown={(e) => on_down(e, id)}
					style="flex:0 0 auto;"
				>
					<DraggableChannel item={by_id.get(id)!} {variant} />
				</div>
			{/if}
		{/each}
	{:else}
		<!-- Absolute overlay (real content, no ghost) -->
		<div class="pointer-events-none absolute" style={dragged_style(dragging)} aria-hidden="true">
			{#if by_id.get(dragging)}
				<DraggableChannel item={by_id.get(dragging)!} {variant} />
			{/if}
		</div>

		<!-- Flow items with live spacer (dragged removed) -->
		{#each base_without as id2, index (id2)}
			{#if index === spacer_index}
				<div style={`width:${drag_w}px; height:${drag_h}px; flex:0 0 auto;`}></div>
			{/if}
			{#if by_id.get(id2)}
				<div
					class="touch-none will-change-transform"
					use:set_ref={id2}
					onpointerdown={(e) => on_down(e, id2)}
					style="flex:0 0 auto;"
				>
					<DraggableChannel item={by_id.get(id2)!} {variant} />
				</div>
			{/if}
		{/each}
		{#if spacer_index === base_without.length}
			<div style={`width:${drag_w}px; height:${drag_h}px; flex:0 0 auto;`}></div>
		{/if}
	{/if}
</div>

<style>
	.touch-none {
		touch-action: none;
		cursor: grab;
	}
</style>
