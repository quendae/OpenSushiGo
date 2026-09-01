import { CARD_TYPES } from './core.js';

const hash = (text) => {
  let value = 2166136261;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
};

function cardValue(card, view) {
  const ownCards = view.me.playedThisRound;
  const same = ownCards.filter((played) => played.type === card.type).length;
  switch (card.type) {
    case 'cookie_set': return same % 2 === 1 ? 5 : 1.5;
    case 'afternoon_set': return same % 3 === 2 ? 8 : (same % 3 === 1 ? 3.5 : 1.3);
    case 'sweet_bun': return [1, 2, 3, 4, 5, 1][Math.min(same, 5)];
    case 'drink_1':
    case 'drink_2':
    case 'drink_3': {
      const ownIcons = ownCards.reduce((sum, played) => sum + (played.drinkIcons ?? 0), 0);
      const bestOpponent = Math.max(0, ...view.players.filter((player) => player.seat !== view.seat)
        .map((player) => player.playedThisRound.reduce((sum, played) => sum + (played.drinkIcons ?? 0), 0)));
      return (card.drinkIcons ?? CARD_TYPES[card.type].drinkIcons) * (ownIcons <= bestOpponent ? 2.2 : 1.2);
    }
    case 'bunny_guest':
    case 'cat_guest':
    case 'dog_guest': {
      const unusedCream = ownCards.filter((played) => played.type === 'cream_topping' && !played.pairedWith).length;
      return (card.basePoints ?? CARD_TYPES[card.type].basePoints) * (unusedCream ? 3 : 1);
    }
    case 'cream_topping': return 2.8 + Math.max(0, 1 - ownCards.filter((played) => played.type === 'cream_topping' && !played.pairedWith).length);
    case 'extra_paws': return view.me.handCount > 2 ? 3.2 : 0;
    case 'adoption_pet': {
      const most = Math.max(...view.players.map((player) => player.adoptionPetCount));
      return 3.5 + (view.me.adoptionPetCount <= most ? 1.5 : 0);
    }
    default: return 0;
  }
}

function evaluate(action, view) {
  const cards = action.cardIds.map((id) => view.me.hand.find((card) => card.id === id));
  let value = cards.reduce((sum, card) => sum + cardValue(card, view), 0);
  // Preserve order-sensitive cream + guest combos in a double choice.
  if (cards.length === 2 && cards[0].type === 'cream_topping' && cards[1].basePoints) {
    value += cards[1].basePoints * 2;
  }
  if (action.useExtraPaws) value += 0.75;
  return value;
}

/** Choose a legal action using only the redacted view for this seat. */
export function chooseBotAction(view, difficulty = view.me?.difficulty ?? 'normal') {
  const legal = view.legalActions ?? [];
  if (legal.length === 0) return null;
  const salt = hash(`${view.gameId}:${view.round}:${view.turn}:${view.seat}`);
  if (difficulty === 'easy') return legal[salt % legal.length];

  let bestValue = -Infinity;
  let best = [];
  for (const action of legal) {
    const value = evaluate(action, view);
    if (value > bestValue) {
      bestValue = value;
      best = [action];
    } else if (value === bestValue) best.push(action);
  }
  return best[salt % best.length];
}

export const easyBot = (view) => chooseBotAction(view, 'easy');
export const normalBot = (view) => chooseBotAction(view, 'normal');

export function createBot(difficulty = 'normal') {
  if (!['easy', 'normal'].includes(difficulty)) throw new RangeError('Bot difficulty must be easy or normal.');
  return Object.freeze({ difficulty, chooseAction: (view) => chooseBotAction(view, difficulty) });
}

