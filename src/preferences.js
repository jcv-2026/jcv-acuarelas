const key = 'jcv-large-text-v1';

function applyPreference(large) {
  document.documentElement.classList.toggle('large-text', large);
  document.querySelector('#text-size')?.setAttribute('aria-pressed', String(large));
}

try { applyPreference(localStorage.getItem(key) === 'true'); } catch {}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-navigation');
  const mobile = matchMedia('(max-width: 800px)');
  function closeMenu() {
    header.classList.remove('menu-open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) {
      closeMenu();
      // The current route does not fire hashchange; keep focus on a visible control.
      menu.focus({preventScroll: true});
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      closeMenu();
      menu.focus({preventScroll: true});
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  window.addEventListener('hashchange', closeMenu);
  mobile.addEventListener('change', () => {
    if (mobile.matches && navigation.contains(document.activeElement)) menu.focus({preventScroll: true});
    closeMenu();
  });
  const button = document.querySelector('#text-size');
  applyPreference(document.documentElement.classList.contains('large-text'));
  button.addEventListener('click', () => {
    const large = !document.documentElement.classList.contains('large-text');
    applyPreference(large);
    try { localStorage.setItem(key, String(large)); } catch {}
  });
});

window.addEventListener('storage', event => {
  if (event.key === key || event.key === null) applyPreference(event.newValue === 'true');
});
