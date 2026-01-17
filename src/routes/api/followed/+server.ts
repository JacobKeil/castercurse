import { error, json } from '@sveltejs/kit';
import { make_twitch_api_request } from '$lib/server/twitch';

export async function GET({ cookies }) {
	// Token owner (no login param)
	const me_res = await make_twitch_api_request('https://api.twitch.tv/helix/users', cookies);
	const me_data: any = await me_res.json();
	const me = me_data?.data?.[0];

	if (!me?.id) throw error(401, 'Could not resolve Twitch user from token.');

	// Live followed streams (already "live")
	const url = `https://api.twitch.tv/helix/streams/followed?user_id=${encodeURIComponent(me.id)}&first=20`;
	const res = await make_twitch_api_request(url, cookies);
	const data: any = await res.json();

	const followers_live = Array.isArray(data?.data)
		? data.data.map((s: any) => ({
				user_login: s.user_login,
				user_name: s.user_name,
				is_live: true
		  }))
		: [];

	return json({ data: { followers_live } });
}
