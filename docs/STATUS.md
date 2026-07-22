# 프로젝트 현황 — PROJECT THE WAY

> 최종 갱신: 2026-07-22
> 현재 단계: **개발 — S1 데이터 구동 앱 동작.** 디자인을 C안(따뜻한 순례길)으로 전환하고, 하드코딩 프로토타입(S0)을 **데이터에서 렌더되는 앱**으로 재작업. 7화면(홈·코스선택·Setup·러닝/THE LAMP·리빌·수집/여권·프로필), 37 스테이션 + 7 거리별 코스(1·3·5·10·21·42·50km), 영속 스토어(zustand+persist), 시뮬레이션 러닝 엔진, 커스텀 SVG 아이콘 세트, Recraft 아트 6종(얼굴 없는 뒷모습·1세기 근동). NRC 벤치마킹(거대 거리 숫자·스플릿·요약) 반영. `tsc --noEmit` + `vite build` 통과. 상세 구조는 [`ARCHITECTURE.md`](ARCHITECTURE.md).

이 문서는 프로젝트의 현재 위치, 지금까지 확정된 결정, 남은 과제를 한눈에 보는 인덱스다. 세부 내용은 각 문서를 참조한다.

---

## 1. 한 줄 정의

> 내가 달린 거리만큼 예수님의 사역 여정이 이어지고, 누군가를 위한 기도가 공동체 안에 쌓이는 **글로벌 기독교 GPS 러닝 앱**.

- **가칭:** PROJECT THE WAY *(상표권·앱스토어 중복 확인 후 확정)*
- **슬로건:** Run the Way. Walk with the Gospel. / 달리며 따라가는 예수님의 길
- **분류:** React + PWA 모바일 앱 (신앙생활 보조 도구 — 예배·성경·교회를 대체하지 않음)

---

## 2. 문서 지도

| 문서 | 다루는 내용 | 상태 |
|---|---|---|
| [`README.md`](../README.md) | 프로젝트 개요, 차별점, 지켜야 할 선, 로드맵 요약 | ✅ |
| [`docs/PLANNING.md`](PLANNING.md) | **전체 기획서 17장** — 서비스 정의, 신학 기준, 공생애 타임라인 9시즌, 개인·공동체 모드, 러닝 중 콘텐츠, 게임화 원칙, 글로벌 전략, 개인정보·안전, MVP, 단계별 확장, 수익 모델, 운영 조직, KPI | ✅ |
| [`docs/DESIGN-TOOLING.md`](DESIGN-TOOLING.md) | 디자인/UI/이미지·아이콘 MCP 20여종 조사 + 추천 스택 | ✅ |
| [`docs/ART-DIRECTION.md`](ART-DIRECTION.md) | Nike풍 미니멀 애슬레틱 아트 방향, 프롬프트 템플릿, 일관성 워크플로 | ✅ |
| [`docs/DESIGN-PHILOSOPHY.md`](DESIGN-PHILOSOPHY.md) | **디자인 철학** — "빛이 이긴 길"(라이트), 7원칙, AI-slop 금지 목록, 토큰. 모든 화면 심사 기준 | ✅ |
| [`docs/DESIGN-DETAILS.md`](DESIGN-DETAILS.md) | 세부 디자인 리서치 — "The Illuminated Path"(채색 필사본) 시그니처(라피스 여정 라인·Versal·일루미네이션), 팔레트·타이포·그레인 세부 | ✅ |
| [`docs/DESIGN-HANDOFF.md`](DESIGN-HANDOFF.md) | **디자인 재작업 핸드오프** — 코드 baseline → Pencil(.pen) 전면 재작업 준비물: 토큰→변수(Light/Dark), 시그니처 4요소, 화면·컴포넌트 인벤토리, 연결 절차 | ✅ |
| [`docs/GLOBAL-MARKET.md`](GLOBAL-MARKET.md) | **데이터 기반 국가 우선순위** — 리치×시장성 스코어링, 통계 그래프 2종(인구 막대·사분면), Phase 1 = 미국(앵커)·한국(검증)·브라질(리치), 회피 리스트(나이지리아·콩고·에티오피아·인도), 데이터 출처 | ✅ |
| [`docs/BRAINSTORM.md`](BRAINSTORM.md) | 3렌즈 브레인스토밍(러너 경험·신앙 형성·컨셉) — The Line/Lamp/Reveal, 호흡 기도 등 | ✅ |
| [`docs/GROWTH.md`](GROWTH.md) | 수요·유통·신앙 온램프 전략 — "디지털 순례길" 포지셔닝(수익 모델 제외) | ✅ |
| [`docs/ENGINEERING.md`](ENGINEERING.md) | SE 설계 — 프로세스 모델, 유즈케이스·클래스·상태·시퀀스 다이어그램, IA, CRM 범위 | ✅ |
| [`docs/CONTENT-UX.md`](CONTENT-UX.md) | 콘텐츠별 톤 프리셋 6종(일상·광야·이적·긍휼·수난·부활) — 하나의 시스템 안에서 결을 바꾸는 법 | ✅ |
| [`docs/DIAGRAMS.md`](DIAGRAMS.md) | 설계 다이어그램 10장(PNG 렌더) — 유즈케이스·클래스·상태·시퀀스·IA·아키텍처 | ✅ |
| [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | **S1 구현 아키텍처** — 실제 코드 기준 클래스·유즈케이스·시퀀스·상태·모듈 다이어그램(mermaid) + 로드맵 | ✅ |
| [`docs/SOCIAL-SHARE.md`](SOCIAL-SHARE.md) | 인스타·스레드 공유 카드 기획 — 경쟁사(Strava·NRC) 분석 + 카드 4종 + 프라이버시 | ✅ |
| `docs/STATUS.md` | (이 문서) 현황·결정·남은 과제 인덱스 | ✅ |

*(추가 예정: 콘텐츠 데이터 스키마, 화면별 상세 스펙, API 계약 — 기본 시스템 다음 단계.)*

**코드/시안:** `src/`(React 앱) · `docs/assets/ui/`(화면 시안) · `docs/assets/diagrams/`(설계 PNG) · `docs/assets/market/`(시장 그래프) · `docs/assets/stickers/`(공유 스티커).

---

## 3. 확정된 핵심 결정

### 제품
- **캐릭터 수집·게임화보다 "실제 러닝 → 복음서 여정 진행"이 코어.** 사용자의 이동이 이야기의 진행 조건.
- **개인 모드 4종:** Gospel Journey / Prayer Run / Free Run / Reflection Walk(걷기·묵상).
- **공동체 모드는 경쟁이 아니라 협력** — 여러 사람이 하나의 목표(거리·기도)를 함께 완성. 하루 기여 거리 상한으로 독점 방지.
- **러닝 중 오디오는 초기 제외** — 안전·집중 위해 진동 + 짧은 텍스트만. 오디오는 4단계 확장.

### 신학 (절대 준수 — 자세한 금지선은 PLANNING §4)
- 국내: 예장통합(PCK) 헌법·신앙고백 기준 검수 / 글로벌: 사도신경·니케아신경 정통 기독교 공통 언어.
- **운동량을 구원·축복·믿음의 정도와 연결 금지.** "믿음 점수/기도력/구원 레벨" 등 수치 금지.
- **성경에 없는 예수님 말씀 창작 금지. 예수님을 조종·스킬화 금지.**
- 헌금·결제로 영적 보상 증가 구조 금지. 십자가 사건을 "보스전/미션 성공"으로 표현 금지.
- 콘텐츠 검수 상태 관리: `작성 중 → 성경 본문 검토 → 신학 검토 → 번역 검토 → 현지 검토 → 게시 승인`.

### 디자인·아트 (자세히는 DESIGN-TOOLING / ART-DIRECTION)
- **툴 스택(역할별 조합):** shadcn/ui MCP(컴포넌트) + Context7 MCP(문서) + Recraft MCP(일러스트) + Lucide/Iconify MCP(아이콘). 모두 무료 또는 저비용.
- **아트 무드:** Nike/Strava풍 플랫 지오메트릭 벡터 + **얼굴 없는 실루엣 인물** + 절제된 팔레트 + 은은한 그레인.
- **콘텐츠별 톤 프리셋 6종(everyday·wilderness·wonder·compassion·lament·joy):** 하나의 뼈대 위에서 콘텐츠 mood에 따라 팔레트·모션·게임 on/off가 바뀜. 수난=게임 OFF(신학 요건, 데이터로 강제). `Episode.mood` + ToneProvider. (CONTENT-UX.md)
- **절대 금지:** 코퍼릿 멤피스(Alegria) 삽화체 = "AI 티/유치함"의 정체. 네거티브 프롬프트로 차단.
- 일관성: Recraft `style_id` 락 + 시드 고정 + 골든셋 큐레이션. AI 출력은 80% 원재료 → Figma 손마감.

### 프라이버시·안전 (PLANNING §11)
- GPS 위치 + 기도제목 = 민감정보. 기본값 최대 보수. 집 주변 경로 자동 숨김, 기도제목 기본 비공개, 운영자도 개인 전체 경로 열람 불가.

---

## 4. 착수 전 반드시 해결할 과제

개발보다 먼저 확인해야 일정·구조에 영향이 큰 것들.

1. **브랜드명** — 상표권·앱스토어 중복 조사 후 최종 확정.
2. **성경 번역본 사용 허가** — 대한성서공회 등. 성경 본문은 보호받는 저작물이라 무단 사용 불가. **허가 여부가 콘텐츠 구조를 좌우**(불허 시 장절 표기 + 짧은 인용 범위로 전환 — PLANNING §10.3).
3. **신학 검수위원회 구성** — 예장통합 목회자 1인 이상 + 신약학자 + 기독교교육 전문가 등 (PLANNING §15).
4. **디자인 API 키 발급** — Recraft / (필요 시) fal.ai·Figma. 사용자가 직접 발급.

---

## 5. 구현 현황 (S1 — 데이터 구동 앱)

> S0(하드코딩 3화면 프로토타입) → **S1(데이터에서 렌더되는 7화면 앱)**으로 재작업 완료. 화면·데이터·디자인은 여전히 반복 고도화 대상.

**동작하는 것 (React 19 + Vite 6 + TS + Tailwind v4 + Zustand+persist + PWA):**

| 영역 | 파일 | 상태 |
|---|---|:--:|
| **데이터** — 37 스테이션(사역순·mood) + 7 거리별 코스 | `src/data/journey.ts` | ✅ |
| **성경** — 개역한글 원문 37 본문 발췌 + 접근/출처표기 | `src/data/passages.json` · `scripture.ts` · `scripts/extract-passages.mjs` | ✅ |
| **영속 상태** — 진도·수집·런히스토리·스트릭·단위·품은사람 | `src/state/pilgrim.ts` (localStorage) | ✅ |
| **러닝 세션** — 시뮬 GPS 틱·자리통과·스플릿·finish→commit | `src/state/run.ts` | ✅ |
| **유틸** — 거리/페이스/시간 포맷 · mood 톤(lament 축하차단) | `src/lib/format.ts` · `mood.ts` | ✅ |
| **홈** — 다음 자리·THE LINE 진도·실 성구·연속·품은사람 | `src/screens/Home.tsx` | ✅ |
| **코스 선택** — 7 순례길·진도·거리 | `src/screens/Courses.tsx` | ✅ |
| **Setup(러닝 전)** — 모드 세그먼트·목표·닿을 자리 프리뷰 | `src/screens/Setup.tsx` | ✅ |
| **러닝(THE LAMP)** — 거대 거리 숫자·다음자리 게이지·호흡기도·잠금/멈춤 | `src/screens/Run.tsx` | ✅ |
| **리빌(THE REVEAL)** — 자리 공개·Versal 성구·묵상·런요약·스플릿 | `src/screens/Reveal.tsx` | ✅ |
| **수집(여권)** — 음각 인장 그리드·수집 구절 | `src/screens/Collection.tsx` | ✅ |
| **프로필** — 통계·여정 진도/단계·PR·히스토리·설정 | `src/screens/Profile.tsx` | ✅ |
| **커스텀 아이콘** — 손그림 SVG 세트(순례 모티프) | `src/components/icons.tsx` | ✅ |
| **아트** — Recraft 6종(얼굴 없는 뒷모습·1세기) | `src/assets/art/*` | ✅ |

- **유저 플로우:** 홈/FAB `순례 시작` → Setup → 러닝 `멈추기` → 리빌 `계속 걷기` → 홈. 자리 통과 시 햅틱+플래시.
- **NRC 벤치마킹 반영:** 거대 거리 숫자 위계, km 스플릿, 요약 3-업, 스트릭/PR/여정 진도%/단계, 활동 히스토리. 스포티 네온 → 웜 골드·세리프로 재도색.
- **실행:** `npm run dev` (검증 `npm run build` = `tsc --noEmit && vite build`, 통과).
- **아직 없음:** 실 GPS(현재 시뮬), 공유 카드 실 export, 공동체·온보딩, 계정. → S2~S5 (ARCHITECTURE §8).

### 다음 단계
- **실 GPS 연동** — geolocation → `useRun.tick` 대체(그 지점만 교체하면 됨).
- **공유 카드** — 캔버스 PNG export + 프라이버시 트리밍.
- **온보딩·공동 여정** — 첫 순례 입문 + 교회/소그룹 합산.

> 작업 원칙: 문서만 쌓지 말고 돌아가는 것을 먼저. — **S1은 데이터 구동으로 실제 순례 루프가 돈다.**

---

## 6. 저장소 이력 메모

- 이 저장소(`lala-david/sowrd`)에는 이전에 다른 게임 프로젝트("동행")가 있었으나 2026-07-20 백지화. 커밋 `dd5886c`에 보존(복원 가능). 현재 프로젝트와 무관.
- git 커밋 작성자 정보가 자동 추정값(`seongjun.kang <wnswns1946@kloint.co.kr>`)으로 잡혀 있음 — GitHub 계정 연결이 필요하면 `git config` 후 재설정 필요.
