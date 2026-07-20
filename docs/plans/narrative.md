# 내러티브·대화 시스템 상세 플랜 — *동행 (The Gospel Road)*

> 범위: inkjs 통합 · `.ink` 파이프라인 · 분기 대화 UI · 예수님 등장 연출 · 로그/스킵/자동진행 · 선택지→관계·수집 영향
> 버전 0.2 (1차 검증 피드백 전면 반영) · 2026-07-20 · 상위 문서: [`GDD.md`](../GDD.md) · [`ENGAGEMENT.md`](../ENGAGEMENT.md)
> 기준: 예장통합(PCK) 정통 개혁주의 신학 · 윤리적 몰입(비강압) 원칙 · 수직 슬라이스 v0.1 코드베이스와 정합

---

## v2 변경 로그 — mustFix 해소 대응표

| # | 출처 | mustFix 요지 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| MF-1 | 신학·비신자 | 마 14:31 인터스티셜 재설계 — 위기 해소는 예수님의 행동으로, 말씀은 구조 직후에 | ② 시나리오 A(전면 개정), ⑤ 전이 규칙 6, ⑥ resume 계약 | 침몰 = 실패가 아니라 "붙잡히심 비트"(조작 불능 구원 시퀀스). 말씀은 붙잡힌 후 회복 비트에서. 게임적 도전은 침몰 전 구간까지로 한정 |
| MF-2 | 신학·공통1 | `bond`/`collect` 대상에서 tier==='jesus'를 스키마·CI 하드 에러로 금지 | ③ Zod refine 코드, ④ CI 규칙 E03 | `NarrativeEffectSchema.superRefine` + compile-ink 하드 에러(코드 스케치 수록) |
| MF-3 | 신학·공통3 | 감수를 상설 게이트로 — 해시 연동 reviewed, 주체·반려/재검 절차, 잡담·카드 문구 포함 | ⑩ 감수 파이프라인(전면 개정), ④ E07, ⑧ 로드맵 | `review-ledger.json`(콘텐츠 해시+승인 2인 서명), 수정 시 자동 해제, `playable && !reviewed` 프로덕션 빌드 실패 |
| MF-4 | 신학·공통4 | 개역개정 저작권(대한성서공회) 선행 확보 + 인용문 자동 대조 | ⑧ M-1 선행 과제, ④ E04, ⑪ 리스크 | 사용 허락 절차를 M1 이전 배치, 로컬 본문 DB diff를 CI 실패 조건으로, 불허 시 대안 3안 명시 |
| MF-5 | 게임D | 핸드오프 복귀 시 런타임 변수 재주입 — outro가 미니게임 결과에 반응 | ⑥ `engine.resume()` 계약 + outro 분기 예시 표 | `resume(knot, vars)` 신설. ep08 outro가 `sank_count`별 3분기(예시 대사 수록) |
| MF-6 | 게임D·비신자 | 선택 콜백 의무화 + 미판독 flag CI 검출 | ⑥ 콜백 규칙, ④ E06/W01, ⑧ M4 완료 기준 | "모든 flag는 이후 ≥2회 가시적 회수" 의무 + 0회 판독 flag = CI 에러. ep08 콜백 맵 예시 표 |
| MF-7 | 게임D | 에피소드 클리어→허브 풀(pull) 트리거 + 허브 플랜 의존성 명시 | ② 시나리오 B-0, ⑥ RewardScreen 훅, ⑧ 의존성 행 | RewardScreen 비강압 훅 1줄("베드로가 할 말이 있는 듯하다") 이 플랜 범위로 편입 |
| MF-8 | 게임D·UX | 인터스티셜 재개 유예(실패 판정 불가 구간) | ⑤ 전이 규칙 7, ⑥ playInterstitial 계약, ⑨ T10 | 오버레이 종료 → 3·2·1 카운트다운 → 재개 후 3초 실패 판정 불가 |
| MF-9 | 게임D | 감수 이원화(전수/샘플) + 배치 주기 | ⑩ A/B 등급 이원화 표 | A등급(예수님·성구·수난) 사전 전수 2인, B등급(잡담·카드·토스트) 셀프체크+격주 배치. SLA 명시 |
| MF-10 | 게임D | 플레이테스트 행동 로그 계측 필수 | ⑨ 행동 로그 표 | 노드 체류시간·자동진행 채택률·스킵 시점·선택 결정 시간 로컬 계측(옵트인) |
| MF-11 | 엔지니어링·공통7 | git init + vitest 셋업을 M0 첫 태스크로 | ⑧ M0 | M0 첫 1일 = `git init`, vitest, test 스크립트, CI 워크플로 뼈대 |
| MF-12 | 엔지니어링 | WaterWalkGame pause phase·onPause/onResume·outroKnot 경유 리팩터링 공수 산정 | ⑥ 미니게임 공유 계약, ⑧ M2(+2일) | `phase: 'paused'` 추가, `completeEpisode` 직행 → `dialogue(outro)` 경유. 5동사 공유 인터페이스로 문서화 |
| MF-13 | 엔지니어링 | inkStates/seenLines를 idb-keyval로 분리 + debounce | ③ 세이브 v2 저장소 이원화 | localStorage(경량 진행) / IndexedDB(inkStates·seenLines·로그), debounce 500ms + visibilitychange flush |
| MF-14 | 엔지니어링 | 멱등 키를 텍스트 해시가 아닌 안정 식별자로 + 재플레이 정책 | ③ 키 설계, ⑤ 규칙 5 | 키 = `episodeId:knotPath:tagIndex`(ink 경로 기반). 재플레이 = "회상 모드"(이펙트 무효) 명문화 |
| MF-15 | 엔지니어링 | ink JSON 로딩 방식 통일 + inkjs 런타임 전용 번들 | ④ 파일 트리·정합 원칙 | `src/story/*.json` + dynamic import로 통일. 클라이언트는 inkjs 런타임 엔트리만, 컴파일러(full)는 빌드 스크립트 전용 |
| MF-16 | UX·공통6 | `--ink-on-light` 다크 텍스트 토큰 신설 + 대비 실측 명시 | ⑦ 토큰 표(대비 실측 열) | `--ink-on-light: #221807`(양피지 대비 13.8:1). `.btn-primary` 하드코딩 `#20160A`도 토큰으로 회수 |
| MF-17 | UX | 성구 각주 색·크기 재지정 + 글자 크기 설정 | ⑦ 표, ⑧ M3 | 양피지 위 각주 = `--ink-on-light` 70%(실효 대비 5.8:1), 14px. 글자 크기 3단계 설정 M3 편입 |
| MF-18 | UX | 스크린리더 요구사항 명문화 + T14 확장 | ③ 접근성 요구 절, ⑨ T14a~c | aria-live 미러링, 선택지 포커스 이동, 시트/오버레이 포커스 트랩, portal 배경 aria-hidden |
| MF-19 | UX | 타자 효과 "첫 탭 = 문장 즉시 완성" 계약 | ⑤ 전이 규칙 3 | 표시 중 탭 → 즉시 커밋(이펙트 1회), 완성 직후 180ms 오탭 무시 구간 |
| MF-20 | UX | 밝은 배경용 포커스 인디케이터 | ⑦ `--focus-on-light` | 2px `#221807` + 2px `#FFFFFF` 오프셋 이중 아웃라인(대비 13.9:1 / 흰 링 3:1↑) |
| MF-21 | UX | 아동·60세+ 코호트 추가 | ⑨ 패널 구성 표 | 초3~4 아동 2인·60세 이상 2인 필수 코호트 + 아동용 이해도 지표 |
| MF-22 | 비신자·공통5 | 무종교 20대 게이머 쿼터 + P2 분리 집계 | ⑨ 패널 구성 표·P2' | 무종교 20대 캐주얼 게이머 3인 필수. P2 집단별 분리 집계, 무종교 그룹 초과 시 불합격 |
| MF-23 | 비신자 | M0 전에 ep08 대본 초안 + 비신자 리딩 테스트 | ⑧ M-1 콘텐츠 선행 트랙 | 대본 전체 초안 → 무종교 독자 3인 리딩 테스트가 M0 착수 조건 |
| MF-24 | 비신자 | 기읽은 예수님 라인 재방문 강제 탭 해제 | ⑤ 전이 규칙 4 | 경외 정지는 첫 열람 1회. `seenLines` 라인은 재방문 시 홀드 빨리감기 허용 |

medium/low 이슈 반영 현황: 전 항목 반영(직인용/창작 시각 위계 분리 ⑦, 내레이터 원칙 ⑩ C8, bond 이코노미 ⑥-2, 대화 내 마이크로 보상 ⑥-3, 선택 등가 원칙 ②, blur/타자 성능 폴백 ⑦·⑪, persist 마이그레이션 방식 ③, 온보딩 힌트·로그 하단 경로·선택지 간격·tone hex ⑦, 드립피드 콘텐츠 예산 ⑥-4, 공유 카드 ⑥-3, P6 ≤10% ⑨). 유일한 부분 반영은 "대화 펜싱류 심화 대화 게임플레이"(비신자 high) — 3장·9장 동사 설계는 미니게임 플랜 소관이므로 본 플랜에서는 선택 콜백 의무화·outro 반응성·회상 모드로 "선택이 진짜"임을 보장하는 선까지 담당하고, 대화형 동사 자체는 minigames 플랜에 이관 항목으로 명시했다(⑧ 의존성).

---

## ① 목표와 범위

### 목표
1. **작가가 코드 없이 이야기를 쓴다** — 대사·분기·조건은 전부 `.ink` 파일. 엔진(React 측)은 새 에피소드가 와도 수정 0 (GDD §10 "콘텐츠 = 데이터"). 단, **콘텐츠가 코드 없이 들어온다 ≠ 감수 없이 들어온다** — 모든 텍스트는 ⑩의 상설 감수 게이트(해시 연동)를 통과해야 프로덕션 빌드가 성립한다.
2. **대화는 '읽기'가 아니라 '플레이'다** — 노드 1~3문장, 대화→미니게임→대화 샌드위치. 이를 문서 선언이 아니라 3개 계약으로 담보한다: (a) outro는 미니게임 결과 변수에 **반드시** 반응(⑥ resume 계약), (b) 모든 선택 flag는 이후 **최소 2회** 가시적으로 회수(⑥ 콜백 규칙 + CI 검출), (c) 대화 세션 90초당 최소 1회 마이크로 보상 이벤트(⑥-3).
3. **예수님 대사는 별도 트랙** — 조작 불가 NPC. 등장·발화에 고유 연출과 **데이터 계층 격리**(bond/collect 대상 금지를 Zod refine + CI 하드 에러로 기계 차단, ③·④)를 둔다. 예수님은 수치의 대상이 아니라 이야기의 주권자다.
4. **Hades식 드립피드** — 재방문 시 상황 반응형 대사. "기억해줌"의 밀도를 콘텐츠 예산표(⑥-4)로 산정하고, 풀(pull) 동선(RewardScreen 훅)을 이 플랜 범위에 포함한다.

### 범위 (이 플랜에서 만든다)
- inkjs 런타임 통합 계층(`narrative/`), `.ink` → JSON 컴파일·검증 파이프라인(빌드 시)
- DialogueScreen + DialogueOverlay(인터스티셜) 2종 UI, **구조(붙잡히심) 비트 연출**
- JesusPresence 연출 컴포넌트, 직인용/창작 시각 위계
- 백로그, 스킵(기읽음), 자동진행, 텍스트 속도·**글자 크기** 설정
- 선택지 결과 → 스토어 반영 이펙트 계약 + **bond 포인트 이코노미**
- 세이브 v2: localStorage(경량) + IndexedDB(inkStates 등) 이원화, persist migrate
- **RewardScreen 허브 유도 훅 1줄**(비강압), 감수 원장(`review-ledger.json`)과 CI 게이트
- 미니게임 공유 pause 계약(onPause/onResume) 문서화 — WaterWalkGame 리팩터링 포함

### 비범위 (다른 플랜/차기)
- 허브(관계 심화) 화면 UI 자체 — 별도 플랜. 단 M4가 소비하는 허브 API·의존 시점은 ⑧에 명시
- 미니게임 5동사 내부 설계 — 단 pause/resume·결과 변수 인터페이스는 본 플랜이 계약 소유
- 대화형 동사(거절 듀얼·대화 펜싱, 3장·9장) 설계 — minigames 플랜 이관(⑧ 의존성 행)
- 보이스/TTS, 다국어(i18n 키 여지만), 컷씬 저작 도구
- ink 외부 함수로 게임 로직 구동(역방향 결합 금지 — ⑥)

---

## ② 플레이어 경험 시나리오

### 시나리오 A — 에피소드 진입 대화 (8장 "내게로 오라") ※ 전면 개정
1. 여정 맵에서 8장 탭 → 심야 인디고 배경 페이드 인. 배 위, 폭풍 소리(Howler 크로스페이드).
2. 베드로 초상(좌측) + 대사 2~3노드. 하단 엄지 존 전체가 "다음" 탭 영역(첫 대화 1회차에 3초 인라인 힌트 "탭 = 다음" 노출).
3. **예수님 등장 비트**: 반 박자 dim → 앰버 림라이트와 함께 페이드 인(JesusPresence). "오라." — 한 단어. 직인용이므로 양피지 렌더 + 출처 칩(마 14:29).
4. 선택지: 「배에서 내린다」 / 「망설인다」. **수치 보정 없음 — 두 선택은 기계적으로 완전 등가.** 차이는 연출·서사에만: 「망설인다」는 베드로의 공감 대사 1노드 + 시작 카메라·BGM 레이어 차이 + `ep08_hesitated` flag(이후 ≥2회 회수, ⑥ 콜백 맵). 플레이테스트에 "한쪽이 유리하다고 느꼈나" 계측 포함(⑨ P7).
5. 미니게임(WaterWalkGame) — **게임적 도전은 침몰 전 구간까지다.** 집중이 무너져 침몰이 확정되면 게임 오버가 아니라 **구조 비트**로 전이한다:
   - (a) 조작 즉시 비활성(침몰은 실패 판정이 아님 — `sank_count`만 +1 기록)
   - (b) 화면이 물속 톤으로 잠기고, **예수님이 즉시 손을 내밀어 붙잡으시는 조작 불능 연출**(1.5~2s, reduced-motion 시 정적 2컷)
   - (c) 물 위로 끌어올려진 **직후**, 붙잡힌 채로 말씀 오버레이: "믿음이 작은 자여, 왜 의심하였느냐"(마 14:31, 직인용 렌더). 훈계 타이밍이 아니라 **건져주면서 하시는 말** — 원문 정황("즉시 손을 내밀어 그를 붙잡으시며")과 일치.
   - (d) 3·2·1 카운트다운 후 조작 재개, 재개 후 3초 침몰 판정 불가. 침몰 횟수 제한 없음 — 매번 붙잡으신다(주권은 예수님께, 숙련 척도는 별점·클리어 품질로).
6. 클리어 → **outro 대화가 플레이 결과에 반응**(⑥ resume 계약): `sank_count`·`hesitated`·클리어 품질별 베드로 분기 대사(예시 표 ⑥). → 관계 이벤트(베드로 bond +pt) → RewardScreen.

### 시나리오 B — 허브 재방문 드립피드
0. **풀 트리거(신규)**: 에피소드 클리어 RewardScreen 하단에 비강압 훅 1줄 — "베드로가 할 말이 있는 듯하다" + 선택적 진입 버튼(무시해도 불이익 0, FOMO 문구 금지 — 감수 대상 B등급 텍스트).
1. 허브에서 베드로 탭 → `hub_peter.ink` 진입점. ink가 `visits`·`ep08_hesitated`·관계 단계를 읽어 조건 맞는 미공개 대사를 선택.
2. 새 대사가 있으면 등불 dot. 없으면 dot 미표시 + 폴백 잡담(고갈 은폐가 아니라 "새 대사 주기"를 명시: **에피소드 클리어마다 동료별 상황 반응 노드 +2 이상 공급**, ⑥-4 예산표).
3. 관계 단계 도달 시 능력 해금 토스트 + 컬렉션 카드에 이야기 조각 기록. 조각 열람 화면은 공유 가능한 카드 1장(장면 일러스트 + 한 줄, PNG 저장) — 컬렉션 플랜과 인터페이스.

### 시나리오 C — 다시 보기/스킵/자동
- 자동진행 ON → 글자 수 비례 딜레이 후 자동 넘김(선택지 정지). **예수님 발화·성구 인용 라인은 첫 열람 시에만 정지+탭 요구.** 정지 시 등불 인디케이터가 점등되고 첫 1회에 한해 "탭하여 듣기" 미세 안내 — 멈춤이 버그가 아니라 의도임을 전달. **기읽은(seenLines) 라인은 재방문 시 정지·강제 탭 없음, 홀드 빨리감기 허용.**
- 타자 효과 표시 중 탭 1회 = 문장 전체 즉시 표시. 완료 후 탭 = 다음. 스킵 홀드는 기읽음 구간만.
- 로그 진입 경로 2개: 우상단 버튼(8px 데드존으로 오탭 시 대사 넘김 방지) + **대사 박스 내 하단 로그 아이콘**(엄지 도달권). 위로 스와이프도 로그 시트 오픈.

### 시나리오 D — 접근성/중단 복귀
- 대화 중 이탈 → 같은 노드 복원(ink 상태 IndexedDB 저장). **인터스티셜/구조 비트 중 이탈은 예외 폴백**: 미니게임 재시작 + 해당 인터스티셜 기읽음 처리(미니게임 내부 상태는 직렬화 비대상임을 명시).
- `prefers-reduced-motion`: 전 연출 정적 폴백(페이드/2컷). 무음 완전 지원.
- **스크린리더**: 대사 라인은 aria-live=polite 영역에 미러링, 선택지 렌더 시 첫 버튼 포커스, 백로그 시트·오버레이는 포커스 트랩 + 배경 aria-hidden. `user-select:none`은 대화 텍스트 영역에서 해제.
- 글자 크기 3단계(기본 17px / 크게 19px / 아주 크게 22px) — 8세와 70대를 같은 크기로 커버하지 않는다.

---

## ③ 데이터 모델 (TypeScript 타입 스케치)

```ts
// src/content/schema.ts 확장 ─────────────────────────────

/** 예수님 격리 상수 — 단일 진실원. 스키마·CI·엔진이 모두 이 목록을 참조 */
export const SOVEREIGN_IDS = ['jesus'] as const

export const SpeakerSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(['jesus', 'companion', 'npc', 'narrator']),
  portrait: z.string().optional(),
  tone: z.enum(['lamp', 'blue', 'rose', 'green']).optional(),
}).superRefine((s, ctx) => {
  // 예수님 tier와 id는 상호 잠금 — 어느 한쪽만 바꿔 우회하는 것을 차단
  if (SOVEREIGN_IDS.includes(s.id as any) !== (s.tier === 'jesus')) {
    ctx.addIssue({ code: 'custom', message: `speaker '${s.id}': tier/jesus id 불일치` })
  }
})

/** ink → 게임 효과 태그. 예수님 격리를 스키마 수준에서 강제 (MF-2) */
export const NarrativeEffectSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('bond'),    companionId: z.string(), pts: z.number().int().min(1).max(2) }),
  z.object({ kind: z.literal('flag'),    key: z.string(), value: z.union([z.boolean(), z.number(), z.string()]) }),
  z.object({ kind: z.literal('shard'),   shardId: z.string() }),
  z.object({ kind: z.literal('collect'), companionId: z.string() }),
  z.object({ kind: z.literal('sfx'),     key: z.string() }),
  z.object({ kind: z.literal('bgm'),     key: z.string() }),
  z.object({ kind: z.literal('presence'), on: z.boolean() }),
]).superRefine((e, ctx) => {
  if ((e.kind === 'bond' || e.kind === 'collect')
      && SOVEREIGN_IDS.includes((e as any).companionId)) {
    ctx.addIssue({
      code: 'custom',
      message: `E03: '${e.kind}' 대상에 예수님(id: ${(e as any).companionId}) 금지 — ` +
               `주님은 관계 수치·수집의 대상이 아니다 (기둥①). 빌드 하드 에러.`,
    })
  }
})
export type NarrativeEffect = z.infer<typeof NarrativeEffectSchema>

/** 에피소드 내러티브 메타 — reviewed는 boolean이 아니라 해시 원장 참조 (MF-3) */
export const EpisodeNarrativeSchema = z.object({
  inkFile: z.string(),                    // 'ep08.json' (src/story/ 산출물)
  entryKnot: z.string().default('intro'),
  outroKnot: z.string().default('outro'),
  interstitials: z.array(z.string()).default([]),
  /** 미니게임이 outro에 재주입해야 하는 결과 변수 계약 (⑥ resume) */
  resultVars: z.array(z.string()).default([]),  // 예: ['sank_count','grace_clear']
})

/** 관계 — 단계 내부 포인트 누적 (bond 인플레 방지, 게임D medium) */
export interface BondState { level: 0 | 1 | 2 | 3 | 4; pts: number }
// 단계 명칭: 0 만남 · 1 동행 · 2 신뢰 · 3 우정 · 4 증인. 승급 요구 pts는 ⑥-2 표.

export interface RelationshipState {
  bonds: Record<string, BondState>       // 예수님 id는 스키마상 진입 불가
  flags: Record<string, boolean | number | string>
  storyShards: string[]
}

export interface DialogueLogEntry {
  speakerId: string
  text: string
  verseRef?: string
  quoteKind?: 'scripture' | 'authored'   // 직인용/창작 위계 (⑦) — 백로그에서도 유지
  choiceTaken?: string
}

export interface NarrativeSlice {
  mode: 'idle' | 'dialogue' | 'interstitial' | 'rescue'   // rescue = 구조 비트 (조작 불능)
  currentLine: { speakerId: string; text: string; verseRef?: string; quoteKind?: 'scripture' | 'authored' } | null
  choices: { index: number; text: string }[]
  log: DialogueLogEntry[]
  /** 기읽음 — 텍스트 해시 아님. ink 경로 기반 안정 키 'epId:knotPath:lineIndex' (MF-14) */
  seenLines: Record<string, true>
  /** 이펙트 멱등 원장 — 키 'epId:knotPath:tagIndex'. 회상 모드에서는 기록만, 적용 안 함 */
  appliedEffects: Record<string, true>
  replayMode: boolean                    // 회상 모드: 클리어한 에피소드 재진입 시 true → 이펙트 무효
  autoPlay: boolean
  textSpeed: 'slow' | 'normal' | 'fast'
  fontScale: 'base' | 'large' | 'xlarge' // 17/19/22px (MF-17)
  jesusPresent: boolean
}
```

### 세이브 v2 — 저장소 이원화 (MF-13) + persist migrate (엔지니어링 low)
| 저장소 | 키/방식 | 내용 | 쓰기 정책 |
|---|---|---|---|
| localStorage (zustand persist) | 키 **`donghaeng-save-v1` 유지**, `persist({ version: 2, migrate })` | 기존 partialize(completed/companions/gentleMode) + relationships + replay 마킹 + 설정(autoPlay/textSpeed/fontScale) — 경량 JSON < 4KB | zustand 기본(동기, 저빈도 상태 변경 시만) |
| IndexedDB (idb-keyval — 이미 deps에 있음) | `ink:{episodeId}` / `seen` / `applied` / `dlog` | inkStates(에피소드당 수 KB), seenLines, appliedEffects, 대화 로그 | **debounce 500ms** + `visibilitychange`/handoff 시 즉시 flush(비동기) |

- 마이그레이션: 새 키를 만들지 않는다. persist 내장 `version: 2` + `migrate(persisted, from)` — from 0(미지정=현행)이면 `completed`/`companions`/`gentleMode` 보존, 신규 필드 기본값. 실패 시 원본 그대로 두고 신규 시작 제안(파괴적 덮어쓰기 금지).
- 대화 중 프레임 예산: localStorage 동기 쓰기는 대화 진행 경로에서 발생하지 않는다(라인 진행·seen 기록은 전부 IndexedDB 경로).

### 접근성 요구사항 (구현 계약 — MF-18)
- `currentLine` 갱신 → 시각 렌더와 별도의 `aria-live="polite"` 영역에 텍스트 미러(타자 효과 완료 시점에 1회, 중간 프레임 미방송).
- 선택지 렌더 → 첫 버튼으로 프로그램 포커스 이동. 선택 후 대사 박스로 복귀.
- BacklogSheet·DialogueOverlay(portal): 포커스 트랩, `Esc`/닫기 버튼, 배경 루트 `aria-hidden="true"` + `inert`.
- 대화 텍스트 컨테이너는 `user-select: text`(전역 none 예외).
- 키보드/스위치: Enter=다음, 화살표=선택지 이동 — 탭 제스처의 1:1 대안.

---

## ④ 모듈/컴포넌트 구조 (기존 src와 정합)

```
sowrd/
├─ ink/                          # 작가 소스 (레포에 커밋, 배포 제외)
│  ├─ ep08.ink
│  ├─ hub_peter.ink
│  └─ _shared.ink
├─ content-review/
│  ├─ review-ledger.json         # ★ 감수 원장: 파일별 {sha256, 등급, 승인자 2인, 일자} (⑩)
│  └─ krv/                       # ★ 개역개정 대조용 로컬 본문 DB (라이선스 계약 후 반입)
├─ scripts/
│  └─ compile-ink.mjs            # .ink → src/story/*.json + 검증 (아래 CI 규칙)
├─ src/
│  ├─ story/                     # ★ 컴파일 산출물 — dynamic import 대상 (public/ 아님, MF-15)
│  ├─ narrative/
│  │  ├─ engine.ts               #   inkjs Story 래퍼: load/continue/choose/resume/save/restore
│  │  ├─ tags.ts                 #   태그 파서 → NarrativeEffect (Zod 검증 통과분만)
│  │  ├─ effects.ts              #   디스패치 (유일한 부수효과 지점, 멱등 원장·회상 모드 게이트)
│  │  ├─ useDialogue.ts          #   화면용 훅
│  │  ├─ registry.ts             #   episodeId → dynamic import('src/story/…') 캐시
│  │  └─ telemetry.ts            #   행동 로그 (로컬, 옵트인 — ⑨)
│  ├─ content/  (schema.ts 확장 · speakers.ts · episodes.ts)
│  ├─ state/store.ts             #   GameState + NarrativeSlice + RelationshipState
│  ├─ screens/DialogueScreen.tsx
│  ├─ components/narrative/
│  │  ├─ DialogueBox.tsx · ChoiceList.tsx · SpeakerPortrait.tsx
│  │  ├─ JesusPresence.tsx · RescueBeat.tsx(구조 비트) · BacklogSheet.tsx · DialogueOverlay.tsx
│  └─ App.tsx                    #   'dialogue' 분기 추가
```

**정합 원칙**
- `Screen` 유니온에 `'dialogue'` 추가. `enterEpisode → dialogue(intro) → game → dialogue(outro) → reward`. intro 없는 에피소드는 기존 경로(하위 호환). **`completeEpisode`는 더 이상 reward로 직행하지 않고 `outroKnot` 경유** — WaterWalkGame 수정 필요(⑧ M2 공수).
- `engine.ts`는 React 비의존. **클라이언트 번들은 inkjs 런타임 전용 엔트리만 import**(컴파일러 포함 full 배포판은 `compile-ink.mjs` 전용 — 번들 수백 KB 절감, 저가폰 초기 로드 보호).
- ink JSON은 `src/story/`에 두고 dynamic import(청크 분할 + 콘텐츠 해시 캐싱)로 통일. `public/`+fetch 경로 폐기.

### compile-ink.mjs CI 검증 규칙 (전부 기계 판정)
| 코드 | 판정 | 수준 |
|---|---|---|
| E01 | ink 컴파일 실패 | 에러 |
| E02 | `# speaker:` id가 speakers.ts에 없음 | 에러 |
| **E03** | `# bond:`/`# collect:` 대상이 `SOVEREIGN_IDS`(예수님) | **에러 (MF-2)** |
| **E04** | `# verse:` 라인 텍스트가 로컬 개역개정 본문 DB와 불일치(공백 정규화 후 diff) | **에러 (MF-4)** |
| E05 | 에피소드 파일 bond 합계 > 상한(본편 3pt/파일, 허브 1pt/세트 — ⑥-2) | 에러 |
| E06 | 선언된 flag가 어떤 ink 파일에서도 판독되지 않음 | 에러 |
| W01 | flag 판독 횟수 1회(목표 ≥2회 — ⑥ 콜백 규칙) | 경고 |
| **E07** | `playable && review-ledger 미승인`(해시 불일치 포함) 상태로 프로덕션 빌드 | **에러 (MF-3).** `--allow-unreviewed`는 dev 빌드 전용 |
| W02 | 노드 3문장 초과 / 대화 세션 추정 90초 초과(글자 수 환산) | 경고 |
| E08 | `tier==='jesus'` 화자 라인에 `quoteKind` 판정 불가(verse 태그도 authored 마크도 없음) | 에러 |

```js
// compile-ink.mjs 발췌 (E03/E04 스케치)
for (const tag of lineTags) {
  const eff = parseTag(tag)
  const r = NarrativeEffectSchema.safeParse(eff)
  if (!r.success) fail('E03', file, line, r.error.issues[0].message)
}
if (tags.verse) {
  const canon = krvDb.lookup(tags.verse)           // content-review/krv/
  if (normalize(lineText) !== normalize(canon)) fail('E04', file, line,
    `인용문이 개역개정 본문과 불일치: "${diff(lineText, canon)}"`)
}
```

---

## ⑤ 핵심 플로우 (상태 전이)

```
map ──enterEpisode──▶ dialogue(intro) ──# handoff: game──▶ game
                                                            │
      game 중 침몰 확정 ──▶ rescue(조작 불능 붙잡히심 비트)   │
        └─ 말씀 오버레이(직인용) ─▶ 3·2·1 카운트 ─▶ game 재개  │
      game 중 인터스티셜 트리거 ─▶ interstitial(pause) ─▶ 재개 │
                                                            ▼
      game clear ──▶ dialogue(outro, resume(vars)) ──▶ reward ──▶ map
                                        └ RewardScreen 허브 훅(선택)
```

**전이 규칙(불변식)**
1. `mode:'dialogue'`에서만 전체화면 DialogueScreen. `interstitial`/`rescue`는 게임 위 포털 — 게임 컴포넌트 언마운트 금지, pause만.
2. ink 상태 저장: (a) 선택 직후 (b) handoff 직전 (c) visibilitychange — 전부 IndexedDB 비동기 + debounce. 복원 실패 시 entryKnot 안전 재시작(진행 플래그는 스토어에 영속).
3. **타자 효과 계약 (MF-19)**: 표시 중 탭 → 문장 전체 즉시 커밋(이펙트는 이 시점 1회), 완성 직후 180ms 입력 무시(연타 오탭 방지), 완료 후 탭 → 진행. 구현은 글자당 setState 금지 — rAF 배칭 + CSS clip 방식(⑪ 성능).
4. **자동진행 정지 조건 통일 (엔지니어링 low + MF-24)**: `tier==='jesus' || verseRef 존재` **이고 미열람(seenLines에 없음)**일 때만 정지+탭 요구. 정지 시 등불 인디케이터 점등(⑦), 최초 1회 "탭하여 듣기" 안내. 기읽은 라인은 자동진행 통과·홀드 빨리감기 허용 — 경외 연출은 첫 열람 1회로 완결.
5. **이펙트 멱등 (MF-14)**: 키 = `episodeId:knotPath:tagIndex`(ink 경로 기반 안정 식별자 — 오탈자 수정에 불변). 기읽음 키와 별도 원장. **재플레이 정책 명문화**: 클리어된 에피소드 재진입은 `replayMode=true`(회상 모드) — 이펙트 전부 무효, UI에 "회상" 배지, seenLines 누적은 유지.
6. **구조(rescue) 비트 (MF-1)**: 침몰 확정 → 입력 차단 → 붙잡히심 연출 → 말씀(마 14:31 직인용, 1탭) → 카운트다운 → 재개. 침몰은 실패 카운트가 아니라 `sank_count` 서사 변수. 위기의 해소는 항상 예수님의 행동 — 플레이어 실력이 구원을 대신하지 않는다(C3).
7. **인터스티셜 재개 유예 (MF-8)**: 모든 인터스티셜 종료 시 3·2·1 카운트다운 → 입력 재활성 → 3초간 실패 판정 불가. 트리거 배치는 긴장 최고점 직전을 피하고(침몰 위기는 rescue 비트가 전담), 에피소드당 최대 1~2회.

---

## ⑥ 타 시스템과의 인터페이스 (이벤트/셀렉터 계약)

**방향 원칙 유지**: ink → 게임은 태그(선언), 게임 → ink는 변수 주입. 상태 변경은 태그→`NarrativeEffect`→스토어 단방향.

### ⑥-1 ink 태그 규약 (작가용 API)
```
# speaker: peter            화자 (필수, 라인 단위 상속)
# verse: 마 14:31            성구 직인용 → 양피지 렌더 + 출처 칩 + E04 본문 대조
# authored                  예수님 창작 라인 명시 마크 (E08: jesus 라인은 verse|authored 필수)
# bond: peter +1            관계 포인트 (pts 1~2, 예수님 금지 E03, 파일 상한 E05)
# flag: ep08_hesitated 1    스토리 플래그 (미판독 시 E06/W01)
# shard: shard_ep08_call    이야기 조각 → 마이크로 보상 연출 (⑥-3)
# collect: bartimaeus       인카운터 카드 (예수님 금지 E03)
# presence: on|off          예수님 등장 연출
# bgm: storm_calm  # sfx: wave
# handoff: game             미니게임으로 제어 이양
```

### ⑥-2 bond 포인트 이코노미 (인플레·조기 캡핑 방지 + 만렙 도달 산술 증명)
승급 요구: 0→1 = 2pt · 1→2 = 3pt · 2→3 = 4pt · 3→4 = 5pt · **합계 14pt**

베드로 공급 산수(12장 여정):
| 공급원 | pt | 근거 |
|---|---|---|
| ep04 영입 본편 | +2 | 본편 파일 상한 3pt 내 |
| ep08 본편(핵심장) | +3 | 상한치 |
| ep11 본편(관계 총정산) | +2 | |
| 허브 상황 반응 세트(클리어마다 +2노드, 세트당 +1pt) | +6 | 관련 6개 장 클리어 기준 |
| 이야기 조각 마일스톤(조각 4개당 +1) | +3 | 조각 12개 보유 시 |
| **총 공급** | **16pt** | 필요 14pt 대비 **114%** — 전 콘텐츠의 87.5%만 소화해도 만렙 도달 |

- CI E05가 파일별 상한을 강제하므로 작가 태그 실수로 인플레 불가. 총 공급 ≥ 필요×1.1은 compile-ink 집계 리포트로 상시 출력.
- 능력 해금은 level 기준(허브 플랜 소비) — `onBondLevelUp` 이벤트 유지.

### ⑥-3 대화 내 마이크로 보상 리듬 (GDD §8 30~90초 계약)
| 이벤트 | 연출 | 빈도 규칙 |
|---|---|---|
| shard 획득 | 대사 박스 위로 카드가 0.6s 슬라이드-인 + 등불 파티클(CSS), 탭 시 즉시 수납 | 에피소드 대화(인트로+아웃트로)당 **최소 2개** |
| flag 콜백 발화 | 화자명 옆 "기억" 아이콘 1.2s 점등 — "내 선택을 기억한다"의 가시화 | 콜백 발생 라인마다 |
| bond pt 획득 | 하단 미니 게이지 +채움, 승급 시에만 풀 토스트 | 태그 시점 |
| 조각 열람(컬렉션) | 장면 일러스트+한 줄 공유 카드, PNG 저장 버튼 | — (공유 순간 설계, 비신자 low) |
- 규칙: **대화 세션 90초당 보상 이벤트 ≥1회**(W02 글자 수 환산과 함께 compile-ink 리포트로 계측). 집중 미니게임 플레이 중에는 시각 토스트 금지(공통 지침 6) — 보상은 대화·리절트 구간에서만.

### ⑥-4 드립피드 콘텐츠 예산표 (동료 1인 기준, MVP=베드로)
| 분류 | 노드 수 | 공개 조건 |
|---|---|---|
| 관계 단계별 신규 대사 | 0단계 3 · 1단계 4 · 2단계 5 · 3단계 5 · 4단계 3 = **20** | 단계 도달 |
| 상황 반응(에피소드 클리어마다 +2) | **12** (관련 6개 장 × 2) | 해당 장 클리어 |
| 선택 콜백 전용 | **6** (flag별 ≥2회 회수분) | flag 조건 |
| 폴백 잡담(고갈 시, dot 없음) | **8** | 무조건 풀 |
| **합계** | **46노드** (노드 1~3문장 = 원고 분량 A4 약 5~6장) | |
- 재방문 3회 소진 문제 해소: 신규 공급이 "에피소드 클리어"라는 플레이 진행에 결합 — 우물은 플레이할수록 다시 찬다. dot은 신규 대사 있을 때만.

### ⑥-5 선택 콜백 규칙 (MF-6) + ep08 콜백 맵 예시
**의무 규칙(작가 가이드 `docs/ink-style.md` + CI)**: 모든 선언 flag는 이후 **최소 2회** 가시적 회수(허브 대사·후속 에피소드·카드 뒷면 문구). 0회 = E06 에러, 1회 = W01 경고. 회수 못 만들 flag면 선택지를 빼는 것이 원칙.

| flag | 회수 1 | 회수 2 | 회수 3(보너스) |
|---|---|---|---|
| `ep08_hesitated=1` | 허브: 베드로 "그날 너도 뱃전을 잡고 있었지. …나는 두 번 잡았다." | ep11 다락방: "망설이는 게 부끄러운 게 아니더라. 안 일어서는 게 부끄러운 거지." | 베드로 카드 뒷면 문구 분기 |
| `ep08_hesitated=0` | 허브: "너 그때 바로 뛰어내리더라. 미친 줄 알았다. …좋은 의미로." | ep11: "그날 네 등을 보고 나도 일어섰다." | 동일 |
| `sank_count>=3` | outro 즉시(아래 표) | 허브: "가라앉아 본 사람만 아는 게 있다." | — |

### ⑥-6 핸드오프 결과 변수 재주입 — `engine.resume()` (MF-5)
```ts
// 미니게임 → 내러티브 복귀 계약
engine.resume(outroKnot: string, vars: Record<string, number | boolean>): void
// ep08: resume('outro', { sank_count, grace_clear, hesitated })
```
outro 분기 예시(ep08, 베드로):
| 조건 | outro 대사(예시) |
|---|---|
| `sank_count == 0` | "…한 번도 안 빠졌다고? 난 그날 코로 갈릴리 물을 반은 마셨는데." (유머 — GDD §9 티격태격) |
| `sank_count 1~2` | "빠졌다가 다시 걸었잖아. 그게 걷기만 한 것보다 나은 얘기다." |
| `sank_count >= 3` | "나도 그랬다. …정말이야. 세어 보진 말자." |
- `EpisodeNarrativeSchema.resultVars`에 선언된 변수는 resume 시 **필수 주입** — 누락 시 dev 빌드 경고. outro가 정적이면 "대화는 플레이다"가 무너진다는 지적의 기계적 해소.

### ⑥-7 미니게임 공유 pause 계약 (MF-12 — 5동사 재사용)
```ts
interface MinigamePauseContract {
  onPause(): void      // rAF 루프 정지, s.last·waveTimer 등 시계 동결
  onResume(): void     // 시계 재기준(s.last = now), 3초 무적/판정 유예 개시
  onRescue?(): void    // 균형 동사 전용: 침몰 확정 → 조작 차단 + rescue 비트 핸드오프
}
```
- WaterWalkGame 리팩터링(⑧ M2, 2일): Phase에 `'paused' | 'rescue'` 추가, `completeEpisode` 직접 호출 제거 → `narrative.enterOutro()` 경유.

### ⑥-8 스토어 셀렉터/액션 (타 시스템 소비)
```ts
selectBond(companionId): BondState
selectHasUnread(companionId): boolean        // 신규 대사 존재 시만 true (dot)
narrative.playInterstitial(knot): Promise<void>  // pause·재개 유예 계약 포함
narrative.enterRescue(knot): Promise<void>       // 구조 비트 (균형 동사)
narrative.enterOutro(vars): void                 // resume 래퍼
selectFlag(key) · selectStoryShards(companionId)
onBondLevelUp(companionId, level)                // 토스트는 허브/보상 측 책임
```

---

## ⑦ UI 디자인 토큰 적용

기존 `global.css` 토큰 기준. **신규 토큰은 global.css에 정식 승격**(매직 넘버 산재 금지 — UX low). 신설:

```css
--ink-on-light: #221807;        /* 양피지 위 본문 (btn-primary #20160A 하드코딩도 이 계열로 회수) */
--ink-on-light-70: rgba(34,24,7,0.7);  /* 양피지 위 각주 */
--tone-blue: #8fc1e9;  --tone-rose: #f2a9b4;  --tone-green: var(--good);  --tone-lamp: var(--lamp);
--dialogue-scrim: rgba(5,7,15,0.35);   /* presence dim */
--presence-glow: rgba(240,178,74,0.30);
--dur-reverent: 0.8s;
--choice-gap: 12px;
--focus-on-light: 0 0 0 2px #ffffff, 0 0 0 4px #221807;  /* 밝은 배경 이중 아웃라인 */
```

### 스펙 표 — 대비 실측치 병기 (WCAG: 텍스트 ≥4.5:1, 비텍스트 ≥3:1)
| 요소 | 스펙 | 전경/배경 | **실측 대비** | 판정 |
|---|---|---|---|---|
| 대사 박스 본문 | `--sans` 17px(설정 17/19/22)/1.7 `--ink`, `--panel` 85%+blur(저사양 폴백: 불투명 `--panel`) | `#ECE7DA` / `#151F39` | **13.2:1** | AAA |
| 화자명 | `tone` 색 + 초상 + 이름 3중 신호(색 단독 구분 금지 — WCAG 1.4.1) | `--tone-blue` / `--panel-2` | **7.7:1** | AAA |
| | | `--tone-rose` / `--panel-2` | **7.8:1** | AAA |
| | | `--tone-green` / `--panel-2` | **10.2:1** | AAA |
| | | `--tone-lamp` / `--panel-2` | **7.8:1** | AAA |
| 선택지 | 높이 ≥44px, **간격 `--choice-gap` 12px(최소 8px)**, `--panel-2` 배경 | 본문 `--ink` / `--panel-2` | 12.0:1 | AAA |
| **예수님 직인용 라인** | `--parchment` 박스 + `--serif` + **인용 표지 「」 + 출처 칩('마 14:31') 상시 노출**, 자간 +0.02em | `--ink-on-light` / `--parchment` | **13.8:1** | AAA |
| **예수님 창작 라인**(`# authored`) | **양피지 아님** — 다크 패널 유지 + `--serif` + `--lamp-soft` 미세 글로우. 출처 칩 없음이 한눈에 보이는 위계 | `--ink` / `--panel` | 13.2:1 | AAA |
| 성구 각주 | `--ink-on-light-70`, **14px**(기존 12px 상향) | 실효 대비 / `--parchment` | **5.8:1** | AA+ |
| 다크 배경 각주 | `--muted` 13px | `#9AA3BD` / `--panel` | **6.5:1** | AA+ |
| 포커스(다크 배경) | 기존 2px `--lamp` | `--lamp` / `--ground` | **10.1:1** (비텍스트 3:1↑) | 통과 |
| **포커스(양피지 위)** | `--focus-on-light` 이중 아웃라인 | `#221807` / `--parchment` | **13.9:1** | 통과 |
| 자동진행 정지 인디케이터 | 등불 아이콘 점등(pulse), 최초 1회 "탭하여 듣기" 라벨 | `--lamp` / `--ground` | 10.1:1 | 통과 |
| JesusPresence 연출 | `--dialogue-scrim` dim → 페이드+상승 12px(`--dur-reverent`, Motion) → `--presence-glow` 라디얼. reduced-motion: 크로스페이드만. 파티클 CSS 전용(Pixi 미도입) | — | — | — |
| 구조(rescue) 비트 | 물속 톤 `--sea` 오버레이 → 손 내밀어 붙잡는 2컷/모션 → 말씀(직인용 렌더) → 3·2·1 카운트 | 카운트 숫자 `--parchment`/`--sea` | 9.6:1 | AAA |
| 백로그 시트 | `--ground-2` 풀시트, 초상 32px, 직인용 라인은 양피지 처리 유지(각주 규칙 동일 적용) | 상동 | 상동 | — |
| 로그 진입 | 우상단 버튼(주변 8px 데드존) + **대사 박스 하단 아이콘** + 위 스와이프 | — | — | — |
| 스킵 대안 | 홀드 외 **백로그 시트 내 "여기까지 건너뛰기" 버튼**(비홀드 대안 — WCAG 2.5) | — | — | — |

- 참조 대비(문제 확인용): 기존안 `--ink`/`--parchment` = **1.0:1**(구현 불가), `--muted`/`--parchment` = **2.0:1**, `--lamp` 아웃라인/`--parchment` = **1.5:1** — 전부 위 신설 토큰으로 해소.

---

## ⑧ MVP → v1 로드맵

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **M-1 선행 트랙** (1주, 코드 0 — MF-23·MF-4) | (a) **ep08 전체 ink 대본 초안**(intro/구조 비트/outro/콜백 맵) 완성 (b) **무종교 20대 독자 3인 리딩 테스트** — "계속 읽고 싶은가/오글거리는가" (c) **대한성서공회 개역개정 사용 허락 신청 발송**(앱·상업 배포 계약) (d) 감수자 섭외(통합측 목회자 2인 이상) + `review-ledger` 절차 합의 | 대본 리딩 통과(재미 불합격 시 파이프라인 착수 보류·개고), 저작권 신청 접수증, 감수 절차 서면 합의 |
| **M0 파이프라인** (5일) | **1일차: `git init` + vitest + @testing-library 셋업 + test/CI 스크립트(MF-11)** → compile-ink(E01~E08/W01~02), registry(dynamic import), engine.ts+tags.ts, 스키마 확장(Zod refine), persist v2 migrate, idb-keyval 이원화 | E03·E04 위반 픽스처가 CI에서 실패, 단위 테스트 녹색 |
| **M1 대화 화면** (1주) | DialogueScreen/DialogueBox/ChoiceList/SpeakerPortrait, 타자 효과(rAF+clip, 첫 탭 완성), 'dialogue' 전이, aria-live·포커스 계약 | 8장 intro→game→outro 풀 플로우. **이 시점 ep08 스크립트 감수 1차 회람 시작**(게이트 대기 흡수 — 엔지니어링 medium) |
| **M2 연출 + 미니게임 계약** (1주 + **2일**) | JesusPresence, RescueBeat(구조 비트), DialogueOverlay, Howler 연동, **WaterWalkGame 리팩터링: paused/rescue phase + onPause/onResume + outroKnot 경유(2일, MF-12)**, resume(vars) 배선 | 구조 비트·재개 유예 동작, reduced-motion 대응, **중저가 실기기 1대(저가 Adreno/Mali) 60fps 검증** |
| **M3 QoL** (5일) | 백로그(하단 진입 경로 포함), 자동진행+등불 인디케이터, 기읽음 스킵, 텍스트 속도, **글자 크기 3단계**, 중단 복원(인터스티셜 폴백 포함), 온보딩 힌트 | 시나리오 C·D 전부 통과, 스크린리더 시나리오 수동 점검 |
| **M4 관계·드립피드** (1주) | bond 이코노미(E05), hub_peter **예산표 1차분 20노드**, 콜백 맵 구현, RewardScreen 허브 훅, 컬렉션 조각 연동, telemetry | 재방문 3회 상이 대사, flag 회수 ≥2회 CI 통과, v1 세이브 무손실 |
| **콘텐츠 트랙(병행)** (M1~M4와 병렬, 총 1.5주 산정) | hub_peter 잔여 26노드, 폴백 잡담, 카드·토스트 문구(전부 감수 대상 B등급), 감수 자료(연출 영상 캡처) | 예산표(⑥-4) 100% + B등급 셀프체크 완료 |
| **v0.5 감수 게이트** | A등급 전수 승인 완료(M1부터 흐른 감수의 종결점) + 연출 영상 감수 | `review-ledger` 전 파일 승인, E07 통과, 프로덕션 빌드 성공 |
| **v1 확장** | 4장 ink 이식, 화자 15인, `docs/ink-style.md` 완성판, i18n 키 | 에피소드 2개+허브 2인 — 콘텐츠만으로 추가·**감수 게이트 통과** 증명 |

**의존성 명시 (MF-7 외)**
| 의존 | 내용 | 리스크 시 대안 |
|---|---|---|
| 허브 UI 플랜 | M4의 드립피드 소비 화면. **허브 플랜 M2 완료가 본 플랜 M4 착수 조건** | 허브 지연 시 M4는 RewardScreen 훅→간이 대화 진입(허브 화면 없이 DialogueScreen 재사용)으로 선검증 |
| minigames 플랜 | pause 계약(⑥-7) 공유, 대화형 동사(3장·9장 거절 듀얼/대화 펜싱) 설계 이관 | 계약 문서는 본 플랜이 소유 — 선행 배포 |
| 대한성서공회 | 개역개정 사용 허락. **M1 이전 신청, v0.5 이전 체결** | ⑪ 저작권 리스크 행 참조(3안) |
| 감수자(외부) | A등급 SLA 5영업일 | M1부터 조기 회람으로 대기 흡수, 일정 볼모화 방지 |

---

## ⑨ 테스트 계획

### 단위 (Vitest — engine/tags/effects는 React 비의존)
- T1 `tags.ts`: `# bond: peter +1` → `{kind:'bond',companionId:'peter',pts:1}`. 미등록 화자 → E02.
- **T1a `schema.ts`: `# bond: jesus +1` / `# collect: jesus` → Zod refine 거부(E03). `SOVEREIGN_IDS` 우회(대소문자·tier 불일치) 케이스 포함.**
- T2 다중 태그 순서 무관 파싱. `# verse` + `# authored` 동시 지정 → 에러.
- T3 `engine.ts`: continue→choose→continue 인덱스 안정성. **T3a `resume(knot, vars)`: resultVars 전량 주입·누락 시 경고.**
- T4 save→restore 동일 노드·변수. 손상 JSON → entryKnot 폴백.
- T5 `effects.ts` 멱등: 같은 `epId:knotPath:tagIndex` 2회 → 1회 적용. **T5a 회상 모드: replayMode=true에서 이펙트 0회 적용·seen은 누적.**
- T6 persist migrate: version 0(미지정) 페이로드 → v2에서 completed/companions/gentleMode 보존. 키 `donghaeng-save-v1` 불변.
- **T6a idb 이원화: 라인 진행 경로에서 localStorage 동기 쓰기 0회(spy), debounce flush가 visibilitychange에 즉시 발화.**
- T7 감수 원장: 원문 1글자 수정 → 해시 불일치 → `reviewed` 해제 → 프로덕션 빌드 실패(E07), `--allow-unreviewed`는 dev만.
- **T7a E04: 픽스처 인용문에 오탈자 1자 → CI 실패, 정상문 통과. E05 bond 상한 초과 픽스처 실패. E06 미판독 flag 실패.**

### 통합 (RTL — 자동화는 4건으로 압축, 나머지는 수동 체크리스트: 엔지니어링 high 반영)
- T8 맵→dialogue→handoff→game→**rescue→재개**→clear→outro(**vars 반영 분기 확인**)→reward 전체 전이.
- T9 선택지 A/B: flag·bond 반영, 재선택 불가. **양 선택의 기계적 등가(수치 diff 0) 검증.**
- T10 인터스티셜: 게임 언마운트 없음, 종료 후 **카운트다운→3초 실패 판정 불가** 콜백 순서.
- T11 자동진행: 미열람 예수님/verse 라인 정지 + 인디케이터, **기읽은 라인은 무정지 통과**. 타자 중 탭 → 즉시 완성 + 180ms 무시.
- T14(확장, MF-18) 접근성: (a) 버튼 ≥44px + 선택지 간격 ≥8px (b) reduced-motion 시 페이드 전용 (c) **aria-live 영역에 라인 미러 1회** (d) **선택지 렌더 시 첫 버튼 포커스** (e) **시트/오버레이 열림 시 배경 aria-hidden + 포커스 트랩**.
- 수동 QA 체크리스트로 강등: 백로그 기록 순서, visibilitychange 저장, 스와이프 로그, 실기기 성능, 실제 스크린리더(TalkBack/VoiceOver) 청취.

### 행동 로그 계측 (MF-10 — 로컬 저장, 옵트인, 플레이테스트 세션 한정)
| 지표 | 해석 |
|---|---|
| 노드별 체류시간 | 급가속 구간 = 탭스루(설교감의 정직한 신호 — 설문보다 우선) |
| 자동진행 채택률·해제 시점 | 텍스트 속도 기본값 적정성(P6) |
| 스킵 홀드 사용 시점 | 재미 없는 구간 지도 |
| 선택지 결정 시간 | 결정 시간 < 1s 연속 = 선택 형해화 신호 |
| rescue 비트 후 이탈률 | MF-1 재설계 검증 |

### 플레이테스트 패널 (v0.5) — n≥16, 쿼터제
| 코호트 | 최소 인원 | 목적 |
|---|---|---|
| **무종교 20대 캐주얼 게이머** | **3** | P2' 분리 집계 — 이 그룹 기준 초과 시 전체 불합격 (MF-22) |
| 초3~4 아동 | 2 | 직인용 문어체 이해도(구두 확인 지표), fat-finger (MF-21) |
| 60세 이상 | 2 | 글자 크기·홀드 제스처·재개 유예 검증 (MF-21) |
| 10대(교회/비교회 혼합) | 3 | 설교감·유머 수용 |
| 비게이머 성인 | 3 | 온보딩·관습 발견 가능성 |
| 목회자 | 2~3 | **참고 관찰만 — 적합성 판정 권한은 ⑩ 감수 게이트에만 있음**(P3 역할 분리) |

### 합격 기준
- P1 8장 완주율 ≥90%, 대화 파트 이탈 0.
- **P2' "설교처럼 느껴졌나" ≤2.0 — 집단별 분리 집계, 무종교 게이머 그룹 단독으로도 ≤2.0.**
- P3(참고 지표로 강등) 예수님 장면 "존중 없음" 응답 — 판정은 ⑩ 권한.
- P4 인터스티셜·rescue "흐름 끊김" ≤25% + **행동 로그의 rescue 후 이탈 0**.
- P5 재방문 의사 ≥60% **및 실제 허브 훅 탭률 ≥40%**(의사가 아니라 행동으로).
- **P6 텍스트 기본 속도 "느리다" ≤10%**(기존 20%에서 강화 — 첫 탭 완성이 있으므로 달성 가능).
- P7(신규) "「망설인다」/「내린다」 중 한쪽이 유리하다고 느꼈다" ≤10%.
- P8(신규, 공통 지침 5) 재미 지표: "친구에게 추천하겠다" ≥60%, "다음 조각을 모으고 싶다" ≥70%.

---

## ⑩ 신학 체크포인트 — 상설 감수 게이트 (전면 개정)

### 감수 거버넌스 (MF-3)
- **감수 주체**: 예장통합측 목회자 **2인 이상**(상호 독립). 시각물(예수님 초상·연출 영상)은 동일 2인 + 필요 시 교육 전문가 1인 자문.
- **감수 원장**: `content-review/review-ledger.json` — 파일(또는 텍스트 묶음)별 `{ path, sha256, grade, approvedBy: [2인], date, notes }`. **원문이 한 글자라도 바뀌면 해시 불일치 → 승인 자동 해제 → E07로 프로덕션 빌드 실패.** dev 빌드만 `--allow-unreviewed`.
- **절차**: 제출 → 감수(코멘트) → 반려 시 수정 → **변경 diff만 재감수** → 2인 승인 서명 → 원장 기록. 반려 사유는 원장 notes에 남긴다.
- **감수 범위 = 노출되는 전 텍스트**: 본편 대사, 허브 드립피드, **폴백 잡담, 카드·토스트·버튼 문구, RewardScreen 훅 문구** 전부 원장 추적 대상(신학 medium — 실족은 채우기 텍스트에서 일어난다).

### 등급 이원화 (MF-9 — 드립피드 케이던스가 감수 병목에 잠기지 않게)
| 등급 | 대상 | 절차 | SLA |
|---|---|---|---|
| **A** | 예수님 발화 전 라인(직인용·창작), 성구 인용, 수난·부활(12장) 전체, 내레이터 | **사전 전수 감수, 2인 승인 필수, 미승인 시 배포 불가** | 5영업일/배치 |
| **B** | 동료 잡담·폴백·카드/토스트/UI 문구 | 작가 셀프체크리스트(ink-style.md 부록) → **격주 배치 감수** 승인 후 배포. 분기별 전수 샘플링 감사 | 격주 배치 |

### 체크 항목
| # | 항목 | 상태 |
|---|---|---|
| C1 | **예수님 대사**: 복음서 발화는 개역개정 직인용 + `# verse:` + **E04 자동 본문 대조**. 창작 대사는 `# authored` 필수, 짧게·행동·긍휼 중심, "본문이 침묵하는 곳에서 교리를 만들지 않는다". **직인용/창작은 시각 위계로도 분리(⑦)** — 창작이 말씀의 권위를 참칭하지 않게. 어려운 단어는 각주 옆 한 줄 풀이 제공(아동 이해도 — 직인용 원칙은 유지) | A등급 전수 |
| C2 | **예수님 시각 묘사**: 실묘사 + 빛 연출, 희화화·과도한 미형화 금지. 초상 시안 + 등장·**구조(붙잡히심) 비트** 영상 단위 감수 | A등급 |
| C3 | **주권 원칙**: 이적의 성패는 플레이어 실력에 있지 않다. **침몰 = 실패가 아니라 붙잡히심**(⑤-6)으로 기계 구조 자체가 이 원칙을 구현. 선택지는 기계적 등가(②-4) | 설계 반영, 감수 확인 |
| C4 | **경외 정지**: 예수님 발화·성구는 첫 열람 시 탭 요구(⑤-4 — 조건 통일: `tier==='jesus' || verseRef`). 재열람은 해제 — 경외를 짜증으로 바꾸지 않는다 | 설계 반영 |
| C5 | 유다·바리새인: 만화적 악당화 금지, 반유대주의 리스크 문구 점검 | A등급(해당 라인) |
| C6 | 공로 구원 오독 차단: 카드/보상 문구 "은혜로 받은 만남" 프레이밍 — **선언이 아니라 B등급 문구 감수로 담보**. 짝풀이 패턴 배제를 ink-style.md에 명문화 | B등급 + 가이드 |
| C7 | 12장 수난·부활: **이원화** — 수난은 quiet·절제("함께함"), 부활은 기쁨의 해방(승리를 침묵시키지 않음). 인터스티셜·선택지 최소화 | 차기, A등급 |
| **C8** | **내레이터 원칙(신규)**: 정황 묘사만. 해석·적용·평가 금지 — 내레이터의 해석은 곧 설교(P2 악화)이자 교리 주입의 뒷문. ink-style.md 명문화 + A등급 감수 | 가이드 + A등급 |
| **C9** | **저작권(신규)**: 대한성서공회 개역개정 사용 계약 체결 전 프로덕션 배포 금지. 계약 상태를 원장에 기록 | M-1 착수 |

---

## ⑪ 리스크와 완화책

| 리스크 | 영향 | 완화 |
|---|---|---|
| **개역개정 저작권 미확보** (MF-4) | C1 원칙 무산, 교단적 신뢰 손상 | M-1에서 신청 선행, v0.5 전 체결을 하드 조건으로. **불허/지연 시 3안**: ① 새번역 사용 계약으로 전환(E04 DB 교체만으로 대응 가능) ② 공동번역 등 타 역본 협의 ③ 최후: 직인용 최소화 + 사역(私譯) 표현으로 전환하고 각주를 "본문 참조" 표기로 변경(감수 재승인 필요) |
| ink 컴파일러 체인 불안정(Windows 한글 경로) | 빌드 실패 | inkjs JS 컴파일러(full)를 **빌드 스크립트 전용**으로 사용, 산출물 `src/story/` 커밋으로 CI 재현성 확보. 클라이언트는 런타임 엔트리만(번들 수백 KB 절감) |
| ink/Zustand 이중 진실원 | 세이브 꼬임, 중복 보상 | 영속 진실은 스토어 단일화, 멱등 원장은 ink 경로 기반 안정 키(T5), 회상 모드 정책(T5a), 복원 실패 시 entryKnot 폴백(T4) |
| **저가 안드로이드 성능** (엔지니어링 medium — 신규 행) | 대화 중 프레임 드랍 | backdrop-filter는 `@supports`+저사양 감지 시 불투명 `--panel` 폴백. 타자 효과 글자당 setState 금지 — rAF 배칭+CSS clip. JesusPresence 합성 레이어(transform/opacity만) 검증. localStorage 동기 쓰기를 대화 경로에서 제거(idb). **M2 완료 기준에 실기기 60fps** |
| 대사 VN화 | 장르 정체성 훼손 | W02(노드 3문장·세션 90초 자동 계측), 행동 로그 탭스루 지도, P6 ≤10% |
| **대본이 재미없음** (비신자 high — 신규 행) | 파이프라인 전체 무의미 | M-1 대본 선행 + 무종교 독자 리딩 테스트를 M0 착수 조건으로. 유머 허용 범위(제자 티격태격 — ⑥-6 예시 참조)를 ink-style.md에 명문화. 이중 감수로 밍밍해지는 압력은 등급 이원화(B등급 셀프체크)로 완화 |
| 감수 병목·일정 볼모화 | 릴리즈 리드타임 폭증 | 등급 이원화 + SLA(A: 5영업일, B: 격주 배치), M1 시점 조기 회람, diff 재감수(전량 재검 금지) |
| 예수님 실묘사·창작 대사 신학 리스크 | 감수 반려, 신뢰 손상 | E03/E04/E08 기계 게이트 + 해시 원장(수정 시 자동 해제) + 프로덕션 빌드 실패(E07). 경고가 아니라 **빌드 실패** — 1인 개발에서 경고는 반드시 무시되므로 |
| 인터스티셜·rescue의 flow 파괴 | 재미 저하 | rescue는 실패 순간을 서사 보상으로 전환(원망의 대상 제거), 재개 유예 3초, 에피소드당 1~2회 상한, P4+행동 로그 검증 |
| 드립피드 고갈 | 관계 루프 공허 | 콘텐츠 예산표 46노드(⑥-4) + 클리어당 +2노드 공급 규칙 + dot은 신규 있을 때만 + RewardScreen 풀 트리거 |
| 세이브 마이그레이션 실패 | 진행 손실 | persist 내장 version/migrate(키 유지), 실패 시 원본 보존 + 신규 시작 제안, T6 필수 |
| 표정 레이어·초상 지연 | UI 공백 | tone 색 실루엣+이니셜 폴백을 1급 상태로(3중 신호 중 색·이름은 항상 존재) |
| 테스트 인프라 부재 상태의 계획 낙관 | M0부터 좌초 | **M0 1일차 git init+vitest**(MF-11), RTL 자동화는 4건으로 압축하고 나머지 수동 체크리스트(1인 개발 현실화) |
