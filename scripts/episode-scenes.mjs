/* 자리 시네마틱의 장면 정본 — 자리마다 5컷(도착의 문법)과 한/영 자막.
 *
 * 문법(docs/EPISODE-CINEMATICS-PLAN.md §2): 접근 → 도착 → 사건(기존 자리 그림) →
 * 말씀(클로즈업+자막) → 머묾(빛이 바뀐 여운). 자리는 대적이 아니다 — 승리가 아니라
 * 도착과 묵상이다. 이펙트는 mood가 정한다(episode-video.mjs의 MOOD 프리셋 —
 * lament는 빛내림·화이트플래시 금지, 이 파일이 아니라 기계가 강제한다).
 *
 * 말씀: 한글 개역한글(퍼블릭 도메인 — 앱과 동일 판본) · 영어 WEB(World English Bible,
 * 퍼블릭 도메인, 정통 개신교 사용 무리 없음). **본문 인용은 사람 검수 대상**(§4.3 —
 * 성경 본문이 정본이다. 오타·의역이 있으면 여기가 아니라 성경이 이긴다).
 *
 * 지금은 P0 파일럿(예수 · 부르심 5자리). P1에서 33자리, P2에서 101자리로 확장 —
 * 같은 구조로 늘리기만 한다. cut.gen = 생성 파일명(scripts/video-frames/ep/),
 * cut.art = 기존 그림 재사용('st:'=stations, 'ep:'=episodes, 'adv:'=adversaries,
 * 'vf:'=video-frames 루트). */

export const SCENES = [
  {
    id: 'jesus-baptism',
    journey: 'jesus',
    stationId: 'baptism',
    place: '요단강', placeEn: 'The Jordan', title: '세례', titleEn: 'The Baptism',
    mood: 'wonder',
    verse: '이는 내 사랑하는 아들이요\n내 기뻐하는 자라',
    verseEn: 'This is my beloved Son,\nwith whom I am well pleased.',
    ref: '마태복음 3:17 · Matthew 3:17',
    cuts: [
      { gen: 'jesus-baptism-1', prompt: 'the Jordan valley seen from a distance at golden hour, the winding green river line threading between bare pale hills, a thin footpath descending toward the water' },
      { gen: 'jesus-baptism-2', prompt: 'the reed-lined bank of the Jordan River up close, calm green water, smooth worn stones at the waterline where many feet have stood' },
      { art: 'st:baptism.webp' },
      { gen: 'jesus-baptism-4', prompt: 'circles rippling outward on the calm river surface in warm morning light, one white dove flying low over the water', verse: true },
      { gen: 'jesus-baptism-5', prompt: 'the Jordan river bank at dusk, the water a quiet band of fading gold between dark reeds, empty and still' },
    ],
  },
  {
    id: 'jesus-temptation',
    journey: 'jesus',
    stationId: 'temptation',
    place: '광야', placeEn: 'The Wilderness', title: '시험', titleEn: 'The Temptation',
    mood: 'wilderness',
    verse: '사람이 떡으로만 살 것이 아니요\n하나님의 입으로 나오는 모든 말씀으로 살 것이라',
    verseEn: 'Man shall not live by bread alone,\nbut by every word that proceeds\nout of the mouth of God.',
    ref: '마태복음 4:4 · Matthew 4:4',
    /* 광야 컷은 대적 파이프라인이 이미 만들었다 — 재사용, 신규 생성 0 */
    cuts: [
      { art: 'adv:wilderness-40.webp' },
      { art: 'vf:wilderness-stones.webp' },
      { art: 'st:temptation.webp' },
      { art: 'vf:wilderness-night.webp', verse: true },
      { art: 'vf:wilderness-dawn.webp' },
    ],
  },
  {
    id: 'jesus-call-mt4',
    journey: 'jesus',
    stationId: 'call-mt4',
    place: '갈릴리 해변', placeEn: 'Sea of Galilee', title: '첫 부르심', titleEn: 'The Calling',
    mood: 'everyday',
    verse: '나를 따라오라\n내가 너희로 사람을 낚는 어부가 되게 하리라',
    verseEn: 'Come after me, and I will make you\nfishers for men.',
    ref: '마태복음 4:19 · Matthew 4:19',
    cuts: [
      { gen: 'jesus-call-1', prompt: 'the Sea of Galilee seen from low hills at morning, a wide calm band of blue-green water, small fishing boats far out, bare brown hills on the far shore' },
      { gen: 'jesus-call-2', prompt: 'a pebble shore of the Sea of Galilee, two open wooden fishing boats drawn up on the shingle, folded nets piled beside them' },
      { art: 'st:call-mt4.webp' },
      { gen: 'jesus-call-4', prompt: 'a fishing net left lying on wet shingle at the waterline, its ropes trailing toward the calm water, morning light on the mesh', verse: true },
      { gen: 'jesus-call-5', prompt: 'the Galilee shore at dusk, boats as dark shapes against a band of fading gold water, nets left behind on the stones' },
    ],
  },
  {
    id: 'jesus-beat-1',
    journey: 'jesus',
    stationId: 'beat-1',
    place: '팔복산', placeEn: 'Mount of Beatitudes', title: '팔복', titleEn: 'The Beatitudes',
    mood: 'everyday',
    verse: '심령이 가난한 자는 복이 있나니\n천국이 저희 것임이요',
    verseEn: 'Blessed are the poor in spirit,\nfor theirs is the Kingdom of Heaven.',
    ref: '마태복음 5:3 · Matthew 5:3',
    cuts: [
      { gen: 'jesus-beat1-1', prompt: 'a gentle green hill rising above the Sea of Galilee, wildflowers scattered on its slopes, a thin path climbing toward the rounded summit' },
      { gen: 'jesus-beat1-2', prompt: 'the grassy upper slope of the hill, wind bending the wild grasses and scattered red anemones, the wide lake shining far below' },
      { art: 'st:beat-1.webp' },
      { gen: 'jesus-beat1-4', prompt: 'wild red anemones and white lilies close up among bending grasses, soft morning light through the petals', verse: true },
      { gen: 'jesus-beat1-5', prompt: 'the hilltop at golden hour, long soft shadows running down the slope toward the shining lake below' },
    ],
  },
  {
    id: 'jesus-beat-2',
    journey: 'jesus',
    stationId: 'beat-2',
    place: '팔복산', placeEn: 'Mount of Beatitudes', title: '긍휼과 화평', titleEn: 'Mercy and Peace',
    mood: 'compassion',
    verse: '화평케 하는 자는 복이 있나니\n저희가 하나님의 아들이라 일컬음을 받을 것임이요',
    verseEn: 'Blessed are the peacemakers,\nfor they shall be called children of God.',
    ref: '마태복음 5:9 · Matthew 5:9',
    cuts: [
      { gen: 'jesus-beat2-1', prompt: 'terraced slopes below the hill with old olive trees, a worn path passing between low dry-stone walls' },
      { gen: 'jesus-beat2-2', prompt: 'one ancient olive tree on the hillside, its broad shade falling on flat sitting stones, the lake glinting beyond' },
      { art: 'st:beat-2.webp' },
      { gen: 'jesus-beat2-4', prompt: 'two doves resting together on a gnarled olive branch, soft warm light, leaves stirring gently', verse: true },
      { gen: 'jesus-beat2-5', prompt: 'the olive slopes in quiet evening light, the lake below a calm mirror of dusk gold' },
    ],
  },
]

/* episode-art.mjs와 동일 스캐폴드 — 한 앱 안에서 룩이 갈리면 안 된다. 저쪽 수정 시 동기화 */
export const SCAFFOLD =
  'flat geometric illustration, a single square vignette for a Christian pilgrimage running app. ' +
  'Warm golden-hour Holy Land palette only: sand cream #f4ead7, terracotta clay #c05a30, olive sage #6e7a4c, ' +
  'sun-gold #e0a53f, deep umber #2c2118. Clean geometric shapes, flat fills, soft two-tone shading, ' +
  'subtle warm paper grain. One clear subject, centred, bold simple silhouette. ' +
  'A square composition that completely fills the square canvas corner to corner. Colour and texture ' +
  'reach every one of the four corners. Ancient Near East world. ' +
  'Show the place itself, empty and still, no people. ' +
  'NO depiction of Jesus, NO ring or disc or arc behind anything, NO religious icons, NO crucifix ornament, ' +
  'NO outlines, NO ink linework, NO text, NO letters, NO watermark, NO neon, NO photorealism, NO clip-art. Subject: '
