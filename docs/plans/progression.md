# 여정 맵 · 진행 시스템 상세 플랜 — *동행 (The Gospel Road)*

> 범위: **12장 여정 맵 · 에피소드 해금 · 장 내 단계 상태기계 · 등불(별)/성취 · 재플레이**
> 버전 0.2 (1차 검증 피드백 전면 반영) · 2026-07-20 · 상위 문서: [`../GDD.md`](../GDD.md), [`../ENGAGEMENT.md`](../ENGAGEMENT.md)
> 기준 코드: 수직 슬라이스 v0.1 (`src/state/store.ts`, `src/content/*`, `src/screens/*`)

---

## v2 변경 로그 — 필수 수정 대응표

1차 검증(신학·게임D·엔지니어링·UX·비신자 게이머)의 **모든 mustFix**와 공통 지침의 해소 위치.

| # | 출처 | 필수 수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| F1 | 신학 | T4 범위를 insight **판정 조건 자체**로 확대, ep08 "흔들림 없음=통찰" 재설계 | ②시나리오C, ⑥6.2, ⑩T4 | ep08 통찰 조건을 "흔들려 가라앉기 시작해도 시선을 다시 빛으로 **돌이킴**"으로 교체. 위기 해소는 조작 불능 '붙잡히심' 연출 비트(공통지침 2). `insightSpec`(성경 근거 1줄) 필드 의무화 + 감수 큐 자동 등재 |
| F2 | 신학·공통1 | 신학 레드라인의 스키마 기계화 (예수 id·무채점 장·verseRef) | ③3.4, ⑨U14~U16 | Zod refine 3종 실코드 스케치 + `validate-content.ts` CI 하드 에러. 문서 선언 아님 |
| F3 | 신학 | ep12 stage 골격을 데이터로 스케치해 T1 감수 패키지에 동봉 | ⑤5.4 | `witness` stage kind(실패 개념 없음) 도입, ep12 전체 stages 데이터 스케치 + 재플레이·드립피드·공유통계 규정 명문화. M1 완료 기준 승격 |
| F4 | 신학·공통3 | EpisodeSchema·대사 단위 reviewStatus 실재화 + 미승인 콘텐츠 빌드 차단 | ③3.5, ⑧M0 | `ReviewStatusSchema`(승인 해시 바인딩 — 수정 시 자동 pending 강등) + prebuild 검증 스크립트로 프로덕션 빌드 실패 |
| F5 | 신학 | 'all-twelve' 성취를 감수 통과 전 데이터에서 제외 | ③3.6 | 초안에서 삭제(주석 처리). 대안 '열한 명과 남은 자리'를 T5 감수 안건으로만 등재 |
| F6 | 게임D·비신자 | 시간 예산 수치화, '3분 아하' 산술 정합 | ②시나리오A, ⑤5.5 | 구간별 시간 예산 표 + D0 첫 클리어 170초 산술 증명 + `timeBudgetSec` 스키마 필드 |
| F7 | 게임D·비신자 | insight 계약 강화 + M2 게이트 = ep08 등불 3종 전부 실동작 | ⑥6.2, ⑧M2 | 판정 조건 4대 최소 기준(사전 서술 가능·노미스/스코어 단독 금지·주제 연결 행동·첫 클리어 달성률 20~40%)을 계약 조항으로 명기. story는 ep08 인라인 조각 선행 구현 |
| F8 | 게임D·비신자 | 재플레이 콘텐츠 경제 재산정 / Hades 허위 광고 해소 | ⑤5.6 | Hades 인용 문서에서 삭제. 장당 재방문 대사 DoD 2→5개(playCount 2·3·5 구간 + 동료 조건 2), 총 공급량 55개를 M3 게이트 수치로. D8–30 목표를 '등불·비네트 완집 루프'로 정직화 |
| F9 | 게임D·UX·비신자 | ⑦(맵 등불 n/33 상시) vs ⑪(컬렉션 한정) 문서 내 모순 | ⑦ | **결정**: 맵에는 장 진행(n/12)만, 등불 합계는 컬렉션 전용. 검토 아님, 확정 |
| F10 | 게임D | 전장 클리어 후 상태 미정의 | ⑥6.1 | `selectNextEpisode` 4단계 폴백(진행 중→열림→등불 미완 되걷기 추천→스크랩북 완성 뷰+13장 티저) + 데일리 완주 후 모드 |
| F11 | 엔지 | playable 미편입으로 M2에 ep08 도달 불가 | ⑤5.1, ⑨U13 | `selectEpisodeStatus`에 playable 편입 + 전환기 규칙(미구현 장은 해금 판정에서 자동 통과) + U13 테스트 |
| F12 | 엔지·공통8 | 마이그레이션 실체 오인(version 0, 키 유지, IDB) | ③3.3 | 키 `donghaeng-save-v1` 유지, `version: 2` + `migrate(persisted, version)` version 0 분기. IDB 전환은 v1 별도 마일스톤으로 분리. 실세이브 페이로드 스냅샷 픽스처 |
| F13 | 엔지 | playCount 증가 시점 모순(규칙2 vs 규칙3) | ⑤5.2, ⑨U7 | **enterEpisode 한 곳으로 단일화**. completeEpisode는 건드리지 않음. U7 기대값 재작성 |
| F14 | 엔지 | ep04(다중 미니게임 허브)가 선형 stages 파괴 | ③3.1, ⑧M4 | `hub` stage kind(슬롯·필요 완료 수) 스키마 추가 + M4 대상을 **ep06**으로 교체, ep04는 hub kind 검증 후 M5+. M1 스케치 대상에 ep04 포함 |
| F15 | 엔지 | 보상 화면 데이터 소스 부재·run 소멸 시점 미정 | ⑤5.3 | `lastReward` 비영속 슬라이스 계약(epId·newLamps diff·isReplay·newAchievements·unlockedVignettes). run은 completeEpisode 시점 소멸. 보상 중 새로고침 → 맵 폴백 |
| F16 | 엔지 | selectNextEpisode가 in-progress를 못 가리킴 | ⑥6.1 | in-progress 우선으로 계약 수정 + U4 케이스 추가 |
| F17 | UX | 미획득 등불 1.46:1·잠긴 노드 12% — WCAG 1.4.11 위반 | ⑦7.2 | 미획득 등불 = `--lamp` 100% 불투명 2px 스트로크(채움만 비움, 10.1:1). 잠긴 노드 = 신규 토큰 `--node-locked: #5A6280`(3.2:1) + 안개 아이콘 형태 단서. 대비 회귀 테스트 I9 |
| F18 | UX | 롱프레스 숨은 제스처 | ②시나리오C, ⑦7.4 | 롱프레스 폐기. **노드 탭 → 미리보기 시트**(등불 현황·남은 조각 힌트·걷기 버튼)가 기본 경로 |
| F19 | UX | 스크린리더·포커스 명세 전무 | ⑥6.5, ⑨I7·I8 | 노드 aria-label 포맷, 시트 role=dialog, 상태 공지 role=status, phase 전환 시 h1 포커스 이동을 계약으로 명세 + axe 스모크·포커스 테스트 |
| F20 | UX·비신자 | 플레이테스트 표본 미층화 | ⑨9.3 | 쿼터 명시: 아동(8~10세) 2인 + 60대 이상 2인 + **비종교인 50% 이상**. 연령별 시간 임계값 분리(성인 3분/아동·고령 5분) |
| F21 | 비신자·공통5 | 등불을 모아도 아무 일도 안 일어남 | ④4.2 | 등불별 실체 보상 표: 통찰=숨은 장면 비네트, 이야기=카드 뒷면 이야기+프레임, 3/3=장 전용 일러스트+맵 장식. 게이트 아닌 플레이 보상 |
| F22 | 비신자·게임D·공통5 | 완전 선형 해금 — 외길 금지 | ⑤5.1 | **병렬 해금을 기본 구조로**: 2막(5·6·7 병렬, 8은 2/3 클리어 시)·3막(9·10 병렬). `requires`를 all/any(count) 구조로 확장. v1 실험 아님 |
| F23 | 비신자 | 보상 화면 '마무리 성구' 자동 노출 | ⑤5.3 | 성구는 **탭하면 열리는 카드(선택 열람)**로 변경. 보상 화면 주인공은 동료 카드·비네트. 성구 각인은 컬렉션 카드 상세 |
| F24 | 공통4 | 개역개정 저작권 | ⑧M0, ⑩T3b | 대한성서공회 허가 절차를 M0(M1 이전) 선행 과제로. CI 인용문-본문 자동 대조(diff) |
| F25 | 공통7 | 테스트 인프라 선행 | ⑧M0 | git init + vitest + RTL 셋업을 M0 첫 태스크로. M1에서 통합 테스트 제외, 전체 로드맵 버퍼 25% |
| F26 | 공통10 | ep12 이원화 — 부활의 승리를 침묵시키지 말 것 | ⑤5.4 | 수난 비트(quiet·절제)와 부활 비트(기쁨의 해방)를 stages 데이터에서 분리. 피날레는 밝다 |

medium/low 반영: 등불 상징 이중 사용→⑩T4 안건(명칭 대안), story 등불 '전부'→핵심 3조각 완화+힌트 표시(⑥6.4), T3 분리(⑩), T6 조화 각주(⑩), T2 '예비시키기' 문구(⑦7.3), 1분 초과 미니게임 체크포인트(⑥6.2), 성취 사전 노출(④4.3), 로컬 계측(⑨9.4), 성능 예산(⑦7.5), 9장 서브 구조(③3.1 hub로 해결), totalCompanions 파생화·screen 비영속 확정(⑧M2), 타이포 스케일·인앱 움직임 줄이기·터치 48pt·토스트 폐지(⑦), 12장 노드 형태 부호화(⑦7.2), 능력 유용성 매트릭스(④4.4), reportMoment 마이크로 보상 계약(⑥6.3).

---

## ① 목표와 범위

### 목표
1. **12장 여정 맵**을 게임의 "홈"으로 승격 — 진행 상태(잠김/열림/진행 중/완주/준비 중)가 한눈에 보이고, 다음 한 걸음이 항상 명확하다.
2. **장 내 단계 상태기계** — 모든 에피소드가 stage 배열(대화·미니게임·허브·목격·영입)을 데이터로 선언하고, 엔진은 골격을 실행만 한다 (GDD §10 "콘텐츠 = 데이터").
3. **등불(별) 시스템** — 에피소드당 최대 3개의 비압박형 목표 + **각 등불에 신앙 전제 없는 실체 보상**(비네트·일러스트·코스메틱). 공개 순위표·수치 비교 없음.
4. **재플레이** — 완주한 장은 언제든 다시 걷기 가능. 보상은 멱등(중복 영입 없음). 재방문 대사는 장당 5개 이상의 공급량을 DoD로 보장한다(⑤5.6). *(v1의 "Hades 드립피드" 인용은 공급량 대비 과장이므로 삭제 — F8)*
5. **신학 레드라인의 기계화** — 예수님 데이터 격리·무채점 장 보호·감수 게이트를 사람 리뷰가 아니라 Zod refine + CI가 지킨다(③3.4~3.5).

### 비범위 (이 플랜에서 다루지 않음)
- 미니게임 5동사 각각의 내부 규칙 설계 (별도 플랜: minigames — 단, **insight 판정·체크포인트·마이크로 모먼트의 계약 조항은 이 문서 ⑥이 부과한다**)
- 허브(관계 심화·선물·유대 경제) 상세 (별도 플랜: hub-relationship — 유대 산수표는 그쪽 소유, 진행은 이벤트만 발행 ⑥6.3)
- ink 대사 콘텐츠 집필 자체 (호출 계약만 정의)
- 컬렉션 화면의 카드 상세 UI (데이터 공급 계약만 정의)
- 수익모델·계정/클라우드 세이브·다국어

### 설계 헌법 (ENGAGEMENT 준수)
- 해금은 **오직 플레이로만**. 재화·시간·확률 게이트 금지. (등불 보상도 플레이 산물이므로 헌법과 충돌하지 않는다 — 진행 게이트가 아니라 코스메틱·이야기 레이어다.)
- 실패는 무손실 — "다시" 원탭. **1분 초과 미니게임은 구간 체크포인트 의무**(⑥6.2)로 "내 5분이 날아갔다" 체감까지 차단한다.
- 등불 미획득은 **초대**로 표현. 결핍·수치 표현 금지.
- 12장(수난·부활)은 점수·등불·성취 대상에서 제외 — 단 "무채점 선언"이 아니라 **데이터 스케치와 규정**(⑤5.4)으로 실체화한다.

---

## ② 플레이어 경험 시나리오

### 시나리오 A — 첫 세션 (D0, 3분 아하 — 산술 증명 포함)
1. 타이틀 → "여정 시작" → 맵 (15초). 1장 노드만 앰버 등불로 빛나고, 나머지는 `--node-locked` 실루엣 + 안개 아이콘.
2. 1장 탭 → 미리보기 시트 → "걷기 시작" → 인트로 대화(**ep01 특칙: ≤30초**, 요셉의 안내) → 별 항법 미니게임(튜토리얼 포함 ≤90초) → 아웃트로(≤20초) → **마리아·요셉 영입 카드** 연출(≤15초) → 맵 복귀.
3. 합계 **≈170초 ≤ 3분**. 맵에서 2장 노드 등불 점등 + 발자국 길 한 칸 연장 → "다음이 궁금하다".

### 시나리오 B — 복귀 세션 (D1–7)
1. 앱 재진입 → 3초 내 맵의 "이어 걷기" 카드(마지막 위치·다음 목표 한 줄) → 원탭 진입. 카드가 가리키는 대상은 **in-progress 우선**(F16).
2. 5장 미니게임 도중 전화가 와서 이탈 → 재진입 시 맵으로 복귀, 5장은 "진행 중" 배지. 인트로는 스킵 가능(리캡 한 줄). 1분 초과 미니게임이었다면 **체크포인트에서 재개**(⑥6.2).

### 시나리오 C — 재플레이와 등불 줍기 (D8–30)
1. 8장 완주했지만 등불 2/3. 맵에서 8장 노드를 **탭** → 미리보기 시트에 "통찰의 등불이 남아 있어요 — 가라앉아도 다시 빛을 바라보면 됩니다" + 놓친 이야기 조각 힌트("베드로에게 그물에 대해 물어보지 않았어요"). *(롱프레스 폐기 — F18)*
2. "다시 걷기" → 인트로 스킵 → 미니게임: 흔들려 가라앉기 시작했지만 **시선을 다시 빛으로 돌이켜** '붙잡히심' 비트에 도달 → 통찰 달성. *(v1의 "흔들림 없이 건너 통찰"은 마 14:28–31 왜곡이므로 폐기 — F1. 위기의 해소는 플레이어 조작이 아니라 예수님의 행동이다.)*
3. 보상: 통찰의 등불 점등 + **8장 숨은 장면 비네트**("그날 밤, 배 위에서" — 베드로의 회고 45초 컷) 해금 + 베드로 재방문 대사 1개 열림. 컬렉션 카드에 등불 각인.
4. 보상 화면은 "다시 걸은 길" 톤 — 중복 영입 연출 없음.

### 시나리오 D — 12장 (수난·부활, 이원화)
1. 11장 완주로 12장 해금. 노드는 새벽 코랄 톤 + **여명 지평선 프레임**(색+형태 이중 부호화 — 색각이상 대응).
2. 진입 시 "이 장에는 등불이 없습니다. 다만 곁에 있어 주세요."
3. **수난 비트(quiet)**: 함께 걷기·등불 들기 등 실패 개념 없는 `witness` 인터랙션 — 손은 계속 움직이되 이기는 게임이 아니다.
4. **부활 비트(기쁨)**: 빈 무덤 '실패 없는 발견' → 엠마오 대화 선택 → 밝은 피날레. 부활의 승리를 침묵시키지 않는다(F26).
5. 완주 표시는 새벽빛 아이콘. 완주율 통계 포함, 점수·기록·성취 없음.

---

## ③ 데이터 모델 (TypeScript 타입 스케치)

기존 `src/content/schema.ts`를 확장한다. 하위 호환: 기존 필드 유지, 신규 필드 추가.

### 3.1 Stage — `hub`·`witness` 추가 (F3, F14)

```ts
// ─── content/schema.ts 확장 ───────────────────────────────

export const VerbSchema = z.enum(['퍼즐', '물류', '리듬', '균형', '추리'])

/** hub 슬롯 내부에는 hub를 중첩할 수 없다 (재귀 금지 — 엔진 단순성) */
const BaseStageSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('dialogue'),
    knot: z.string(),                    // ink knot. MVP는 인라인 스크립트 id 폴백
    skippable: z.boolean().default(true),
    review: ReviewStatusSchema,          // 3.5 — 대사 단위 감수 상태
  }),
  z.object({
    kind: z.literal('minigame'),
    game: z.string(),                    // 미니게임 레지스트리 키
  }),
  z.object({
    kind: z.literal('recruit'),
    companions: z.array(z.string()),     // Episode.companions의 부분집합 (refine)
  }),
  z.object({
    /** 실패·재시도 개념이 없는 인터랙티브 목격 단계 — 12장 전용 아님(3장 연출에도 사용 가능) */
    kind: z.literal('witness'),
    knot: z.string(),
    interaction: z.enum(['walk-along', 'carry-lamp', 'discover', 'converse']),
    review: ReviewStatusSchema,
  }),
])

export const StageSchema = z.union([
  BaseStageSchema,
  z.object({
    /** 다중 미니게임 허브 (ep04 제자 부름, ep09 비유 3편) — 순서 자유 선택 */
    kind: z.literal('hub'),
    slots: z.array(z.object({
      id: z.string(),
      title: z.string(),                 // "베드로와 안드레의 그물"
      stages: z.array(BaseStageSchema),  // 슬롯 = 미니 선형 시퀀스
    })),
    /** 다음 단계로 가기 위한 최소 완료 슬롯 수 (전부일 필요 없음) */
    required: z.number().int().min(1),
  }),
])
export type Stage = z.infer<typeof StageSchema>
```

**9장 서브 에피소드 문제 해소(엔지 low)**: ep09 비유 3편은 별도 에피소드로 쪼개지 않고 `hub` 단계의 슬롯 3개로 표현 — id·no 체계·12노드 맵 레이아웃이 흔들리지 않는다. v1의 "requires 배열만으로 무코드 지원" 문구는 부정확하므로 삭제.

### 3.2 해금 조건 — all/any 구조 (F22)

```ts
export const RequiresSchema = z.object({
  /** 전부 클리어 필요 */
  all: z.array(z.string()).default([]),
  /** of 중 count개 클리어 필요 (병렬 해금) */
  any: z.object({ of: z.array(z.string()), count: z.number().int().min(1) }).optional(),
})

export const LampGoalsSchema = z.object({
  clear: z.string(),                     // ① 걸음의 등불: 완주
  insight: z.string(),                   // ② 통찰의 등불: 주제 연결 행동 (판정은 미니게임, 조건 명세는 감수 대상)
  /** 통찰 판정 조건의 성경 본문 근거 1줄 — 감수 큐 자동 등재 (F1) */
  insightSpec: z.object({ ref: VerseRefSchema, rationale: z.string(), review: ReviewStatusSchema }),
  story: z.string(),                     // ③ 이야기의 등불: 핵심 조각 수집
  /** '전부 보기'가 아니라 지정된 핵심 조각만 — 완전주의 완화 (신학 medium) */
  storyBeats: z.array(z.string()).min(1).max(4),
}).nullable()

export const EpisodeSchema = z.object({
  id: z.string(),
  no: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  verb: VerbSchema,
  verseRef: VerseRefSchema,              // 3.4 — 4복음서 책명 강제
  companions: z.array(z.string()),
  playable: z.boolean(),
  requires: RequiresSchema.default({ all: [] }),
  stages: z.array(StageSchema),
  lamps: LampGoalsSchema,                // null = 무채점 장 (ep12)
  nodeTone: z.enum(['amber', 'coral']).default('amber'),
  /** 마무리 성구 — 자동 노출 아님, 탭 열람 카드 (F23) */
  closing: z.object({ ref: VerseRefSchema, text: z.string(), review: ReviewStatusSchema }),
  /** 구간별 시간 예산(초) — 콘텐츠 DoD이자 빌드 검증 대상 (F6) */
  timeBudgetSec: z.object({ intro: z.number().max(60), outro: z.number().max(45), total: z.number().max(480) }),
})
```

### 3.3 세이브 마이그레이션 — 실체 정합 (F12)

현행 실체: `store.ts`의 persist는 `name: 'donghaeng-save-v1'`, **version 옵션 없음 → 저장된 version은 0**. 따라서:

- **스토리지 키는 `donghaeng-save-v1` 유지** (키를 바꾸면 zustand migrate가 아예 실행되지 않아 구 세이브를 읽지 못한다).
- `version: 2` + `migrate(persistedState, version)`에서 **`version === 0` 분기**로 처리. "v1→v2"라는 표현은 폐기하고 코드·테스트 모두 `0→2`로 표기.
- localStorage → IndexedDB(idb-keyval) 전환은 **이 마이그레이션과 절대 동시에 하지 않는다**(리스크 곱연산). v1 로드맵의 별도 마일스톤으로 분리하고, 비동기 하이드레이션(첫 프레임 깜빡임)은 그 마일스톤에서 스플래시 지연으로 해결.
- `state/migrations.ts`는 순수 함수. 테스트 픽스처에 **version 0 실세이브 페이로드 스냅샷**(현행 partialize 산출물 그대로)을 포함(U19).

```ts
// state/migrations.ts (순수 함수)
export function migrateV0toV2(persisted: SaveV0): SaveV2 {
  return {
    progress: Object.fromEntries(
      (persisted.completed ?? []).map((id) => [id, {
        cleared: true, lamps: { clear: true }, introSeen: true,
        playCount: 1, storyBeatsSeen: [],
      }]),
    ),
    companions: persisted.companions ?? [],
    achievements: [],
    gentleMode: persisted.gentleMode ?? false,
    reduceMotion: 'system',   // ⑦7.6 인앱 토글, 기본 OS 상속
  }
}
```

실패 시 원본 페이로드를 `donghaeng-save-v1.backup` 키로 보존 후 새 세이브 생성(파괴적 덮어쓰기 금지). `screen`은 **비영속 확정** — 현행 store.ts의 "이어하기 UX를 위해 포함" 주석은 partialize 실제 동작과 다르므로 주석을 수정하고, 재진입 라우팅은 "타이틀 → 이어 걷기 카드"로 통일(엔지 low).

### 3.4 신학 레드라인 refine 3종 — 기계적 차단 (F2, 공통1)

```ts
// content/schema.ts — 상수와 refine
export const JESUS_ID = 'jesus' as const
const GOSPEL_BOOKS = ['마태복음', '마가복음', '누가복음', '요한복음'] as const

/** ③ verseRef는 4정경 복음서 책명으로 시작해야 한다 */
export const VerseRefSchema = z.string().refine(
  (v) => GOSPEL_BOOKS.some((b) => v.startsWith(b)),
  { message: 'verseRef는 마태·마가·누가·요한 책명으로 시작해야 합니다' },
)

/** ① 예수님은 수집·영입·조작 대상이 될 수 없다 — 오타 하나로도 불가능하게 */
export const EpisodeListSchema = z.array(EpisodeSchema).superRefine((eps, ctx) => {
  for (const ep of eps) {
    if (ep.companions.includes(JESUS_ID))
      ctx.addIssue({ code: 'custom', message: `${ep.id}: 예수님 id는 companions에 올 수 없습니다` })
    for (const st of allStages(ep))
      if (st.kind === 'recruit' && st.companions.includes(JESUS_ID))
        ctx.addIssue({ code: 'custom', message: `${ep.id}: recruit 단계에 예수님 id 금지` })
    // recruit.companions ⊆ Episode.companions, requires id 실존도 여기서 함께 검증
  }
})

/** ② 무채점 장(lamps: null)은 어떤 성취 cond에서도 참조 금지 — '수난 완주 성취' 원천 차단 */
export function refineAchievements(achievements: Achievement[], episodes: Episode[]) {
  const scoreless = new Set(episodes.filter((e) => e.lamps === null).map((e) => e.id))
  for (const a of achievements) {
    const refs =
      a.cond.type === 'episodes-cleared' ? a.cond.ids :
      a.cond.type === 'replay-count' ? [a.cond.epId] : []
    if (refs.some((id) => scoreless.has(id)))
      throw new ContentError(`성취 ${a.id}: 무채점 장(${[...scoreless]})을 참조할 수 없습니다`)
  }
}
```

세 refine 모두 **U14~U16 단위 테스트 + CI(`scripts/validate-content.ts`, prebuild 훅)의 하드 에러**다. 통과 없이는 로컬 빌드도 실패한다.

### 3.5 감수 상태 — 콘텐츠 해시 바인딩 (F4, 공통3)

```ts
export const ReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved']),
  /** 승인 당시 콘텐츠의 sha-256 — 내용이 1자라도 바뀌면 해시 불일치 = 자동 pending 강등 */
  reviewedHash: z.string().optional(),
  /** 통합측 목회자 2인 이상 (공통지침 3) */
  reviewers: z.array(z.string()).min(2).optional(),
})
```

- 부착 위치: `dialogue`/`witness` stage, `closing`, `lamps.insightSpec`, `Achievement`, (허브 플랜의 대사 풀도 동일 스키마 사용).
- `scripts/validate-content.ts`가 프로덕션 빌드(`--prod`)에서 노출 대상 콘텐츠 중 `status !== 'approved' || hash 불일치`를 발견하면 **빌드 실패**. 개발 빌드는 경고 + 화면에 "감수 전" 워터마크.
- 반려 → 수정 → 재검 절차: 반려 사유를 `reviewNotes`(별도 감수 대장 JSON)에 기록, 수정 시 해시가 바뀌므로 자동 재검 큐 등재. 막판 일괄 감수 금지 — M 단계마다 증분 전달.
- 개역개정 인용문은 컴파일 단계에서 **허가받은 본문과 자동 대조(diff)** — 불일치 시 빌드 실패(공통4).

### 3.6 성취 데이터 (F5 반영)

```ts
export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string(),
  cond: z.discriminatedUnion('type', [
    z.object({ type: z.literal('episodes-cleared'), ids: z.array(z.string()) }),
    z.object({ type: z.literal('companions-count'), min: z.number() }),
    z.object({ type: z.literal('lamps-count'), min: z.number() }),
    z.object({ type: z.literal('replay-count'), epId: z.string(), min: z.number() }),
  ]),
  review: ReviewStatusSchema,
})
```

성취 초안: `first-companion`(첫 동행), `galilee-morning`(1–4장), `lamp-keeper`(등불 15개), `walk-again`(재플레이 3회).
- **`all-twelve`(제자 12인 세트)는 초안에서 제외** — 유다를 "수집 완료 도파민"으로 소비하는 설계는 T5 감수 결론 전에는 데이터에 두지 않는다. 대안 구성 **'열한 명과 남은 자리'**(유다를 세트 판정에서 분리, 빈 자리를 애도로 표현)를 감수 안건으로만 등재(⑩T5).
- 12장 관련 성취는 스키마 차원에서 생성 불가(3.4 refine ②).

### 3.7 상태 모델 (v0.1 대비 변경 요약)

```ts
export type EpisodeStatus = 'locked' | 'available' | 'in-progress' | 'cleared' | 'coming-soon'
// 'coming-soon' 신설: playable === false — F11

export interface EpisodeProgress {
  cleared: boolean
  lamps: { clear?: boolean; insight?: boolean; story?: boolean }
  introSeen: boolean
  playCount: number            // enterEpisode에서만 +1 (F13)
  clearedAt?: string
  storyBeatsSeen: string[]
  /** hub 단계의 완료 슬롯 — 중도 이탈 시에도 영속 (부분 진행 보존) */
  hubSlotsDone: Record<string, string[]>   // stage 인덱스 키 → 완료 슬롯 id
}

export interface EpisodeRun {              // 비영속
  epId: string
  stageIndex: number
  phase: 'dialogue' | 'minigame' | 'hub' | 'witness' | 'recruit' | 'closing'
  result: MinigameResult | null
  isReplay: boolean
}

/** 보상 화면의 유일한 데이터 소스 — F15 */
export interface LastReward {              // 비영속
  epId: string
  newLamps: ('clear' | 'insight' | 'story')[]   // 이번 런에 "새로" 켜진 것만 (diff)
  isReplay: boolean
  newAchievements: string[]
  unlockedVignettes: string[]              // ④4.2 등불 보상
  recruited: string[]
}

interface GameStateV2 {
  screen: Screen
  run: EpisodeRun | null                   // 비영속
  lastReward: LastReward | null            // 비영속 — 새로고침 시 null → 맵 폴백
  progress: Record<string, EpisodeProgress>
  companions: string[]
  achievements: string[]
  vignettesUnlocked: string[]              // 영속 — 등불 보상 열람권
  gentleMode: boolean
  reduceMotion: 'system' | 'on' | 'off'    // ⑦7.6
}
```

---

## ④ 모듈/컴포넌트 구조 + 보상 실체

### 4.1 파일 구조 (기존 src와 정합)

```
src/
  content/
    schema.ts            # [확장] Stage(hub·witness)·Requires·LampGoals·ReviewStatus·refine 3종
    episodes.ts          # [확장] stages/requires/lamps/timeBudget 데이터
    companions.ts        # [유지] + ability 필드 (4.4 매트릭스의 소스)
    achievements.ts      # [신규] all-twelve 제외 초안
    vignettes.ts         # [신규] 등불 보상 비네트 메타 (텍스트는 ink)
  state/
    store.ts             # [확장] persist version: 2 (키 유지), progress·run·lastReward
    migrations.ts        # [신규] migrateV0toV2 순수 함수
    selectors.ts         # [신규] 파생 상태 전담
  progression/
    machine.ts           # [신규] 상태기계 (hub 슬롯·witness 포함, React 무의존)
    achievements.ts      # [신규] cond 해석기
    moments.ts           # [신규] reportMoment 큐·소진 정책 (⑥6.3)
  scripts/
    validate-content.ts  # [신규] CI 게이트: refine 3종 + 감수 해시 + 성구 diff + 시간예산
  screens/
    JourneyMap.tsx       # [개편] 길(path) 맵 + 노드 미리보기 시트 (totalCompanions 파생화)
    EpisodeRunner.tsx    # [신규] run.phase 렌더 (hub 선택 UI 포함)
    DialogueStage.tsx    # [신규] ink 폴백 재생 + 스킵/리캡
    RewardScreen.tsx     # [개조] lastReward만 읽음. 성구는 탭 열람 카드
    CollectionScreen.tsx # [확장] 등불 각인·조각 힌트·성취 탭·비네트 갤러리
    minigames/
      registry.ts        # [신규] Record<minigameId, Component> + episodeId 역조인(1:N)
      WaterWalkGame.tsx  # [개조] onResult 계약 + '붙잡히심' 연출 비트
```

**원칙**: `progression/`은 React 무의존 순수 모듈. 화면은 셀렉터만 구독. `RewardScreen`의 `EPISODE_CLOSING` 인라인 상수는 `episodes.ts`의 `closing`으로 이관. `App.tsx`의 `screen === 'game' && <WaterWalkGame />` 하드와이어링은 `<EpisodeRunner />`로 교체.

### 4.2 등불 보상 실체 — "모을 이유" (F21, 공통5)

등불은 진행 게이트가 아니다. 그러나 **아무 일도 안 일어나는 수집은 목표가 아니다.** 각 등불은 신앙 전제 없이 재밌는 실체 보상을 연다.

| 등불 | 획득 조건 | 즉시 보상 (전부 플레이로만 해금) |
|---|---|---|
| 걸음(clear) | 에피소드 완주 | 동료 카드/이야기 조각 + 맵 노드 점등 + 발자국 길 연장 |
| 통찰(insight) | 주제 연결 행동(⑥6.2 기준) | 그 장의 **숨은 장면 비네트**(30~60초 회상 컷 — 예: ep08 "그날 밤, 배 위에서") |
| 이야기(story) | 핵심 조각 3개 수집 | 동료 **카드 뒷면 이야기** + 카드 프레임 코스메틱 |
| 3/3 완성 | 위 셋 전부 | **장 전용 일러스트 1장** + 맵 노드 장식(등불 셋 점등 연출) + 스크랩북 스탬프 |

- 비네트·뒷면 이야기는 컬렉션에서 상시 재열람 — "모은 것이 쌓이는" 감각.
- 묵상문·성구는 모든 보상에서 **선택 열람**(탭 카드). 자동 노출 금지(F23).
- 콘텐츠 산수: 채점 장 11개 × (비네트 1 + 뒷면 이야기 1 + 일러스트 1) = **33개 보상 실체**. 제작량은 v1 DoD에 포함(⑧).

### 4.3 성취 노출 (게임D low)

- 컬렉션에 **성취 탭** 신설: 미획득 성취를 초대 톤으로 사전 노출("이런 걸음도 있어요") — 사후 통보 전용이던 v1 설계 폐기.
- 획득 시점 알림은 기존대로 보상 화면 하단에 조용히(팝업 남발 금지).

### 4.4 동료 능력 유용성 매트릭스 (공통5 — "영입 후 최소 2개 장에서 유효")

능력의 상세 수치는 companions/minigames 플랜 소유. 진행 시스템은 **"어느 장에서 어느 능력이 실제로 작동하는가"의 배선표**를 소유하고, 규칙 위반(1개 장에서만 유효한 능력)을 콘텐츠 검증에서 잡는다.

| 장 | 동사 | 유효 능력 (예시 배선) |
|---|---|---|
| 1 | 추리 | 요셉·길잡이(경로 힌트) |
| 2 | 리듬 | 세례 요한·광야의 목청(판정창 확대) |
| 3 | 추리 | 도마·검증(오답 1회 소거) |
| 4 | 허브 | 안드레·잇는 손(도우미 슬롯), 마태·장부(자원 표시), 빌립·견적(시작 자원 +10%) |
| 5 | 퍼즐 | 마태·장부, 요한·기억하는 눈(story 조각 위치 힌트) |
| 6 | 퍼즐 | 베드로·뱃사람의 감(폭풍 비트 판정창 +15%), 빌립·견적 |
| 7 | 물류 | 마태·장부, 안드레·잇는 손, 빌립·견적 |
| 8 | 균형 | 베드로·뱃사람의 감, 마리아·품는 마음(실패 시 격려 + 재시도 가속) |
| 9 | 허브 | 도마·검증, 요셉·길잡이(잃은 양 수색), 요한·기억하는 눈 |
| 10 | 리듬 | 세례 요한·광야의 목청, 베드로·뱃사람의 감, 안드레·잇는 손 |
| 11 | 추리 | 도마·검증, 요한·기억하는 눈, 마리아·품는 마음 |
| 12 | — | 능력 미적용 (무채점 장 — 능력·보너스 개입 없음) |

- 모든 능력이 **최소 2개 장**에서 유효(위 표에서 검증 가능). `validate-content.ts`가 능력↔장 배선 데이터로 자동 검사.
- 보유/미보유 효과 검증: 로컬 계측(⑨9.4)으로 첫 시도 클리어율 차 **+10~20%p** 목표 A/B 확인. 능력이 체감 안 되면 수치 상향.

---

## ⑤ 핵심 플로우 (상태 전이)

### 5.1 에피소드 상태 — playable 편입 + 병렬 해금 (F11, F22)

```
selectEpisodeStatus(id):
  if (!ep.playable)                    → 'coming-soon'   // 탭 시 "준비 중인 길" 시트
  if (!satisfied(ep.requires))         → 'locked'
  if (progress.cleared)                → 'cleared'
  if (progress.introSeen)              → 'in-progress'
  else                                 → 'available'

satisfied(requires):
  // 전환기 규칙: playable === false인 장은 해금 판정에서 자동 통과 처리.
  //   → 콘텐츠 공급 시차와 무관하게, 만들어진 장은 항상 도달 가능 (M2에 ep08 locked 사고 원천 차단)
  all.every(id => cleared(id) || !episode(id).playable)
  && (any ? count ≤ any.of.filter(id => cleared(id) || !episode(id).playable).length : true)
```

**해금 그래프 (기본 구조 — 병렬은 v1 실험이 아니라 지금부터다):**

```
1막(온보딩·직렬):   ep01 → ep02 → ep03 → ep04
2막(갈릴리·병렬):   ep04 ─┬→ ep05 ┐
                          ├→ ep06 ┼─(3편 중 2편 클리어)→ ep08
                          └→ ep07 ┘
3막(예루살렘·병렬): ep08 ─┬→ ep09 ┐
                          └→ ep10 ┴─(둘 다)→ ep11 → ep12
```

- 리듬이 싫으면 ep05·06(퍼즐)으로, 퍼즐이 지치면 ep07(물류)로 — **미니게임 하나가 게임 전체를 막을 수 없다**. 동사 피로 구간(5–7장 퍼즐·퍼즐·물류)에 선택권 부여.
- 1막을 직렬로 유지하는 이유: 온보딩 4장은 서사·조작 학습 순서가 고정되어야 한다. 병렬의 가치는 "숙련 이후의 선택권"이다.
- gentleMode는 별개로 유지 — "쉽게"와 "안 하고 지나가기"는 다른 문제이며 이 그래프가 후자를 해결한다.

### 5.2 장 내 상태기계 (`progression/machine.ts`)

```
[enterEpisode]  ← playCount는 여기서만 +1 (F13)
   │ run = { epId, stageIndex: 0, phase: stages[0].kind, isReplay: progress.cleared }
   ▼
dialogue ──(종료 | 스킵(introSeen))──▶ advance()
minigame ──(onResult: cleared=true)──▶ advance()
   │  └─(cleared=false)→ 같은 단계 재시도 (무손실. 1분 초과 게임은 체크포인트에서)
hub      ──(완료 슬롯 ≥ required)────▶ advance()   // 슬롯 완료는 hubSlotsDone에 즉시 영속
witness  ──(인터랙션 완료)───────────▶ advance()   // 실패·재시도 개념 자체가 없음
recruit  ──(카드 연출 종료)──────────▶ advance()
   ▼
advance(): 다음 stage 존재? → 해당 phase로
           마지막이었다?   → phase='closing' → completeEpisode(run)
```

**전이 규칙(불변식):**
1. `minigame` 실패는 상태를 전진시키지 않는다. 벌칙·손실 없음.
2. **playCount는 `enterEpisode`에서만 증가한다.** `completeEpisode`는 건드리지 않는다. 중도 이탈도 "걸은 횟수"로 친다(드립피드 의미에 부합). *(v1 규칙 2·3의 이중 증가 모순 해소 — F13)*
3. 중도 이탈: `run` 소멸. `introSeen`·`storyBeatsSeen`·`hubSlotsDone`·`playCount`는 발생 즉시 영속 커밋.
4. `completeEpisode`는 멱등: companions 중복 추가 없음, lamps는 OR 누적.
5. 등불 판정은 `closing` 한 곳: `clear`=완주, `insight`=`result.insight`, `story`=`storyBeatsSeen ⊇ lamps.storyBeats`. `lamps === null`이면 판정 건너뜀.
6. `completeEpisode`가 `lastReward`(diff 산출물)를 남기고 **그 시점에 run을 소멸**시킨다(F15). 성취 해석기는 커밋 후 일괄 평가 → `lastReward.newAchievements`.

### 5.3 보상 화면 — 데이터 소스와 분기 (F15, F23)

- `RewardScreen`은 **`lastReward`만 읽는다** (v0.1의 `currentEpisode` 의존 제거). 새로고침으로 `lastReward === null`이면 맵으로 폴백 — 무손실이므로 문제없음.
- **성구는 자동 노출하지 않는다.** 보상 화면의 주인공은 동료 카드·비네트·등불 연출이고, 하단에 "마무리 말씀" 카드가 접혀 있다(탭하면 열람). 성구 각인은 컬렉션 카드 상세에.

| 상황 | 연출 |
|---|---|
| 첫 클리어 + 영입 | 동료 카드 연출 + 새 등불 점등 + 비네트/일러스트 해금 배너 + (접힌) 성구 카드 |
| 첫 클리어 + 영입 없음 | "한 걸음 더" 톤 + 등불 + (접힌) 성구 카드 |
| 재플레이 | "다시 걸은 길" 톤, **newLamps만** 점등, 재방문 대사 해금 알림 |
| 12장 | 등불·성취 없음. 수난의 여운 → **부활의 기쁨** 순서의 새벽빛 연출. 성구 카드는 동일하게 선택 열람 |

### 5.4 12장 규정 — 데이터 스케치 (F3, F26, 공통10)

**stages 스케치 (T1 감수 패키지 동봉 실물):**

```ts
{
  id: 'ep12', no: 12, lamps: null, nodeTone: 'coral',
  stages: [
    { kind: 'dialogue', knot: 'ep12_intro' },                          // "이 장에는 등불이 없습니다"
    { kind: 'witness', knot: 'ep12_via',    interaction: 'walk-along' }, // 수난: 시몬·여인들 곁에서 함께 걷기 (quiet)
    { kind: 'dialogue', knot: 'ep12_sabbath' },                        // 안식일의 침묵 — 짧게
    { kind: 'witness', knot: 'ep12_tomb',   interaction: 'discover' },  // 빈 무덤: 실패 없는 발견 (클리어 게이트 없음)
    { kind: 'witness', knot: 'ep12_emmaus', interaction: 'converse' },  // 엠마오: 대화 선택 (기쁨으로 전환)
    { kind: 'dialogue', knot: 'ep12_dawn' },                           // 부활의 피날레 — 밝고 해방적으로
    { kind: 'recruit', companions: ['magdalene'] },
  ],
}
```

**12장 전용 규정 (전부 명문화 — "무채점 선언"만으로 감수는 성립하지 않는다):**

| 항목 | 규정 |
|---|---|
| 클리어 게이트 | 없음. 12장의 모든 인터랙션은 `witness` — `cleared=false` 상태가 존재하지 않는다. GDD의 "빈 무덤 발견 퍼즐"은 실패 불가능한 발견 인터랙션으로 구현 |
| 이원화 | 수난 비트(quiet — 절제, 카타르시스 금지)와 부활 비트(기쁨 — 색·음악 전환, 승리를 침묵시키지 않음)를 stages 데이터에서 분리 |
| 최소 인터랙션 | 손이 계속 움직인다(함께 걷기·등불 들기·발견·대화 선택) — "스킵 못 하는 컷씬"이 되지 않게 (비신자 medium) |
| 재플레이 | 허용 — 단 "다시 겪기"로 명명. 재방문 **대사 드립피드 대상에서 제외**(맵에서 재방문 안내 미노출), playCount는 증가하되 어떤 보상 조건에도 쓰이지 않음 |
| 통계 | `selectJourneyPercent`(완주율)에 포함. 공유 스크랩북에는 새벽빛 "완주" 표시만 — 소요 시간·횟수 등 기록 일절 없음 |
| 성취·등불 | 스키마 차원 생성 불가(3.4 refine ②) |
| 능력 | 동료 능력·보너스 미적용(④4.4) |

### 5.5 시간 예산 — 리듬의 박자표 (F6)

| 구간 | 예산 | 검증 |
|---|---|---|
| 인트로 대화 | ≤60초 (**ep01 특칙 ≤30초** — 플레이 선행) | `timeBudgetSec.intro` — 빌드 검증 |
| 미니게임 1회 시도 | 90초~4분. **60초 초과 게임은 구간 체크포인트 의무**(⑥6.2) | minigames 플랜 계약 |
| 아웃트로 | ≤45초 | `timeBudgetSec.outro` |
| 영입 연출 | ≤20초 | 고정 연출 |
| 에피소드 총(첫 클리어) | 4~8분 | `timeBudgetSec.total ≤ 480` |
| D0 첫 클리어 | **≤3분** = 15(타이틀→맵) + 30(인트로) + 90(미니게임) + 20(아웃트로) + 15(카드) = 170초 | 플레이테스트 게이트 1 |
| 코어 캠페인(12장 1회 완주) | 90~120분 | — |
| 완집(등불 33 + 비네트 + 재방문 대사) | 4~6시간 | — |

- 마이크로 피드백 리듬(GDD §8 "30~90초")은 단계 경계에만 의존하지 않는다 — `reportMoment` 계약(⑥6.3)이 미니게임·대화 내부에서 보장.
- 일일 소비 산정: 세션 10~15분 기준 하루 1~2 에피소드 → 코어는 D0~D7에 소화, D8–30은 등불·비네트 완집 + 재방문 루프(5.6). 해금 리듬과 정합.

### 5.6 재플레이 콘텐츠 경제 (F8)

**Hades 인용 삭제.** 이 게임의 재방문 루프는 "수백 줄 상황 대사"가 아니라 **등불 보상 실체(④4.2) + 유한하지만 보장된 드립피드**다. 약속은 공급량으로만 한다.

| 트리거 | 장당 최소 | 채점 장 11개 합계 |
|---|---|---|
| playCount = 2 반응 대사 | 1 | 11 |
| playCount = 3 반응 대사 | 1 | 11 |
| playCount = 5 반응 대사 | 1 | 11 |
| 동료 보유 조건 대사 (예: 도마 보유 상태로 ep08 재방문) | 2 | 22 |
| **합계 (M3 게이트 수치)** | **5** | **55** |

- 공급 미달 장은 맵·시트에서 재방문 안내를 **노출하지 않는다**(빈 약속 금지).
- D8–30 목표의 정직한 정의: "무한 반복 루프"가 아니라 **완결형 완집 루프** — 등불 33 + 비네트 11 + 뒷면 이야기 11 + 일러스트 11 + 재방문 대사 55를 다 모으면 여정 스크랩북이 완성된다. 완주 후 상태는 ⑥6.1 폴백이 받는다.

---

## ⑥ 타 시스템과의 인터페이스 (이벤트/셀렉터 계약)

### 6.1 셀렉터 계약 (`state/selectors.ts`)

```ts
selectEpisodeStatus(id): EpisodeStatus    // playable 편입 (5.1)
selectNextEpisode(): NextStep             // ↓ 4단계 폴백 — null을 반환하지 않는다 (F10, F16)
selectLamps(id), selectTotalLamps()       // max는 채점 장 11개 × 3 = 33 (12장 제외)
selectCompanionIds(), selectPlayCount(id), selectAchievements()
selectJourneyPercent(): number            // cleared/12 — 12장 포함 (완주율)
selectMissedStoryHints(id): string[]      // 놓친 조각의 힌트 1줄씩 — 컬렉션·시트용 (6.4)
selectVignettes(): string[]               // 열람 가능 비네트
```

**`selectNextEpisode` 폴백 사양 (완주 유저가 빈 화면을 만나지 않는다):**

| 우선순위 | 조건 | 이어 걷기 카드 표시 |
|---|---|---|
| 1 | in-progress 장 존재 | 그 장 (최소 no) — "걷던 길을 마저" |
| 2 | available 장 존재 | 최소 no — "다음 걸음" |
| 3 | 전장 클리어 & 등불/비네트 미완 장 존재 | 미완 장 중 최소 no — "되걷기 초대" (남은 등불·힌트 표기) |
| 4 | 전부 완집 | 스크랩북 완성 뷰 + 13장(에필로그) 티저 카드 |

데일리 "오늘의 한 걸음"도 동일 폴백 사용 — 완주 후 모드는 3·4단계 추천.

### 6.2 미니게임 계약 — insight 품질 조항 (F1, F7, 공통2)

```ts
export interface MinigameResult {
  cleared: boolean
  insight: boolean
  stats: Record<string, number>   // 원자료만. 채점·비교 금지
}
```

**미니게임 플랜이 준수해야 하는 계약 조항 (이 문서가 부과):**
1. **insight 판정 조건은 플레이 전에 유저에게 한 문장으로 서술 가능**해야 한다 (미리보기 시트에 표기).
2. **단순 노미스·스코어·시간 단독 조건 금지** — 반드시 그 장의 주제와 연결된 **행동** 조건일 것.
3. 첫 클리어 세션에서의 insight 달성률 목표 **20~40%** (계측으로 확인, 벗어나면 조정).
4. 각 insight 조건은 `lamps.insightSpec`(성경 본문 근거 1줄 + 감수 상태)을 데이터로 제출 — **감수 큐 자동 등재** (판정 메커닉이 곧 교리 진술이기 때문이다).
5. **ep08 확정 재설계**: 통찰 = "흔들려 가라앉기 시작해도 시선을 다시 빛으로 돌이킴". 침몰 위기의 해소는 플레이어 조작이 아니라 **조작 불능 '붙잡히심' 연출 비트**(마 14:31 — "즉시 손을 내밀어"). 게임적 도전은 그 이전 구간까지.
6. **60초 초과 미니게임은 구간 체크포인트/재개를 자체 제공** — 이탈 복귀 시 체크포인트부터 (게임D medium).
7. 프레임 루프 값은 ref + 직접 DOM 스타일로, React 상태는 이산 이벤트만 (현행 WaterWalkGame의 rAF 틱당 setState 3회 패턴 복제 금지 — 엔지 low).
8. 집중 미니게임 중 시각 토스트 금지(공통6).

### 6.3 액션(이벤트) 계약

```ts
enterEpisode(id)              // 가드: available|cleared만. playCount +1은 여기서만
advanceStage()
reportMinigameResult(r)       // 유일한 미니게임 출구
reportMoment(m: { kind: string; id: string })
  // 30~90초 마이크로 보상 리듬 보장 (공통5): 미니게임·대화가 발행,
  // progression/moments.ts가 소진 정책으로 필터 후 마이크로 연출(반짝임·한 줄 대사) 큐잉.
  // 소진 정책 kind별: 'once'(런 전체 1회) | 'perSession' | 'onChange'(값 변화 시만)
markStoryBeat(epId, beatId)
completeHubSlot(slotId)       // hub 단계 — 즉시 영속
completeEpisode(run)          // machine 내부 전용. lastReward 산출 + run 소멸
abandonRun()
onEpisodeCleared              // 발행 이벤트: { epId, companionsPresent } — 허브가 구독해
                              // 동반 동료 유대 가산(유대 경제는 허브 플랜 소유)
```

### 6.4 소비자별 계약 요약

| 시스템 | 읽기 | 쓰기 | 비고 |
|---|---|---|---|
| 미니게임(5동사) | `gentleMode`, `reduceMotion`, 에피소드 메타 | `reportMinigameResult`, `reportMoment` | 6.2의 8개 조항 준수 |
| 대화(ink) | `introSeen`, `playCount`, `companions` | `advanceStage`, `markStoryBeat`, `reportMoment` | 외부 함수: `hasCompanion(id)`, `playCount(epId)` |
| 컬렉션 | `selectCompanionIds`, `selectLamps`, `selectVignettes`, **`selectMissedStoryHints`** | 없음 | 카드에 등불 각인 + **조각 카운트(2/3)와 놓친 조각 힌트 1줄** — "안개" 아닌 초대 (게임D medium). 성취 탭(④4.3). 조화 배열 각주(⑩T6) |
| 허브(관계) | `selectPlayCount`, `selectAchievements`, `onEpisodeCleared` 구독 | 없음 | 유대 가산·경제 산수는 허브 플랜 |
| 데일리(초대형) | `selectNextEpisode` | 없음 | 완주 후 모드 포함(6.1). 미접속 벌칙 금지 |

### 6.5 접근성 계약 (F19) — 화면이 아니라 계약 수준에서 명세

| 대상 | 명세 |
|---|---|
| 맵 노드 | `role=button`, `aria-label="{n}장 {제목}, {상태}, 등불 {x}/3"` (무채점 장은 "등불 없음, 함께 걷는 장") |
| 미리보기 시트 | `role=dialog`, 열릴 때 제목으로 포커스, 닫으면 노드로 복귀 |
| 상태 안내(구 토스트) | `role=status` 라이브 리전. **자동 소멸 토스트 폐지** — 탭으로 닫는 시트/말풍선 (UX medium) |
| phase 전환 | dialogue→minigame→recruit 등 전환 시 새 화면 `h1`로 포커스 이동 |
| 보상 연출 | 카드·등불 연출에 대체 텍스트, 연출 종료 후 결과 요약이 라이브 리전으로 공지 |
| 키보드/스위치 | 전 인터랙션 키보드 도달 가능(1급 계약 — 공통6). 포커스 링은 기존 global.css 규칙(`outline: 2px var(--lamp)`, offset 3px)을 전 화면 공통 토큰으로 명문화 |

---

## ⑦ UI 디자인 토큰 적용

### 7.1 토큰 — 실제 `global.css` 명명 기준 (공통9, hex 하드코딩 금지)

| 요소 | 토큰 | 적용 |
|---|---|---|
| 맵 배경 | `--ground` #0B1020 | 전 화면 |
| 열린 노드·등불·발자국 길 | `--lamp` #F0B24A | 현재 노드 글로우, 등불, 완주 경로 점선 |
| **잠긴 노드 (신규)** | `--node-locked` #5A6280 | 실루엣 + 안개 아이콘 (F17) |
| 12장 노드·감정 정점 | `--dawn` #E98A6B | + **여명 지평선 프레임**(형태 단서 — 색 단독 부호화 금지, UX medium) |
| 본문·카드 지면 | `--parchment` #EDE3CE / `--ink` | 텍스트·스크랩북 카드 |
| **밝은 지면 위 텍스트 (신규)** | `--ink-on-light` #20160A | 양피지 카드 위 본문 (공통6) |
| 장 제목·성구 | `--serif` (Noto Serif KR) | **20px 이상 전용** — 어두운 배경 위 작은 세리프 금지(헐레이션) |
| UI 레이블·버튼·배지 | `--sans` (Noto Sans KR) | — |
| 타입 스케일 (신규) | `--fs-body: 17px` / `--fs-caption: 13px` | caption은 보조 정보만. 시스템 글자 배율 200%에서 리플로우(WCAG 1.4.4) |
| 터치 타깃 | `--touch: 48px`로 상향 (기존 44) | 인접 노드 간 최소 간격 8pt. 320pt 폭 검증 I10 |
| 포커스 링 | `--lamp` 2px + offset 3px (기존 global.css) | 전 화면 공통 명문화 |

### 7.2 대비 실측치 (F17) — 회귀 테스트 I9의 기준값

| 쌍 | 실측 대비 | 기준 (WCAG) | 판정 |
|---|---|---|---|
| `--lamp` on `--ground` (열린 노드·획득 등불) | **10.1:1** | 비텍스트 3:1 | 통과 |
| **미획득 등불: `--lamp` 100% 불투명 2px 스트로크**(채움만 비움) on `--ground` | **10.1:1** | 3:1 | 통과 — "아직 켜지 않은" 은유는 채움 유무로 유지 |
| `--node-locked` #5A6280 on `--ground` (잠긴 노드) | **3.2:1** | 3:1 | 통과 |
| `--dawn` on `--ground` (12장 노드) | **7.5:1** | 3:1 | 통과 |
| `--ink`/`--parchment` 텍스트 on `--ground` | **14.9:1** | 텍스트 4.5:1 | 통과 |
| `--ink-on-light` on `--parchment` (카드 본문) | **14.0:1** | 4.5:1 | 통과 |
| `--muted` #9AA3BD on `--ground` (보조 텍스트) | **7.5:1** | 4.5:1 | 통과 |

- v1 스펙이던 "앰버 20% 윤곽선"(합성 ≈1.46:1)·"12% 실루엣"(≈1.3~1.5:1)은 **폐기** — 레시피(%)가 아닌 확정 토큰만 허용.
- I9: 위 표의 토큰 쌍 대비를 계산하는 단위 테스트 — 토큰 변경 시 자동 회귀 검출.

### 7.3 표기 규칙 (F9 — 모순 해소, 결정)

- **맵**: 장 진행 "n/12장"만 표기. 장별 노드에 그 장의 등불 아이콘(0~3)은 표시하되 **합계 카운터 없음**.
- **컬렉션**: 등불 합계(n/33)·비네트·성취는 여기서만. 백분율·랭킹·타인 비교 없음.
- 잠긴 12장 서브타이틀은 "감추기"가 아니라 **"예비시키기"** — 시안 예: "가장 어두운 밤과 그 후의 새벽" (복수 시안을 T2 감수에 제출. 부활은 숨길 반전이 아니라 선포할 복음이다.)

### 7.4 인터랙션 규칙 (F18)

- **노드 탭 = 미리보기 시트** (기본 경로): 상태·등불 현황·insight 조건 한 문장·놓친 조각 힌트·[걷기 시작/이어 걷기/다시 걷기]. 롱프레스는 어떤 정보의 유일 경로도 아니다.
- 잠긴 노드 탭 → 같은 시트에 "어느 길을 먼저 걸어야 하는지" 지속 표시(자동 소멸 없음, 탭으로 닫기).
- 등불 안내 문구는 **아동어 병기 원칙**: 은유 명칭 + 행동 서술 (예: "통찰의 등불 — 가라앉아도 다시 빛을 바라보기"). 플레이테스트에 "등불 3종을 자기 말로 설명하기" 아동 과제 포함(⑨9.3).

### 7.5 성능 예산 (엔지 low)

- 애니메이션은 **transform/opacity만**. 노드 글로우는 사전 렌더된 반투명 레이어의 opacity 전환(box-shadow/filter 블러 애니메이션 금지).
- 맵의 상시 애니메이션 노드는 **현재 노드 1개**로 제한.
- 저가 안드로이드(4년 전 중급기) 기준 맵 스크롤 60fps를 M2 완료 기준에 포함.

### 7.6 움직임 줄이기 (UX low)

- `prefers-reduced-motion` 상속 + **인앱 "움직임 줄이기" 토글**(`reduceMotion: 'system'|'on'|'off'`) — gentleMode와 같은 설정 화면에 배치. 전 연출 정적 폴백(페이드) 전역 규칙(공통6).

---

## ⑧ MVP → v1 단계별 로드맵 (재편 — F14, F24, F25)

| 단계 | 산출물 | 완료 기준 |
|---|---|---|
| **M0. 기반** (2~3일, 신설) | git init, vitest + RTL + jsdom 셋업, `validate-content.ts` 뼈대(refine 3종 우선), **대한성서공회 인용 허가 절차 착수**(병행: 새한글성경 등 대안 번역 검토) | `npm test` 그린, 예수 id refine이 CI에서 실패를 내는 것 확인 |
| **M1. 진행 코어** (1.5주) | 스키마 확장(hub·witness·requires·review·timeBudget), persist `version: 2`(키 유지, 0→2 분기), `machine.ts`, **데이터 선스케치: ep03·ep04·ep12**(골격 검증 — ep12 스케치는 T1 감수 패키지로 발송), EpisodeRunner가 ep08 실행 | version 0 실세이브 스냅샷 이관 통과(U19), ep08 기존 플레이 동일 체감, ep04가 hub kind로 표현됨을 데이터로 증명 |
| **M2. 맵 개편 + 등불 실체** (1.5주) | 길(path) 맵 + 미리보기 시트 + 접근성 계약(6.5), 해금 셀렉터(playable 편입), **ep08 등불 3종 전부 실동작**(insight 재설계 반영 + story는 인라인 조각), lastReward·보상 분기, 등불 보상(비네트 1종 시제), 로컬 계측, totalCompanions 파생화 | **게이트: ep08에서 등불 3종이 각각 실제 획득 가능**, 대비 회귀 I9 통과, 저가기기 60fps |
| **M3. 재플레이 + 성취** (1주) | 멱등 검증, 재방문 대사 훅, achievements + 해석기 + 컬렉션 성취 탭, 재방문 대사 ep08분 5개 공급 | 재플레이 등불 추가 획득·중복 영입 0건, **게이트: 공급 수치표(5.6) ep08 충족** |
| **M4. 2번째 에피소드** (2주) | **ep06(지붕 도르래 — 선형 골격 적합)** stages + 퍼즐 미니게임, DialogueStage(인라인 폴백) | 서로 다른 verb 2개가 같은 러너로 구동 *(v1의 ep04 선정은 허브 구조로 골격 파괴라 교체 — F14)* |
| **M5. ink + hub 구현** (1.5주) | inkjs 통합, `markStoryBeat`·외부 함수, hub kind 러너 구현 → **ep04 착수** | 대화 분기·재방문 대사가 ink 데이터만으로 추가, ep04 슬롯 자유 순서 동작 |
| **v1. 12장 완비** | 전 장 stages/lamps/시간예산 데이터, 병렬 해금 그래프 적용, ep12 이원화 구현, 등불 보상 33종 제작, 재방문 대사 55개, **IndexedDB 전환(별도 마일스톤 — 마이그레이션과 비동시)**, 13장 훅, 신학 감수 통과(감수 게이트 그린) | 1→12장 연속 완주 + `validate-content.ts --prod` 통과 |

- **전체 일정에 버퍼 25%** 반영(1인 개발 낙관 편향 보정). M1에서 통합 테스트 제외 — 순수 모듈 단위 테스트만.
- 의존성: M0→M1→M2→M3 직렬. M4·M5는 M2 이후 병행 가능.
- 감수 패키지는 M 단계마다 증분 발송(M1: ep12 스케치+insight 조건 일람 / M2: 등불 문구·명칭 대안 / M3: 성취 / 이후 대사 증분).

---

## ⑨ 테스트 계획

### 9.1 단위 테스트 (Vitest — M0에서 셋업)

| # | 케이스 | 합격 기준 |
|---|---|---|
| U1 | `EpisodeListSchema.parse` 12장 전체 | 예외 없음. requires id 실존, recruit ⊆ companions, hub 중첩 금지 |
| U2 | 마이그레이션 0→2 | `completed:['ep08']` → `progress.ep08.cleared===true`, companions 보존 |
| U3 | 마이그레이션 — 빈 version 0 세이브 | 기본값 v2 생성 |
| U4 | `selectEpisodeStatus` | 선형·병렬(any count) 각 케이스 + **in-progress 케이스**(F16) |
| U5 | `machine.advance` 정상 경로 | dialogue→minigame→recruit→closing 전이 |
| U6 | 미니게임 실패 | phase·stageIndex 불변 |
| U7 | `completeEpisode` 멱등 + **playCount는 enterEpisode 기준** | 2회 진입·완주 → companions 중복 0, **playCount=2 (enterEpisode 2회의 결과)**, lamps OR 누적 |
| U8 | 무채점 장 | `lamps:null` 완주 → lamps 빈 객체, 등불 max에 미포함, witness에 실패 상태 없음 |
| U9 | story 등불 | `storyBeats` 3개 중 2개 → false, 3개 → true |
| U10 | 성취 해석기 | 경계값 판정, 재발급 없음 |
| U11 | `enterEpisode` 가드 | locked·coming-soon 진입 시도 → no-op |
| U12 | `abandonRun` | run 소멸, 영속 커밋분(hubSlotsDone 포함) 유지 |
| U13 | **playable 편입** (F11) | ep08만 playable인 현행 데이터에서 ep08이 `available`(선행 미구현 장 자동 통과), ep01(콘텐츠 없음)은 `coming-soon` |
| U14 | **refine: 예수 id 금지** (F2) | companions·recruit에 `jesus` 포함 데이터 → parse 실패 |
| U15 | **refine: 무채점 장 성취 참조 금지** (F2) | cond에 ep12 포함 성취 → 검증 실패 |
| U16 | **refine: verseRef 4복음서** (F2) | '사도행전 1:1' → 실패, '마태복음 14:28' → 통과 |
| U17 | requires any(count) 판정 | 5·6·7 중 2개 클리어 시 ep08 available |
| U18 | hub 단계 | required=2, 슬롯 2개 완료 시 advance 가능·1개면 불가. 슬롯 완료 영속 |
| U19 | **version 0 실세이브 스냅샷** (F12) | 현행 partialize 산출물 픽스처가 그대로 이관됨 |
| U20 | 감수 게이트 | `--prod`에서 pending/해시 불일치 콘텐츠 → 검증 실패, dev는 경고 |
| U21 | 시간 예산 | `timeBudgetSec.total > 480` 데이터 → 검증 실패 |

### 9.2 통합 테스트 (RTL — M2 이후)

| # | 케이스 | 합격 기준 |
|---|---|---|
| I1 | 맵 렌더 — 신규 세이브 | ep01 노드 상태 표기, 잠긴 노드 탭 → **지속형 시트**(자동 소멸 없음) |
| I2 | 전체 플로우 | 맵→시트→인트로→미니게임(모의)→영입→보상(lastReward 기반)→맵 |
| I3 | 재플레이 플로우 | 시트에 "다시 걷기" → 보상 "다시 걸은 길" 분기, newLamps diff만 점등 |
| I4 | 중도 이탈 복원 | 미니게임 중 리마운트 → 맵 복귀, in-progress 배지, 데이터 무손실 |
| I5 | gentleMode·reduceMotion 전달 | prop 수신 확인 |
| I6 | reduced-motion | OS 설정 + 인앱 토글 각각에서 애니메이션 클래스 미적용 |
| I7 | **axe 스모크** (F19) | 맵·시트·러너·보상 4화면 axe 위반 0 |
| I8 | **포커스 이동** (F19) | phase 전환 시 h1 포커스, 시트 열림/닫힘 포커스 왕복 — 최소 2건 |
| I9 | **대비 회귀** (F17) | ⑦7.2 표의 토큰 쌍 전부 기준치 이상 (계산 테스트) |
| I10 | 소형 화면 | 320pt 폭에서 노드 타깃 48pt·간격 8pt 유지 |
| I11 | 보상 새로고침 | lastReward null 상태 진입 → 맵 폴백, 크래시 없음 |

### 9.3 플레이테스트 합격 기준 (M2·v1 게이트) — 표본 층화 (F20)

**표본 쿼터 (매 게이트):** 아동(8~10세) 2인 + 60대 이상 2인 + 성인 4인 이상, 전체 중 **비종교인 50% 이상**. 기준 4·5·6은 비신자 응답 별도 집계.

| # | 기준 | 임계값 |
|---|---|---|
| 1 | 3분 아하(첫 클리어+첫 영입) | 성인 3분 / **아동·고령 5분** — 각 그룹 다수 통과 |
| 2 | 다음 걸음 명료성 | 성인 3초 / 아동·고령 8초 내 답변 |
| 3 | 무손실 체감 | 미니게임 중 강제 종료 → "잃은 게 있냐"에 전원 "없다" (체크포인트 게임 포함) |
| 4 | 등불 압박 부재 | 부정 응답 다수 + 재도전 의사. **비신자 별도 집계** |
| 5 | 12장 톤 | "겪는 장"으로 서술 + **"지루했는가"를 별도 질문**(비신자 medium) — 감동과 지루함은 다른 축 |
| 6 | **재미·추천 의향·수집 욕구** (공통5) | "친구에게 추천하겠는가"(비신자 포함), "등불/비네트를 더 모으고 싶은가" 긍정 다수 |
| 7 | 등불 이해(아동) | 아동이 등불 3종을 자기 말로 설명 |

### 9.4 로컬 계측 (게임D low — "윤리적 게임이라도 익명 로컬 측정은 죄가 아니다")

M2에 경량 계측(외부 전송 없음, 로컬 저장 → 플레이테스트 세션에서 수동 회수): 단계별 이탈 지점, 미니게임 재시도 수, insight 달성률(6.2 목표 20~40% 검증), gentleMode·reduceMotion 토글률, 세션 길이, 능력 보유/미보유 클리어율(④4.4 A/B).

---

## ⑩ 신학 체크포인트 (통합측 감수 — 상설 게이트)

감수 주체: **통합측 목회자 2인 이상**. 절차: 콘텐츠 해시 바인딩 승인(3.5) → 수정 시 자동 재검 큐 → 미승인 시 프로덕션 빌드 실패. 감수 범위는 **노출되는 전 텍스트 + 판정 메커닉**이다.

| # | 항목 | 지침 |
|---|---|---|
| T1 | 12장 무채점 설계 전반 | **⑤5.4의 stages 스케치·규정 표를 실물로 동봉**(M1 발송). 십자가의 반복 콘텐츠화 여부·수난/부활 이원화의 적절성. **감수 필요** |
| T2 | 12장 노드 문구·아이콘 | "감추기"가 아니라 "예비시키기" 방향의 복수 시안 제출(⑦7.3). **감수 필요** |
| T3a | 본문 정확성·문맥 | verseRef·closing·비네트 내 성구의 인용 정확성, 문맥 이탈 금지. **감수 필요** |
| T3b | **성구 저작권 (법무 — 감수와 분리, F24)** | 대한성서공회 개역개정 사용 허가 절차 **M0 착수**. 병행: 새한글성경 등 대안 번역 검토. CI 인용문 자동 대조(3.5) |
| T4 | **통찰 판정 조건 자체 + 문구** (F1) | 감수 대상은 문구가 아니라 **각 장의 insight 판정 기준**(`insightSpec` 일람, M1 발송). 공로주의는 메커닉으로 들어온다. **등불 명칭 대안(발자국·이정표·조약돌 등 비상징 표지)도 이 안건에 포함** — 유지 시 마 5:15·25장과의 혼동 방지 문구 감수. **감수 필요** |
| T5 | 성취 명칭·조건 | all-twelve는 데이터 부재 상태로 안건만 상정: '열한 명과 남은 자리' 구성의 신학적 정직성. **감수 필요** |
| T6 | 해금 순서 = 사건 연대기 | 조화(harmony) 배열의 감수 + **컬렉션 카드 각주 시안**("이 사건은 복음서마다 자리가 다릅니다") 함께 검토(신학 low) |
| T7 | 재방문 대사 등 신규 집필분 | **ReviewStatusSchema가 dialogue/witness/closing/insightSpec에 실재**(3.5) — 자동 등재는 이제 성취만이 아니라 전 콘텐츠에 작동한다 |
| T8 | 예수님 등장 연출 | "예수님을 조작하는 단계 없음"은 리뷰 약속이 아니라 **스키마 refine(3.4 ①) + '붙잡히심' 조작 불능 비트(6.2-5)**로 기계 보장. 연출 톤은 별도 감수. **감수 필수** |

---

## ⑪ 리스크와 완화책

| 리스크 | 영향 | 완화책 |
|---|---|---|
| 세이브 마이그레이션 실패 | 신뢰 훼손 | 순수 함수 + U2·U3·U19(실세이브 스냅샷), 키 유지 + version 0 분기(3.3), 실패 시 백업 키 보존, IDB 전환 분리 |
| stages 골격이 특수 장에 안 맞음 | 엔진 특수분기 증식 | hub·witness kind로 ep04·ep09·ep12를 이미 수용(③3.1). M1에서 ep03·ep04·ep12 데이터 선스케치로 검증 — 스케치 실패 시 스키마 확장이 원칙, 엔진 분기 금지 |
| 등불이 점수판화 | ENGAGEMENT 저촉 | 합계는 컬렉션 전용으로 **확정**(F9), 문구 초대 톤 전수 검수, 플레이테스트 기준 4(비신자 별도 집계) |
| 재방문 대사·보상 실체 공급 부족 | 재플레이가 빈 반복 | 공급 수치표(5.6)가 M3/v1 게이트. 미달 장은 재방문 안내 미노출. D8–30 목표를 완집 루프로 정직화 — 과장 인용(Hades) 삭제 |
| insight 조건이 밋밋("노미스 클리어" 전락) | 등불 1/3 사망 + 신학 사고 | 6.2 품질 조항 4종(사전 서술·행동 조건·달성률 20~40%·insightSpec 감수)이 미니게임 플랜에 대한 계약. M2 게이트 = ep08 3종 실동작 |
| ink 통합 지연 | story 등불 미구동 | M2에서 ep08 한정 인라인 조각으로 story 선행 구동(F7), ink는 어댑터 뒤 격리 |
| 병렬 해금이 서사 흐름을 흐림 | 2·3막 몰입 저하 | 병렬은 막 내부만(막 경계는 직렬), 맵의 발자국 길이 "권장 경로"를 부드럽게 안내. M4 플레이테스트에서 5–7장 구간 검증 |
| 신학 감수 지연 | 출시 블로킹 | 해시 게이트로 감수 대상 자동 추출, M 단계별 증분 발송(⑧), 감수 통과가 v1 완료 기준에 명시 |
| 성구 저작권 미해결 | 전 성구 콘텐츠 블로킹 | M0 착수(가장 이른 태스크), 대안 번역 병행 검토, 미해결 시 성구 카드 기능 플래그로 분리 출시 가능 구조 |
| 테스트/일정 낙관 편향 | 로드맵 좌초 | M0 신설(인프라 선행), M1 통합테스트 제외, 전체 버퍼 25%(F25) |
| 저가 기기 성능 | 맵 체감 저하 | transform/opacity 한정·상시 애니메이션 1노드·60fps M2 게이트(7.5) |

---

*이 문서는 진행 시스템의 단일 기준 문서다. 미니게임·허브·컬렉션 상세 플랜은 ⑥의 계약(특히 6.2 insight 품질 조항·6.5 접근성 계약)을 준수하여 별도 작성한다.*
