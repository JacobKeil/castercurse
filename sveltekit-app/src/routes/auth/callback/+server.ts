import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const {
    url,
    locals,
    cookies
  } = event;
  const code = url.searchParams.get('code') as string;
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const provider_token = data.session.provider_token;
      const provider_refresh_token = data.session.provider_refresh_token;

      if (provider_token) {
        cookies.set('oauth_provider_token', provider_token, {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 3600
        });
      }

      if (provider_refresh_token) {
        cookies.set('oauth_provider_refresh_token', provider_refresh_token, {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30
        });
      }

      throw redirect(303, `/${next.slice(1)}?redirect=true`);
    }
  }

  throw redirect(303, '/auth/auth-code-error');
};
