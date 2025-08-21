<script lang="ts">
	import { onMount } from 'svelte';
	import { channels } from '$lib/stores/streams';
	import type { Channel } from '$lib/types';

	let {
		initial_volume = 0.3,
		render_source = false,
		channel,
		width = '100%',
		height = '100%',
		initialMuted = true
	}: {
		initial_volume?: number;
		render_source: boolean;
		channel: Channel;
		width?: string;
		height?: string;
		initialMuted: boolean;
	} = $props();

	let parent: string[] = [];
	let muted = initialMuted;

	let playerDiv: HTMLDivElement;
	let player: any;

	function mute() {
		muted = true;
		if (player) {
			player.setMuted(muted);
		}
		// Update the store with the new mute state
		channels.update((channels) => {
			const channelIndex = channels.findIndex((c) => c.id === channel.id);
			if (channelIndex !== -1) {
				channels[channelIndex].muted = muted;
			}
			return channels;
		});
	}

	function un_mute() {
		muted = false;
		if (player) {
			player.setMuted(muted);
		}
		// Update the store with the new mute state
		channels.update((channels) => {
			const channelIndex = channels.findIndex((c) => c.id === channel.id);
			if (channelIndex !== -1) {
				channels[channelIndex].muted = muted;
			}
			return channels;
		});
	}

	function pause() {
		player.pause();
	}

	function play() {
		player.play();
	}

	function get_volume(): number {
		return player.getVolume();
	}

	function set_volume(value: number) {
		if (value >= 0 && value <= 1.0) {
			player.setVolume(value);
		} else {
			player.setVolume(0.5);
		}
	}

	function get_quality(): string {
		return player.getQuality();
	}

	function set_quality(value: 'auto' | 'chunked'): void {
		player.setQuality(value);
	}

	function ended(): boolean {
		return player.getEnded();
	}

	function initialize_player() {
		const options = {
			width,
			height,
			channel: channel.handle,
			parent,
			muted,
			layout: 'video',
			// allowfullscreen: false,
			theme: 'dark'
		};

		// @ts-ignore
		player = new Twitch.Embed(playerDiv, options);

		const setHighestQuality = () => {
			let qualities = player.getQualities();
			if (qualities && qualities.length > 0) {
				let highestQuality = qualities
					.filter((q: any) => q.name !== 'Auto')
					.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

				if (highestQuality) {
					player.setVolume(initial_volume);
					player.setMuted(muted);
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

		// @ts-ignore
		player.addEventListener(Twitch.Embed.VIDEO_READY, (e) => {
			console.log('Twitch embed ready');
			console.log(e);
		});
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

		channels.update((channels) => {
			const existing_channel = channels.find((c) => c.id === channel.id);
			if (existing_channel) {
				existing_channel.mute = mute;
				existing_channel.un_mute = un_mute;
				existing_channel.pause = pause;
				existing_channel.play = play;
				existing_channel.get_volume = get_volume;
				existing_channel.set_volume = set_volume;
				existing_channel.get_quality = get_quality;
				existing_channel.set_quality = set_quality;
				existing_channel.ended = ended;
			} else {
				channels.push({
					...channel,
					muted,
					mute,
					un_mute,
					get_volume,
					set_volume,
					get_quality,
					set_quality,
					play,
					pause,
					ended
				});
			}
			return channels;
		});
	});

	$effect(() => {
		if (player) {
			player.setMuted(muted);
		}
	});
</script>

<div class="h-full w-full" id="player" bind:this={playerDiv}></div>
