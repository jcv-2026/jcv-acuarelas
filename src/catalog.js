export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function filterWorks(works, {query = '', family = '', year = '', sort = 'curated', favorites = null, featuredIds = [], locale = 'es'} = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const ranked = new Map(featuredIds.map((id, i) => [id, i]));
  return works.filter(w => (!family || w.family === family) && (!year || w.year === year) && (!favorites || favorites.has(w.id)) && terms.every(t => normalize([w.id, w.title, w.family, w.cycle, w.year, w.searchText].join(' ')).includes(t))).sort((a,b) => {
    if (sort === 'title') return a.title.localeCompare(b.title, locale);
    if (sort === 'oldest') return (a.date || '9999').localeCompare(b.date || '9999') || a.id.localeCompare(b.id);
    if (sort === 'recent') return (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id);
    return (ranked.get(a.id) ?? Infinity) - (ranked.get(b.id) ?? Infinity) || (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id);
  });
}
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseFavorites(raw, validIds) {
  try { const ids = JSON.parse(raw); return new Set(Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && validIds.has(id)) : []); } catch { return new Set(); }
}
