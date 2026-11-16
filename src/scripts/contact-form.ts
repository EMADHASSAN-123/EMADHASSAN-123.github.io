/**
 * Contact form: inline validation (on blur and submit), honeypot and
 * submission to the contact-submit Edge Function.
 */
import { validateContactField, type ContactField } from '@/lib/contact';
import { currentLocale } from '@/scripts/language-toggle';

type Messages = Record<string, string>;

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const dataBlock = document.getElementById('contact-messages');

if (form && dataBlock) {
  const allMessages = JSON.parse(dataBlock.textContent ?? '{}') as Record<string, Messages>;
  const msg = (k: string) => allMessages[currentLocale()]?.[k] ?? '';
  const statusEl = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const fields: ContactField[] = ['name', 'email', 'subject', 'message'];
  const control = (f: ContactField) =>
    form.elements.namedItem(f) as HTMLInputElement | HTMLTextAreaElement;

  const showError = (field: ContactField): boolean => {
    const el = control(field);
    const error = validateContactField(field, el.value);
    const out = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`)!;
    const text =
      error === null ? '' : error === 'required' ? msg('errors.required') : msg(`errors.${field}`);
    out.textContent = text;
    el.setAttribute('aria-invalid', String(error !== null));
    return error === null;
  };

  const setStatus = (key: string, tone: 'info' | 'success' | 'error') => {
    statusEl.textContent = key ? msg(key) : '';
    statusEl.dataset.tone = tone;
  };

  fields.forEach((f) => {
    const el = control(f);
    el.addEventListener('blur', () => el.value && showError(f));
    el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && showError(f));
  });

  // Re-render visible messages in the new language.
  document.addEventListener('localechange', () => {
    fields.forEach((f) => control(f).getAttribute('aria-invalid') === 'true' && showError(f));
    setStatus('', 'info');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const results = fields.map(showError);
    const firstInvalid = fields.find((_, i) => !results[i]);
    if (firstInvalid) {
      setStatus('status.invalid', 'error');
      control(firstInvalid).focus();
      return;
    }

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus('status.notConnected', 'info');
      return;
    }

    const payload = {
      ...Object.fromEntries(fields.map((f) => [f, control(f).value.trim()])),
      locale: currentLocale(),
      honeypot: (form.elements.namedItem('website') as HTMLInputElement).value,
    };

    submitBtn.disabled = true;
    submitBtn.dataset.busy = 'true';
    setStatus('sending', 'info');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        setStatus('status.success', 'success');
      } else if (response.status === 429) {
        setStatus('status.rateLimited', 'error');
      } else if (response.status === 400) {
        setStatus('status.invalid', 'error');
      } else {
        setStatus('status.failed', 'error');
      }
    } catch {
      setStatus('status.failed', 'error');
    } finally {
      submitBtn.disabled = false;
      delete submitBtn.dataset.busy;
    }
  });
}
