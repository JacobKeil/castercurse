import { error, json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch';

export async function GET({ url, cookies }) {
	const handle = url.searchParams.get('handle');

	if (!handle) {
		throw error(400, 'A channel "handle" query parameter is required.');
	}

	try {
		const get_user_url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(handle)}`;
		const user_response = await make_twitch_api_request(get_user_url, cookies);
		const user_data = await user_response.json();

		const user = user_data.data?.[0];
		if (!user) {
			throw error(404, `Twitch user "${handle}" not found.`);
		}

		const get_videos_url = `https://api.twitch.tv/helix/videos?user_id=${user.id}&period=day&first=3`;
		const videos_response = await make_twitch_api_request(get_videos_url, cookies);
		const videos_data = await videos_response.json();

		// console.log(videos_data);

		return json({
			data: {
				user: user,
				vods: videos_data.data
			}
		});
	} catch (err: any) {
		throw err;
	}
}
