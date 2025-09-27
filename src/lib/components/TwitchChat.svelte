<script lang="ts">
	import { onMount } from 'svelte';
	import type { Channel } from '../types';

	export let channel: Channel;
	export let width = '100%';
	export let height = '100%';

	let parent: string[] = [];

	onMount(() => {
		if (typeof window !== 'undefined') {
			parent = [window.location.hostname];
		}
	});
</script>

<iframe
	title="chat"
	id="twitch-chat-embed"
	src={`https://www.twitch.tv/embed/${channel.handle}/chat?darkpopout&parent=${parent}`}
	{height}
	{width}
>
</iframe>
