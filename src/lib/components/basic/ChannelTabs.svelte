<script lang="ts">
	import { handle_keydown } from '../../helpers';
	import { settings } from '../../stores/settings';
	import {
		channels,
		current_stream,
		set_stream,
		toggle_hidden,
		toggle_mute,
		toggle_pause
	} from '../../stores/streams';
	import { cls } from '@layerstack/tailwind';
	import { flip } from 'svelte/animate';
	import { Sortable } from '../sort';
</script>

<div class="flex items-center gap-[5px]">
	<Sortable axis="x" variant="tabs" />
</div>
