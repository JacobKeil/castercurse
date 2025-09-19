import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function GET({ request, url, locals }) {
	let items = await db.eventStatus.findMany();

	return json({
		data: items.map((item) => ({
			label: item.name,
			value: item.name
		}))
	});
}
