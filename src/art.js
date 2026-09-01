const OUTLINE = '#553f42';

const svg = (label, background, content, accent = '#fff8ed') => `
<svg class="card-art-svg" viewBox="0 0 180 156" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="156" rx="24" fill="${background}"/>
  <circle cx="25" cy="25" r="12" fill="${accent}" opacity=".5"/><circle cx="156" cy="35" r="17" fill="${accent}" opacity=".38"/>
  <path d="M11 129c29-25 50-13 74-4 24 9 48-16 84 3v28H11Z" fill="${accent}" opacity=".62"/>
  ${content}
</svg>`;

const eyes = (x1, x2, y, r = 3) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="${OUTLINE}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${OUTLINE}"/><circle cx="${x1 - 1}" cy="${y - 1}" r="1" fill="white"/><circle cx="${x2 - 1}" cy="${y - 1}" r="1" fill="white"/>`;

export const CARD_ART = Object.freeze({
  cookie_set: svg('Lisek z zestawem ciasteczek', '#ffd6ae', `
    <ellipse cx="90" cy="129" rx="60" ry="11" fill="#c98363" opacity=".18"/>
    <path d="M54 58 42 27 70 43M126 58l12-31-28 16" fill="#e9835e" stroke="${OUTLINE}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 77c0-29 18-47 40-47s40 18 40 47v24c0 22-17 36-40 36s-40-14-40-36Z" fill="#ed946b" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M58 55c13 2 21 11 32 21 11-10 19-19 32-21-7-14-18-23-32-23S65 41 58 55Z" fill="#fff2dc"/>
    ${eyes(73, 107, 79, 4)}<path d="M84 91q6 8 12 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/><path d="m90 86-4 4h8Z" fill="${OUTLINE}"/>
    <circle cx="48" cy="116" r="19" fill="#f4bd72" stroke="${OUTLINE}" stroke-width="4"/><circle cx="42" cy="110" r="2.5" fill="#8a604d"/><circle cx="54" cy="119" r="3" fill="#8a604d"/><circle cx="45" cy="126" r="2" fill="#8a604d"/>
    <circle cx="132" cy="116" r="19" fill="#f4bd72" stroke="${OUTLINE}" stroke-width="4"/><circle cx="126" cy="109" r="2.5" fill="#8a604d"/><circle cx="139" cy="120" r="3" fill="#8a604d"/>
  `),
  afternoon_set: svg('Panda z popołudniowym zestawem', '#f9c4cf', `
    <ellipse cx="90" cy="132" rx="60" ry="10" fill="#9f6172" opacity=".16"/>
    <circle cx="59" cy="52" r="19" fill="#55484c"/><circle cx="121" cy="52" r="19" fill="#55484c"/>
    <path d="M48 82c0-34 18-55 42-55s42 21 42 55v24c0 22-17 34-42 34s-42-12-42-34Z" fill="#fff9ee" stroke="${OUTLINE}" stroke-width="5"/>
    <ellipse cx="70" cy="77" rx="12" ry="15" fill="#66565a" transform="rotate(20 70 77)"/><ellipse cx="110" cy="77" rx="12" ry="15" fill="#66565a" transform="rotate(-20 110 77)"/>
    ${eyes(70, 110, 78, 3.5)}<path d="m90 88-5 4 5 4 5-4Z" fill="${OUTLINE}"/><path d="M90 96v5" stroke="${OUTLINE}" stroke-width="3"/>
    <path d="M37 120h106l-8 24H45Z" fill="#d98e8d" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/><rect x="57" y="107" width="24" height="15" rx="5" fill="#a9d9ce" stroke="${OUTLINE}" stroke-width="3"/><path d="M81 111h7a5 5 0 0 1 0 9h-7" fill="none" stroke="${OUTLINE}" stroke-width="3"/><path d="m101 121 8-18 12 18" fill="#f0bf72" stroke="${OUTLINE}" stroke-width="3"/><circle cx="109" cy="101" r="3" fill="#e97978"/>
  `),
  sweet_bun: svg('Chomik ze słodką bułeczką', '#ffe09b', `
    <ellipse cx="90" cy="133" rx="58" ry="10" fill="#b27c48" opacity=".16"/>
    <circle cx="54" cy="67" r="18" fill="#d6945d" stroke="${OUTLINE}" stroke-width="5"/><circle cx="126" cy="67" r="18" fill="#d6945d" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M47 88c0-34 19-55 43-55s43 21 43 55v16c0 24-18 38-43 38s-43-14-43-38Z" fill="#e9a96f" stroke="${OUTLINE}" stroke-width="5"/>
    <ellipse cx="58" cy="101" rx="15" ry="11" fill="#f7c2a0"/><ellipse cx="122" cy="101" rx="15" ry="11" fill="#f7c2a0"/>${eyes(72, 108, 83, 4)}
    <path d="M84 95q6 9 12 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/><path d="m90 90-4 4h8Z" fill="${OUTLINE}"/>
    <path d="M59 130c2-22 13-35 31-35s29 13 31 35c-12 8-50 8-62 0Z" fill="#f3bd65" stroke="${OUTLINE}" stroke-width="4"/><path d="M69 115c13 7 29 7 42 0M73 105c10 6 24 6 34 0" fill="none" stroke="#c77d51" stroke-width="3" stroke-linecap="round"/>
  `),
  drink_1: svg('Jeżyk z filiżanką', '#a9ddd4', `
    <ellipse cx="90" cy="134" rx="57" ry="9" fill="#477c77" opacity=".17"/>
    <path d="M45 106 35 82l14 1-8-15 16 5-1-18 16 9 5-19 13 14 13-14 5 19 16-9-1 18 16-5-8 15 14-1-10 24Z" fill="#9b6f5d" stroke="${OUTLINE}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M54 88c0-27 16-44 36-44s36 17 36 44v19c0 20-15 32-36 32s-36-12-36-32Z" fill="#e6b483" stroke="${OUTLINE}" stroke-width="5"/>
    ${eyes(75, 105, 85, 3.5)}<path d="m90 95-4 4 4 4 4-4Z" fill="${OUTLINE}"/><path d="M90 103v4" stroke="${OUTLINE}" stroke-width="3"/>
    <path d="M68 112h44v20c0 10-8 15-22 15s-22-5-22-15Z" fill="#fff6e6" stroke="${OUTLINE}" stroke-width="4"/><path d="M112 117h8a10 10 0 0 1 0 20h-8" fill="none" stroke="${OUTLINE}" stroke-width="4"/><path d="M79 105q-6-9 1-16M94 105q-6-9 1-16" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  `),
  drink_2: svg('Wydra z dwoma kubkami kakao', '#8fd5cf', `
    <ellipse cx="90" cy="135" rx="63" ry="9" fill="#427d77" opacity=".17"/>
    <circle cx="57" cy="55" r="14" fill="#9b735d" stroke="${OUTLINE}" stroke-width="5"/><circle cx="123" cy="55" r="14" fill="#9b735d" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M46 86c0-34 19-55 44-55s44 21 44 55v25c0 22-18 34-44 34s-44-12-44-34Z" fill="#b9886b" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M68 71q22-21 44 0v26q-4 21-22 21T68 97Z" fill="#efd2af"/>${eyes(74, 106, 81, 4)}<ellipse cx="90" cy="94" rx="8" ry="6" fill="${OUTLINE}"/><path d="M90 100v6m0 0q-7 7-12 1m12-1q7 7 12 1" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M35 113h37v21c0 9-7 14-18 14s-19-5-19-14Z" fill="#f5b5c0" stroke="${OUTLINE}" stroke-width="4"/><path d="M72 118h7a9 9 0 0 1 0 18h-7" fill="none" stroke="${OUTLINE}" stroke-width="4"/><path d="M108 113h37v21c0 9-7 14-18 14s-19-5-19-14Z" fill="#f7d683" stroke="${OUTLINE}" stroke-width="4"/><path d="M145 118h6a9 9 0 0 1 0 18h-6" fill="none" stroke="${OUTLINE}" stroke-width="4"/>
  `),
  drink_3: svg('Niedźwiadek z tacą napojów', '#6cc8c2', `
    <ellipse cx="90" cy="137" rx="70" ry="9" fill="#347670" opacity=".2"/>
    <circle cx="57" cy="54" r="17" fill="#93674f" stroke="${OUTLINE}" stroke-width="5"/><circle cx="123" cy="54" r="17" fill="#93674f" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M47 88c0-36 19-58 43-58s43 22 43 58v22c0 23-18 36-43 36s-43-13-43-36Z" fill="#ae7b5e" stroke="${OUTLINE}" stroke-width="5"/>
    <ellipse cx="90" cy="96" rx="24" ry="19" fill="#e6bd93"/>${eyes(73, 107, 79, 4)}<ellipse cx="90" cy="91" rx="7" ry="5" fill="${OUTLINE}"/><path d="M90 96v7m0 0q-6 6-11 1m11-1q6 6 11 1" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 135h130" stroke="${OUTLINE}" stroke-width="6" stroke-linecap="round"/>
    <g stroke="${OUTLINE}" stroke-width="3"><path d="M35 108h29v27H35Z" fill="#f4c3cf"/><path d="M76 105h29v30H76Z" fill="#fff4df"/><path d="M117 110h29v25h-29Z" fill="#bde3d7"/></g><g fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M46 102v-9"/><path d="M87 100v-10"/><path d="M129 104v-9"/></g>
  `),
  bunny_guest: svg('Króliczek przy stoliku', '#bedcf3', `
    <ellipse cx="90" cy="137" rx="58" ry="9" fill="#5682a0" opacity=".16"/>
    <path d="M64 58C48 32 53 8 65 9c12 1 17 25 16 47M116 58c16-26 11-50-1-49-12 1-17 25-16 47" fill="#f4e6d2" stroke="${OUTLINE}" stroke-width="5"/><path d="M64 48c-6-18-4-28 0-29 5 0 8 13 9 29M116 48c6-18 4-28 0-29-5 0-8 13-9 29" fill="none" stroke="#e9a9b5" stroke-width="5" stroke-linecap="round"/>
    <path d="M48 87c0-31 18-51 42-51s42 20 42 51v21c0 23-18 36-42 36s-42-13-42-36Z" fill="#fff7e9" stroke="${OUTLINE}" stroke-width="5"/>
    ${eyes(73, 107, 81, 4)}<path d="m90 92-5 4 5 5 5-5Z" fill="#e68f9b"/><path d="M90 101v7m0 0q-7 6-12 0m12 0q7 6 12 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="62" cy="98" r="7" fill="#f6c2c8" opacity=".65"/><circle cx="118" cy="98" r="7" fill="#f6c2c8" opacity=".65"/><path d="M30 136h120" stroke="#7d584e" stroke-width="8" stroke-linecap="round"/><path d="M105 115h27v21h-27Z" fill="#a8dcd5" stroke="${OUTLINE}" stroke-width="3"/>
  `),
  cat_guest: svg('Kotek przy stoliku', '#c8c6f1', `
    <ellipse cx="90" cy="137" rx="58" ry="9" fill="#6b6497" opacity=".17"/>
    <path d="M52 63 48 25l30 20M128 63l4-38-30 20" fill="#c89172" stroke="${OUTLINE}" stroke-width="5" stroke-linejoin="round"/><path d="M57 48 55 34l13 10M123 48l2-14-13 10" fill="#e9a8aa"/>
    <path d="M48 81c0-31 18-50 42-50s42 19 42 50v27c0 23-17 36-42 36s-42-13-42-36Z" fill="#ddb18d" stroke="${OUTLINE}" stroke-width="5"/>
    ${eyes(72, 108, 81, 4)}<path d="m90 91-5 4 5 5 5-5Z" fill="#d97f87"/><path d="M90 100v6m0 0q-8 7-14 0m14 0q8 7 14 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/><path d="M58 96H37m21 8-19 4m83-12h21m-21 8 19 4" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M29 136h122" stroke="#7d584e" stroke-width="8" stroke-linecap="round"/><path d="M105 113h30v23h-30Z" fill="#f5d58c" stroke="${OUTLINE}" stroke-width="3"/><path d="M111 113q9-13 18 0" fill="#f0a6aa" stroke="${OUTLINE}" stroke-width="3"/>
  `),
  dog_guest: svg('Piesek przy stoliku', '#aebee9', `
    <ellipse cx="90" cy="137" rx="60" ry="9" fill="#536994" opacity=".17"/>
    <path d="M55 52C38 36 26 42 31 67c4 19 14 28 29 25M125 52c17-16 29-10 24 15-4 19-14 28-29 25" fill="#a86f51" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M48 83c0-33 18-53 42-53s42 20 42 53v25c0 23-17 36-42 36s-42-13-42-36Z" fill="#cb8c66" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M51 68c10-23 22-35 39-35v49c-17-9-28-14-39-14Z" fill="#f0c28e"/>${eyes(73, 107, 80, 4)}<ellipse cx="90" cy="94" rx="8" ry="6" fill="${OUTLINE}"/><path d="M90 100v5m0 0q-7 7-13 1m13-1q7 7 13 1" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/><path d="M86 112q4 7 8 0" fill="#e97885" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M27 136h126" stroke="#7d584e" stroke-width="8" stroke-linecap="round"/><path d="M105 108h36v28h-36Z" fill="#f4b973" stroke="${OUTLINE}" stroke-width="3"/><path d="m105 108 18 15 18-15" fill="#fff2dd" stroke="${OUTLINE}" stroke-width="3"/>
  `),
  adoption_pet: svg('Szczeniaczek szukający domu', '#b9dfbd', `
    <ellipse cx="90" cy="137" rx="62" ry="9" fill="#507c57" opacity=".16"/>
    <path d="M42 76c-12-20-1-38 19-21M138 76c12-20 1-38-19-21" fill="#bd865e" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M48 87c0-31 18-50 42-50s42 19 42 50v21c0 22-17 34-42 34s-42-12-42-34Z" fill="#dba477" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M66 46q24-21 48 0" fill="#fff3dc"/>${eyes(73, 107, 82, 4)}<ellipse cx="90" cy="95" rx="7" ry="5" fill="${OUTLINE}"/><path d="M90 100v6m0 0q-7 6-12 0m12 0q7 6 12 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M35 108h110l-12 39H47Z" fill="#efb58e" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/><path d="M63 123h54" stroke="#fff0dd" stroke-width="4" stroke-linecap="round"/><path d="M73 110q17 13 34 0" fill="#9bc8a3" stroke="${OUTLINE}" stroke-width="3"/>
  `),
  cream_topping: svg('Owieczka z kremową polewą', '#f6e5c7', `
    <ellipse cx="90" cy="137" rx="58" ry="9" fill="#8c755a" opacity=".14"/>
    <g fill="#fffdf7" stroke="${OUTLINE}" stroke-width="4"><circle cx="56" cy="64" r="20"/><circle cx="70" cy="45" r="20"/><circle cx="92" cy="41" r="22"/><circle cx="113" cy="49" r="20"/><circle cx="126" cy="69" r="19"/></g>
    <path d="M48 80c0-27 18-43 42-43s42 16 42 43v29c0 22-17 34-42 34s-42-12-42-34Z" fill="#d9b899" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M52 61q38-25 76 0" fill="#fffdf7"/>${eyes(73, 107, 82, 4)}<path d="m90 93-5 4 5 5 5-5Z" fill="#876258"/><path d="M90 102v6m0 0q-7 6-12 0m12 0q7 6 12 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M65 134c3-18 12-29 25-29s22 11 25 29" fill="#fffaf0" stroke="${OUTLINE}" stroke-width="4"/><path d="M75 126q15-17 30 0" fill="none" stroke="#efbaca" stroke-width="5" stroke-linecap="round"/>
  `),
  extra_paws: svg('Szop pracz z dodatkową parą łapek', '#f3d9b3', `
    <ellipse cx="90" cy="137" rx="65" ry="9" fill="#8a7058" opacity=".16"/>
    <path d="M54 57 47 29l26 14M126 57l7-28-26 14" fill="#727076" stroke="${OUTLINE}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M47 84c0-33 19-53 43-53s43 20 43 53v25c0 23-18 36-43 36s-43-13-43-36Z" fill="#99979a" stroke="${OUTLINE}" stroke-width="5"/>
    <path d="M55 69q35-27 70 0c-7 23-20 34-35 34S62 92 55 69Z" fill="#5c5a61"/><path d="M68 48q22-16 44 0" fill="#efded0"/>${eyes(72, 108, 78, 4)}<path d="m90 91-6 4 6 5 6-5Z" fill="${OUTLINE}"/><path d="M90 100v6m0 0q-7 6-13 0m13 0q7 6 13 0" fill="none" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/>
    <path d="M49 113 26 99c-9-5-17 7-9 13l31 22M131 113l23-14c9-5 17 7 9 13l-31 22" fill="#77757b" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="108" r="8" fill="#efded0" stroke="${OUTLINE}" stroke-width="3"/><circle cx="162" cy="108" r="8" fill="#efded0" stroke="${OUTLINE}" stroke-width="3"/>
  `)
});

export function getCardArt(type) {
  return CARD_ART[type] || svg('Tajemnicza karta', '#eee2d5', `<circle cx="90" cy="82" r="38" fill="#fff7ea" stroke="${OUTLINE}" stroke-width="5"/><text x="90" y="96" text-anchor="middle" font-size="42" font-family="sans-serif" fill="${OUTLINE}">?</text>`);
}

export default CARD_ART;
