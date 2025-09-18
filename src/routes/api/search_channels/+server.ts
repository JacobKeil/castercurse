import { json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch'

export async function GET({ url, cookies }) {
  const search = url.searchParams.get('search');
	const final_twitch_url = `https://api.twitch.tv/helix/search/channels?query=` + search;

	try {
		const response = await make_twitch_api_request(final_twitch_url, cookies);
		const twitch_data = await response.json();

		return json({
			data: {
				streams: twitch_data.data
			}
		});
	} catch (err: any) {
		throw err;
	}
}