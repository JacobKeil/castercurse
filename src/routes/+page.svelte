<script lang="ts">
	import { goto } from '$app/navigation';
	import { Logo } from '$lib';
	import typewriter from '$lib/actions/typewriter';
	import { Button } from 'svelte-ux';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Home" />
</svelte:head>

<article class="mx-auto max-w-[1200px] space-y-6 px-6">
	<div
		class="flex min-h-[400px] flex-col items-center justify-center gap-12 bg-gradient-to-b from-zinc-900 to-transparent p-6 text-center"
	>
		<div class="w-24">
			<Logo />
		</div>
		<div
			class="min-h-[50px] text-5xl font-semibold text-gray-300"
			use:typewriter={{ speed: 10, delay: 5000 }}
		></div>
		<div class="flex items-center gap-4">
			<Button
				on:click={() => {
					goto('/view');
				}}
				class="bg-red-400 font-normal text-zinc-800 hover:bg-red-400/90">Custom view</Button
			>
			<Button
				on:click={() => {
					goto('/events');
				}}
				class="bg-purple-400 font-normal text-zinc-800 hover:bg-purple-400/90">Events</Button
			>
		</div>
	</div>
	<!-- <br> -->
	<h1 class="text-center text-4xl text-zinc-400">
		Use <span class="text-red-400">custom view</span> to build your own layout
	</h1>
	<br />
	<div class="rounded-lg border-2 border-zinc-700/70">
		<img class="rounded-lg" src="/images/home_page/view.png" alt="" />
	</div>
	<br />
	<h1 class="text-center text-4xl text-zinc-400">
		Use <span class="text-red-400">event view</span> to manage your streams
	</h1>
	<br />
	<div class="rounded-lg border-2 border-zinc-700/70">
		<img class="rounded-lg" src="/images/home_page/event.png" alt="" />
	</div>
	<br />
</article>

<footer
	class="flex h-32 flex-col items-center justify-center space-y-3 border-t border-zinc-800 bg-zinc-900 px-4"
>
	<p class="flex items-center gap-1 text-lg text-zinc-400">
		Copyright <span class="text-xl font-light">&copy;</span> 2025 castercurse. All rights reserved.
	</p>
	<div class="flex items-center gap-3">
		<i class="fa-brands fa-discord cursor-pointer text-zinc-400 hover:text-[#7289DA]"></i>
	</div>
</footer>
