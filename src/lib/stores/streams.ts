import type { Channel } from '../types';
import { derived, get, writable } from 'svelte/store';

export const MAX_CHANNELS = 9;

export const channels = writable<Channel[]>([]);
export const channels_order = writable<string[]>([]);

export const render_source = writable<boolean>(false);
export const current_stream = writable<Channel | null>(null);
export const stream_manager_open = writable(false);

const current_stream_in_list = derived(
	[channels, current_stream],
	([$channels, $current_stream]) => {
		if ($current_stream === null) {
			return false;
		}
		return $channels.some((ch) => ch.id === $current_stream.id);
	}
);

// ── helpers: id extraction ────────────────────────────────────────────────
function id_of(ch: Channel | string) {
	return typeof ch === 'string' ? ch : ch.id;
}

// immutable item update by id (returns new array)
function update_channel_array(arr: Channel[], id: string, patch: Partial<Channel>) {
	let changed = false;
	const next = arr.map((c) => {
		if (c.id !== id) return c;
		changed = true;
		return { ...c, ...patch };
	});
	return changed ? next : arr;
}

// side-effect helpers
function call_mute_api(ch: Channel, muted: boolean) {
	if (muted) ch.mute?.();
	else ch.un_mute?.();
}
function call_play_pause_api(ch: Channel, paused: boolean) {
	if (paused) ch.pause?.();
	else ch.play?.();
}

// ── store actions ─────────────────────────────────────────────────────────

// unmute one channel, mute others
export function un_mute(target: Channel | string) {
	const target_id = id_of(target);

	channels.update((chs) => {
		return chs.map((c) => {
			if (c.id === target_id) {
				const was_hidden = c.hidden;
				const updated: Channel = {
					...c,
					muted: false,
					hidden: false,
					paused: was_hidden ? false : c.paused
				};
				call_mute_api(updated, false);
				if (was_hidden) call_play_pause_api(updated, false);
				return updated;
			} else {
				const updated = c.muted ? c : { ...c, muted: true };
				if (!c.muted) call_mute_api(updated, true);
				return updated;
			}
		});
	});
}

// toggle mute
export function toggle_mute(target: Channel | string) {
	const target_id = id_of(target);

	channels.update((chs) =>
		chs.map((c) => {
			if (c.id !== target_id) return c;
			const next_muted = !c.muted;
			const unhide = !next_muted && c.hidden;

			const updated: Channel = {
				...c,
				muted: next_muted,
				hidden: unhide ? false : c.hidden,
				paused: unhide ? false : c.paused
			};

			call_mute_api(updated, next_muted);
			if (unhide) call_play_pause_api(updated, false);

			return updated;
		})
	);
}

export function mute_all() {
	channels.update((chs) => {
		return chs.map((c) => {
			const updated: Channel = {
				...c,
				muted: true,
			};
			call_mute_api(updated, true);
			return updated;
		});
	});
}

// toggle hidden
export function toggle_hidden(target: Channel | string) {
	const target_id = id_of(target);

	const cur = get(current_stream);
	if (cur && cur.id === target_id) current_stream.set(null);

	channels.update((chs) =>
		chs.map((c) => {
			if (c.id !== target_id) return c;

			const next_hidden = !c.hidden;
			const updated: Channel = next_hidden
				? { ...c, hidden: true, paused: true, muted: true }
				: { ...c, hidden: false, paused: false };

			if (next_hidden) {
				call_mute_api(updated, true);
				call_play_pause_api(updated, true);
			} else {
				call_play_pause_api(updated, false);
			}
			return updated;
		})
	);
}

// unpause
export function un_pause(target: Channel | string) {
	const target_id = id_of(target);

	channels.update((chs) =>
		chs.map((c) => {
			if (c.id !== target_id) return c;
			if (!c.paused) return c;

			const updated: Channel = { ...c, paused: false };
			call_play_pause_api(updated, false);
			return updated;
		})
	);
}

// toggle pause
export function toggle_pause(target: Channel | string) {
	const target_id = id_of(target);

	channels.update((chs) =>
		chs.map((c) => {
			if (c.id !== target_id) return c;

			if (c.paused) {
				const updated: Channel = { ...c, paused: false };
				call_play_pause_api(updated, false);
				return updated;
			} else {
				const updated: Channel = { ...c, paused: true, muted: true };
				call_play_pause_api(updated, true);
				call_mute_api(updated, true);
				return updated;
			}
		})
	);
}

// unhide all
export function unhide_all() {
	channels.update((chs) =>
		chs.map((c) => {
			if (!c.hidden && !c.paused) return c;
			const updated: Channel = { ...c, hidden: false, paused: false };
			call_play_pause_api(updated, false);
			return updated;
		})
	);
}

// set current stream
export function set_stream(target: Channel | string) {
	const target_id = id_of(target);
	let selected: Channel | null = null;

	const chs = get(channels);
	selected = chs.find((c) => c.id === target_id) ?? null;

	const curr = get(current_stream);
	if (curr && curr.id === target_id) {
		current_stream.set(null);
		return;
	}

	current_stream.set(selected);
	un_mute(target_id);
	un_pause(target_id);
}

// clear current stream if it disappears
current_stream_in_list.subscribe((is_still_there) => {
	if (!is_still_there) {
		current_stream.set(null);
	}
});

// optional: volume setter in snake_case
export function set_volume(target: Channel | string, volume: number) {
	const target_id = id_of(target);
	channels.update((chs) =>
		chs.map((c) => (c.id === target_id ? { ...c, volume } : c))
	);
}
