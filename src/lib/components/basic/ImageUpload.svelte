<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { onMount } from 'svelte';

	let { value = $bindable() }: { value: File | null } = $props();

	let file_input: HTMLInputElement;
	let preview_url = $state<string | null>(null);

	function open_file_dialog() {
		file_input.click(); // Programmatically click the hidden file input
	}

	function handle_file_change(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			value = file; // Update the bound value for the parent component

			// Create a URL for the image preview
			const reader = new FileReader();
			reader.onload = () => {
				preview_url = reader.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			// User cancelled the dialog
			value = null;
			preview_url = null;
		}
	}

	$effect(() => {
		if (value === null) {
			preview_url = null;
			if (file_input) {
				file_input.value = '';
			}
		}
	});
</script>

<div
	role="button"
	tabindex="0"
	onclick={open_file_dialog}
	onkeydown={(e) => {
		handle_keydown(e, () => {
			open_file_dialog();
		});
	}}
	class:border-dashed={!preview_url}
	class="group grid aspect-square h-16 cursor-pointer place-content-center rounded-md border-2 border-zinc-600 bg-cover bg-center hover:border-red-400"
	style:background-image={preview_url ? `url(${preview_url})` : 'none'}
>
	{#if !preview_url}
		<i class="fa-solid fa-image text-zinc-400 group-hover:text-red-400"></i>
	{/if}
</div>

<input
	type="file"
	name="image"
	accept="image/*"
	bind:this={file_input}
	onchange={handle_file_change}
	class="hidden"
/>
