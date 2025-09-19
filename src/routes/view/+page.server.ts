import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session }, cookies }) => {
	return {
		session,
		cookies: cookies.getAll()
	};
};
