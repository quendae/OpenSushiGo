const CARD_ART = Object.freeze({
  cookie_set: { src: './assets/cards/cookie-set.webp', alt: 'Lisek piekarz z dwoma ciasteczkami' },
  afternoon_set: { src: './assets/cards/afternoon-set.webp', alt: 'Panda kelner z trzema podwieczorkami' },
  sweet_bun: { src: './assets/cards/sweet-bun.webp', alt: 'Chomik ze słodkimi bułeczkami' },
  drink_1: { src: './assets/cards/drink-1.webp', alt: 'Jeżyk z jednym kubkiem kakao' },
  drink_2: { src: './assets/cards/drink-2.webp', alt: 'Wydra z dwoma kubkami kakao' },
  drink_3: { src: './assets/cards/drink-3.webp', alt: 'Wydra z trzema kubkami kakao' },
  bunny_guest: { src: './assets/cards/bunny-guest.webp', alt: 'Króliczek przy stoliku w kawiarni' },
  cat_guest: { src: './assets/cards/cat-guest.webp', alt: 'Kotek przy stoliku w kawiarni' },
  dog_guest: { src: './assets/cards/dog-guest.webp', alt: 'Piesek przy stoliku w kawiarni' },
  adoption_pet: { src: './assets/cards/adoption-pet.webp', alt: 'Szczeniaczek w koszyku czekający na dom' },
  cream_topping: { src: './assets/cards/cream-topping.webp', alt: 'Owieczka nakładająca kremową polewę' },
  extra_paws: { src: './assets/cards/extra-paws.webp', alt: 'Szop pomagający czterema łapkami' },
});

const escapeAttribute = (value) => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function getCardArt(type) {
  const art = CARD_ART[type];
  if (!art) return '<span class="card-art-missing" aria-hidden="true">?</span>';
  return `<img class="card-art-image" src="${escapeAttribute(art.src)}" alt="${escapeAttribute(art.alt)}" decoding="async">`;
}

export default CARD_ART;
