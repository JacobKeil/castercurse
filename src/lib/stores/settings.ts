// src/lib/stores/settings.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Settings = {
  controls: boolean;
  sidebar_top: boolean;
  open_chat: boolean;
  middle_click_hide: boolean;
};

export const default_settings: Settings = {
  controls: true,
  sidebar_top: true,
  open_chat: false,
  middle_click_hide: false
};

const storage_key = 'settings';

function load_from_storage(): Settings | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(storage_key);
    return raw ? JSON.parse(raw) as Settings : null;
  } catch {
    return null;
  }
}

const initial_settings = load_from_storage() ?? default_settings;
export const settings = writable<Settings>(initial_settings);

if (browser) {
  let ready = false;
  queueMicrotask(() => { ready = true; });
  settings.subscribe((val) => {
    if (!ready) return;
    try {
      localStorage.setItem(storage_key, JSON.stringify(val));
    } catch {
      /* ignore quota/denied */
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === storage_key && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as Settings;
        settings.set({ ...default_settings, ...parsed });
      } catch {}
    }
  });
}
