// Applied in the head so the first paint already follows the device theme.
(() => {
  const keys = {language: 'jcv-language-v1', theme: 'jcv-theme-v1', large: 'jcv-large-text-v1'};
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const valid = (value, choices, fallback) => choices.includes(value) ? value : fallback;
  const browserLanguage = () => {
    for (const candidate of navigator.languages?.length ? navigator.languages : [navigator.language]) {
      const base = candidate?.toLowerCase().split(/[-_]/)[0];
      if (['es', 'en', 'it'].includes(base)) return base;
    }
    return 'es';
  };
  const deviceTheme = matchMedia('(prefers-color-scheme: dark)');
  let language = valid(read(keys.language), ['auto', 'es', 'en', 'it'], 'auto');
  let theme = valid(read(keys.theme), ['system', 'light', 'dark'], 'system');
  let large = read(keys.large) === 'true';
  function apply() {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language === 'auto' ? browserLanguage() : language;
    const resolvedTheme = theme === 'system' ? (deviceTheme.matches ? 'dark' : 'light') : theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.documentElement.classList.toggle('large-text', large);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#191f1c' : '#f7f5ef');
    const select = document.querySelector('#language');
    if (select) select.value = language;
    document.querySelectorAll('[name="theme"]').forEach(radio => { radio.checked = radio.value === theme; });
    document.querySelector('#text-size')?.setAttribute('aria-pressed', String(large));
    if (previousLanguage !== document.documentElement.lang) window.dispatchEvent(new Event('languagechange-preference'));
  }
  apply();
  deviceTheme.addEventListener('change', () => { if (theme === 'system') apply(); });
  window.addEventListener('languagechange', () => { if (language === 'auto') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === keys.language || event.key === null) language = valid(read(keys.language), ['auto', 'es', 'en', 'it'], 'auto');
    if (event.key === keys.theme || event.key === null) theme = valid(read(keys.theme), ['system', 'light', 'dark'], 'system');
    if (event.key === keys.large || event.key === null) large = read(keys.large) === 'true';
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const menu = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('#main-navigation');
    const mobile = matchMedia('(max-width: 800px)');
    const toggle = document.querySelector('#preferences-toggle');
    const panel = document.querySelector('#preferences-panel');
    const container = document.querySelector('.preferences');
    function closePreferences(restoreFocus = false) {
      if (panel.hidden) return;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus || panel.contains(document.activeElement)) toggle.focus({preventScroll: true});
    }
    function closeMenu() {
      header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', () => {
      const open = panel.hidden; closeMenu(); panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', () => {
      closePreferences(); const open = header.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a') && mobile.matches) { closeMenu(); menu.focus({preventScroll: true}); }
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!panel.hidden) { closePreferences(true); event.preventDefault(); }
      if (header.classList.contains('menu-open')) { closeMenu(); menu.focus({preventScroll: true}); }
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) closeMenu();
      if (!container.contains(event.target)) closePreferences();
    });
    document.addEventListener('focusin', event => { if (!container.contains(event.target)) closePreferences(); });
    window.addEventListener('hashchange', () => { closeMenu(); closePreferences(); });
    mobile.addEventListener('change', () => {
      if (mobile.matches && navigation.contains(document.activeElement)) menu.focus({preventScroll: true});
      closeMenu(); closePreferences();
    });
    document.querySelector('#language').addEventListener('change', event => {
      language = valid(event.target.value, ['auto', 'es', 'en', 'it'], 'auto');
      write(keys.language, language); apply();
    });
    document.querySelectorAll('[name="theme"]').forEach(radio => radio.addEventListener('change', event => {
      theme = valid(event.target.value, ['system', 'light', 'dark'], 'system');
      write(keys.theme, theme); apply();
    }));
    document.querySelector('#text-size').addEventListener('click', () => {
      large = !large; write(keys.large, String(large)); apply();
    });
    apply();
  });
})();
