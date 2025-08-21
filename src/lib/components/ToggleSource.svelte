<script lang="ts">
	import { render_source, channels } from '$lib/stores/streams';
	import { onMount } from 'svelte';
	import { cls } from '@layerstack/tailwind';
	import { handle_keydown } from '$lib/helpers';

	let toggle_source = () => {};

	onMount(() => {
		toggle_source = () => {
			localStorage.setItem('render_source', String(!$render_source));
			$render_source = !$render_source;
			set_source_all();
		};
	});

	function set_source_all() {
		if ($render_source) {
			$channels.forEach((ch) => {
				if (ch.set_quality) {
					ch.set_quality('chunked');
				}
			});
		} else {
			$channels.forEach((ch) => {
				if (ch.set_quality) {
					ch.set_quality('auto');
				}
			});
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		handle_keydown(e, () => {
			toggle_source();
		});
	}}
	onclick={() => toggle_source()}
	class={cls(
		'flex h-full cursor-pointer select-none items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1 text-gray-500 duration-200',
		$render_source ? 'bg-red-400 text-zinc-800 hover:bg-red-400/90' : 'hover:bg-zinc-700'
	)}
>
	<i class={cls('fa-solid', $render_source ? 'fa-check text-zinc-800' : 'fa-xmark text-gray-500')}
	></i>
	SOURCE
</div>
