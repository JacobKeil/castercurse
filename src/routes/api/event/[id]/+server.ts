// import { db } from '$lib/util/database';
import { json } from '@sveltejs/kit';

export async function GET({ request, url }) {
  return json({
    teams: [
      
    ],
    picked_channels: ["playapex"]
  });
}
