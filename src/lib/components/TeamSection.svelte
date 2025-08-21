<script lang="ts">
	import { channels, MAX_CHANNELS } from '$lib/stores/streams';
	import { Switch } from 'svelte-ux';
	import VodsClips from './VodsClips.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { uniqueId } from '@layerstack/utils';
	import type { TeamWithChannelsLive } from '$lib/types';

	let { team, supabase, show_live_status }: 
	{ team: TeamWithChannelsLive; supabase: SupabaseClient<any, 'public', any>; show_live_status: boolean } = $props();

	function is_checked(e: Event) {
		return (e.target as HTMLInputElement).checked;
	}
</script>

<div class="rounded-md bg-zinc-800">
	<div class="flex items-center gap-2 rounded-t-md border-b border-zinc-700 bg-zinc-800 p-2">
		<!-- {#if team.logo_url}
			<img src={team.logo_url} alt="" class="h-7 w-7 rounded-full object-contain" />
		{/if} -->
		<h1 class="font-medium text-gray-400">{team.name}</h1>
	</div>
	<div class="space-y-1 p-2">
		{#if team.channels.length > 0}
			{#each team.channels as player}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						{#if show_live_status}
							<div
							class="h-2 w-2 rounded-full"
							class:bg-green-500={player.is_live}
							class:bg-red-500={!player.is_live}
						></div>
						{/if}
						<h1
							class:text-gray-500={!$channels.some((ch) => ch.handle === player.handle)}
							class:text-gray-300={$channels.some((ch) => ch.handle === player.handle)}
						>
							{player.display_name}
						</h1>
					</div>
					<div class="flex items-center gap-2">
						<VodsClips handle={player.handle} {supabase} small_icon />
						<Switch
							size="md"
							color="danger"
							checked={$channels.some((ch) => ch.handle === player.handle)}
							disabled={!$channels.some((ch) => ch.handle === player.handle) &&
								$channels.length >= MAX_CHANNELS}
							on:change={(e) => {
								if (!is_checked(e)) {
									$channels = $channels.filter((ch) => ch.handle !== player.handle);
								} else {
									if (!$channels.some((ch) => ch.handle === player.handle)) {
										if ($channels.length < MAX_CHANNELS) {
											$channels = [
												...$channels,
												{
													id: uniqueId(),
													handle: String(player.handle),
													hidden: false,
													muted: true
												}
											];
										}
									}
								}
							}}
						/>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-gray-500">No players</p>
		{/if}
	</div>
</div>
