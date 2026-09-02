/** Party-mode menu, card catalogue and pure scoring helpers. */

export const PARTY_HAND_SIZE = Object.freeze({ 2: 10, 3: 10, 4: 9, 5: 9, 6: 8, 7: 8, 8: 7 });

export const PARTY_CARD_TYPES = Object.freeze({
  cone_race: { count: 12, name: 'Rożek waflowy', family: 'cone_race', group: 'roll', roundScoring: true },
  tray_race_1: { count: 3, name: 'Taca ekspresowa', family: 'tray_race', group: 'roll', roundScoring: true, raceIcons: 1 },
  tray_race_2: { count: 6, name: 'Taca ekspresowa', family: 'tray_race', group: 'roll', roundScoring: true, raceIcons: 2 },
  tray_race_3: { count: 3, name: 'Taca ekspresowa', family: 'tray_race', group: 'roll', roundScoring: true, raceIcons: 3 },
  caramel_twist: { count: 8, name: 'Karmelki', family: 'caramel_twist', group: 'appetizer', roundScoring: true },
  cheesecake: { count: 8, name: 'Serniczki', family: 'cheesecake', group: 'appetizer', roundScoring: true },
  sandwich_circle: { count: 2, name: 'Okrągła kanapka', family: 'sandwich', group: 'appetizer', shape: 'circle', roundScoring: true },
  sandwich_triangle: { count: 2, name: 'Trójkątna kanapka', family: 'sandwich', group: 'appetizer', shape: 'triangle', roundScoring: true },
  sandwich_square: { count: 2, name: 'Kwadratowa kanapka', family: 'sandwich', group: 'appetizer', shape: 'square', roundScoring: true },
  sandwich_rectangle: { count: 2, name: 'Podłużna kanapka', family: 'sandwich', group: 'appetizer', shape: 'rectangle', roundScoring: true },
  shared_sprinkles: { count: 8, name: 'Wspólna posypka', family: 'shared_sprinkles', group: 'appetizer', roundScoring: true },
  soup_special: { count: 8, name: 'Zupa dnia', family: 'soup_special', group: 'appetizer', roundScoring: true },
  loyalty_card: { count: 3, name: 'Karta stałego gościa', family: 'loyalty_card', group: 'special', roundScoring: true },
  tea_pot: { count: 3, name: 'Dzbanek herbaty', family: 'tea_pot', group: 'special', roundScoring: true },
  menu_card: { count: 3, name: 'Menu dnia', family: 'menu_card', group: 'special', roundScoring: true },
  silver_spoon: { count: 3, name: 'Srebrna łyżeczka', family: 'silver_spoon', group: 'special', roundScoring: true },
  special_order: { count: 3, name: 'Zamówienie specjalne', family: 'special_order', group: 'special', roundScoring: true },
  takeout_box: { count: 3, name: 'Pudełko na wynos', family: 'takeout_box', group: 'special', roundScoring: true },
  icecream_cake: { count: 15, name: 'Tort lodowy', family: 'icecream_cake', group: 'dessert', endGameScoring: true },
  fruit_basket: { count: 15, name: 'Owocowy koszyk', family: 'fruit_basket', group: 'dessert', endGameScoring: true },
});

export const PARTY_MENUS = Object.freeze({
  sampler: {
    name: 'Próbne przyjęcie',
    description: 'Łagodne wprowadzenie do nowych kart.',
    roll: 'cone_race',
    appetizers: ['cookie_set', 'cheesecake', 'sweet_bun'],
    specials: ['menu_card', 'cream_topping'],
    dessert: 'icecream_cake',
  },
  clever: {
    name: 'Sprytne zamówienia',
    description: 'Kopiowanie, pudełka i różnorodne zestawy.',
    roll: 'tray_race',
    appetizers: ['sandwich', 'afternoon_set', 'shared_sprinkles'],
    specials: ['tea_pot', 'special_order'],
    dessert: 'fruit_basket',
  },
  lively: {
    name: 'Głośne przyjęcie',
    description: 'Dużo interakcji przy wspólnym stole.',
    roll: 'cone_race',
    appetizers: ['caramel_twist', 'cheesecake', 'soup_special'],
    specials: ['loyalty_card', 'silver_spoon'],
    dessert: 'adoption_pet',
  },
  cozy: {
    name: 'Puchaty bankiet',
    description: 'Przystępna talia dobra dla większej grupy.',
    roll: 'drink',
    appetizers: ['cookie_set', 'sweet_bun', 'sandwich'],
    specials: ['extra_paws', 'takeout_box'],
    dessert: 'icecream_cake',
  },
});

const PARTY_FAMILIES = Object.freeze({
  drink: ['drink_1', 'drink_2', 'drink_3'],
  tray_race: ['tray_race_1', 'tray_race_2', 'tray_race_3'],
  sandwich: ['sandwich_circle', 'sandwich_triangle', 'sandwich_square', 'sandwich_rectangle'],
  cookie_set: ['cookie_set'],
  afternoon_set: ['afternoon_set'],
  sweet_bun: ['sweet_bun'],
  cream_topping: ['cream_topping'],
  extra_paws: ['extra_paws'],
  adoption_pet: ['adoption_pet'],
});

const FRUIT_PAIRS = Object.freeze([
  ['berry', 'melon'], ['berry', 'melon'], ['berry', 'orange'], ['berry', 'orange'], ['melon', 'orange'],
  ['melon', 'orange'], ['berry', 'berry'], ['berry', 'berry'], ['melon', 'melon'], ['melon', 'melon'],
  ['orange', 'orange'], ['orange', 'orange'], ['berry', 'melon'], ['berry', 'orange'], ['melon', 'orange'],
]);

export function partyFamily(type) {
  if (type?.startsWith('drink_')) return 'drink';
  if (type?.startsWith('tray_race_')) return 'tray_race';
  if (type?.startsWith('sandwich_')) return 'sandwich';
  return PARTY_CARD_TYPES[type]?.family ?? type;
}

export function effectiveType(card) {
  return card?.copiedType ?? card?.type;
}

export function activeFamily(card) {
  return partyFamily(effectiveType(card));
}

export function normalizePartyMenu(value = 'sampler') {
  const preset = typeof value === 'string' ? PARTY_MENUS[value] : value;
  if (!preset) throw new RangeError('Nieznane menu przyjęcia.');
  const menu = {
    name: String(preset.name ?? 'Własne przyjęcie'),
    description: String(preset.description ?? ''),
    roll: String(preset.roll),
    appetizers: [...new Set(preset.appetizers ?? [])].map(String),
    specials: [...new Set(preset.specials ?? [])].map(String),
    dessert: String(preset.dessert),
  };
  if (menu.appetizers.length !== 3 || menu.specials.length !== 2) {
    throw new RangeError('Menu musi zawierać 1 wyścig, 3 przekąski, 2 dodatki i 1 deser.');
  }
  return menu;
}

export function validatePartyMenu(menuOrPreset, playerCount) {
  const menu = normalizePartyMenu(menuOrPreset);
  const families = new Set([menu.roll, ...menu.appetizers, ...menu.specials, menu.dessert]);
  if (playerCount === 2 && families.has('shared_sprinkles')) {
    throw new RangeError('Wspólna posypka jest dostępna dla 3–8 graczy.');
  }
  if (playerCount === 2 && families.has('silver_spoon')) {
    throw new RangeError('Srebrna łyżeczka jest dostępna dla 3–8 graczy.');
  }
  if (playerCount >= 7 && families.has('menu_card')) {
    throw new RangeError('Menu dnia jest dostępne dla 2–6 graczy.');
  }
  if (playerCount >= 7 && families.has('special_order')) {
    throw new RangeError('Specjalne zamówienie jest dostępne dla 2–6 graczy.');
  }
  return menu;
}

function makeCard(type, index, definition, extra = {}) {
  return Object.freeze({
    id: `party_${type}_${String(index).padStart(2, '0')}`,
    type,
    name: definition.name,
    roundScoring: Boolean(definition.roundScoring),
    endGameScoring: Boolean(definition.endGameScoring),
    ...extra,
  });
}

export function buildPartyDeck(menuValue, classicTypes) {
  const menu = normalizePartyMenu(menuValue);
  const selectedFamilies = [menu.roll, ...menu.appetizers, ...menu.specials, menu.dessert];
  const types = ['bunny_guest', 'cat_guest', 'dog_guest'];
  for (const family of selectedFamilies) types.push(...(PARTY_FAMILIES[family] ?? [family]));
  const deck = [];
  for (const type of types) {
    const partyDefinition = PARTY_CARD_TYPES[type];
    const classicDefinition = classicTypes[type];
    const definition = partyDefinition ?? classicDefinition;
    if (!definition) throw new RangeError(`Nieznana rodzina kart: ${type}`);
    let count = partyDefinition?.count ?? 8;
    if (['bunny_guest', 'cat_guest', 'dog_guest'].includes(type)) count = 4;
    if (type === 'adoption_pet') count = 15;
    if (['cream_topping', 'extra_paws'].includes(type)) count = 3;
    for (let index = 1; index <= count; index += 1) {
      const extra = {};
      if (definition.drinkIcons) extra.drinkIcons = definition.drinkIcons;
      if (definition.basePoints) extra.basePoints = definition.basePoints;
      if (definition.raceIcons) extra.raceIcons = definition.raceIcons;
      if (definition.shape) extra.shape = definition.shape;
      if (type === 'fruit_basket') extra.fruits = FRUIT_PAIRS[index - 1];
      deck.push(makeCard(type, index, definition, extra));
    }
  }
  return deck;
}

const playable = (cards) => (cards ?? []).filter((card) => !card.flipped);
const countFamily = (cards, family) => playable(cards).filter((card) => activeFamily(card) === family).length;

export function scoreConeRace(players) {
  const counts = players.map((player) => countFamily(player.playedThisRound, 'cone_race'));
  const points = players.map(() => 0);
  const highest = Math.max(...counts);
  if (highest === 0) return points;
  counts.forEach((value, seat) => { if (value === highest) points[seat] += 4; });
  if (players.length > 2) {
    const lowest = Math.min(...counts);
    counts.forEach((value, seat) => { if (value === lowest) points[seat] -= 4; });
  }
  return points;
}

export function scoreCaramel(cards) {
  const count = countFamily(cards, 'caramel_twist');
  return count === 1 ? -3 : count >= 2 ? 7 : 0;
}

export function scoreCheesecake(cards) {
  const count = countFamily(cards, 'cheesecake');
  return count === 1 ? 2 : count === 2 ? 6 : 0;
}

export function scoreSandwiches(cards) {
  const counts = new Map(['circle', 'triangle', 'square', 'rectangle'].map((shape) => [shape, 0]));
  for (const card of playable(cards)) {
    if (activeFamily(card) !== 'sandwich') continue;
    const shape = card.copiedShape ?? card.shape ?? PARTY_CARD_TYPES[effectiveType(card)]?.shape;
    counts.set(shape, (counts.get(shape) ?? 0) + 1);
  }
  let points = 0;
  const max = Math.max(0, ...counts.values());
  for (let layer = 1; layer <= max; layer += 1) {
    const unique = [...counts.values()].filter((count) => count >= layer).length;
    points += unique * unique;
  }
  return points;
}

export function scoreSharedSprinkles(player, players) {
  const own = countFamily(player.playedThisRound, 'shared_sprinkles');
  const opponents = players.filter((candidate) => candidate !== player && countFamily(candidate.playedThisRound, 'shared_sprinkles') > 0).length;
  return own * Math.min(4, opponents);
}

export function scoreSoup(cards) {
  return countFamily(cards, 'soup_special') * 3;
}

export function scoreFlipped(cards) {
  return (cards ?? []).filter((card) => card.flipped).length * 2;
}

export function distinctFamilies(cards) {
  return new Set(playable(cards).map(activeFamily)).size;
}

export function scoreLoyalty(player, players) {
  const ownCards = player.playedThisRound ?? [];
  const count = countFamily(ownCards, 'loyalty_card');
  if (!count) return 0;
  const maximum = Math.max(...players.map((candidate) => distinctFamilies(candidate.playedThisRound)));
  return distinctFamilies(ownCards) === maximum ? count * 4 : 0;
}

export function scoreTea(cards) {
  const source = playable(cards);
  const teaCount = source.filter((card) => activeFamily(card) === 'tea_pot').length;
  if (!teaCount) return 0;
  const sizes = new Map();
  source.forEach((card) => sizes.set(activeFamily(card), (sizes.get(activeFamily(card)) ?? 0) + 1));
  return teaCount * Math.max(0, ...sizes.values());
}

const fruitPoints = (count) => [-2, 0, 1, 3, 6, 10][Math.min(5, count)];

export function scorePartyDesserts(cards, selectedDessert = null) {
  const source = cards ?? [];
  const icecream = source.filter((card) => activeFamily(card) === 'icecream_cake').length;
  const fruits = { berry: 0, melon: 0, orange: 0 };
  for (const card of source) {
    if (activeFamily(card) !== 'fruit_basket') continue;
    for (const fruit of card.fruits ?? []) fruits[fruit] += 1;
  }
  const hasFruit = selectedDessert === 'fruit_basket' || source.some((card) => activeFamily(card) === 'fruit_basket');
  return {
    icecream: Math.floor(icecream / 4) * 12,
    fruit: hasFruit ? Object.values(fruits).reduce((sum, count) => sum + fruitPoints(count), 0) : 0,
  };
}

export function partyDessertDealCount(playerCount, round) {
  const additions = playerCount <= 5 ? [5, 3, 2] : [7, 5, 3];
  return additions.slice(0, round).reduce((sum, value) => sum + value, 0);
}
