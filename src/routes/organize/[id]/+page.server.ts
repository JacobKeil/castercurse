import { db } from '$lib/server/database'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, params, locals }) => {
  const event = await db.event.findFirst({
    where: {
      id: params.id
    },
    include: {
      main_broadcast: true,
      watch_parties: true,
      teams: {
        orderBy: {
          created_at: 'asc'
        },
        include: {
          created_by: true,
          channels: true,
          region: true
        }
      },
      created_by: true,
      links: true,
      status: true
    }
  })

  if (locals.user?.user_metadata.name !== event?.created_by.handle) {
    return error(401, "Access denied")
  }

  return {
    cookies: cookies.getAll(),
    event
  }
}