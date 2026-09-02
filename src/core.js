/**
 * Pure rules engine for Puchate Café.
 *
 * The canonical state intentionally contains hidden information. Give clients
 * only getPlayerView(state, seat), which redacts hands and locked choices.
 */

import {
  PARTY_CARD_TYPES,
  PARTY_HAND_SIZE,
  activeFamily,
  buildPartyDeck,
  effectiveType,
  normalizePartyMenu,
  partyDessertDealCount,
  partyFamily,
  scoreCaramel,
  scoreCheesecake,
  scoreConeRace,
  scoreFlipped,
  scoreLoyalty,
  scorePartyDesserts,
  scoreSandwiches,
  scoreSharedSprinkles,
  scoreSoup,
  scoreTea,
  validatePartyMenu,
} from './party.js';

export const CARD_TYPES = Object.freeze({
  cookie_set: { count: 14, name: 'Zestaw ciasteczek', roundScoring: true },
  afternoon_set: { count: 14, name: 'Popołudniowy zestaw', roundScoring: true },
  sweet_bun: { count: 14, name: 'Słodkie bułeczki', roundScoring: true },
  drink_1: { count: 6, name: 'Pojedyncza filiżanka', roundScoring: true, drinkIcons: 1 },
  drink_2: { count: 12, name: 'Dwa kubki kakao', roundScoring: true, drinkIcons: 2 },
  drink_3: { count: 8, name: 'Taca napojów', roundScoring: true, drinkIcons: 3 },
  bunny_guest: { count: 5, name: 'Króliczek przy stoliku', roundScoring: true, basePoints: 1 },
  cat_guest: { count: 10, name: 'Kotek przy stoliku', roundScoring: true, basePoints: 2 },
  dog_guest: { count: 5, name: 'Piesek przy stoliku', roundScoring: true, basePoints: 3 },
  adoption_pet: { count: 10, name: 'Zwierzak do adopcji', endGameScoring: true },
  cream_topping: { count: 6, name: 'Kremowa polewa', roundScoring: true },
  extra_paws: { count: 4, name: 'Dodatkowa para łapek', roundScoring: true },
});

export const HAND_SIZE = Object.freeze({ 2: 10, 3: 9, 4: 8, 5: 7 });
const GUEST_TYPES = new Set(['bunny_guest', 'cat_guest', 'dog_guest']);
const DESSERT_FAMILIES = new Set(['adoption_pet', 'icecream_cake', 'fruit_basket']);

const copy = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export function buildDeck() {
  const deck = [];
  for (const [type, definition] of Object.entries(CARD_TYPES)) {
    for (let index = 1; index <= definition.count; index += 1) {
      const card = {
        id: `${type}_${String(index).padStart(2, '0')}`,
        type,
        name: definition.name,
        roundScoring: Boolean(definition.roundScoring),
        endGameScoring: Boolean(definition.endGameScoring),
      };
      if (definition.drinkIcons) card.drinkIcons = definition.drinkIcons;
      if (definition.basePoints) card.basePoints = definition.basePoints;
      deck.push(Object.freeze(card));
    }
  }
  return deck;
}

export { PARTY_CARD_TYPES, PARTY_HAND_SIZE };

export function buildPartyMenuDeck(menu = 'sampler') {
  return buildPartyDeck(menu, CARD_TYPES);
}

function hashSeed(seed) {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 0x6d2b79f5;
}

function nextRandom(rngState) {
  let nextState = (rngState + 0x6d2b79f5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return { value: ((value ^ (value >>> 14)) >>> 0) / 4294967296, state: nextState };
}

function shuffleCards(source, rngState) {
  const cards = source.map((card) => ({ ...card }));
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const random = nextRandom(rngState);
    rngState = random.state;
    const swapIndex = Math.floor(random.value * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }
  return { cards, rngState };
}

function shuffledDeck(seed) {
  return shuffleCards(buildDeck(), hashSeed(seed));
}

function normalizePlayers(config) {
  const supplied = config.players;
  const count = supplied?.length ?? config.playerCount ?? 2;
  const maximum = config.variant === 'party' ? 8 : 5;
  if (!Number.isInteger(count) || count < 2 || count > maximum) {
    throw new RangeError(`Puchate Café requires 2–${maximum} players in this mode.`);
  }
  const source = supplied ?? Array.from({ length: count }, (_, seat) => ({ name: `Gracz ${seat + 1}` }));
  if (!Array.isArray(source) || source.length !== count) throw new TypeError('Invalid players configuration.');
  const ids = new Set();
  return source.map((entry, seat) => {
    const data = typeof entry === 'string' ? { name: entry } : (entry ?? {});
    const id = String(data.id ?? `player-${seat + 1}`);
    if (ids.has(id)) throw new TypeError(`Duplicate player id: ${id}`);
    ids.add(id);
    return {
      seat,
      id,
      name: String(data.name ?? `Gracz ${seat + 1}`),
      kind: data.kind === 'bot' ? 'bot' : 'human',
      difficulty: data.difficulty === 'easy' ? 'easy' : 'normal',
      variant: config.variant === 'party' ? 'party' : 'classic',
      partyMenu: config.variant === 'party' ? normalizePartyMenu(config.partyMenu ?? 'sampler') : null,
      hand: [],
      playedThisRound: [],
      adoptionPets: [],
      desserts: [],
      instantRoundPoints: 0,
      score: 0,
      roundScores: [],
      roundHistory: [],
    };
  });
}

function publicConfig(config, players, seed) {
  return {
    seed,
    variant: config.variant === 'party' ? 'party' : 'classic',
    partyMenu: config.variant === 'party' ? normalizePartyMenu(config.partyMenu ?? 'sampler') : null,
    players: players.map(({ id, name, kind, difficulty }) => ({ id, name, kind, difficulty })),
  };
}

function addEvent(state, type, details = {}) {
  state.events.push({
    seq: state.events.length,
    type,
    round: state.round,
    turn: state.turn,
    ...details,
  });
}

function dealRound(state) {
  if (state.variant === 'party') {
    const handSize = PARTY_HAND_SIZE[state.players.length];
    const fullDeck = buildPartyDeck(state.partyMenu, CARD_TYPES);
    const dessertLimit = partyDessertDealCount(state.players.length, state.round);
    const retained = new Set(state.players.flatMap((player) => player.desserts.map((card) => card.id)));
    const desserts = fullDeck.filter((card) => card.endGameScoring).slice(0, dessertLimit).filter((card) => !retained.has(card.id));
    const nonDesserts = fullDeck.filter((card) => !card.endGameScoring);
    const shuffled = shuffleCards([...nonDesserts, ...desserts], state.rngState);
    state.rngState = shuffled.rngState;
    state.deck = shuffled.cards;
    state.drawCursor = 0;
    const needed = handSize * state.players.length;
    if (needed > state.deck.length) throw new Error('Not enough cards to deal the party round.');
    for (const player of state.players) {
      player.hand = state.deck.slice(state.drawCursor, state.drawCursor + handSize);
      state.drawCursor += handSize;
      player.playedThisRound = [];
      player.instantRoundPoints = 0;
    }
    state.pendingSelections = {};
    state.pendingSpecials = {};
    state.turnRemainders = null;
    state.uramakiPlaces = [];
    state.turn = 1;
    addEvent(state, 'round_started', { handSize, remainingDeck: state.deck.length - state.drawCursor, variant: 'party' });
    return;
  }
  const handSize = HAND_SIZE[state.players.length];
  const needed = handSize * state.players.length;
  if (state.drawCursor + needed > state.deck.length) throw new Error('Not enough cards to deal the round.');
  for (const player of state.players) {
    player.hand = state.deck.slice(state.drawCursor, state.drawCursor + handSize);
    state.drawCursor += handSize;
    player.playedThisRound = [];
  }
  state.pendingSelections = {};
  state.turn = 1;
  addEvent(state, 'round_started', { handSize, remainingDeck: state.deck.length - state.drawCursor });
}

export function createGame(config = {}) {
  const players = normalizePlayers(config);
  const seed = String(config.seed ?? 'puchate-cafe');
  const variant = config.variant === 'party' ? 'party' : 'classic';
  if (variant === 'party') validatePartyMenu(config.partyMenu ?? 'sampler', players.length);
  const shuffled = variant === 'party'
    ? { cards: [], rngState: hashSeed(seed) }
    : shuffledDeck(seed);
  const state = {
    version: 1,
    // Online hosts should supply their room id. The fallback is deliberately
    // independent of the secret shuffle seed exposed only in canonical state.
    gameId: String(config.gameId ?? 'puchate-cafe-local'),
    seed,
    rngState: shuffled.rngState,
    variant,
    partyMenu: variant === 'party' ? normalizePartyMenu(config.partyMenu ?? 'sampler') : null,
    phase: 'draft',
    round: 1,
    totalRounds: 3,
    turn: 1,
    deck: shuffled.cards,
    drawCursor: 0,
    players,
    pendingSelections: {},
    pendingSpecials: {},
    turnRemainders: null,
    uramakiPlaces: [],
    events: [],
    actionLog: [],
    initialConfig: publicConfig(config, players, seed),
    result: null,
  };
  addEvent(state, 'game_created', { playerCount: players.length });
  dealRound(state);
  return state;
}

function playerAt(state, seat) {
  if (!Number.isInteger(seat) || seat < 0 || seat >= state.players.length) {
    throw new RangeError(`Invalid seat: ${seat}`);
  }
  return state.players[seat];
}

function availablePaws(player) {
  return player.playedThisRound.filter((card) => !card.flipped && activeFamily(card) === 'extra_paws');
}

function availableSpoons(player) {
  return player.playedThisRound.filter((card) => !card.flipped && activeFamily(card) === 'silver_spoon');
}

export function getLegalActions(state, seat) {
  const player = playerAt(state, seat);
  if (state.phase === 'special_action') {
    const special = state.pendingSpecials?.[String(seat)];
    if (!special || special.choice) return [];
    return special.options.map((card) => ({ type: 'choose_menu_card', cardId: card.id }));
  }
  if (state.phase !== 'draft' || state.pendingSelections[String(seat)]) return [];
  const actions = player.hand.map((card) => ({ type: 'play_cards', cardIds: [card.id] }));
  if (player.hand.length >= 2) {
    for (const paws of availablePaws(player)) {
      for (let first = 0; first < player.hand.length; first += 1) {
        for (let second = 0; second < player.hand.length; second += 1) {
          if (first === second) continue;
          actions.push({
            type: 'play_cards',
            cardIds: [player.hand[first].id, player.hand[second].id],
            useExtraPaws: paws.id,
          });
        }
      }
    }
  }
  if (player.hand.length >= 1) {
    for (const spoon of availableSpoons(player)) {
      for (const card of player.hand) {
        actions.push({ type: 'play_cards', cardIds: [card.id], useSpoon: spoon.id });
      }
    }
  }
  return actions;
}

function normalizeAction(action) {
  if (!action || action.type !== 'play_cards' || !Array.isArray(action.cardIds)) {
    throw new TypeError('Expected a play_cards action.');
  }
  return {
    type: 'play_cards',
    cardIds: action.cardIds.map(String),
    ...(action.useExtraPaws ? { useExtraPaws: String(action.useExtraPaws) } : {}),
    ...(action.useSpoon ? { useSpoon: String(action.useSpoon) } : {}),
    ...(action.requestedType ? { requestedType: String(action.requestedType) } : {}),
    ...(action.specialOrderTargetId ? { specialOrderTargetId: String(action.specialOrderTargetId) } : {}),
    ...(Array.isArray(action.takeoutTargetIds) ? { takeoutTargetIds: action.takeoutTargetIds.map(String) } : {}),
  };
}

function validateAction(state, seat, action) {
  const player = playerAt(state, seat);
  if (state.phase !== 'draft') throw new Error('The game is not accepting card choices.');
  if (state.pendingSelections[String(seat)]) throw new Error('This player has already locked a choice.');
  const expectedCount = action.useExtraPaws ? 2 : 1;
  if (action.cardIds.length !== expectedCount || new Set(action.cardIds).size !== expectedCount) {
    throw new Error(action.useExtraPaws ? 'Extra Paws requires two different cards.' : 'Choose exactly one card.');
  }
  const handIds = new Set(player.hand.map((card) => card.id));
  if (action.cardIds.some((id) => !handIds.has(id))) throw new Error('A chosen card is not in this hand.');
  if (action.useExtraPaws) {
    if (player.hand.length < 2) throw new Error('There are not enough cards to use Extra Paws.');
    if (!availablePaws(player).some((card) => card.id === action.useExtraPaws)) {
      throw new Error('The requested Extra Paws card is not available.');
    }
  }
  if (action.useSpoon) {
    if (action.useExtraPaws) throw new Error('Use only one bonus action at a time.');
    if (!availableSpoons(player).some((card) => card.id === action.useSpoon)) throw new Error('The requested spoon is not available.');
    if (!action.requestedType) throw new Error('Choose which card family the spoon should request.');
  }
  const selectedCard = player.hand.find((card) => card.id === action.cardIds[0]);
  if (selectedCard?.type === 'special_order' && player.playedThisRound.length > 0) {
    if (!player.playedThisRound.some((card) => card.id === action.specialOrderTargetId && !card.flipped)) {
      throw new Error('Choose a previously played card for the special order.');
    }
  }
  if (selectedCard?.type === 'takeout_box') {
    const legalTargets = new Set(player.playedThisRound.filter((card) => !card.flipped).map((card) => card.id));
    if ((action.takeoutTargetIds ?? []).some((id) => !legalTargets.has(id))) throw new Error('A takeout target is not available.');
  }
}

function cleanHandCard(card) {
  const clean = { ...card };
  for (const key of ['playedOrder', 'playedRound', 'playedTurn', 'pairedWith', 'creamToppingId', 'flipped', 'copiedType', 'copiedShape']) delete clean[key];
  return clean;
}

function playRevealedCard(player, card, state, extra = {}) {
  const played = {
    ...card,
    ...extra,
    playedOrder: player.playedThisRound.length,
    playedRound: state.round,
    playedTurn: state.turn,
  };
  const family = activeFamily(played);
  if (DESSERT_FAMILIES.has(family)) {
    player.desserts.push(played);
    if (family === 'adoption_pet') player.adoptionPets.push(played);
    return played;
  }
  if (GUEST_TYPES.has(effectiveType(played))) {
    const topping = player.playedThisRound.find(
      (candidate) => activeFamily(candidate) === 'cream_topping' && !candidate.pairedWith && !candidate.flipped,
    );
    if (topping) {
      topping.pairedWith = played.id;
      played.creamToppingId = topping.id;
    }
  }
  player.playedThisRound.push(played);
  return played;
}

function removePlayedCard(player, id) {
  const index = player.playedThisRound.findIndex((card) => card.id === id);
  if (index < 0) return null;
  return player.playedThisRound.splice(index, 1)[0];
}

function allocateMenuOptions(state) {
  const options = [];
  for (let index = state.drawCursor; index < state.deck.length && options.length < 4;) {
    if (state.deck[index].type === 'menu_card') { index += 1; continue; }
    options.push(state.deck.splice(index, 1)[0]);
  }
  return options;
}

function copyTargetProperties(target) {
  const copiedType = effectiveType(target);
  const definition = CARD_TYPES[copiedType] ?? PARTY_CARD_TYPES[copiedType] ?? {};
  return {
    copiedType,
    ...(target.basePoints ?? definition.basePoints ? { basePoints: target.basePoints ?? definition.basePoints } : {}),
    ...(target.drinkIcons ?? definition.drinkIcons ? { drinkIcons: target.drinkIcons ?? definition.drinkIcons } : {}),
    ...(target.raceIcons ?? definition.raceIcons ? { raceIcons: target.raceIcons ?? definition.raceIcons } : {}),
    ...(target.shape ?? definition.shape ? { copiedShape: target.shape ?? definition.shape } : {}),
    ...(target.fruits ? { fruits: copy(target.fruits) } : {}),
  };
}

function revealSelectedCard(state, player, card, selection) {
  if (card.type === 'menu_card') {
    state.pendingSpecials[String(player.seat)] = { type: 'menu', sourceCardId: card.id, options: allocateMenuOptions(state), choice: null };
    return { ...card, menuPending: true };
  }
  if (card.type === 'takeout_box') {
    for (const id of selection.takeoutTargetIds ?? []) {
      const target = player.playedThisRound.find((candidate) => candidate.id === id);
      if (target) target.flipped = true;
    }
    return { ...card, discarded: true, flippedCards: selection.takeoutTargetIds ?? [] };
  }
  if (card.type === 'special_order') {
    const target = player.playedThisRound.find((candidate) => candidate.id === selection.specialOrderTargetId && !candidate.flipped);
    if (!target) return { ...card, discarded: true };
    return playRevealedCard(player, card, state, copyTargetProperties(target));
  }
  return playRevealedCard(player, card, state);
}

function resolveSpoons(state, leftovers, revealDetails) {
  for (const player of state.players) {
    const selection = state.pendingSelections[String(player.seat)];
    if (!selection?.useSpoon) continue;
    let donorSeat = null;
    let donated = null;
    for (let offset = 1; offset < state.players.length; offset += 1) {
      const seat = (player.seat + offset) % state.players.length;
      const index = leftovers[seat].findIndex((card) => card.type === selection.requestedType || partyFamily(card.type) === selection.requestedType);
      if (index >= 0) {
        donorSeat = seat;
        [donated] = leftovers[seat].splice(index, 1);
        break;
      }
    }
    if (!donated) continue;
    const spoon = removePlayedCard(player, selection.useSpoon);
    if (spoon) leftovers[donorSeat].push(cleanHandCard(spoon));
    const played = playRevealedCard(player, donated, state);
    const detail = revealDetails.find((entry) => entry.seat === player.seat);
    detail.cardIds.push(played.id);
    detail.cardTypes.push(played.type);
    detail.usedSpoon = selection.useSpoon;
  }
}

function resolveSoupCollisions(state) {
  const soups = state.players.flatMap((player) => player.playedThisRound
    .filter((card) => activeFamily(card) === 'soup_special' && card.playedRound === state.round && card.playedTurn === state.turn)
    .map((card) => ({ player, card })));
  if (soups.length <= 1) return;
  for (const { player, card } of soups) removePlayedCard(player, card.id);
  addEvent(state, 'soups_discarded', { seats: soups.map(({ player }) => player.seat) });
}

function raceIcons(player) {
  return player.playedThisRound.reduce((sum, card) => sum + (!card.flipped && activeFamily(card) === 'tray_race'
    ? (card.raceIcons ?? PARTY_CARD_TYPES[effectiveType(card)]?.raceIcons ?? 0) : 0), 0);
}

function awardTrayRace(state, atRoundEnd = false) {
  const pointsByPlace = [8, 5, 2];
  if (state.uramakiPlaces.length >= 3) return;
  let candidates = state.players.map((player) => ({ player, icons: raceIcons(player) }))
    .filter((entry) => atRoundEnd ? entry.icons > 0 : entry.icons >= 10)
    .sort((a, b) => b.icons - a.icons);
  if (atRoundEnd && candidates.length) candidates = candidates.filter((entry) => entry.icons === candidates[0].icons);
  while (candidates.length && state.uramakiPlaces.length < 3) {
    const top = candidates[0].icons;
    const tied = candidates.filter((entry) => entry.icons === top);
    const points = pointsByPlace[state.uramakiPlaces.length] ?? 0;
    for (const { player, icons } of tied) {
      player.instantRoundPoints += points;
      const raced = player.playedThisRound.filter((card) => activeFamily(card) === 'tray_race');
      player.playedThisRound = player.playedThisRound.filter((card) => activeFamily(card) !== 'tray_race');
      state.uramakiPlaces.push({ seat: player.seat, points, icons, cardIds: raced.map((card) => card.id) });
    }
    candidates = candidates.filter((entry) => entry.icons !== top);
    if (atRoundEnd) break;
  }
  if (state.uramakiPlaces.length) addEvent(state, 'tray_race_scored', { places: copy(state.uramakiPlaces) });
}

function finalizeTurn(state) {
  resolveSoupCollisions(state);
  awardTrayRace(state);
  const leftovers = state.turnRemainders;
  for (const player of state.players) {
    const fromSeat = (player.seat - 1 + state.players.length) % state.players.length;
    player.hand = leftovers[fromSeat];
  }
  state.turnRemainders = null;
  state.pendingSelections = {};
  state.pendingSpecials = {};
  state.phase = 'draft';
  if (state.players.every((player) => player.hand.length === 0)) finishRound(state);
  else state.turn += 1;
}

function resolveSelections(state) {
  const leftovers = [];
  const revealDetails = [];
  for (const player of state.players) {
    const selection = state.pendingSelections[String(player.seat)];
    const selected = selection.cardIds.map((id) => player.hand.find((card) => card.id === id));
    const selectedIds = new Set(selection.cardIds);
    const remainder = player.hand.filter((card) => !selectedIds.has(card.id));
    if (selection.useExtraPaws) {
      const pawsIndex = player.playedThisRound.findIndex((card) => card.id === selection.useExtraPaws);
      const [paws] = player.playedThisRound.splice(pawsIndex, 1);
      remainder.push(cleanHandCard(paws));
    }
    const revealed = selected.map((card) => revealSelectedCard(state, player, card, selection));
    leftovers[player.seat] = remainder;
    revealDetails.push({
      seat: player.seat,
      cardIds: revealed.map((card) => card.id),
      cardTypes: revealed.map((card) => card.type),
      usedExtraPaws: selection.useExtraPaws ?? null,
      usedSpoon: null,
    });
  }
  resolveSpoons(state, leftovers, revealDetails);
  addEvent(state, 'cards_revealed', { plays: revealDetails });
  state.turnRemainders = leftovers;
  if (Object.keys(state.pendingSpecials).length) {
    state.phase = 'special_action';
    addEvent(state, 'menu_choice_started', { seats: Object.keys(state.pendingSpecials).map(Number) });
  } else finalizeTurn(state);
}

export function dispatchAction(inputState, seat, rawAction) {
  const action = normalizeAction(rawAction);
  validateAction(inputState, seat, action);
  const state = copy(inputState);
  state.pendingSelections[String(seat)] = action;
  state.actionLog.push({ seat, action: copy(action) });
  addEvent(state, 'selection_locked', {
    seat,
    selectedCount: action.cardIds.length,
    lockedCount: Object.keys(state.pendingSelections).length,
  });
  if (Object.keys(state.pendingSelections).length === state.players.length) resolveSelections(state);
  return state;
}

export function dispatchSpecialAction(inputState, seat, rawAction) {
  if (inputState.phase !== 'special_action') throw new Error('No special choice is waiting.');
  const action = rawAction ?? {};
  if (action.type !== 'choose_menu_card') throw new TypeError('Expected a choose_menu_card action.');
  const current = inputState.pendingSpecials?.[String(seat)];
  if (!current || current.choice) throw new Error('This player has no menu choice.');
  const chosen = current.options.find((card) => card.id === String(action.cardId));
  if (!chosen) throw new Error('That menu card is not available.');
  const state = copy(inputState);
  const special = state.pendingSpecials[String(seat)];
  special.choice = chosen.id;
  const player = playerAt(state, seat);
  if (chosen.type === 'takeout_box') {
    // Choosing from the menu may legally do nothing; the player had no chance
    // to mark cards before seeing this option.
  } else if (chosen.type === 'special_order') {
    const target = [...player.playedThisRound].reverse().find((card) => !card.flipped);
    if (target) playRevealedCard(player, chosen, state, copyTargetProperties(target));
  } else {
    playRevealedCard(player, chosen, state);
  }
  addEvent(state, 'menu_card_chosen', { seat, cardId: chosen.id, cardType: chosen.type });
  state.actionLog.push({ seat, action: { type: 'choose_menu_card', cardId: chosen.id } });

  if (Object.values(state.pendingSpecials).every((entry) => entry.choice)) {
    const returned = Object.values(state.pendingSpecials).flatMap((entry) => entry.options.filter((card) => card.id !== entry.choice));
    const suffix = [...state.deck.slice(state.drawCursor), ...returned];
    const shuffled = shuffleCards(suffix, state.rngState);
    state.rngState = shuffled.rngState;
    state.deck.splice(state.drawCursor, state.deck.length - state.drawCursor, ...shuffled.cards);
    finalizeTurn(state);
  }
  return state;
}

const cardsOf = (playerOrCards) => Array.isArray(playerOrCards)
  ? playerOrCards
  : (playerOrCards?.playedThisRound ?? []);
const countType = (cards, type) => cards.reduce((sum, card) => sum + (!card.flipped && effectiveType(card) === type ? 1 : 0), 0);

export const scoreCookieSets = (playerOrCards) => Math.floor(countType(cardsOf(playerOrCards), 'cookie_set') / 2) * 5;
export const scoreAfternoonSets = (playerOrCards) => Math.floor(countType(cardsOf(playerOrCards), 'afternoon_set') / 3) * 10;

export function scoreSweetBuns(playerOrCards) {
  const count = countType(cardsOf(playerOrCards), 'sweet_bun');
  return [0, 1, 3, 6, 10, 15][Math.min(count, 5)];
}

export function scoreGuests(playerOrCards) {
  return cardsOf(playerOrCards).reduce((sum, card) => {
    const type = effectiveType(card);
    return sum + (!card.flipped && GUEST_TYPES.has(type) ? (card.basePoints ?? CARD_TYPES[type].basePoints) : 0);
  }, 0);
}

export function scoreCreamTopping(playerOrCards) {
  const cards = cardsOf(playerOrCards);
  const explicitPairs = cards.filter((card) => !card.flipped && GUEST_TYPES.has(effectiveType(card)) && card.creamToppingId);
  if (explicitPairs.length > 0 || cards.some((card) => !card.flipped && activeFamily(card) === 'cream_topping' && card.pairedWith)) {
    return explicitPairs.reduce((sum, guest) => sum + 2 * (guest.basePoints ?? CARD_TYPES[guest.type].basePoints), 0);
  }
  let available = 0;
  let bonus = 0;
  for (const card of cards) {
    if (card.flipped) continue;
    if (activeFamily(card) === 'cream_topping') available += 1;
    else if (GUEST_TYPES.has(effectiveType(card)) && available > 0) {
      available -= 1;
      bonus += 2 * (card.basePoints ?? CARD_TYPES[card.type].basePoints);
    }
  }
  return bonus;
}

export function drinkIcons(playerOrCards) {
  return cardsOf(playerOrCards).reduce((sum, card) => {
    const type = effectiveType(card);
    return sum + (!card.flipped && partyFamily(type) === 'drink' ? (card.drinkIcons ?? CARD_TYPES[type]?.drinkIcons ?? 0) : 0);
  }, 0);
}

export function scoreDrinkMajority(players) {
  const icons = players.map(drinkIcons);
  const points = players.map(() => 0);
  const highest = Math.max(...icons);
  if (highest <= 0) return points;
  const first = icons.map((value, seat) => value === highest ? seat : -1).filter((seat) => seat >= 0);
  if (first.length > 1) {
    const share = Math.floor(6 / first.length);
    for (const seat of first) points[seat] = share;
    return points;
  }
  points[first[0]] = 6;
  const secondValue = Math.max(0, ...icons.filter((value) => value < highest));
  if (secondValue > 0) {
    const second = icons.map((value, seat) => value === secondValue ? seat : -1).filter((seat) => seat >= 0);
    const share = Math.floor(3 / second.length);
    for (const seat of second) points[seat] = share;
  }
  return points;
}

export function scorePartyDrinkMajority(players) {
  const icons = players.map(drinkIcons);
  const points = players.map(() => 0);
  const awards = players.length >= 6 ? [6, 4, 2] : [6, 3];
  const levels = [...new Set(icons.filter((value) => value > 0))].sort((a, b) => b - a).slice(0, awards.length);
  levels.forEach((level, place) => icons.forEach((value, seat) => { if (value === level) points[seat] = awards[place]; }));
  return points;
}

export function scoreRound(player, allPlayers = [player]) {
  const seat = allPlayers.indexOf(player) >= 0 ? allPlayers.indexOf(player) : (player.seat ?? 0);
  if (player.variant === 'party') {
    const cone = player.partyMenu?.roll === 'cone_race' ? (scoreConeRace(allPlayers)[seat] ?? 0) : 0;
    const drinks = scorePartyDrinkMajority(allPlayers)[seat] ?? 0;
    const cards = player.playedThisRound ?? [];
    const breakdown = {
      sets: scoreCookieSets(cards) + scoreAfternoonSets(cards) + scoreSweetBuns(cards),
      guests: scoreGuests(cards) + scoreCreamTopping(cards),
      drinks,
      coneRace: cone,
      trayRace: player.instantRoundPoints ?? 0,
      caramel: scoreCaramel(cards),
      cheesecake: scoreCheesecake(cards),
      sandwiches: scoreSandwiches(cards),
      sprinkles: scoreSharedSprinkles(player, allPlayers),
      soup: scoreSoup(cards),
      loyalty: scoreLoyalty(player, allPlayers),
      tea: scoreTea(cards),
      takeout: scoreFlipped(cards),
    };
    return { ...breakdown, total: Object.values(breakdown).reduce((sum, value) => sum + value, 0) };
  }
  const drinks = scoreDrinkMajority(allPlayers)[seat] ?? 0;
  const breakdown = {
    cookies: scoreCookieSets(player),
    afternoonSets: scoreAfternoonSets(player),
    sweetBuns: scoreSweetBuns(player),
    guests: scoreGuests(player),
    creamTopping: scoreCreamTopping(player),
    drinks,
  };
  return { ...breakdown, total: Object.values(breakdown).reduce((sum, value) => sum + value, 0) };
}

export function scoreAdoptionPets(players) {
  const counts = players.map((player) => player.adoptionPets?.length ?? countType(cardsOf(player), 'adoption_pet'));
  const points = players.map(() => 0);
  const highest = Math.max(...counts);
  const lowest = Math.min(...counts);
  if (highest === lowest) return points;
  const leaders = counts.map((value, seat) => value === highest ? seat : -1).filter((seat) => seat >= 0);
  const leadShare = Math.floor(6 / leaders.length);
  for (const seat of leaders) points[seat] += leadShare;
  if (players.length > 2) {
    const last = counts.map((value, seat) => value === lowest ? seat : -1).filter((seat) => seat >= 0);
    const loss = Math.floor(6 / last.length);
    for (const seat of last) points[seat] -= loss;
  }
  return points;
}

export function scoreFinalGame(stateOrPlayers) {
  const players = Array.isArray(stateOrPlayers) ? stateOrPlayers : stateOrPlayers.players;
  const selectedDessert = Array.isArray(stateOrPlayers) ? null : stateOrPlayers.partyMenu?.dessert;
  const adoptionPoints = scoreAdoptionPets(players);
  const partyMode = players[0]?.variant === 'party';
  const scoredPlayers = players.map((player, seat) => ({
    seat,
    id: player.id,
    name: player.name,
    roundPoints: player.score,
    adoptionPoints: adoptionPoints[seat],
    ...scorePartyDesserts(player.desserts, selectedDessert),
    total: player.score + adoptionPoints[seat] + (partyMode
      ? Object.values(scorePartyDesserts(player.desserts, selectedDessert)).reduce((sum, value) => sum + value, 0)
      : 0),
    adoptionPets: player.adoptionPets?.length ?? 0,
    dessertCount: partyMode ? (player.desserts?.length ?? 0) : (player.adoptionPets?.length ?? 0),
  }));
  const winningScore = Math.max(...scoredPlayers.map((player) => player.total));
  const scoreLeaders = scoredPlayers.filter((player) => player.total === winningScore);
  const mostDessertsAmongLeaders = Math.max(...scoreLeaders.map((player) => player.dessertCount));
  return {
    players: scoredPlayers,
    winningScore,
    winners: scoreLeaders.filter((player) => player.dessertCount === mostDessertsAmongLeaders).map((player) => player.seat),
  };
}

function finishRound(state) {
  if (state.variant === 'party') awardTrayRace(state, true);
  const roundResults = state.players.map((player) => scoreRound(player, state.players));
  state.players.forEach((player, seat) => {
    const result = roundResults[seat];
    player.score += result.total;
    player.roundScores.push(result);
    player.roundHistory.push({
      round: state.round,
      cards: copy(player.playedThisRound),
      result: copy(result),
    });
  });
  addEvent(state, 'round_scored', {
    scores: roundResults.map((result, seat) => ({ seat, ...result })),
  });

  if (state.round >= state.totalRounds) {
    state.phase = 'game_over';
    state.result = scoreFinalGame(state);
    for (const result of state.result.players) state.players[result.seat].score = result.total;
    addEvent(state, 'game_finished', { result: copy(state.result) });
    return;
  }
  state.round += 1;
  dealRound(state);
}

export function getPlayerView(state, seat) {
  const me = playerAt(state, seat);
  const players = state.players.map((player) => {
    const common = {
      seat: player.seat,
      id: player.id,
      name: player.name,
      kind: player.kind,
      difficulty: player.difficulty,
      variant: player.variant,
      partyMenu: copy(player.partyMenu),
      score: player.score,
      handCount: player.hand.length,
      playedThisRound: copy(player.playedThisRound),
      adoptionPetCount: player.adoptionPets.length,
      dessertCount: player.desserts?.length ?? player.adoptionPets.length,
      desserts: copy(player.desserts ?? player.adoptionPets),
      roundScores: copy(player.roundScores),
    };
    return player.seat === seat ? { ...common, hand: copy(player.hand) } : common;
  });
  return {
    version: state.version,
    gameId: state.gameId,
    phase: state.phase,
    variant: state.variant,
    partyMenu: copy(state.partyMenu),
    round: state.round,
    totalRounds: state.totalRounds,
    turn: state.turn,
    remainingDeck: state.deck.length - state.drawCursor,
    seat,
    me: players[seat],
    players,
    selections: state.players.map((player) => ({
      seat: player.seat,
      locked: Boolean(state.pendingSelections[String(player.seat)]),
      ...(player.seat === seat && state.pendingSelections[String(player.seat)]
        ? { cardIds: copy(state.pendingSelections[String(player.seat)].cardIds) }
        : {}),
    })),
    specialChoice: state.phase === 'special_action' && state.pendingSpecials?.[String(seat)]
      ? { type: 'menu', options: copy(state.pendingSpecials[String(seat)].options), chosen: state.pendingSpecials[String(seat)].choice }
      : null,
    legalActions: getLegalActions(state, seat),
    events: copy(state.events),
    result: copy(state.result),
  };
}

export const serialize = (state) => JSON.stringify(state);

export function deserialize(serialized) {
  const state = typeof serialized === 'string' ? JSON.parse(serialized) : copy(serialized);
  if (!state || state.version !== 1 || !Array.isArray(state.players) || !Array.isArray(state.deck)) {
    throw new TypeError('Not a valid Puchate Café game state.');
  }
  return state;
}

export function replay(record, actions) {
  const parsed = typeof record === 'string' ? JSON.parse(record) : record;
  const config = parsed.initialConfig ?? parsed.config ?? parsed;
  const log = actions ?? parsed.actionLog ?? parsed.actions ?? [];
  let state = createGame(config);
  for (const entry of log) state = entry.action?.type === 'choose_menu_card'
    ? dispatchSpecialAction(state, entry.seat, entry.action)
    : dispatchAction(state, entry.seat, entry.action);
  return state;
}
