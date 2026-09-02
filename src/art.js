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
  cone_race: { src: './assets/cards/cone-race.webp', alt: 'Króliczek świętujący z rożkiem waflowym' },
  tray_race_1: { src: './assets/cards/tray-race.webp', alt: 'Panda biegnąca z tacą ciastek' },
  tray_race_2: { src: './assets/cards/tray-race.webp', alt: 'Panda biegnąca z tacą ciastek' },
  tray_race_3: { src: './assets/cards/tray-race.webp', alt: 'Panda biegnąca z tacą ciastek' },
  caramel_twist: { src: './assets/cards/caramel-twist.webp', alt: 'Wiewiórka z parą karmelków' },
  cheesecake: { src: './assets/cards/cheesecake.webp', alt: 'Miś prezentujący serniczki' },
  sandwich_circle: { src: './assets/cards/sandwich.webp', alt: 'Myszka z kanapkami w różnych kształtach' },
  sandwich_triangle: { src: './assets/cards/sandwich.webp', alt: 'Myszka z kanapkami w różnych kształtach' },
  sandwich_square: { src: './assets/cards/sandwich.webp', alt: 'Myszka z kanapkami w różnych kształtach' },
  sandwich_rectangle: { src: './assets/cards/sandwich.webp', alt: 'Myszka z kanapkami w różnych kształtach' },
  shared_sprinkles: { src: './assets/cards/shared-sprinkles.webp', alt: 'Szynszyla dzieląca się kolorową posypką' },
  soup_special: { src: './assets/cards/soup-special.webp', alt: 'Corgi podający zupę dnia' },
  loyalty_card: { src: './assets/cards/loyalty-card.webp', alt: 'Kot kierownik z kartą stałego gościa' },
  tea_pot: { src: './assets/cards/tea-pot.webp', alt: 'Alpaka nalewająca herbatę' },
  menu_card: { src: './assets/cards/menu-card.webp', alt: 'Jeżyk prezentujący menu dnia' },
  silver_spoon: { src: './assets/cards/silver-spoon.webp', alt: 'Szop z dużą srebrną łyżeczką' },
  special_order: { src: './assets/cards/special-order.webp', alt: 'Lisek realizujący zamówienie specjalne' },
  takeout_box: { src: './assets/cards/takeout-box.webp', alt: 'Wydra pakująca ciastka na wynos' },
  icecream_cake: { src: './assets/cards/icecream-cake.webp', alt: 'Niedźwiedź polarny z tortem lodowym' },
  fruit_basket: { src: './assets/cards/fruit-basket.webp', alt: 'Jelonek z koszem świeżych owoców' },
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
