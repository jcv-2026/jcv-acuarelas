import {messages} from './translations.js';
import {editorialMessages} from './editorial-translations.js';
import {artworkTitles} from './artwork-translations.js';
import {artworkNote} from './editorial.js';

const dictionary = {...messages, ...editorialMessages};
export const getLanguage = () => globalThis.document?.documentElement.lang || 'es';
export function t(source, values = {}, language = getLanguage()) {
  const index = {en: 0, it: 1}[language];
  const text = index === undefined ? source : dictionary[source]?.[index] ?? source;
  return String(text ?? '').replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}
export function translateCycle(cycle, language = getLanguage()) {
  return String(cycle || '').split(' · ').map(part => t(part, {}, language)).join(' · ');
}
export function localizeWork(work, language = getLanguage()) {
  const index = {en: 0, it: 1}[language];
  return {
    ...work,
    title: index === undefined ? work.title : artworkTitles[work.id]?.[index] ?? work.title,
    technique: t(work.technique, {}, language),
    cycle: translateCycle(work.cycle, language),
    notes: t(artworkNote(work), {}, language),
    // Search accepts the displayed language and the original catalogue wording.
    searchText: [work.title, work.cycle, ...(artworkTitles[work.id] || []), t(work.family, {}, 'en'), t(work.family, {}, 'it'), translateCycle(work.cycle, 'en'), translateCycle(work.cycle, 'it')].join(' '),
  };
}
export function translateStatic() {
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  for (const attribute of ['aria-label', 'content']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
    });
  }
}
if (globalThis.document) {
  translateStatic();
  window.addEventListener('languagechange-preference', translateStatic);
}
