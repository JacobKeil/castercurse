import { json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch'; // Import the snake_case helper

export async function GET({ request, cookies }) {
  // const access_token = cookies.get('oauth_provider_token'); 
  // if (access_token) throw Error("No Auth");

	const twitch_api_base_url = 'https://api.twitch.tv/helix/streams';

	// Get channel handles from the incoming request's URL
	const url = new URL(request.url);
	const channel_handles = url.searchParams.getAll('user_login');

	// If no channels were requested, return an empty array immediately.
	if (channel_handles.length === 0) {
		return json({ data: { streams: [] } });
	}

	// Build the final URL for the Twitch API
	const twitch_query_params =
		'?' + channel_handles.map((handle) => `user_login=${encodeURIComponent(handle)}`).join('&');
	const final_twitch_url = twitch_api_base_url + twitch_query_params;

	// console.log('Requesting stream statuses from Twitch:', final_twitch_url);

	try {
		// Use the wrapper to make the request. It handles all auth, refresh, and retry logic.
		const response = await make_twitch_api_request(final_twitch_url, cookies);
		const twitch_data = await response.json();

		return json({
			data: {
				streams: twitch_data.data
			}
		});
	} catch (err: any) {
		// The helper throws errors from @sveltejs/kit, so we can just re-throw them.
		// SvelteKit's default error handling will take over.
		throw err;
	}
}