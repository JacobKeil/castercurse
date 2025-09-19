import { json } from '@sveltejs/kit';

export async function POST({ locals, cookies }) {
	await locals.supabase.auth.signOut();

	cookies.delete('oauth_provider_token', {
		path: '/'
	});
	cookies.delete('oauth_provider_refresh_token', {
		path: '/'
	});

	return json({
		success: true
	});
}
