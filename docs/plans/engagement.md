# 몰입·리텐션 시스템 상세 플랜 — *동행 (The Gospel Road)*

> 상위 문서: [`../GDD.md`](../GDD.md) · [`../ENGAGEMENT.md`](../ENGAGEMENT.md)
> 버전 0.3 (2차 재검증 잔여 지적 전면 반영) · 2026-07-20 · 대상 코드베이스: 수직 슬라이스 v0.1 (`src/`)

---

## v3 변경 로그 (2차 재검증 — 신학 8.5 · 게임D 8.5 · 엔지 8.5 · UX 9 · 비신자 8.5 — 잔여 지적 해소)

| # | 잔여 지적 (출처) | 해소 위치 | 해소 방식 |
|---|---|---|---|
| G1 | 부활 비트 성구(고전 15:55)가 자체 verseRef 4복음서 제한과 자기모순 — CI가 ep12 데이터 거부 (신학 FIX·HIGH) | ② S5 · ⑤ · ⑧ M4 | **(a)안 채택**: 예시 성구를 복음서 내 부활 본문 **마태복음 28:6 "그가 여기 계시지 않고 그가 말씀하시던 대로 살아나셨느니라"** 로 교체(보조 후보: 눅 24:5-6). verseRef 4복음서 규칙은 예외 없이 유지 — GDD '4정경 복음서 충실' 원칙 부합. 서신서 예외 규정은 도입하지 않음(스키마 단순성 + 감수 범위 확대 방지). U9에 "ep12 resurrection 비트가 4복음서 정규식을 통과" 케이스 명시 |
| G2 | 감수 contentHash의 계산 범위 미정의 (신학 FIX) | ⑩ hashContent 정의 + 코드 | **해시 범위 = `review`·`needsReview` 두 필드만 제외한 객체 전체**를 키 정렬 canonical JSON으로 직렬화 후 SHA-256. 노출 텍스트뿐 아니라 mood·grammar·verseRef 등 의미 결정 필드 전부 포함 — "문구는 그대로인데 무드만 바꿔 감수를 우회"하는 구멍 차단 |
| G3 | 토스트 최소 5초 > calm 윈도 최소 4.2초 — held 구간 시각 잔류로 F7 재개방 (게임D FIX·HIGH) | ⑤ 수명 클램프 · ⑥ 계약 · ⑦ 표 · U14 | 인게임 토스트 수명 = `min(글자수×150ms+2s, calm 윈도 잔여 − 300ms 페이드)` — **calm 종료 전에 반드시 페이드 완료**. reportMoment에 `windowRemainingMs` 추가, 윈도 진입 0.5초 내 방출 원칙으로 최악 윈도(4.2s)에서도 실표시 ≥ 3.4s. 읽다 놓침은 F15 스크랩북 재열람이 커버(정보 무손실). **최소 5초 보장은 결과 화면·맵 등 비집중 컨텍스트에만 적용.** 인게임 방출 문구 12자 이하 CI 경고 병행 |
| G4 | 스크랩북 9종 중 2종 출처 부재 + 발걸음 보상 이중 배정(S2 스티커 vs S4 표정) — M2·M3 착수 불가 (게임D FIX) | ②-E 매핑표 · S2/S4 서술 통일 · ④ · ⑩ CI | **9종 ↔ 획득원 1:1 확정표** 신설: 베드로 표정 3 ← 발걸음 목표 3(S2·S4 모두 "표정 해금"으로 통일), 배경 스티커 3 ← 인게임 collect-piece 3(calm 윈도), 카드 뒷면 파편 3 ← story-fragment 1 + 드립피드 누적 열람 마일스톤 2. microRewards.ts 수량을 collect-piece 5로 정정. CI에 "스크랩북 에셋 1:1 린트(고아·이중 배정 하드 에러)" 추가 |
| G5 | 발걸음 목표 3종 동시 달성 가능 → 재방문 25~40분 산수가 첫날 3분으로 붕괴 (비신자 FIX·HIGH) | ②-E 정책 · ⑤ · ⑥ · ⑧ M3 · U13 | **판당 인정 1개**: 입장 전 맵의 ep08 카드에서 도전 목표 1개 선택(무선택 시 미달성 중 첫 번째 자동 지정), 한 판에서 복수 조건을 충족해도 선택 목표만 달성 처리. 보조로 스타일 상충 설계 병기: ①잔잔한 걸음(warn 회피 보수 플레이) ↔ ②숨 고르기(warn을 3회 유발해야 하는 공격적 전진)는 자연 배타, ③은 ①과 병행 가능하므로 선택 규칙이 최종 방어선. 최소 재도전 3판 보장 → ②-E 산수 유지 |
| G6 | 세션 라이프사이클 오너·flushMetrics 목적지 미정 (엔지) | ⑤ 세션 경계 · ③ 저장 구조 | **오너 = App.tsx 루트 단일 useEffect**(mount→beginOrResumeSession, visibilitychange, pagehide→flushMetrics 리스너의 유일한 등록 지점 — 화면·컴포넌트의 세션 API 직접 호출 금지). **flush 목적지 = localStorage `donghaeng-metrics-debug-v1`**(persist 스토어와 키 분리, 최근 3세션 × 최대 300건 상한, 초과 시 오래된 세션 폐기, 총 ~30KB). 소비처는 ⑨의 플레이테스트 JSON 회수뿐 |
| G7 | WCAG 조문 인용 착오 (UX) | ⑦ 표 | 터치 44px의 근거 조문 정정: **2.5.8 Target Size (Minimum, AA)는 24px**이며, 44px는 **2.5.5 Target Size (Enhanced, AAA)** — 전연령 제품 기준으로 AAA를 자체 채택함을 명시. 토스트 조기 페이드는 스크랩북 재열람(정보 무손실)으로 2.2.1 취지를 충족함을 병기 |

---

## v2 변경 로그

1차 검증(신학 김정훈 7/10 · 게임D 유나 6/10 · 엔지니어링 박도윤 6.5/10 · UX 이서연 6.5/10 · 비신자 민준 6/10)의 **필수 수정 전 항목 + high 전 항목**을 반영했다. 대응표:

| # | 필수 수정 (출처) | 해소 위치 | 해소 방식 |
|---|---|---|---|
| F1 | ep12 수난/부활 두 비트 분리, 부활의 기쁨 침묵 금지 (신학·공통10) | ③ PeakEndSchema(beats 배열) · ⑤ 피크-엔드 플로우 | 에피소드당 복수 비트. Zod refine으로 "ep12 = passion(quiet) + resurrection(warm/triumphant) 필수, passion 비트 nextHook 금지" 기계 강제 |
| F2 | needsReview 기본값 true + 감수자 서명·콘텐츠 해시 (신학·공통3) | ③ ReviewStateSchema · ⑩ CI 규칙 | opt-out 구조. `review: { reviewedBy[], reviewedAt, contentHash }` — 문구 수정 시 해시 불일치로 감수 자동 무효화. 릴리스 빌드 실패 규칙 코드 스케치 포함. 해시 계산 범위는 v3에서 확정(G2) |
| F3 | 성경 번역본 확정·저작권 허락을 선행 과제로 (신학·공통4) | ⑧ M0 태스크 + M4 착수 조건 | 대한성서공회 허락 절차 개시 = M0, 번역본 미확정 시 M4 착수 금지. 인용문-본문 자동 대조(diff) 검증 스크립트 명시 |
| F4 | '감동 순간 도달률' 폐기 — 계량 표현 금지 (신학·게임D·비신자) | ③ 지표 정의 · ⑥ 금지 어휘 목록 | 북극성 = "완주율(최초 진입 기준) × 피크-엔드 자발 체류율(글자 수 비례 dwell + 자발 진행 탭)". 사용자 노출 화면에서 감동·은혜류 계량 표현 금지 목록 운용 |
| F5 | 창작 문장 vs 성경 본문 시각 구분 (신학) | ⑦ UI 표 · ⑨ I7 | 성구 = 「인용부호」+출처 병기+세리프, 창작 = 산세리프+출처 없음+구분선. 통합 테스트 I7로 검증 |
| F6 | ep11→ep12 진입 훅 클리프행어 금지 (신학) | ③ refine · ⑤ 훅 규칙 | 수난 진입 훅은 호기심 문법 금지, "함께 있어 달라"(마 26:38) 초대 문법 + 별도 감수. Zod refine으로 ep11 nextHook에 hookGrammar='invitation' 강제 |
| F7 | S1(45초 토스트) ↔ R2(균형 동사 홀드) 정면 모순 (게임D·엔지·UX·공통8) | ⑤ calm 윈도 방출 정책 · ⑧ M2 기준 | 균형/리듬 동사는 입력 휴지기(ep08 calm 구간 4.2~7.4초)에만 방출하는 **윈도 방출**로 재정의. M2 합격 기준을 "calm 윈도 방출 2~3회"로 개정. 토스트 pointer-events:none, HUD 상단 안전 영역 배치. 수명 클램프는 v3에서 봉합(G3) |
| F8 | 마이크로 보상 소진 정책 분리 (게임D·공통5) | ③ claimPolicy 필드 | `claimPolicy: 'once' \| 'perSession' \| 'onChange'`. companion-line은 세션당 로테이션 풀(재플레이 반응 대사) |
| F9 | D1~7/D8+ 재방문 사유를 스코프에 실물 편입 (게임D·비신자) | ① 범위 확장 · ⑧ M3 재정의 · ②-E 경제 산수표 | ep08 "발걸음 목표" 3종 + 베드로 허브 드립피드 12줄 + 스크랩북 조각 9종을 v0.5 스코프로 편입. M3를 '이어하기'에서 '재방문 콘텐츠'로 교체 |
| F10 | 세션 판정 grace window (게임D·엔지·비신자) | ⑤ 세션 경계 규칙 · ⑨ U10 | hidden 후 5분 내 복귀 = 동일 세션 연장, 초과 시 endedAt 소급 봉합. U 테스트 추가 |
| F11 | 북극성 허영 지표 재정의 (게임D·비신자) | ③ 지표 정의 | F4와 동일 해소. 분모 first-enter, 재도전율 분리, 체류 분포·'사람들 보기' 선택률 추가 |
| F12 | App 셸 어댑터 아키텍처 폐기 (엔지) | ④ 구조 · ⑥ 계약 | 이벤트 버스 삭제. `engagement/api.ts`의 함수(reportMoment 등)를 화면이 직접 호출 — 현행 코드(WaterWalkGame이 completeEpisode 직접 호출)와 동일 패턴. 소비자 1개 시점의 2중 간접화 제거 |
| F13 | persist 스토어 내 2000건 링버퍼 동기 직렬화 제거 (엔지) | ③ 저장 구조 · ⑤ | 지표를 **누적 카운터(영속, 소형)** + **세션 버퍼(메모리, 최대 300건, pagehide 시 1회 플러시)**로 이원화. track()마다 localStorage 쓰기 없음. flush 목적지는 v3에서 확정(G6) |
| F14 | 마이크로 보상 실물화 — 자막은 보상이 아니다 (비신자·공통5) | ③ collect-piece kind · ②-E | 스크랩북에 영구 축적되는 시각 수집물(배경 스티커·동료 표정 해금·카드 뒷면 일러스트 파편) 신설. 텍스트는 포장, 실체는 수집물 |
| F15 | MicroToast 대비·타이밍·스크린리더 (UX·공통6) | ⑦ 표(실측치 병기) | 불투명 `var(--panel-2)` 배경, 텍스트 `var(--parchment)` **11.6:1 실측**, role=status(aria-live=polite), 표시 시간 글자 수 비례(비집중 컨텍스트 최소 5초 — v3 G3), 스크랩북 재열람 경로 |
| F16 | ⑦ 토큰 표를 실제 global.css 변수 기준 재작성 (UX·공통9) | ⑦ 전면 재작성 | `--ground/--panel/--lamp/--dawn/--parchment/--serif(=Noto Serif KR)` 기준. hex는 참고값 각주. 신규 토큰 `--dawn-dim`, `--ink-on-light` 명명 규칙 준수 |
| F17 | reduced-motion 전역 0.01ms 강제와의 충돌 (UX) | ⑧ M0 선행 태스크 | global.css:151-154 전역 강제를 "opacity 전환 허용" 방식으로 리팩터링 — M2 이전 완료 필수 |
| F18 | 플레이테스트 표본 층화 + 비신자 쿼터 (UX·비신자·공통5) | ⑨ 게이트 재설계 | n≥10, 비신자·무교 ≥50%, 아동(8~12) 2인+, 60대+ 2인+, 저시력/색각 1인+. "설교 같다" = 비신자 기준 0건. 수치 게이트는 v1(n≥15)로, v0.5는 정성 프로토콜 |
| F19 | 예수님 데이터 격리 (공통1) | ③ Zod refine · ⑩ | 마이크로 보상·수집물·드립피드 대상에서 예수님 id를 refine + CI 하드 에러로 차단 |

medium/low 반영 요약: 안전판 90초 보상 **폐지**(비신자 medium — 맥락 없는 재고지 금지, 신학 low — 침묵 구간 존중), nextHook은 다음 장 playable일 때만(게임D medium), 환대 임계 7일 + 신규 콘텐츠 AND 조건 + 연속 복귀자 강등(게임D medium), '통찰' 명칭을 신학 어휘가 아닌 **"발걸음 목표"** 로 확정(신학 low — 영지주의 뉘앙스·"믿음 좋으면 게임 잘한다" 역오해 동시 차단), d1Return 삭제(엔지 low), M3 이어하기 축소·M5 흡수(게임D·엔지), 복귀 정서 게이트는 v1 종단 테스트로 이관(엔지 medium), PeakEnd에 kicker/title 오버라이드 추가(엔지 low), 지표 JSON 회수 절차·옵트인 결정 시점 명문화(비신자 medium), 허용/금지 문구 목록 10개(비신자 low), 초3 독해 어휘 가이드(UX low — '밤 사경' 폐기), 스킵 경로 플로우 명시(UX low), 최소 폰트 14px·터치 44px 공통 규칙(UX low), 90초 안전판 구현 주체 문제는 안전판 폐지로 소멸(엔지 medium).

**미반영·부분 반영 (사유 명시):**
- PWA 로컬 알림(게임D 제안 후보 c): Capacitor/SW 인프라가 v0.5 범위 밖. 대신 재방문 사유는 후보 (a)+(b)를 **동시** 편입해 초과 달성. 알림은 훅 포인트만 유지.
- 옵트인 익명 집계(비신자 medium): 비침습 원칙(레드라인)과 상충 소지가 있어 즉시 도입하지 않고, **v1 착수 전 의사결정 항목**으로 로드맵에 박음. 그 전까지는 플레이테스트 현장 JSON 회수 절차(⑨)로 개발 피드백 확보.
- CI 감수 게이트 즉시 강제(공통3 vs 엔지 low): 절충 — **dev 빌드는 경고 목록 출력, 릴리스(프로덕션) 빌드는 실패**. 감수 워크플로(2인 서명)가 실존하기 전이라도 릴리스 차단은 스크립트 1개로 가능하므로 공통 지침을 따른다.
- 부활 케리그마의 서신서 확장(verseRef 예외 규정, v3 G1의 (b)안): 도입하지 않음. 사유 — GDD의 '4정경 복음서 충실' 원칙 유지, 스키마 예외는 감수 범위와 검증 표면을 넓힌다. 복음서 내 부활 본문(마 28:6, 눅 24:5-6, 요 20:16 등)만으로 승전의 기쁨 표현에 부족함이 없다.

---

## ① 목표와 범위

### 목표
ENGAGEMENT.md의 철학("붙잡아두기"가 아니라 "돌아오고 싶게")을 **구현 가능한 시스템 5개 + 지표 1개**로 구체화한다.

1. **보상 리듬(Reward Rhythm)** — 30~90초 마이크로 피드백(윈도 방출), 10~15분 마일스톤. 보상은 텍스트가 아니라 **스크랩북에 축적되는 실물**이 기본.
2. **재방문 콘텐츠(Return Content)** — *v2 신규.* 발걸음 목표(재도전 사유, 판당 인정 1개 — G5) + 동료 드립피드 대사(허브의 첫 실물) + 스크랩북 수집물(획득원 1:1 — G4). 리텐션의 병목(재방문 사유)을 이 플랜이 직접 소유한다.
3. **세션 설계(Session Design)** — 3~7분 한 손 세션. 재진입 2탭 이내 플레이 재개. 세션마다 최소 1개의 "작은 완결".
4. **복귀 유저 환대(Welcome Back)** — 벌칙·죄책감 0. 7일+ 공백 시에만, 보여줄 새 것이 있을 때만.
5. **피크-엔드 연출(Peak-End Director)** — 각 장의 마지막을 감정 정점으로. 에피소드당 복수 비트(수난/부활 분리). 데이터 주도.
6. **비침습 로컬 지표(Local Metrics)** — 서버 전송 없음. 누적 카운터 + 세션 버퍼 이원화. 북극성 = **완주율(최초 진입 기준) × 피크-엔드 자발 체류율**.

### 비범위
- 푸시/로컬 알림 구현(Capacitor 단계) — 훅 포인트와 문구 톤 규칙만 이 문서가 소유
- 허브 화면 자체(대화 UI·선물) — 단, **베드로 드립피드 대사 12줄은 이 플랜의 데이터 산출물**(맵의 베드로 탭으로 소비, ②-E)
- 미니게임 내부 DDA — 단, `reportMoment` 계약(⑥)은 이 플랜이 정의
- 서버 분석·A/B 테스트 — 원천 배제. 옵트인 익명 집계는 v1 착수 전 별도 의사결정(⑧)
- 소셜 공유·소그룹 모드 — v1 이후

### 레드라인 재확인
확률형 뽑기 · FOMO/소멸 타이머 · 페이투윈 · 미접속 벌칙 · 스트릭 협박 · 공개 순위표 — **전부 금지.** 손실 회피 문구는 금지·허용 목록(⑥)으로 기계적으로 관리한다("수준까지만" 같은 모호한 선 긋기 폐지).

---

## ② 플레이어 경험 시나리오

### S1. 첫 세션 (D0) — "3분 아하 모먼트"
1. 타이틀 → 원탭 시작(로그인 없음) → ep08 진입.
2. 플레이 중 첫 **calm 구간**(파도 사이 4.2~7.4초 휴지기, 대략 40~60초 시점): 첫 마이크로 피드백 — HUD 상단 안전 영역에 조용한 토스트 "베드로가 배에서 일어섰다" + **스크랩북 조각(카드 뒷면 파편 1) 아이콘이 함께 날아가 박힌다**(실물 획득 연출). 토스트는 calm 윈도가 끝나기 전에 페이드 완료(G3) — 파도가 오면 화면에는 게임만 남는다.
3. **~3분**: 클리어 → RewardScreen 피크-엔드(성구 + 붙잡아 주신 손) → 베드로 카드 합류.
4. 맵 복귀: 컬렉션 배지 "1/24" + **ep08 카드에 미달성 발걸음 목표 3칸이 빈 채로 보임**(해소 가능한 미완결 — 자이가르닉을 출시된 콘텐츠 안으로).

### S2. 평일 저녁 세션 (D1–7) — "3~7분 한 완결"
1. 앱 재진입 → 타이틀 "이어서 걷기 — 갈릴리 바다" 원탭 → 맵 (**2탭 이내 플레이 재개**).
2. 재방문 사유(전부 v0.5 실물, ②-E 산수표): ep08 카드에서 발걸음 목표 1개를 골라 재도전 → 달성 시 **베드로 표정 해금 1종**(스크랩북 실물 — S4·②-E 매핑표와 동일 서술, G4) **또는** 맵의 베드로에게 말 걸기(드립피드 새 대사 2줄) = "작은 완결".
3. 재플레이 중에도 리듬이 살아 있다: companion-line 풀에서 세션당 1~2개가 로테이션 방출(F8) — "한 번 본 유저에게 리듬이 죽는" 문제 해소.
4. 종료는 자연스럽게. 강제 요약 화면 없음. 미니게임 도중 이탈 시 다음 진입은 맵(무손실 원칙).

### S3. 복귀 (D7+) — "환대, 벌칙 없음"
1. 7일+ 공백 **그리고** 보여줄 것(미완 발걸음 목표·새 드립피드·새 장)이 있을 때만 Welcome Back 화면. 조건 미충족 시 일반 타이틀.
2. 리캡 카드 1~3장 + "이어서 걷기" 원탭. **"건너뛰기" 상시 노출**(→ title). 직전 복귀 때도 welcome을 봤던 주기적 복귀자는 리캡 1장 또는 ResumeCard로 강등.
3. 절대 없음: 잃은 것 목록, 놓친 이벤트, 복귀 보상 뽑기.

### S4. 숙련 유저 (D8–30) — "발걸음 목표"
1. 맵의 ep08 카드에서 도전할 발걸음 목표 1개 선택 → 재도전 → 미니게임이 **선택된 목표만** 판정해 `reportStepGoal`로 보고(판당 인정 1개 — G5).
2. 보상: 배지 + **베드로 표정 해금 1종(스크랩북 카드에 시각 변화 — ②-E 매핑표 1:1)** + 새 드립피드 대사 해금. 게임 숙련의 보상은 게임적 어휘("발걸음")로 — 영적 깨달음 어휘와 분리.
3. 순위표 없음. 비교 대상은 과거의 나뿐.

### S5. 12장 완주 (D30+) — "여정의 끝"
수난 비트(quiet — 함께 슬퍼함) → **부활 비트(triumphant — 「그가 여기 계시지 않고 그가 말씀하시던 대로 살아나셨느니라」 마태복음 28:6, 기쁨의 해방)** → 엠마오 → 스크랩북 완성(24/24) → 에필로그 훅("가라"). 수난의 절제와 부활의 기쁨을 하나의 무드로 뭉개지 않는다(F1). 부활 비트 성구는 **복음서 내 부활 본문**(마 28:5-6, 눅 24:5-6, 요 20:16 등 — 최종 선택은 감수 대상)에서만 취한다 — verseRef 4복음서 규칙과 정합(G1), 서신서 인용 예외 없음.

### ②-E. 콘텐츠 경제 산수표 (v0.5 — "재방문할 것이 실제로 있는가")

| 콘텐츠 | 수량 | 1회 소비 시간 | 총 분량 | 재방문 사유 유형 |
|---|---|---|---|---|
| ep08 본편 | 1 | ~3분 | 3분 | 최초 진행 |
| 발걸음 목표 (ep08) | 3종 (**판당 인정 1개** — 최소 3판) | 재도전 1~2회/종 = 3~6분 | 9~18분 | 숙련 재도전 |
| 베드로 드립피드 대사 | 12줄 (세션당 최대 2줄 방출) | ~30초/회 | **최소 6세션 분량** | 관계 드립피드 (Hades 모델의 실물 첫 소비자) |
| 스크랩북 조각 | 9종 (아래 1:1 매핑표) | 수집 연출+열람 | 발걸음·드립피드에 종속 | 수집 완성 욕구 |
| companion-line 풀 | 8줄 (세션 로테이션) | 플레이 중 소비 | 재플레이 4세션+ 신선 | 재플레이 리듬 |
| **합계** | | | **D0 3~5분 + D1~7 재방문 5~7세션 × 3~6분 ≈ 25~40분 실콘텐츠** | |

#### 발걸음 목표 3종 확정안 + 중복 달성 정책 (G5)

발걸음 목표 3종(ep08): ① **잔잔한 걸음** — 파도 3회를 침수 0으로 통과 ② **숨 고르기** — warn 신호 후 0.5초 내 홀드 해제 3연속 ③ **등불만 바라보기** — 시선 게이지 90%+ 유지 완주. (gentleMode에서도 달성 가능하도록 판정 여유 동일 비율 적용 — 접근성과 숙련 목표 비배타.)

**중복 달성 정책 — 판당 인정 1개.**
- 입장 전 맵의 ep08 카드에서 **도전할 목표 1개를 선택**한다(미선택 시 미달성 목표 중 첫 번째 자동 지정 — 진입 마찰 0탭). 한 판에서 여러 목표의 조건을 동시에 충족해도 **선택된 목표만 달성 처리**된다. 판정·보고 모두 선택 목표에 한정(⑥ reportStepGoal 계약).
- 보조 설계(스타일 상충): ①은 warn 자체를 회피하는 보수 플레이를, ②는 warn을 **3회 이상 의도적으로 유발**해야 하는 공격적 전진을 요구 — 자연 배타. ③은 ①과 병행 가능하므로 "판당 1개" 선택 규칙이 최종 방어선이다.
- 효과: 3종 완수에 **최소 3판**(재도전 1~2회/종 가정 시 3~6판)이 필요 — 위 산수표의 9~18분이 구조적으로 보장된다. U13으로 고정.

#### 스크랩북 9종 ↔ 획득원 1:1 매핑표 (G4 — 고아·이중 배정 0)

| # | 에셋 id | 종류 | 유일 획득원 (트리거) | 획득 컨텍스트 |
|---|---|---|---|---|
| 1 | `sticker-boat` | 배경 스티커 | collect-piece `water-walk/wave-1-clear` (파도 1회 통과 후 open 윈도) | 인게임 |
| 2 | `sticker-moonpath` | 배경 스티커 | collect-piece `water-walk/midpoint` (중간 지점 open 윈도) | 인게임 |
| 3 | `sticker-lamp` | 배경 스티커 | collect-piece `water-walk/final-calm` (클리어 직전 마지막 calm) | 인게임 |
| 4 | `peter-face-resolute` | 베드로 표정 | 발걸음 목표 ① 잔잔한 걸음 `rewardAssetId` | 결과 화면 |
| 5 | `peter-face-breath` | 베드로 표정 | 발걸음 목표 ② 숨 고르기 `rewardAssetId` | 결과 화면 |
| 6 | `peter-face-gaze` | 베드로 표정 | 발걸음 목표 ③ 등불만 바라보기 `rewardAssetId` | 결과 화면 |
| 7 | `cardback-shard-1` | 카드 뒷면 파편 | story-fragment `water-walk/first-calm` (S1 첫 calm) | 인게임 |
| 8 | `cardback-shard-2` | 카드 뒷면 파편 | collect-piece `drip/read-4` (드립피드 누적 열람 4줄) | 맵(베드로 탭) |
| 9 | `cardback-shard-3` | 카드 뒷면 파편 | collect-piece `drip/read-12` (드립피드 12줄 완독) | 맵(베드로 탭) |

- 규칙: **모든 스크랩북 에셋은 획득원이 정확히 1개**(CI 린트 — ⑩). 발걸음 보상 서술은 문서 전체에서 "베드로 표정 해금"으로 통일(S2·S4·본 표 일치). 드립피드 완독에 파편 2개를 걸어 "대사 소비"에도 수집 실물이 따라온다 — 12줄을 끝까지 볼 산수적 이유.
- microRewards.ts 수량 정정: story-fragment 1 · companion-line 8 · **collect-piece 5**(인게임 3 + 드립 마일스톤 2). ④ 파일 명세와 일치.

---

## ③ 데이터 모델 (TypeScript 타입 스케치)

기존 `src/content/schema.ts`의 Zod 우선 원칙. 신규 파일 `src/content/engagementSchema.ts`:

```ts
import { z } from 'zod'
import { hashContent } from '../lib/hash' // ⑩에서 계산 범위 정의 — SHA-256 canonical JSON

/** ── 감수 상태 (공통 지침 3: 상설 게이트) ─────────────────── */
export const ReviewStateSchema = z.object({
  reviewedBy: z.array(z.string()).min(2),   // 통합측 목회자 2인 이상 서명
  reviewedAt: z.string(),                   // ISO date
  contentHash: z.string(),                  // 감수 시점의 본문 해시 — 계산 범위는 ⑩ hashContent (G2)
})
/** needsReview 기본값 true(opt-out). false는 감수자만 명시적으로 해제 */
const reviewable = {
  needsReview: z.boolean().default(true),   // F2: 기본 감수 대상
  review: ReviewStateSchema.optional(),
}

/** ── 마이크로 보상 ────────────────────────────────────────── */
export const MicroRewardKindSchema = z.enum([
  'story-fragment',   // 이야기 조각: 텍스트 + 스크랩북 파편 (스포일러성 → once)
  'companion-line',   // 동료 반응 대사: 세션 로테이션 풀 (재플레이 리듬의 본체)
  'collect-piece',    // F14: 시각 수집물 — 배경 스티커·표정 해금·카드 뒷면 파편
  'step-badge',       // 발걸음 목표 배지 (구 insight — 명칭 확정, T6 해소)
  'card-progress',    // 컬렉션 근접 알림 — 실제 상태 변화 시에만
])
export const ClaimPolicySchema = z.enum(['once', 'perSession', 'onChange']) // F8

export const MicroRewardSchema = z.object({
  id: z.string(),
  kind: MicroRewardKindSchema,
  episodeId: z.string(),
  trigger: z.string(),              // reportMoment의 moment 이름. 예: 'water-walk/first-step'
  claimPolicy: ClaimPolicySchema,   // kind별 기본값은 아래 refine으로 강제
  text: z.string(),                 // 토스트 한 줄 (초3 독해 수준 — ⑨ 가독성 체크)
  /** collect-piece·story-fragment: 스크랩북에 축적될 실물 에셋 id — ②-E 매핑표와 1:1 (CI 린트, G4) */
  scrapbookAssetId: z.string().optional(),
  companionId: z.string().optional(), // companion-line일 때 화자
  ...reviewable,
}).superRefine((r, ctx) => {
  // F19 · 공통1: 예수님 데이터 격리 — 하드 에러
  if (r.companionId === 'jesus')
    ctx.addIssue({ code: 'custom', message: '[신학 가드] 예수님은 보상·대사풀·수집 대상이 될 수 없습니다.' })
  // kind별 소진 정책 강제 (F8)
  const policy: Record<string, string[]> = {
    'story-fragment': ['once'],
    'companion-line': ['perSession'],
    'collect-piece': ['once', 'onChange'],
    'step-badge': ['once'],
    'card-progress': ['onChange'],
  }
  if (!policy[r.kind].includes(r.claimPolicy))
    ctx.addIssue({ code: 'custom', message: `${r.kind}의 claimPolicy는 ${policy[r.kind]}만 허용` })
  // 실물 원칙 (F14): 수집형 kind는 에셋 필수
  if ((r.kind === 'collect-piece' || r.kind === 'story-fragment') && !r.scrapbookAssetId)
    ctx.addIssue({ code: 'custom', message: '수집형 보상은 scrapbookAssetId 필수 — 자막은 보상이 아니다' })
  // G3: 인게임(미니게임 moment) 방출 문구 길이 상한 — 최악 calm 윈도(4.2s) 내 완독 가능
  if (r.trigger.startsWith('water-walk/') && r.text.length > 12)
    ctx.addIssue({ code: 'custom', message: '인게임 토스트 문구는 12자 이하 (calm 윈도 수명 클램프 — CI 경고)' })
})
export type MicroReward = z.infer<typeof MicroRewardSchema>

/** ── 피크-엔드 (F1: 에피소드당 복수 비트) ─────────────────── */
export const PeakEndBeatSchema = z.object({
  beatId: z.string(),               // 'main' | 'passion' | 'resurrection' 등
  line: z.string(),                 // 창작 한 줄 (성경 본문과 시각 구분 — ⑦)
  /** 4정경 복음서만 — 예외 없음. 부활 비트도 복음서 내 본문(마 28:6 등)으로 (G1) */
  verseRef: z.string().regex(/^(마태복음|마가복음|누가복음|요한복음)\s/, '4정경 복음서만'),
  verseText: z.string(),            // 확정 번역본 본문 — 빌드 시 원문 대조(diff) 검증 (F3)
  mood: z.enum(['warm', 'triumphant', 'quiet']),
  /** 다음 장 훅 — playable한 장으로만, 수난 진입은 invitation 문법만 (F6) */
  nextHook: z.object({
    text: z.string(),
    grammar: z.enum(['curiosity', 'invitation']),
  }).optional(),
  /** ep12 등에서 '카드 획득' 어휘를 '함께함'으로 교체 (엔지 low) */
  kicker: z.string().optional(),
  title: z.string().optional(),
  ...reviewable,
})
export const PeakEndSchema = z.object({
  episodeId: z.string(),
  beats: z.array(PeakEndBeatSchema).min(1),
}).superRefine((p, ctx) => {
  // F1 · 공통10: ep12 이원화 강제 — 수난=quiet, 부활=기쁨. 교리적 결함의 기계 차단
  if (p.episodeId === 'ep12') {
    const passion = p.beats.find((b) => b.beatId === 'passion')
    const resurrection = p.beats.find((b) => b.beatId === 'resurrection')
    if (!passion || passion.mood !== 'quiet')
      ctx.addIssue({ code: 'custom', message: 'ep12는 passion 비트(mood=quiet) 필수' })
    if (!resurrection || resurrection.mood === 'quiet')
      ctx.addIssue({ code: 'custom', message: 'ep12는 resurrection 비트(warm|triumphant) 필수 — 부활의 승리를 침묵시키지 말 것' })
    if (passion?.nextHook)
      ctx.addIssue({ code: 'custom', message: 'passion 비트에 nextHook 금지' })
  }
  // F6: 수난으로 들어가는 훅(ep11)은 초대 문법만
  if (p.episodeId === 'ep11')
    for (const b of p.beats)
      if (b.nextHook && b.nextHook.grammar !== 'invitation')
        ctx.addIssue({ code: 'custom', message: 'ep11→ep12 훅은 invitation 문법만 — 수난은 클리프행어가 아니다' })
})
export type PeakEnd = z.infer<typeof PeakEndSchema>

/** ── 발걸음 목표 (구 insight) ─────────────────────────────── */
export const StepGoalSchema = z.object({
  id: z.string(),
  episodeId: z.string(),
  label: z.string(),                // "잔잔한 걸음" — 게임 어휘, 영성 어휘 금지
  description: z.string(),
  rewardAssetId: z.string(),        // 표정 해금 등 실물 보상 필수 — ②-E 매핑표 1:1
  unlocksDripLineId: z.string().optional(), // 달성 시 열리는 드립피드 대사
  ...reviewable,
})
// 판정 정책(G5)은 데이터가 아니라 계약: 미니게임은 '선택된 목표 1개'만 판정·보고한다 (⑥)

/** ── 드립피드 대사 (허브 계약의 첫 실물 소비자 — F9) ──────── */
export const DripLineSchema = z.object({
  id: z.string(),
  companionId: z.string(),
  text: z.string(),
  /** 해금 조건: 항상 열림 / 발걸음 목표 / 에피소드 클리어 */
  gate: z.enum(['free', 'stepGoal', 'episode']).default('free'),
  gateId: z.string().optional(),
  ...reviewable,
}).refine((d) => d.companionId !== 'jesus', {
  message: '[신학 가드] 예수님은 드립피드 대화풀 대상이 아닙니다.',
})

/** ── 복귀 환대 / 알림 문구 — welcome 문구도 감수 대상 데이터로 승격 (신학 medium) ── */
export const RecapCardSchema = z.object({
  episodeId: z.string(),
  summary: z.string(),
  ...reviewable,
})
export interface WelcomeBackModel {
  recaps: RecapCard[]              // 최대 3장, 주기 복귀자는 1장
  resumeLabel: string              // "이어서 걷기 — 갈릴리 바다" (초3 어휘 — '밤 사경' 금지)
  skippable: true                  // 스킵 상시 (타입으로 고정)
}
```

### 지표 저장 구조 (F13: 카운터/버퍼 이원화 · G6: flush 목적지 확정)

```ts
/** 영속 누적 카운터 — 소형 객체, 변경 시에만 저장 (게임D low: 롤오버 왜곡 해소) */
export interface MetricCounters {
  firstEnterAt: Record<string, number>     // 에피소드별 최초 진입 (분모 = first-enter, F11)
  completedAt: Record<string, number>      // 최초 완료
  retries: Record<string, number>          // 재도전 횟수 (완주율과 분리)
  peakEndDwell: Record<string, number[]>   // 비트별 체류 ms 표본 (최근 20개)
  peakEndAdvanced: Record<string, number>  // dwell 충족 후 자발 진행 탭 수
  peopleViewTaps: number                   // '사람들 보기' 선택 수 (감정 반응 프록시)
  visitDays: string[]                      // 방문 일자 셋 (YYYY-MM-DD, 최대 60)
  firstVisitAt: number
}
/** 세션 이벤트 버퍼 — 메모리 전용 최대 300건.
 *  flush 목적지(G6): localStorage 'donghaeng-metrics-debug-v1'
 *  { sessions: [{ startedAt, endedAt, events }] } — 최근 3세션 상한(초과 시 오래된 세션 폐기, 총 ~30KB).
 *  persist 스토어와 키 분리. 유일한 소비처 = ⑨ 플레이테스트 JSON 회수(exportMetrics가 counters와 병합). */
export interface MetricEvent { t: number; name: string; episodeId?: string; detail?: string }

/** 파생 지표 — 계산은 카운터에서만 */
export interface LocalMetricsSummary {
  episodeCompletionRate: number   // completed / firstEnter (고유 기준)
  retryRate: number               // 재도전율 (몰입의 별도 신호 — 완주율 오염 금지)
  peakEndDwellRate: number        // dwell(글자수×150ms+1s) 충족 + 자발 진행 탭 / 피크엔드 노출
  medianSessionMinutes: number
  // d1Return 삭제 (엔지 low: n=1 지표, 스트릭 압박의 싹)
}
```

**북극성(F4·F11) = `episodeCompletionRate × peakEndDwellRate`.** "감동"·"은혜"라는 단어는 지표명·코드·사용자 화면 어디에도 쓰지 않는다. 사용자 노출 화면("나의 여정 데이터")은 사실 서술만: "걸은 장 3 / 12 · 함께된 사람 5 · 다시 걸은 길 4번".

### Zustand 상태 (`src/state/engagement.ts` — 별도 스토어)

```ts
interface EngagementState {
  session: { startedAt: number; hiddenAt: number | null } | null
  lastSeenAt: number | null
  lastWelcomeAt: number | null        // 주기 복귀자 강등 판정
  claimedOnce: string[]               // claimPolicy='once' 이력
  sessionClaims: string[]             // perSession 이력 — persist 제외
  scrapbook: string[]                 // 획득한 scrapbookAssetId (실물 수집)
  stepGoals: string[]                 // 달성한 발걸음 목표
  selectedStepGoal: string | null     // G5: 이번 판 도전 목표 (맵에서 선택, 미선택 시 자동 지정)
  dripUnlocked: string[]              // 열린 드립피드 대사
  dripReadCount: Record<string, number>
  counters: MetricCounters
  buffer: MetricEvent[]               // 메모리 전용 — persist 제외

  beginOrResumeSession: () => void    // F10: grace window 판정 포함 — 호출자는 App.tsx뿐 (G6)
  markHidden: () => void              // 호출자는 App.tsx뿐 (G6)
  claim: (rewardId: string) => boolean
  selectStepGoal: (id: string | null) => void   // G5: 맵의 목표 선택 UI가 호출
  reportStepGoal: (id: string) => void          // 선택 목표와 불일치 시 무시 (판당 1개)
  track: (e: Omit<MetricEvent, 't'>) => void    // 버퍼 push만, 저장 없음
  flushMetrics: () => void            // pagehide 시 1회 → 'donghaeng-metrics-debug-v1' (G6)
  clearMetrics: () => void
  exportMetrics: () => string         // counters + debug 세션 병합 JSON (⑨ 회수용)
}
```

**세이브 정책:** `persist(name: 'donghaeng-engagement-v1', version: 1, migrate)` — 처음부터 version 사용. `partialize`로 `session`·`buffer`·`sessionClaims`·`selectedStepGoal` 제외. 기존 `donghaeng-save-v1`과 키 분리. **track() 경로에 localStorage 쓰기 없음**(F13) — 저가 안드로이드에서 WaterWalkGame rAF 60fps 루프와 충돌하지 않는다.

---

## ④ 모듈/컴포넌트 구조 (기존 src와 정합 — 버스 폐기, F12)

```
src/
├─ content/
│  ├─ schema.ts                  (기존 — 변경 없음)
│  ├─ engagementSchema.ts        (신규 — ③의 Zod 스키마 + 신학 가드 refine)
│  ├─ microRewards.ts            (신규 — ep08 데이터: story-fragment 1, companion-line 8,
│  │                              collect-piece 5 = 인게임 스티커 3 + 드립 열람 파편 2 — G4)
│  ├─ stepGoals.ts               (신규 — ep08 발걸음 목표 3종, rewardAssetId = 표정 3종)
│  ├─ dripLines.ts               (신규 — 베드로 12줄, gate 연결)
│  └─ peakEnds.ts                (신규 — RewardScreen EPISODE_CLOSING 이관, beats 구조)
├─ state/
│  ├─ store.ts                   (기존 — 변경 없음)
│  └─ engagement.ts              (신규 — ③의 EngagementState)
├─ engagement/
│  ├─ api.ts                     (신규 — reportMoment/reportStepGoal/reportEpisode* 함수.
│  │                              화면이 직접 호출. 버스·어댑터 없음 — 현행 completeEpisode
│  │                              직접 호출 패턴과 동일. 미래 허브도 같은 함수를 호출)
│  ├─ rhythm.ts                  (신규 — 순수 함수: (moment, 상태) → 방출할 보상 | null.
│  │                              claimPolicy 판정 포함. api.ts가 호출)
│  ├─ welcome.ts                 (신규 — 환대 조건 판정 + WelcomeBackModel 빌더, 순수 함수)
│  └─ metricsExport.ts           (신규 — counters → 요약 계산 + JSON 직렬화, 순수 함수)
├─ components/
│  ├─ MicroToast.tsx             (신규 — HUD 상단 안전 영역, pointer-events:none,
│  │                              role=status aria-live=polite, 큐잉,
│  │                              수명 = 컨텍스트별: 인게임은 calm 윈도 클램프, 그 외 글자수 비례 — G3)
│  └─ ResumeCard.tsx             (신규 — 타이틀 '이어서 걷기'에 마지막 위치 라벨만 추가 — M5 부속)
├─ screens/
│  ├─ App.tsx                    (수정 — 세션 라이프사이클 유일 오너: mount/visibilitychange/
│  │                              pagehide 리스너 단일 등록 — G6)
│  ├─ TitleScreen.tsx            (수정 — ResumeCard 라벨, welcome 라우팅 판정)
│  ├─ WelcomeBackScreen.tsx      (신규 — 리캡 + '이어서 걷기' + '건너뛰기' 2경로)
│  ├─ JourneyMap.tsx             (수정 — 베드로 드립피드 탭, 발걸음 목표 빈 칸 표시 +
│  │                              목표 1개 선택 UI(selectStepGoal) — G5)
│  ├─ CollectionScreen.tsx       (수정 — 스크랩북 조각·표정·카드 뒷면 + 획득 조각 재열람)
│  ├─ RewardScreen.tsx           (수정 — beats 순차 재생, mood 분기, dwell 계측)
│  └─ WaterWalkGame.tsx          (수정 — calm 진입 시 api.reportMoment(... windowRemainingMs) 호출,
│  │                              선택된 stepGoal 1개만 판정 → api.reportStepGoal)
└─ scripts/
   ├─ verify-review.mjs          (신규 — 감수 해시 검증, 릴리스 빌드 게이트 — ⑩)
   ├─ verify-verses.mjs          (신규 — verseText ↔ 확정 번역본 원문 diff — F3)
   └─ verify-scrapbook.mjs       (신규 — 스크랩북 에셋 ↔ 획득원 1:1 린트 — G4, ⑩)
```

원칙 유지: 엔진(engagement/*)과 콘텐츠(content/*) 분리. 새 장 추가 = 데이터 4파일에 행 추가, 엔진 수정 0.

---

## ⑤ 핵심 플로우 (상태 전이)

### 세션 경계 (F10 — grace window 5분 · G6 — 오너 단일화)
```
[오너] App.tsx 루트 useEffect 1곳만 아래 리스너를 등록한다. 화면·컴포넌트의
       beginOrResumeSession/markHidden/flushMetrics 직접 호출 금지 (코드 리뷰 규칙).

앱 로드 / visibilitychange(visible)
  → session 없음 → beginSession · track('session.start')
  → session 있음 & hiddenAt 존재:
      ├─ now - hiddenAt ≤ 5분 → 동일 세션 연장 (hiddenAt=null) — 카톡 확인 30초는 세션 1건
      └─ > 5분 → endedAt=hiddenAt로 소급 봉합 → 새 세션 시작
visibilitychange(hidden) / pagehide
  → markHidden() (세션 즉시 종료 아님) · pagehide 시 flushMetrics() 1회
      flush 목적지: localStorage 'donghaeng-metrics-debug-v1' (최근 3세션×300건, ~30KB 상한 — G6)
다음 기동 시 미봉합 세션 발견 → endedAt=hiddenAt(또는 lastSeenAt)로 자동 봉합 (R8 유지)
```

### 기동 라우팅
```
세션 시작 후
  ├─ 신규 (진행 0) ────────────────────────────→ title (일반)
  ├─ 공백 < 7일 ──────────────────────────────→ title + ResumeCard 라벨 (2탭 이내 재개)
  └─ 공백 ≥ 7일 AND 보여줄 것 있음* ──────────→ welcome
        *미완 발걸음 목표 ∨ 미열람 드립피드 ∨ 새 playable 장. 없으면 title.
        직전에도 welcome을 본 주기 복귀자 → 리캡 1장으로 축소 또는 title 강등.
     welcome → '이어서 걷기'(map) | '건너뛰기'(title)  ← 스킵 경로 플로우 1급 (UX low)
```

### 플레이 중 마이크로 보상 — **윈도 방출 + 수명 클램프 (F7·G3)**
```
미니게임 → api.reportMoment({ episodeId, moment, window, windowRemainingMs? })
  window: 'open'  — 입력 휴지기 (ep08: waveState==='calm', windowRemainingMs = calm 잔여 ms)
          'held'  — 집중 구간 (holding, warn, wave)
  → rhythm: MicroReward 매칭 → claimPolicy 판정 (once/perSession/onChange)
      ├─ window==='open' → 윈도 진입 0.5초 내 즉시 방출 (실물이면 스크랩북 비행 연출 동반)
      └─ window==='held' → 홀드 큐 → 다음 'open' 윈도 초입 또는 결과 화면 직전 방출
  → 토스트 수명 (컨텍스트 분리 — G3):
      ├─ 인게임(open 윈도): min(글자수×150ms+2s, windowRemainingMs − 300ms)
      │    — calm 종료 300ms 전 페이드 완료. held 구간 시각 잔류 0 (F7 완전 봉합)
      │    — 최악 윈도 4.2s + 초입 방출 → 실표시 ≥ 3.4s. 문구 12자 상한(③ refine)으로 완독 가능
      │    — 조기 페이드로 놓친 내용은 스크랩북/카드 뒷면 재열람(F15)이 커버 — 정보 무손실
      └─ 비집중(결과 화면·맵·컬렉션·드립 마일스톤): 글자수×150ms+2s, 최소 5초 보장 (WCAG 2.2.1)
  → 토스트: 동시 1개, pointer-events:none, HUD 상단
  → 획득한 조각·대사는 전부 스크랩북/카드 뒷면에서 재열람 가능 (F15 — 놓쳐도 손실 없음)
```
- **90초 안전판 폐지.** 맥락 없는 진행률 재고지는 "채우기용 가짜 보상"으로 즉시 간파된다(비신자 medium). 침묵 구간은 콘텐츠다(신학 low — 겟세마네·수난 장의 여백 존중). 리듬 보장은 안전판이 아니라 **reportMoment 계약(장당 3~5개 순간, ⑥)의 데이터 린트**로 달성한다. 구현 주체 모호 문제(엔지 medium)도 함께 소멸.
- ep08의 reportMoment 배치(실측 사이클 기반): 첫 걸음(~15s, held→큐), 첫 calm 진입(~40–60s, open — S1의 첫 방출, `cardback-shard-1`), 파도 1회 통과(open, `sticker-boat`), 중간 지점(open, `sticker-moonpath`), 클리어 직전 마지막 calm(open, `sticker-lamp`). → 30~90초 리듬이 calm 윈도와 자연 일치하고 ②-E 매핑표와 1:1.

### 발걸음 목표 판정 (G5 — 판당 인정 1개)
```
JourneyMap ep08 카드 → 목표 1개 선택(selectStepGoal) — 미선택 시 미달성 중 첫 번째 자동 지정
  → WaterWalkGame: 선택 목표의 조건만 추적 (타 목표 조건 충족은 무시)
  → 달성 시 api.reportStepGoal(id) — 판당 최대 1회, 스토어는 selectedStepGoal 불일치 시 무시
  → 결과 화면에서 표정 해금 연출(②-E 매핑표) + gate='stepGoal' 드립 대사 해금 토스트
```

### 에피소드 클리어 → 피크-엔드 (beats 순차)
```
completeEpisode(id)  (기존 로직 그대로 — store.ts 무수정)
  → WaterWalkGame이 api.reportEpisodeComplete(id) 직접 호출 (F12)
  → RewardScreen: peakEnds[id].beats 순차 재생
      ├─ mood='warm'|'triumphant' → 카드 연출 + 성구 + (playable 다음 장일 때만) nextHook
      ├─ mood='quiet' → 모션 절제(duration 1.5~2배), --dawn-dim 감광, nextHook 없음
      └─ ep12: passion(quiet) → resurrection(triumphant, 성구 = 마 28:6 등 복음서 부활 본문 — G1)
               순서 고정 — 어둠 다음에 기쁨 (F1)
  → dwell 계측: 글자수×150ms+1s 경과 후 사용자의 진행 탭 = peakEndAdvanced++ (F4·UX medium)
  → nextHook 데이터 규칙: 다음 장 playable:false면 생략 (게임D medium — 잠긴 문 앞으로 유인 금지)
     대신 맵의 미완결(발걸음 빈 칸·카드 뒷면 미해금)이 긴장을 이어받는다
```

### 드립피드 (허브 계약의 v0.5 실물)
```
JourneyMap 베드로 탭 → dripLines 중 해금분에서 미열람 우선 2줄 표시
  → 세션당 최대 2줄 (드립피드 = 아껴 흘리기, Hades 모델)
  → 발걸음 목표 달성 시 gate='stepGoal' 대사 즉시 해금 토스트 (숙련 → 관계 보상 직결)
  → 누적 열람 4줄/12줄에 카드 뒷면 파편 지급 (collect-piece 'drip/read-4'·'drip/read-12' — G4)
```

---

## ⑥ 타 시스템과의 인터페이스 (함수 계약 — 버스 폐기)

### `engagement/api.ts` 함수 계약 (F12: 화면이 직접 호출)
```ts
reportMoment(p: {
  episodeId: string
  moment: string
  window: 'open' | 'held'
  windowRemainingMs?: number   // G3: window='open'일 때 필수 — 토스트 수명 클램프의 입력
}): void
reportStepGoal(id: string): void   // G5: 판당 최대 1회. selectedStepGoal과 불일치하면 no-op
reportEpisodeEnter(id: string): void
reportEpisodeComplete(id: string): void
reportPeakEndDwell(beatId: string, ms: number, advanced: boolean): void
readDripLines(companionId: string): DripLine[]   // 허브(미래)도 동일 함수 재사용
```
- **미니게임 시스템의 의무(공통5 — 계약으로 보장):** 장당 `reportMoment` 3~5개 배치. 데이터 린트가 "moment 수 < 3인 장"을 CI 경고로 잡는다. window 판정(입력 휴지기 여부)과 `windowRemainingMs` 산출은 미니게임 소관 — verb마다 휴지기 정의가 다르기 때문(균형=calm, 물류=배치 완료 직후, 리듬=마디 사이). **선택된 발걸음 목표 1개만 판정·보고하는 것도 미니게임의 계약 의무**(G5).
- **store.ts는 그대로다.** engagement는 store를 구독하지 않고, store는 engagement를 모른다. 연결은 화면의 함수 호출 한 방향뿐. 세션 라이프사이클 호출만은 App.tsx가 유일한 오너(G6).

### 셀렉터 계약
```ts
selectResumeLabel(state): string | null              // 타이틀 라벨용 — resume 화면 영속 없음 (M3 축소)
selectCollectionProgress(state): { owned: number; total: number }
selectWelcomeModel(state): WelcomeBackModel | null
selectMetricsSummary(state): LocalMetricsSummary
selectScrapbook(state): ScrapbookEntry[]             // 재열람 경로 (F15)
selectStepGoalForRun(state): StepGoal | null         // G5: 이번 판 도전 목표 (선택 or 자동 지정)
```

### 문구 톤 — 허용/금지 목록 (비신자 low: "수준까지만" 폐지, 목록으로 관리)
| 판정 | 예시 |
|---|---|
| 허용 (초대형) | "오늘의 한 걸음이 기다립니다" · "베드로가 새 이야기를 들려주고 싶어 해요" · "갈릴리 바다가 잔잔합니다" · "다시 만나 반가워요" · "이어서 걸을까요" |
| 금지 (손실·죄책·계량) | "놓친 보상이 있어요" · "3일째 접속하지 않았어요" · "지금 안 오면 사라져요" · "은혜 충전" · "축복 2배" · "감동 도달률 73%" · "연속 출석이 끊겼어요" |
- 이 목록은 `content/toneLint.ts` 금지 패턴으로 코드화 → 사용자 노출 문자열 전수 검사(CI 경고). 신학 어휘("은혜"·"축복")의 마케팅 결합은 금지 패턴에 포함(T5 격상의 기계적 반영).

### 알림(미래) 훅 포인트
`welcome.ts`가 공백 계산의 유일한 장소 → 알림 문구 생성도 여기서만. 알림 문구는 RecapCard와 동일하게 **needsReview 데이터**로 취급(신학 medium 반영).

---

## ⑦ UI 디자인 토큰 적용 (실제 global.css 변수 기준 — F16, 대비 실측치 병기)

> hex는 참고값. 구현은 반드시 CSS 변수 사용 — 신규 hex 하드코딩 금지(코드 리뷰 + 스타일린트).
> 대비는 WCAG 상대 휘도 공식 실측(근사). 플로어: **본문 4.5:1(WCAG 1.4.3), 대형 텍스트·비텍스트 3:1** (공통6).

| 요소 | 토큰 | 실측 대비 | 규칙 |
|---|---|---|---|
| MicroToast 배경 | `var(--panel-2)` (#1b2745) **불투명** | — | 반투명 스크림 금지(F15). 밝은 물결 장면 위에서도 국소 탈락 없음 |
| MicroToast 텍스트 | `var(--parchment)` (#ede3ce) on --panel-2 | **11.6:1** | `var(--serif)`(=Noto Serif KR). 최소 14px, 본문 16px, rem 기반 + OS fontScale 존중 |
| MicroToast 강조(발걸음 배지) | `var(--lamp)` (#f0b24a) on --panel-2 | **7.9:1** | 아이콘+색 이중 부호화(색맹 대응) |
| 토스트 배치·입력 | HUD 상단 안전 영역, `pointer-events: none` | — | press-and-hold 손 가림·onPointerLeave 홀드 풀림 원천 차단 (F7) |
| 토스트 접근성 | `role="status"` (aria-live=polite) | — | **컨텍스트별 수명(G3)**: 비집중 = 글자수×150ms+2s·최소 5초 / 인게임 = calm 윈도 종료 300ms 전 페이드 클램프(문구 12자 상한). 전 조각 스크랩북 재열람 — 조기 페이드에도 정보 무손실이므로 WCAG 2.2.1(Enough Time) 취지 충족, 상태 공지는 4.1.3 |
| 피크-엔드 **성경 본문** | `var(--parchment)` on `var(--ground)` (#0b1020) | **14.9:1** | `var(--serif)` + **「인용부호」 + 출처 병기 필수** (F5) |
| 피크-엔드 **창작 한 줄** | `var(--ink)` · **Noto Sans KR(산세리프)** · 출처 없음 | ≥ 12:1 | 성경 본문과 서체·인용부호로 이중 구분 + 사이 구분선 — 본문/해석 경계 흐리기 차단 |
| 성구 출처 ref | `var(--lamp)` on --ground | **10.1:1** | quiet 무드 시 `--dawn-dim` |
| quiet 무드 감광 | **신규 토큰 `--dawn-dim: #d67e5f`** on --ground | **6.3:1** | 알파 감광 금지(#e98a6b 50% 알파 ≈ 2.7:1 탈락) — 색상 토큰 변형으로만 (UX medium) |
| 양피지 위 텍스트 | **신규 토큰 `--ink-on-light: #3a3020`** on --parchment | **10.2:1** | 스크랩북 조각·카드 뒷면 등 밝은 배경용 (공통6) |
| ResumeCard / WelcomeBack | `var(--panel)` 배경, 테두리 `var(--lamp)` 1px | 본문 11.6:1+ | 주 버튼 기존 `btn-primary` 재사용 |
| 터치 타깃 | `var(--touch)` (44px) | — | **탭 가능한 모든 신규 요소 min 44×44** — 배지·조각·드립피드 탭·목표 선택 포함. 조문 정정(G7): 최소 요건은 **WCAG 2.5.8 Target Size (Minimum, AA) = 24px**이나, 전연령(8세~70대) 제품 기준으로 **2.5.5 Target Size (Enhanced, AAA) = 44px를 자체 채택** |
| 컬렉션 근접 배지 | `var(--lamp)` 텍스트 + 진행 링 | 7.9:1+ | 색만으로 전달 금지 — 숫자 병기 |
| 모션 | Motion, 0.35s easeOut. quiet는 1.5~2배 | — | `prefers-reduced-motion` 시 opacity 페이드만. **선행 조건: global.css:151-154 전역 0.01ms 강제를 opacity 허용 방식으로 리팩터링 (M0, F17)** |
| 집중 미니게임 중 | 시각 토스트 금지(held 윈도) | — | 공통6 — calm 윈도에서만 방출 **+ calm 종료 전 페이드 완료(G3)** — held 잔류 구조적 0 |

카피 가독성: 사용자 노출 문구는 **초등 3학년 독해 수준** 가이드 적용('밤 사경'→'새벽', '사경'류 고어 금지). 신학 감수(⑩)와 별도의 가독성 체크 항목으로 ⑨에 편입.

---

## ⑧ MVP → v1 단계별 로드맵

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **M0. 인프라 선행** (공통7·F3·F17) | git init + vitest 셋업 · **대한성서공회 사용 허락 절차 개시(번역본 확정)** · reduced-motion 전역 강제 리팩터링 · verify-verses/verify-review/verify-scrapbook 스크립트 뼈대 | 테스트 1개 통과 · 번역본 의사결정 문서화 · reduced-motion에서 opacity 전환 동작 |
| **M1. 계측 기반** | engagement.ts 스토어(카운터+버퍼 이원화), api.ts, 세션 grace window, **App.tsx 단일 오너 리스너(G6)**, flush 경로(`donghaeng-metrics-debug-v1`) | S1 플레이에서 전 이벤트 기록 · **hidden 30초 후 복귀 = 세션 1건**(U10) · track() 경로 localStorage 쓰기 0회 · pagehide 후 debug 키에 세션 1건 존재 |
| **M2. 보상 리듬** | engagementSchema, microRewards(ep08: fragment 1·line 8·piece 5 — G4), rhythm.ts, MicroToast(수명 클램프 — G3), 스크랩북 축적 | ep08 1회 플레이에서 **calm 윈도 방출 2~3회**(F7) · **전 토스트가 calm 종료 300ms 전 페이드 완료 — held 구간 시각 잔류 0건**(G3, U14) · 재플레이 세션에서 companion-line 로테이션 방출 확인 · 실물 조각이 컬렉션에 축적 |
| **M3. 재방문 콘텐츠** (F9 — 구 '이어하기'에서 교체) | stepGoals 3종 + **판당 1개 선택·판정 연동(G5)**, dripLines 12줄 + 맵 베드로 탭, 표정 해금, 드립 열람 파편 2종 | 발걸음 3종 각각 달성 가능 · **한 판에서 복수 조건 동시 충족 시 선택 목표만 인정**(U13) — 3종 완수 최소 3판 · 달성 → 대사 해금 체인 동작 · **스크랩북 9종 전부 획득원 도달 가능(1:1 린트 통과 — G4)** · ②-E 산수표의 25~40분 실콘텐츠 성립 |
| **M4. 피크-엔드 데이터화** | **착수 조건: 번역본 확정 + 인용 diff 스크립트 가동(F3) + ep12 부활 비트 성구가 복음서 내 본문으로 확정(마 28:6 기준안 — G1)** · peakEnds.ts 이관(beats), mood 분기, dwell 계측 | ep08 기존 연출 동일 재현 · ep12용 passion+resurrection 2비트 스타일 시연 · verify-verses 통과 · **ep12 데이터가 verseRef 4복음서 refine 통과(U9)** |
| **M5. 복귀 환대 + 이어하기 라벨** | welcome.ts(7일+AND 조건), WelcomeBackScreen(스킵 2경로), ResumeCard 라벨 (구 M3 축소 흡수 — 게임D·엔지) | 조건 분기(신규/7일 미만/7일+유·무 콘텐츠/주기 복귀자) 전부 통과 · 복귀 분기 포함 **재개 2탭 이내** |
| **v0.5** | M0~M5 통합 + 플레이테스트 1차(정성) | ⑨ v0.5 게이트 충족 |
| **v1** | 12장 전체 데이터 · 설정 "나의 여정 데이터"(요약·삭제·내보내기) · 감수 워크플로 실가동(2인 서명) · **옵트인 익명 집계 여부 의사결정** · 수치 플레이테스트(n≥15) | 신학 감수 통과(해시 서명 완비) · 전 장 Zod 검증 · ⑨ v1 게이트 |

의존성: M2·M3은 M1에, M4는 M0의 번역본 확정 + G1 성구 확정에 의존. M3·M5 병행 가능. 미니게임 신작 없이 전 단계 진행 가능(ep08만으로 검증).

---

## ⑨ 테스트 계획

### 단위 테스트 (Vitest — M0에서 셋업)
| # | 대상 | 케이스 | 합격 기준 |
|---|---|---|---|
| U1 | rhythm | claimPolicy='once' 동일 trigger 2회 | 1회만 지급 |
| U2 | rhythm | 미등록 moment | 무시, 예외 없음 |
| U3 | rhythm | perSession 대사: 같은 세션 2회 / 새 세션 | 세션 내 1회, 새 세션에서 다른 풀 대사 방출(로테이션) |
| U4 | rhythm | window='held' moment → 이후 'open' | held는 큐잉, open 윈도에 방출 |
| U5 | welcome | 공백 0/3/7/30일 × 콘텐츠 유/무 × 직전 welcome 유무 | 7일+&유일 때만 모델 반환, 주기 복귀자 리캡 1장 |
| U6 | engagement 스토어 | buffer 301건 push | 메모리 300건 유지, persist에 buffer 부재 |
| U7 | metricsExport | 시나리오 이벤트 시퀀스 | 완주율(first-enter 분모)·재도전율·dwell율 계산 정확 |
| U8 | persist | 재수화 | session·buffer·sessionClaims·selectedStepGoal 제외 확인, version=1 |
| U9 | 스키마 | 전 콘텐츠 데이터 | Zod parse 통과 · **ep12 2비트 refine** · **예수님 격리 refine** · verseRef 4복음서 패턴 — **ep12 resurrection 비트(마 28:6) 통과 포함**(G1 자기모순 재발 방지) |
| U10 | 세션 | hidden 30초 후 복귀 / 6분 후 복귀 | 전자 세션 1건, 후자 봉합+신규 세션 (F10) |
| U11 | toneLint | 금지 문구 목록 삽입 | 전 사용자 노출 문자열에서 검출 |
| U12 | verify-review | 감수 후 본문 1자 수정 / mood만 변경 / review 필드만 변경 | 앞 둘은 contentHash 불일치 → 감수 무효, review 필드 변경은 해시 불변 (G2 범위 검증) |
| U13 | stepGoal 판정 | 한 판에서 3목표 조건 동시 충족 (G5) | **선택된 목표 1개만 달성 처리**, 나머지 미달성 유지 · reportStepGoal 판당 2회 호출 시 2회째 no-op |
| U14 | MicroToast 수명 | windowRemainingMs=3000으로 방출 (G3) | 2700ms 시점 페이드 시작 — held 진입 시점 시각 잔류 0 · 비집중 컨텍스트에서는 최소 5초 유지 |
| U15 | verify-scrapbook | 획득원 없는 에셋 / 획득원 2개인 에셋 (G4) | 둘 다 하드 에러 — 9종 전부 정확히 1개 획득원 |

### 통합 테스트 (Testing Library + jsdom)
| # | 시나리오 | 합격 기준 |
|---|---|---|
| I1 | ep08 클리어 전체 플로우 | game→reward, 성구 렌더, dwell 계측 기록 |
| I2 | 재실행 이어하기 | 시드 후 마운트 → ResumeCard 라벨, 2탭 이내 map |
| I3 | 복귀 환대 | 8일 전 시드+미완 목표 → Welcome 렌더 · **'건너뛰기' 동작** · 주기 복귀자 강등 |
| I4 | 토스트 큐 | moment 3연속 → 동시 1개, 순차, pointer-events:none, calm 종료 시 잔여 큐는 다음 open으로 이월 |
| I5 | reduced-motion | 미디어쿼리 모킹 → opacity 페이드만 (M0 리팩터링 전제) |
| I6 | ep12 2비트 | passion(quiet, hook 없음) → resurrection(triumphant) 순차 재생 |
| I7 | **성경/창작 구분** (F5) | 성구에 인용부호+출처 존재, 창작 라인은 산세리프·출처 부재 — DOM 단언 |
| I8 | 접근성 | 토스트 role=status, 컨텍스트별 표시 시간(G3), 대비 토큰 클래스 적용 |
| I9 | 목표 선택 플로우 (G5) | 맵에서 목표 선택 → 게임 진입 → 해당 목표만 HUD 표시·판정, 미선택 진입 시 자동 지정 |

### 플레이테스트 게이트 (F18 — 층화·정성/수치 분리)
**표본 (v0.5·v1 공통):** n≥10 · **비신자·무교 ≥50%** · 아동(8~12) 2인+ · 60대+ 2인+ · 저시력/색각 1인+ · 비게이머 포함.

**v0.5 게이트 (정성 — n<15에서 0건/100% 수치 게이트는 통계가 아니므로 사용 금지):**
- 발화 기록·행동 관찰 프로토콜: 첫 3분 내 이탈 시도, 토스트 인지·오독(특히 인게임 조기 페이드에서 "놓쳤다"는 발화 후 스크랩북 재열람 경로를 스스로 찾는가 — G3 검증), 잠긴 장 탭 시 반응, "어디서 멈칫했는가"
- 복귀 화면: 시계 조작 시연 후 **문구 인상 리커트(가식적↔따뜻함, 부담↔편안함)** — "죄책감 0건" 게이트는 실제 공백을 겪지 않은 피험자에게 측정 불가하므로 v1 종단 테스트로 이관(엔지 medium)
- **"설교처럼 느껴졌다": 비신자 응답자 기준 0건** (F18 — 우호 표본 무력화)
- 재미 지표 추가(공통5): "또 하고 싶다" / "지인에게 보여주고 싶다" / "조각을 더 모으고 싶다" 리커트 5점 중앙값 ≥ 3.5
- 발걸음 목표 재도전 관찰(G5): 목표 선택 UI를 이해하는가, 2번째 판에 다른 목표를 스스로 고르는가
- **지표 JSON 회수 절차 명문화(비신자 medium):** 세션 종료 시 진행자가 내보내기 버튼으로 JSON 수집(counters + `donghaeng-metrics-debug-v1` 병합 — G6) → 완주율·이탈 지점 오프라인 분석. 로컬 지표 모듈이 "설정 화면 장식"이 되지 않게 하는 유일한 개발 피드백 경로(옵트인 집계 결정 전까지)
- 재개 2탭 이내: 전 피험자 태스크 성공(관찰)

**v1 게이트 (수치 — n≥15):**
- 3분 내 첫 동료 합류 도달 ≥ 80% · 세션 중앙값 3~10분 · D1~7 자발 재방문 세션 ≥ 2회(발걸음/드립피드 소비 확인)
- 2주 간격 종단 재소환: 복귀 화면 부담 응답 0건 (진짜 복귀 정서로 측정)

---

## ⑩ 신학 체크포인트 + 감수 게이트의 코드화

### 감수 항목 (전부 스키마 `review` 필드로 추적 — 문서 선언 아님)
| # | 항목 | 상태 (v1 대비) |
|---|---|---|
| T1 | peakEnds 전 장 beats(창작 line + verseText) — 특히 ep03·ep11 훅·ep12 2비트 | **감수 필요** — ep12 부활 비트 성구는 복음서 내 본문(마 28:6 기준안, 눅 24:5-6 대안) 중 최종 선택을 감수로 확정(G1) |
| T2 | 성경 번역본·저작권 | **M0 선행 과제로 격상** (F3) — 절차 개시 없이 M4 착수 금지 |
| T3 | microRewards·dripLines 전 문구 (이단식 재해석 어휘 금지 목록 운용) | **감수 필요** — needsReview 기본 true로 전수 포함 (F2) |
| T4 | ep12 연출·어휘 (kicker/title 오버라이드로 '카드 획득'→'함께함') | **감수 필요** — 스키마 필드로 구현 가능해짐 |
| T5 | 복귀·알림 문구 | **감수 필요로 격상** — RecapCard·알림 문구를 needsReview 데이터로 승격, toneLint 병행 |
| T6 | 명칭 확정: '통찰' → **'발걸음 목표'** | **해소** — 영지주의 뉘앙스·"믿음=실력" 역오해 동시 회피. v1 데이터 작성 전 확정 완료 |
| T7 | 지표 명칭·사용자 노출 표현 | **해소** — '감동 순간 도달률' 폐기(F4), 노출 화면은 사실 서술만, 계량+신학 어휘 결합은 toneLint 금지 패턴 |

### 감수 워크플로 (공통3 — 상설 게이트)
감수 주체: **통합측 목회자 2인 이상.** 절차: 데이터 PR → 감수자 검토 → `review: { reviewedBy: ['...','...'], reviewedAt, contentHash }` 기입 → 병합. 반려 시 사유 코멘트 → 수정 → 재검. 본문 수정 시 해시 불일치로 **감수 자동 무효**.

### contentHash 계산 범위 정의 (G2 — `src/lib/hash.ts`)
```ts
/** 해시 범위: review·needsReview 두 필드만 제외한 객체 전체.
 *  - 노출 텍스트(text/line/verseText/kicker/title/label/description/summary)뿐 아니라
 *    의미를 결정하는 구조 필드(mood·grammar·verseRef·gate·kind·trigger·id)까지 전부 포함
 *    — "문구는 그대로 두고 무드·훅 문법만 바꿔 감수를 우회"하는 구멍을 차단한다.
 *  - review·needsReview 자체는 제외 — 감수 서명 기입이 해시를 바꾸면 서명 즉시 무효가 되는 순환 방지.
 *  - 직렬화: 키를 재귀 정렬한 canonical JSON → SHA-256 hex. 필드 순서 변경은 해시 불변(U12). */
export function hashContent(item: Record<string, unknown>): string {
  const { review, needsReview, ...rest } = item
  return sha256hex(canonicalJson(rest))   // canonicalJson: 객체 키 재귀 정렬 후 JSON.stringify
}
```

### CI 규칙 (코드 스케치 — `scripts/verify-review.mjs`)
```ts
// 릴리스 빌드 게이트: dev는 경고, 프로덕션은 실패 (공통3 + 엔지 low 절충)
import { allReviewables } from '../src/content/reviewIndex'
import { hashContent } from '../src/lib/hash'

const failures: string[] = []
for (const item of allReviewables()) {
  if (!item.needsReview) continue                    // 감수자가 명시 해제한 항목만 통과
  if (!item.review) failures.push(`${item.id}: 미감수`)
  else if (item.review.reviewedBy.length < 2) failures.push(`${item.id}: 감수 서명 2인 미만`)
  else if (item.review.contentHash !== hashContent(item))
    failures.push(`${item.id}: 감수 후 본문 변경 — 재감수 필요`)
}
if (failures.length) {
  console.warn(failures.join('\n'))
  if (process.env.RELEASE === 'true') process.exit(1)  // 릴리스만 하드 실패
}
```
추가 CI 검사: ① `verify-verses.mjs` — verseText를 확정 번역본 원문과 diff, 불일치 시 하드 에러(공통4) ② 예수님 격리 refine은 Zod parse 시점에 항상 하드 에러(공통1 — dev에서도 실패) ③ toneLint 금지 패턴(U11) ④ 장당 reportMoment 목록 3개 미만 경고(⑥ 계약 린트) ⑤ `verify-scrapbook.mjs` — 스크랩북 에셋 ↔ 획득원(stepGoals.rewardAssetId ∪ microRewards.scrapbookAssetId) **1:1 검증, 고아·이중 배정 하드 에러**(G4) ⑥ 인게임 토스트 문구 12자 초과 경고(G3).

---

## ⑪ 리스크와 완화책

| # | 리스크 | 영향 | 완화책 |
|---|---|---|---|
| R1 | 마이크로 보상 남발 → 과잉정당화 | 몰입의 질 하락 | 장당 moment 3~5개 상한, once/perSession 정책, 안전판 폐지(맥락 없는 보상 0), quiet 무드 장은 companion-line 풀 자체를 소형화 |
| R2 | 토스트가 집중 플레이 방해 | 플로우 파괴 | **윈도 방출로 재정의(F7) + calm 종료 클램프(G3)** — held 윈도 큐잉, open 윈도(입력 휴지기)만 방출, calm 종료 300ms 전 페이드 완료, pointer-events:none, HUD 상단. S1·M2와 모순 없음, held 잔류 구조적 0 |
| R3 | 복귀 리캡의 "밀린 숙제" 오독 | 윤리 목표 실패 | 7일+AND 조건, 손실 어휘 toneLint, 3장 상한, 스킵 상시, 주기 복귀자 강등. 게이트는 v1 종단 테스트 |
| R4 | 로컬 지표의 개인정보 오해 | 신뢰 손상 | 서버 전송 코드 부재 + 열람·삭제·내보내기 제공 + README 명시. debug 키도 로컬 전용·3세션 상한(G6). 옵트인 집계는 v1 전 별도 결정 |
| R5 | 스토어 이중화(store/engagement) 불일치 | 버그 | 연결은 화면→api.ts 함수 호출 단방향뿐. store↔engagement 상호 구독 금지. 버스·어댑터 없음(F12)으로 간접화 자체를 제거. 세션 API는 App.tsx 단일 오너(G6) |
| R6 | 세이브 스키마 진화 | 진행 손실 | persist version=1 + migrate 처음부터, 키 분리 |
| R7 | 피크-엔드 데이터화 중 ep08 연출 퇴행 | 슬라이스 품질 저하 | M4 완료 기준 "기존 연출 동일 재현", I1 회귀 |
| R8 | visibilitychange 미발화/과발화 | 지표 왜곡 | **grace window 5분(F10)** + pagehide 병행 + 다음 기동 시 미봉합 세션 자동 봉합. U10으로 고정 |
| R9 | 재방문 콘텐츠(M3) 제작 지연 | 리텐션 검증 불능 | 드립피드 12줄·발걸음 3종은 텍스트+판정 플래그 수준의 소형 산출물. M3 미완이면 v0.5 게이트 자체를 열지 않음(측정 대상 없는 테스트 금지) |
| R10 | 감수 병목(2인 서명)으로 릴리스 정체 | 일정 지연 | dev 빌드는 경고만 → 개발 비차단. 감수는 데이터 PR 단위 소분할, 반려 사유 코멘트로 재작업 최소화 |
| R11 | 스크랩북 실물 에셋(스티커·표정) 제작 비용 | M2·M3 지연 | 표정 레이어 교체 파이프라인(GDD ⑨ 일관성 전략) 재사용, 배경 스티커는 기존 배경 크롭으로 1차 제작 |
| R12 | *신규* — 판당 목표 1개 선택(G5)이 진입 마찰 | 재도전 의욕 저하 | 미선택 시 자동 지정(추가 탭 0), 선택 UI는 ep08 카드 내 원탭 토글, 결과 화면에서 "다음 목표 도전" 원탭 제안(다음 미달성 목표 자동 선택 후 재입장) |
