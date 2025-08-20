<script lang="ts">
	import { Button } from "svelte-ux";

  let { browser, close }: { browser: string | null; close: () => void } = $props();

  function set_cookie_notice() {
    localStorage.setItem('cookie_notice', 'true');
    close();
  }
</script>

<div class="text-zinc-400">
  <h1 class="text-2xl">Twitch Ads notice</h1>
  <!-- <hr class="border-zinc-600/50"> -->

  <div class="py-4">
    <p>Most browsers are switching to default 3rd party cookies being blocked. Which means that if you want <span class="text-purple-400">Twitch Turbo</span> or subs to block ads, you will need to disable 3rd party cookies for this website! This is different in each browser so here is a guide on how to do it in your current browser.</p>

    <br>
    <div class="flex items-center gap-2">
			<Button class="bg-purple-400 text-zinc-800 font-normal hover:bg-purple-400/90" on:click={close}>Remind me again</Button>
			<Button class="bg-red-400 text-zinc-800 font-normal hover:bg-red-400/90" on:click={set_cookie_notice}>Don't show me again</Button>
		</div>
    <br>

    {#if browser?.includes('Firefox')}
      <h1 class="text-red-400 pb-2">Firefox Instructions</h1>
      <ul class="">
        <li>Go to your browsers settings.</li>
        <img src="/images/cookie_notice/firefox/step_1.PNG" alt="">
        <br>
        <li>In the top search bar, type <span class="text-red-400">cookies</span>. At the bottom click the <span class="text-red-400">Manage Exceptions</span> button.</li>
        <img src="/images/cookie_notice/firefox/step_2.PNG" alt="">
        <br>
        <li>Type <span class="text-red-400">https://castercurse.com</span> and click <span class="text-red-400">Allow</span>. After this, make sure to click the <span class="text-red-400">Save Changes</span> button.</li>
        <img src="/images/cookie_notice/firefox/step_3.PNG" alt="">
        <br>
        <li>This is what it will look like after you have allowed and saved.</li>
        <img src="/images/cookie_notice/firefox/step_4.PNG" alt="">
        <br>
        <li>Go to <span class="text-red-400">https://castercurse.com</span> and make sure the shield has a slash thorugh it which indicates that 3rd party cookies are enabled for this site only.</li>
        <img src="/images/cookie_notice/firefox/step_5.PNG" alt="">
      </ul>
    {/if}

    {#if browser?.includes('Chrome') && !browser?.includes('Edg')}
    <h1 class="text-red-400 pb-2">Chrome Instructions</h1>
    <ul class="">
      <li>Go to your browsers settings.</li>
      <img src="/images/cookie_notice/chrome/step_1.PNG" alt="">
      <br>
      <li>In the top search bar, type <span class="text-red-400">cookies</span>. Click on the <span class="text-red-400">Third-party cookies</span> button.</li>
      <img src="/images/cookie_notice/chrome/step_2.PNG" alt="">
      <br>
      <li>Click the <span class="text-red-400">Add</span> button at the bottom.</li>
      <img src="/images/cookie_notice/chrome/step_3.PNG" alt="">
      <br>
      Type <span class="text-red-400">https://castercurse.com</span> and click <span class="text-red-400">Add</span>.
      <img src="/images/cookie_notice/chrome/step_4.PNG" alt="">
      <br>
      <li>This is what it will look like when you successfully add it to the list.</li>
      <img src="/images/cookie_notice/chrome/step_5.PNG" alt="">
    </ul>
    {/if}

    {#if browser?.includes('Edg')}
    <h1 class="text-red-400 pb-2">Edge Instructions</h1>
    <ul class="">
      <li>Go to your browsers settings.</li>
      <img src="/images/cookie_notice/edge/step_1.PNG" alt="">
      <br>
      <li>Select <span class="text-red-400">Privacy, search, and services</span> in the sidebar.</li>
      <img src="/images/cookie_notice/edge/step_2.PNG" alt="">
      <br>
      <li>Click the <span class="text-red-400">Exceptions</span> button at the bottom.</li>
      <img src="/images/cookie_notice/edge/step_3.PNG" alt="">
      <br>
      <li>Click the <span class="text-red-400">Add site</span> button</li>
      <img src="/images/cookie_notice/edge/step_4.PNG" alt="">
      <br>
      Type <span class="text-red-400">https://castercurse.com</span> and click <span class="text-red-400">Add</span>.
      <img src="/images/cookie_notice/edge/step_5.PNG" alt="">
      <br>
      <li>This is what it will look like when you successfully add it to the list.</li>
      <img src="/images/cookie_notice/edge/step_6.PNG" alt="">
    </ul>
    {/if}
  </div>

  <!-- <hr class="pt-2 border-zinc-600/50"> -->
</div>