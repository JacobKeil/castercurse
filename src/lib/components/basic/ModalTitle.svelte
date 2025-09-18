<script lang="ts">
	import { handle_keydown } from '$lib/helpers';
	import { Tooltip } from 'svelte-ux';

	let {
		title,
		offset = 8,
		close_form
	}: {
		title: string;
		offset?: number;
		delete_item?: (
			e: (MouseEvent & { currentTarget: EventTarget & HTMLElement }) | KeyboardEvent
		) => void;
		close_form: () => void;
	} = $props();
</script>

<div class="flex items-center gap-2">
	<h1 class="text-[17px] font-normal text-zinc-400 mobile:text-lg">{title}</h1>
</div>
<Tooltip title="Close" {offset} placement="left">
	<i
		class="fa-solid fa-xmark cursor-pointer text-zinc-400 focus:text-red-700 focus:outline-none"
		onclick={close_form}
		onkeydown={(e) => {
			handle_keydown(e, () => {
				close_form();
			});
		}}
		role="button"
		tabindex="0"
	></i>
</Tooltip>
