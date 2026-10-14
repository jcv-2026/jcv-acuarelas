const key = 'jcv-large-text-v1';

function applyPreference(large) {
  document.documentElement.classList.toggle('large-text', large);
  document.querySelector('#text-size')?.setAttribute('aria-pressed', String(large));
}

try { applyPreference(localStorage.getItem(key) === 'true'); } catch {}

document.addEventListener('DOMContentLoaded', () => {
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
