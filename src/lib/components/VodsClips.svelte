<script lang="ts">
	import { TwitchVod } from '.';
	import { Dialog, ProgressCircle } from 'svelte-ux';
	import { writable } from 'svelte/store';
	import { channels, mute_all, render_source } from '../stores/streams';
	import { onMount } from 'svelte';
	import { handle_keydown } from '../helpers';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import { supabase } from '../supabase_client';

	let {
		small_icon = false,
		list_hover = false,
		handle
	}: {
		small_icon?: boolean;
		list_hover?: boolean;
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

			if (result.data.vods[0]) {
				if (result.data.vods[0].thumbnail_url.includes('_404')) {
					current_vod.set(result.data.vods[0].id);
					video_open = true;
				}
			}

			console.log(result.data);

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
				redirectTo: `${PUBLIC_ORIGIN}/auth/callback`,
				queryParams: {
					scope: 'user:read:email user:read:follows'
				}
			}
		});
	}

	$effect(() => {
		if (open) {
			promise = fetch_data();
		}
	});

	$effect(() => {
		if ($current_vod && video_open) {
			open = false;
			mute_all();
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
{:else if list_hover}
	<div
		class="group cursor-pointer p-2 hover:bg-zinc-700"
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
	>
		<i class="fa-solid fa-camera-movie fa-sm mb-[3px] cursor-pointer text-zinc-400"></i>
	</div>
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
		<div class="flex h-full w-full items-center justify-center">
			<ProgressCircle class="text-gray-500" />
		</div>
	{:then data}
		{#if !data}
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
		{:else}
			<h1 class="p-4 text-lg text-gray-400">Channel does not have a live VOD.</h1>
		{/if}
	{:catch error}
		<div>
			<div class="flex items-center gap-3 text-gray-500">
				<h1 class="text-xl">Could not load recent vod.</h1>
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
