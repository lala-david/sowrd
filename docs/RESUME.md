# THE WAY — 재개 문서 (RESUME) · 2026-07-23 작성

> **이 문서 하나로 정확히 이어서 작업한다.** 오늘 세션에서 단일 "예수 사역 러닝"에서 → **다중 성경 여정 + 실제 순례길 + 실거리 러닝 + 게임형 진행 + 신앙 공동체(중보)** 플랫폼으로 재설계하고, 데이터·연구·기획·첫 아트까지 확보한 상태. 전체 기획은 [`MASTERPLAN.md`](MASTERPLAN.md), 빌드 스펙은 [`research/BUILD-SPECS.md`](research/BUILD-SPECS.md).

---

## 0. 프로젝트 한 줄
내가 **실제로 달린 거리**만큼 성경 인물의 **실제 여정(실좌표·실측 km)**이 이어지고, 도착한 자리에서 **말씀을 읽고**, 여럿이 **함께 달리며 서로를 위해 중보**하는 글로벌 기독교 GPS **러닝**(걷기 아님 우선) 앱. 신학=**장로교 통합(PCK)**, 팔레트=따뜻한 순례길(스트라바 네온 금지).

## 1. 앱 실행 방법 (중요 — 트랩 있음)
- 앱 위치: `C:\Users\User\Desktop\sj\app\sowrd` (React19+Vite6+TS+Tailwind v4+Zustand). `npm run dev`.
- **트랩:** 브라우저(claude-in-chrome 확장)는 `localhost:5173` 오리진에만 접근 권한이 있고, 그 오리진은 **다른 앱 "Lycaon"의 캐시/DevTools Local Overrides**가 가로챌 수 있음. 5173에 우리 vite가 IPv4/IPv6 양쪽(`--host`)으로 떠야 하고, 브라우저가 여전히 Lycaon을 보이면 **F12 → Sources → Overrides "Enable Local Overrides" 해제** 또는 목/리다이렉트 확장 끄기. 서버 정상 확인: `curl -s localhost:5173 | grep title` → `THE WAY`.
- 육안검증은 새 탭 + 캐시버스트로. `tsc --noEmit`은 통과 상태.

## 2. 지금까지 완료 (파일 단위)
### 데이터 (`src/data/geo/`) — **핵심 자산, 절대 유실 금지**
- `journeys/abraham.json` (10 에피소드, 3,490km), `exodus.json` (16, 1,060km — 르비딤/아말렉/시내산 포함), `paul.json` (28, 9,980km — 1·2·3차+로마항해), `peter.json` (14, 3,673km — biblical/tradition 구분).
  - 각 에피소드: `place/placeLatin/region/lat/lng/cumulativeKm/segmentKm/event/passageRef(개역개정 장절)/verseKrShort/reflection/prayer/feel`. + `tiers`(등급 분할) + `theologyNote`(PCK).
- `jesus-journey.json` — 37자리 실좌표 + 사역 경로 폴리라인(누적 ~3,020km). (예수는 기존 `src/data/journey.ts`가 러닝 기제 구동)
- `pilgrim-trails.json` — 실제 순례길 6종(예수트레일65·복음트레일62·카미노프랑세스780·비아프란치제나1900·비아돌로로사14처·성바울트레일500). **TODO: 카미노 변형(북부길·포르투갈길) 추가 — 사용자 요청.**
- `journeys/index.ts` — 통합 타입(`Journey/JourneyEpisode/JourneyTier`) + `JOURNEYS`(아브라함·출애굽·바울·베드로) + `journeyById`·`journeyProgress(km)`·`tierOfEpisode`·`JOURNEY_CHROME`(씬/색/히어로 매핑). **tsc 통과.**

### 상태/스토어
- `src/state/pilgrim.ts` — **관리자 모드 추가**: `admin:boolean` + `setAdmin` + `reachedStations(s)` + `isUnlocked(s,id)`(admin이면 전부 열림). 실데이터 미변경 오버레이 방식.

### 아트 (`src/assets/art/`)
- 기존 Recraft 6종(hero) + **신규 `scenes/sea-galilee.webp`**(recraftv4_1, 갈릴리 골든아워 — 스타일 기준점).

### 시작만 해둔 것 (미완/미배선)
- `src/lib/shareCard.ts` — Canvas PNG 공유카드 렌더러(자리·성구·거리만, GPS/기도 제외). **아직 Reveal에 미배선.**
- `src/data/seasons.ts` — 예수 arc 7파트 시즌 메타(초기 버전, 다중여정 모델로 일반화 필요).

### 문서 (`docs/`)
- `MASTERPLAN.md`(전체 기획) · `research/BUILD-SPECS.md`(recraft 스타일 스캐폴드·아이콘28·햅틱·사운드스케이프) · `STATUS.md`(S1) · `ARCHITECTURE.md` 등.

## 3. 연구 결과 요약 (에이전트 7종 — 결론만; 상세는 대화이력/문서)
- **경쟁사 격파(P0):** ①실거리×실제성경지도=코어루프 ②중보기도 엔진 "○○를 위해 달립니다"(리텐션·바이럴 해자) ③성구 오디오 가이드런. P1: 오디오퍼스트 런화면·카라반(공동목표 협력)·수집유물·전례력 시즌.
- **SNS/스티커:** 공유카드 6종 + 스티커팩 18종 + 커뮤니티 초대. 프라이버시=실좌표/경로/기도 절대 미노출. 포지셔닝 "Walk the Gospels, one real run at a time".
- **몰입/현존:** 지역별 사운드스케이프 6종 + 햅틱 어휘(arrival `[300,120,300,120,500]` 등) + 내레이션(침묵 기본·임계에서만) — `BUILD-SPECS.md` C절.
- **아이콘 시스템:** 28 UI글리프 + 여정문장 5 + 지역씬 8, mono-line 1.75px round, sun-gold 투톤은 '빛/도달'에만. recraft 스타일 스캐폴드 확정(`BUILD-SPECS.md` A절). iconify 폴백: Phosphor/Solar/Lucide.
- **실거리 백엔드:** 자가호스팅 GraphHopper `round_trip`(루프코스) + Open-Elevation + MapLibre/Protomaps. 프라이버시=집주변 난독화.

## 4. MCP 상태
- **context7 ✅** · **iconify ✅** · **recraft ✅**(recraftv4_1로 생성 검증, **크레딧 10,000**) · **shadcn** = `components.json` 필요 + 손수제작 디자인에 부적합 → 저활용.
- ⚠️ **recraft `create_style` 서버 500 에러** 발생 → 지금은 **스타일 스캐폴드 프롬프트**(BUILD-SPECS A)로 일관성 유지. **재개 시 create_style 재시도**(`sea-galilee.webp`의 recraft URL 또는 재업로드로 style_id 락 → 이후 전 생성에 input_style_id 적용).
- recraft API 키(사용자 채팅 노출) → **재발급 권장**. MCP는 OAuth라 키 불필요.

## 5. ▶️ 다음 할 일 (정확한 순서 + 이유)
> 원칙: 돌아가는 것 먼저. 각 단계 끝에 `tsc --noEmit` + `vite build`.

1. **recraft 아트 배치 생성** — 지역 씬 8종(요단강·시내광야·바다✅·산·예루살렘성벽·새벽빈무덤·지평선길·들판마을) + 여정 문장 5종(아브라함·출애굽·예수·바울·베드로) + UI아이콘 세트 + 스티커. *이유: 게임 지도·여정선택·리빌·스티커의 시각 자산. recraftv4_1 + 스캐폴드, 각 이미지 curl 다운로드해 `src/assets/art/scenes|crests|icons|stickers/`. **주의: b64 프리뷰가 컨텍스트를 채우니 소량씩 생성·다운로드.***
   - 프롬프트 원본: `BUILD-SPECS.md` A절(스캐폴드) + 아이콘 에이전트의 `regionMotifs`/`journeyCrests`(대화이력).
2. **게임형 수집/에피소드 UI 재작성** (`src/screens/Collection.tsx` 전면 교체) — *이유: 사용자 최우선 요청 "파트별로 게임처럼, 첫 페이지에 다 몰지 말 것."*
   - 2단 구조: **여정 선택(5개 여정 카드, 지도/월드맵 느낌)** → **여정 상세(등급/파트별 에피소드 스탬프, 지역 씬 배경)** → 스탬프 탭 = 에피소드 상세(말씀 읽기).
   - `journeys/index.ts` + `isUnlocked`(admin 전체해금) + `JOURNEY_CHROME` 사용. 지역 씬 SVG/webp 배경. 잠금/해금/완성 상태, 진행 링, 로마숫자 파트.
   - 예수는 기존 `journey.ts`/STATIONS로 별도 처리하거나 동일 UI에 어댑터.
3. **도착 리빌(말씀 읽기)** — 에피소드 도달 시 성구(passageRef)·묵상·기도·"느낌" 표시. 기존 `Reveal.tsx`/`Detail.tsx` 참고.
4. **중보기도** — 런 헌정("○○를 위해 달립니다") + 함께 걷기 + 중보 피드(로컬 우선). *이유: 리텐션/바이럴 해자.*
5. **공유카드 실동작** — `shareCard.ts`를 Reveal에 배선(Canvas PNG export). 스티커 오버레이 에디터.
6. **오디오 가이드런 + 햅틱** — `run.ts`에 햅틱 어휘(BUILD-SPECS C) 적용, 사운드스케이프(Web Audio) 스켈레톤.
7. **실 GPS 연동** — `run.ts`의 시뮬 tick → geolocation watchPosition(haversine). 실 순례길 모드(카미노 등, `pilgrim-trails.json`).
8. **런닝 중심 재조정** — 걷기(Reflection Walk) 축소, 러닝 우선.
9. **전례력 시즌·온보딩·저널·친절한 코호트** (P1/P2).
10. **최종 검증 페르소나 에이전트** — 신학(PCK 이단성)·데이터 정합(km/좌표/성구)·UX 플로우·접근성·프라이버시·빌드(tsc+vite) 전수 점검 리포트. *사용자 명시 요청: "검증용 페르소나로 마지막 돌리고."*

## 6. 사용자 확정 사항 (지켜야 함)
- 지도 데이터 = **둘 다**(성지 여정 지리 + 실제 러닝 라우팅).
- recraft = **핵심 넉넉히 생성**(10k 크레딧, 좋은 모델 recraftv4_1/pro).
- **관리자 모드로 전체 해금** 상태로 개발.
- **런닝 중심**, 게임처럼, 스트라바색 지양, 마을·물·산 실제감.
- 예수·바울·베드로 특히 신경.
- 실제 "거기서 달렸다"는 **몰입/현존** 경험(휴먼 인터페이스) 중요.
- **아이콘 허접 금지** — recraft/iconify로 제대로.
- SNS 인스타·스레드 홍보(사진+스티커) 매우 중요. 중보기도 중요.
- MCP 4종 실제로 활용.

## 7. 열린 이슈
- recraft create_style 500 → 재시도 필요.
- shadcn 저활용 결정(디자인 부적합).
- 카미노 스페인 변형 트레일 추가(사용자 요청).
- 다중여정과 기존 예수 `journey.ts` 통합 방식(어댑터 vs 이관) 결정.
