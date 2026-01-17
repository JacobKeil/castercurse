import { PUBLIC_ORIGIN } from '$env/static/public';
import { get } from 'svelte/store';
import { writable } from 'svelte/store';

export type follower_channel = {
	handle: string; // user_login
	display_name: string; // user_name
	is_live: boolean;
};

export const followers_live = writable<follower_channel[]>([]);
export const followers_loading = writable(false);
export const followers_error = writable<string | null>(null);

export async function fetch_followers_live_data() {
	// prevent overlap spam if you call it in an effect
	if (get(followers_loading)) return;

	followers_loading.set(true);
	followers_error.set(null);

	try {
		const endpoint = new URL(`${PUBLIC_ORIGIN}/api/followed`);

		const response = await fetch(endpoint.toString());
		if (!response.ok) {
			const text = await response.text();
			followers_error.set(text || 'Failed to fetch followed live streams');
			followers_live.set([]);
			return;
		}

		const result = await response.json();

		// expecting: { data: { followers_live: [{ user_login, user_name, is_live }] } }
		const items: any[] = result?.data?.followers_live ?? [];

		const mapped: follower_channel[] = Array.isArray(items)
			? items.map((s) => ({
					handle: String(s.user_login ?? '').toLowerCase(),
					display_name: String(s.user_name ?? s.user_login ?? ''),
					is_live: true // endpoint already returns live-only
			  }))
			: [];

		followers_live.set(mapped);
	} catch (err: any) {
		followers_error.set(err?.message ?? 'Failed to fetch followed live streams');
		followers_live.set([]);
	} finally {
		followers_loading.set(false);
	}
}

export function clear_followers_live() {
	followers_live.set([]);
	followers_error.set(null);
	followers_loading.set(false);
}
