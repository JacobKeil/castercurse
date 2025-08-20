<script lang="ts">
	import '../app.css';
	import { cls } from '@layerstack/tailwind';
	import { goto } from '$app/navigation';

	import {
		current_stream,
		render_source,
		channels,
		toggle_mute,
		stream_manager_open
	} from '$lib/stores/streams';

	import { onMount } from 'svelte';
	import { default_settings, settings } from '$lib/stores/settings';
	import type { Channel } from '$lib/types';
	import { page } from '$app/state';
	import { ChannelTabs, CookieNotice, Logo, StreamManager, ToggleHidden, TwitchChat } from '$lib';
	import { fly } from 'svelte/transition';
	import { handle_keydown } from '$lib/helpers';
	import { Button, Toggle, Avatar, Menu, MenuItem, Drawer, Dialog } from 'svelte-ux';
	import { PUBLIC_ORIGIN } from '$env/static/public';

	let { children, data } = $props();
	const { supabase, user } = data;

	let cookie_notice_shown: boolean = $state(false);
	let browser: string | null = $state(null);
	let home_screen = $derived(page.url.pathname === '/' || page.url.pathname === '/events');
	let view_screen =
		$derived(page.url.pathname.includes('view') ||
		(page.url.pathname.includes('events') && page.url.pathname !== '/events'));

	onMount(() => {
		if (localStorage.getItem('theme') !== 'dark') {
			localStorage.setItem('theme', 'dark');
			location.reload();
		}

		$render_source = localStorage.getItem('render_source') === 'true';
		let settings_store = localStorage.getItem('settings');
		let cookies_notice_store = localStorage.getItem('cookie_notice');
		browser = window.navigator.userAgent;

		if (!settings_store) {
			localStorage.setItem('settings', JSON.stringify(default_settings));
		}

		if (!cookies_notice_store) {
			cookie_notice_shown = true
		} else {
			cookie_notice_shown = false
		}

		$settings = settings_store ? JSON.parse(settings_store) : default_settings;

		document.addEventListener('keyup', (e) => {
			if (parseInt(e.key) >= 1 && parseInt(e.key) <= 9 && !$stream_manager_open) {
				if (!$channels[parseInt(e.key) - 1]) return;
				set_stream($channels[parseInt(e.key) - 1]);
			}

			if (e.key === 'Escape' && !$stream_manager_open) {
				current_stream.set(null);
			}
		});

		window.onbeforeunload = function () {
			const current_page = window.location.href;

			localStorage.setItem('last_page', current_page);
		};

		// console.log(window.navigator.userAgent.includes('Edg, Chrome, Firefox'));
	});

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		const last_page = localStorage.getItem('last_page');

		if (last_page && params.has('redirect')) {
			localStorage.removeItem('last_page');
			goto(last_page);
		}
	});

	function set_stream(channel: Channel) {
		if ($current_stream && $current_stream.id === channel.id) {
			$current_stream = null;
		} else {
			$current_stream = channel;
			toggle_mute(channel);
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

	async function logout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		location.reload();
	}
</script>

<section class="flex flex-col" class:flex-col-reverse={!$settings.sidebar_top}>
	<div class="flex h-[50px] items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4">
		<div class="flex items-center gap-1 overflow-hidden">
			<div class="min-w-9 pr-2">
				<Logo />
			</div>
			{#if view_screen}
				<div
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						handle_keydown(e, () => {
							stream_manager_open.set(true);
						});
					}}
					onclick={() => {
						stream_manager_open.set(true);
					}}
					class="cursor-pointer items-center justify-center rounded-lg bg-zinc-800 px-3 py-1 duration-300 hover:bg-zinc-700"
				>
					<i class="fa-solid fa-grid-2 text-red-400"></i>
				</div>
				<ChannelTabs />
				<ToggleHidden />
			{/if}
		</div>
		<div class="flex items-center gap-2 pl-3">
			<div class="flex h-full items-center gap-2">
				{#if view_screen}
					<div
						role="button"
						tabindex="0"
						class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-700"
						onclick={() => stream_manager_open.set(true)}
						onkeydown={() => stream_manager_open.set(true)}
					>
						<i class="fa-solid fa-arrow-left-from-line fa-md text-gray-400"></i>
					</div>
				{/if}
				{#if user === null}
					<Button on:click={sign_in_with_twitch} classes={{ root: 'bg-[#9146ff]' }}
						>Sign in <i class="fa-brands fa-twitch mt-[3px] text-white"></i></Button
					>
				{:else}
					<Toggle let:on={open} let:toggle let:toggleOff>
						<Button on:click={toggle}>
							<div class="flex items-center gap-3">
								<Avatar size="sm"><img src={user?.user_metadata.avatar_url} alt="" /></Avatar>
								<!-- <h1 class="text-sm text-gray-400">{user?.user_metadata.nickname}</h1> -->
							</div>
							<Menu
								{open}
								on:close={toggleOff}
								matchWidth
								classes={{ root: 'text-gray-400 min-w-[100px]' }}
							>
								<MenuItem classes={{ root: 'text-sm' }}><a href="/">Home</a></MenuItem>
								<MenuItem classes={{ root: 'text-sm' }}><a href="/events">Events</a></MenuItem>
								<MenuItem classes={{ root: 'text-red-400 text-sm' }} on:click={logout}
									>Logout</MenuItem
								>
							</Menu>
						</Button>
					</Toggle>
				{/if}
			</div>
		</div>
	</div>
	<main
		class={cls(
			'scroll-smooth bg-zinc-900 overflow-hidden',
			view_screen && 'h-[calc(100vh_-_50px)]',
			home_screen && 'min-h-[calc(100vh_-_50px)]'
		)}
	>
		<section
			class={cls(
				$current_stream && $settings.open_chat && 'grid grid-cols-[auto_400px]',
				'h-full'
			)}
		>
		{@render children()}
			{#if $current_stream && $settings.open_chat && view_screen}
				<div
					in:fly={{ x: 400, duration: 300 }}
					out:fly={{ x: 400, duration: 300 }}
					class="bg-zinc-900"
				>
					<TwitchChat channel={$current_stream} />
				</div>
			{/if}
		</section>
	</main>
</section>

<Drawer
	bind:open={$stream_manager_open}
	placement="right"
	classes={{ backdrop: 'bg-zinc-900/70' }}
	class={cls(
		'w-full border-l border-zinc-800/50 bg-zinc-900/95 mobile:w-[400px] tablet:w-full desktop:w-[1200px]',
		$settings.sidebar_top ? 'mt-[50px] h-[calc(100vh_-_50px)]' : 'h-[calc(100vh_-_50px)]'
	)}
>
	<StreamManager {supabase} />
</Drawer>

<Dialog bind:open={cookie_notice_shown} class="mobile:max-w-[600px] m-6 max-h-[calc(50%)] w-full" classes={{ backdrop: 'bg-zinc-800/80'}} persistent>
  <div class="p-2">
		<CookieNotice close={() => { cookie_notice_shown = false }} {browser} />
	</div>
</Dialog>