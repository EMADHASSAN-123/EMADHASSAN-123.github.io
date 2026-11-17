/**
 * Draws the hero's twisted-pair cables from each hub port to its domain,
 * using real element positions (works in RTL/LTR and every breakpoint).
 * Each cable = a colored core plus a dashed white stripe (the "white/color"
 * twisted partner). Hover/focus on a domain sends one signal pulse along its
 * cable. A one-time link-up sequence lights the port LEDs (skipped under
 * prefers-reduced-motion).
 */
export {};

const SVG_NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const hero = document.querySelector<HTMLElement>('[data-hero]');
const svg = hero?.querySelector<SVGSVGElement>('[data-cables]');

function edge(el: Element, origin: DOMRect, side: 'start' | 'end', dy?: number): [number, number] {
  const r = el.getBoundingClientRect();
  const rtl = document.documentElement.dir === 'rtl';
  const atLeft = (side === 'start') !== rtl;
  return [(atLeft ? r.left : r.right) - origin.left, r.top + (dy ?? r.height / 2) - origin.top];
}

function draw(): void {
  if (!hero || !svg) return;
  svg.replaceChildren();
  // Stacked layout (< 1024px): no cables; pair colors on the domains carry the link.
  if (window.matchMedia('(max-width: 1023px)').matches) return;
  const origin = hero.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);

  hero.querySelectorAll<HTMLElement>('[data-port]').forEach((port) => {
    const id = port.dataset.port!;
    const plug = hero.querySelector<HTMLElement>(`[data-plug="${id}"]`);
    if (!plug) return;
    // From the port's outer edge to the domain's inner edge, level with its title.
    const [x1, y1] = edge(port, origin, 'end');
    const [x2, y2] = edge(plug, origin, 'start', 30);
    const dx = (x2 - x1) * 0.5;
    const d = `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'cable');
    group.setAttribute('data-pair', port.dataset.pair ?? '');
    group.setAttribute('data-cable', id);
    for (const part of ['cable__core', 'cable__stripe', 'cable__signal']) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', part);
      if (part === 'cable__signal') path.setAttribute('pathLength', '100');
      group.append(path);
    }
    svg.append(group);
  });
}

function pulse(id: string): void {
  if (reducedMotion.matches || !svg) return;
  const signal = svg.querySelector<SVGPathElement>(`[data-cable="${id}"] .cable__signal`);
  if (!signal) return;
  signal.classList.remove('is-sending');
  void signal.getBoundingClientRect(); // restart the transition
  signal.classList.add('is-sending');
}

if (hero && svg) {
  draw();
  new ResizeObserver(draw).observe(hero);
  new MutationObserver(draw).observe(document.documentElement, { attributeFilter: ['dir'] });
  document.fonts?.ready.then(draw);

  hero.querySelectorAll<HTMLElement>('[data-plug]').forEach((domain) => {
    const id = domain.dataset.plug!;
    const activate = () => {
      hero.querySelector(`[data-port="${id}"]`)?.classList.add('is-active');
      domain.classList.add('is-active');
      pulse(id);
    };
    const deactivate = () => {
      hero.querySelector(`[data-port="${id}"]`)?.classList.remove('is-active');
      domain.classList.remove('is-active');
    };
    domain.addEventListener('pointerenter', activate);
    domain.addEventListener('pointerleave', deactivate);
    domain.addEventListener('focusin', activate);
    domain.addEventListener('focusout', deactivate);
  });

  // One-time link-up: LEDs go amber (negotiating) then green (link up).
  if (!reducedMotion.matches) {
    hero.dataset.link = 'negotiating';
    window.setTimeout(() => (hero.dataset.link = 'up'), 650);
  } else {
    hero.dataset.link = 'up';
  }
}
