import { db } from '$lib/server/database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { session }, cookies, params }) => {
  const event = await db.event.findFirst({
    where: {
      id: params.id
    },
    include: {
      main_broadcast: true,
      watch_parties: true,
      teams: {
        orderBy: {
          name: 'asc'
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

  return {
    session,
    cookies: cookies.getAll(),
    event
  }
}