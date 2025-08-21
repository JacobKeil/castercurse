import { SECRET_TWITCH_SECRET } from '$env/static/private';
import { PUBLIC_TWITCH_CLIENT_ID } from '$env/static/public';
import { error, type Cookies } from '@sveltejs/kit';

/**
 * Refreshes an expired Twitch access token.
 * @param refresh_token The refresh token from the user's cookies.
 * @returns An object with the new access token and its expiry, or null if it fails.
 */
async function refresh_access_token(refresh_token: string) {
	try {
		const response = await fetch(`https://id.twitch.tv/oauth2/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: PUBLIC_TWITCH_CLIENT_ID,
				client_secret: SECRET_TWITCH_SECRET,
				grant_type: 'refresh_token',
				refresh_token: refresh_token
			})
		});

		const data = await response.json();
		if (!response.ok || !data.access_token) {
			console.error('Twitch token refresh failed:', data);
			return null;
		}

		return {
			access_token: data.access_token,
			expires_in: data.expires_in,
			new_refresh_token: data.refresh_token // Twitch can optionally return a new refresh token
		};
	} catch (e) {
		console.error('Error during token refresh:', e);
		return null;
	}
}

/**
 * A wrapper to make authenticated requests to the Twitch API.
 * It automatically handles token refreshing and retries.
 * @param url The full Twitch API URL to fetch.
 * @param cookies The cookies object from the SvelteKit request event.
 * @returns A Response object from the successful Twitch API call.
 */
export async function make_twitch_api_request(url: string, cookies: Cookies) {
	let access_token = cookies.get('oauth_provider_token');
	const refresh_token_value = cookies.get('oauth_provider_refresh_token');

	// If we have an access token, try the request first.
	if (access_token) {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${access_token}`,
				'Client-Id': PUBLIC_TWITCH_CLIENT_ID
			}
		});

		// If the request was successful, we're done.
		if (response.ok) {
			return response;
		}

		// If the error was anything other than 401 Unauthorized, it's a real error.
		if (response.status !== 401) {
			const error_text = await response.text();
			console.error('Twitch API Error (non-401):', error_text);
			throw error(response.status, `Twitch API Error: ${error_text}`);
		}
	}

	// If we're here, the token was either missing or expired. We must have a refresh token.
	if (!refresh_token_value) {
		throw error(401, 'Authentication required: No refresh token available.');
	}

	// Attempt to refresh the token
	const new_tokens = await refresh_access_token(refresh_token_value);

	if (!new_tokens) {
		// If refresh fails, clear the bad cookies and force re-authentication.
		cookies.delete('oauth_provider_token', { path: '/' });
		cookies.delete('oauth_provider_refresh_token', { path: '/' });
		throw error(401, 'Failed to refresh authentication token. Please log in again.');
	}

	// Update the cookies with the new, valid token(s).
	cookies.set('oauth_provider_token', new_tokens.access_token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: new_tokens.expires_in
	});

	// Twitch sometimes issues a new refresh token during the refresh process.
	if (new_tokens.new_refresh_token) {
		cookies.set('oauth_provider_refresh_token', new_tokens.new_refresh_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});
	}

	// Retry the original API request with the new token.
	const second_response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${new_tokens.access_token}`,
			'Client-Id': PUBLIC_TWITCH_CLIENT_ID
		}
	});

	if (!second_response.ok) {
		const error_text = await second_response.text();
		console.error('Twitch API Error (after refresh):', error_text);
		throw error(second_response.status, `Twitch API Error after token refresh: ${error_text}`);
	}

	return second_response;
}
