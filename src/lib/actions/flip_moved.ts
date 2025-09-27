// src/lib/actions/flipMoved.ts
type HTMLElementWithStyle = HTMLElement & { style: CSSStyleDeclaration };

export type FlipOptions = {
  /** CSS selector to pick the children you want to animate. Default: '[data-flip-id]' */
  selector?: string;
  /** How long the transform animation should last (ms). Default: 150 */
  duration?: number;
  /** Easing for the transform animation. Default: 'ease' */
  easing?: string;
};

type Rect = { left: number; top: number; width: number; height: number };

export function flipMoved(
  node: HTMLElement,
  opts: FlipOptions = {}
) {
  const selector = opts.selector ?? '[data-flip-id]';
  const duration = opts.duration ?? 150;
  const easing = opts.easing ?? 'ease';

  let raf = 0;
  const prev = new Map<string, Rect>();

  function measure(el: HTMLElement): Rect {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function tick() {
    // Read layout
    const els = Array.from(node.querySelectorAll(selector)) as HTMLElement[];
    const next = new Map<string, Rect>();

    for (const el of els) {
      const id = (el.getAttribute('data-flip-id') || '').toString();
      if (!id) continue;

      const now = measure(el);
      next.set(id, now);

      const was = prev.get(id);
      if (!was) continue;

      const dx = was.left - now.left;
      const dy = was.top - now.top;

      if (dx || dy) {
        // FLIP: invert
        const styleEl = el as HTMLElementWithStyle;
        styleEl.style.transform = `translate(${dx}px, ${dy}px)`;
        styleEl.style.transition = 'transform 0s';

        // Force reflow
        // @ts-ignore
        styleEl.offsetWidth;

        // Play
        styleEl.style.transition = `transform ${duration}ms ${easing}`;
        styleEl.style.transform = 'translate(0,0)';

        const done = () => {
          // Clean after the animation finishes
          styleEl.style.transition = '';
          styleEl.removeEventListener('transitionend', done);
        };
        styleEl.addEventListener('transitionend', done);
      }
    }

    // Swap buffers
    prev.clear();
    for (const [k, v] of next) prev.set(k, v);

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      prev.clear();
    }
  };
}
