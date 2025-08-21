// @ts-nocheck
import type { PageServerLoad } from './$types'

export const load = async ({ locals: { session }, cookies }: Parameters<PageServerLoad>[0]) => {
  return {
    session,
    cookies: cookies.getAll(),
  }
}