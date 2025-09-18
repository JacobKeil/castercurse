<script lang="ts">
	import moment from 'moment';
	import { TwitchVod } from '$lib';
	import { Dialog, ProgressCircle } from 'svelte-ux';
	import { writable } from 'svelte/store';
	import { channels, render_source } from '$lib/stores/streams';
	import { onMount } from 'svelte';
	import { handle_keydown } from '$lib/helpers';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { supabase } from '$lib/supabase_client';

	let {
		small_icon = false,
		handle
	}: {
		small_icon?: boolean;
		handle: string;
	} = $props();

	let open: boolean = $state(false);
	let video_open: boolean = $state(false);

	let promise: any | null = $state(null);
	const current_vod = writable<string | null>(null);
	let fetch_data = () => {};

	onMount(() => {
		fetch_data = async () => {
			let endpoint = `${PUBLIC_ORIGIN}/api/vods_clips?handle=${handle}`;
			let response = await fetch(endpoint);
			let result = await response.json();
			return result.data;
		};
	});

	function set_vod(id: string) {
		$current_vod = id;
		if ($current_vod) {
			video_open = true;
			$channels.forEach((ch) => {
				if (ch.mute) {
					ch.mute();
				}
			});
		}
	}

	async function sign_in_with_twitch() {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'twitch',
			options: {
				redirectTo: `${PUBLIC_ORIGIN}/auth/callback`
			}
		});
	}

	$effect(() => {
		if (open) {
			promise = fetch_data();
		}
	});
</script>

{#if small_icon}
	<i
		class="fa-solid fa-camera-movie text-md mb-[2px] cursor-pointer text-zinc-500 duration-100 hover:text-[#c4a5ff]"
		onclick={() => {
			open = !open;
		}}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			handle_keydown(e, () => {
				open = !open;
			});
		}}
	></i>
{:else}
	<div
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-zinc-700 py-1 duration-300 hover:bg-zinc-600"
		onclick={() => {
			open = !open;
		}}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			handle_keydown(e, () => {
				open = !open;
			});
		}}
	>
		<i
			class="fa-solid fa-camera-movie cursor-pointer text-sm text-zinc-400 duration-300 hover:text-[#c4a5ff]"
		></i>
	</div>
{/if}

<Dialog
	bind:open
	classes={{ backdrop: 'bg-zinc-900/70' }}
	class="max-h-[calc(100vh_-_5rem)] min-w-[400px] max-w-[calc(100vw_-_2rem)] p-4 mobile:max-w-[calc(100vw_-_10rem)]"
>
	{#await promise}
		<div>
			<h1 class="text-xl text-gray-500">Recent Vods</h1>
			<hr class="mb-4 mt-2" />
		</div>
		<div class="flex h-full w-full items-center justify-center">
			<ProgressCircle class="text-gray-500" />
		</div>
	{:then data}
		{#if data}
			<div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3 text-gray-500">
						<h1 class="text-xl">Recent Vods</h1>
						-
						<h1 class="text-xl">{data.user.display_name}</h1>
					</div>
					<i
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							handle_keydown(e, () => {
								open = !open;
							});
						}}
						onclick={() => {
							open = !open;
						}}
						class="fa-solid fa-xmark cursor-pointer text-gray-500 hover:text-gray-400"
					></i>
				</div>
				<hr class="mb-4 mt-2" />
			</div>
			<section>
				{#if data.vods.length > 0}
					<div class="grid grid-cols-1 gap-4 mobile:grid-cols-2 desktop:grid-cols-3">
						{#each data.vods as vod}
							<div
								onclick={() => {
									set_vod(vod.id);
								}}
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									handle_keydown(e, () => {
										set_vod(vod.id);
									});
								}}
								class="group relative min-h-[180px] w-full cursor-pointer rounded-md duration-100 hover:scale-105 mobile:h-[180px] mobile:w-[320px]"
							>
								<img
									class="absolute bottom-0 left-0 right-0 top-0 rounded-md"
									src={vod.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180')}
									alt=""
								/>
								<p
									class="absolute left-2 right-2 top-2 z-10 w-fit rounded-lg bg-zinc-900 px-2 text-sm text-gray-400 opacity-80"
								>
									{vod.title}
								</p>
								<p class="absolute bottom-2 left-2 z-10 rounded-lg bg-zinc-900 px-2 text-gray-400">
									{vod.view_count >= 1000
										? Math.round(vod.view_count / 1000) + 'k'
										: vod.view_count} views
								</p>
								<p class="absolute bottom-2 right-2 z-10 rounded-lg bg-zinc-900 px-2 text-gray-400">
									{moment(vod.created_at).fromNow()}
								</p>
							</div>
						{/each}
					</div>
				{:else}
					<h1 class="text-lg text-gray-400">No recent vods.</h1>
				{/if}
			</section>
		{:else}
			<div>
				<div class="flex items-center gap-3 text-gray-500">
					<h1 class="text-xl">Could not load recent vods!</h1>
				</div>
				<hr class="mb-4 mt-2" />
			</div>
			<section>
				<h1 class="text-lg text-gray-400">Connect your twitch account to unlock this feature!</h1>
				<br />
				<div
					onclick={sign_in_with_twitch}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						handle_keydown(e, () => {
							sign_in_with_twitch();
						});
					}}
					class="flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-[#6441a5] px-2 py-3 duration-300 hover:bg-[#7b57bd]"
				>
					<i class="fa-brands fa-twitch"></i>
					<h1 class="whitespace-nowrap text-gray-200">Connect Twitch</h1>
				</div>
			</section>
		{/if}
	{:catch error}
		<h1>ERROR</h1>
	{/await}
</Dialog>

<Dialog
	bind:open={video_open}
	classes={{ backdrop: 'bg-zinc-900/70', root: 'border-0', dialog: 'border-0' }}
	class="h-full max-h-[calc(100vh_-_30%)] w-full max-w-[calc(100vw_-_2rem)] p-2 mobile:max-w-[calc(100vw_-_30%)]"
>
	{#if video_open && $current_vod}
		<TwitchVod
			close={() => {
				video_open = false;
				current_vod.set(null);
			}}
			vod_id={$current_vod}
			render_source={$render_source}
		/>
	{/if}
</Dialog>
