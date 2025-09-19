<script lang="ts">
	import { TextField } from 'svelte-ux';
	import { channels, MAX_CHANNELS } from '$lib/stores/streams';
	import { uniqueId } from '@layerstack/utils';
	import { handle_keydown } from '$lib/helpers';

	let search:
		| string
		| number
		| {
				[operator: string]: string | number;
		  }
		| undefined = undefined;

	function add_channel() {
		if (search !== '' && search !== null && search !== undefined) {
			if (!$channels.some((ch) => ch.handle.toLowerCase() === String(search).toLowerCase())) {
				if ($channels.length < MAX_CHANNELS) {
					$channels = [
						...$channels,
						{
							id: String(search),
							handle: String(search),
							hidden: false,
							muted: true,
							paused: false,
							volume: 0.3
						}
					];
				}
				search = undefined;
			} else {
				search = undefined;
			}
		}
	}

	function handle_keydown_alt(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			add_channel();
		}
	}
</script>

<TextField
	autofocus
	placeholder="Add Channel... (ex. playapex)"
	on:keydown={handle_keydown_alt}
	bind:value={search}
	classes={{
		container: 'hover:border-zinc-500 group-focus-within:border-zinc-500 rounded-md',
		input: 'pl-2 pr-6 text-gray-400'
	}}
>
	{#snippet append()}
		<i
			onclick={add_channel}
			role="button"
			tabindex="0"
			onkeydown={(e) => {
				handle_keydown(e, () => {
					add_channel();
				});
			}}
			class="fa-solid fa-plus fa-md cursor-pointer pr-2 text-gray-500 duration-150 hover:text-gray-400"
		></i>
	{/snippet}
</TextField>
