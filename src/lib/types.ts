import type { EventLink, EventStatus, Prisma, User } from '@prisma/client';
import type { Channel as PrismaChannel } from '@prisma/client';

export type ChannelWithLive = PrismaChannel & {
	is_live: boolean;
};

export interface Channel {
	id: string;
	handle: string;
	muted: boolean;
	hidden: boolean;
	paused: boolean;
	volume: number;
	mute?: () => void;
	un_mute?: () => void;
	pause?: () => void;
	play?: () => void;
	get_volume?: () => number;
	set_volume?: (value: number) => void;
	get_quality?: () => string;
	set_quality?: (value: 'auto' | 'chunked') => void;
	ended?: () => boolean;
}

export type EventManager = {
	id: string;
	name: string;
	start_date: Date;
	logo_url: string | null;
	created_by: {
		id: string;
		handle: string;
		display_name: string;
		created_at: Date;
		updated_at: Date;
	};
	team_count: number;
	player_count: number;
};

export type EventWithRelations = Prisma.EventGetPayload<{
	include: {
		main_broadcast: true;
		watch_parties: true;
		teams: {
			include: {
				created_by: true;
				channels: true;
				region: true;
			};
		};
		created_by: true;
		links: true;
		status: true;
	};
}>;

export type ChannelWithRelations = Prisma.ChannelGetPayload<{
	include: {
		created_by: true;
		team: true;
	};
}>;

export type TeamWithRelations = Prisma.TeamGetPayload<{
	include: {
		created_by: true;
		channels: true;
		region: true;
	};
}>;

export type TeamWithChannelsLive = Prisma.TeamGetPayload<{
	select: {
		id: true;
		name: true;
		callsign: true;
		logo_url: true;
		region_id: true;
		created_by_id: true;
		created_at: true;
		updated_at: true;
	};
}> & {
	// Now explicitly define the relations with their desired types
	created_by: Prisma.UserGetPayload<{}>; // Using base Prisma User type
	region: Prisma.RegionGetPayload<{}>; // Using base Prisma Region type
	channels: ChannelWithLive[]; // <-- The channels are now of ChannelWithLive type
};

export type EventWithChannelsLive = Prisma.EventGetPayload<{
	// Select all scalar fields of the Event model
	select: {
		id: true;
		name: true;
		max_teams: true;
		logo_url: true;
		start_date: true;
		end_date: true;
		main_broadcast_id: true;
		status_id: true;
		created_by_id: true;
		created_at: true;
		updated_at: true;
	};
}> & {
	// Now explicitly define the relations with their desired (potentially transformed) types
	main_broadcast: PrismaChannel | null;
	watch_parties: PrismaChannel[];
	teams: TeamWithChannelsLive[]; // <-- Here we use the transformed Team type
	created_by: User;
	links: EventLink[];
	status: EventStatus;
};

export interface CreateActionResult {
	status: 'success' | 'error' | 'info';
	action: 'create' | 'update' | 'delete';
	message: string;
	name: string;
}
