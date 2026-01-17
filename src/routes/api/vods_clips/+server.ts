import { error, json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch';

export async function GET({ url, cookies }) {
	const handle = url.searchParams.get('handle');

	if (!handle) {
		throw error(400, 'A channel "handle" query parameter is required.');
	}

	const get_user_url = `https://api.twitch.tv/helix/users?login=${encodeURIComponent(handle)}`;
	const user_response = await make_twitch_api_request(get_user_url, cookies);

	const user_data: any = await user_response.json();
	const user = user_data?.data?.[0];

	if (!user?.id) {
		throw error(404, `Twitch user "${handle}" not found.`);
	}

	// Past broadcasts (VODs), newest first, limit 3
	const get_videos_url =
		`https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(user.id)}` +
		`&type=archive&sort=time&first=3`;

	const videos_response = await make_twitch_api_request(get_videos_url, cookies);
	const videos_data: any = await videos_response.json();

	return json({
		data: {
			user,
			vods: Array.isArray(videos_data?.data) ? videos_data.data : []
		}
	});
}
