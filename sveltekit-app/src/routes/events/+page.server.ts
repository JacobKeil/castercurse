import { db } from "$lib/server/database";
import moment from "moment";

export const load = async ({ locals }) => {
  const event_team_count = await db.event.findMany({
    select: {
      id: true,
      name: true,
      start_date: true,
      end_date: true,
      logo_url: true,
      created_by: true,
      _count: {
        select: {
          teams: true
        }
      }
    }
  });

  // Query to get the count of players for each event
  const event_player_count = await db.event.findMany({
    select: {
      id: true,
      teams: {
        select: {
          _count: {
            select: {
              channels: true
            }
          }
        }
      }
    }
  });

  const live_events = event_team_count.map(event => {
    const player_count = event_player_count.find(e => e.id === event.id)?.teams.reduce((acc, team) => acc + team._count.channels, 0) || 0;
    if (moment().isBetween(event.start_date, event.end_date)) {
      return {
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        logo_url: event.logo_url,
        created_by: event.created_by,
        team_count: event._count.teams,
        player_count: player_count
      };
    }
    return null;
  }).filter(event => event !== null);

  const upcoming_events = event_team_count.map(event => {
    const player_count = event_player_count.find(e => e.id === event.id)?.teams.reduce((acc, team) => acc + team._count.channels, 0) || 0;
    if (moment(event.start_date).isAfter(moment())) {
      return {
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        logo_url: event.logo_url,
        created_by: event.created_by,
        team_count: event._count.teams,
        player_count: player_count
      };
    }
    return null;
  }).filter(event => event !== null);

  const completed_events = event_team_count.map(event => {
    const player_count = event_player_count.find(e => e.id === event.id)?.teams.reduce((acc, team) => acc + team._count.channels, 0) || 0;
    if (moment(event.end_date).isBefore(moment())) {
      return {
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        logo_url: event.logo_url,
        created_by: event.created_by,
        team_count: event._count.teams,
        player_count: player_count
      };
    }
    return null;
  }).filter(event => event !== null);

  return { live_events, upcoming_events, completed_events };
};