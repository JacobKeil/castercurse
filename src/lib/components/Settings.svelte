<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { Switch } from 'svelte-ux';

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
</script>

<div class="w-full space-y-2 rounded-md bg-zinc-800 px-5 py-4">
	<h1 class="text-lg font-normal text-gray-400">Settings</h1>
	<label class="flex items-center gap-2 text-sm text-gray-400">
		<Switch size="md" color="danger" bind:checked={$settings.controls} />
		Display controls overlay on streams
	</label>
	<label class="flex items-center gap-2 text-sm text-gray-400">
		<Switch size="md" color="danger" bind:checked={$settings.middle_click_hide} />
		Middle click stream on navbar to toggle hide
	</label>
	<label class="flex items-center gap-2 text-sm text-gray-400">
		<Switch size="md" color="danger" bind:checked={$settings.sidebar_top} />
		Display navbar on the top of the page
	</label>
	<label class="flex items-center gap-2 text-sm text-gray-400">
		<Switch size="md" color="danger" bind:checked={$settings.open_chat} />
		Open chat when stream is set to primary
	</label>
</div>
