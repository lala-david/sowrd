/* ── 대적(對敵) — 여정마다 하나, 길을 막아서는 것 ──────────────────────────
 *
 * 게임 문법으로는 보스전이다. 그러나 화면 어휘는 순례다(DECISIONS D3 — "보스"는 금지어):
 * 대적의 **성경 속 실제 이름**을 쓴다. 홍해·광야·유라굴로·공회·기근 — 성경이 이미
 * 이름 붙인 대적들이라, 지어낸 몬스터보다 오히려 무겁다.
 *
 * 신학 금지선 (PLANNING §4.3 · D3, scripts/check-content.mjs가 기계로 지킨다):
 *  1. 대적은 결코 하나님·예수님·십자가가 아니다. 바다·광야·폭풍·위협·기근 —
 *     피조물과 상황이다. 십자가=보스전 금지는 여기서도 절대선이다(수난·lament 자리는
 *     대적을 두지 않는다).
 *  2. 승리의 주어는 러너가 아니라 하나님이다. "너희는 가만히 있을지니라"(출 14:14).
 *     러너는 이기는 게 아니라 **건너고, 지나고, 견딘다**. victory 문장이 이 어순을 지킨다.
 *  3. 보상 차등 없음 — 대적을 넘어도 인장은 같은 인장, 보상은 늘 말씀이다.
 *     (pace.ts가 축척 모드를 두지 않은 것과 같은 이유: 공로 차등 금지.)
 *  4. 실패·리셋 없음(D9 죄책감 없는 복귀) — 여러 러닝에 나눠 건너도 된다.
 *     대적은 관문이 아니라 그 구간의 이름이다.
 *
 * 동작: 대적은 `episodeId` 자리로 들어가는 구간에 산다. journeyProgress의 next가
 * 그 자리인 동안 러닝 화면의 다음-자리 게이지가 대치 게이지가 되고(lib/adversary.ts),
 * 자리에 닿으면 리빌에서 victory 문장과 그 자리의 그림(이미 갈라진 바다가 그려져 있다 —
 * episodes/exodus-pihahiroth.webp)이 열린다. 대치 중 그림은 art/adversaries/{id}.webp
 * (scripts/adversary-art.mjs) — 막아선 상태를 그린다. 진행 상태는 새로 저장하지 않는다:
 * 전부 journeyKm 하나에서 파생된다(단일 진실).
 */

export type AdversaryKind = 'sea' | 'wilderness' | 'storm' | 'threat' | 'famine'

export interface Adversary {
  id: string
  journeyId: string
  /** 이 대적이 막아선 구간의 도착 자리 — lament 자리 금지(check-content가 검사) */
  episodeId: string
  /** 화면에 뜨는 이름 — 성경이 부른 그 이름 */
  name: string
  /** 한 줄 관형구 — 이것이 무엇인지 */
  title: string
  kind: AdversaryKind
  /** 대치 중 러닝 화면의 등불 구절이 이 본문으로 바뀐다 */
  verseRef: string
  verseKr: string
  /** 구간 진행 1/3 · 2/3 · 막바지 — 게이지 아래 한 문장. 칭찬도 채근도 아닌 서사 */
  phases: [string, string, string]
  /** 넘어선 리빌에서 — 주어는 하나님, 동사는 건넜다/지났다 */
  victory: string
}

export const ADVERSARIES: Adversary[] = [
  {
    id: 'famine',
    journeyId: 'abraham',
    episodeId: 'egypt',
    name: '기근',
    title: '땅을 덮은 굶주림',
    kind: 'famine',
    verseRef: '시편 33:19',
    verseKr: '저희 영혼을 사망에서 건지시며 저희를 기근 시에 살게 하시는도다',
    phases: [
      '땅이 마르기 시작합니다 — 길은 남쪽으로 이어집니다',
      '기근이 깊어집니다 — 걸음만이 앞으로 갑니다',
      '멀리 애굽의 강이 보입니다',
    ],
    /* 애굽행은 승리 서사가 아니다(아브라함은 거기서 넘어진다). 그래서 이 대적의
     * victory는 이김이 아니라 **살아남아 돌아옴**이다 — 다음 자리가 벧엘(귀환)이다. */
    victory: '기근의 때를 지나 살아남았습니다 — 벧엘로 돌아가는 길이 다시 열립니다',
  },
  {
    id: 'red-sea',
    journeyId: 'exodus',
    episodeId: 'pihahiroth',
    name: '홍해',
    title: '길을 막아선 바다',
    kind: 'sea',
    verseRef: '출애굽기 14:14',
    verseKr: '여호와께서 너희를 위하여 싸우시리니 너희는 가만히 있을지니라',
    phases: [
      '바다가 앞을 막고 있습니다 — 뒤에서는 병거 소리',
      '물결 소리가 가까워집니다',
      '동풍이 바다를 가르기 시작합니다',
    ],
    victory: '바다가 갈라졌습니다 — 마른 땅을 밟고 건넜습니다',
  },
  {
    id: 'wilderness-40',
    journeyId: 'jesus',
    episodeId: 'temptation',
    name: '사십 일의 광야',
    title: '마른 땅과 굶주림',
    kind: 'wilderness',
    verseRef: '마태복음 4:4',
    verseKr: '사람이 떡으로만 살 것이 아니요 하나님의 입으로부터 나오는 모든 말씀으로 살 것이라',
    phases: [
      '광야가 시작됩니다 — 길게 이어집니다',
      '마른 땅 한가운데입니다',
      '광야의 끝이 보입니다',
    ],
    /* temptation의 mood는 wilderness — 축하 연출이 꺼진 채 조용히 지나간다.
     * 광야의 끝은 팡파레가 아니라 시작된 사역이다. 그 침묵이 맞다. */
    victory: '광야가 끝났습니다 — 말씀으로 서서 지나왔습니다',
  },
  {
    id: 'euroclydon',
    journeyId: 'paul',
    episodeId: 'malta',
    name: '유라굴로',
    title: '밤낮 없는 광풍',
    kind: 'storm',
    verseRef: '사도행전 27:25',
    verseKr: '내게 말씀하신 그대로 되리라고 나는 하나님을 믿노라',
    phases: [
      '광풍이 배를 몰아갑니다',
      '여러 날 해도 별도 보이지 않습니다',
      '수심이 얕아집니다 — 뭍이 가깝습니다',
    ],
    victory: '모두 살아서 뭍에 닿았습니다 — 한 사람도 잃지 않았습니다',
  },
  {
    id: 'council',
    journeyId: 'peter',
    episodeId: 'ep04',
    name: '공회의 위협',
    title: '다시는 그 이름으로 말하지 말라',
    kind: 'threat',
    verseRef: '사도행전 4:29',
    verseKr: '주여 이제도 저희의 위협함을 하감하옵시고 종들로 하여금 담대히 말씀을 전하게 하여 주옵소서',
    phases: [
      '성전 문 앞 — 공회가 지켜보고 있습니다',
      '위협이 조여옵니다 — 교회가 함께 기도합니다',
      '모인 곳이 진동합니다',
    ],
    victory: '위협 앞에서 더 담대해졌습니다 — 함께 기도한 이들과 같이',
  },
]
