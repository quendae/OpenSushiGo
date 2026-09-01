import { getCardArt } from './art.js';

export const CARD_PRESENTATION = Object.freeze({
  cookie_set: { name: 'Zestaw ciasteczek', short: 'Para = 5', category: 'set', icon: 'cookie', description: 'Każda pełna para daje 5 serduszek.' },
  afternoon_set: { name: 'Popołudniowy zestaw', short: 'Trójka = 10', category: 'set', icon: 'tray', description: 'Każda pełna trójka daje 10 serduszek.' },
  sweet_bun: { name: 'Słodka bułeczka', short: '1 · 3 · 6 · 10 · 15', category: 'bun', icon: 'bun', description: 'Kolejne bułeczki są warte coraz więcej.' },
  drink_1: { name: 'Pojedyncza filiżanka', short: '1 popularność', category: 'drink', icon: 'cup', pips: 1, description: 'Jedna ikona w wyścigu popularności.' },
  drink_2: { name: 'Dwa kubki kakao', short: '2 popularność', category: 'drink', icon: 'cup', pips: 2, description: 'Dwie ikony w wyścigu popularności.' },
  drink_3: { name: 'Taca napojów', short: '3 popularność', category: 'drink', icon: 'cup', pips: 3, description: 'Trzy ikony w wyścigu popularności.' },
  bunny_guest: { name: 'Króliczek przy stoliku', short: '1 serduszko', category: 'guest', icon: 'bunny', points: 1, description: 'Sympatyczny gość wart 1 serduszko.' },
  cat_guest: { name: 'Kotek przy stoliku', short: '2 serduszka', category: 'guest', icon: 'cat', points: 2, description: 'Rozmruczany gość wart 2 serduszka.' },
  dog_guest: { name: 'Piesek przy stoliku', short: '3 serduszka', category: 'guest', icon: 'dog', points: 3, description: 'Radosny gość wart 3 serduszka.' },
  adoption_pet: { name: 'Zwierzak do adopcji', short: 'Premia na koniec', category: 'adoption', icon: 'paw', description: 'Najwięcej adopcji daje premię po trzeciej rundzie.' },
  cream_topping: { name: 'Kremowa polewa', short: 'Następny gość ×3', category: 'special', icon: 'cream', description: 'Potraja wartość następnego zagranego gościa.' },
  extra_paws: { name: 'Dodatkowa para łapek', short: 'Wybierz 2 karty', category: 'special', icon: 'paws', description: 'Pozwala w następnej turze wybrać dwie karty.' }
});

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

const ICON_PATHS = {
  'arrow-left': '<path d="m15 18-6-6 6-6M9 12h10"/>',
  'arrow-right': '<path d="m9 18 6-6-6-6m6 6H5"/>',
  book: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5Zm0 0v16M8 7h8m-8 4h6"/>',
  bot: '<rect x="4" y="7" width="16" height="13" rx="4"/><path d="M9 12h.01M15 12h.01M9 16h6M12 7V3m-2 0h4"/>',
  bulb: '<path d="M9 18h6m-5 3h4m4-12a6 6 0 1 0-9.5 4.9A4 4 0 0 1 10 17h4a4 4 0 0 1 1.5-3.1A6 6 0 0 0 18 9Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  crown: '<path d="m3 7 4 4 5-7 5 7 4-4-2 11H5Zm3 14h12"/>',
  door: '<path d="M5 21V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v17M3 21h18M14 12h.01"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  home: '<path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  rotate: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5"/>',
  sound: '<path d="M11 5 6 9H2v6h4l5 4Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/>',
  sparkle: '<path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5Zm7 13 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/>',
  cup: '<path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Zm12 2h2a3 3 0 0 1 0 6h-2M8 4c0 1 1 1 1 2m4-2c0 1 1 1 1 2M3 22h16"/>',
  paw: '<path d="M12 13c-4 0-7 3-7 6 0 2 2 3 4 2 2-1 4-1 6 0 2 1 4 0 4-2 0-3-3-6-7-6ZM6 11c1.5-.3 2.3-2.2 1.8-4S5.7 4 4.2 4.4 2 6.7 2.5 8.5 4.5 11.3 6 11Zm12 0c-1.5-.3-2.3-2.2-1.8-4S18.3 4 19.8 4.4 22 6.7 21.5 8.5 19.5 11.3 18 11ZM11 9c1.5 0 2.7-1.8 2.7-4S12.5 1 11 1 8.3 2.8 8.3 5 9.5 9 11 9Z"/>',
  cookie: '<circle cx="12" cy="12" r="9"/><path d="M8 8h.01M15 7h.01m-2 6h.01m-5 3h.01m8 1h.01"/>',
  tray: '<path d="M3 17h18M6 17a6 6 0 0 1 12 0M12 8V5m-2 0h4"/>',
  bun: '<path d="M4 17c0-6 3-10 8-10s8 4 8 10c0 2-2 3-8 3s-8-1-8-3Zm4-6c2 2 6 2 8 0"/>',
  bunny: '<path d="M9 8C5 4 6 1 8 2c2 1 2 4 2 6m4 0c0-2 0-5 2-6 2-1 3 2-1 6M6 15a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm4-1h.01m4 0h.01M12 16v2"/>',
  cat: '<path d="m5 9 1-6 5 3h2l5-3 1 6v6a7 7 0 0 1-14 0Zm5 4h.01m4 0h.01M12 15v2m-4-1H3m13 0h5"/>',
  dog: '<path d="M6 8C2 5 1 8 3 12l3 2m12-6c4-3 5 0 3 4l-3 2M6 10a6 6 0 0 1 12 0v5a6 6 0 0 1-12 0Zm4 3h.01m4 0h.01M12 15v2"/>',
  cream: '<path d="M6 20h12M8 20c-1-3 0-5 2-6-2-1-2-4 0-5-1-3 1-6 2-7 1 1 3 4 2 7 2 1 2 4 0 5 2 1 3 3 2 6Z"/>',
  paws: '<path d="M8 14c-3 0-5 2-5 4 0 1 2 2 3 1 1-1 3-1 4 0 2 1 3 0 3-1 0-2-2-4-5-4Zm8-7c-3 0-5 2-5 4 0 1 2 2 3 1 1-1 3-1 4 0 2 1 3 0 3-1 0-2-2-4-5-4Z"/>',
  star: '<path d="m12 2 3 6 7 .9-5 4.8 1.3 7-6.3-3.3-6.3 3.3 1.3-7-5-4.8L9 8Z"/>'
};

export function icon(name, className = '') {
  const content = ICON_PATHS[name] || ICON_PATHS.sparkle;
  return `<svg class="ui-icon ${escapeHTML(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
}

function resolveCardType(card) { return typeof card === 'string' ? card : card?.type; }

export function createCard(card, options = {}) {
  const type = resolveCardType(card);
  const meta = CARD_PRESENTATION[type] || { name: 'Tajemnicza karta', short: 'Nieznany efekt', category: 'unknown', icon: 'sparkle', description: 'Ta karta skrywa niespodziankę.' };
  const selectable = options.selectable !== false;
  const element = document.createElement(selectable ? 'button' : 'article');
  const cardId = typeof card === 'object' ? card.id : '';
  element.className = `game-card card-${meta.category}${options.compact ? ' is-compact' : ''}${options.selected ? ' is-selected' : ''}${options.disabled ? ' is-disabled' : ''}`;
  element.dataset.cardType = type || 'unknown';
  if (cardId) element.dataset.cardId = cardId;
  if (selectable) {
    element.type = 'button';
    element.dataset.action = options.action || 'play-card';
    element.setAttribute('aria-pressed', String(Boolean(options.selected)));
    element.disabled = Boolean(options.disabled);
  }
  const values = meta.pips
    ? `<span class="card-pips" aria-label="${meta.pips} ikony popularności">${Array.from({ length: meta.pips }, () => icon('cup')).join('')}</span>`
    : meta.points ? `<span class="card-points">${meta.points}${icon('heart')}</span>` : icon(meta.icon, 'card-symbol');
  element.innerHTML = `<span class="card-top"><span class="card-type-icon">${icon(meta.icon)}</span><span class="card-name">${escapeHTML(meta.name)}</span></span><span class="card-picture">${getCardArt(type)}</span><span class="card-bottom"><span>${escapeHTML(meta.short)}</span>${values}</span><span class="card-check">${icon('check')}</span>`;
  element.setAttribute('aria-label', `${meta.name}. ${meta.description}${options.selected ? '. Wybrana' : ''}`);
  element.title = meta.description;
  return element;
}

export function createCardBack(count = null) {
  const element = document.createElement('div');
  element.className = 'card-back';
  element.setAttribute('aria-label', count == null ? 'Zakryta karta' : `${count} kart na ręce`);
  element.innerHTML = `<span class="card-back-pattern">${icon('paw')}</span>${count == null ? '' : `<strong>${Number(count)}</strong>`}`;
  return element;
}

export function createOpponent(player, options = {}) {
  const element = document.createElement('article');
  const name = escapeHTML(player?.name || 'Gość');
  const cardCount = Number(player?.handCount ?? player?.hand?.length ?? 0);
  const score = Number(player?.score ?? 0);
  const initial = escapeHTML((player?.name || '?').trim().charAt(0).toUpperCase());
  const waiting = options.waiting || player?.status === 'choosing';
  element.className = `opponent${waiting ? ' is-choosing' : ''}${player?.status === 'ready' ? ' is-ready' : ''}`;
  if (player?.id != null) element.dataset.playerId = player.id;
  element.innerHTML = `<div class="opponent-avatar avatar-${escapeHTML(player?.avatar || 'cat')}"><span>${initial}</span>${player?.isBot ? `<i>${icon('bot')}</i>` : ''}</div><div class="opponent-info"><strong>${name}</strong><small>${waiting ? 'Wybiera kartę…' : player?.status === 'ready' ? 'Gotowy!' : `${cardCount} kart`}</small></div><div class="opponent-score">${icon('heart')}<b>${score}</b></div><div class="mini-hand" aria-label="${cardCount} kart">${Array.from({ length: Math.min(cardCount, 5) }, () => '<i></i>').join('')}</div>`;
  return element;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(target => {
    target.innerHTML = icon(target.dataset.icon);
  });
}

export function setScreen(screen) {
  const id = String(screen).endsWith('-screen') ? String(screen) : `${screen}-screen`;
  document.querySelectorAll('.screen').forEach(node => {
    const active = node.id === id;
    node.hidden = !active;
    node.classList.toggle('is-active', active);
  });
  const target = document.getElementById(id);
  if (target) {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const heading = target.querySelector('h1, [role="heading"]');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  document.body.classList.toggle('in-game', id === 'game-screen');
  return target;
}

export function openDialog(dialogOrId) {
  const dialog = typeof dialogOrId === 'string' ? document.getElementById(dialogOrId) : dialogOrId;
  if (!dialog) return false;
  if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
  else { dialog.setAttribute('open', ''); dialog.classList.add('dialog-fallback'); document.body.classList.add('has-dialog'); }
  return true;
}

export function closeDialog(dialogOrId) {
  const dialog = typeof dialogOrId === 'string' ? document.getElementById(dialogOrId) : dialogOrId;
  if (!dialog) return false;
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else { dialog.removeAttribute('open'); dialog.classList.remove('dialog-fallback'); document.body.classList.remove('has-dialog'); }
  return true;
}

let toastTimer;
export function showToast(message, options = {}) {
  const region = document.getElementById('toast-region');
  if (!region) return null;
  window.clearTimeout(toastTimer);
  const toast = document.createElement('div');
  toast.className = `toast toast-${options.type || 'info'}`;
  toast.setAttribute('role', options.type === 'error' ? 'alert' : 'status');
  toast.innerHTML = `<span class="toast-icon">${icon(options.type === 'error' ? 'info' : options.type === 'success' ? 'check' : 'sparkle')}</span><p>${escapeHTML(message)}</p><button type="button" aria-label="Zamknij powiadomienie">${icon('close')}</button>`;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  region.replaceChildren(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  toastTimer = window.setTimeout(() => { toast.classList.remove('is-visible'); window.setTimeout(() => toast.remove(), 220); }, options.duration || 3200);
  return toast;
}

export function setupDialogControls(root = document) {
  root.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  root.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); }));
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { hydrateIcons(); setupDialogControls(); }, { once: true });
  else { hydrateIcons(); setupDialogControls(); }
}
