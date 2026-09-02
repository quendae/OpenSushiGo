import { getCardArt } from './art.js';

export const CARD_PRESENTATION = Object.freeze({
  cookie_set: { name: 'Ciasteczka', badge: '2', kicker: 'ZBIERZ PARĘ', rule: '×2 = 5 PKT', category: 'set', description: 'Każde 2 ciasteczka dają 5 punktów.' },
  afternoon_set: { name: 'Podwieczorek', badge: '3', kicker: 'ZBIERZ TRÓJKĘ', rule: '×3 = 10 PKT', category: 'set', description: 'Każde 3 podwieczorki dają 10 punktów.' },
  sweet_bun: { name: 'Bułeczki', badge: '1…5', category: 'bun', ladder: [['1', '2', '3', '4', '5+'], ['1', '3', '6', '10', '15']], description: 'Za 1, 2, 3, 4 i 5 lub więcej bułeczek dostajesz kolejno 1, 3, 6, 10 i 15 punktów.' },
  drink_1: { name: 'Kakao', badge: '1', kicker: '1 KUBEK', rule: '1. = 6 · 2. = 3 PKT', category: 'drink', pips: 1, description: 'Liczy się jako 1 kubek. Najwięcej kubków daje 6 punktów, drugie miejsce 3.' },
  drink_2: { name: 'Kakao', badge: '2', kicker: '2 KUBKI', rule: '1. = 6 · 2. = 3 PKT', category: 'drink', pips: 2, description: 'Liczy się jako 2 kubki. Najwięcej kubków daje 6 punktów, drugie miejsce 3.' },
  drink_3: { name: 'Kakao', badge: '3', kicker: '3 KUBKI', rule: '1. = 6 · 2. = 3 PKT', category: 'drink', pips: 3, description: 'Liczy się jako 3 kubki. Najwięcej kubków daje 6 punktów, drugie miejsce 3.' },
  bunny_guest: { name: 'Króliczek', badge: '1', kicker: 'GOŚĆ', rule: '1 PKT', category: 'guest', points: 1, description: 'Króliczek daje 1 punkt.' },
  cat_guest: { name: 'Kotek', badge: '2', kicker: 'GOŚĆ', rule: '2 PKT', category: 'guest', points: 2, description: 'Kotek daje 2 punkty.' },
  dog_guest: { name: 'Piesek', badge: '3', kicker: 'GOŚĆ', rule: '3 PKT', category: 'guest', points: 3, description: 'Piesek daje 3 punkty.' },
  adoption_pet: { name: 'Adopcja', badge: 'KONIEC', kicker: 'NAJWIĘCEJ +6', rule: 'NAJMNIEJ −6', category: 'adoption', description: 'Na końcu gry najwięcej adopcji daje 6 punktów, a najmniej odbiera 6. W grze dwuosobowej nie ma punktów ujemnych.' },
  cream_topping: { name: 'Kremowa polewa', badge: '×3', kicker: 'NASTĘPNY GOŚĆ', rule: '×3 PUNKTY', category: 'special', description: 'Potraja wartość następnego zagranego gościa.' },
  extra_paws: { name: 'Dodatkowe łapki', badge: '×2', kicker: 'W NASTĘPNEJ TURZE', rule: 'WYBIERZ 2 KARTY', category: 'special', description: 'W następnej turze wybierasz 2 karty, a tę kartę oddajesz z przekazywaną ręką.' },
  cone_race: { name: 'Rożek waflowy', badge: '↕', kicker: 'NAJWIĘCEJ +4', rule: 'NAJMNIEJ −4', category: 'race', description: 'Najwięcej rożków daje 4 punkty, a najmniej odbiera 4. Bez kary w grze dwuosobowej.' },
  tray_race_1: { name: 'Taca ekspresowa', badge: '1', kicker: 'WYŚCIG DO 10', rule: '1./2./3. = 8/5/2', category: 'race', description: 'Liczy się jako 1 ciastko. Kto pierwszy zbierze 10, zdobywa 8 punktów; kolejne miejsca 5 i 2.' },
  tray_race_2: { name: 'Taca ekspresowa', badge: '2', kicker: 'WYŚCIG DO 10', rule: '1./2./3. = 8/5/2', category: 'race', description: 'Liczy się jako 2 ciastka. Kto pierwszy zbierze 10, zdobywa 8 punktów; kolejne miejsca 5 i 2.' },
  tray_race_3: { name: 'Taca ekspresowa', badge: '3', kicker: 'WYŚCIG DO 10', rule: '1./2./3. = 8/5/2', category: 'race', description: 'Liczy się jako 3 ciastka. Kto pierwszy zbierze 10, zdobywa 8 punktów; kolejne miejsca 5 i 2.' },
  caramel_twist: { name: 'Karmelki', badge: '2+', kicker: '1 = −3 PKT', rule: '2+ = 7 PKT', category: 'appetizer', description: 'Jeden karmelek odbiera 3 punkty. Dwa lub więcej dają 7 punktów.' },
  cheesecake: { name: 'Serniczki', badge: '1·2·3', kicker: 'ILE → PUNKTY', ladder: [['1', '2', '3+'], ['2', '6', '0']], category: 'appetizer', description: 'Jeden serniczek daje 2 punkty, dwa dają 6, ale trzy lub więcej dają 0.' },
  sandwich_circle: { name: 'Kanapka', badge: '●', kicker: 'RÓŻNE → PUNKTY', ladder: [['1', '2', '3', '4'], ['1', '4', '9', '16']], category: 'shape', description: 'Twórz zestawy różnych kształtów. Zestaw 1, 2, 3 lub 4 kształtów daje 1, 4, 9 lub 16 punktów.' },
  sandwich_triangle: { name: 'Kanapka', badge: '▲', kicker: 'RÓŻNE → PUNKTY', ladder: [['1', '2', '3', '4'], ['1', '4', '9', '16']], category: 'shape', description: 'Twórz zestawy różnych kształtów. Zestaw 1, 2, 3 lub 4 kształtów daje 1, 4, 9 lub 16 punktów.' },
  sandwich_square: { name: 'Kanapka', badge: '■', kicker: 'RÓŻNE → PUNKTY', ladder: [['1', '2', '3', '4'], ['1', '4', '9', '16']], category: 'shape', description: 'Twórz zestawy różnych kształtów. Zestaw 1, 2, 3 lub 4 kształtów daje 1, 4, 9 lub 16 punktów.' },
  sandwich_rectangle: { name: 'Kanapka', badge: '▬', kicker: 'RÓŻNE → PUNKTY', ladder: [['1', '2', '3', '4'], ['1', '4', '9', '16']], category: 'shape', description: 'Twórz zestawy różnych kształtów. Zestaw 1, 2, 3 lub 4 kształtów daje 1, 4, 9 lub 16 punktów.' },
  shared_sprinkles: { name: 'Wspólna posypka', badge: '×', kicker: 'ZA KAŻDEGO RYWALA', rule: 'Z POSYPKĄ +1 · MAX 4', category: 'appetizer', description: 'Każda posypka daje po 1 punkcie za każdego rywala, który też ma posypkę, maksymalnie 4.' },
  soup_special: { name: 'Zupa dnia', badge: '3', kicker: 'TYLKO JEDNA W TURZE', rule: '3 PKT · 2+ = ODRZUĆ', category: 'appetizer', description: 'Daje 3 punkty, jeśli nikt inny nie zagra zupy w tej samej turze. W przeciwnym razie wszystkie zupy przepadają.' },
  loyalty_card: { name: 'Stały gość', badge: '4', kicker: 'NAJWIĘCEJ RODZAJÓW', rule: 'KAŻDA = 4 PKT', category: 'special', description: 'Każda karta daje 4 punkty, jeśli masz najwięcej różnych rodzin kart.' },
  tea_pot: { name: 'Dzbanek herbaty', badge: '×', kicker: 'NAJWIĘKSZY ZESTAW', rule: '1 PKT ZA KARTĘ', category: 'special', description: 'Każdy dzbanek daje tyle punktów, ile kart ma twój największy zestaw jednego rodzaju.' },
  menu_card: { name: 'Menu dnia', badge: '4→1', kicker: 'DOBIERZ 4 KARTY', rule: 'WYBIERZ 1', category: 'special', description: 'Dobierz 4 karty z pozostałej talii, wybierz jedną, a resztę zwróć.' },
  silver_spoon: { name: 'Srebrna łyżeczka', badge: '↔', kicker: 'POPROŚ O KARTĘ', rule: 'ODDAJ ŁYŻECZKĘ', category: 'special', description: 'W późniejszej turze poproś o rodzinę kart. Pierwszy gracz po lewej, który ją ma, wymienia ją na łyżeczkę.' },
  special_order: { name: 'Specjalne zamówienie', badge: '⧉', kicker: 'KOPIUJE TWOJĄ', rule: 'ZAGRANĄ KARTĘ', category: 'special', description: 'Kopiuje dowolną kartę, którą masz już przed sobą.' },
  takeout_box: { name: 'Pudełko na wynos', badge: '2', kicker: 'ODWRÓĆ KARTY', rule: 'KAŻDA = 2 PKT', category: 'special', description: 'Odwróć dowolne wcześniej zagrane karty. Każda z nich będzie warta 2 punkty.' },
  icecream_cake: { name: 'Tort lodowy', badge: 'KONIEC', kicker: 'ZBIERZ CZWÓRKĘ', rule: '×4 = 12 PKT', category: 'dessert', description: 'Na końcu gry każdy zestaw 4 tortów lodowych daje 12 punktów.' },
  fruit_basket: { name: 'Owocowy koszyk', badge: '🍓', kicker: 'KAŻDY OWOC: ILE → PKT', ladder: [['0', '1', '2', '3', '4', '5+'], ['−2', '0', '1', '3', '6', '10']], category: 'dessert', description: 'Na końcu gry każdy z trzech owoców punktuje osobno: 0, 1, 2, 3, 4 lub 5 sztuk daje −2, 0, 1, 3, 6 lub 10 punktów.' }
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

function renderCardRule(meta) {
  if (meta.ladder) {
    const [counts, points] = meta.ladder;
    return `${meta.kicker ? `<span class="card-rule-kicker">${escapeHTML(meta.kicker)}</span>` : ''}<span class="card-ladder" style="--ladder-cols:${counts.length}" aria-hidden="true"><span>${counts.map(value => `<b>${escapeHTML(value)}</b>`).join('')}</span><span>${points.map(value => `<strong>${escapeHTML(value)}</strong>`).join('')}</span></span>`;
  }
  return `<span class="card-rule-kicker">${escapeHTML(meta.kicker)}</span><strong class="card-rule-main">${escapeHTML(meta.rule)}</strong>`;
}

export function createCard(card, options = {}) {
  const type = resolveCardType(card);
  const meta = CARD_PRESENTATION[type] || { name: 'Tajemnicza karta', short: 'Nieznany efekt', category: 'unknown', icon: 'sparkle', description: 'Ta karta skrywa niespodziankę.' };
  const selectable = options.selectable !== false;
  const element = document.createElement(selectable ? 'button' : 'article');
  const cardId = typeof card === 'object' ? card.id : '';
  const fruitIcons = { berry: '🍓', melon: '🍉', orange: '🍊' };
  const dynamicBadge = typeof card === 'object' && Array.isArray(card.fruits)
    ? card.fruits.map((fruit) => fruitIcons[fruit] ?? '●').join('')
    : meta.badge;
  element.className = `game-card card-${meta.category}${options.compact ? ' is-compact' : ''}${options.selected ? ' is-selected' : ''}${options.disabled ? ' is-disabled' : ''}`;
  element.dataset.cardType = type || 'unknown';
  if (cardId) element.dataset.cardId = cardId;
  if (selectable) {
    element.type = 'button';
    element.dataset.action = options.action || 'play-card';
    element.setAttribute('aria-pressed', String(Boolean(options.selected)));
    element.disabled = Boolean(options.disabled);
  }
  element.innerHTML = `<span class="card-picture">${getCardArt(type)}<span class="card-value-badge" aria-hidden="true">${escapeHTML(dynamicBadge)}</span></span><span class="card-info"><span class="card-name">${escapeHTML(meta.name)}</span><span class="card-rule">${renderCardRule(meta)}</span></span><span class="card-check">${icon('check')}</span>`;
  const copied = typeof card === 'object' && card.copiedType ? ` Kopiuje: ${CARD_PRESENTATION[card.copiedType]?.name ?? card.copiedType}.` : '';
  element.setAttribute('aria-label', `${meta.name}. ${meta.description}${copied}${card?.flipped ? ' Odwrócona, warta 2 punkty.' : ''}${options.selected ? '. Wybrana' : ''}`);
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
