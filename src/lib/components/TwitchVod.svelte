<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { onMount } from 'svelte';

	let {
		initial_volume = 0.3,
		render_source = false,
		vod_id,
		width = '100%',
		height = '100%',
		close
	}: {
		initial_volume?: number;
		render_source?: boolean;
		vod_id: string;
		width?: string;
		height?: string;
		close: () => void;
	} = $props();

	let parent: string[] = [];

	let playerDiv: HTMLDivElement;
	let player: any;

	function initialize_player() {
		const options = {
			width,
			height,
			video: vod_id,
			parent,
			muted: false
		};

		// @ts-ignore
		player = new Twitch.Player(playerDiv, options);

		const setHighestQuality = () => {
			let qualities = player.getQualities();
			if (qualities && qualities.length > 0) {
				let highestQuality = qualities
					.filter((q: any) => q.name !== 'Auto')
					.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

				if (highestQuality) {
					player.setVolume(initial_volume);
					if (render_source) {
						player.setQuality('chunked');
					}
					return true;
				}
			}
			return false;
		};

		if (!setHighestQuality()) {
			const interval = setInterval(() => {
				if (setHighestQuality()) {
					clearInterval(interval);
				}
			}, 1000);
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			parent = [window.location.hostname];

			// @ts-ignore
			if (!window.twitch_script_loaded) {
				const script = document.createElement('script');
				script.src = 'https://player.twitch.tv/js/embed/v1.js';
				script.onload = () => {
					// @ts-ignore
					window.twitch_script_loaded = true;
					initialize_player();
				};
				document.body.appendChild(script);
			} else {
				initialize_player();
			}
		}
	});
</script>

<div class="relative h-full w-full" id="player" bind:this={playerDiv}>
	<div
		role="button"
		tabindex="0"
		onclick={close}
		onkeydown={(e) => {
			handle_keydown(e, () => {
				close();
			});
		}}
		class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
	>
		<i class="fa-solid fa-xmark fa-lg cursor-pointer text-gray-500 group-hover:text-gray-400"></i>
	</div>
</div>
