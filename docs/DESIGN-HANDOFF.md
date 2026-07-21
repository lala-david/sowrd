# 디자인 핸드오프 — 코드 baseline → Pencil 재작업

> 2026-07-21 · **현재 코드 UI(홈·러닝·리빌)는 교체될 기준선(baseline)이다.** 디자인은 **Pencil 디자인 툴(.pen)** 로 전면 재작업 예정. 이 문서는 Pencil이 연결되는 즉시 *변수·화면·컴포넌트를 지체 없이 세우기 위한* 준비물이다.
> 시스템 원리는 [[DESIGN-PHILOSOPHY]]·[[DESIGN-DETAILS]], 화면 흐름은 [[STATUS]] §5.

---

## 0. 상태 & 절차

- **왜 미리 세팅:** 사용자 지시 — "디자인 다 바꿔야 함, 결국 툴 사용할 거니 미리 세팅해둠."
- **Pencil MCP는 데스크톱 에디터가 실행·연결돼 있어야 동작한다.** 미연결 시 모든 `mcp__pencil__*` 호출이 `failed to connect to running Pencil app: desktop` 로 실패.

**연결되면 실행 순서:**
1. `get_editor_state(include_schema:true)` — 스키마 확보(모든 Pencil 작업의 전제).
2. `get_guidelines()` → 필요한 `guide`/`style` 로드 (모바일 앱 아키타입).
3. 아래 **§1 변수**를 `.pen` 테마(Light/Dark)로 생성 → `batch_design` 으로 화면 구성.
4. `snapshot_layout` 으로 구조 검증 → 섹션 완성 시에만 `get_screenshot` 로 시각 확인.
5. 완성 화면을 `export_html` → `src/screens/*` 코드로 반영.

- 파일: 프로젝트 루트에 **`the-way.pen`** 생성 예정(단일 소스).

---

## 1. 디자인 토큰 → Pencil 변수

현재 `src/index.css` `@theme` 값 그대로. Pencil에서 **Light / Dark 두 테마**로 등록한다.

### 색 (Color)

| 변수 | Light | Dark | 용도 |
|---|---|---|---|
| `paper-sunk` | `#EDE8DC` | `#100C07` | 눌린 면·배경 하단 |
| `paper` | `#F4F1E8` | `#16120C` | 기본 배경(벨럼) |
| `paper-raised` | `#FBF9F2` | `#201B13` | 카드·떠 있는 면 |
| `ink` | `#201C15` | `#ECE6D6` | 본문 텍스트(웜 세피아) |
| `ink-soft` | `#4E4739` | `#B3AB96` | 보조 텍스트 |
| `muted` | `#857C6B` | `#7B7360` | 캡션·비활성 |
| `line` | `#E4DED0` | `#322B1F` | 얇은 구분선 |
| `line-strong` | `#D3CBB8` | `#453C2C` | 강한 구분선 |
| `gold` | `#A67F27` | `#D6AF5B` | 브래스 골드 — UI·그래픽 |
| `gold-deep` | `#6E5417` | `#D6AF5B` | 골드 텍스트(AA 대비) |
| `gold-bright` | `#C39A3E` | `#E7C878` | 하이라이트·글로우 |
| `lapis` | `#2E3F8F` | `#7488DB` | **THE WAY — 여정 라인·거룩한 강조** |
| `lapis-deep` | `#263573` | `#8E9EE6` | 라피스 버튼 그림자·심화 |
| `rubric` | `#9E2B25` | `#D06A5E` | 루브릭 — 경고·강조 소량 |

> **라피스가 브랜드의 핵심.** AI가 흔히 쓰는 크림+세리프 클리셰를 깨는 건 이 전례용 울트라마린 "길" 라인이다. Pencil에서도 여정선·성스러운 강조에만 절제해서.

### 타이포 (Type)

| 역할 | 폰트 스택 | 쓰임 |
|---|---|---|
| `serif` | `"Gowun Batang", "Nanum Myeongjo", serif` | 한국어 목소리 — 제목·성구 본문 |
| `display` | `"Newsreader"(opsz), "Gowun Batang", Georgia, serif` | 라틴 디스플레이 · 성구 · 숫자(러닝 거리) |
| `sans` | `"Pretendard", "Noto Sans KR", system-ui, sans-serif` | UI·라벨·본문 |

- 숫자: `font-feature-settings` — 러닝 거리 `lnum`+`tnum`(라이닝·고정폭), 본문 성구 `onum`(올드스타일).
- 한국어: `word-break: keep-all`.
- 대문자 라벨(EYEBROW·성경 출처): `letter-spacing 0.2–0.24em`.

### 반경·간격·그림자 (baseline)

- radius: 버튼/카드 `16px`(rounded-2xl), 칩 `9999px`.
- 라피스 버튼 그림자: `0 1px 2px rgba(38,53,115,.2), 0 16px 36px -18px rgba(38,53,115,.5)`.
- 골드 글로우(러닝 거리): `text-shadow 0 0 44px rgba(214,175,91,.4)`.
- 프레임 폭: 모바일 `max-width 440px`, safe-area inset 준수.

---

## 2. 시그니처 요소 (재현 필수)

이 네 가지가 "The Illuminated Path"를 AI-slop과 구분한다. Pencil 재작업에서도 유지.

1. **The Illuminated Line** — 라피스 여정 라인 + 골드 노드. 지나온 구간=골드 채움, 현재=골드 링(글로우), 앞=라피스 얇은 아웃라인. (현재 `IlluminatedLine.tsx`)
2. **Versal** — 성구 첫 글자를 골드 드롭캡으로(필사본 이니셜). 62px, `line-height 0.72`, float-left.
3. **Illumination(글로우)** — 다크 화면에서 거리·빛을 따뜻한 라디얼 글로우로. 촛불 아래 금박.
4. **Vellum grain** — feTurbulence 그레인 `opacity 0.05` `multiply`. 플랫한 AI 느낌 제거.

---

## 3. 화면 인벤토리 (Pencil 재작업 대상)

| # | 화면 | 현재 baseline | 재작업 |
|---|---|:--:|:--:|
| 1 | **홈** — 오늘의 자리·여정 라인·성구·달리기 시작 | ✅ 코드 | 🔁 Pencil |
| 2 | **러닝(THE LAMP)** — 다크, 거리=등불, 구간 진행 | ✅ 코드 | 🔁 Pencil |
| 3 | **리빌(THE REVEAL)** — 사건 장면·Versal 성구·묵상 | ✅ 코드 | 🔁 Pencil |
| 4 | 온보딩 / 첫 실행 | — | 🆕 신규 |
| 5 | 수집(자리 12개 여정 지도) | — | 🆕 신규 |
| 6 | 기도 / 공동체 모드 | — | 🆕 신규 |
| 7 | 쉼터 / 걷기·묵상 | — | 🆕 신규 |
| 8 | 공유 카드(스티커) — [[SOCIAL-SHARE]] | 부분 | 🔁 Pencil |

*(🔁 = baseline 있음, Pencil로 고도화 / 🆕 = 신규 설계)*

---

## 4. 컴포넌트 인벤토리

Pencil에서 재사용 컴포넌트로 만들 것:

- `IlluminatedLine` (여정 진행 라인, props: total·current)
- `TabBar` (여정·수집·쉼터)
- `Versal` (성구 드롭캡)
- `PrimaryButton` (라피스, 골드 아이콘) / `CircleStop` (골드 링)
- `ModeChip`, `StationHeader`, `ProgressBar`(라피스), `RevealScene`(장면 일러스트 프레임)

---

## 5. 연결 확인 체크리스트

- [ ] Pencil 데스크톱 앱 실행 + 연결됨 (`get_editor_state` 성공)
- [ ] `the-way.pen` 생성, Light/Dark 테마에 §1 변수 등록
- [ ] 폰트 3종(Gowun Batang·Newsreader·Pretendard) 로드
- [ ] 시그니처 4요소 컴포넌트화
- [ ] 홈→러닝→리빌 3화면 재작업 → `export_html` → 코드 반영
