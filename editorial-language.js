// Shared language preference for the small editorial pages.
export function applyLanguage(lang) {
  const selected = lang === 'es' ? 'es' : 'en';
  document.documentElement.lang = selected;
  try { localStorage.setItem('portfolio-language', selected); } catch {}
  document.querySelectorAll('[data-en][data-es]').forEach(el => {
    el.textContent = el.dataset[selected];
  });
  document.querySelectorAll('[data-en-label][data-es-label]').forEach(el => {
    el.setAttribute('aria-label', selected === 'es' ? el.dataset.esLabel : el.dataset.enLabel);
  });
  document.querySelectorAll('[data-en-alt][data-es-alt]').forEach(el => {
    el.alt = selected === 'es' ? el.dataset.esAlt : el.dataset.enAlt;
  });
  document.querySelectorAll('[data-en-content][data-es-content]').forEach(el => {
    el.content = selected === 'es' ? el.dataset.esContent : el.dataset.enContent;
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === selected));
  });
  window.dispatchEvent(new CustomEvent('portfolio-language-change', { detail: selected }));
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.language)));
let preference = 'en';
try { preference = localStorage.getItem('portfolio-language') || 'en'; } catch {}
applyLanguage(preference);
