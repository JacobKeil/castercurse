import type { EventWithChannelsLive } from "$lib/types";
import { writable } from "svelte/store";

export const current_event = writable<EventWithChannelsLive | null>(null);