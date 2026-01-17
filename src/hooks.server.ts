import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase_handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session ?? null;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const auth_guard: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const needsAuth = pathname.startsWith('/organize') || pathname.startsWith('/api/followed');

	if (needsAuth) {
		const session = await event.locals.getSession();
		event.locals.session = session;
		event.locals.user = session?.user ?? null;
	} else {
		event.locals.session = null;
		event.locals.user = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase_handle, auth_guard);
