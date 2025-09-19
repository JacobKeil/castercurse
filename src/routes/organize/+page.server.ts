import { db } from '$lib/server/database';
import type { CreateActionResult } from '$lib/types';
import { error } from '@sveltejs/kit';
import moment from 'moment';

export const load = async ({ locals }) => {
	if (!locals.user) {
		return error(200, 'Login to organize events!');
	}

	const now = new Date();

	const rows = await db.event.findMany({
		where: {
			created_by: {
				handle: locals.user?.user_metadata.name
			},
			end_date: { gte: now } // not completed (still live or upcoming)
			// If you prefer status instead of dates, use this instead (or in addition):
			// status: { name: { not: 'Completed' } }
		},
		select: {
			id: true,
			name: true,
			start_date: true,
			end_date: true,
			logo_url: true,
			created_by: true,
			_count: { select: { teams: true } },
			teams: {
				select: {
					_count: { select: { channels: true } }
				}
			},
			status: true
		},
		orderBy: { start_date: 'asc' }
	});

	const events = rows.map((e) => ({
		id: e.id,
		name: e.name,
		start_date: e.start_date,
		status: e.status.name,
		end_date: e.end_date,
		logo_url: e.logo_url,
		created_by: e.created_by,
		team_count: e._count.teams,
		// Sum the channels across all teams in this event
		player_count: e.teams.reduce((acc, t) => acc + t._count.channels, 0)
	}));

	return { user: locals.user, events };
};

export const actions = {
	create: async ({ request, locals }): Promise<CreateActionResult> => {
		const { data } = Object.fromEntries(await request.formData()) as {
			data: string;
		};

		let form_data: any = JSON.parse(data);
		console.log({ form_data, user: locals.user });
		console.log(
			`${moment(form_data.start_date).format('YYYY-MM-DD')}T${form_data.start_time}:00.000Z`
		);

		try {
			// await db.event.create({
			//   data: {
			//     name: form_data.name,
			//     start_date: `${form_data.start_date}T${form_data.end_date}Z`,
			//     end_date: ,
			//   }
			// });

			return {
				status: 'success',
				action: 'create',
				message: 'Event Created',
				name: form_data.name
			};
		} catch (error) {
			console.log({ timestamp: moment().format(), source: 'ORGANIZE', error });
			return {
				status: 'error',
				action: 'create',
				message: 'Event Creation Failed',
				name: form_data.name
			};
		}
	}
};
