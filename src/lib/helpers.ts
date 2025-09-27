import { PUBLIC_ORIGIN } from '$env/static/public';
import { get } from 'svelte/store';
import { current_event } from './stores/event';
import type { EventWithChannelsLive } from './types';

export function handle_keydown(e: KeyboardEvent, func: () => void) {
	if (e.key === 'Enter') {
		func();
	}
}

export async function fetch_api(path: string): Promise<any> {
	let response = await fetch(`${PUBLIC_ORIGIN}/api${path}`);
	let result = await response.json();
	return result;
}

export async function fetch_exteral_api(path: string): Promise<any> {
	let response = await fetch(path);
	let result = await response.json();
	return result;
}

export async function fetch_live_data() {
	const event = get(current_event);
	if (!event) {
		console.log('No current event set, skipping fetch.');
		return;
	}

	const handles = event.teams.flatMap((team) => team.channels.map((player) => player.handle));
	if (handles.length === 0) {
		console.log('No channels to check.');
		return;
	}

	const endpoint = new URL(`${PUBLIC_ORIGIN}/api/streams`);
	handles.forEach((handle) => {
		endpoint.searchParams.append('user_login', handle);
	});

	const response = await fetch(endpoint.toString());
	if (!response.ok) {
		console.error('Failed to fetch stream statuses');
		return;
	}
	const result = await response.json();
	const live_streams: any[] = result.data.streams || [];

	const live_handles = new Set(live_streams.map((stream) => stream.user_login.toLowerCase()));

	const updated_event: EventWithChannelsLive = {
		...event,
		teams: event.teams.map((team) => ({
			...team,
			channels: team.channels.map((channel) => ({
				...channel,
				is_live: live_handles.has(channel.handle.toLowerCase())
			}))
		}))
	};

	current_event.set(updated_event);
}
