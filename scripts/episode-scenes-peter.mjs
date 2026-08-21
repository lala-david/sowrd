/* 베드로 여정(peter) 자리 시네마틱 장면 정본 — 14자리 × 5컷.
 *
 * 문법은 episode-scenes.mjs와 동일(접근 → 도착 → 사건(자리 그림 재사용) → 말씀 → 머묾).
 * 컷3은 자리 그림(ep:peter-{sid}.webp), 생성 파일명은 'peter-{sid}-{n}'.
 * 이펙트는 mood가 정한다(moods.ts의 EPISODE_MOODS.peter — lament는 기계가 강제한다).
 *
 * 말씀: src/data/journey-passages.json의 개역한글 원문에서 **그대로** 발췌했다(줄바꿈만
 * 편집·서술 틀만 잘라냄). 이 데이터에 영어 판본이 없으므로 verseEn은 두지 않는다 —
 * 번역을 창작하지 않는다. **본문 인용은 사람 검수 대상**(성경이 정본이다).
 *
 * 여정의 결: 갈릴리의 그물과 배 → 예루살렘의 돌계단 → 이방의 항구 → 로마의 지붕들.
 * ep04는 대적 영상이 붙는 자리라 담대함의 결(아침의 열린 성전 문·문지방의 등잔 여럿)로
 * 차별화한다. ep11~ep14는 confidence=tradition(peter.json) — 성경 직접 서술이 아니라
 * 초대교회 전승에 기댄 자리다. ep14(순교, lament)는 십자가 형상(역십자 포함)을 절대
 * 그리지 않는다 — 거꾸로 달린 십자가는 후대 전승이고, stations-art의 원칙과 같다.
 * 영광의 어휘도 쓰지 않는다. 언덕 위 접힌 그물과 저무는 하늘, 고요한 사물만.
 *
 * SCAFFOLD는 episode-scenes.mjs의 것을 그대로 쓴다 — 여기 중복하지 않는다. */

export const SCENES = [
  {
    id: 'peter-ep01',
    journey: 'peter',
    stationId: 'ep01',
    place: '가버나움', placeEn: 'Capernaum', title: '그물을 버리다', titleEn: 'Leaving the Nets',
    mood: 'everyday',
    verse: '나를 따라 오너라 내가 너희로\n사람을 낚는 어부가 되게 하리라',
    ref: '마태복음 4:19 · Matthew 4:19',
    cuts: [
      { gen: 'peter-ep01-1', prompt: 'the Sea of Galilee at dawn seen from the shore road into Capernaum, night-fishing boats coming in low in the water, the sky paling gold over the far hills' },
      { gen: 'peter-ep01-2', prompt: 'the stone quay of Capernaum up close at dawn, wet nets hung over the gunwale of a moored fishing boat, water dripping onto the worn stones' },
      { art: 'ep:peter-ep01.webp' },
      { gen: 'peter-ep01-4', prompt: 'two fishing nets left lying together on the shore stones at the waterline, the beached boats beyond them, morning light rising over the calm lake', verse: true },
      { gen: 'peter-ep01-5', prompt: 'the Capernaum shore at full morning, the boats empty on the shingle, the nets still on the stones, a footpath leading away from the water toward the hills' },
    ],
  },
  {
    id: 'peter-ep02',
    journey: 'peter',
    stationId: 'ep02',
    place: '가이사랴 빌립보', placeEn: 'Caesarea Philippi', title: '신앙 고백', titleEn: 'The Confession',
    mood: 'wonder',
    verse: '주는 그리스도시요\n살아계신 하나님의 아들이시니이다',
    ref: '마태복음 16:16 · Matthew 16:16',
    cuts: [
      { gen: 'peter-ep02-1', prompt: 'the road north through green foothills toward a snow-capped mountain, poplars and quick spring streams running beside the way' },
      { gen: 'peter-ep02-2', prompt: 'a great red rock face at the foot of the mountain, spring water pouring from a dark cave mouth, empty carved niches in the cliff above' },
      { art: 'ep:peter-ep02.webp' },
      { gen: 'peter-ep02-4', prompt: 'one massive weathered rock standing whole in clear sunlight before the cliff of empty niches, bright spring water flowing past its base', verse: true },
      { gen: 'peter-ep02-5', prompt: 'the rock face at evening, the carved niches sunk into shadow, the spring still sounding bright in the dusk below the darkening mountain' },
    ],
  },
  {
    id: 'peter-ep03',
    journey: 'peter',
    stationId: 'ep03',
    place: '예루살렘', placeEn: 'Jerusalem', title: '오순절', titleEn: 'Pentecost',
    mood: 'joy',
    verse: '누구든지 주의 이름을 부르는 자는\n구원을 얻으리라',
    ref: '사도행전 2:21 · Acts 2:21',
    cuts: [
      { gen: 'peter-ep03-1', prompt: 'Jerusalem at morning seen from the pilgrim road, stone stairways climbing between flat-roofed houses toward the temple mount' },
      { gen: 'peter-ep03-2', prompt: 'a narrow stone stairway rising to a rooftop terrace, a strong morning wind moving the awnings and hung cloth along the lane' },
      { art: 'ep:peter-ep03.webp' },
      { gen: 'peter-ep03-4', prompt: 'a rushing wind under a clear morning sky moving over the rooftops of Jerusalem, doorways standing open down the sunlit stone lane', verse: true },
      { gen: 'peter-ep03-5', prompt: 'the city at evening, warm lamplight in many windows across the rooftops where there had been few, the stone stairways quiet' },
    ],
  },
  {
    /* 대적 영상(공회의 위협)이 붙는 자리 — 장면은 담대함의 결로 답한다:
     * 아침의 활짝 열린 성전 문, 문지방에 줄지어 타는 등잔 여럿. */
    id: 'peter-ep04',
    journey: 'peter',
    stationId: 'ep04',
    place: '성전 미문', placeEn: 'The Beautiful Gate', title: '담대한 증언', titleEn: 'The Bold Witness',
    mood: 'compassion',
    verse: '은과 금은 내게 없거니와 내게 있는 것으로\n네게 주노니 곧 나사렛 예수 그리스도의\n이름으로 걸으라',
    ref: '사도행전 3:6 · Acts 3:6',
    cuts: [
      { gen: 'peter-ep04-1', prompt: 'the temple mount at early morning, its great gates standing open, broad stone steps climbing toward the gateway in the first light' },
      { gen: 'peter-ep04-2', prompt: 'the ornate temple gateway up close at morning, both doors thrown wide, a discarded beggar\'s mat and bowl left behind on the threshold step' },
      { art: 'ep:peter-ep04.webp' },
      { gen: 'peter-ep04-4', prompt: 'a row of small clay lamps burning steady along the worn threshold stone of the open gate, morning light streaming through the wide doorway beyond', verse: true },
      { gen: 'peter-ep04-5', prompt: 'the temple courts at dusk, the great gates still open, the row of lamps on the threshold still burning against the deepening blue' },
    ],
  },
  {
    id: 'peter-ep05',
    journey: 'peter',
    stationId: 'ep05',
    place: '사마리아', placeEn: 'Samaria', title: '성령을 받다', titleEn: 'Receiving the Spirit',
    mood: 'wonder',
    verse: '두 사도가 저희에게 안수하매\n성령을 받는지라',
    ref: '사도행전 8:17 · Acts 8:17',
    cuts: [
      { gen: 'peter-ep05-1', prompt: 'a road descending from the Judean hills into a wide valley, a terraced hill town rising between two mountains ahead' },
      { gen: 'peter-ep05-2', prompt: 'the crossroads below the town up close, a single stone well at the meeting of the ways, terraced slopes climbing on either side' },
      { art: 'ep:peter-ep05.webp' },
      { gen: 'peter-ep05-4', prompt: 'clear water risen high in the stone well at the crossroads, morning light reaching down the shaft to the bright trembling surface', verse: true },
      { gen: 'peter-ep05-5', prompt: 'the hill town at evening between its two mountains, warm lights waking in its lanes, the well at the crossroads holding the last of the sky' },
    ],
  },
  {
    id: 'peter-ep06',
    journey: 'peter',
    stationId: 'ep06',
    place: '룻다', placeEn: 'Lydda', title: '애니아야 일어나라', titleEn: 'Aeneas, Arise',
    mood: 'compassion',
    verse: '애니아야 예수 그리스도께서 너를 낫게 하시니\n일어나 네 자리를 정돈하라',
    ref: '사도행전 9:34 · Acts 9:34',
    cuts: [
      { gen: 'peter-ep06-1', prompt: 'the flat Sharon plain at morning, a straight road running between green fields toward a small quiet town' },
      { gen: 'peter-ep06-2', prompt: 'a plastered courtyard within the town in soft morning light, a low doorway standing open onto the lane' },
      { art: 'ep:peter-ep06.webp' },
      { gen: 'peter-ep06-4', prompt: 'an empty sleeping mat rolled up and standing upright against the sunlit plastered wall, its bedding neatly bound after eight long years', verse: true },
      { gen: 'peter-ep06-5', prompt: 'the courtyard at golden hour, the rolled mat against the wall, the doorway open toward the plain where the road runs on toward the sea' },
    ],
  },
  {
    id: 'peter-ep07',
    journey: 'peter',
    stationId: 'ep07',
    place: '욥바', placeEn: 'Joppa', title: '지붕 위의 환상', titleEn: 'The Vision on the Roof',
    mood: 'wonder',
    verse: '하나님께서 깨끗케 하신 것을\n네가 속되다 하지 말라',
    ref: '사도행전 10:15 · Acts 10:15',
    cuts: [
      { gen: 'peter-ep07-1', prompt: 'the port town of Joppa on its low hill above the sea, flat rooftops stepping down toward the harbour, morning light wide on the water' },
      { gen: 'peter-ep07-2', prompt: 'an outside stair climbing to a flat sun-bleached rooftop by the sea, the blue water stretching open beyond the roof edge' },
      { art: 'ep:peter-ep07.webp' },
      { gen: 'peter-ep07-4', prompt: 'a great linen sheet spread open on the rooftop, its four corners weighted with smooth stones, the wide shining sea beyond the parapet', verse: true },
      { gen: 'peter-ep07-5', prompt: 'the rooftop at dusk, the sheet taken up and gone, the parapet open to a sea turning silver, the far horizon still holding light' },
    ],
  },
  {
    id: 'peter-ep08',
    journey: 'peter',
    stationId: 'ep08',
    place: '가이사랴', placeEn: 'Caesarea', title: '열린 문', titleEn: 'The Open Door',
    mood: 'joy',
    verse: '저를 믿는 사람들이 다 그 이름을 힘입어\n죄 사함을 받는다',
    ref: '사도행전 10:43 · Acts 10:43',
    cuts: [
      { gen: 'peter-ep08-1', prompt: 'a Roman harbour city seen along the coast road, pale colonnades and a great stone breakwater reaching into the sea' },
      { gen: 'peter-ep08-2', prompt: 'the courtyard of a coastal villa, its wide door standing open toward the harbour, sea wind moving through the colonnade' },
      { art: 'ep:peter-ep08.webp' },
      { gen: 'peter-ep08-4', prompt: 'the open villa door filled with light, the harbour beyond crowded with ships from every sea, wind stirring the curtains at the frame', verse: true },
      { gen: 'peter-ep08-5', prompt: 'the villa courtyard at evening, the door left standing open, harbour lights coming on across the water one after another' },
    ],
  },
  {
    id: 'peter-ep09',
    journey: 'peter',
    stationId: 'ep09',
    place: '예루살렘', placeEn: 'Jerusalem', title: '오직 은혜', titleEn: 'Grace Alone',
    mood: 'everyday',
    verse: '우리가 저희와 동일하게\n주 예수의 은혜로 구원 받는 줄을 믿노라',
    ref: '사도행전 15:11 · Acts 15:11',
    cuts: [
      { gen: 'peter-ep09-1', prompt: 'the road climbing from the coastal plain back into the Judean hills, Jerusalem appearing on its ridge in the afternoon light' },
      { gen: 'peter-ep09-2', prompt: 'a walled courtyard in the city, a circle of low stone benches set on the swept paving, olive shade falling along the wall' },
      { art: 'ep:peter-ep09.webp' },
      { gen: 'peter-ep09-4', prompt: 'the circle of low stone benches in warm afternoon light, one round loaf and a single clay cup set at the open place in the centre to be shared', verse: true },
      { gen: 'peter-ep09-5', prompt: 'the courtyard at dusk, the benches empty, doves settled along the wall, the open place at the centre still holding the last light' },
    ],
  },
  {
    id: 'peter-ep10',
    journey: 'peter',
    stationId: 'ep10',
    place: '안디옥', placeEn: 'Antioch', title: '바로잡히다', titleEn: 'Set Right',
    mood: 'wilderness',
    verse: '나는 저희가 복음의 진리를 따라\n바로 행하지 아니함을 보고',
    ref: '갈라디아서 2:14 · Galatians 2:14',
    cuts: [
      { gen: 'peter-ep10-1', prompt: 'a great river city seen from the southern road, bridges and crowded rooftops along the water in hazy afternoon light' },
      { gen: 'peter-ep10-2', prompt: 'a city courtyard with a long shared table beneath a vine trellis, two benches drawn slightly apart from each other on the worn paving' },
      { art: 'ep:peter-ep10.webp' },
      { gen: 'peter-ep10-4', prompt: 'the long table up close, one bread and one dish set at its centre, the gap between the two drawn-apart benches plain in the flat light', verse: true },
      { gen: 'peter-ep10-5', prompt: 'the courtyard at evening, the two benches drawn back together at the table, lamplight warm on the shared bread and dishes' },
    ],
  },
  {
    id: 'peter-ep11',
    journey: 'peter',
    stationId: 'ep11',
    place: '소아시아', placeEn: 'Asia Minor', title: '흩어진 나그네에게', titleEn: 'To the Scattered Strangers',
    mood: 'everyday',
    /* journey-passages.json 원문에는 '비두니아 에'로 띄어쓰기 흠(추출 산물)이 있다.
     * 글자는 그대로 두고 공백만 바로잡았다 — 검수 시 원본 데이터도 함께 볼 것. */
    verse: '본도, 갈라디아, 갑바도기아, 아시아와\n비두니아에 흩어진 나그네',
    ref: '베드로전서 1:1 · 1 Peter 1:1',
    cuts: [
      { gen: 'peter-ep11-1', prompt: 'a high mountain road at morning winding along a ridge, wide hazy valleys falling away on either side' },
      { gen: 'peter-ep11-2', prompt: 'a bend of the stone road overlooking five distant valley towns scattered small in the haze, worn milestones marking the way' },
      { art: 'ep:peter-ep11.webp' },
      { gen: 'peter-ep11-4', prompt: 'a sealed letter scroll resting on a flat stone at the roadside, the road running on past it toward the far towns below', verse: true },
      { gen: 'peter-ep11-5', prompt: 'the ridge road at dusk, small warm lights waking in each of the five far towns, the road threading on between them into the evening' },
    ],
  },
  {
    id: 'peter-ep12',
    journey: 'peter',
    stationId: 'ep12',
    place: '고린도', placeEn: 'Corinth', title: '오직 그리스도', titleEn: 'Christ Alone',
    mood: 'everyday',
    verse: '너희가 각각 이르되 나는 바울에게,\n나는 아볼로에게, 나는 게바에게,\n나는 그리스도에게 속한 자라 하는 것이니',
    ref: '고린도전서 1:12 · 1 Corinthians 1:12',
    cuts: [
      { gen: 'peter-ep12-1', prompt: 'an isthmus city beneath a steep rock citadel seen from the eastern road, the sea showing on both sides of the narrow neck of land' },
      { gen: 'peter-ep12-2', prompt: 'a broad stone marketplace beneath the citadel, a long dividing line scored across its empty paving, colonnades on either hand' },
      { art: 'ep:peter-ep12.webp' },
      { gen: 'peter-ep12-4', prompt: 'the scored dividing line in the marketplace paving up close, worn faint where many feet have passed straight over it, warm light on the stones', verse: true },
      { gen: 'peter-ep12-5', prompt: 'the marketplace at evening, wind from two seas meeting over the pavement, the dividing line lost in the long level dusk light' },
    ],
  },
  {
    id: 'peter-ep13',
    journey: 'peter',
    stationId: 'ep13',
    place: '로마', placeEn: 'Rome', title: '바벨론의 교회', titleEn: 'The Church in Babylon',
    mood: 'everyday',
    verse: '함께 택하심을 받은 바벨론에 있는 교회가\n너희에게 문안하고',
    ref: '베드로전서 5:13 · 1 Peter 5:13',
    cuts: [
      { gen: 'peter-ep13-1', prompt: 'a long paved Roman road running toward a great city between tall pines and milestones, the city rising vast ahead in the late light' },
      { gen: 'peter-ep13-2', prompt: 'the great city within at dusk, tiled rooftops and arched aqueducts stretching away, narrow lanes descending between tall walls' },
      { art: 'ep:peter-ep13.webp' },
      { gen: 'peter-ep13-4', prompt: 'one small warm lamp burning in a low doorway at the foot of a tenement wall, the vast darkening city of rooftops rising beyond it', verse: true },
      { gen: 'peter-ep13-5', prompt: 'the rooftops of the city deep in the night, scattered small lamps answering one another across the dark, the aqueduct arches black against the last red sky' },
    ],
  },
  {
    /* 순교(lament) — 전승상의 자리. 십자가 형상(역십자 포함) 절대 금지: 거꾸로 달린
     * 십자가는 후대 전승이다(stations-art 원칙과 동일). 영광 어휘 없음, 빛의 연출 없음.
     * 언덕 위 접힌 그물과 저무는 하늘, 고요한 사물만. 부르심(ep01)의 '따라 오너라'가
     * '나를 따르라'로 닫힌다. */
    id: 'peter-ep14',
    journey: 'peter',
    stationId: 'ep14',
    place: '로마', placeEn: 'Rome', title: '나를 따르라', titleEn: 'Follow Me',
    mood: 'lament',
    verse: '이 말씀을 하시고 베드로에게 이르시되\n나를 따르라 하시니',
    ref: '요한복음 21:19 · John 21:19',
    cuts: [
      { gen: 'peter-ep14-1', prompt: 'a bare windswept hillside rising above the rooftops of a great city in late afternoon, a worn path climbing through dry grass under a low sun' },
      { gen: 'peter-ep14-2', prompt: 'the brow of the bare hill, wind moving through the dry grasses, the great city spread quiet and far below under a fading sky' },
      { art: 'ep:peter-ep14.webp' },
      { gen: 'peter-ep14-4', prompt: 'a single fisherman\'s net folded and laid on a flat stone at the hilltop, its mesh worn soft by long years, the light over the hill low and grey', verse: true },
      { gen: 'peter-ep14-5', prompt: 'the hill in the last of the dusk, the folded net resting dim on its stone, the small steady lamps of the city coming on far below' },
    ],
  },
]
