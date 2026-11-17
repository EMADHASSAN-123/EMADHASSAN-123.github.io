/** Pause the ambient background animation while the page is not visible. */
export {};

const svg = document.querySelector<SVGSVGElement>('.ambient svg');
if (svg) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) svg.pauseAnimations();
    else svg.unpauseAnimations();
  });
}
