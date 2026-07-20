# 상세 플랜 — 미니게임 프레임워크 (Minigame Framework) v3

> *동행: The Gospel Road* — 5동사(퍼즐·물류·리듬·균형·추리) 미니게임의 공통 계약·등록 구조·입력 추상화·난이도·실패 처리·**보상 리듬** 프레임워크.
> 버전 0.3 · 2026-07-20 · 상위 문서: [`../GDD.md`](../GDD.md) · [`../ENGAGEMENT.md`](../ENGAGEMENT.md)
> 기준 구현: `src/screens/WaterWalkGame.tsx` (8장, 수직 슬라이스 v0.1). 1차 검증(신학·게임D·엔지니어링·UX·비신자 게이머) 전면 반영 + **2차 재검증 잔여 지적 5건 해소**.

---

## v3 변경 로그 (2차 재검증 반영)

| # | 출처 | 잔여 지적 (FIX/HIGH) | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| R1 | 신학 8.8 | 실패 성구 '1줄 축약'이 런타임 절단 — 감수(contentHash) 밖의 말씀이 화면에 노출, 반쪽 인용 금지 원칙과 충돌 | §③ `failVerseShort`/`clearVerseShort`, §⑤ 반복 정책, §⑩-9 신설, T-27 | 축약본을 **별도 감수 텍스트 단위**(`VerseSchema`, reviewed+contentHash 검증)로 정의에 등록. 셸의 런타임 문자열 절단 코드 경로 자체를 금지. **절 경계 존중 refine**(축약=한 절 온전 인용, 전문 ref의 절 범위 내) 스키마 강제. '성구 반복 노출 정책(축약·생략 단계)' 자체를 §⑩ 감수 항목 **9번**으로 명문화 |
| R2 | 게임D 8.5 | 재미 게이트가 M0 8장 1회뿐 — 동사별 재미 문법이 다른데 리듬·물류·추리는 무검증 출시 | §⑧ M1·M2·v1 완료 기준, §⑪ | **동사 첫 코어 완성 마일스톤마다 소형 재미 게이트**(외부인 2~3명·자발 재플레이 의향 과반): M1 리듬+퍼즐, M2 물류, v1 추리. v1 완료 기준에 **"5동사 전부 게이트 통과 기록"** 명문화. 미달 시 해당 동사만 확장 동결(타 동사·셸 작업은 계속 — 전면 병목 방지) |
| R3 | 엔지 8.5 | persist migrate(0→1) 변환 명세 공백 — 기존 세이브가 '에피소드 완료·미니게임 미클리어' 모순 영속 위험 | §③ 스토어 확장(migrate 코드), §⑧ M0, T-23 | `gentleMode→gentleDefault` 이관, `minigameCleared` 백필 규칙(**완료 에피소드 소속 ids 전원 true** — 안전측 상향) 코드 수준 확정. T-23에 v0 세이브 회귀 케이스 2종 고정 |
| R4 | 엔지 8.5 | 메타 스키마 스니펫 내부 불일치(refine이 참조하는 `difficulty` 부재, CI가 순회한다는 `howTo` 등 shape 누락) — 노출 텍스트 전수 검사가 실제로는 일부를 건너뜀 | §③ 스키마 전면 갱신 + **감수 경로 1:1 대응표** + `REVIEWED_TEXT_PATHS`, T-33 | `difficulty`(normal/gentle record)·`howTo`·`graceBeat`·`checkpoint`를 shape에 실재화. goalLine·howTo·title·subtitle·label을 `ReviewedTextSchema`로 승격. 노출 텍스트 목록 ↔ 스키마 필드 1:1 대응표를 문서·코드(상수) 양쪽에 두고 정합을 테스트(T-33)로 보증 |
| R5 | UX 8.8 | 광과민성(WCAG 2.3.1, Level A) 안전 한계 부재 — 고빈도 판정 시 플래시 임계 침범 가능, 기본 상태의 발작 안전은 reduced-motion과 별개 | §④ juice 안전 계약, §⑦ 모션 규칙, T-31, §⑪ | `impact.ts` 계약으로 고정: **전체 화면 휘도 플래시 금지·플래시 ≤3회/초(슬라이딩 윈도우)·면적 ≤ 뷰포트 25%·적색 플래시 금지·판정 빈도 >3Hz 시 비플래시(링 파동+햅틱) 자동 강등**. 코어는 이벤트만 발생 — 리미터 우회 불가. 자동 테스트 T-31 |
| R6 | 비신자 8.3 | 재클리어(통찰 재도전) 루프의 반복 연출 정책 부재 — 5~6시간 리텐션 루프가 '매판 성구 세리머니'화 | §②-F, §⑤ 재클리어 정책, §③ `clearVerseShort`, T-32 | 실패 반복 정책과 **동급의 재클리어 반복 정책** 신설: 2회차+ 클리어는 grace 단축(≤800ms)/탭 스킵·감수 축약 성구(미등록 시 생략)·감정 버튼 생략·즉시 보상 요약. **신규 통찰 달성 판만 특별 연출 유지**. 테스트 T-32 |
| R7 | 엔지(부가) | 공수 산정 부재 | §⑧ 공수 표 | 마일스톤별 1인 개발 공수(주 단위)·불확실성 표 추가 |

---

## v2 변경 로그 (1차 검증 반영 — 기록 유지)

1차 검증의 필수수정(mustFix) 24건 + 공통 지침 10건 대응표. (H)=high 이슈 동시 해소.

| # | 출처 | 필수수정 요지 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| T1 | 신학 | 감수를 M0/M1로 전진 배치, 성구는 감수 후 등록 | §⑧ M0/M1, §⑩-A | 성구 확정·마 14:31 온전 인용 감수를 **M0 완료 기준**에 포함. "감수 1차"를 M1 이전 상설 게이트로 전환 |
| T2 | 신학 | needsReview 옵트인 → 옵트아웃 + 승인 기록, 미승인 시 빌드 실패 | §③ `ReviewedSchema`, §⑩-A | `reviewed: null`이 기본(=미감수). `by/date/version/contentHash` 기록 필수. 해시 불일치·null 시 **프로덕션 빌드 실패**(CI 스크립트 §③) |
| T3 | 신학 | "그분이 여신다"를 문구가 아니라 기제로 | §⑤ `grace` 비트, §③ `graceBeat` | clear/fail 양쪽에 **조작 불능 '붙드심' 구간**을 셸 수명주기 공통 단계로 신설. 감수 대상을 문구→기제 구조로 확대(§⑩-3) |
| T4 | 신학·엔지 | verse ref 4복음서 검증 실제 구현 + 개역개정 저작권 | §③ `GOSPEL_REF` regex, §⑧ M1 | Zod regex 스키마에 실재. 대한성서공회 협의(또는 대체 역본 확정)를 **M1 완료 기준**으로 명시 |
| T5 | 신학 | 예수님 발화·행동 플레이어 선택지 금지 + solemn 플래그 | §③ `agency`/`solemn` refine, §⑥ 금지 계약, §⑩-5·6 | Zod superRefine으로 `speaker==='jesus'` 선택지 하드 에러. `solemn: true` 시 insightGoals·앰버 축하 연출 셸 차원 비활성(스키마로 강제) |
| G1 | 게임D·엔지 | registry 1:N (minigameId 키) + 클리어/완료 분리 | §③·§④·§⑤, T-11 재정의 | `Record<minigameId, Def>` + `episodes.ts`의 `minigames: { ids, clearRule }`. 셸은 미니게임 클리어만 보고, 에피소드 완료는 스토어가 clearRule로 판정 |
| G2 | 게임D | 마이크로 보상 채널(reportMoment) | §③ `moment()`, §⑤ | 코어 API 5번째로 `moment(id)` 추가. 소진 정책 kind(once/perSession/onChange)별 분리. moment 문구도 감수 파이프라인 탑재 |
| G3 | 게임D | 재입장 사유 최소 1개를 M2로 | §③ 통찰 티어, §⑧ M2 | 다층 통찰(게임당 2~3개) + **데일리 변주 시드**를 M2 필수 편입. 변형 모드는 v1 |
| G4 | 게임D | failStreak 스코프 + 성공측 DDA | §③·§⑤, T-06 | failStreak를 스토어에서 제거, **셸 세션 로컬**(마운트 시 0). 순항 감지 시 플레이 중 통찰 목표 제시(천장 DDA) |
| G5 | 게임D·비신자 | 로컬 계측 + 재미 지표 | §⑨ 계측/P-군 | IndexedDB 이벤트 로그(수동 내보내기) M2 필수. '또 하고 싶다 ≥70%'·추천 ≥50%·자발 재입장 ≥50%·실측 세션 길이 합격 기준 추가 |
| E1 | 엔지 | (G1과 동일) registry 재설계 | §③·§④ | 상동 |
| E2 | 엔지 | setHud 렌더 경로 명세 | §③ `HudStore`, T-30 | HUD는 외부 vanilla 스토어 + `useSyncExternalStore`(rAF 정렬). "playing 중 셸 루트 리렌더 0" 테스트로 보증 |
| E3 | 엔지 | verse regex 실제 구현 | §③ | 상동(T4) |
| E4 | 엔지 | fail 없는 정의 타입 레벨 차단 | §③ `mode` 판별 유니온 | `NoFailCoreProps`는 `report`의 outcome 타입에서 `'fail'` 제거 — 컴파일 불가. T-12를 타입 테스트로 대체 |
| E5 | 엔지 | persist version+migrate를 M0 작업으로 | §⑧ M0 | `version: 1` + migrate 도입을 M0 첫 주 작업으로 명시. **v3에서 변환 규칙 코드 수준 확정(R3)** |
| U1 | UX | 키보드/스위치 대안 입력 1급 | §③ 훅 계약, §④, T-09/10 병렬 | 훅 4종 전부 키보드 동등 경로 기본 내장(코어가 아니라 훅이 구현). useDrag 탭-선택 대안(WCAG 2.5.7) |
| U2 | UX | reduced-motion 정적 대체 부호 | §⑦, §③ `HudMeter.lowIndicator` | 펄스를 형태 부호로 불인정. 정적 아이콘·테두리 두께 변화로 대체, 모션 정지 시 비가시 위험 판정 금지 테스트(T-26) |
| U3 | UX | dialog 시맨틱 + aria-live + axe | §④ 셸 책임, T-25 | 오버레이 4종 role/aria-modal/포커스 트랩/초기 포커스 셸 소유. HUD 메시지 aria-live. axe-core 자동 검사 |
| U4 | UX | 토큰 표를 CSS 변수 기준으로 | §⑦ | 전면 재작성(`var(--ground)` 등, 실제 `--serif: 'Noto Serif KR'` 반영). raw hex 사용을 §⑥ 금지 계약에 추가 |
| U5 | UX | 최소 텍스트 크기 + 비텍스트 대비 3:1 | §⑦ 대비 실측표 | `--text-min: 14px`(성구·안내 16px+), 12px대 금지. 미터 트랙 1.3:1→3.2:1 개정. 실측치 표 병기 |
| P1 | 비신자 | 재미·추천 지표 + 비신자 코호트 | §⑨ P-군 | 비신자 게이머 2~3인 별도 코호트, 재미 지표 신설(G5와 통합) |
| P2 | 비신자·신학 | 실패 성구 반복 노출 정책 | §⑤, §③ `failComforts[]` | 1회차 전문 → 2회차 축약 → 3회차+ 생략·즉시 재도전. **v3에서 축약을 감수 텍스트 단위(`failVerseShort`)로 승격(R1) — 런타임 절단 금지** |
| P3 | 비신자 | M0에 8장 재미 게이트 | §⑧ M0 완료 기준 | 외부인 3명 플레이 → 자발 재플레이 의향 2/3 미만이면 프레임워크 확장 동결. **v3에서 동사별 게이트로 확장(R2)** |
| P4 | 비신자 | juice 계층 M0~M1 승격 | §④ `shell/juice`, §⑧ | 판정·클리어 연출/SFX 타이밍/햅틱 공통 계층을 M0(v0)~M1(완성) 범위로 이동. **v3에서 광과민성 안전 계약 추가(R5)** |

공통 지침 10건: ①예수님 격리(§③ refine·§⑥) ②마 14:31 기제 재설계(§⑤ grace) ③상설 감수 게이트(§⑩-A) ④저작권+인용 diff(§⑧ M1·§③ CI) ⑤재미 실체(§②-E·§⑥ 능력 매트릭스·§⑧ 경제 산수) ⑥접근성 실측 플로어(§⑦) ⑦git init+vitest 선행(§⑧ M0) ⑧실코드 정합(§② D·§③ 1:N·§⑧ persist) ⑨토큰 통일(§⑦) ⑩ep12 이원화(§⑤·§⑧ v1).

**미해소·조건부 항목**: 없음. 단, 리듬 오디오 캘리브레이션은 "지금 결정 불요" 의견을 따라 M2에 API 자리(`offsetMs`)만 예약하고 구현은 v1(§⑧) — 사유: 리듬 코어 자체가 v1 범위.

---

## ① 목표와 범위

### 목표
1. **"엔진은 거의 안 바뀌고, 콘텐츠는 계속 늘어난다"** (GDD §10): 새 미니게임 추가 = 정의 파일 1개 + 코어 컴포넌트 1개 등록. 셸/스토어/라우팅 수정 0.
2. 12장 아크 전체(**총 17개** 미니게임, §⑧ 산수표)가 동일 수명주기 계약(mount → intro → play ⇄ pause → **grace** → clear/fail → 결과)을 공유한다.
3. ENGAGEMENT 원칙의 기계적 보증: 무손실 재도전, 관대 모드, 낮은 바닥/높은 천장, 44pt 터치 타깃, **키보드/스위치 동등 입력**, **30~90초 마이크로 보상 리듬**, **광과민성 플래시 상한** — 개별 게임이 기억해서 지키는 게 아니라 셸·훅·스키마가 강제한다.
4. **신학 가드는 코드다**: 4복음서 ref regex, 감수 승인 해시, 예수님 격리 refine, solemn 연출 차단, **축약 성구도 감수 단위로 등록(절단 금지)** — 전부 Zod + CI 하드 에러 (§③).
5. **신앙 전제 없이도 순수 게임으로 재밌어야 한다**: 판정 juice, 실체 있는 통찰 보상, 능력의 체감 유용성, 재입장 사유를 프레임워크 계약 수준에서 보장하고, **동사별 재미 게이트**(§⑧)로 5동사 전부 검증 후 출시한다.

### 범위 (In)
- 공통 계약 타입(`MinigameDefinition<P>`, 코어 Props 2종, `MinigameResult`), **minigameId 기준 1:N 레지스트리**
- 공통 셸: 오버레이 4종 + grace 비트 + HUD(외부 스토어 구독) + **juice 계층**(연출·SFX 타이밍·햅틱·**플래시 안전 리미터**)
- 입력 훅 4종(홀드·탭·스와이프·드래그) — **포인터+키보드 이중 경로 기본 내장**
- `useSimLoop`(rAF+dt 클램프+가드), 순수 함수 틱 로직 분리
- 난이도 프로파일(병합=덮어쓰기 확정) + 양방향 DDA(바닥 낮추기·천장 올리기) + 다층 통찰
- 실패 처리(무손실·붙드심 비트·**감수 축약본 기반** 성구 반복 노출 정책·원탭 재도전·관대 초대)
- **재클리어 반복 연출 정책**(2회차+ 클리어의 세리머니 절제 — 실패 정책과 동급)
- 마이크로 보상 채널 `moment()` + 소진 정책
- 감수 파이프라인(ReviewedSchema·contentHash·CI 게이트·**감수 경로 1:1 대응표**·감수 목록 추출)
- 로컬 계측 로그(IndexedDB, 오프라인, 수동 내보내기)
- 스토어 확장(insights·에피소드 완료 판정·persist version 1 + **migrate 변환 명세**)과 WaterWalk 마이그레이션

### 비범위 (Out)
- 각 미니게임의 개별 콘텐츠 설계(에피소드별 플랜) — 단, 본 문서의 계약·경제 산수를 준수
- inkjs 대화 심화, 허브/관계 시스템 본체, 컬렉션 UI (인터페이스만 §⑥)
- 서버/랭킹(영구 배제), 멀티플레이
- 원격 텔레메트리(네트워크 금지 유지 — 계측은 로컬 온리)

---

## ② 플레이어 경험 시나리오

**시나리오 A — 처음 만나는 미니게임 (7장 오병이어, 물류)**
1. 여정 맵 카드 탭 → (탭 시점에 코어 프리로드 시작) 인디고 배경 유지 페이드 인 → 인트로 오버레이: 제목·한 문장 목표·시작 버튼(하단 엄지 존). 자동 시작 없음.
2. 규칙은 점진적 공개 — 첫 바구니를 집을 때만 드래그 힌트. 재도전 시에는 `sessionMemo`에 남은 플래그로 힌트 재노출 안 함.
3. 플레이 중 30~90초마다 마이크로 보상: 첫 무리에게 바구니가 닿으면 `moment('first-served')` → HUD에 "아이가 웃으며 받아 들었다" + 짧은 스팅어 + 가벼운 햅틱. 같은 moment는 소진 정책에 따라 반복되지 않는다.
4. 일시정지는 ⏸ 버튼(← 아님 — 어포던스 혼동 제거) → PauseOverlay("숨을 고르고 계속하세요", '계속'이 초기 포커스, '나가기'는 보조).
5. 클리어 → **grace 비트**(입력 잠금 1.5~2.5초: 나눠진 바구니가 사람 손을 넘어 불어나는, 플레이어 조작 밖의 연출) → 성구 카드 → 감정 버튼 **+ 중립 '계속' 병렬**(어느 쪽이든 보상 동일) → 보상 화면.

**시나리오 B — 실패와 재도전 (8장 물위걷기, 균형)**
1. 집중 0 → 가라앉기 시작 → **즉시 게임오버가 아니라 붙드심 비트**: 입력이 잠기고, 손이 내밀어져 붙잡히는 연출("말씀과 붙잡으심은 한 동작"). 위기의 해소는 플레이어 조작이 아니다.
2. 그 후 위로 오버레이: 감수 확정된 **온전한 인용**(반쪽 편집 금지, 최종 본문은 §⑩ 감수로 확정) + "실패해도 잃는 것은 없습니다" + 원탭 "다시 걷기".
3. **반복 노출 정책**: 2회차 실패는 **감수 등록된 축약본 `failVerseShort`**(절 경계 존중 — 한 절 온전 인용, §③) + 재도전 버튼 우선, 3회차부터는 성구 생략·위로 문구 로테이션(`failComforts[]`, 전부 감수 통과분)·즉시 재도전. 화면에 나가는 말씀은 전문이든 축약이든 **전부 감수·해시 검증을 거친 텍스트 단위**다 — 런타임 절단은 코드 경로 자체가 없다.
4. 2회 연속 실패(이 게임 세션 한정) 시 조용한 관대 모드 초대. 다른 게임에 들어가면 카운터는 0부터.

**시나리오 C — 숙련자의 높은 천장**
1. 첫 세션 중에도: 셸이 순항(예: 집중 70%+ 30초 지속)을 감지하면 플레이 중 통찰 목표를 슬쩍 제시 — "지금처럼 흔들리지 않고 끝까지?" (천장 DDA).
2. 통찰 달성 보상은 텍스트 한 줄이 아니다: **특별 클리어 연출**(황금 물결 grace 비트 변주) + 스크랩북 스티커 + **동료 반응 대사 즉시 해금**(로컬 대사 뱅크, ink 연동 전 M2부터) + 묵상문(선택 열람). §②-E 표 참조.
3. 재입장 사유: 게임당 통찰 2~3층(발견/숙련/묵상) + **오늘의 물결**(날짜 시드 파라미터 변주, 놓쳐도 소멸·보상 차감 없음 — FOMO 아님).

**시나리오 D — 중단과 복귀 (실코드 정합)**
1. 플레이 중 전화 → `visibilitychange`로 자동 일시정지.
2. 앱을 완전히 닫았다 열면 → **타이틀 화면**(현행 `store.ts` partialize는 `screen`을 저장하지 않음 — 기존 플랜의 "맵 복귀" 서술은 오류였음) → '이어하기' 탭 → 맵. store 주석 불일치 수정을 M0 작업에 포함.
3. 세션 3분 이하 게임(균형·리듬)은 도중 상태 비저장(잃는 것은 1~3분). **3분 초과 게임(물류·추리·퍼즐 일부)은 `checkpoint: true` 정의 시 국면 단위 스냅샷**을 별도 키에 저장 — 5분짜리 물류 도중 앱이 죽어도 국면부터 재개. 클리어/명시적 나가기 시 스냅샷 삭제.

**시나리오 E — 재미의 실체 (보상 레이어, 신앙 전제 없음)**

| 층 | 트리거 | 보상 (전부 비수치·비교 불가) |
|---|---|---|
| 마이크로 (30~90초) | `moment()` | HUD 한 줄 반응 + SFX 스팅어 + 햅틱. 예: 물위걷기 50% 지점 "베드로가 반쯤 왔다 — 파도 소리가 멀어진다" |
| 판정 juice (즉시) | 훅 판정 이벤트 | 국소 플래시(≤3회/초)/링 파동/햅틱 임팩트 — 셸 juice 계층이 공통 제공, 코어는 이벤트만 발생 |
| 클리어 (세션 끝) | grace → clear | 붙드심 연출 → 성구 카드 → 동료 영입/일러스트 카드 |
| 통찰 1층 "발견" | 첫 클리어 | 동료 능력 해금 — **다음 장에서 수치로 체감**(§⑥ 매트릭스) |
| 통찰 2층 "숙련" | 도전 목표 | 특별 클리어 연출 변주 + 스크랩북 스티커(코스메틱) + 동료 반응 대사 |
| 통찰 3층 "묵상" | 변주/숨은 조건 | 스토리 비네트 1편 해금 + 묵상문(**선택 열람** — 강요 없음) |

**시나리오 F — 재클리어 루프 (통찰 재도전, 리텐션의 실제 촉감)**
1. 8장 재입장(이미 클리어한 게임) → 인트로에 남은 통찰 목표 배지·최단 진입("시작" 초기 포커스 그대로 1탭).
2. 재클리어 → grace 비트 **0.8초 이내 + 탭으로 즉시 통과 가능** → 성구는 **감수 축약본 `clearVerseShort` 1줄**(미등록 게임은 생략) → 감정 버튼 없이 **보상 요약 한 줄 + '계속'** → 맵. 클리어 후 오버헤드 총 3초 이내(T-32).
3. 단, 이번 판에 **신규 통찰을 달성**했다면 그 티어의 특별 연출(황금 물결 변주·스티커 수여)은 정상 재생 — 새 성취의 세리머니는 깎지 않는다. 이미 딴 통찰의 반복 클리어만 절제한다.
4. 결과: 통찰 노가다 5~6시간 루프에서 플레이어가 반복 체감하는 것은 '설교 카드'가 아니라 **핵심 플레이 → 즉시 다음 판**이다.

---

## ③ 데이터 모델 (TypeScript + Zod — 신학 가드는 여기가 본체다)

`src/minigames/types.ts` (신규):

```ts
import { z } from 'zod'
import type { ComponentType } from 'react'
import type { Verb } from '../content/schema'

/** ── 수명주기 ─────────────────────────────── */
export type MinigamePhase = 'intro' | 'playing' | 'paused' | 'grace' | 'clear' | 'fail'
// 'grace' = 붙드심 비트: 입력 잠금, 해소는 예수님의 행동. clear/fail 양쪽 전이의 필수 경유 단계

/** ── 감수 파이프라인 (옵트아웃 불가) ─────── */
export const ReviewedSchema = z.object({
  by: z.string().min(1),                       // 감수자(통합측 목회자 2인 이상, 예: 'kim.jh;lee.ms')
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version: z.string().min(1),                  // 감수 당시 역본 판 (예: 'KRV-개역개정-4판' 또는 확정 대체 역본)
  contentHash: z.string().length(8),           // 감수 시점 텍스트 해시 — 텍스트 1자라도 수정되면 불일치 → 감수 자동 해제
})
export const GOSPEL_REF = /^(마태복음|마가복음|누가복음|요한복음) \d{1,3}:\d{1,3}(-\d{1,3})?$/
export const GOSPEL_REF_SINGLE = /^(마태복음|마가복음|누가복음|요한복음) \d{1,3}:\d{1,3}$/  // 축약본용 — 절 범위 불허

export const ReviewedTextSchema = z.object({
  text: z.string().min(1),
  reviewed: ReviewedSchema.nullable(),         // null = 미감수(기본값). 옵트인 플래그 없음 — 빠뜨릴 수 없다
})
export const VerseSchema = ReviewedTextSchema.extend({
  ref: z.string().regex(GOSPEL_REF, '4복음서 장:절 형식만 허용 — 비복음서·자유 표기는 파싱 실패'),
})
/** 축약 성구 = 별도 감수 텍스트 단위. 런타임 절단이 아니다.
 *  절 경계 존중: 반드시 '한 절 온전 인용'(GOSPEL_REF_SINGLE), 전문(ref)의 절 범위 내 (superRefine에서 검증) */
export const VerseShortSchema = ReviewedTextSchema.extend({
  ref: z.string().regex(GOSPEL_REF_SINGLE, '축약본은 한 절 온전 인용만 허용 — 절 범위·중간 절단 금지'),
})
export type ReviewedTextInput = z.input<typeof ReviewedTextSchema>
export type VerseInput = z.input<typeof VerseSchema>
export type VerseShortInput = z.input<typeof VerseShortSchema>

/** ── 난이도 (병합 의미 확정: 덮어쓰기) ───── */
export interface DifficultyProfile<P extends Record<string, number>> {
  normal: P
  /** gentle은 partial — spread 병합(덮어쓰기). 곱셈 아님. gentle 키는 normal 키의 부분집합(Zod 검증) */
  gentle: Partial<P>
  suggestGentleAfterFails?: number  // 기본 2, 셸 세션 로컬 카운터 기준
}

/** ── 통찰 (다층) ─────────────────────────── */
export interface InsightGoal {
  id: string                        // 'water-walk/unshaken'
  tier: 1 | 2 | 3                   // 발견/숙련/묵상
  label: ReviewedTextInput          // 노출 텍스트 — 감수 대상 (v3: string → ReviewedTextInput)
  unlock: ReviewedTextInput         // 해금 문장 — 감수 파이프라인 통과 필수. 작성 지침 §⑩-2
  reward: { sticker?: string; vignette?: string; reactionLine?: string } // 실체 보상 (§②-E)
}

/** ── 마이크로 보상 (30~90초 리듬) ────────── */
export interface MomentDef {
  text: ReviewedTextInput
  kind: 'once' | 'perSession' | 'onChange'  // 소진 정책: 영구 1회 / 세션당 1회 / 값 변화 시마다
  sfx?: string; haptic?: 'light' | 'medium'
}

/** ── HUD: 외부 스토어 구독 (프레임당 셸 리렌더 차단) ── */
export interface HudMeter {
  id: string; label: string
  value: number; max: number
  lowThreshold?: number
  /** reduced-motion 대응: low 상태의 비모션 부호 — 펄스는 형태 부호로 인정하지 않는다 */
  lowIndicator: 'static-icon' | 'border-weight' | 'pattern'
  format?: 'percent' | 'count' | 'steps'
}
export interface HudModel { meters: HudMeter[]; message?: { text: string; tone: 'info' | 'warn' } }
/** 코어는 hud.set()에 쓰기만 한다. React state 아님 — vanilla 스토어에 기록,
 *  MinigameHud만 useSyncExternalStore + rAF 정렬 notify로 구독. 셸 루트는 playing 중 리렌더 0 (T-30) */
export interface HudStore { set(hud: HudModel): void }

/** ── 코어 계약 (fail 가능 여부를 타입으로 분리) ── */
export interface CoreFlags {
  reducedMotion: boolean   // 시각 연출 정지는 코어가 알아야 한다 — params(number)에 불리언 해킹 금지
  inGrace: boolean         // grace 비트 중 연출 협조용 (입력은 셸이 이미 차단)
}
export interface SessionMemo { get(k: string): unknown; set(k: string, v: unknown): void }
// 시도(retry) 간 유지, 영속 안 함 — 힌트 노출 플래그 등. key 리마운트에도 셸이 보존해 재주입

interface CorePropsBase<P extends Record<string, number>> {
  params: P                // 제네릭 — 키 오타는 컴파일 에러 (stringly-typed 금지)
  flags: CoreFlags
  paused: boolean
  hud: HudStore
  moment: (id: string) => void          // 정의의 moments[id] 조회 → 셸이 연출 변환+소진 관리
  memo: SessionMemo
}
export interface FailableCoreProps<P extends Record<string, number>> extends CorePropsBase<P> {
  report: (r: { outcome: 'clear' | 'fail'; insights: string[] }) => void
}
export interface NoFailCoreProps<P extends Record<string, number>> extends CorePropsBase<P> {
  report: (r: { outcome: 'clear'; insights: string[] }) => void   // 'fail' 보고는 컴파일 불가 — 수난 소프트락 원천 차단
}

/** ── 정의 (판별 유니온) ──────────────────── */
interface DefinitionBase<P extends Record<string, number>> {
  id: string                       // minigameId — registry 키 (에피소드와 1:N)
  episodeId: string                // 역조인
  verb: Verb
  title: ReviewedTextInput; subtitle: ReviewedTextInput  // 노출 텍스트 전수 원칙 (v3)
  goalLine: ReviewedTextInput      // text ≤40자 — 감수 대상 (v3: string → ReviewedTextInput)
  howTo: ReviewedTextInput         // 조작 안내 — 감수 대상 (v3)
  estMinutes: [number, number]     // 예상 세션 길이 — 3분 초과면 checkpoint 권장 (CI 경고)
  checkpoint?: boolean             // 국면 스냅샷 영속 허용 (시나리오 D-3)
  difficulty: DifficultyProfile<P>
  insightGoals: InsightGoal[]
  moments: Record<string, MomentDef>
  graceBeat: { durationMs: number; kind: 'rescue' | 'open' | 'quiet' }  // 붙드심 연출 슬롯 (§⑤)
  clearVerse: VerseInput
  /** 재클리어(2회차+)용 감수 축약본 — 미등록 시 재클리어에서 성구 '생략'(절단 폴백 없음) (§⑤ 재클리어 정책) */
  clearVerseShort?: VerseShortInput
  /** 엄숙 모드: 11장 겟세마네·12장 수난. true면 스키마가 insightGoals=[] · graceBeat.kind='quiet' 를 강제,
   *  셸이 앰버 축하·스티커·moment 스팅어를 비활성 */
  solemn?: boolean
  /** 행위 주체 선언 — 예수님 격리 (Zod refine으로 검증) */
  agency: { playerControls: 'companion' | 'crowd' | 'object'; jesusRole: 'witnessed' | 'speaks-scripture-only' | 'absent' }
  dailySeed?: { params: (seed: number) => Partial<P> }   // '오늘의 물결' 변주 (M2)
}
export interface FailableDefinition<P extends Record<string, number>> extends DefinitionBase<P> {
  mode: 'failable'
  failVerse: VerseInput
  /** 2회차 실패용 감수 축약본 — 필수. 반복 정책(§⑤)이 셸 공통이므로 축약 단계 텍스트도 계약이다 */
  failVerseShort: VerseShortInput
  failComforts: ReviewedTextInput[]  // 3회차+ 로테이션 위로 문구 — 전부 감수 대상
  load: () => Promise<{ default: ComponentType<FailableCoreProps<P>> }>
}
export interface NoFailDefinition<P extends Record<string, number>> extends DefinitionBase<P> {
  mode: 'nofail'                     // failVerse 필드 자체가 없음 — 셸은 실패 UI를 만들지 않는다
  load: () => Promise<{ default: ComponentType<NoFailCoreProps<P>> }>
}
export type MinigameDefinition<P extends Record<string, number> = Record<string, number>> =
  | FailableDefinition<P> | NoFailDefinition<P>
```

**Zod 메타 스키마 + 신학 CI 게이트** (`src/minigames/meta-schema.ts` — `load`·`dailySeed`(함수) 제외 직렬화 부분. v3: refine이 참조하는 모든 필드가 shape에 실재하도록 전면 갱신):

```ts
const InsightGoalSchema = z.object({
  id: z.string(), tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  label: ReviewedTextSchema, unlock: ReviewedTextSchema,
  reward: z.object({ sticker: z.string().optional(), vignette: z.string().optional(), reactionLine: z.string().optional() }),
})
const MomentSchema = z.object({
  text: ReviewedTextSchema, kind: z.enum(['once', 'perSession', 'onChange']),
  sfx: z.string().optional(), haptic: z.enum(['light', 'medium']).optional(),
})
const ChoiceSchema = z.object({
  id: z.string(), speaker: z.string(), actor: z.string().optional(), text: ReviewedTextSchema,
})

export const MinigameMetaSchema = z.object({
  id: z.string(), episodeId: z.string().regex(/^ep\d{2}$/),
  verb: z.enum(['퍼즐', '물류', '리듬', '균형', '추리']),
  title: ReviewedTextSchema, subtitle: ReviewedTextSchema,
  goalLine: ReviewedTextSchema.refine(v => v.text.length <= 40, 'goalLine 40자 초과'),
  howTo: ReviewedTextSchema,                          // (v3) CI 전수 검사 대상 — shape에 실재
  estMinutes: z.tuple([z.number().min(1), z.number().max(10)]),
  checkpoint: z.boolean().optional(),                 // (v3) estMinutes 경고 규칙이 참조
  mode: z.enum(['failable', 'nofail']),
  solemn: z.boolean().optional(),
  difficulty: z.object({                              // (v3) superRefine이 참조 — shape에 실재
    normal: z.record(z.string(), z.number()),
    gentle: z.record(z.string(), z.number()),
    suggestGentleAfterFails: z.number().int().min(1).optional(),
  }),
  graceBeat: z.object({ durationMs: z.number().min(500).max(4000), kind: z.enum(['rescue', 'open', 'quiet']) }),
  agency: z.object({
    playerControls: z.enum(['companion', 'crowd', 'object']),
    jesusRole: z.enum(['witnessed', 'speaks-scripture-only', 'absent']),
  }),
  clearVerse: VerseSchema,
  clearVerseShort: VerseShortSchema.optional(),
  failVerse: VerseSchema.optional(),
  failVerseShort: VerseShortSchema.optional(),
  failComforts: z.array(ReviewedTextSchema).optional(),
  insightGoals: z.array(InsightGoalSchema),
  moments: z.record(z.string(), MomentSchema),
  choices: z.array(ChoiceSchema).optional(),   // 추리 코어 선택지 콘텐츠 (3장·9장·11장)
}).superRefine((def, ctx) => {
  // [신학 가드 1] 예수님 격리: 플레이어 선택지의 화자·행동 주체로 'jesus' 금지
  def.choices?.forEach((c, i) => {
    if (c.speaker === 'jesus' || c.actor === 'jesus')
      ctx.addIssue({ code: 'custom', path: ['choices', i],
        message: '예수님의 발화·행동은 플레이어 선택지가 될 수 없다 (GDD 기둥 ①). 기록된 말씀은 verse 출력으로만.' })
  })
  // [신학 가드 2] solemn 제약: 수난·겟세마네에 도전 과제·축하 금지
  if (def.solemn) {
    if (def.insightGoals.length > 0)
      ctx.addIssue({ code: 'custom', path: ['insightGoals'], message: 'solemn 에피소드에 통찰 배지 금지' })
    if (def.mode === 'failable')
      ctx.addIssue({ code: 'custom', path: ['mode'], message: 'solemn은 nofail이어야 한다' })
    if (def.graceBeat.kind !== 'quiet')
      ctx.addIssue({ code: 'custom', path: ['graceBeat'], message: 'solemn의 grace는 quiet' })
  }
  // [신학 가드 3] failable 필수 세트: 전문·축약·위로 문구 — 반복 정책 단계별 텍스트 전부 감수 단위로 존재해야 한다
  if (def.mode === 'failable' && (!def.failVerse || !def.failVerseShort || !def.failComforts?.length))
    ctx.addIssue({ code: 'custom', path: ['mode'],
      message: 'failable은 failVerse + failVerseShort + failComforts(1개 이상) 필수 — 축약·로테이션 단계도 감수 텍스트 단위다' })
  // [신학 가드 4] 축약본 절 경계: 축약 ref는 전문 ref와 같은 책·장이고, 전문의 절 범위 안의 "한 절"
  const inRange = (full: string | undefined, short: string | undefined) => {
    if (!full || !short) return true
    const f = full.match(GOSPEL_REF)!; const s = short.match(GOSPEL_REF_SINGLE)!
    const [fb, fc] = [f[0].split(' ')[0], Number(full.split(' ')[1].split(':')[0])]
    const [sb, sc] = [s[0].split(' ')[0], Number(short.split(' ')[1].split(':')[0])]
    const fv = full.split(':')[1].split('-').map(Number); const sv = Number(short.split(':')[1])
    return fb === sb && fc === sc && sv >= fv[0] && sv <= (fv[1] ?? fv[0])
  }
  if (!inRange(def.failVerse?.ref, def.failVerseShort?.ref))
    ctx.addIssue({ code: 'custom', path: ['failVerseShort'], message: '축약본은 failVerse 절 범위 내 한 절이어야 한다' })
  if (!inRange(def.clearVerse.ref, def.clearVerseShort?.ref))
    ctx.addIssue({ code: 'custom', path: ['clearVerseShort'], message: '축약본은 clearVerse 절 범위 내 한 절이어야 한다' })
  // [난이도 가드] gentle 키 ⊆ normal 키 (오타 → 조용한 NaN 방지)
  const bad = Object.keys(def.difficulty.gentle).filter(k => !(k in def.difficulty.normal))
  if (bad.length) ctx.addIssue({ code: 'custom', path: ['difficulty', 'gentle'], message: `normal에 없는 키: ${bad}` })
})
```

**감수 경로 1:1 대응표** — "노출 텍스트 전수"의 단일 출처. 코드에서는 `REVIEWED_TEXT_PATHS` 상수(아래)이며, 이 표는 그 사본이다. 표·상수·스키마 shape의 3자 정합을 **T-33**이 스키마 순회로 자동 검증한다(항목 추가 시 셋 중 하나만 고치면 테스트가 깨진다 — 침묵 누락 불가):

| # | 노출 텍스트 (§⑩-A 감수 범위) | 정의 필드 경로 | 스키마 단위 |
|---|---|---|---|
| 1 | 게임 제목/부제 | `title` / `subtitle` | ReviewedTextSchema |
| 2 | 목표 한 줄 | `goalLine` | ReviewedTextSchema (≤40자) |
| 3 | 조작 안내 | `howTo` | ReviewedTextSchema |
| 4 | 클리어 성구 전문 | `clearVerse` | VerseSchema |
| 5 | 클리어 성구 축약 (재클리어) | `clearVerseShort` | VerseShortSchema (한 절·범위 내) |
| 6 | 실패 성구 전문 | `failVerse` | VerseSchema |
| 7 | 실패 성구 축약 (2회차) | `failVerseShort` | VerseShortSchema (한 절·범위 내) |
| 8 | 위로 문구 로테이션 (3회차+) | `failComforts[]` | ReviewedTextSchema |
| 9 | 통찰 라벨/해금 문장 | `insightGoals[].label` / `.unlock` | ReviewedTextSchema |
| 10 | 마이크로 보상 문구 | `moments[*].text` | ReviewedTextSchema |
| 11 | 추리 선택지 | `choices[].text` | ReviewedTextSchema |

- 감정 버튼 라벨·오버레이 고정 문구("실패해도 잃는 것은 없습니다" 등) 등 **정의 밖 셸 공통 문자열은 `shell/strings.ts` 단일 파일**로 모으고 동일 `ReviewedTextSchema` 배열로 export — CI가 registry와 함께 순회(경로 12번으로 상수에 포함).

```ts
/** CI·테스트가 공유하는 감수 경로 단일 출처 — 위 표와 1:1 (T-33이 정합 검증) */
export const REVIEWED_TEXT_PATHS = [
  'title', 'subtitle', 'goalLine', 'howTo',
  'clearVerse', 'clearVerseShort', 'failVerse', 'failVerseShort', 'failComforts[]',
  'insightGoals[].label', 'insightGoals[].unlock', 'moments[*].text', 'choices[].text',
] as const
```

**CI 규칙** (`scripts/check-review.ts`, `npm run build:prod` 선행 단계 — 경고가 아니라 **실패**):
1. registry 전 정의를 `MinigameMetaSchema.parse` — regex·격리·solemn·failable 필수 세트·절 경계 위반 시 하드 에러.
2. 노출 텍스트 전수 순회는 **`REVIEWED_TEXT_PATHS` 상수 기준**(+`shell/strings.ts`): `reviewed === null` 이거나 `hash(text) !== reviewed.contentHash` → **프로덕션 빌드 실패**. 개발 빌드는 경고 + 미감수 목록 CSV 출력(감수 제출용). 축약본(`*Short`)도 동일 취급 — 감수 안 된 형태의 말씀이 화면에 나갈 코드 경로가 없다.
3. 성구 `text`(전문·축약 모두)를 확정 역본 원문 데이터(`docs/theology/verses.source.json`)와 **자동 diff** — 1자라도 다르면 실패(공통 지침 4). 축약본은 해당 단일 절 원문과 대조.
4. `estMinutes[1] > 3 && !checkpoint` → 경고(무손실 원칙과 세션 길이 충돌 검출).
5. ESLint `no-restricted-imports`: `src/minigames/cores/**` → `state/store`·raw hex 색상 리터럴 금지(§⑥·§⑦).

**스토어 확장 + migrate(0→1) 변환 명세** (`src/state/store.ts`, persist `version: 1` — 현행 미지정=0, 실필드: `completed: string[]`·`companions: string[]`·`gentleMode: boolean`):

```ts
interface GameState {
  // …기존 유지 (completed, companions, screen, currentEpisode)…
  /** 미니게임 단위 클리어: { 'net-timing': true } — persist */
  minigameCleared: Record<string, boolean>
  /** 통찰: { 'water-walk/unshaken': true } — persist */
  insights: Record<string, boolean>
  /** 관대 모드 2층: 전역 기본값 + 게임별 오버라이드 */
  gentleDefault: boolean
  gentleOverrides: Record<string, boolean | undefined>
  clearMinigame: (minigameId: string, insights: string[]) => void
  // 에피소드 완료는 셸이 아니라 스토어가 판정: episodes.ts의 clearRule 충족 시 completeEpisode 내부 호출
}

// persist 옵션 — 변환 규칙은 T-23 회귀 케이스로 고정
version: 1,
migrate: (persisted: unknown, version: number) => {
  if (version === 0) {
    const p = persisted as { completed?: string[]; companions?: string[]; gentleMode?: boolean }
    return {
      completed: p.completed ?? [],
      companions: p.companions ?? [],
      gentleDefault: p.gentleMode ?? false,   // ① 이름 이관 — 구 gentleMode 키는 폐기(잔존 키 무시)
      gentleOverrides: {},                     // ② 신설 — v0에 게임별 개념 없음 → 빈 객체
      insights: {},                            // ③ 신설 — 과거 플레이에 통찰 소급 부여 없음
      // ④ 백필: 완료 에피소드에 속한 미니게임 ids "전원" true.
      //    v0 세이브에는 어느 미니게임을 깼는지가 없으므로, clearRule이 atLeast여도 전원 true가 안전측이다
      //    — '에피소드 완료인데 미니게임 미클리어' 모순으로 clearRule 재판정이 완료를 뒤집는 사고를 차단.
      minigameCleared: Object.fromEntries(
        (p.completed ?? []).flatMap(epId =>
          (EPISODES[epId]?.minigames.ids ?? []).map(id => [id, true] as const)),
      ),
    }
  }
  return persisted as GameState
}
```

`episodes.ts` 확장: `minigames: { ids: string[]; clearRule: 'all' | 'any' | { atLeast: number } }` — 4장(그물·장부·가나 물류 3종, `{ atLeast: 2 }` 등)과 11장(4종)의 **1:N**을 데이터로 표현. failStreak는 스토어에서 **제거**(셸 세션 로컬 — ep08 실패가 ep07 관대 초대를 오작동시키는 여지 차단). `abort`는 결과 타입에서 제거하고 계측 이벤트로만 남긴다(죽은 API 정리).

---

## ④ 모듈/컴포넌트 구조

```
src/
├─ minigames/
│  ├─ types.ts                     계약 (§③)
│  ├─ meta-schema.ts               Zod + 신학 refine + REVIEWED_TEXT_PATHS
│  ├─ registry.ts                  MINIGAMES: Record<minigameId, MinigameDefinition>  ★1:N
│  ├─ MinigameShell.tsx            phase 상태기계 소유. playing 중 루트 리렌더 0 (T-30)
│  ├─ shell/
│  │  ├─ IntroOverlay.tsx          제목·goalLine·시작·관대 토글·통찰 배지 | role=dialog·초기 포커스=시작
│  │  ├─ PauseOverlay.tsx          계속(초기 포커스)/나가기 | ⏸ 버튼·visibilitychange 트리거
│  │  ├─ GraceBeat.tsx             붙드심 비트 — 입력 잠금 연출 슬롯 (kind: rescue/open/quiet)
│  │  ├─ FailOverlay.tsx           성구(반복 정책 §⑤ — 전문/failVerseShort/생략)+원탭 재도전(초기 포커스)+관대 초대
│  │  ├─ ClearOverlay.tsx          1회차: 성구+감정 버튼+중립 '계속' | 재클리어: clearVerseShort/생략+보상 요약 (§⑤)
│  │  ├─ MinigameHud.tsx           useSyncExternalStore 구독 단독 컴포넌트 | aria-live=polite
│  │  ├─ strings.ts                셸 공통 노출 문구(감정 버튼 라벨·고정 안내) — ReviewedTextSchema로 CI 순회
│  │  └─ juice/                    ★ 공통 juice 계층 (M0 v0 → M1 완성)
│  │     ├─ impact.ts              판정 이벤트 → 국소 플래시·링 파동·햅틱 + ★광과민성 안전 리미터(아래 계약)
│  │     └─ stingers.ts            phase·moment → SFX 타이밍 (Howler 연결 전엔 no-op 어댑터)
│  ├─ hooks/                       ★ 전 훅 키보드/스위치 경로 기본 내장 (코어 구현 아님)
│  │  ├─ useSimLoop.ts             rAF+dt클램프(≤50ms)+paused 가드 | 틱 로직은 순수 함수로 분리(sim/*.ts)
│  │  ├─ useHold.ts                pointer + Space/Enter 홀드 동등 처리
│  │  ├─ useTap.ts                 pointer + Space | offsetMs 파라미터 자리 예약(리듬 캘리브레이션 v1)
│  │  ├─ useSwipe.ts               pointer + 방향키
│  │  └─ useDrag.ts                pointer + '탭 선택→방향키/탭 배치' 대안 모드 (WCAG 2.5.7)
│  ├─ sim/                         ★ 순수 함수 틱 로직 (WaterWalk sim 추출) — 시뮬레이션 단위 테스트 대상
│  ├─ analytics/local-log.ts       IndexedDB 이벤트 로그(시도·실패·소요·관대 전환·moment) + JSON 내보내기
│  └─ cores/
│     ├─ WaterWalkCore.tsx         ← WaterWalkGame에서 추출
│     └─ (이후) NetTimingCore.tsx, FeedingCore.tsx …
├─ screens/
│  ├─ MinigameScreen.tsx           registry 조회 → Suspense(인디고 배경 유지 폴백) → <MinigameShell/>
│  └─ WaterWalkGame.tsx            (마이그레이션 후 삭제)
├─ content/episodes.ts             minigames: { ids, clearRule } 추가
└─ state/store.ts                  persist version:1 + migrate(§③ 명세), minigameCleared/insights/gentle 2층
```

**juice 계층 광과민성 안전 계약** (`impact.ts` — WCAG 2.3.1 Level A. 발작 위험은 전연령 제품에서 유일한 무조건 출시 차단 항목. reduced-motion 옵트인과 무관한 **기본 상태의 안전**):
- **전체 화면 휘도 변화 플래시 금지** — 플래시성 연출은 국소 요소에만, 동시 플래시 면적 합 **≤ 뷰포트 25%**.
- **적색 플래시 금지** — `--dawn` 경고는 정적/저속 전환만.
- **플래시 레이트 리미터**: 슬라이딩 윈도우 1초당 플래시 발화 **≤ 3회**. 리미터는 `impact.ts` 내부 고정 — 코어는 판정 이벤트만 발생시키므로 **우회 경로가 없다**.
- **자동 강등**: 판정 이벤트 유입 빈도 > 3Hz(리듬·연속 판정 게임) 감지 시 플래시 채널을 끄고 **링 파동(휘도 변화 없는 스케일/알파 연출) + 햅틱**으로 강등. 판정 피드백의 정보량은 유지, 광 자극만 제거.
- 자동 테스트 **T-31**(§⑨): 10Hz 판정 주입 시 플래시 발화 ≤3회/초 + 전체 화면 플래시 클래스 미사용.

**셸의 접근성 책임 (계약 명문화)**: 오버레이 렌더 시 `role="dialog"`·`aria-modal`·포커스 트랩·초기 포커스 이동을 셸이 소유. phase 전이(fail/clear)와 `HudModel.message`는 `aria-live="polite"`로 공지. **집중 미니게임(균형·리듬) playing 중 외부 시각 토스트 금지** — 셸이 전역 토스트(데일리 알림 등)를 큐잉해 결과 화면에서 방출(공통 지침 6, S1↔R2 모순 해소).

**정합 원칙**: `App.tsx`는 `<MinigameScreen/>` 한 줄 교체 후 불변. 맵 카드 탭/노출 시 `definition.load()` 프리워밍(첫 진입 흰 화면 방지). 코어의 스토어 접근은 ESLint로 기계 차단.

---

## ⑤ 핵심 플로우 (상태 전이)

```
 JourneyMap ──enterMinigame(id)──▶ ┌─ MinigameShell ─────────────────────────────┐
 (카드 탭 시 load() 프리워밍)      │ intro ──start()──▶ playing ◀──resume──┐     │
                                   │   ▲     ⏸/visibilitychange ▼          │     │
                                   │   │                     paused ───────┘     │
                                   │   │                        │                │
                                   │   │  moment(id) ──▶ HUD연출+스팅어(소진정책)│
                                   │   │  순항 감지 ──▶ 통찰 목표 제시(천장 DDA) │
                                   │   │                        │                │
                                   │   │            report{fail}│report{clear}   │
                                   │   │                 ▼      ▼                │
                                   │   │           ┌── grace (입력 잠금) ──┐     │
                                   │   │           │  '붙드심' 연출 비트   │     │
                                   │ retry(원탭)   ▼   (재클리어: 단축)   ▼     │
                                   │   └───────── fail                  clear    │
                                   │       failStreak++(세션)             │      │
                                   │       ≥2 → 관대 초대    clearMinigame(id,   │
                                   └──────────┬──────────────  insights) ┼──────┘
                                              │ "나가기"                 ▼
                                              ▼               store가 episodes.clearRule 판정
                                       setScreen('map')       충족 → completeEpisode → 보상 화면
                                       (영속 기록 없음)       미충족 → 에피소드 허브/맵 (다음 미니게임)
```

전이 규칙:
- `intro → playing`: 명시적 시작 버튼만(자동 시작 금지 — 11·12장 마음의 준비).
- `playing → paused`: ⏸ 버튼·`visibilitychange`·`blur`. `useSimLoop`이 정지, 재개 시 `last=0` 리셋으로 dt 점프 방지.
- **`report → grace → clear/fail`**: clear든 fail이든 결과 오버레이 전에 **입력이 잠기는 grace 비트**를 경유한다. 균형 게임의 침몰 해소는 플레이어가 아니라 '붙잡으시는 손'(kind:'rescue'), 물류·퍼즐의 완성은 '인간의 몫 이후 열리는 기적'(kind:'open'), solemn은 무연출 정적(kind:'quiet'). — 교훈을 문구가 아니라 **몸으로 겪는 기제**에 심는다(신학 mustFix 3, 공통 지침 2). 감수 대상은 문구가 아니라 이 기제 구조 자체(§⑩-3).
- `fail → playing(retry)`: 코어 key 리마운트 + **sessionMemo 재주입**(힌트 중복 방지). 완료 기준: 재시작 체감 지연 < 100ms(실기기).
- **실패 오버레이 반복 정책**(셸 공통): 1회차 = `failVerse` 전문, 2회차 = **`failVerseShort`(감수 등록 축약본 — 절 경계 존중 한 절, §③) + 재도전 우선**, 3회차+ = 성구 생략·`failComforts` 로테이션·즉시 재도전. **셸은 어떤 단계에서도 성구 문자열을 런타임 절단하지 않는다** — 화면에 나가는 모든 형태의 말씀은 감수·해시 검증을 거친 별도 텍스트 단위다(§⑩-9). 말씀을 재시도 로딩 문구로 소모하지 않는다.
- **재클리어 반복 정책**(셸 공통 — 실패 정책과 동급, v3 신설): 판정 기준은 `store.minigameCleared[id] === true`인 게임의 클리어.
  1. **grace 비트 단축**: `durationMs`를 800ms 상한으로 클램프 + 탭 입력으로 즉시 통과 허용. 단 solemn은 단축만 하고 스킵 톤 변경 없음(quiet 유지) — 재방문이 경건의 마모가 되지 않게.
  2. **성구**: `clearVerseShort`(감수 축약본) 등록 시 1줄 노출, 미등록 시 **생략**(절단 폴백 없음).
  3. **감정 버튼 생략** — 보상 요약 한 줄 + 중립 '계속'만. 클리어 후 오버헤드 총 3초 이내.
  4. **예외 — 신규 통찰 달성 판**: 해당 티어 특별 연출(황금 물결 변주·스티커 수여·반응 대사 해금)은 정상 재생. 절제 대상은 '이미 본 세리머니의 반복'이지 '새 성취의 축하'가 아니다.
  - 취지: 통찰 루프 5~6시간(§⑧ 산수)의 반복 체감을 '매판 성구 세리머니'가 아니라 '핵심 플레이 → 즉시 다음 판'으로 만든다. 말씀은 첫 만남에 온전하게, 반복에서는 절제되게 — 실패측 정책과 동일한 원리. 테스트 **T-32**.
- `clear` 시에만 영속 기록. fail/나가기는 어떤 영속 상태도 쓰지 않는다(무손실 보증, `checkpoint` 스냅샷 예외는 정의 선언 시에만).
- **nofail 정의(12장 수난)**: `report('fail')`이 **컴파일 불가**(§③) — 런타임 무시로 인한 수난 시퀀스 소프트락 원천 제거.
- **ep12 이원화**(공통 지침 10): 수난 비트 = `solemn: true`·nofail·quiet grace. **부활 비트 = 별도 정의**로 분리 — solemn 아님, 축하 연출 전면 회복(기쁨의 해방을 침묵시키지 않는다).

---

## ⑥ 타 시스템과의 인터페이스

| 상대 시스템 | 방향 | 계약 |
|---|---|---|
| 여정 맵 | 맵 → 미니게임 | `enterMinigame(minigameId)`. 다중 미니게임 장(4·11장)은 맵이 에피소드 허브에서 목록 표시(`episodes.minigames.ids`) |
| 보상 화면 | 스토어 경유 | 셸은 `clearMinigame`만 호출. `completeEpisode`는 스토어가 clearRule 판정 후 내부 호출 — companionIds는 episodes.ts 단일 출처 |
| 컬렉션 | 읽기 전용 | `useGame(s => s.insights)` — 통찰 문장·스티커·비네트 해금 표시. 미달성은 "?" 실루엣(결핍 강조 금지) |
| **동행자 능력** | 능력 → params | 보유 동행자의 능력이 셸의 params 병합 단계에 계수로 반영(코어는 모름). 아래 매트릭스 참조 |
| 대화(로컬 대사 뱅크 → ink) | 미니게임 → 대사 | **M2**: 통찰 달성 → 로컬 반응 대사 즉시 해금(ink 없이 선행). **v1**: `insights`를 ink 전역 변수로 주입 + **outro에 미니게임 결과 변수 재주입**(모든 선택은 최소 1회 가시적 콜백 — 읽히지 않는 flag는 CI 경고) |
| 오디오 | 셸 → juice | `onPhaseChange`·moment 스팅어. Howler 연결 전 no-op 어댑터로 타이밍 슬롯만 선행(M0) |
| 접근성 설정 | 전역 → 셸 | gentle 2층(전역 기본 + 게임별 오버라이드), `prefers-reduced-motion` → `flags.reducedMotion`으로 코어 전달(params 불리언 해킹 금지) |
| 데일리 초대(허브) | 허브 → 미니게임 | `dailySeed` 보유 게임을 '오늘의 묵상 변주'로 노출. 놓쳐도 소멸·차감 없음 — FOMO 필드는 스토어에 존재 자체 금지 |

**능력→에피소드 유용성 매트릭스** (재미 실체 — "영입 후 최소 2개 장에서 유효" 규칙, 위반 시 능력 재설계):

| 동행자 | 능력(예시) | 효과 수치 | 유효 동사 | 유효 장(≥2) |
|---|---|---|---|---|
| 베드로 | 닻 내림 | 균형: 집중 드레인 −15% | 균형 | 8, 12(부활 비트) |
| 안드레 | 그물 손 | 리듬: 판정폭 +40ms | 리듬 | 2(회상), 10 |
| 빌립 | 오병이어의 눈 | 물류: 시작 자원 +1 | 물류 | 4, 7 |
| 마태 | 장부 정리 | 퍼즐·추리: 오답 1회 무효 | 퍼즐·추리 | 5, 6, 9, 11 |
| 요한 | 곁에 머묾 | 전 동사: 실패 직전 미터 30% 1회 회복 | 전체 | 6장 이후 전장 |

- 검증: 계측 로그로 보유/미보유 클리어율 차 **≥ 10%p** 확인(M2 플레이테스트). 체감 없으면 수치 상향.
- 전체 12장×5동사 매트릭스는 에피소드 플랜에서 유지·갱신하되, "최소 2개 장 유효" 검사를 CI에 포함.

**금지 계약**: 코어 → 스토어 직접 쓰기(ESLint 차단), 셸 → 코어 내부 ref 침투, 미니게임 → 네트워크, FOMO 상태 필드, **raw hex 색상 리터럴**(CSS 변수만), **성구 문자열 런타임 절단**(축약은 감수 등록된 `*Short` 필드만), **예수님을 bond·수집·선물·대화풀 대상 id로 사용**(공통 지침 1 — companions/관계 스키마의 Zod refine + CI 하드 에러와 이중 차단), **예수님 발화·행동의 플레이어 선택지화**(§③ refine — 3장은 동행자가 유혹의 논리를 *분별하는 관찰자* 구조로, 예수님의 답은 항상 기록된 말씀 그대로 출력).

---

## ⑦ UI 디자인 토큰 적용 (CSS 변수 기준 + 대비 실측치)

`styles/global.css` 실제 토큰명 기준. **raw hex 하드코딩 금지**(코어 계약·ESLint). 신규 토큰은 기존 명명 규칙(`--역할-변형`)으로만 추가. 배경 에셋은 세로(portrait) 규격.

| 요소 | 토큰/규칙 |
|---|---|
| 배경 | `var(--ground)` (보조 `--ground-2`) — 코어별 배경은 이 위 레이어 |
| 긍정 미터·시작 버튼 | `var(--lamp)` / `var(--lamp-soft)` (기존 `.btn-primary`) |
| 경고(집중 저하·파도) | `var(--dawn)` — 빨강 금지 |
| 성구 카드 | `var(--parchment)` + `var(--serif)` (**'Noto Serif KR'** — 실토큰과 일치시킴) |
| 밝은 배경 위 텍스트 | **`--ink-on-light: #2a2418` 신설** — 양피지 카드 내부 다크 텍스트용 |
| 본문 UI | `var(--ink)` + Noto Sans KR |
| 스크림 | **`--scrim: rgba(11,16,32,0.85)` 신설** — 오버레이 최소 불투명도 고정(밝은 연출 위 대비 보증) |
| 미터 트랙 | 기존 `rgba(255,255,255,0.1)` **폐기**(1.3:1 미달) → **경계선 1px `rgba(255,255,255,0.35)` + 트랙 `--ground-2`** |

**대비 실측치 (WCAG 2.2 — 텍스트 4.5:1, 비텍스트 3:1 플로어)**:

| 전경 | 배경 | 실측 대비 | 기준 | 판정 |
|---|---|---|---|---|
| `--parchment` #EDE3CE | `--ground` #0B1020 | **14.9:1** | 4.5:1 | 통과 |
| `--ink` #ECE7DA | `--ground` | **15.3:1** | 4.5:1 | 통과 |
| `--lamp` #F0B24A | `--ground` | **10.1:1** | 텍스트 4.5 / UI 3:1 | 통과 |
| `--dawn` #E98A6B | `--ground` | **7.5:1** | 4.5:1 | 통과 |
| `--ink-on-light` #2A2418 | `--parchment` | **12.1:1** | 4.5:1 | 통과 |
| 성구 텍스트 | `--scrim`(0.85) over `--lamp-soft` 최악 배경 | **10.8:1** | 4.5:1 | 통과 |
| 미터 트랙(구) rgba(255,255,255,.1) | `--ground` | **1.3:1** | 3:1 | **미달 → 폐기** |
| 미터 경계선(신) rgba(255,255,255,.35) | `--ground` | **3.2:1** | 3:1 | 통과 |

- 대비 계산은 CI 스크립트(토큰 쌍 자동 검사, `scripts/check-contrast.ts`)로 상시 검증 — 토큰 값 변경 시 자동 재검.

**텍스트·타깃·모션 규칙**:

| 항목 | 규칙 |
|---|---|
| 최소 텍스트 | **`--text-min: 14px`** — 플레이어 노출 12px대 전면 금지(기준 구현의 12~13px 위반분은 M0 마이그레이션에서 수정). 성구·핵심 안내 ≥ **16px**. rem 스케일, 브라우저 줌 200% 테스트(T-24) |
| 터치 타깃 | 셸 공통 버튼/토글 컴포넌트가 **min-width·min-height 모두 ≥ 44pt** 강제(네이티브 checkbox 16px 노출 금지 — 커스텀 토글). T-24는 너비·높이 각각 검증 |
| 미터 이중 부호화 | 색 + 폭 + 숫자 + low 상태 **정적 부호**(`lowIndicator`: 아이콘 배지/테두리 두께/패턴) — **펄스는 형태 부호로 계산하지 않는다** |
| reduced-motion | 전 연출 정적 폴백: 파도 경고 = 🌊 정적 배지 + 테두리 두께 변화, grace 비트 = 크로스페이드 정지컷. **모션 정지 상태에서 보이지 않는 위험으로 판정당하지 않음**을 테스트(T-26)로 보증 |
| **광과민성 (WCAG 2.3.1)** | **기본 상태 계약**(옵트인 아님): 전체 화면 휘도 플래시 금지·국소 플래시 ≤3회/초·면적 ≤ 뷰포트 25%·적색 플래시 금지·고빈도 판정 시 비플래시 강등 — `impact.ts` 리미터가 집행(§④), T-31 상시 검증 |
| 일시정지 | ⏸ 아이콘(← 어포던스 혼동 제거). PauseOverlay 초기 포커스='계속' |
| 오버레이 위계 | 맵(뒤)→게임(중)→오버레이(앞), `--scrim` 고정 |

---

## ⑧ MVP → v1 단계별 로드맵 + 콘텐츠 경제 산수

### 콘텐츠 경제 산수표 (총량과 플레이 시간 — "12판 깨면 끝" 구조 탈피)

| 장 | 미니게임 | 동사 | 예상 세션(분) | 통찰(층) | 비고 |
|---|---|---|---|---|---|
| 1 | 거처 찾기 | 추리 | 4~6 | 2 | |
| 2 | 길을 예비하라 | 리듬 | 2~3 | 2 | 캘리브레이션 v1 |
| 3 | 광야의 분별 | 추리 | 5~8 | 2 | 관찰자 구조(§⑥) |
| 4 | 그물 타이밍 / 마태 장부 / 가나 물류 | 리듬·퍼즐·물류 | 각 2~5 | 각 2 | **1:N 실증 장**, clearRule: atLeast 2 |
| 5 | 산상수훈 비네트 | 퍼즐 | 3~5 | 2 | |
| 6 | 지붕을 뚫다 | 퍼즐 | 3~5 | 2 | |
| 7 | 오병이어 | 물류 | 4~7 | 3 | checkpoint |
| 8 | 물위걷기 | 균형 | 1~3 | 3 | 기준 구현 |
| 9 | 비유 3편(탕자·사마리아·잃은 양) | 추리 | 각 4~6 | 각 1 | **병렬 해금**(선형 외길 금지) |
| 10 | 종려주일 웨이브 | 리듬 | 2~4 | 2 | |
| 11 | 정찰 / 세족 / 겟세마네 / 유다 추리 | 물류·퍼즐·균형·추리 | 각 3~6 | 2·2·0·2 | 겟세마네 solemn(통찰 0) |
| 12 | 수난(quiet) + 부활(기쁨) | 균형 2종 | 3~5 / 2~4 | 0 / 2 | 이원화, 수난 nofail·solemn |

- **총 미니게임 17개**(9장 3편·4장 3종·11장 4종 포함), **통찰 목표 약 36개**.
- 1회차 완주: 17게임 × 평균 4.5분 × 재도전 계수 1.5 ≈ **1.9시간** + 내러티브/허브 ≈ **3.5~4.5시간**.
- 통찰 완전 수집: +36목표 × 평균 재도전 2회 × 4.5분 ≈ **+5~6시간** — 이 루프의 반복 체감은 §⑤ **재클리어 정책**이 지킨다(클리어 후 오버헤드 ≤3초).
- D8–30: 데일리 변주 시드(1일 1게임 로테이션) + 통찰 잔여분 — 리텐션 장치가 출시 시점에 0이 아니게 한다.
- 유대 포인트 경제(만렙 도달 산술)는 관계 시스템 플랜 소관이나, **에피소드 동반 유대 가산**의 발생 지점(clearMinigame 시 동반 companion에 가산 이벤트 방출)은 본 계약에 포함.

### 동사별 소형 재미 게이트 (v3 — "게이트 1회성" 해소)

동사마다 재미 문법이 다르다(타이밍 쾌감 / 최적화 쾌감 / 추론 쾌감 / 유지 쾌감). 첫 코어가 완성되는 마일스톤마다 아래 프로토콜의 **소형 게이트**를 완료 기준에 포함한다:

| 게이트 | 대상 동사·게임 | 시점 | 통과 기준 |
|---|---|---|---|
| FG-균형 | 8장 물위걷기 | M0 (기존 게이트) | 외부인 3명 중 2명+ 자발 재플레이 의향 |
| FG-리듬 | 4장 그물 타이밍 | M1 | 외부인 2~3명 중 과반 자발 재플레이 의향 |
| FG-퍼즐 | 4장 마태 장부 | M1 | 상동 |
| FG-물류 | 7장 오병이어 | M2 | 상동 |
| FG-추리 | 3장 광야의 분별 | v1 | 상동 |

- **프로토콜**: 외부인 2~3명(가능하면 비신자 ≥1), 10~15분 자유 플레이, 종료 후 기기를 돌려주기 전 자발 재플레이 발생 여부 관찰 + "또 하고 싶은가" 구두 응답. 과반 미달 = 게이트 실패.
- **실패 시**: 해당 **동사의 콘텐츠 확장만 동결**(juice 밀도·난이도 곡선·moment 배치 수정 후 재게이트). 셸·타 동사 작업은 계속 — 단일 게이트가 전체 일정의 인질이 되지 않는다.
- **v1 완료 기준에 명문화**: "5동사 완비" = 코어 구동이 아니라 **5동사 전부 소형 재미 게이트 통과 기록 보유**.

### 공수 산정 (1인 개발 기준 — v3 추가)

| 마일스톤 | 공수(주) | 주요 불확실성 |
|---|---|---|
| M0 | 2.5~3 | WaterWalk 추출 범위, 감수 1차 대기(외부 — draft 병행으로 비차단) |
| M1 | 2~2.5 | 대한성서공회 협의 리드타임(외부 — 병행 진행) |
| M2 | 2.5~3 | 계측 스키마·데일리 시드 변주 설계 |
| v1 | 4~5 | 리듬 캘리브레이션, ep12 이원화 콘텐츠, 잔여 코어 3~4종 |
| 합계 | **11~13.5주** | 감수·저작권 외부 대기는 임계 경로에서 제외(배치·병행) |

### 마일스톤

**M0 — 추출 + 기반 (프레임워크 증명)**
- **첫 태스크: git init + Vitest 셋업 + ESLint 규칙**(no-restricted-imports·hex 금지) — 테스트 인프라 선행(공통 지침 7)
- persist `version: 1` + **migrate(0→1) — §③ 변환 명세 그대로 구현**(gentleMode→gentleDefault 이관, minigameCleared 백필), 스토리지 키 `donghaeng-save-v1` 유지, 세이브 쓰기 경로 단일화, store 주석 정합 수정. **T-23 회귀 케이스 동시 작성**
- types/meta-schema/registry(1:N)/MinigameShell + 오버레이 4종 + **GraceBeat** + useSimLoop/useHold(키보드 포함) + HudStore(외부 구독)
- sim 순수 함수 추출 → 시뮬레이션 테스트, WaterWalk → WaterWalkCore 마이그레이션(12px대 텍스트·미터 트랙 대비 위반 동시 수정)
- juice v0(판정 플래시·햅틱·SFX 타이밍 슬롯 — no-op 어댑터, **광과민성 리미터 포함**), 프리로드 + 인디고 유지 Suspense 폴백
- **성구 감수 1차**: 기존 마 14:31 하드코딩 인용 포함, registry 진입 성구 전량(전문 + **축약본 `failVerseShort`**) 감수 확정 후 등록(reviewed 기록). 감수는 이후 상설 게이트
- 완료 기준: ① 8장 기존과 동등 플레이 + 코어에 phase/store 코드 0줄 ② 재시작 체감 < 100ms(실기기) ③ **FG-균형 게이트 통과**(미달 시 균형 확장 동결, 코어 juice/난이도 곡선부터 수정) ④ 미감수 텍스트 0(축약본 포함) ⑤ migrate 회귀 통과

**M1 — 2번째 동사 + 1:N 실증 (MVP 완결)**
- 4장 그물 타이밍 코어(useTap 검증) + **마태 장부 코어(퍼즐)** — **4장 다중 미니게임 구조 실증**(ids 2개 이상 등록, clearRule 판정)
- `moment()` 채널 + juice 완성(스팅어 실연결, 플래시 리미터 T-31 가동), 감정 버튼+중립 '계속' 병렬
- 능력 매트릭스 v0: 베드로·안드레 능력 2종을 params 병합으로 구현, 체감 A/B 확인
- **개역개정 저작권**: 대한성서공회 사용 허락 절차 완료 또는 대체 역본 확정 — **M1 완료 기준**(이후 성구 데이터 `verses.source.json` 고정, 인용 diff CI 가동 — 축약본 단일 절 대조 포함)
- 완료 기준: registry 3게임+, App/셸 수정 없이 동사 3종 구동, 미감수 0, **FG-리듬·FG-퍼즐 게이트 통과**

**M2 — 입력 완성 + 리텐션 장치 + 계측**
- useSwipe/useDrag(탭-선택 대안 포함) + 7장 물류 코어(checkpoint 실증)
- **재입장 장치 가동**: 다층 통찰(기존 게임에 2~3층 소급) + **데일리 변주 시드**('오늘의 물결') + 통찰 보상 로컬 대사 뱅크 + **재클리어 정책 가동(§⑤ — T-32)**
- **로컬 계측 로그**(IndexedDB, 수동 내보내기) + useTap `offsetMs` 자리 예약
- visibilitychange 일시정지, 오디오 phase 이벤트(Howler)
- 플레이테스트 1차(§⑨ P-군 쿼터 준수) — 리텐션·재미 지표 실측
- 완료 기준: 자발 재입장 관찰 가능(장치 ≥ 2종 가동), 계측 내보내기 동작, **FG-물류 게이트 통과**, 재클리어 오버헤드 ≤3초 실측

**v1 — 12장 아크 커버**
- 리듬(2장, **오디오 캘리브레이션**: 첫 실행 탭 테스트 오프셋 저장, AudioContext.currentTime 기준 판정)·추리(3장 관찰자 구조) 코어 → 5동사 완비
- ink 변수 주입 + outro 결과 변수 재주입(읽히지 않는 flag CI 경고)
- **ep12 이원화 구현**: 수난(solemn·nofail·quiet) + 부활(축하 회복) — 기술 검증이 아니라 **플레이테스트 검증**(12장 프로토타입 이탈률·감정 반응 측정)
- 변형 모드(클리어 후 해금) 1종 이상
- 완료 기준: **FG-추리 게이트 통과 → 5동사 전부 게이트 통과 기록 확인**, 감수 잔여분 0 확인 후 릴리스(CI가 강제)

---

## ⑨ 테스트 계획

### 단위 테스트 (Vitest — M0 첫 태스크로 셋업)
- **T-01** `useSimLoop`: dt ≤ 50ms 클램프
- **T-02** `useSimLoop`: paused 중 tick 미호출, 재개 첫 dt ≈ 0
- **T-03** 셸 상태기계: intro→playing→(grace)→fail/clear 합법 전이만 허용. **grace 중 입력 이벤트 무시** 검증
- **T-04** fail/나가기 시 영속 상태 무변경(무손실). checkpoint 게임은 스냅샷 키만 변경
- **T-05** clear 시 `clearMinigame` 1회 + insights 병합(중복 없음), clearRule 충족 시에만 `completeEpisode`
- **T-06** failStreak: **셸 세션 로컬** — 2회 실패 → 관대 초대, clear·언마운트 시 소멸, **타 게임 진입 시 0부터**(오작동 회귀)
- **T-07** 난이도 병합: gentle **덮어쓰기**(spread) 확정 동작, **2층 구조**(전역 기본+게임 오버라이드) 케이스, gentle 키 ⊆ normal 키 검증
- **T-08** `MinigameMetaSchema`: goalLine 40자 초과 실패, **`ref: '시편 23:1'`·'마태복음 5-7장' 등 GOSPEL_REF 위반 파싱 실패**, 예수님 화자 선택지 실패, solemn+insightGoals 실패, **failable에 failVerseShort 누락 실패, 축약 ref가 전문 절 범위 밖/절 범위 표기 시 실패**(절 경계 refine)
- **T-09** `useHold`: pointerleave/cancel에서 holding=false + **Space/Enter 홀드 동등 경로**
- **T-10** `useTap`: windowMs 반영 + **키보드 탭 경로**
- **T-11** 정합성(재정의): `playable===true`인 에피소드는 `minigames.ids`가 비어있지 않고, ids 전원이 registry에 존재하며, registry 전 항목의 episodeId가 episodes에 존재
- **T-12** (타입 테스트) `NoFailDefinition` 코어에서 `report({outcome:'fail'})`이 **컴파일 불가** — expect-type/tsd
- **T-13** moment 소진 정책: once 영구 1회, perSession 세션 1회, onChange 값 변화 시만
- **T-14** sessionMemo: retry 리마운트 후 유지, 언마운트 시 소멸
- **T-15** CI 스크립트: reviewed null·contentHash 불일치·verses.source.json diff 불일치 시 prod 실패, dev는 CSV 출력 — **축약본(`*Short`)·`shell/strings.ts` 포함 검증**
- **T-16** 능력 params 병합: 보유 동행자 계수 반영, 미보유 시 미반영
- **T-33** (v3) **감수 경로 정합**: `REVIEWED_TEXT_PATHS` 상수의 전 경로가 `MinigameMetaSchema` shape에 실재하고, 스키마 내 `ReviewedTextSchema`/`VerseSchema` 계열 필드 중 상수에 없는 것이 0개 — **"노출 텍스트 전수"가 문서 주장이 아니라 기계 검증**이 되게 한다

### 통합 테스트 (React Testing Library)
- **T-20** 맵→8장→인트로→시작→클리어(grace 경유)→보상 화면, companions 'peter' 추가
- **T-21** 플레이 중 나가기 → 맵, 스토어 무변화
- **T-22** visibilitychange → PauseOverlay + 시뮬 정지
- **T-23** persist: 재시작 시 **타이틀 복귀**(실코드 정합) 후 이어하기→맵, insights 복원. **migrate(0→1) 회귀 2종**(v3): ① v0 세이브 `{completed:['ep08'], gentleMode:true}` → `gentleDefault===true`·구 `gentleMode` 키 부재·`minigameCleared['water-walk']===true`·**clearRule 재판정이 완료를 뒤집지 않음**(모순 0) ② v0 빈 세이브 → 신설 필드 전부 기본값
- **T-24** 접근성: 전 버튼 **너비·높이 각각 ≥ 44pt**, 미터 숫자 병기, 플레이어 노출 텍스트 ≥ 14px, 브라우저 줌 200% 레이아웃 유지
- **T-25** **axe-core 자동 검사**: 오버레이 dialog 시맨틱·포커스 트랩·초기 포커스·aria-live 존재
- **T-26** reduced-motion: 파도 경고·low 상태가 정적 부호로 표시되고, **모션 정지 중 경고 없는 판정 발생 0**
- **T-27** 실패 반복 정책: 1회차 `failVerse` 전문 → 2회차 **`failVerseShort` 감수분 렌더**(렌더된 문자열 === 정의의 축약 text — **런타임 절단 아님을 문자열 동일성으로 검증**) → 3회차 성구 생략·로테이션
- **T-28** 집중 게임 playing 중 외부 토스트 미표시(큐잉→결과 화면 방출)
- **T-30** **성능 계약: playing 중 셸 루트 리렌더 0** (HUD만 외부 구독 갱신) — 프로파일러 카운트
- **T-31** (v3) **광과민성 계약**: 판정 이벤트 10Hz 주입 시 ① 플래시 발화 슬라이딩 1초 윈도우 ≤3회 ② 전체 화면 플래시 클래스/스타일 미사용 ③ 3Hz 초과 구간에서 플래시 채널 자동 강등(링 파동+햅틱 경로 호출) 확인
- **T-32** (v3) **재클리어 정책**: 클리어 이력 있는 게임 재클리어 시 ① grace ≤800ms + 탭 통과 ② `clearVerseShort` 렌더(미등록 정의는 성구 미렌더) ③ 감정 버튼 미노출·보상 요약 노출 ④ 신규 통찰 달성 판은 티어 특별 연출 재생 ⑤ solemn 게임은 단축만·quiet 유지

### 플레이테스트 합격 기준 (M2, **n≥8**: 비신자 게이머 2~3인 별도 코호트 + 8~10세 1인+ + 60대 1인+ + 비게이머 2인+)

| # | 지표 | 기준 |
|---|---|---|
| P-01 | 첫 미니게임 클리어까지 중도 이탈 | 0 (3분 아하 모먼트) |
| P-02 | 실패 경험자의 재도전 시도율 / 재도전 탭 수 | ≥ 90% / 1탭 (100%는 장식 기준이므로 현실화, 미도전자는 사유 인터뷰) |
| P-03 | 비게이머 관대 모드 전 게임 클리어 | 가능 (낮은 바닥) |
| P-04 | 통찰 목표 자발 시도 | 숙련자 1인+ (천장) |
| **P-05** | **"또 하고 싶다"** | **≥ 70%** (전체·비신자 코호트 각각) |
| **P-06** | **추천 의향("친구에게 보여주겠다")** | **≥ 50%** |
| **P-07** | **자발적 재입장 발생**(관찰) | **≥ 50%** |
| **P-08** | 실측 세션 길이 중앙값 | 동사별 estMinutes 범위 내 |
| P-09 | 클리어까지 시도 횟수 분포 | 중앙값 1~4회 (계측 로그) |
| P-10 | "설교처럼 느껴졌다" / 감정 버튼 "오글거림"(비신자 별도 문항) | 0 / ≤ 20% |
| P-11 | 실패 성구 **부정 검출**: "거슬렸다/상황과 안 맞았다" | ≤ 10% (비신자 별도 집계. **교체 결정은 지표가 아니라 감수자 판단** — 말씀을 UX 지표에 종속시키지 않는다) |
| P-12 | 능력 보유/미보유 클리어율 차 | ≥ 10%p (체감 검증) |
| P-13 | 플레이어 노출 문구 이해도(8~10세 참가자) | 핵심 goalLine 전부 이해 (한자어 밀도 리뷰 — `readingLevel` 체크와 연동) |
| P-14 | (v3) 재클리어 체감: "반복 클리어 연출이 길게 느껴졌다" | ≤ 20% (통찰 재도전 3회+ 경험자 대상 — 재클리어 정책 실효 검증) |

---

## ⑩ 신학 체크포인트

### A. 상설 감수 게이트 (문서 선언 아님 — §③ CI가 집행)
- **주체·절차 명문화**: 통합측 목회자 **2인 이상** 감수. 반려 시 사유 기록 → 수정 → 재검 → `reviewed{by,date,version,contentHash}` 기입. 텍스트 수정 시 해시 불일치로 **감수 자동 해제**.
- **범위 = 노출되는 전 텍스트** = §③ **감수 경로 1:1 대응표**의 전 항목(전문·축약본·title·subtitle·goalLine·howTo·label·unlock·moments·failComforts·choices) + `shell/strings.ts`(감정 버튼 라벨·고정 안내). 목록과 스키마의 정합은 T-33이 기계 검증.
- **시점**: v1 끝자락이 아니라 **M0부터 등록 조건**. 미감수 텍스트는 개발 빌드 경고 + CSV, **프로덕션 빌드 실패**. 사후 추인 구조 제거.
- 감수 병목 완화: 마일스톤당 1회 배치 감수 + 긴급분 비동기 — 개발은 draft 텍스트로 진행하되 릴리스만 차단.

### 감수 항목
1. **성구 인용 전체** — 반쪽 인용 금지 원칙. 마 14:31은 "믿음이 작은 자여 왜 의심하였느냐"까지가 한 문장 — 위로/책망의 처리(온전 인용 또는 절 경계 존중 분리)를 **감수로 확정**하고 M0에서 기존 하드코딩 교체. 역본 저작권은 §⑧ M1.
2. **통찰 unlockText 작성 지침(명문화)**: 본문이 실제로 말하는 것을 넘지 말 것. 심리학·자기계발식 재해석 금지. 표준 예시: ~~"두려움은 파도가 아니라 시선에 있었다"~~(폐기 — 시선 관리 기술로 환원) → **"'주여 나를 구원하소서' — 외침이 곧 믿음이었다"**. 반려 예시는 `docs/theology/antipatterns.md`에 안티패턴으로 축적.
3. **기적 클리어 기제 구조**(문구에서 확대) — grace 비트의 kind·타이밍·입력 잠금 설계 자체가 감수 대상: "인간의 몫을 다한 뒤 그분이 여신다"가 90초의 몸 경험과 모순되지 않는가. 공로 구원의 인상을 주는 파라미터 구조(예: 실력 수치가 기적 발동 조건으로 보이는 연출) 점검.
4. **12장 수난 nofail·solemn 구조** + **부활 비트의 기쁨 회복** — 이원화 설계의 합당성.
5. **3장 관찰자 구조** — 사탄 대사 수위 + 예수님의 답이 항상 '기록되었으되'(신명기 말씀) 그대로 출력되는지. `agency` 스키마가 1차 방어, 최종은 감수.
6. **관대 모드 명칭·문구** — "잔잔한 물결" 등이 믿음의 크기=난이도 오해를 주지 않는지.
7. **solemn 대상 목록**(11장 겟세마네·12장 수난) 확정 — 통찰·축하 비활성 범위.
8. 이단 유입 차단: 전 텍스트가 registry 정의(코드 리뷰 + Zod + 감수 CSV) 안에만 존재, 외부 주입 경로 없음. 예수님 격리 refine은 관계·수집 시스템과 공유 스키마로 이중 적용.
9. **(v3 신설) 성구 반복 노출 정책** — 실패(전문→축약→생략)·재클리어(축약/생략) 단계 설계 자체가 감수 대상:
   - **축약본의 신학적 승인**: `failVerseShort`·`clearVerseShort`는 런타임 절단이 아니라 **감수자가 선정·승인한 별도 텍스트 단위**다. 스키마가 '한 절 온전 인용·전문 절 범위 내'를 강제하지만(§③ 절 경계 refine), **어느 절을 축약으로 세울지**는 기계가 아니라 감수자가 정한다 — 예: 마 14:31 전문(책망 포함)의 축약을 위로 절만으로 세우는 것이 본문 왜곡인지 여부는 감수 판단 사항.
   - **생략 단계의 승인**: 3회차+에서 성구를 생략하고 위로 문구로 대체하는 정책, 재클리어에서 성구를 생략하는 정책이 "말씀 경시"가 아니라 "말씀을 로딩 문구로 소모하지 않는 보호"임을 감수로 확인.
   - **노출 형태 전수 원칙**: 화면에 나가는 말씀의 모든 형태(전문·축약)는 감수·contentHash 검증을 거친다. 감수되지 않은 형태의 말씀이 노출될 코드 경로는 존재하지 않는다(§③ CI 규칙 2, §⑥ 금지 계약 "성구 문자열 런타임 절단", T-27 문자열 동일성 검증).

---

## ⑪ 리스크와 완화책

| 리스크 | 영향 | 완화책 |
|---|---|---|
| 계약이 얇아 특수 케이스(nofail·ink 분기·checkpoint)가 셸 오염 | 재작성 | 극단 케이스를 M0 타입에 선반영(판별 유니온·graceBeat·checkpoint). v1 전 5동사 각 1개로 계약 동결 |
| 계약이 두꺼워 코어 개발 지연 | 콘텐츠 속도 | 코어 필수 API 6개(params/flags/paused/hud/moment/report) 고정, memo·hud는 옵셔널 사용 |
| **상설 감수 게이트가 개발 병목화** | 마일스톤 지연 | draft 모드 개발 빌드 허용(릴리스만 차단), 마일스톤당 배치 감수, 감수자 2인 분담. 축약본은 전문과 같은 배치에서 함께 감수(왕복 1회) |
| rAF·HUD 성능(저가 안드로이드) | 판정 불신 | HUD 외부 구독(T-30로 계약 보증), sim은 순수 함수+ref, Capacitor 전 실기기 60fps 예산 테스트 |
| persist 스키마 파손 | 신뢰 상실 | M0에서 version:1+migrate(§③ 변환 명세) 도입, 필드 추가만 허용, T-23 회귀 2종. 백필은 안전측 상향(완료 보존) |
| 통찰이 점수/등급화 | 레드라인 위반 | 비교 불가·비수치·이야기+코스메틱 보상만. 미달성 "?" 실루엣. 순위 필드 원천 배제 |
| **juice 과다가 solemn 톤 훼손** | 신학·정서 리스크 | solemn 플래그가 juice 계층(스팅어·햅틱·축하)을 스키마 수준에서 차단 — 코어 재량 아님 |
| **고빈도 판정 플래시의 발작 위험(WCAG 2.3.1)** | **출시 불가 항목** | impact.ts 리미터(≤3회/초·면적 상한·전체 화면 금지) + 3Hz 초과 자동 강등 — 코어 우회 불가, T-31 상시 |
| **데일리 변주가 FOMO화** | 윤리 원칙 위배 | 놓쳐도 소멸·차감·연속 보너스 없음. 데일리 관련 카운터 필드 스토어 반입 금지(코드 리뷰 체크리스트) |
| 재미 게이트 실패(특정 동사가 재미없음) | 15개 노잼 양산 | **동사별 소형 게이트(§⑧ FG-표: M0 균형·M1 리듬/퍼즐·M2 물류·v1 추리)**로 분산 검증 — 단일 게이트 의존 제거. 실패 시 해당 동사만 확장 동결, 셸·타 동사 진행 유지 |
| **재클리어 절제가 과해 세리머니 상실** | 감동 톤 훼손 | 신규 통찰 달성 판은 특별 연출 전면 유지(§⑤ 예외 4항), P-14로 체감 검증. 절제 대상은 '반복'뿐 |
| 입력 훅 파편화 | 유지보수 | 신규 훅은 2개 이상 게임이 요구할 때만. 키보드 경로 포함이 추가 조건 |
| 리듬 기기별 레이턴시 불공정 | 통찰 목표 불신 | v1 캘리브레이션(첫 실행 오프셋 저장) + 통찰 판정은 보정 후 타임스탬프 기준. M2에 offsetMs API 자리 선확보 |
| 계측 로그의 프라이버시 오해 | 신뢰 | 로컬 온리·네트워크 금지 유지, 내보내기는 수동 조작만, 설정에서 로그 비활성 가능 |
