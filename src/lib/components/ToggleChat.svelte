<script lang="ts">
	import { settings } from '../stores/settings';
	import { handle_keydown } from '../helpers';
	import { onMount } from 'svelte';

	let save_settings = () => {};

	onMount(() => {
		save_settings = () => {
			localStorage.setItem('settings', JSON.stringify($settings));
		};
	});

	$effect(() => {
		if ($settings) {
			save_settings();
		}
	});

	function toggle_chat() {
		settings.set({
			...$settings,
			open_chat: !$settings.open_chat
		});
	}
</script>

<div
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		handle_keydown(e, toggle_chat);
	}}
	onclick={toggle_chat}
	class="cursor-pointer items-center justify-center rounded-lg bg-zinc-800 px-3 py-1 duration-300 hover:bg-zinc-700"
>
	<i
		class:text-red-400={$settings.open_chat}
		class:text-gray-500={!$settings.open_chat}
		class="fa-solid fa-comment"
	></i>
</div>
