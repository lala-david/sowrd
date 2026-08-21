/* 아브라함 여정(10자리) 시네마틱 장면 정본 — episode-scenes.mjs와 같은 구조·같은 문법.
 *
 * 문법(docs/EPISODE-CINEMATICS-PLAN.md §2): 접근 → 도착 → 사건(기존 자리 그림) →
 * 말씀(클로즈업+자막) → 머묾(빛이 바뀐 여운). 자리는 대적이 아니다 — 도착과 묵상이다.
 * 이펙트는 mood가 정한다(moods.ts EPISODE_MOODS.abraham — moriah·machpelah는 lament,
 * 빛내림·화이트플래시는 episode-video.mjs가 기계로 끈다).
 *
 * 말씀: src/data/journey-passages.json의 개역한글 원문에서 이어진 구절 그대로 발췌
 * (줄바꿈만 넣었다 — 동일성유지권, 원문 수정 금지). 이 데이터에는 영어 본문이 없으므로
 * verseEn은 전 자리 생략한다(번역 창작 금지 — 렌더러가 없으면 한글만 그린다).
 * **본문 인용은 사람 검수 대상**(§4.3 — 오타·의역이 있으면 여기가 아니라 성경이 이긴다).
 *
 * SCAFFOLD는 넣지 않는다 — episode-scenes.mjs의 것을 인덱스가 공유한다(룩이 갈리면 안 된다).
 * cut.gen = 생성 파일명(scripts/video-frames/ep/), cut.art = 기존 자리 그림 재사용('ep:'). */

export const SCENES = [
  {
    id: 'abraham-ur',
    journey: 'abraham',
    stationId: 'ur',
    place: '우르', placeEn: 'Ur of the Chaldees', title: '우르를 떠나다', titleEn: 'Leaving Ur',
    mood: 'everyday',
    verse: '갈대아 우르에서 떠나\n가나안 땅으로 가고자 하더니',
    ref: '창세기 11:31 · Genesis 11:31',
    cuts: [
      { gen: 'abraham-ur-1', prompt: 'a wide flat river plain of southern Mesopotamia at early morning, a great stepped brick ziggurat small on the horizon, irrigation channels catching the light between dark mud fields' },
      { gen: 'abraham-ur-2', prompt: 'mud-brick city walls and flat rooftops up close, a dusty road leading out through an open gate between low houses' },
      { art: 'ep:abraham-ur.webp' },
      { gen: 'abraham-ur-4', prompt: 'laden pack saddles and rolled woolen bundles resting by a mud-brick gatepost, the road beyond running straight toward a far open horizon', verse: true },
      { gen: 'abraham-ur-5', prompt: 'the stepped ziggurat as a dark silhouette at dusk behind empty rooftops, the road out of the city fading into the wide plain' },
    ],
  },
  {
    id: 'abraham-haran',
    journey: 'abraham',
    stationId: 'haran',
    place: '하란', placeEn: 'Haran', title: '부르심', titleEn: 'The Call',
    mood: 'everyday',
    verse: '너는 너의 본토 친척\n아비 집을 떠나\n내가 네게 지시할 땅으로 가라',
    ref: '창세기 12:1 · Genesis 12:1',
    cuts: [
      { gen: 'abraham-haran-1', prompt: 'the upper Euphrates plain at dawn, a broad slow river bending between dry grass banks, a caravan road following the water toward low hills' },
      { gen: 'abraham-haran-2', prompt: 'beehive-domed mud houses clustered inside a low town wall, a stone well and hollowed water troughs by the open gate' },
      { art: 'ep:abraham-haran.webp' },
      { gen: 'abraham-haran-4', prompt: 'an empty road running straight out of a town gate across a wide dry plateau, wheel ruts and camel tracks pressed into the pale dust', verse: true },
      { gen: 'abraham-haran-5', prompt: 'the walled town small on the plain at dusk, the open road ahead cresting a low rise toward an unseen land' },
    ],
  },
  {
    id: 'abraham-shechem',
    journey: 'abraham',
    stationId: 'shechem',
    place: '세겜', placeEn: 'Shechem', title: '첫 단', titleEn: 'The First Altar',
    mood: 'wonder',
    verse: '내가 이 땅을\n네 자손에게 주리라',
    ref: '창세기 12:7 · Genesis 12:7',
    cuts: [
      { gen: 'abraham-shechem-1', prompt: 'a green valley opening between two rounded mountains, olive terraces on the slopes, a footpath entering the pass in morning light' },
      { gen: 'abraham-shechem-2', prompt: 'one huge spreading oak tree standing alone on the valley floor, its broad shade falling on the grass, low hills rising on either side' },
      { art: 'ep:abraham-shechem.webp' },
      { gen: 'abraham-shechem-4', prompt: 'a small altar of rough unhewn stones beneath the great oak, warm morning light falling through the leaves onto the stones', verse: true },
      { gen: 'abraham-shechem-5', prompt: 'the great oak and its stone altar in the last warm light of evening, long shadows stretching across the quiet valley' },
    ],
  },
  {
    id: 'abraham-bethel',
    journey: 'abraham',
    stationId: 'bethel',
    place: '벧엘', placeEn: 'Bethel', title: '장막과 단', titleEn: 'Tent and Altar',
    mood: 'everyday',
    verse: '여호와를 위하여 단을 쌓고\n여호와의 이름을 부르더니',
    ref: '창세기 12:8 · Genesis 12:8',
    cuts: [
      { gen: 'abraham-bethel-1', prompt: 'a stony highland ridge climbing between scattered boulders, a thin path winding up toward a bare rounded hilltop in clear cool air' },
      { gen: 'abraham-bethel-2', prompt: 'dark goat-hair tents pitched on the open hilltop, tent ropes and wooden pegs in rocky ground, terraced hills rolling away on every side' },
      { art: 'ep:abraham-bethel.webp' },
      { gen: 'abraham-bethel-4', prompt: 'a low altar of stacked field stones on the hilltop, a thin line of smoke rising straight into a clear morning sky', verse: true },
      { gen: 'abraham-bethel-5', prompt: 'the hilltop tents at dusk, the stone altar a quiet dark shape against a band of fading light over the western hills' },
    ],
  },
  {
    id: 'abraham-egypt',
    journey: 'abraham',
    stationId: 'egypt',
    place: '애굽', placeEn: 'Egypt (Nile Delta)', title: '기근의 남행', titleEn: 'Down to Egypt',
    mood: 'wilderness',
    verse: '그 땅에 기근이 있으므로\n아브람이 애굽에 우거하려 하여\n그리로 내려갔으니',
    ref: '창세기 12:10 · Genesis 12:10',
    cuts: [
      { gen: 'abraham-egypt-1', prompt: 'a dry cracked field under a hazy sky, withered grass and empty clay grain jars beside a path leading downhill toward distant green' },
      { gen: 'abraham-egypt-2', prompt: 'the edge of a great river delta, tall papyrus reeds and a row of date palms above flat irrigated fields, water channels crossing dark earth' },
      { art: 'ep:abraham-egypt.webp' },
      { gen: 'abraham-egypt-4', prompt: 'tall papyrus stems up close over slow green water, a hot haze softening the flat horizon of the delta', verse: true },
      { gen: 'abraham-egypt-5', prompt: 'the delta at evening, palms as dark shapes over still water channels, a faint dusty track turning back toward far hills' },
    ],
  },
  {
    id: 'abraham-bethel-return',
    journey: 'abraham',
    stationId: 'bethel-return',
    place: '벧엘(귀환)', placeEn: 'Bethel (Return)', title: '돌아옴과 양보', titleEn: 'Return and Parting',
    mood: 'everyday',
    verse: '우리는 한 골육이라\n나나 너나 내 목자나 네 목자나\n서로 다투게 말자',
    ref: '창세기 13:8 · Genesis 13:8',
    cuts: [
      { gen: 'abraham-bethel-return-1', prompt: 'a long climbing road from green lowlands back into high country, the terraced hills rising ahead in clear morning air' },
      { gen: 'abraham-bethel-return-2', prompt: 'a familiar bare hilltop with an old altar of stacked stones, tent cloth and ropes newly pitched beside it' },
      { art: 'ep:abraham-bethel-return.webp' },
      { gen: 'abraham-bethel-return-4', prompt: 'two valleys diverging below a single hilltop, one green and well-watered, one high and stony, a fork of dusty paths between them', verse: true },
      { gen: 'abraham-bethel-return-5', prompt: 'the hilltop altar at dusk, the broad eastern valley below emptied and quiet, its road fading into shadow' },
    ],
  },
  {
    id: 'abraham-hebron',
    journey: 'abraham',
    stationId: 'hebron',
    place: '헤브론/마므레', placeEn: 'Hebron (Mamre)', title: '별과 언약', titleEn: 'Stars and Covenant',
    mood: 'wonder',
    verse: '아브람이 여호와를 믿으니\n여호와께서 이를\n그의 의로 여기시고',
    ref: '창세기 15:6 · Genesis 15:6',
    cuts: [
      { gen: 'abraham-hebron-1', prompt: 'a high plateau road climbing through scattered oaks and low stone-walled vineyards toward a distant grove of great trees' },
      { gen: 'abraham-hebron-2', prompt: 'a grove of ancient terebinth trees on the plateau, thick trunks and wide crowns, a dark tent pitched in their shade beside a stone altar' },
      { art: 'ep:abraham-hebron.webp' },
      { gen: 'abraham-hebron-4', prompt: 'a night sky crowded with countless stars over the dark crowns of the terebinth trees, the silent plateau stretching away below', verse: true },
      { gen: 'abraham-hebron-5', prompt: 'the terebinth grove in the first grey light before dawn, a few stars still faint above the trees, embers of a small fire glowing low' },
    ],
  },
  {
    id: 'abraham-beersheba',
    journey: 'abraham',
    stationId: 'beersheba',
    place: '브엘세바', placeEn: 'Beersheba', title: '맹세의 우물', titleEn: 'The Well of the Oath',
    mood: 'everyday',
    verse: '에셀나무를 심고 거기서\n영생하시는 하나님\n여호와의 이름을 불렀으며',
    ref: '창세기 21:33 · Genesis 21:33',
    cuts: [
      { gen: 'abraham-beersheba-1', prompt: 'hills opening onto a wide flat semi-desert plain, dry scrub and pale earth stretching to a bright open horizon' },
      { gen: 'abraham-beersheba-2', prompt: 'a deep stone-lined well in the dry plain, worn rope grooves in the rim stones, hollowed stone water troughs beside it' },
      { art: 'ep:abraham-beersheba.webp' },
      { gen: 'abraham-beersheba-4', prompt: 'a young tamarisk tree newly planted in dry earth beside the stone well, its feathery branches moving in the desert wind', verse: true },
      { gen: 'abraham-beersheba-5', prompt: 'the well and the small tamarisk at dusk on the empty plain, a deep band of colour over the flat horizon' },
    ],
  },
  {
    id: 'abraham-moriah',
    journey: 'abraham',
    stationId: 'moriah',
    place: '모리아 산', placeEn: 'Mount Moriah', title: '여호와 이레', titleEn: 'The LORD Will Provide',
    mood: 'lament',
    verse: '여호와의 산에서\n준비되리라 하더라',
    ref: '창세기 22:14 · Genesis 22:14',
    /* lament — 어둡고 고요한 사물만. 빛나는·영광 어휘 금지, 축하는 기계가 끈다 */
    cuts: [
      { gen: 'abraham-moriah-1', prompt: 'a stony ridge road climbing under an overcast sky, a bare summit ahead half-hidden in slow cloud shadow' },
      { gen: 'abraham-moriah-2', prompt: 'the rocky summit of a mountain, wind-worn stone and low thorn scrub, grey cloud moving quietly overhead' },
      { art: 'ep:abraham-moriah.webp' },
      { gen: 'abraham-moriah-4', prompt: 'a ram caught by its horns in a dense thicket beside a stone altar laid with a bundle of bound split firewood, still and quiet under a clouded sky', verse: true },
      { gen: 'abraham-moriah-5', prompt: 'the summit altar left quiet, the cloud thinning at the horizon into a pale calm band of evening, the thicket standing empty' },
    ],
  },
  {
    id: 'abraham-machpelah',
    journey: 'abraham',
    stationId: 'machpelah',
    place: '막벨라', placeEn: 'Cave of Machpelah', title: '사라를 장사하다', titleEn: 'The Burial of Sarah',
    mood: 'lament',
    verse: '아브라함이 그 아내 사라를\n가나안 땅 마므레 앞\n막벨라 밭 굴에 장사하였더라',
    ref: '창세기 23:19 · Genesis 23:19',
    /* lament — 애도의 자리. 동굴 입구·그루터기 밭·경계석, 조용한 그늘만 */
    cuts: [
      { gen: 'abraham-machpelah-1', prompt: 'a quiet road returning into high hill country under a veiled grey sky, cypress and olive trees standing still along the way' },
      { gen: 'abraham-machpelah-2', prompt: 'a pale limestone hillside with a dark cave mouth, a field of cut stubble before it and a low line of boundary stones' },
      { art: 'ep:abraham-machpelah.webp' },
      { gen: 'abraham-machpelah-4', prompt: 'the dark opening of the cave up close in the pale rock, dry grasses at the threshold barely moving, deep still shadow within', verse: true },
      { gen: 'abraham-machpelah-5', prompt: 'the stubble field and the quiet cave mouth at dusk, boundary stones casting long soft shadows, the first faint stars above the hill' },
    ],
  },
]
