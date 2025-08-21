interface TypewriterParams {
  speed?: number;
  delay?: number;
}

let phrases = [
    'All your favorite streamers in one location.',
    'Make customized views.',
    'Host events for your community.',
    'View realtime data on your event.',
    'Never miss an important moment.'
];

export default function(node: HTMLElement, { speed = 100, delay = 2000 }: TypewriterParams) {
  let current_phrase_index = 0;
  let current_char_index = 0;
  let is_deleting = false;

  function type() {
      const current_phrase = phrases[current_phrase_index];
      let updated_text = '';

      if (is_deleting) {
          updated_text = current_phrase.substring(0, current_char_index - 1);
          current_char_index--;
      } else {
          updated_text = current_phrase.substring(0, current_char_index + 1);
          current_char_index++;
      }

      node.classList.add('typing');
      node.textContent = updated_text;

      if (!is_deleting && current_char_index === current_phrase.length) {
          is_deleting = true;
          setTimeout(type, delay);
      } else if (is_deleting && current_char_index === 0) {
          is_deleting = false;
          current_phrase_index = (current_phrase_index + 1) % phrases.length;
          setTimeout(type, speed);
      } else {
          setTimeout(type, is_deleting ? speed / 2 : speed);
      }
  }

  type();

  return {
      update(newParams: TypewriterParams) {
          phrases
          speed = newParams.speed ?? speed;
          delay = newParams.delay ?? delay;
      },
      destroy() {
          // Cleanup if necessary
      }
  };
}