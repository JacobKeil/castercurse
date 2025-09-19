// src/routes/+layout.server.ts  (server side: fetch session once)
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	return { session: data.session };
};
// export const load: LayoutLoad = async ({ data, depends, fetch }) => {
//   depends('supabase:auth')

//   const supabase = isBrowser()
//     ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
//         global: {
//           fetch,
//         },
//       })
//     : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
//         global: {
//           fetch,
//         },
//         cookies: {
//           getAll() {
//             return data.cookies
//           },
//         },
//       })

//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   return { supabase, session, user }
// }
