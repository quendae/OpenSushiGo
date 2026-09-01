/**
 * Pure rules engine for Puchate Café.
 *
 * The canonical state intentionally contains hidden information. Give clients
 * only getPlayerView(state, seat), which redacts hands and locked choices.
 */

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

function shuffledDeck(seed) {
  const cards = buildDeck().map((card) => ({ ...card }));
  let rngState = hashSeed(seed);
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const random = nextRandom(rngState);
    rngState = random.state;
    const swapIndex = Math.floor(random.value * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }
  return { cards, rngState };
}

function normalizePlayers(config) {
  const supplied = config.players;
  const count = supplied?.length ?? config.playerCount ?? 2;
  if (!Number.isInteger(count) || count < 2 || count > 5) {
    throw new RangeError('Puchate Café requires 2–5 players.');
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
      hand: [],
      playedThisRound: [],
      adoptionPets: [],
      score: 0,
      roundScores: [],
      roundHistory: [],
    };
  });
}

function publicConfig(config, players, seed) {
  return {
    seed,
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
  const shuffled = shuffledDeck(seed);
  const state = {
    version: 1,
    // Online hosts should supply their room id. The fallback is deliberately
    // independent of the secret shuffle seed exposed only in canonical state.
    gameId: String(config.gameId ?? 'puchate-cafe-local'),
    seed,
    rngState: shuffled.rngState,
    phase: 'draft',
    round: 1,
    totalRounds: 3,
    turn: 1,
    deck: shuffled.cards,
    drawCursor: 0,
    players,
    pendingSelections: {},
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
  return player.playedThisRound.filter((card) => card.type === 'extra_paws');
}

export function getLegalActions(state, seat) {
  const player = playerAt(state, seat);
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
}

function playRevealedCard(player, card) {
  const played = { ...card, playedOrder: player.playedThisRound.length };
  if (played.type === 'adoption_pet') {
    player.adoptionPets.push(played);
    return played;
  }
  if (GUEST_TYPES.has(played.type)) {
    const topping = player.playedThisRound.find(
      (candidate) => candidate.type === 'cream_topping' && !candidate.pairedWith,
    );
    if (topping) {
      topping.pairedWith = played.id;
      played.creamToppingId = topping.id;
    }
  }
  player.playedThisRound.push(played);
  return played;
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
      remainder.push({
        id: paws.id,
        type: paws.type,
        name: paws.name,
        roundScoring: paws.roundScoring,
        endGameScoring: paws.endGameScoring,
      });
    }
    const revealed = selected.map((card) => playRevealedCard(player, card));
    leftovers[player.seat] = remainder;
    revealDetails.push({
      seat: player.seat,
      cardIds: revealed.map((card) => card.id),
      cardTypes: revealed.map((card) => card.type),
      usedExtraPaws: selection.useExtraPaws ?? null,
    });
  }

  // Passing left: cards leaving seat N become seat N+1's next hand.
  for (const player of state.players) {
    const fromSeat = (player.seat - 1 + state.players.length) % state.players.length;
    player.hand = leftovers[fromSeat];
  }
  addEvent(state, 'cards_revealed', { plays: revealDetails });
  state.pendingSelections = {};

  if (state.players.every((player) => player.hand.length === 0)) finishRound(state);
  else state.turn += 1;
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

const cardsOf = (playerOrCards) => Array.isArray(playerOrCards)
  ? playerOrCards
  : (playerOrCards?.playedThisRound ?? []);
const countType = (cards, type) => cards.reduce((sum, card) => sum + (card.type === type ? 1 : 0), 0);

export const scoreCookieSets = (playerOrCards) => Math.floor(countType(cardsOf(playerOrCards), 'cookie_set') / 2) * 5;
export const scoreAfternoonSets = (playerOrCards) => Math.floor(countType(cardsOf(playerOrCards), 'afternoon_set') / 3) * 10;

export function scoreSweetBuns(playerOrCards) {
  const count = countType(cardsOf(playerOrCards), 'sweet_bun');
  return [0, 1, 3, 6, 10, 15][Math.min(count, 5)];
}

export function scoreGuests(playerOrCards) {
  return cardsOf(playerOrCards).reduce((sum, card) => sum + (GUEST_TYPES.has(card.type) ? (card.basePoints ?? CARD_TYPES[card.type].basePoints) : 0), 0);
}

export function scoreCreamTopping(playerOrCards) {
  const cards = cardsOf(playerOrCards);
  const explicitPairs = cards.filter((card) => GUEST_TYPES.has(card.type) && card.creamToppingId);
  if (explicitPairs.length > 0 || cards.some((card) => card.type === 'cream_topping' && card.pairedWith)) {
    return explicitPairs.reduce((sum, guest) => sum + 2 * (guest.basePoints ?? CARD_TYPES[guest.type].basePoints), 0);
  }
  let available = 0;
  let bonus = 0;
  for (const card of cards) {
    if (card.type === 'cream_topping') available += 1;
    else if (GUEST_TYPES.has(card.type) && available > 0) {
      available -= 1;
      bonus += 2 * (card.basePoints ?? CARD_TYPES[card.type].basePoints);
    }
  }
  return bonus;
}

export function drinkIcons(playerOrCards) {
  return cardsOf(playerOrCards).reduce((sum, card) => sum + (card.drinkIcons ?? CARD_TYPES[card.type]?.drinkIcons ?? 0), 0);
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

export function scoreRound(player, allPlayers = [player]) {
  const seat = allPlayers.indexOf(player) >= 0 ? allPlayers.indexOf(player) : (player.seat ?? 0);
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
  const adoptionPoints = scoreAdoptionPets(players);
  const scoredPlayers = players.map((player, seat) => ({
    seat,
    id: player.id,
    name: player.name,
    roundPoints: player.score,
    adoptionPoints: adoptionPoints[seat],
    total: player.score + adoptionPoints[seat],
    adoptionPets: player.adoptionPets?.length ?? 0,
  }));
  const winningScore = Math.max(...scoredPlayers.map((player) => player.total));
  return {
    players: scoredPlayers,
    winningScore,
    winners: scoredPlayers.filter((player) => player.total === winningScore).map((player) => player.seat),
  };
}

function finishRound(state) {
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
      score: player.score,
      handCount: player.hand.length,
      playedThisRound: copy(player.playedThisRound),
      adoptionPetCount: player.adoptionPets.length,
      roundScores: copy(player.roundScores),
    };
    return player.seat === seat ? { ...common, hand: copy(player.hand) } : common;
  });
  return {
    version: state.version,
    gameId: state.gameId,
    phase: state.phase,
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
  for (const entry of log) state = dispatchAction(state, entry.seat, entry.action);
  return state;
}
