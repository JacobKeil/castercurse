<script lang="ts">
	import { handle_keydown } from '../helpers';
	import { onMount, onDestroy } from 'svelte';

	let {
		initial_volume = 0.3,
		render_source = true,
		vod_id,
		width = '100%',
		height = '100%',
		close,
		start_time = undefined,
		pause_on_load = false
	}: {
		initial_volume?: number;
		render_source?: boolean;
		vod_id: string;
		width?: string;
		height?: string;
		close: () => void;
		start_time?: string | number | undefined;
		pause_on_load?: boolean;
	} = $props();

	let parent: string[] = [];
	let player_div: HTMLDivElement;
	let player: any;

	// @ts-ignore
	declare global {
		interface Window {
			twitch_script_promise?: Promise<void>;
			twitch_script_loaded?: boolean;
			Twitch: any;
		}
	}

	function load_twitch_script(): Promise<void> {
		if (typeof window === 'undefined') return Promise.resolve();
		// @ts-ignore
		if (window.twitch_script_promise) return window.twitch_script_promise;

		// @ts-ignore
		window.twitch_script_promise = new Promise<void>((resolve, reject) => {
			// @ts-ignore
			if (window.Twitch) {
				// @ts-ignore
				window.twitch_script_loaded = true;
				resolve();
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://player.twitch.tv/js/embed/v1.js';
			script.async = true;
			script.onload = () => {
				// @ts-ignore
				window.twitch_script_loaded = true;
				resolve();
			};
			script.onerror = (e) => reject(e);
			document.head.appendChild(script);
		});

		// @ts-ignore
		return window.twitch_script_promise;
	}

	function parse_start_seconds(input: string | number | undefined): number | null {
		if (input == null) return null;
		if (typeof input === 'number' && isFinite(input)) return Math.max(0, Math.floor(input));

		const raw = String(input).trim().toLowerCase();

		const hms_re = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
		const m1 = raw.match(hms_re);
		if (m1 && (m1[1] || m1[2] || m1[3])) {
			const h = parseInt(m1[1] ?? '0', 10);
			const m = parseInt(m1[2] ?? '0', 10);
			const s = parseInt(m1[3] ?? '0', 10);
			return h * 3600 + m * 60 + s;
		}

		if (raw.includes(':')) {
			const parts = raw.split(':').map((p) => parseInt(p, 10));
			if (parts.some((n) => Number.isNaN(n))) return null;
			if (parts.length === 3) {
				const [hh, mm, ss] = parts;
				return hh * 3600 + mm * 60 + ss;
			}
			if (parts.length === 2) {
				const [mm, ss] = parts;
				return mm * 60 + ss;
			}
		}

		const as_num = parseInt(raw, 10);
		return Number.isFinite(as_num) ? Math.max(0, as_num) : null;
	}

	function initialize_player() {
		const options = {
			width,
			height,
			video: vod_id,
			parent,
			muted: false
		};

		// @ts-ignore
		player = new window.Twitch.Player(player_div, options);

		const set_highest_quality = () => {
			try {
				const qualities = player.getQualities?.();
				if (qualities && qualities.length > 0) {
					const best = qualities
						.filter((q: any) => q.name !== 'Auto')
						.sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
					if (best) {
						player.setVolume?.(initial_volume);
						if (render_source) player.setQuality?.('chunked');
						return true;
					}
				}
			} catch {}
			return false;
		};

		// @ts-ignore
		player.addEventListener(window.Twitch.Player.READY, () => {
			try {
				player.setVolume?.(initial_volume);
			} catch {}

			if (!set_highest_quality()) {
				const interval = setInterval(() => {
					if (set_highest_quality()) clearInterval(interval);
				}, 500);
			}

			const start_seconds = parse_start_seconds(start_time);
			const wants_pause = !!pause_on_load;

			if (start_seconds != null) {
				try {
					player.seek?.(start_seconds);
				} catch {}
			}

			if (wants_pause) {
				try {
					player.play?.();
				} catch {}
				const pause_timer = setTimeout(() => {
					try {
						player.pause?.();
					} catch {}
				}, 200);
				cleanup_tasks.push(() => clearTimeout(pause_timer));
			}
		});
	}

	const cleanup_tasks: Array<() => void> = [];

	onMount(async () => {
		if (typeof window !== 'undefined') {
			parent = [window.location.hostname];
			await load_twitch_script();
			initialize_player();
		}
	});

	onDestroy(() => {
		for (const fn of cleanup_tasks) {
			try {
				fn();
			} catch {}
		}
		try {
			player?.pause?.();
		} catch {}
		player = null;
		if (player_div) player_div.innerHTML = '';
	});
</script>

<div class="relative h-full w-full" id="player" bind:this={player_div}>
	<div
		role="button"
		tabindex="0"
		onclick={close}
		onkeydown={(e) => handle_keydown(e, close)}
		class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
	>
		<i class="fa-solid fa-xmark fa-lg cursor-pointer text-gray-500 group-hover:text-gray-400"></i>
	</div>
</div>
