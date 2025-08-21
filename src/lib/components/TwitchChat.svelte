<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { channels } from '$lib/stores/streams';
	import type { Channel } from '$lib/types';

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
