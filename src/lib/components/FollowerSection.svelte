<script lang="ts">
	import { channels, MAX_CHANNELS } from '../stores/streams';
	import { Switch } from 'svelte-ux';
	import { VodsClips } from '.';

	type follower_channel = {
		handle: string;
		display_name: string;
		is_live: boolean;
	};

	let { channel, show_live_status }: { channel: follower_channel; show_live_status: boolean } =
		$props();

	function is_checked(e: Event) {
		return (e.target as HTMLInputElement).checked;
	}

	$effect(() => {
		// normalize just in case
		channel.handle = channel.handle?.toLowerCase?.() ?? channel.handle;
	});
</script>

<div class="rounded-md bg-zinc-800">
	<div class="space-y-1 p-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if show_live_status}
					<div
						class="h-2 w-2 rounded-full"
						class:bg-green-500={channel.is_live}
						class:bg-red-500={!channel.is_live}
					></div>
				{/if}

				<h1
					class:text-gray-500={!$channels.some((ch) => ch.handle === channel.handle)}
					class:text-gray-300={$channels.some((ch) => ch.handle === channel.handle)}
				>
					{channel.display_name}
				</h1>
			</div>

			<div class="flex items-center gap-2">
				<VodsClips handle={channel.handle} small_icon />

				<Switch
					size="md"
					color="danger"
					checked={$channels.some((ch) => ch.handle === channel.handle)}
					disabled={!$channels.some((ch) => ch.handle === channel.handle) &&
						$channels.length >= MAX_CHANNELS}
					on:change={(e) => {
						if (!is_checked(e)) {
							$channels = $channels.filter((ch) => ch.handle !== channel.handle);
						} else {
							if (!$channels.some((ch) => ch.handle === channel.handle)) {
								if ($channels.length < MAX_CHANNELS) {
									$channels = [
										...$channels,
										{
											id: channel.handle,
											handle: channel.handle,
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
</div>
