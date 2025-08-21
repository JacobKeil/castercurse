import { writable } from "svelte/store";

export const settings = writable({
  controls: true,
  sidebar_top: true,
  open_chat: false,
  middle_click_hide: false
});

export const default_settings = {
  controls: true,
  sidebar_top: true,
  open_chat: false,
  middle_click_hide: false
}