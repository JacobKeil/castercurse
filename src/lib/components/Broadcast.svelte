<script lang="ts">
	import { channels, MAX_CHANNELS } from '$lib/stores/streams';
	import { Switch } from 'svelte-ux';
	import { VodsClips } from '.';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { uniqueId } from '@layerstack/utils';
	import type { Channel } from '@prisma/client';

	let { broadcast = null }: { broadcast: Channel | null } = $props();

	function is_checked(e: Event) {
		return (e.target as HTMLInputElement).checked;
	}
</script>

<div class="w-full rounded-md bg-zinc-800 p-2">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1
				class:text-gray-500={!$channels.some((ch) => ch.handle === broadcast?.handle)}
				class:text-gray-300={$channels.some((ch) => ch.handle === broadcast?.handle)}
			>
				{broadcast?.display_name}
			</h1>
		</div>
		<div class="flex items-center gap-2">
			{#if broadcast?.handle}
				<VodsClips handle={broadcast.handle} small_icon />
			{/if}
			<Switch
				size="md"
				color="danger"
				checked={$channels.some((ch) => ch.handle === broadcast?.handle)}
				disabled={!$channels.some((ch) => ch.handle === broadcast?.handle) &&
					$channels.length >= MAX_CHANNELS}
				on:change={(e) => {
					if (!is_checked(e)) {
						$channels = $channels.filter((ch) => ch.handle !== broadcast?.handle);
					} else {
						if (!$channels.some((ch) => ch.handle === broadcast?.handle)) {
							if ($channels.length < MAX_CHANNELS) {
								$channels = [
									...$channels,
									{
										id: broadcast ? broadcast.handle : '',
										handle: broadcast ? broadcast.handle : '',
										hidden: false,
										muted: true,
										paused: false,
										volume: 0.3
									}
								];
							}
						}
					}
				}}
			/>
		</div>
	</div>
</div>
