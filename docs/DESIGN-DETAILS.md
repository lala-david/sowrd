# 디자인 세부 디테일 — PROJECT THE WAY

> 2026-07-21 · "생성된 앱"과 "완성된 앱"을 가르는 실전 수치. iOS HIG · Material 3 · 프리미엄 앱 브레이크다운 기준으로 검증된 값. 그대로 토큰화해서 쓴다.
> 철학은 [[DESIGN-PHILOSOPHY]]. 색·시그니처 정제는 별도 리서치로 확정 예정.

**한 줄:** radius 1세트 · warm-tinted 다층 그림자 · gold는 텍스트(`#8A5A1E+`)와 장식(`#D97706`) 분리 · transform/opacity만 애니메이트 · keep-all 줄바꿈 · 44px 히트영역 · 모든 탭에 press 반응 · 스켈레톤+빈상태+마이크로카피.

---

## 0. 파운데이션 토큰

```
--paper:      #FDFBF7;   /* 배경 */
--paper-sunk: #F5EFE6;   /* 눌린 면 */
--ink:        #1C1A17;   /* 본문 (16.8:1) */
--ink-soft:   #3A352E;   /* 보조 (11.8:1) */
--muted:      #6B6257;   /* 캡션 (5.8:1) */
--gold-text:  #8A5A1E;   /* 텍스트용 골드 (5.7:1) ✅ */
--gold-bold:  #B45309;   /* 본문 강조 (4.86:1) ✅ */
--gold-deco:  #D97706;   /* 장식/큰글씨/아이콘-온-다크만 (텍스트 금지) */
```
- **radius 어휘 1세트:** 4 / 8 / 12 / 16 / 24. 카드=16, 버튼·인풋=12, 칩=8, 시트=24. `rounded-2xl` 남발 금지(shadcn 티 1번).
- **그림자 = warm-tint** `rgba(60,45,25,…)`. 순수 검정 금지.

## 1. 여백·그리드
- **8pt 그리드 + 4pt 하프스텝:** 4·8·12·16·20·24·32·40·48·64.
- 모바일 사이드 마진 **16px**(밀도 높은 곳 20). 앱 셸 max-width 420~480 중앙.
- **율동적 여백 > 균일:** 그룹 내부 좁게(8), 그룹 사이 넓게(24~32). 관계를 간격으로.
- **광학 정렬:** 아이콘+텍스트는 x-height 중앙(아이콘 1~2px 내림).
- **세이프에어리어:** `viewport-fit=cover` + `env(safe-area-inset-*)`. 상단 `max(16px, env(top))`, 탭바 `max(8px, env(bottom))`.

## 2. 타입 스케일
- **모듈러 1.2(Minor Third):** 12·13·14·16·19·23·28·33.
- line-height 크기별: 본문 1.5~1.6, 소제목 1.35, 타이틀 1.2, 초대형 숫자 1.0~1.1.
- **letter-spacing(라틴):** 28px+ `-0.02em`, 19~23 `-0.01em`, 본문 0, all-caps 라벨 `+0.04~0.08em`.
- **한글:** 자간 최소(본문 0, 타이틀 `-0.01em`). all-caps 트래킹 규칙 적용 금지.
- **한글 줄바꿈(치명):** `word-break: keep-all`(어절 단위) + 짧은 라인 `text-wrap: balance`, 문단 `text-wrap: pretty`.
- **한글+라틴 혼용:** 라틴을 +0.5~1px 또는 `1.03em`로 x-height 매칭.
- **숫자:** 거리·타이머·통계 = `tabular-nums`(폭 고정).

## 3. 모션
**transform/opacity만** 애니메이트(60fps). width/height/box-shadow/filter 트랜지션 금지.
- 이징: Standard `cubic-bezier(0.2,0,0,1)` · Decelerate `cubic-bezier(0,0,0,1)` · Accelerate `cubic-bezier(0.3,0,1,1)`.
- 버튼 프레스: down `scale(0.97)` 90~120ms, up 160ms.
- 리스트 등장: 페이드+`translateY(8→0)` 240~300ms, stagger 30~50ms(≤6~8개).
- 페이지 전환 300~400ms(입장 decelerate, 퇴장 accelerate+scale 0.98).
- 경로 드로우: `stroke-dashoffset` 600~900ms ease-in-out.
- 숫자 카운트업 800~1200ms ease-out(tabular 필수).
- 축하: 큰 스프링 1회 + 은은한 글로우 400~600ms. **차분한 앱이라 bounce 과함 금지**(extraBounce ≤ 0.15).
- **reduced-motion:** 이동·스케일 제거, opacity만. 카운트업·드로우는 최종값 즉시.

## 4. 컴포넌트 (shadcn 탈출)
- **버튼:** rest/hover(bg 3~5%)/press(scale 0.97 + bg 8%)/disabled(opacity .4). Primary=solid gold + warm 미세그림자만. Secondary=투명+warm 테두리. 높이 48, radius 12, 패딩 20, 아이콘-텍스트 8.
- **카드:** `shadow-lg` 금지 → 2겹 soft `0 1px 2px rgba(60,45,25,.06), 0 8px 24px rgba(60,45,25,.06)` + 상단 `inset 0 1px 0 rgba(255,255,255,.6)`. **nested card 금지**(내부는 hairline). radius 16.
- **리스트 로우:** 높이 56~64, hairline divider(좌 16 인셋), press 시 bg 4%.
- **탭바:** 49~56 + safe-area, 아이콘 24~26, 라벨 10~11. 활성=gold, 전환 시 fill+미세 스케일.
- **세그먼티드:** 트랙 sunk, 활성 pill `translateX` 슬라이드(200ms).
- **인풋:** 48, radius 12, warm 테두리, focus=gold 테두리+`0 0 0 3px rgba(180,83,9,.15)` 링.
- **원칙:** 경계=hairline, 부양=미세 그림자. 역할 분리.

## 5. 깊이·텍스처 (라이트)
- **그레인:** `feTurbulence baseFrequency 0.85 numOctaves 3` data-URI, opacity **3~6%**. 배경·큰 골드 면만. 텍스트 금지.
- **헤어라인:** `0.5px` 또는 `box-shadow 0 0 0 0.5px`, 색 `rgba(60,45,25,.10~.16)`.
- **엘리베이션:** 틴티드 다층 그림자 + 표면 밝기차(paper/sunk) + 상단 하이라이트. 광원 위. blur 크게(24~40) offset 작게(4~8).

## 6. 햅틱 (절제)
선택/토글=`selection` · 탭=`impact light`(기본) · 중요확정=`impact medium` · 완주/획득=`notification success` · 에러=`notification error`. 스크롤·수동 등장 햅틱 금지, `heavy` 금지. (PWA는 Capacitor Haptics 래핑 필요.)

## 7. 접근성 (골드 대비 실측, paper `#FDFBF7` 기준)
| 색 | 대비 | 판정 |
|---|---|---|
| `#D97706` | 3.08 | ❌ 본문(큰글씨·아이콘만) |
| `#B45309` | 4.86 | 본문 ✅ |
| `#8A5A1E` | 5.70 | 본문 ✅ (권장) |
- 웜페이퍼 위 **골드 본문 텍스트는 `#8A5A1E`~`#B45309` 이상만.** 밝은 앰버는 큰 숫자·아이콘·장식·다크 위에서만.
- **44×44 터치 타깃**, 인접 8px+/파괴적 16px+. 다이내믹 타입(rem, 고정 높이 금지). `:focus-visible` 2px gold 아웃라인. 아이콘 버튼 `aria-label`. 상태는 색+아이콘/형태 병행.

## 8. 아이코노그래피
스트로크 두께 통일(차분한 톤 **1.5~1.75px**, 라운드 캡). 광학 사이징(작을수록 얇게). 픽셀 정렬. 라인/필드 믹스 금지(활성만 fill OK).

## 9. 이미지
blur-up/LQIP(20px base64 → 크로스페이드) 또는 **ThumbHash**(CLS 0). `aspect-ratio` 항상 명시. 스톡 티 회피=듀오톤/warm 그레이딩 오버레이(8~12%)+상단 스크림.

## 10. "마지막 10%"
- **빈 상태:** 스피너 금지 → 일러스트+1문장+액션.
- **스켈레톤:** 콘텐츠 shape 미러링 + shimmer(1.2~1.5s). reduced-motion 시 정적.
- **광학 마진**(수치대칭 ≠ 시각대칭), **모든 탭에 press 반응**, **마이크로카피**(사람 말투 1문장).
- FOUC 방지(`font-display: swap`+사이즈 예약), 세이프에어리어·44px·tabular·focus링 실기기 확인.
