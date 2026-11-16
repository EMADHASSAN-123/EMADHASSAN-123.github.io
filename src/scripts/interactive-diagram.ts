/**
 * Interactive diagram behaviour:
 * - progressive reveal when the diagram enters the viewport (one-time,
 *   about 1.2s in total; instant under prefers-reduced-motion)
 * - hover/focus highlights a node and its connected edges
 * - click / Enter / Space selects a node and shows its role in the panel
 */
const STEP_DELAY_MS = 70;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-diagram]').forEach((diagram) => {
  const svg = diagram.querySelector('svg');
  if (!svg) return;

  const nodes = [...svg.querySelectorAll<SVGGElement>('[data-node]')];
  const edges = [...svg.querySelectorAll<SVGGElement>('[data-from]')];
  const hint = diagram.querySelector<HTMLElement>('[data-panel-hint]');
  const details = [...diagram.querySelectorAll<HTMLElement>('[data-panel]')];

  // ----- Progressive reveal -----
  if (!reducedMotion && 'IntersectionObserver' in window) {
    svg.querySelectorAll<SVGElement>('[data-step]').forEach((el) => {
      el.style.setProperty('--step-delay', `${Number(el.dataset.step) * STEP_DELAY_MS}ms`);
    });
    diagram.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          diagram.dataset.reveal = 'done';
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(svg);
  }

  // ----- Highlight connected edges -----
  const highlight = (id: string | null) => {
    edges.forEach((edge) => {
      const connected = id !== null && (edge.dataset.from === id || edge.dataset.to === id);
      edge.classList.toggle('is-connected', connected);
    });
  };

  // ----- Selection -----
  let selected: string | null = null;
  const select = (id: string) => {
    selected = id;
    nodes.forEach((node) => {
      const active = node.dataset.node === id;
      node.classList.toggle('is-selected', active);
      node.setAttribute('aria-pressed', String(active));
    });
    details.forEach((detail) => (detail.hidden = detail.dataset.panel !== id));
    if (hint) hint.hidden = true;
    highlight(id);
  };

  nodes.forEach((node) => {
    const id = node.dataset.node!;
    node.addEventListener('click', () => select(id));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(id);
      }
    });
    node.addEventListener('pointerenter', () => highlight(id));
    node.addEventListener('pointerleave', () => highlight(selected));
    node.addEventListener('focus', () => highlight(id));
    node.addEventListener('blur', () => highlight(selected));
  });
});
