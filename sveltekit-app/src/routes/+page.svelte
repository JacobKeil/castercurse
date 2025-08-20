<script lang="ts">
	import { Logo } from '$lib';
import typewriter from '$lib/actions/typewriter';
	import { Button } from 'svelte-ux';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Home" />
</svelte:head>

<article class="mx-auto max-w-[1200px] space-y-6">
	<div
		class="flex min-h-[400px] flex-col items-center justify-center gap-12 bg-gradient-to-b from-zinc-900 to-transparent p-6 text-center"
	>
		<div class="w-24">
			<Logo />
		</div>
		<!-- <h1 class="text-red-300 text-4xl font-normal">Castercurse</h1> -->
		<!-- svelte-ignore a11y-missing-content -->
		<h1
			class="min-h-[50px] text-5xl font-semibold text-gray-300"
			use:typewriter={{ speed: 10, delay: 5000 }}
		></h1>
		<div class="flex gap-4 items-center">
			<Button class="bg-red-400 text-zinc-800 font-normal hover:bg-red-400/90"><a href="/view">Custom View</a></Button>
			<Button class="bg-purple-400 hover:bg-purple-400/90 text-zinc-800 font-normal"><a href="/events">Events</a></Button>
		</div>
	</div>
</article>

<footer
	class="flex h-32 flex-col items-center justify-center space-y-3 border-t border-zinc-800 bg-zinc-900 px-4"
>
	<p class="flex items-center gap-1 text-lg text-zinc-400">
		Copyright <span class="text-xl font-light">&copy;</span> 2025 castercurse. All rights reserved.
	</p>
	<div class="flex items-center gap-3">
		<i class="fa-brands fa-discord hover:text-primary cursor-pointer text-zinc-400"></i>
	</div>
</footer>
