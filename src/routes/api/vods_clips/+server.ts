import { error, json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch'; // Import the shared helper

export async function GET({ url, cookies }) {
	const handle = url.searchParams.get('handle');

	if (!handle) {
		throw error(400, 'A channel "handle" query parameter is required.');
	}

	try {
		// --- Step 1: Get the user's Twitch ID from their login name ---
		const get_user_url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(handle)}`;
		const user_response = await make_twitch_api_request(get_user_url, cookies);
		const user_data = await user_response.json();

		const user = user_data.data?.[0];
		if (!user) {
			throw error(404, `Twitch user "${handle}" not found.`);
		}

		// --- Step 2: Use the ID to get the user's recent videos ---
		const get_videos_url = `https://api.twitch.tv/helix/videos?user_id=${user.id}&period=day&first=3`;
		const videos_response = await make_twitch_api_request(get_videos_url, cookies);
		const videos_data = await videos_response.json();

		// --- Step 3: Return the combined data ---
		return json({
			data: {
				user: user,
				vods: videos_data.data
			}
		});
	} catch (err: any) {
		// The helper function throws SvelteKit errors, so we can just re-throw them
		// and let SvelteKit handle the response.
		throw err;
	}
}