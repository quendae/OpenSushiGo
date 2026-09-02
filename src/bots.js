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
  if (!card) return -100;
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
    case 'cone_race': return same < 2 ? 3.5 : 2.2;
    case 'tray_race_1': return 1.4;
    case 'tray_race_2': return 2.8;
    case 'tray_race_3': return 4.2;
    case 'caramel_twist': return same === 0 ? -1 : same === 1 ? 10 : 1;
    case 'cheesecake': return same === 0 ? 2.5 : same === 1 ? 4.5 : -3;
    case 'sandwich_circle':
    case 'sandwich_triangle':
    case 'sandwich_square':
    case 'sandwich_rectangle': return ownCards.some((played) => played.type === card.type) ? 1.5 : 4;
    case 'shared_sprinkles': return 2.5 + view.players.filter((player) => player.playedThisRound.some((played) => played.type === 'shared_sprinkles')).length;
    case 'soup_special': return 3.3;
    case 'loyalty_card': return 3.2;
    case 'tea_pot': return Math.max(2, ...Object.values(ownCards.reduce((groups, played) => ({ ...groups, [played.type]: (groups[played.type] ?? 0) + 1 }), {})));
    case 'menu_card': return 3.4;
    case 'silver_spoon': return view.me.handCount > 2 ? 3.2 : 0;
    case 'special_order': {
      const targets = ownCards.filter((played) => played.type !== 'special_order');
      return targets.length ? Math.max(...targets.map((played) => cardValue(played, view))) : 0;
    }
    case 'takeout_box': return ownCards.some((played) => played.type === 'caramel_twist') ? 4 : 1.5;
    case 'icecream_cake': return same % 4 === 3 ? 9 : 2.7;
    case 'fruit_basket': return 3;
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
  if (legal[0].type === 'choose_menu_card') {
    const ranked = legal.map((action) => ({ action, value: cardValue(view.specialChoice.options.find((card) => card.id === action.cardId), view) }));
    return ranked.sort((a, b) => b.value - a.value)[0].action;
  }
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
  const chosen = { ...best[salt % best.length] };
  const selected = view.me.hand.find((card) => card.id === chosen.cardIds[0]);
  if (chosen.useSpoon) {
    const menu = view.partyMenu;
    const families = menu ? [menu.roll, ...menu.appetizers, ...menu.specials].filter((family) => family !== 'silver_spoon') : ['dog_guest'];
    chosen.requestedType = families[salt % families.length];
  }
  if (selected?.type === 'special_order') {
    const targets = view.me.playedThisRound.filter((card) => !card.flipped);
    if (targets.length) chosen.specialOrderTargetId = targets.sort((a, b) => cardValue(b, view) - cardValue(a, view))[0].id;
  }
  if (selected?.type === 'takeout_box') {
    chosen.takeoutTargetIds = view.me.playedThisRound
      .filter((card) => !card.flipped && (card.type === 'caramel_twist' || card.type === 'cheesecake'))
      .map((card) => card.id);
  }
  return chosen;
}

export const easyBot = (view) => chooseBotAction(view, 'easy');
export const normalBot = (view) => chooseBotAction(view, 'normal');

export function createBot(difficulty = 'normal') {
  if (!['easy', 'normal'].includes(difficulty)) throw new RangeError('Bot difficulty must be easy or normal.');
  return Object.freeze({ difficulty, chooseAction: (view) => chooseBotAction(view, difficulty) });
}
