import type { Channel } from "$lib/types";
import { derived, get, writable } from "svelte/store";

export const MAX_CHANNELS = 9;
export const MAX_LAYOUTS = 3;

export const channels = writable<Channel[]>([]);
export const layout = writable<number>(0);
export const channels_order = writable<string[]>([]);

export const render_source = writable<boolean>(false);
export const current_stream = writable<Channel | null>(null);
export const stream_manager_open = writable(false);

const current_stream_in_list = derived(
  [channels, current_stream], ([$channels, $current_stream]) => {
    if ($current_stream === null) {
      return false;
    }
    return $channels.some(ch => ch.id === $current_stream.id);
  }
)

export function un_mute(channel: Channel) {
  const chs = get(channels);
  if (channel.muted && channel.un_mute && channel.play) {
    channel.un_mute();
    if (channel.hidden) {
      channel.hidden = false;
      channel.play();
    }
    chs.forEach((ch) => {
      if (ch.id !== channel.id) {
        if (ch.mute) {
          ch.mute();
        }
      }
    });
  }
}

export function toggle_mute(channel: Channel) {
  const chs = get(channels);
  if (channel.muted && channel.un_mute && channel.play) {
    channel.un_mute();
    if (channel.hidden) {
      channel.hidden = false;
      channel.play();
    }
    chs.forEach((ch) => {
      if (ch.id !== channel.id) {
        if (ch.mute) {
          ch.mute();
        }
      }
    });
  } else if (!channel.muted && channel.mute) {
    channel.mute()
  }
}
  
export function toggle_hidden(channel: Channel) {
  const chs = get(channels);
  if (!channel.hidden && channel.mute && channel.pause) {
    channel.muted = true;
    channel.mute();
    channel.pause();

    const stream = get(current_stream);

    if (stream !== null && channel.id === stream.id) {
      current_stream.set(null);
    }
  } else if (channel.hidden && channel.play) {
    channel.play();
  }

  channels.set(
    chs.map(ch =>
      ch.id === channel.id
        ? { ...ch, hidden: !ch.hidden }
        : ch
    )
  )
}

export function unhide_all() {
  const chs = get(channels);
  chs.forEach(ch => {
    if (ch.hidden && ch.play) {
      ch.hidden = false;
      ch.play();
    }
  })
  channels.set(chs);
}

current_stream_in_list.subscribe(is_still_there => {
  if (!is_still_there) {
    current_stream.set(null);
  }
})