/**
 * Types the hero statement like a command entered at a terminal prompt.
 * The full sentence is always in the DOM: screen readers get it from a
 * visually hidden copy, and a hidden "ghost" copy reserves the final size
 * so nothing shifts while typing. Skipped under prefers-reduced-motion.
 */
export {};

const prompt = document.querySelector<HTMLElement>('[data-typewriter]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const segmenter =
  'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

// Graphemes keep Arabic diacritics (e.g. kasra) attached to their letter.
const graphemes = (text: string): string[] =>
  segmenter ? Array.from(segmenter.segment(text), (part) => part.segment) : Array.from(text);

// Uneven key intervals read as a person typing; punctuation gets a short pause.
const delayAfter = (char: string): number => (/[،,;؛.]/.test(char) ? 260 : 28 + Math.random() * 42);

let timer = 0;

function type(): void {
  if (!prompt) return;
  window.clearTimeout(timer);

  if (reducedMotion.matches) {
    prompt.removeAttribute('data-typing');
    return;
  }

  const locale = document.documentElement.getAttribute('lang');
  const line = prompt.querySelector<HTMLElement>(`.prompt__line[data-lang="${locale}"]`);
  const typed = line?.querySelector<HTMLElement>('.prompt__typed');
  const text = line?.querySelector('.prompt__ghost')?.textContent?.trim() ?? '';
  if (!typed || !text) return;

  const chars = graphemes(text);
  let index = 0;
  typed.textContent = '';
  prompt.setAttribute('data-typing', '');
  prompt.removeAttribute('data-done');

  const step = (): void => {
    typed.textContent += chars[index] ?? '';
    index += 1;
    if (index < chars.length) {
      timer = window.setTimeout(step, delayAfter(chars[index - 1] ?? ''));
    } else {
      prompt.setAttribute('data-done', '');
    }
  };

  timer = window.setTimeout(step, 450);
}

if (prompt) {
  type();
  // Retype in the new language when the visitor switches locale.
  new MutationObserver(type).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
  reducedMotion.addEventListener('change', type);
}
