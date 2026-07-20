# 상세 플랜 — 콘텐츠 데이터 · 세이브 인프라

> **동행 (The Gospel Road)** · 시스템: 콘텐츠 데이터 파이프라인 + 세이브/복원 인프라
> 버전 0.2 (1차 검증 전면 반영) · 2026-07-20 · 상위 문서: [`GDD.md`](../GDD.md) §10 · [`ENGAGEMENT.md`](../ENGAGEMENT.md)
> 스택 전제: Vite + React 19 + TS(strict) + Zustand + **Zod 3.24 (v0.2 결정: v3 유지, §3.5)** + Motion + inkjs + Howler + PWA(→Capacitor)

---

## v2 변경 로그

### mustFix 대응표 (전 항목 해소)

| # | 출처 | 필수 수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| F1 | 신학 | holy 캐릭터 카드화 차단 누락 | §3.1 가드 G3, 테스트 S-04 | superRefine에 `card.characterId → kind:holy 참조 시 에러` 명시 + "예수님 카드 저작 시도 → 거부" 테스트 |
| F2 | 신학 | 예수님 id 고정·bonds/skill 금지 | §3.1 가드 G1·G2, §6.1, 테스트 S-05·S-06 | `JESUS_ID='jesus'` 상수 + `holy 필수` + `holy는 bonds/skill 보유 금지` refine, `addBondPoint`가 holy id를 코드에서 거부 |
| F3 | 신학 | 감수 해시(승인 후 수정 무효화) | §3.1 ReviewSchema v2, §5.1 (3), 테스트 S-09 | reviewer/reviewedAt/approvedHash 추가, 파이프라인이 현재 해시≠승인 해시면 자동 `needs-review` 강등 |
| F4 | 신학 | jesus-depiction·passion 즉시 게이트 | §5.1 게이트 표, §⑩ T6 | 두 태그는 **MVP 첫 배포 빌드부터** approved 아니면 빌드 실패 (--strict-review와 무관한 상시 하드 에러) |
| F5 | 신학 | ink 대사(knot) 감수 편입 | §3.1 InkReviewSchema, §5.1, §⑩ T4 | ink 파일·knot 단위 감수 메타(해시 포함)를 매니페스트에 편입, --review-report가 knot 단위 미감수 목록 산출 |
| F6 | 신학 | verseRef 장 실재 검증·display 파생 | §3.1 VerseRefSchema v2, 테스트 S-02·S-03 | 복음서별 장 수 상한(28/16/24/21) refine + display는 저작 입력이 아니라 book+ref에서 빌드 타임 파생 |
| F7 | 게임D | 에피소드 내 장면 재개 위치 | §3.2 `sceneProgress`, §6.2 `selectResumePoint` | 완료 장면 인덱스를 GameSave에 저장, 재개 계약을 `{episodeId, sceneIndex}`로 변경 — 클리어한 미니게임 재플레이 강요 제거 |
| F8 | 게임D | 허브 드립피드 데이터 확정 | §3.1 BondSchema(requires/cooldown/priority), §3.2 `seenKnots`, §3.4 경제 산수 | '본 대사'를 ink state에서 GameSave 내구 필드로 승격, 허브 ink는 stateless 진입, bond 페이싱 스키마와 유대 포인트 경제를 수치로 확정 |
| F9 | 게임D·엔지 | 세이브 쓰기 경로 단일화 | §4, §5.3 | **Zustand persist 미들웨어 제거.** `autosave.ts`(subscribe 기반)가 유일한 쓰기 소유자, 부트 시퀀스가 유일한 읽기 경로. SaveFile 조립·checksum 계산 지점 1곳 |
| F10 | 게임D | DDA 세션 간 기억 | §3.2 `attempts`, §6.1 | 에피소드별 시도 횟수 저장 — 미니게임 플랜이 세션을 넘어 관대화 이어감 |
| F11 | 게임D·비신자 | 장시간 게임 체크포인트 계약 | §6.1 `saveCheckpoint`, §3.2 `checkpoints`, §5.3 | "판 3분 초과 게임은 페이즈 체크포인트 필수" 계약 + opaque blob 보관 경로 신설(클리어 시 삭제) |
| F12 | 엔지 | 하위 호환 주장 정정 | §3.1 서두, §8 M2, 테스트 M-01 | v2는 **파괴적 변경**임을 명시. `episodes.ts → ep*.json` 일회성 이관 스크립트를 M2 산출물로 확정, 구 테스트 #6을 "이관 왕복 검증"으로 교체 |
| F13 | 엔지 | Zod 버전·파싱 정책 모순 | §3.5 | **zod 3.24 유지 결정**(`.passthrough()` 사용, `z.looseObject` 표기 삭제). 계층별 파싱 정책 표 명문화, R7의 "strict 파싱" 문구 삭제 → "id 화이트리스트 표시 필터 + 길이 상한"으로 정정 |
| F14 | 엔지 | pagehide 플러시 보장 불가 | §5.3 | best-effort로 명시 + 핵심 소량 필드(completed/companions/cards/sceneProgress)를 localStorage 동기 미러 → 부트 병합. 허용 손실 창 = "마지막 장면 경계 이후" 정의 |
| F15 | 엔지 | persist 엔벨로프 언래핑 | §5.2, 테스트 M-05 | 레거시 이전 명세에 `{"state":{...},"version":0}` 구조 명시, 실브라우저 덤프 픽스처로 테스트 |
| F16 | UX | 토큰명 실코드 불일치 | §⑦ | `--ground/--lamp/--dawn/--parchment/--serif`로 전면 정정 + "신규 hex·유령 토큰 금지, global.css가 유일한 진실" 명문화 |
| F17 | UX | reducedMotion·textScale UI 부재 | §⑦, §6.2, 테스트 A-01~03 | SettingsScreen에 두 설정 UI 명시, "OS prefers-reduced-motion ∨ 저장값 중 보수적인 쪽" 규칙, 테스트 3종 편입 |
| F18 | UX | 65세 이상 피험자 부재 | §⑨ P-03 | 여정 이동 과업에 65세+ 피험자 2인 병렬 추가, 파일 비의존 대안(여정 코드)이 기본 경로 |
| F19 | UX | settings가 여정 파일에 실려 이동 | §3.3 | settings를 SaveFile 밖 **기기 로컬 `donghaeng-prefs`**로 분리 — 내보내기/가져오기에 미포함 |
| F20 | UX | '민지님' 문구 ↔ 데이터 모델 불일치 | §3.2 `profile`, §⑪ R7 | `profile.name`(≤12자, 제어문자 제거, React 텍스트 노드로만 렌더)을 정식 도입, R7 방어 정책 동반 갱신 |
| F21 | 비신자 | iOS IndexedDB 퇴거 실질 대책 | §5.4, §8, §⑪ R1 | **여정 코드(익명 서버 백업, 계정 없음)를 M4 핵심으로 승격** + Capacitor 전환을 조건부 확정 마일스톤으로(iOS 비중 20% 초과 또는 퇴거 사고 1건 → 즉시 편입) |
| F22 | 비신자 | 매니페스트 부재 id 필터링=데이터 증발 | §3.1 `idAliases`, §3.2 `unknownIds`, 테스트 E-05 | 미지 id는 삭제가 아니라 보존 버킷에 유지(재등장 시 자동 복원), 콘텐츠 id 개명은 rename 맵으로 세이브 마이그레이션 |
| F23 | 비신자 | 기기 이동 주력 플로우 재설계 | §5.4, §⑨ P-02 | 주력 = 여정 코드+QR(파일 관리 불필요), 파일 내보내기는 파워유저 보험으로 격하. 테스트를 "폰 교체 완수율" 지표로 교체 |

### 공통 지침(_common.md) 반영 위치

| 지침 | 반영 위치 |
|---|---|
| 1. 예수님 데이터 격리 (Zod refine+CI) | §3.1 가드 G1~G3 코드 스케치, §5.1 CI 게이트 |
| 2. 마태 14:31 재설계 | §3.1 ep08 scenes 예시 — 위기 해소는 조작 불능 `rescue` vignette |
| 3. 감수 상설 게이트(해시) | §3.1 ReviewSchema, §5.1, §⑩ |
| 4. 개역개정 저작권 + 인용 diff | §8 M0 선행 과제, §5.1 (4) 인용문 자동 대조 |
| 5. 재미의 실체 | §3.4 (보상 4레이어·카드 경제·유대 산수·훅 매트릭스·마이크로 리듬 계약), §6.1 `reportMoment`, §⑨ 재미 지표 |
| 6. 접근성 수치 플로어 | §⑦ 대비 실측 표, `--ink-on-light` 신설, reduced-motion 전역 규칙 |
| 7. 테스트 인프라 선행 | §8 M0 (git init + vitest) |
| 8. 실코드 정합 | §5.2 (persist version 0·키 유지), §5.3 (쓰기 단일화), §6.1 (레지스트리 1:N) |
| 9. 디자인 토큰 통일 | §⑦ |
| 10. ep12 이원화 | §3.1 ep12 scenes 예시 (수난 quiet / 부활 joy) |

### medium/low 반영 요약과 예외

- 반영: sensitive 자동 검출 휴리스틱(§5.1), `parable-figure` kind(§3.1), gentleMode 역할 확정+수난 수위의 감수 가능 데이터화(§3.1 vignette config), 본문비평 논쟁 구절 정책(§⑩ T8), 세이브 공유 수용+나눔 이미지 분리(§5.4), 프로필 표시+부트 프로필 자리 예약(§3.2·§5.2), 로컬 진단 로그(§3.3), devotions 자리 예약(§3.1), '함께한 날 수' 카운트(§3.2), 스트레스 프로파일 재정의(§⑨ I-06), checksum 역할 격하(§3.2)와 아동 이지선다 제거(§5.4), textScale 클램프(§3.3), 부트 시간 예산(§5.2), 색+형태 이중 부호화·스크린리더 요건(§⑦), `no: max(13)` 각주(§3.1), M4 시점 재조정(§8), completeEpisode 호출부 수정 명시(§8 M1).
- 예외(사유와 대안 명시): ① **계정형 클라우드 세이브 미도입** — 게스트 우선 원칙(ENGAGEMENT §6)과 충돌. 대안: 계정 없는 익명 여정 코드 백업(§5.4). ② **다중 슬롯 UI는 v1 유지** — 단 프로필 이름 표시·부트 플로우의 프로필 선택 자리 예약·덮어쓰기 경고는 MVP에 편입해 사고를 인지 가능하게 함(§5.2·§5.4). ③ **레거시 localStorage 30일 후 삭제 로직 제거** — 수백 바이트를 지키는 마이너스 가치 기능. 영구 보존으로 단순화(§3.3).

---

## ① 목표와 범위

### 목표
1. **"콘텐츠 = 데이터" 원칙의 완성** — 새 에피소드 추가 = `.ink` + JSON + 아트 드롭인, 엔진 수정 0줄. Zod가 빌드 타임과 로드 타임에 콘텐츠 무결성을 보증한다.
2. **무손실·무의식 세이브** — 항상 자동 저장, 재진입 3초 내 이어하기, 실패해도 진행 손실 없음. **재개 단위는 에피소드가 아니라 장면(scene)** — 깬 미니게임을 다시 시키지 않는다.
3. **미래를 견디는 세이브** — `schemaVersion` + 마이그레이션 체인 + 콘텐츠 id rename 맵. 세이브 유실 = 신뢰 유실.
4. **소유권과 이동성** — 주력: 여정 코드(파일 관리 불필요). 보험: 파일 내보내기/가져오기.
5. **재미의 데이터 원장** — 카드 경제·유대 포인트 산수·능력 훅 매트릭스·마이크로 보상 리듬을 이 플랜이 수치로 확정한다(§3.4). 신앙 전제 없이 순수 수집·성장 게임으로 성립해야 한다.
6. **신학 가드는 코드다** — 문서 선언이 아니라 Zod refine + CI 하드 에러(§3.1, §5.1).

### 범위
- Zod 스키마 v2: 에피소드 / 캐릭터 / 카드 / bond / ink 감수 메타 / devotions 예약
- `.ink` → JSON 컴파일 + 검증 + 감수 게이트 파이프라인
- 세이브 모델 v2와 단일 쓰기 경로(autosave), IndexedDB 이전, 마이그레이션 체인
- 여정 코드(익명 백업·이동) + 파일 내보내기/가져오기
- 보상·경제 수치의 원장(§3.4) — 실감 튜닝은 미니게임·허브 플랜이 담당하되 수치의 출발값과 검증 규칙은 여기서 정의

### 비범위
- 미니게임 각각의 규칙·튜닝(미니게임 플랜 — 단 §6.1의 계약은 준수 의무)
- 허브 대사 본문(내러티브 플랜 — 데이터 스키마·페이싱 린트는 여기서 정의)
- 계정 연동(게스트 우선 — 익명 백업으로 대체)
- 아트 에셋 파이프라인(아트 플랜 — 배경 세로(portrait) 규격만 §6 계약에 명시)

---

## ② 플레이어 경험 시나리오

**S1. 처음 켠 날 (D0)** — 민지(14)는 링크로 PWA를 연다. 계정 없음. 첫 실행에서 프로필 이름(선택, ≤12자)을 정한다. 8장을 깨고 베드로 카드를 얻는 순간 1.8초 전용 연출(§3.4)이 흐른다. 앱을 그냥 끈다. *이면: 장면 경계마다 자동 저장.*

**S2. 다음날 이어하기 (D1)** — 타이틀에 **"민지의 여정 — 8장 · 장면 3부터 · 동료 3"** 버튼이 3초 안에 뜬다. 한 탭으로 마지막 장면 경계로 복귀.

**S3. 미니게임 도중 전화가 옴** — 1~3분급 게임: 그 장면 시작점으로 복귀(내부 상태 휘발). **3분 초과 게임(오병이어 물류 등): 마지막 페이즈 체크포인트부터**(§6.1). 이미 끝낸 장면은 절대 다시 시키지 않는다(`sceneProgress`).

**S4. 폰을 바꿈** — 설정 → "여정 옮기기" → 8자 여정 코드+QR 생성(72시간 유효). 새 폰에서 코드 입력 → "민지의 여정: 8장까지 · 동료 5 · 함께한 날 12일. 이 기기의 여정을 덮어씁니다" 확인 → 복원. 파일 내보내기는 '고급'에 접혀 있는 보험이다.

**S5. 반년 만에 돌아옴** — 구버전 세이브가 자동 마이그레이션. 콘텐츠 업데이트로 개명된 카드 id는 rename 맵으로 이어지고, 매니페스트에 없는 id도 삭제되지 않는다(보존 버킷). "함께한 날 12일" 문구는 공백을 상기시키지 않는다(경과일 아님).

**S6. 이야기 도중 저장 (ink)** — 11장 추리 대화 분기 중간에 꺼도 그 대화 그 지점부터. (에피소드 대화만 ink state 저장 — 허브는 stateless, §3.2)

**S7. 허브 재방문 (D8+)** — 8장 클리어 다음 날 허브에 가면 베드로의 새 대사 배지가 2개 떠 있다. 에피소드 1개 클리어당 신규 허브 대사 ≥2개가 콘텐츠 린트로 보증된다(§3.4).

**S8. 가족 공용 태블릿** — 동생이 앱을 열면 타이틀에 "민지의 여정"이 명시된다. "다른 여정 시작"을 누르면 덮어쓰기 경고 + 기존 여정 코드 백업 권유가 먼저 나온다. (슬롯 UI는 v1, 사고 인지 장치는 MVP.)

---

## ③ 데이터 모델

### 3.1 콘텐츠 스키마 v2 — `src/content/schema.ts`

> **정정(F12):** v2는 v0.1과 **하위 호환이 아니다.** `verseRef: string → 객체`, `companions → rewards.companions`, 필수 `scenes` 추가는 파괴적 변경이다. 기존 `episodes.ts` 12항목은 M2의 일회성 이관 스크립트(`scripts/migrate-episodes.mts`)로 `content-src/episodes/*.json`에 변환하며, 이관 왕복 검증 테스트(M-01)가 무손실을 보증한다.

```ts
// ── 공통 ──────────────────────────────────────────────
export const JESUS_ID = 'jesus' as const   // 예수님 id 상수 — 전 시스템 공용

/** 4정경 복음서 + 장 수 상한 — 신학 가이드라인의 기계적 강제 */
const GOSPEL_CHAPTERS = { 마태복음: 28, 마가복음: 16, 누가복음: 24, 요한복음: 21 } as const
const GospelBook = z.enum(['마태복음', '마가복음', '누가복음', '요한복음'])

export const VerseRefSchema = z.object({
  book: GospelBook,
  ref: z.string().regex(/^\d{1,2}(:\d{1,3}(-\d{1,3})?)?(-\d{1,2}장)?$/), // "14:22-33" | "5-7장" | "16"
  // display는 저작 입력이 아니다 — 빌드 타임에 book+ref로 파생 생성 (F6)
}).superRefine((v, ctx) => {
  const ch = parseInt(v.ref, 10)
  if (!Number.isFinite(ch) || ch < 1 || ch > GOSPEL_CHAPTERS[v.book])
    ctx.addIssue({ code: 'custom', message: `${v.book}에 ${ch}장은 없습니다 (상한 ${GOSPEL_CHAPTERS[v.book]}장)` })
})

/** 감수 상태 v2 — 승인은 콘텐츠 해시에 묶인다 (F3) */
export const ReviewSchema = z.object({
  status: z.enum(['draft', 'needs-review', 'approved']).default('draft'),
  reviewer: z.string().optional(),        // 통합측 감수자 성명 (approved 시 필수 — refine)
  reviewedAt: z.string().optional(),      // ISO
  approvedHash: z.string().optional(),    // 승인 시점의 콘텐츠 정규화 SHA-256
  notes: z.string().optional(),
  sensitive: z.array(z.enum(['jesus-depiction', 'passion', 'adversary', 'doctrine', 'disputed-text'])).default([]),
}).refine((r) => r.status !== 'approved' || (r.reviewer && r.reviewedAt && r.approvedHash),
  { message: 'approved에는 reviewer·reviewedAt·approvedHash가 필수 — 서명 없는 승인 금지' })

/** ink 대사 감수 메타 (F5) — content-src/ink/review.json, 매니페스트에 편입 */
export const InkReviewSchema = z.object({
  file: z.string(),                       // 'ep08.ink'
  fileHash: z.string(),                   // 빌드가 기록 — 승인 해시와 대조
  review: ReviewSchema,                   // 파일 단위 기본
  knots: z.array(z.object({ knot: z.string(), review: ReviewSchema })).default([]), // 민감 knot 개별 감수
})

// ── 에피소드 ──────────────────────────────────────────
const VignetteConfig = z.object({
  pace: z.enum(['quiet', 'joy']),          // ep12 이원화: 수난=quiet, 부활=joy (공통지침 10)
  interactive: z.boolean().default(false), // false = 조작 불능 연출 비트 (14:31 붙잡히심 등)
  /** 감수 가능한 수위 데이터 (F: 신학 low) — 전 연령 단일 기준, gentleMode와 무관 */
  fx: z.object({
    textIntensity: z.enum(['plain', 'restrained']).default('restrained'),
    sound: z.enum(['none', 'ambient', 'score']).default('ambient'),
    visual: z.enum(['static', 'slow-fade']).default('slow-fade'),
  }).default({}),
})

export const EpisodeSchema = z.object({
  id: z.string().regex(/^ep\d{2}(-[a-z0-9]+)?$/),  // 병렬 해금용 서브 id 허용: ep09-prodigal 등
  no: z.number().int().min(1).max(13),             // 13 = GDD §5 선택 에필로그 "가라" (각주 확정 — F: 엔지 low)
  title: z.string(), subtitle: z.string(),
  verb: VerbSchema,
  verseRef: VerseRefSchema,
  scenes: z.array(z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('dialogue'), inkKnot: z.string() }),
    z.object({ kind: z.literal('minigame'), game: z.string(),
               config: z.record(z.string(), z.unknown()).default({}) }),
    z.object({ kind: z.literal('vignette'), inkKnot: z.string(), config: VignetteConfig }),
  ])).min(1),
  rewards: z.object({
    companions: z.array(z.string()).default([]),
    cards: z.array(z.string()).default([]),
  }),
  /** 병렬 해금 기본 구조 (공통지침 5) — 선형 외길 금지 */
  unlock: z.object({
    requires: z.array(z.string()).default([]),
    mode: z.enum(['all', 'any']).default('all'),
  }).default({}),
  playable: z.boolean().default(false),
  review: ReviewSchema.default({}),
})
```

**ep08 scenes 예시** — 마태 14:31 재설계(공통지침 2): 게임적 도전은 '걷기'까지, 위기 해소는 조작 불능 비트.

```jsonc
"scenes": [
  { "kind": "dialogue", "inkKnot": "ep08_intro" },
  { "kind": "minigame", "game": "water-walk", "config": { "phases": 2 } },
  { "kind": "vignette", "inkKnot": "ep08_rescue",          // "즉시 손을 내밀어" — 조작 불능
    "config": { "pace": "quiet", "interactive": false } },
  { "kind": "dialogue", "inkKnot": "ep08_outro" }          // 미니게임 결과 변수 재주입 (§6.4)
]
```

**ep12 scenes 예시** — 수난과 부활 이원화: `vignette(passion, quiet)` → `dialogue` → `minigame(empty-tomb)` → `dialogue(emmaus)` → `vignette(resurrection, joy)`. 부활의 기쁨을 침묵시키지 않는다.

```ts
// ── 캐릭터 ─────────────────────────────────────────────
export const BondEntrySchema = z.object({      // 허브 드립피드 계약 (F8) — 자리 지금 확정
  level: z.number().int().min(1).max(5),
  inkKnot: z.string(),
  requires: z.object({                          // 상황 반응 조건 — 내러티브 플랜은 값만 채움
    episodes: z.array(z.string()).default([]),
    insights: z.array(z.string()).default([]),
    minLevel: z.number().int().optional(),
  }).default({}),
  cooldown: z.enum(['none', 'perDay', 'perEpisode']).default('none'),
  priority: z.number().int().default(0),        // 동시 충족 시 노출 순서
  unlocksSkillHook: z.string().optional(),
})

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['companion', 'encounter', 'adversary', 'parable-figure', 'holy']),
  // parable-figure(F: 신학 medium): 비유 속 인물 — UI는 "예수님이 들려주신 이야기 속 인물"로 명시 구분
  role: z.string(), desc: z.string(),
  skill: z.object({
    name: z.string(), effect: z.string(),
    hooks: z.array(z.string()).default([]),     // §3.4 매트릭스의 훅 키
  }).optional(),
  bonds: z.array(BondEntrySchema).default([]),
  tone: z.enum(['lamp', 'blue', 'rose', 'green']),
  review: ReviewSchema.default({}),
})

// ── 카드 ───────────────────────────────────────────────
export const CardSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  title: z.string(), story: z.string(),
  verseRef: VerseRefSchema,
  set: z.enum(['twelve', 'witness', 'healed', 'parable', 'encounter']),
  art: z.string().optional(),
  review: ReviewSchema.default({}),
})

// ── 매니페스트 ─────────────────────────────────────────
export const ContentManifestSchema = z.object({
  contentVersion: z.number().int(),
  episodes: z.array(EpisodeSchema),
  characters: z.array(CharacterSchema),
  cards: z.array(CardSchema),
  inkReviews: z.array(InkReviewSchema).default([]),        // F5
  devotions: z.array(z.unknown()).default([]),             // 데일리 훅 자리 예약 (F: 게임D low)
  idAliases: z.record(z.string(), z.string()).default({}), // 구 id → 신 id rename 맵 (F22)
})
```

**신학 가드 — Zod refine 코드 스케치 (문서 선언이 아니라 CI가 막는다):**

```ts
export const ContentManifest = ContentManifestSchema.superRefine((m, ctx) => {
  const byId = new Map(m.characters.map((c) => [c.id, c]))

  // G1 — 예수님 id 고정: 'jesus'는 반드시 kind:'holy' (F2)
  const jesus = byId.get(JESUS_ID)
  if (jesus && jesus.kind !== 'holy')
    ctx.addIssue({ code: 'custom', path: ['characters'],
      message: `'${JESUS_ID}'는 kind:'holy'여야 합니다 — companion/encounter 등록은 신학 게이트 전체를 무력화합니다` })

  for (const c of m.characters) {
    // G2 — holy는 bonds/skill 보유 금지: 신앙을 게이지로 환원하는 길 차단 (F2)
    if (c.kind === 'holy' && (c.bonds.length > 0 || c.skill))
      ctx.addIssue({ code: 'custom', path: ['characters', c.id],
        message: 'holy 캐릭터는 bonds(관계 수치)·skill(능력)을 가질 수 없습니다' })
  }

  for (const card of m.cards) {
    const owner = byId.get(m.idAliases[card.characterId] ?? card.characterId)
    if (!owner)
      ctx.addIssue({ code: 'custom', path: ['cards', card.id], message: '존재하지 않는 characterId' })
    // G3 — 예수님 카드화 금지: rewards를 거치지 않는 직저작 경로까지 차단 (F1)
    else if (owner.kind === 'holy')
      ctx.addIssue({ code: 'custom', path: ['cards', card.id],
        message: '예수님은 수집 카드가 될 수 없습니다 (kind:holy 참조 금지)' })
    // G4 — 비유 인물 카드는 set:'parable' 필수 (실존 인물과 시각 구분)
    else if (owner.kind === 'parable-figure' && card.set !== 'parable')
      ctx.addIssue({ code: 'custom', path: ['cards', card.id],
        message: 'parable-figure 카드는 set:parable이어야 합니다' })
  }

  for (const ep of m.episodes) {
    // G5 — 보상 동료는 kind:'companion'만 (holy·adversary·parable-figure 불가)
    for (const id of ep.rewards.companions)
      if (byId.get(id)?.kind !== 'companion')
        ctx.addIssue({ code: 'custom', path: ['episodes', ep.id],
          message: `rewards.companions '${id}'는 kind:companion이 아닙니다` })
  }
  // G6 — unlock.requires 순환 금지 · 전 inkKnot 실재 검사(빌드 타임, §5.1)
})
```

CI: `npm run content`가 위 파싱을 실행하며 **어떤 addIssue든 exit 1 = 머지 불가.** `addBondPoint` 등 런타임 액션도 `JESUS_ID` 방어를 중복 수행한다(§6.1).

### 3.2 세이브 모델 v2 — `src/save/types.ts`

```ts
export interface SaveFile {
  format: 'donghaeng-save'
  schemaVersion: number
  contentVersion: number
  appVersion: string
  createdAt: string
  updatedAt: string
  game: GameSave
  ink: Record<string, string>   // 에피소드 대화 storyId → ink state JSON. 허브는 제외 (stateless — F8)
  checksum: string              // 역할: '진단 보조' (변조 방지 서사 삭제 — F: 엔지·비신자 low)
}

export interface GameSave {
  profile: { name: string; icon: 'lamp' | 'boat' | 'star' | 'olive' }  // F20, ≤12자
  completed: string[]
  sceneProgress: Record<string, number>   // episodeId → 완료한 장면 인덱스 (F7)
  companions: string[]
  cards: string[]
  unknownIds: { companions: string[]; cards: string[] }  // 매니페스트 부재 id 보존 버킷 (F22)
  bonds: Record<string, number>           // characterId → 레벨 (1~5)
  bondPoints: Record<string, number>      // characterId → 누적 유대 포인트 (§3.4 경제)
  seenKnots: string[]                     // 본 허브 대사 knot id — ink state 아닌 내구 필드 (F8)
  insights: Record<string, string[]>
  moments: string[]                       // kind:'once' 마이크로 보상의 소진 기록 (§3.4)
  attempts: Record<string, number>        // episodeId → 시도 횟수 — DDA 세션 간 기억 (F10)
  checkpoints: Record<string, unknown>    // 장시간 미니게임 opaque 페이즈 스냅샷, 클리어 시 삭제 (F11)
  playedDayCount: number                  // "함께한 날 N일" — 경과일 아님 (F: 게임D low)
  lastPlayedDate: string                  // 'YYYY-MM-DD' (playedDayCount 증가 판정용)
  lastEpisode: string | null
}
```

- `settings`(gentleMode·reducedMotion·textScale)는 **SaveFile에 없다** — 기기 로컬로 분리(§3.3, F19).
- `SaveFileSchema`는 최상위 `.passthrough()`(미지 키 보존 = 전방 호환). `profile.name`: `z.string().max(12).transform(제어문자 제거)`.
- checksum: `crypto.subtle` SHA-256(game+ink 정규화 JSON). 불일치 시 UX는 §5.4 — 파싱이 성공하면 조용히 통과+진단 로그(아동에게 이지선다 노출 금지).

### 3.3 저장 위치 설계

| 데이터 | 위치 | 이유 |
|---|---|---|
| SaveFile (단일 슬롯) | IndexedDB `donghaeng`, key `save:current` | 용량·구조화. 슬롯 확장 대비 `save:slot:{n}` 네임스페이스 |
| 직전 백업 | key `save:backup` | 마이그레이션·가져오기 실패 원복 |
| **기기 설정** | localStorage `donghaeng-prefs` | `{gentleMode, reducedMotion, textScale}` — 여정 파일에 실려 이동 금지(F19). textScale은 `z.number().min(1).max(1.3)` 클램프, 경계 밖 값은 기본값 치환(거부 아닌 복원) |
| **코어 미러** | localStorage `donghaeng-core` | pagehide 동기 기록용 소량 필드(§5.3, F14). 수십 바이트 |
| 진단 로그 | IndexedDB key `diag:log` | 장면 진입/이탈 링버퍼(최대 500건) — SaveFile 밖, '진단 내보내기'로만 수거(F: 게임D medium). 원격 전송 없음 |
| 레거시 v0.1 | localStorage `donghaeng-save-v1` | 읽기 전용 **영구 보존**(30일 삭제 로직 제거 — F: 엔지 low) |
| 콘텐츠 | 정적 번들 (fetch + Zod parse) | 세이브와 완전 분리 |

### 3.4 보상 실체 · 콘텐츠 경제 (재미의 데이터 원장)

**(a) 보상 4레이어 — 신앙 전제 없는 실체.** 묵상문은 카드 상세의 '더 보기'로 접힌 선택 열람이다.

| 레이어 | 실체 | 발생 시점 |
|---|---|---|
| 즉시 연출 | 카드 획득 전용 모션 1.8초(세트별 색·사운드), 세트 완성 시 3.5초 확장 연출 | 획득 순간 |
| 이야기 | 카드 뒷면 한 줄 이야기 + 관련 bond 대사 1개 동시 해금 배지 | 획득 직후 허브 |
| 기능 | companion 카드 = skill hook 활성(아래 매트릭스) — 다음 에피소드가 실제로 쉬워짐 | 다음 플레이 |
| 코스메틱 | 세트 완성 보상: 스크랩북 스탬프·표지·와이드 일러스트·지도 스킨 | 세트 완성 |

**(b) 카드 경제 (v1 총 36장 / MVP 슬라이스 6장).**

| 세트 | 장수 | 주 획득 경로 | 세트 완성 보상 (코스메틱 실체) |
|---|---|---|---|
| twelve (열두 제자) | 12 | ep02–04 영입 + ep07·11 심화 | 와이드 일러스트 '열둘의 식탁' + 스크랩북 금장 표지 |
| witness (가족·선구자·증인) | 4 | ep01·02·12 | 타이틀 화면 '새벽' 테마 |
| healed (나은 사람들) | 8 | ep06 + 재방문 통찰 | 일러스트 '문전의 아침' + 치유 스탬프 |
| parable (비유 속 인물) | 6 | ep09 병렬 3편 각 2장 | 비네트 재생 극장 '이야기꾼의 밤' |
| encounter (길에서 만난 이들) | 6 | 허브 사이드·ep10 | 여정 지도 스킨 '길 위의 등불' |

**(c) 유대 포인트 경제 — 만렙 도달 가능성의 산술 증명 (F8).**
레벨 임계(누적): L2=2 · L3=4 · L4=7 · L5=10. 동료당 만렙 수요 **10pt**, 12동료 총수요 **120pt**.

| 공급원 | 획득 | 총 공급(12장 기준) |
|---|---|---|
| 에피소드 클리어 시 동반 동료(슬롯 2, 플레이어 선택) 각 +1 | 12ep × 2 | 24pt |
| 허브 신규 bond 대사 열람 +1 | 동료당 대사 7개(레벨 5 + 상황 반응 2) × 12 | 84pt |
| 통찰 목표 달성 시 관련 동료 +1 | 12ep × 3통찰 | 36pt |
| **합계** | | **144pt > 120pt** |

→ 전원 만렙은 산술적으로 가능하되 **허브 재방문과 통찰 재도전 없이는 불가능** — 재방문 동기가 경제에 내장된다. 페이싱 규칙: **"에피소드 클리어 1회당 새로 열람 가능해지는 허브 대사 ≥ 2개"** — `lint-content.mjs`가 클리어 시점 시뮬레이션으로 검사, 미달 시 빌드 경고(strict 에러). "허브에 갔는데 새 대사가 없는 날"을 콘텐츠 린트가 막는다.

**(d) 능력 훅 매트릭스 (12장 × 5동사) — "영입 후 최소 2개 장에서 유효" 규칙, CI 린트로 강제.**

| 장 | 동사 | 유효 훅 (동료: 효과 수치) |
|---|---|---|
| 1 | 추리 | bartholomew.wit: 협상 게이지 시작 +15% |
| 2 | 리듬 | simon.watch: 판정 창 +10% |
| 3 | 추리 | thomas.verify: 오답 1회 무효 |
| 4 | 물류 | matthew.ledger: 자원 잔량 상시 표시 · andrew.connector: 영입 선택지 힌트 1개 |
| 5 | 퍼즐 | john.poet: 비네트 추가 회상 +1 |
| 6 | 퍼즐 | philip.estimate: 구조물 하중 미리보기 1회 |
| 7 | 물류 | matthew.ledger · philip.estimate: 최적 동선 1회 표시 |
| 8 | 균형 | peter.bold-start: 시작 안정 게이지 +20% · mary.anchor: 재도전 시 관대 창 +10% |
| 9 | 추리(병렬 3편) | andrew.connector · thomas.verify |
| 10 | 리듬 | simon.watch · bartholomew.wit |
| 11 | 추리·균형 | thomas.verify · peter.bold-start · john.poet(ep12 예고 회상) |
| 12 | 비네트·퍼즐 | mary.anchor · john.poet |

검증: 플레이테스트에서 훅 보유/미보유 A/B — 보유군 평균 실패 횟수 −30%p 목표(예: ep08 1.2회→0.8회), 체감 인지율("능력이 도움됐다") ≥70% (§⑨ P-05).

**(e) 마이크로 보상 리듬 — 30~90초 계약.** 미니게임은 `reportMoment(episodeId, momentId, kind)`(§6.1)로 모멘트를 보고한다. 소진 정책은 kind별: `once`(GameSave.moments에 영구 기록 — 카드·첫 발견), `perSession`(세션 내 1회 — 콤보 연출), `onChange`(값 변화 시마다 — 게이지 돌파). ep08 예시 타임라인: 0:40 첫 파도 통과(perSession) → 1:30 베드로 대사 콜백(onChange) → 2:40 페이즈 1 클리어(once) → 4:00 rescue 비트 진입. `lint-content.mjs`가 에피소드 추정 길이 대비 모멘트 밀도(90초당 ≥1)를 검사한다.

**(f) 선택 콜백 규칙.** ink에서 write되는 전 변수는 최소 1회 read되어야 한다 — 빌드가 ink JSON의 변수 write/read 집합을 교차 검사, 읽히지 않는 flag는 CI 경고. `completeEpisode` 결과(점수·통찰)는 outro knot에 ink 전역 변수로 재주입되어 대사가 플레이 결과를 되비춘다(§6.4).

### 3.5 Zod 버전·파싱 정책 (F13 — M1 착수 전 확정)

**결정: zod ^3.24 유지.** `z.looseObject`(v4 API) 표기는 삭제하고 `.passthrough()`를 사용한다. v4 업그레이드는 영향 파일이 schema.ts 1곳으로 좁혀진 뒤 별도 태스크로 검토(부록 열린 질문).

| 계층 | 정책 | 근거 |
|---|---|---|
| SaveFile 최상위 | `.passthrough()` (미지 키 보존) | 전방 호환 — 신버전 세이브를 구버전 앱이 파괴하지 않음 (테스트 E-04) |
| GameSave 내부 값 | 타입·범위 검증 + 경계 밖은 기본값 치환 | 복원 우선 (textScale 등은 prefs로 분리됨) |
| 가져온 세이브의 id | **표시 시점** 화이트리스트 필터 + 저장은 보존 버킷 | "strict 파싱" 문구 폐기 — 렌더링되는 자유 텍스트는 profile.name뿐이며 React 텍스트 노드로만 출력 |
| 콘텐츠 매니페스트 | 기본 strict(미지 키 에러) | 저작 오타 조기 발견 |

---

## ④ 모듈/컴포넌트 구조

```
sowrd/
├─ content-src/                    # 저작 원본
│  ├─ ink/ (ep08.ink, hub.ink, review.json)   # review.json = InkReviewSchema (F5)
│  ├─ episodes/ep08.json …
│  ├─ characters.json / cards.json / bonds는 characters 내
│  └─ verses/                      # 개역개정 승인 본문 사본 (저작권 허락 후, §5.1 (4))
├─ scripts/
│  ├─ build-content.mjs            # ink 컴파일 + Zod 검증 + 감수 해시 게이트 + 매니페스트 생성
│  ├─ lint-content.mjs             # 재미 린트: 모멘트 밀도·bond 페이싱·훅 2장 규칙·flag 교차
│  └─ migrate-episodes.mts         # 일회성: episodes.ts → v2 JSON 이관 (F12)
├─ public/content/                 # 생성물: manifest.json + ink/*.ink.json
└─ src/
   ├─ content/  schema.ts · loader.ts (getEpisode/getCharacter/getCard, idAliases 해석)
   ├─ story/    inkRuntime.ts · useStory.ts    # 허브는 stateless 진입 + 외부 함수 (F8)
   ├─ save/
   │  ├─ types.ts                  # SaveFile/GameSave + Zod
   │  ├─ db.ts                     # idb-keyval 래퍼
   │  ├─ autosave.ts               # ★유일한 쓰기 소유자: store.subscribe → 조립 → 원자 쓰기 (F9)
   │  ├─ boot.ts                   # ★유일한 읽기 경로: 로드 → 마이그레이션 → hydrate (§5.2)
   │  ├─ migrations.ts             # 체인 + persist 엔벨로프 언래핑 + idAliases 적용
   │  ├─ transfer.ts               # 여정 코드 업/다운로드 + 파일 내보내기/가져오기 (F21·F23)
   │  └─ prefs.ts                  # donghaeng-prefs (기기 설정, F19)
   ├─ state/store.ts               # persist 미들웨어 제거 — 순수 create() (F9)
   ├─ screens/SettingsScreen.tsx   # 여정 옮기기 / 관대 모드 / 모션 줄이기 / 글자 크기 (F17)
   └─ App.tsx                      # boot 완료까지 스플래시, screen: 'settings' 추가
```

**정합 원칙:** ~~persist storage 교체~~ → **persist 완전 제거.** `storage.ts`는 만들지 않는다(구판의 이중 소유 구조 폐기). 미니게임은 세이브를 직접 만지지 않고 §6.1 계약만 사용. 미니게임 레지스트리는 `Record<minigameId, factory>` + 에피소드 → 게임 역조인(1:N — 한 게임을 여러 장이 재사용). `completeEpisode` 시그니처 변경에 따른 `WaterWalkGame`·`RewardScreen` 호출부 수정은 M1 작업 범위에 **명시**한다(은폐 금지 — F: 엔지 medium).

---

## ⑤ 핵심 플로우

### 5.1 콘텐츠 빌드 파이프라인 (`npm run content` — CI 필수 게이트)

```
(1) content-src/ink/*.ink → inkjs 컴파일러(노드 단일 의존)로 *.ink.json
(2) knot 목록·태그·변수 write/read 집합 추출
(3) Zod 파싱 + superRefine (G1~G6) + 감수 해시 게이트:
      · 항목별 정규화 SHA-256 계산 → review.approvedHash와 대조
      · 불일치 → 자동 needs-review 강등 (승인 후 수정 = 감수 무효화, F3)
      · ink 파일도 fileHash 대조 동일 적용 (F5)
    + sensitive 자동 검출 휴리스틱 (F: 신학 medium):
      · '# speaker:jesus' 태그가 있는 knot을 참조하는 장면에 'jesus-depiction' 누락 → 경고(strict: 에러)
      · ep12 vignette는 'passion' 자동 부여 후보로 표시
    + 논쟁 본문 레지스트리 대조(요 7:53–8:11, 막 16:9–20 등) → 사용 시 자동 needs-review (T8)
(4) 인용문 자동 대조: '# verse:' 태그 인용 블록 ↔ content-src/verses/ 승인 사본 diff (공통지침 4)
(5) lint-content.mjs: 모멘트 밀도·bond 페이싱(클리어당 ≥2)·훅 2장 규칙·flag 미사용 경고
(6) verseRef.display 파생 생성 → manifest.json 출력, contentVersion 증가
```

**감수 게이트 수위 (F4):**

| 조건 | MVP 첫 배포부터 | v1부터 |
|---|---|---|
| `sensitive`에 `jesus-depiction` 또는 `passion` 포함 & status ≠ approved | **빌드 실패 (하드 에러, 예외 없음)** | 동일 |
| 그 외 status ≠ approved | 경고 목록 출력 | `--strict-review`로 에러 승격 |
| approvedHash ≠ 현재 해시 | 자동 needs-review 강등 → 위 규칙 적용 | 동일 |

### 5.2 부트 시퀀스 (읽기 경로 단일화 + 시간 예산)

```
앱 시작 (스플래시 유지)
 ├─ 병렬: manifest fetch+parse  /  IndexedDB save:current 로드  /  donghaeng-prefs 로드
 ▼
save 없음? → localStorage 'donghaeng-save-v1' 확인
 │   있음 → 레거시 이전 (F15): persist 엔벨로프 {"state":{completed,companions,gentleMode},"version":0}
 │           을 언래핑 (version 미지정 = 0 기준). gentleMode는 prefs로, 나머지는 GameSave로.
 │           원본은 영구 보존. 실브라우저 덤프 픽스처로 테스트 (M-05)
 │   없음 → 새 여정 (프로필 입력 → createdAt = now)
 ▼
donghaeng-core 미러와 병합 (pagehide 유실분 복구, §5.3)
 ▼
schemaVersion < 최신 → save:backup 복사 → 마이그레이션 체인 (idAliases rename 포함) → 기록
 │   실패 → backup 원복 + 복구 모드 (데이터 절대 삭제 안 함)
 ▼
SaveFileSchema.parse(passthrough) → 스토어 hydrate → 타이틀 "이어하기 — {profile.name}의 여정"
```

skipHydration 우회 불필요 — persist가 없으므로 boot.ts가 명시적으로 초기 상태를 주입한다(구판 R2 해소).

**시간 예산 (F: UX low) — 목표 3초, 콜드 스타트 중급 안드로이드:**

| 단계 | 예산 |
|---|---|
| IDB open + get | 300ms |
| manifest fetch+parse (병렬) | 400ms |
| SaveFile parse + 미러 병합 | 150ms |
| hydrate + 첫 렌더 | 500ms |
| 여유(저가 기기 계수 ×2) | 합계 ≈ 2.7s < 3s |
| 마이그레이션 발생 부트 예외 | 5초 허용 + 스플래시에 "여정을 새 형식으로 옮기는 중…" |

### 5.3 자동 저장 (쓰기 경로 단일화 — F9·F14)

**쓰기 소유자는 `autosave.ts` 하나다.** `store.subscribe`로 변경을 감지해 SaveFile(game + ink 레지스트리 + checksum + updatedAt)을 **한 곳에서 조립**하고, 직렬화 큐(뮤텍스)로 `save:current`에 원자 쓰기한다. 이중 쓰기·checksum 어긋남·"손상" 오탐의 구조적 원인을 제거.

| 트리거 | 저장 범위 | 디바운스 |
|---|---|---|
| 에피소드 클리어 / 카드·동료·통찰 획득 | 전체 | 즉시 |
| **장면 완료 (`completeScene`)** | 전체 | 즉시 |
| ink 선택지 확정 / bond 포인트·설정 변경 | 전체 | 500ms |
| 장시간 게임 페이즈 체크포인트 (`saveCheckpoint`) | checkpoints만 병합 | 즉시 |
| `visibilitychange: hidden` / `pagehide` | **best-effort 비동기 플러시** + 코어 미러 동기 기록 | 즉시 |

- pagehide의 IndexedDB 쓰기는 **보장하지 않는다**(비동기 트랜잭션 — 커밋 전 프로세스 kill 가능). 대신 `completed/companions/cards/sceneProgress/insights`(수십 바이트)를 localStorage `donghaeng-core`에 **동기** 기록하고 다음 부트에서 병합한다. **허용 손실 창 = 마지막 장면 경계 이후의 미완료 진행**뿐.
- 1~3분 미니게임 내부 상태는 휘발. **판 3분 초과 게임은 페이즈 체크포인트 필수 계약**(§6.1) — opaque blob은 `checkpoints[episodeId]`에 보관, 클리어 시 삭제.

### 5.4 여정 이동·백업 (F21·F23 — 파일 관리 불필요가 기본)

```
[주력] 여정 코드: 기존 기기 "여정 옮기기" → SaveFile 업로드(익명, 계정 없음)
        → 8자 코드 + QR (72시간 유효 · 1회 사용 · 서버는 Cloudflare Workers KV)
        새 기기: 코드 입력/QR 스캔 → 다운로드 → 미리보기
        "민지의 여정: 8장까지 · 동료 5 · 함께한 날 12일 — 이 기기의 여정을 덮어씁니다" → 확인 → 복원
[백업] 익명 자동 백업 (옵트인, 주 1회, 디바이스 키 기반) — iOS 퇴거(R1)의 실질 안전망
[보험] 파일 내보내기/가져오기 — 설정 '고급'에 접힘. 오프라인에서도 항상 가능
프라이버시: 업로드 데이터의 자유 텍스트는 profile.name(≤12자)뿐. 성구 원문·개인정보 없음
```

가져오기 검증 순서: JSON.parse → format 확인 → schemaVersion(미래면 "앱 업데이트 안내") → parse(passthrough) → **미지 id는 unknownIds 버킷에 보존**(삭제 금지 — F22) → 미리보기+덮어쓰기 경고 → save:backup 후 복원. **settings는 병합에서 제외**(기기 값 유지 — F19). checksum 불일치는 파싱 성공 시 조용히 통과+진단 로그 — "그래도 계속할까요?" 이지선다를 아동에게 노출하지 않는다. 어느 단계 실패에도 기존 세이브 무변경.

세이브 공유(풀클리어 JSON 유통)는 게스트 우선 원칙상 막을 수 없음을 **의식적으로 수용**한다. '나눔' 동선은 세이브 파일이 아니라 **스크랩북 요약 이미지 공유**(카드 콜라주 PNG, 세이브 데이터 미포함)로 분리 설계한다(F: 게임D medium).

---

## ⑥ 타 시스템과의 인터페이스

### 6.1 스토어 액션

```ts
// 미니게임 계약
completeEpisode(id: string, result: { companions: string[]; cards: string[]; insights?: string[]; score?: number }): void
completeScene(episodeId: string, sceneIndex: number): void          // 장면 경계 저장 (F7)
reportMoment(episodeId: string, momentId: string,
             kind: 'once' | 'perSession' | 'onChange'): void        // 30~90초 리듬 계약 (§3.4e)
saveCheckpoint(episodeId: string, blob: unknown): void              // 판 3분 초과 게임 필수 (F11)
recordAttempt(episodeId: string): void                              // DDA 재료 (F10)

// 허브 (관계 시스템)
addBondPoint(characterId: string, source: 'episode' | 'hub-talk' | 'insight'): void
  // 레벨은 임계(2/4/7/10) 도달 시 자동 상승. characterId === JESUS_ID면 no-op + 개발 빌드 에러 (F2)
markKnotSeen(knotId: string): void                                  // 허브 드립피드 내구 추적 (F8)

// 내러티브
saveInkState(storyId: string, json: string): void                   // 에피소드 대화만 — 허브 호출 금지
```

**미니게임 플랜과의 구속 계약:** ① 판 길이 3분 초과 설계 시 페이즈 체크포인트 의무, ② 90초당 모멘트 ≥1 보고, ③ `selectGentleMode`·`selectActiveHooks`·`prefers-reduced-motion` 구독 의무, ④ 집중 미니게임 중 시각 토스트 금지(공통지침 6), ⑤ 배경 에셋은 세로(portrait) 규격.

### 6.2 셀렉터

```ts
selectResumePoint(s): { episodeId: string | null; sceneIndex: number; label: string }  // F7
selectEpisodeStates(s): Array<{ id; status: 'locked'|'open'|'done' }>   // unlock mode:'all'|'any' 평가
selectCollectionProgress(s): { owned; total; bySets }                    // 표시 시 unknownIds 제외, 데이터는 보존
selectActiveHooks(s): string[]
selectAvailableBondTalks(s, characterId): BondEntry[]   // requires·cooldown·seenKnots 평가 — 허브 배지 수의 근거
selectAttempts(s, episodeId): number                    // 미니게임 DDA 소비
selectGentleMode(s): boolean                            // prefs에서 — 정의: 타이밍 창 +40%·실패 무페널티 (수위 조절 아님)
selectMotionReduced(s): boolean                         // = OS prefers-reduced-motion ∨ 저장값 (보수적인 쪽, F17)
```

### 6.3 이벤트

| 이벤트 | 페이로드 | 소비자 |
|---|---|---|
| `save:committed` | `{ at }` | 설정 화면 "마지막 저장"만 (상시 인디케이터 없음) |
| `save:migrated` / `save:corrupt` | `{from,to}` / `{reason}` | 진단 로그 / 복구 다이얼로그(3출구) |
| `content:renamed` | `{ aliases }` | 부트 시 세이브 id rename 적용 로그 |
| `diag:scene` | `{ t, ev, ep, scene }` | `diag:log` 링버퍼 — 이탈 지점·세션 길이·재시도 계측(북극성 지표 근사) |

### 6.4 ink 런타임 계약

- 태그: `# speaker:` `# mood:` `# scene:` `# verse:`(인용 diff 대상). 파싱은 `inkRuntime.ts` 전담.
- 외부 함수(**읽기 전용**): `hasCompanion(id)`, `bondLevel(id)`, `hasInsight(ep,id)`, `seenKnot(id)`, `attempts(ep)`. ink에서 상태 변경 금지 — 단방향 유지.
- **결과 재주입:** `completeEpisode` 직후 outro knot 진입 시 `mg_score`, `mg_insights` 전역 변수를 주입해 대사가 플레이 결과에 반응한다(읽히지 않으면 flag 린트 경고).
- 허브(hub.ink)는 매 방문 새 Story로 stateless 진입 — state 저장 없음, seen 여부는 외부 함수로 조회(F8). ink state 저장은 에피소드 대화 한정 — R3의 폴백 논리가 성립하는 범위로 축소.

---

## ⑦ UI 디자인 토큰 적용

**규칙: 신규 hex·유령 토큰명 금지. `src/styles/global.css`가 유일한 진실.** 신규 토큰은 명명 규칙에 따라 global.css에 추가 후 사용(이 플랜에서 `--ink-on-light` 1건 신설).

| 토큰 (실코드 명) | 값 | 쓰임 | 대비 실측 (배경 대비) |
|---|---|---|---|
| `--ground` | `#0B1020` | 설정 화면·다이얼로그 배경 | — |
| `--parchment` | `#EDE3CE` | 본문 텍스트, 여정 요약 카드 | 14.8:1 /--ground (기준 4.5:1 통과) |
| `--ink` | `#ECE7DA` | 기능 텍스트 | 15.3:1 /--ground 통과 |
| `--lamp` | `#F0B24A` | "이어하기" 주 버튼, 성공 확인(+체크 아이콘) | 10.0:1 /--ground 통과 · 버튼 위 텍스트 `#20160A` 9.4:1 통과 |
| `--dawn` | `#E98A6B` | 경고(+깨진 종이 아이콘+문구 — 색 단독 금지) | 7.5:1 /--ground 통과 |
| `--muted` | `#9AA3BD` | 보조 설명 | 7.5:1 /--ground 통과 |
| `--ink-on-light` **(신설)** | `#2A2317` | 양피지(`--parchment`) 카드 위 다크 텍스트 | 12.2:1 /--parchment 통과 |
| `--serif` | `'Noto Serif KR'…` | 여정 감정 문구("함께한 날 12일"), 성구 | — |
| `--sans` | `'Noto Sans KR'…` | 버튼·설명·오류 | — |

비텍스트 3:1: 포커스 링 `--lamp`/`--ground` 10.0:1 통과.

**이중 부호화 (F: UX medium — 타 플랜과 동일 문구):** 경고 = `--dawn` + 아이콘(깨진 종이) + 문구 / 성공 = `--lamp` + 체크 아이콘 + 문구. 색만으로 정보 전달 금지.

**SettingsScreen 확정 범위 (F17):** 여정 옮기기(코드·QR) / 고급: 파일 내보내기·가져오기·진단 내보내기 / 관대 모드 토글(정의: 타이밍 창 +40%, 실패 무페널티) / **모션 줄이기 토글**(기본값 = `matchMedia('prefers-reduced-motion')`, 적용 규칙 = OS ∨ 저장값 중 보수적인 쪽) / **글자 크기 3단계**(100/115/130%). 하단 엄지 존, 터치 타깃 ≥44pt(`--touch`).

**접근성 (F: UX medium):** 복구·덮어쓰기 다이얼로그는 `role="alertdialog"` + 포커스 트랩 + 각 출구 버튼에 결과를 설명하는 접근 가능한 이름("백업에서 복원 — 어제 저장 상태로 돌아갑니다"). 저장 실패 고지는 `aria-live="polite"`. 복구 다이얼로그는 항상 3출구(백업 복원/코드·파일 가져오기/새로 시작), 파괴적 확정 전 재확인, 플레이어 탓 문구 금지. reduced-motion 시 전 연출 정적 폴백(global.css 전역 규칙 유지).

---

## ⑧ MVP → v1 단계별 로드맵

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **M0. 기반 (선행)** | git init + vitest 셋업(공통지침 7) · Zod 3.24 유지 확정(§3.5) · **대한성서공회 개역개정 사용 허락 절차 개시**(공통지침 4 — M1 이전 착수, 허락 전 인용 블록은 verses/ 미등록 상태로 빌드 경고) | CI에서 `npm test` + `npm run content` 게이트 동작 |
| **M1. 세이브 코어** | persist 제거 → autosave 단일 쓰기 + boot 단일 읽기, idb, 레거시 이전(엔벨로프 언래핑+실덤프 픽스처), 코어 미러, prefs 분리, **completeEpisode 시그니처 변경에 따른 WaterWalkGame·RewardScreen 호출부 수정 포함** | v0.1 세이브 무손실 이전, S2·S3 통과, 이중 쓰기 없음 검증 |
| **M2. 스키마 v2 + 이관** | schema.ts v2(가드 G1~G6), `migrate-episodes.mts` 일회성 이관, loader, lint-content | ep01–12 v2 JSON 이관 왕복 검증(M-01), 신학 게이트 테스트 전부 통과, CI 게이트 가동 |
| **M3. ink 파이프라인** | 컴파일+knot·해시·sensitive 휴리스틱 검증, inkRuntime, 허브 stateless 계약, ep08 대사 ink화 | S6 통과, jesus-depiction 미감수 시 빌드 실패 재현(S-10) |
| **M4. 여정 이동·백업** | `transfer.ts`: 여정 코드(Workers KV)+QR, 익명 자동 백업 옵트인, 파일 경로(보험) — **착수 조건: 플레이 가능 콘텐츠 3장 이상 가동 후**(F: 비신자 medium — "차 사기 전 차고 정리" 방지) | S4 통과(코드 방식), 손상 파일 5종이 기존 세이브 무변경 |
| **M5. 마이그레이션 체인** | migrations.ts + idAliases rename 적용 + v1→v2 실전 1개 | 구세이브 픽스처 3종 오픈, 실패 시 backup 원복, rename 픽스처 통과 |
| **v1 준비** | 다중 슬롯 UI(프로필 자리는 이미 예약), 12장 전체 이관, --strict-review 전면화, devotions 실장, 감수 대시보드 | 12장 파이프라인 통과 + knot 단위 감수 목록 산출 |

**Capacitor 전환 확정 트리거 (F21):** MVP 공개 후 ① iOS 접속 비중 20% 초과 **또는** ② 저장 퇴거로 추정되는 세이브 유실 보고 1건 — 둘 중 하나 발생 시 차기 마일스톤에 Capacitor Filesystem 전환을 **즉시 편입**한다. "언젠가"가 아니라 조건부 확정이다.

---

## ⑨ 테스트 계획

### 단위 — 스키마·신학 게이트 (S)
- S-01 정상 ep08 v2 메타 parse 성공
- S-02 `verseRef.book:'도마복음'` 거부 · S-03 `마가복음 17장`(장 수 초과) 거부, display 파생 생성 확인
- S-04 **예수님 카드 저작 시도**(`card.characterId:'jesus'`) → G3 에러 (F1)
- S-05 `jesus`를 `kind:'companion'`으로 등록 → G1 에러 · S-06 holy에 bonds/skill 부여 → G2 에러 (F2)
- S-07 parable-figure 카드가 set≠parable → G4 에러 · S-08 rewards.companions에 adversary → G5 에러
- S-09 approved 항목의 본문 1자 수정 → 해시 불일치 → needs-review 강등 (F3)
- S-10 jesus-depiction & status≠approved → 빌드 실패 (F4) · S-11 unlock 순환 → 에러 · S-12 unlock mode:'any' 평가

### 단위 — 이관·마이그레이션 (M)
- M-01 `migrate-episodes.mts` 왕복: episodes.ts 12항목 → v2 JSON → 의미 동등성 검증 (구 테스트 #6 대체, F12)
- M-02 v1→v2 세이브: 신 필드 기본값 생성, 기존 값 보존 · M-03 마이그레이션 중 예외 → save:current 무변경+backup 존재
- M-04 미래 schemaVersion → 마이그레이션 시도 안 함 + 업데이트 안내 경로
- M-05 **실브라우저 덤프 픽스처**의 persist 엔벨로프(`{"state":…,"version":0}`) 언래핑 → gentleMode는 prefs로, 진행은 GameSave로 (F15)
- M-06 idAliases rename: 개명된 카드 id를 가진 세이브 → 신 id로 이관, 손실 0 (F22)

### 단위 — 저장 경로·이동 (E)
- E-01 내보내기→가져오기 왕복 deep-equal · E-02 format 불일치/JSON 오류 → 거부, 기존 세이브 무변경
- E-03 checksum 불일치 + 파싱 성공 → 조용히 통과 + 진단 로그 (이지선다 미노출)
- E-04 미지 필드 포함 세이브 → passthrough 왕복 보존 (F13)
- E-05 **매니페스트 부재 카드 id** → unknownIds 보존 → 매니페스트 재등장 시 자동 복원 (F22)
- E-06 가져오기 시 settings 병합 제외 — 기기 prefs 불변 (F19) · E-07 여정 코드 만료·재사용 거부 경로
- E-08 autosave 직렬화 큐: 연속 트리거 5건 → 쓰기 순서 보존·최종 상태 일치 (이중 쓰기 부재 검증, F9)

### 단위 — ink (K)
- K-01 진행→ToJson→복원→동일 선택지 · K-02 부재 knot → 명시적 에러 · K-03 허브 stateless: 재진입 시 seenKnots 외부 함수로 기수 대사 스킵 (F8) · K-04 flag 린트: write-only 변수 → 경고

### 통합 (I)
- I-01 부트: hydrate → `selectResumePoint`가 `{episodeId, sceneIndex}` 정확 (F7)
- I-02 장면 2 완료 후 강제 리로드 → 장면 3부터 재개 (미니게임 재플레이 강요 없음)
- I-03 pagehide 코어 미러 → IDB 커밋 실패 시뮬레이션 → 부트 병합으로 completed 복구 (F14)
- I-04 3분 초과 게임 checkpoint → 리로드 → 페이즈 복원, 클리어 시 blob 삭제 (F11)
- I-05 고의로 깨진 inkKnot/미감수 jesus-depiction → CI 비정상 종료 · I-06 스트레스: **허브 대사 500회 방문 + 12동료 만렙 + seenKnots 1,000건** 프로파일에서 저장·로드 1초 이내 (구 "200 에피소드" 대체) · I-07 오프라인 PWA 전 사이클
- A-01 reducedMotion(저장 or OS) 시 스플래시·다이얼로그 전환 애니메이션 정지 · A-02 textScale 130%에서 복구 다이얼로그 3버튼 겹침·잘림 없음 · A-03 복구 다이얼로그 스크린리더 통과(alertdialog·포커스 트랩·출구 낭독) (F17)

### 플레이테스트 합격 기준 (P)
- P-01 콜드 스타트→이어하기 3초 이내 (중급 안드로이드, §5.2 예산표로 단계 진단)
- P-02 **폰 교체 완수율**: 성인 5인 여정 코드 방식 무안내 완수 5/5 (구 #26 대체, F23)
- P-03 **65세 이상 2인** 동일 과업 완수 (실패 시 관찰 기록 → 개선 반영, F18) · 10세는 이어하기(S2) 무안내 성공만 측정
- P-04 세이브 손상 주입 → 복구 3출구로 복원 성공 + 불안·죄책감 표현 없음 + 스크린리더 1회 통과
- P-05 **재미 지표** (공통지침 5): 재미 5점 척도 ≥3.8 · 추천 의향 ≥60% · 수집 욕구("다음 카드가 궁금하다") ≥70% · **비신자 게이머 쿼터 최소 2~3인** · 훅 보유/미보유 A/B: 실패 −30%p·체감 인지율 ≥70%(§3.4d)
- P-06 허브 재방문 2일 연속 신규 대사 존재 (bond 페이싱 린트의 실기기 확인)

---

## ⑩ 신학 체크포인트

| # | 항목 | 처리 |
|---|---|---|
| T1 | **verseRef 정경+장 실재 강제** — 책 이름·장 수 상한·display 파생까지 기계 검증 | 기계적 차단 (S-02·03) |
| T2 | **예수님 데이터 격리** — id 고정(`jesus`)·holy 필수·카드화 금지·bonds/skill 금지·수집 보상 금지, 런타임 액션 이중 방어 | 기계적 차단 (G1~G3·G5, S-04~06) + 등장 장면은 T6 감수 |
| T3 | **카드 story 문구** — 본문 이탈 해석 여부, 특히 parable 세트 요약 문구 | 감수 (해시 게이트 상시) |
| T4 | **ink 대사 knot 단위 감수** — 파일 해시+knot별 review를 매니페스트에 편입, `--review-report`가 knot 단위 미감수 목록 산출. 분기 선택지의 교리적 정답/오답 구도·적대자 동기 묘사 점검 | 데이터화 완료 (F5) + 감수 |
| T5 | **수난(ep12) 수위** — vignette `fx`(textIntensity·sound·visual)가 감수 가능한 데이터로 노출. 전 연령 단일 기준 — gentleMode(난이도 완화)와 무관함을 명시 | 감수 (passion 태그 = 상시 하드 게이트) |
| T6 | **감수 게이트** — jesus-depiction·passion은 **MVP 첫 배포부터** approved 아니면 빌드 실패. 나머지는 경고→v1 strict 에러. 승인 후 수정 시 해시 불일치로 자동 강등. 감수 주체: 통합측 목회자 2인 이상, 반려→수정→재검 절차는 review.notes에 기록 | 파이프라인 상설 (F3·F4) |
| T7 | **내보내기 파일** — 성구 원문 미포함(id 참조만). checksum은 '진단 보조'로 정정 — 변조 방지 주장 삭제. 실방어 = 렌더링 자유 텍스트 없음(profile.name만, 텍스트 노드 렌더) | 설계로 해결 (정직한 서술로 정정) |
| T8 | **본문비평 논쟁 구절 정책** — 요 7:53–8:11, 막 16:9–20 등 범위를 데이터로 등록, 사용 시 자동 needs-review + 감수 협의 필수 | 파이프라인 (5.1 (3)) |
| T9 | **개역개정 저작권** — 대한성서공회 사용 허락을 M0 선행 과제로. 인용 블록 ↔ 승인 사본 자동 diff | 절차 + 파이프라인 (5.1 (4)) |
| T10 | **sensitive 누락 방지** — `# speaker:jesus` 스캔 휴리스틱으로 태그 누락 검출 (사람의 성실성 의존 제거) | 기계적 보조 (5.1 (3)) |

감수 산출물: `npm run content -- --review-report` → 에피소드·knot·민감 태그별 미감수 목록 + 해시 강등 이력.

---

## ⑪ 리스크와 완화책

| # | 리스크 | 영향 | 완화 |
|---|---|---|---|
| R1 | **iOS Safari IndexedDB 퇴거** (7일 미사용) | 세이브 유실 = 신뢰 붕괴 | **실질 대책 3중화 (F21):** ① 익명 자동 백업(옵트인, 주 1회, 여정 코드 채널 — M4) ② `navigator.storage.persist()` + PWA 설치 유도 ③ Capacitor 전환 조건부 확정 트리거(§8 — iOS 20% 또는 사고 1건). "내보내기 소개"는 대책 목록에서 제외 |
| R2 | 부트 경합 | 이어하기 오표시 | persist 제거로 구조적 해소 — boot.ts 완료 전 스플래시, 명시적 hydrate (§5.2) |
| R3 | ink state ↔ 콘텐츠 버전 불일치 | 대화 재개 실패 | 에피소드 단위 저장 + 복원 실패 시 해당 장면 시작 폴백(sceneProgress로 손실 최소) + 클리어분 정리. **허브는 stateless라 이 리스크 자체가 없음** (F8 — 구판의 최대 노출면 제거) |
| R4 | 스키마 조기 고착 vs 콘텐츠 변화 | 반복 마이그레이션 | 콘텐츠 스키마는 빌드 산물이라 마이그레이션 불요. 리텐션 관련 필드(bond 조건·devotions·checkpoints)는 **v2에 자리를 선확보**해 세이브 마이그레이션 비용 예방 |
| R5 | 마이그레이션 회귀 | 구세이브 파손 | 버전별 픽스처 영구 보관(실덤프 포함), CI 전 버전→최신 상시 실행 |
| R6 | ink 컴파일 의존성 | CI 빌드 실패 | inkjs JS 컴파일러 1순위(노드 단일 의존), 불충분 시에만 inklecate 동봉 |
| R7 | 가져오기 악성/변조 데이터 | XSS·상태 오염 | 렌더링 자유 텍스트는 `profile.name`뿐(≤12자·제어문자 제거·React 텍스트 노드 렌더). 표시 시 id 화이트리스트 필터(**저장은 보존** — F22와 양립). 수치는 범위 클램프. ~~strict 파싱~~ 문구 삭제 (F13) |
| R8 | 용량 증가 | 모바일 저장 압박 | 클리어 에피소드 ink state 정리 + 허브 stateless로 단조 증가 축 제거(구판 R8의 미해결 절반 해소). seenKnots는 문자열 배열이라 1,000건 ≈ 30KB 수준 — I-06으로 실측 |
| R9 | **세이브 공유로 수집 가치 희석** | 세트 도파민 약화 | 기술적 차단 불가(게스트 우선) — 의식적 수용 + 나눔 동선을 요약 이미지로 분리 + 덮어쓰기 경고 (§5.4) |
| R10 | **여정 코드 서버 의존** (신규) | 서버 다운 시 이동 불가 | 파일 내보내기가 오프라인 폴백으로 상존. 서버는 KV 단일 기능·무상태라 유지비 최소. 코드 72시간 만료로 데이터 잔존 최소화 |

---

## 부록: 열린 질문 (다음 리뷰에서 결정)

1. Zod 4 업그레이드 시점 — schema.ts로 영향이 좁혀진 M2 완료 후 별도 태스크로 재평가.
2. `insights` id 체계 최종 표기(`ep08:no-look` 형식) — 미니게임 플랜과 합의.
3. bond `requires` 조건의 추가 어휘(특정 선택지 flag 참조 등) — 내러티브 플랜과 계약 확정. 단 **필드 자리는 v2에 이미 확보**되어 마이그레이션 비용 없음.
4. 여정 코드 서버의 리전·보존 정책(72시간 기본) 및 자동 백업 주기의 사용자 노출 문구.
5. 65세+ 플레이테스트에서 여정 코드도 실패할 경우의 차선(기기 근접 공유 — Web Share API) 검토.
