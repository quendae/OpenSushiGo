import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_TYPES,
  buildDeck,
  createGame,
  deserialize,
  dispatchAction,
  getLegalActions,
  getPlayerView,
  replay,
  scoreAdoptionPets,
  scoreAfternoonSets,
  scoreCookieSets,
  scoreCreamTopping,
  scoreDrinkMajority,
  scoreFinalGame,
  scoreGuests,
  scoreRound,
  scoreSweetBuns,
  serialize,
} from '../src/core.js';
import { chooseBotAction, createBot, easyBot, normalBot } from '../src/bots.js';

const deck = buildDeck();
const cards = (type, count) => deck.filter((card) => card.type === type).slice(0, count).map((card) => ({ ...card }));
const player = (playedThisRound = [], adoptionCount = 0, score = 0, seat = 0) => ({
  seat,
  id: `p${seat}`,
  name: `P${seat}`,
  playedThisRound,
  adoptionPets: cards('adoption_pet', adoptionCount),
  score,
});

test('base deck has exactly 108 unique cards in the specified proportions', () => {
  assert.equal(deck.length, 108);
  assert.equal(new Set(deck.map((card) => card.id)).size, 108);
  for (const [type, definition] of Object.entries(CARD_TYPES)) {
    assert.equal(deck.filter((card) => card.type === type).length, definition.count, type);
  }
});

test('serialization preserves all cards and deserialize returns an independent state', () => {
  const state = createGame({ playerCount: 5, seed: 'serialization' });
  const restored = deserialize(serialize(state));
  assert.equal(restored.deck.length, 108);
  assert.deepEqual(restored, state);
  restored.players[0].hand.pop();
  assert.notEqual(restored.players[0].hand.length, state.players[0].hand.length);
});

test('seeded setup is deterministic and seeds change the deal', () => {
  const first = createGame({ playerCount: 3, seed: 'same' });
  const second = createGame({ playerCount: 3, seed: 'same' });
  const other = createGame({ playerCount: 3, seed: 'other' });
  assert.deepEqual(first.players.map((p) => p.hand.map((c) => c.id)), second.players.map((p) => p.hand.map((c) => c.id)));
  assert.notDeepEqual(first.players[0].hand.map((c) => c.id), other.players[0].hand.map((c) => c.id));
});

test('player count and hand sizes follow the rules', () => {
  for (const [count, handSize] of [[2, 10], [3, 9], [4, 8], [5, 7]]) {
    const state = createGame({ playerCount: count, seed: count });
    assert.deepEqual(state.players.map((p) => p.hand.length), Array(count).fill(handSize));
  }
  assert.throws(() => createGame({ playerCount: 1 }), /2–5/);
  assert.throws(() => createGame({ playerCount: 6 }), /2–5/);
});

test('set scoring covers pairs, triples and the sweet bun progression', () => {
  assert.equal(scoreCookieSets(cards('cookie_set', 1)), 0);
  assert.equal(scoreCookieSets(cards('cookie_set', 2)), 5);
  assert.equal(scoreCookieSets(cards('cookie_set', 3)), 5);
  assert.equal(scoreCookieSets(cards('cookie_set', 4)), 10);
  assert.equal(scoreAfternoonSets(cards('afternoon_set', 2)), 0);
  assert.equal(scoreAfternoonSets(cards('afternoon_set', 3)), 10);
  assert.equal(scoreAfternoonSets(cards('afternoon_set', 6)), 20);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((n) => scoreSweetBuns(cards('sweet_bun', n))), [1, 3, 6, 10, 15, 15]);
});

test('guests score base points and cream triples only a later guest', () => {
  const bunny = cards('bunny_guest', 1)[0];
  const cat = cards('cat_guest', 1)[0];
  const dog = cards('dog_guest', 1)[0];
  const cream = cards('cream_topping', 2);
  assert.equal(scoreGuests([bunny]), 1);
  assert.equal(scoreGuests([cat]), 2);
  assert.equal(scoreGuests([dog]), 3);
  assert.equal(scoreGuests([bunny, cat, dog]), 6);
  assert.equal(scoreCreamTopping([cream[0], bunny]), 2);
  assert.equal(scoreCreamTopping([cream[0], cat]), 4);
  assert.equal(scoreCreamTopping([cream[0], dog]), 6);
  assert.equal(scoreCreamTopping([dog, cream[0]]), 0);
  assert.equal(scoreCreamTopping([cream[0], cream[1], dog]), 6);
});

test('drink popularity handles first, second and all specified ties', () => {
  const d1 = cards('drink_1', 3);
  const d2 = cards('drink_2', 3);
  const d3 = cards('drink_3', 3);
  assert.deepEqual(scoreDrinkMajority([player([d3[0]]), player([d2[0]], 0, 0, 1), player([d1[0]], 0, 0, 2)]), [6, 3, 0]);
  assert.deepEqual(scoreDrinkMajority([player([d2[0]]), player([d2[1]], 0, 0, 1), player([d1[0]], 0, 0, 2)]), [3, 3, 0]);
  assert.deepEqual(scoreDrinkMajority([player([d3[0]]), player([d2[0]], 0, 0, 1), player([d2[1]], 0, 0, 2)]), [6, 1, 1]);
  assert.deepEqual(scoreDrinkMajority([player([]), player([], 0, 0, 1)]), [0, 0]);
});

test('adoption pets score only at game end, including ties and two-player exception', () => {
  const three = [player([], 4, 10), player([], 2, 11, 1), player([], 1, 12, 2)];
  assert.equal(scoreRound(three[0], three).total, 0);
  assert.deepEqual(scoreAdoptionPets(three), [6, 0, -6]);
  assert.deepEqual(scoreAdoptionPets([player([], 4), player([], 1, 0, 1)]), [6, 0]);
  assert.deepEqual(scoreAdoptionPets([player([], 4), player([], 4, 0, 1), player([], 1, 0, 2), player([], 1, 0, 3)]), [3, 3, -3, -3]);
  assert.deepEqual(scoreAdoptionPets([player([], 2), player([], 2, 0, 1), player([], 2, 0, 2)]), [0, 0, 0]);
  const result = scoreFinalGame(three);
  assert.deepEqual(result.players.map((p) => p.total), [16, 11, 6]);
  assert.deepEqual(result.winners, [0]);
});

test('round breakdown adds each category without counting adoption or Extra Paws', () => {
  const tableau = [
    ...cards('cookie_set', 2),
    ...cards('afternoon_set', 3),
    ...cards('sweet_bun', 3),
    ...cards('extra_paws', 1),
    ...cards('cream_topping', 1),
    ...cards('dog_guest', 1),
  ];
  const p = player(tableau);
  assert.deepEqual(scoreRound(p, [p]), {
    cookies: 5,
    afternoonSets: 10,
    sweetBuns: 6,
    guests: 3,
    creamTopping: 6,
    drinks: 0,
    total: 30,
  });
});

test('simultaneous barrier hides opponent choices and resolves only after everyone locks', () => {
  const original = createGame({ playerCount: 3, seed: 'barrier' });
  const originalJson = serialize(original);
  const firstAction = getLegalActions(original, 0)[0];
  const afterOne = dispatchAction(original, 0, firstAction);
  assert.equal(serialize(original), originalJson, 'dispatch must not mutate input');
  assert.equal(afterOne.players[0].hand.length, 9);
  assert.equal(afterOne.players[0].playedThisRound.length, 0);
  assert.equal(getPlayerView(afterOne, 1).selections[0].locked, true);
  assert.equal('cardIds' in getPlayerView(afterOne, 1).selections[0], false);
  assert.deepEqual(getPlayerView(afterOne, 0).selections[0].cardIds, firstAction.cardIds);
  assert.equal(getLegalActions(afterOne, 0).length, 0);

  let state = dispatchAction(afterOne, 1, getLegalActions(afterOne, 1)[0]);
  state = dispatchAction(state, 2, getLegalActions(state, 2)[0]);
  assert.equal(state.turn, 2);
  assert.deepEqual(state.players.map((p) => p.playedThisRound.length + p.adoptionPets.length), [1, 1, 1]);
  assert.deepEqual(state.players.map((p) => p.hand.length), [8, 8, 8]);
  assert.equal(state.events.at(-1).type, 'cards_revealed');
});

test('player view does not expose shuffle state, deck, seed, or an opponent card choice', () => {
  const state = createGame({ playerCount: 3, seed: 'server-secret' });
  const locked = dispatchAction(state, 0, getLegalActions(state, 0)[0]);
  const viewJson = JSON.stringify(getPlayerView(locked, 1));
  assert.equal(viewJson.includes('server-secret'), false);
  assert.equal(viewJson.includes('rngState'), false);
  assert.equal(viewJson.includes('pendingSelections'), false);
  assert.equal(viewJson.includes('"deck"'), false);
  assert.equal(viewJson.includes(locked.pendingSelections['0'].cardIds[0]), false);
});

test('invalid, duplicate and repeated choices are rejected', () => {
  const state = createGame({ playerCount: 2, seed: 'invalid' });
  assert.throws(() => dispatchAction(state, 0, { type: 'play_cards', cardIds: ['missing'] }), /not in this hand/);
  assert.throws(() => dispatchAction(state, 0, { type: 'play_cards', cardIds: [state.players[0].hand[0].id, state.players[0].hand[0].id], useExtraPaws: 'x' }), /different cards/);
  const locked = dispatchAction(state, 0, getLegalActions(state, 0)[0]);
  assert.throws(() => dispatchAction(locked, 0, { type: 'play_cards', cardIds: [state.players[0].hand[1].id] }), /already locked/);
});

test('Extra Paws selects two, returns itself to the passed hand, and cannot be reused in a turn', () => {
  const state = createGame({ playerCount: 2, seed: 'paws' });
  const customized = deserialize(serialize(state));
  const paws = cards('extra_paws', 1)[0];
  customized.players[0].playedThisRound = [{ ...paws }];
  customized.players[0].hand = [...cards('cream_topping', 1), ...cards('dog_guest', 1), ...cards('cookie_set', 1)];
  customized.players[1].hand = [...cards('sweet_bun', 3)];
  customized.pendingSelections = {};
  const double = getLegalActions(customized, 0).find((action) =>
    action.useExtraPaws === paws.id && action.cardIds[0].startsWith('cream') && action.cardIds[1].startsWith('dog'));
  assert.ok(double);
  let next = dispatchAction(customized, 0, double);
  assert.equal(getLegalActions(next, 0).length, 0);
  next = dispatchAction(next, 1, getLegalActions(next, 1)[0]);
  assert.equal(next.players[0].playedThisRound.filter((card) => card.type === 'extra_paws').length, 0);
  assert.equal(next.players[0].playedThisRound.find((card) => card.type === 'dog_guest').creamToppingId.startsWith('cream_topping'), true);
  assert.equal(next.players[1].hand.some((card) => card.id === paws.id), true, 'returned paws passes left');
});

test('a full deterministic game completes three rounds without losing or duplicating cards', () => {
  let state = createGame({ playerCount: 5, seed: 'full-game' });
  const seenRoundStarts = [];
  while (state.phase !== 'game_over') {
    seenRoundStarts.push(`${state.round}:${state.turn}`);
    for (let seat = 0; seat < state.players.length; seat += 1) {
      state = dispatchAction(state, seat, getLegalActions(state, seat)[0]);
    }
  }
  assert.equal(state.round, 3);
  assert.deepEqual(state.players.map((p) => p.roundScores.length), [3, 3, 3, 3, 3]);
  assert.equal(state.drawCursor, 105);
  assert.ok(state.result);
  assert.equal(state.events.filter((event) => event.type === 'round_scored').length, 3);
  assert.equal(state.events.at(-1).type, 'game_finished');
  const allIds = [
    ...state.deck.slice(state.drawCursor).map((card) => card.id),
    ...state.players.flatMap((p) => [
      ...p.adoptionPets,
      ...p.roundHistory.flatMap((history) => history.cards),
    ]).map((card) => card.id),
  ];
  assert.equal(allIds.length, 108);
  assert.equal(new Set(allIds).size, 108);
});

test('action log can replay a game to exactly the same public outcome', () => {
  let state = createGame({ playerCount: 2, seed: 'replay-me' });
  for (let turn = 0; turn < 4; turn += 1) {
    for (let seat = 0; seat < 2; seat += 1) state = dispatchAction(state, seat, getLegalActions(state, seat)[0]);
  }
  const restored = replay(serialize(state));
  assert.deepEqual(restored.players.map((p) => p.hand), state.players.map((p) => p.hand));
  assert.deepEqual(restored.players.map((p) => p.playedThisRound), state.players.map((p) => p.playedThisRound));
  assert.deepEqual(restored.events, state.events);
});

test('easy and normal bots use the view and always return a listed legal action', () => {
  const state = createGame({
    seed: 'bots',
    players: [{ name: 'Human' }, { name: 'Easy', kind: 'bot', difficulty: 'easy' }, { name: 'Normal', kind: 'bot' }],
  });
  for (const seat of [1, 2]) {
    const view = getPlayerView(state, seat);
    assert.equal(view.players.filter((p) => 'hand' in p).length, 1);
    for (const action of [chooseBotAction(view), seat === 1 ? easyBot(view) : normalBot(view), createBot(view.me.difficulty).chooseAction(view)]) {
      assert.ok(view.legalActions.some((legal) => JSON.stringify(legal) === JSON.stringify(action)));
    }
  }
});
