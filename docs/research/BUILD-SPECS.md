# THE WAY — 빌드 스펙 (몰입·아이콘·아트) 2026-07-23

연구 에이전트 산출물의 **바로 구현할 핵심**만 정리. (전체 전략은 [MASTERPLAN.md](../MASTERPLAN.md))

---

## A. recraft 아트 — 스타일 락 + 스캐폴드
- **모델:** recraftv4_1 (또는 suggest_model 추천 시 recraftv4_1_pro). UI 아이콘=`input_style: icon`/`vector_illustration`, 씬/문장=`vector_illustration`.
- **일관성:** 히어로 1장 생성 → `create_style`로 `style_id` 발급(theway-icon, theway-motif) → 이후 전 생성에 style_id 적용 + 아래 스캐폴드 프리픽스 + 팔레트 8토큰 클램프. UI아이콘·문장은 `vectorize_image`로 SVG화 후 currentColor·1.75px·round·24px 정리. 씬(그레인)은 WebP 유지.
- **STYLE SCAFFOLD (모든 프롬프트 앞에 붙임):**
> flat geometric vector illustration, minimal warm pilgrimage iconography for a Christian running app THE WAY. Golden-hour Holy Land palette ONLY: warm sand cream #f4ead7 bg, terracotta clay #c05a30, olive sage #6e7a4c, sun-gold #e0a53f highlight, deep umber #2c2118. First-century Holy Land, faceless robed silhouettes, no faces. Clean geometric shapes, flat fills, soft two-tone shading, subtle warm paper grain, gentle golden-hour light upper-right. Centered single subject, generous negative space, calm reverent premium editorial. NO text, NO neon, NO photorealism, NO heavy-3D gradients, NO Strava sport look, NO clip-art, NO modern city/cars. Subject:

**생성 세트:** 여정 문장 5(아브라함=밤별+장막, 출애굽=갈라진 바다+구름기둥, 예수=등불+갈릴리, 바울=지중해 배+별, 베드로=열쇠+그물+배) · 지역 씬 8(요단강·시내광야·바다·산·예루살렘성벽·새벽빈무덤·지평선길·들판마을) · UI아이콘 28 · 스티커 18 · 공유카드 배경.

## B. 아이콘 시스템 (icons.tsx 업그레이드)
- **기초:** 24px 그리드, 20px live area, mono-line **1.75px**(현재 1.6→상향), round cap/join, r2 코너, currentColor. 옵티컬: 1.5@20·1.75@24·2@32.
- **투톤 악센트(sun-gold):** '빛/도달/활성/거룩' 의미에만 — 등불 불꽃·인장 광택·도달 체크·해금 글린트·기도 빛. 중립 크롬(설정·셰브론·공유)엔 금지.
- **28 UI글리프:** home-journey-map, run-start(발자국), pause, stop-cairn, lock, locked-place, unlock, checkmark-reached, splits, pace(해시계 그노몬), time(해시계), distance(마일스톤 돌기둥), next-place, collection-passport, seal-stamp, scroll-scripture, lamp-guided-run, prayer-intercession, community-caravan(순례자 3인), share, sticker, profile(로브 실루엣), settings, streak-ember, calendar-season, compass-courses, audio-headphones, map-pin-cairn(구글핀 금지, 돌무지), heart-dedicate, chevron, cross-passion.
- **iconify 폴백(순수 기능 글리프):** Phosphor `ph:caret-right/gear-six/pause/play/magnifying-glass`, Solar `solar:share-linear/headphones-round-linear/lock-keyhole-*`, Lucide `lucide:check/x/plus/minus`. 앱 고유 은유(cairn·seal·scroll·lamp·caravan)는 커스텀/recraft.
- **A11y:** 최소 터치 44/48px, muted(#978878)는 단독 인터랙션 표시로 쓰지 말 것(대비 미달), 상태는 색 아닌 형태/라벨로도.

## C. 몰입·현존 (run.ts / 오디오 / 햅틱)
- **사운드스케이프(지역별 베드+악센트):** 갈릴리 호숫가(물결·노·갈매기) · 유대/시내 광야(마른 바람·맹금·염소 방울) · 지중해 항해(선체·삭구·파도) · 예루살렘(군중·돌바닥·성전 종) · 산(고지 바람·독수리 메아리) · 카미노(자갈길 발소리·마을 종·새).
- **내레이션 원칙:** 침묵이 기본, 임계에서만. 따뜻·문학적·비설교. DEPART 1줄 → 긴 침묵 → (페이스 안정 시) MID → ~250m APPROACH → 도착 시 말씀 통독. 하드에포트/케이던스 급증 시 안전외 VO 억제. 30초 내 연속 금지. 호흡기도는 발걸음 케이던스, 스킵 가능.
- **햅틱 어휘(Vibration API):** split `[120,60,120]` · approach `[40,40,40,40,40,40,200]` · **arrival/unlock `[300,120,300,120,500]`(시그니처)** · pause `[200,100,60]` · resume `[60,100,200]` · prayer `[500]` · breath tick `[30]` · off-route `[80×6]`(유일 에러) · episode-complete `[200,80,200,80,200,80,600]`.
- **라이브 UI:** 여정 리본(다음 자리 접근을 공간적으로) · 접근 시 지평선 heat-haze/dawn 라이트 · 단일 거대 숫자(나머지 탭/오디오) · 절제된 패럴랙스(reduce-motion 정지) · 야간모드.
- **웹 실현성:** Web Audio(제스처로 unlock, iOS 잠금 시 MediaSession/무음 keep-alive) · Vibration(안드로이드만, iOS는 earcon 대체) · Wake Lock(visibilitychange 재획득, 포켓모드 기본) · Geolocation(highAccuracy+칼만, 유실 시 무음+off-route) · DeviceMotion(iOS 권한 제스처, 케이던스) · SW 오프라인 캐시(당일 레그 자산) · 저전력 모드.

## D. 기억/공유
- 런 후 "오늘 예수께서 어부를 부르신 그 자리를 달렸습니다" 회상 + 감각 저널(공기·호흡) + 말씀 keepsake(모은 돌무지) + 채워지는 여정 지도 + 조용한 공유카드(간증 톤, 리더보드 아님).
