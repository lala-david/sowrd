# 상세 플랜 — 쉼터 · 관계 심화 시스템 (Hub & Bonds)

> *동행: The Gospel Road* 의 캠페인 동반 + 포스트 캠페인 관계 엔진.
> Hades식 드립피드 대화 풀 · 재방문 반응형 대사 · 선물 · 관계 레벨 → 가시적 능력/장면 해금 · 재도전 루프 연동 · 데일리 리듬(초대형).

- 버전 0.3 (2차 재검증 잔여 지적 전량 반영) · 2026-07-20
- 상위 문서: [`../GDD.md`](../GDD.md) §3(코어 루프) §8(진행·보상), [`../ENGAGEMENT.md`](../ENGAGEMENT.md) §2(SDT) §4(Hook) §5(인지 편향)
- 정합 대상: 수직 슬라이스 v0.1 (`src/state/store.ts`, `src/content/schema.ts`, `src/content/companions.ts`, `src/screens/*`, `src/styles/global.css`)
- 공통 지침: [`feedback/_common.md`](feedback/_common.md) 전 항목 반영

---

## v3 변경 로그 (2차 재검증 잔여 지적 대응표)

| # | 출처 | 지적 요약 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| 신-v3 | 신학(9점) | 예수님 등장 비네트('새벽 숯불')가 유대 수치 게이트 뒤 `BondUnlock vignette`로 해금 — T1 격리가 이 경로에서만 선언에 그침 | ③-F, ③-G, ②-E, ⑨-U3·L8, ⑩-T1·T9 | **(a)+(b) 동시 채택.** (a) `SacredSceneSchema.trigger`에 `bondLevel` 조건 신설 — "유대 4단계 도달이 장면의 **문**은 열되, 장면 자체는 수치 무관한 SacredScene"으로 데이터 표현 일원화. '새벽 숯불'은 BondUnlock에서 **제거**하고 SacredScene으로 이관. (b) L8 린트 신설 — SacredScene 화이트리스트 밖 knot(비네트·대화 포함)에서 예수님 화자 태그 검출 시 **빌드 실패**. SacredScene은 토스트·해금 목록·수집 카운터에 표기 금지(보상 프레이밍 차단) |
| 겜-v3 | 게임D(8.5점) | 선물 6점을 동료별 산수표에 이중 계산 — 공유 8종을 6인에 중복 산입해 1.3배 버퍼가 허구(실제 1.08배) | ③-C, ③-E, ⑨-L3 | **favored 선물을 동료당 전용 2종(총 12종)으로 전환** — 해당 동료 연계 에피소드 보너스 목표로만 획득(경합 0). 공유 일반 선물 4종은 **보너스 층으로 격하**하고 산수표·L3 린트에서 **산입 금지** 명문화. 재산정: 전용 공급원만으로 동료당 32점 ≥ 31.2 ✓(⑤ 재도전 목표 3→4로 보강). L3 린트 산식을 "전용 공급원 합계 ≥ maxThreshold×1.3, 공유 선물 산입 시 실패"로 재정의 |
| 엔-v3 | 엔지(8.7점) | persist partialize 갱신 부재 — 플랜대로면 마이그레이션은 성공해도 HubState 전체가 저장 안 돼 세이브 유실 | ④, ③-H, ⑨-U17·U18 | ④에 **partialize v2 화이트리스트 명문화**(영속 12필드 추가 + 휘발 필드 제외 목록 명시). `hearthStage`는 상태에서 **제거**(firewood 파생값 — 이중 소스 금지). `PERSISTED_HUB_KEYS` 상수 신설. U17 **저장 왕복(write→직렬화→rehydrate) 테스트** + U18 partialize 키 집합 ↔ 상수 diff 0 테스트 추가 |
| UX-v3 | UX(8.5점) | 유대 게이지 '채움↔트랙' 인접쌍 2.68:1 < 3:1(WCAG 1.4.11) — ⑦-A 표·CI 모두 이 쌍 누락 | ⑦-A, ⑦-C, ⑨-U16·P28 | ⑦-A에 인접쌍 실측 행 추가(2.68:1 ✗). **panel·lamp 고정 시 단일 트랙 색으로 두 기준 동시 충족은 수학적으로 불가**(필요 휘도 ≥0.143 ∧ ≤0.136 = 공집합)를 문서 명기. **구조적 해법 2중**: 채움 선단 2px 경계 마커(`--ink-on-light`, 대 채움 9.5:1 · 대 트랙 3.5:1) + 게이지 옆 수치 병기(`12/15`, aria-valuenow와 동일 소스). CI 대비 검사에 인접쌍 목록 순회 추가 — 미달 쌍은 구조 대체 페어(마커 2행)가 기준 충족해야 통과. P28 실브라우저 검증 추가 |
| 비-v3 | 비신자(8.4점) | v1 능력 3종뿐 — 핵심 6인 중 3인은 유대 만렙에도 게임플레이 보상 0, "관계=능력" 약속이 로스터 절반에서 파기 | ③-G, ⑧-v1, ⑨-L9 | **v1 로스터 6인 전원에게 가시적 능력 1개씩 배정**(6종): 베드로 "다시 한 번!" · 안드레 "한 사람 더"(동료 능력 대여) · 마태 "장부 정리" · 요한 "가만히 보기" · 빌립 "실무 견적 II" · 마리아 "마음에 새기다"(실수 실드). **로스터 게이트 규칙** 신설: 가시적 능력을 줄 수 없는 인물은 v1 유대 로스터 불가(게스트로 강등). L9 린트 — 로스터 동료 중 `type:'ability'` 해금이 0개인 동료 존재 시 빌드 실패 |

---

## v2 변경 로그 (1차 검증 필수수정 대응표)

| # | 출처 | 필수 수정 요약 | 해소 위치 | 해소 방식 |
|---|---|---|---|---|
| 신-1 | 신학 | 예수님 id의 유대·선물·대화풀 진입을 코드로 차단 | ③-A, ⑨-U1~U3, ⑩-T1 | `NO_BOND_IDS` 상수 + Zod `refine` 3중 차단(대화/선물/해금) + parse 실패 단위 테스트 + CI 콘텐츠 린트. 예수님 허브 등장은 수치 없는 `SacredSceneSchema` 별도 분리(감수 제출물) |
| 신-2 | 신학 | 시나리오 A '파도' → 마 14:30 본문대로 '바람' 교정 | ②-A, ⑩-T2 | 대사 교정 완료. 플랜·목업의 모든 예시 대사도 review 파이프라인과 동일한 본문 대조 절차 적용을 T2에 명문화 |
| 신-3 | 신학 | 유다 유대 상한/별도 트랙 + 11장 이후 퇴장을 데이터 모델에서 확정 | ③-A, ③-F, ⑩-T6 | 유다는 `bonds` 진입 불가(코드 차단) — 수치 없는 서사 트랙 NPC. 대사는 `bondReward 0` 스키마 강제, 선물 불가, ep11 클리어 시 허브 퇴장(`departsAfter`) |
| 신-4 | 신학 | '등불 기름'(마 25 연상) 명칭 재고 + 무효과 명문화 → T8 | ③-E, ⑨-U14, ⑩-T8 | 명칭을 **'장작'**으로 변경(열 처녀 비유 연상 차단). 게임플레이 무효과를 스키마 리터럴 + 정적 검사 + 테스트로 강제. 용처는 쉼터 시각 성장(코스메틱)으로 정의 |
| 신-5 | 신학 | 이단 어휘 금칙어 목록 + CI 자동 검사 | ⑧-M0, ⑩-T2 | `content/lint/forbidden-terms.json` 초안(신천지·JMS·하나님의교회·통일교 특유 어휘)을 M0 산출물로 확정, 총회 이단사이비대책위 자료 참조·감수위원 확인, CI 린트로 대화·묵상·ink 소스 전량 검사 |
| 겜-1·엔-3·비-1 | 게임D·엔지·비신자 | 유대 경제 산수 붕괴(24점 도달 불가) | ③-C, ⑥ | `finishEpisode`에 동반 동료 유대 +1 계약 추가. 수급원별 산수표 + 콘텐츠 린트로 `총량 ≥ maxThreshold×1.3` 강제(⑨-L3). *(v3에서 공유 선물 이중 산입을 제거하고 전용 공급원 기준으로 재산정 — v3 변경 로그 겜-v3)* |
| 겜-2 | 게임D | '방문' 경계 미정의(재입장 스팸) | ⑤-A | 방문 토큰 = 에피소드 플레이 1회 종료 **또는** 논리 날짜 경계 통과 시에만 갱신. 재입장 무효. "한 판 더 하고 오면 열린다" 안내로 순환 강화 |
| 겜-3·비-3 | 게임D·비신자 | 캠페인 종료 후 허브 수명 0 | ①, ③-D, ⑧-v1 | 포지셔닝을 '캠페인 동반 + 포스트 캠페인 재도전 루프'로 수정하고, 포스트 캠페인 축(재도전 반응 대사·에필로그 체인·주간 회상·잡담 매트릭스·쉼터 성장)을 v1 범위에 편입. once 공급/소비 산수표 병기 |
| 겜-4·비(low) | 게임D·비신자 | 실패 힌트 대사로 가는 라우팅 부재 | ②-D, ⑤-C, ⑨-I5 | 실패 이탈 화면 한 줄("마태가 할 말이 있는 것 같아요") + 맵 쉼터 아이콘 위 해당 동료 얼굴 미니 아이콘. 통합 테스트 추가 |
| 겜-5·비-4 | 게임D·비신자 | 첫 해금 능력이 비지각 버프(+10%) | ③-G, ⑧-M3 | 첫 능력을 가시적 개입("다시 한 번!" 컷인 재도전권)으로 교체, 수치 버프는 2번째 이후로. 능력×에피소드 유용성 매트릭스 + 보유/미보유 A/B 수치 검증 + 능력이 쓰이는 재도전 루프 신설 |
| 엔-1 | 엔지 | 세이브 키를 v2로 바꾸면 migrate 미발동 → 세이브 유실 | ④, ⑧-M0, ⑨-U15 | 스토리지 키 `donghaeng-save-v1` **유지**(키의 v1은 화석으로 인정) + `version: 2` + `migrate`(암묵 v0 → 2). 구 세이브 로드 테스트 명시. *(v3에서 partialize 화이트리스트 갱신까지 명문화 — 엔-v3)* |
| 엔-2 | 엔지 | `once:false && bondReward>0` 잡담 무한 파밍 | ③-B, ⑨-U8 | Zod `refine(e => e.once \|\| e.bondReward === 0)`으로 파싱 단계 거부 + 엔진에서도 `!once`면 가산 무시(이중 방어). 테스트 8을 스키마 거부 검증으로 교체 |
| 엔-4 | 엔지 | draft ink knot 본문이 번들에 실려 나감 | ④, ⑧-M6, ⑩ 게이트 | 빌드 스텝: 승인 knot 화이트리스트로 미승인 knot 스트립 후 컴파일 + `inkKnot` ↔ 실제 knot 참조 검증(불일치=빌드 실패) |
| 엔-5 | 엔지 | 테스트 20·21이 jsdom에서 검증 불가(가짜 테스트) | ⑨ 계층표 | 테스트 도구 4계층(Vitest/RTL/Playwright/정적 린트) 구분 신설. reduced-motion·히트박스·렌더 대비는 Playwright, 토큰 대비는 순수 계산 테스트, `--touch` 미사용은 정적 린트로 이관 |
| 엔-6 | 엔지 | completeEpisode/recordEpisodeResult 이중 호출 지뢰 | ⑥ | 단일 `finishEpisode(episodeId, result)` 액션으로 통합(completed·companions·lastPlayed·failStreak·bond 원자 갱신). 중도 이탈 = failStreak 미증가 규칙 명문화 |
| UX-1 | UX | 게이지 트랙 대비 1.26:1 (WCAG 1.4.11 위반) | ⑦-A | `--track: rgba(236,231,218,0.40)`(합성 #6B6F79, --panel 대비 3.3:1) 신설. 대비 실측치 표 병기 + CI 자동 대비 검사. *(v3에서 채움↔트랙 인접쌍까지 구조 해법으로 봉합 — UX-v3)* |
| UX-2 | UX | reduced-motion이 pulse 하나에만 적용 | ⑦-C, ⑨-P2 | "모든 Motion 사용처는 reduced-motion 시 정적 폴백"을 전역 규칙으로 승격(모닥불·묵상 연출·토스트 포함). 묵상 연출 1탭 즉시 스킵 보장 |
| UX-3 | UX | 스크린리더 언급 0건 | ⑦-B | '접근성 계약' 절 신설: CompanionSpot aria-label, BondBadge `role=progressbar`, UnlockToast `aria-live=polite`, 키보드/스위치 내비게이션. RTL 접근성 트리 테스트 추가 |
| UX-4 | UX | 1회성 대사를 연타·오탭으로 영구 상실 | ③-H, ⑦-B | 대사 로그(스크롤백) + 라인 전환 300ms 디바운스 + 본 대사는 스크랩북 '나눈 이야기'에서 전량 재열람 가능(`seenDialogues` 기반) |
| UX-5 | UX | '등불' 3중 메타포 + 용도 없는 재화 | ②, ③-E, ⑦ | 메타포 분리: 새 대사=**말풍선 점**, 묵상=**등불**, 재화=**장작**(모닥불 성장). 장작 용처를 쉼터 시각 성장 단계표로 정의 |
| 비-2 | 비신자 | 플레이테스트 표본에 비신자 미명시 | ⑨-플레이테스트 | 참가자 50% 이상 비기독교인·무종교 게이머 명시(공통 지침 쿼터 2~3인 상회). 묵상 자발 탭률(D1/D2) 별도 지표. MVP는 정성 관찰 프로토콜, 정량 임계는 v1 베타(n≥30) |
| 공통-3 | 공통 | 감수는 상설 게이트(해시 연동) | ③-B, ⑩ 게이트 | `review`를 `{status, approvedHash}`로 확장 — 본문 해시가 승인 시점과 다르면 CI가 자동으로 `needs-review` 강등. 감수 주체(통합측 목회자 2인 이상)·반려→재검 절차 명문화. 미승인 시 프로덕션 빌드 실패 |
| 공통-4 | 공통 | 개역개정 저작권 + 인용 자동 대조 | ⑧-M0, ⑩-T3 | 대한성서공회 사용 허락 절차를 M1 이전 선행 과제로. `verses.source.json`(원문 대조본) ↔ 인용문 CI diff |
| 공통-5 | 공통 | 재미의 실체(보상 레이어·마이크로 리듬·가시 콜백·병렬 해금) | ③-D·G, ⑤-B, ⑥ | 해금물에 비네트·일러스트·쉼터 코스메틱 추가. `reportMoment` 계약(30~90초 리듬, kind별 소진 정책). 선물·성찰 선택의 가시적 콜백 규칙 + 미참조 flag CI 경고. 동료별 체인 병렬 구조 명시 |
| 공통-6·7·8·9 | 공통 | 접근성 플로어·테스트 인프라 선행·실코드 정합·토큰 규칙 | ⑦, ⑧-M0, ④ | 대비 실측표(4.5:1/3.0:1) + `--ink-on-light` 신설, git init+vitest를 M0 첫 태스크로, persist v0 기준 마이그레이션·세이브 쓰기 단일화, 신규 토큰은 global.css 명명 규칙 준수·hex 하드코딩 금지 |

medium/low 이슈 반영 위치: '한 식구' 라벨 교체(③-C), 두루마리 제외·선물 고증(③-E), 묵상 자발 체류 장치(②-B), 힌트 대사 저작 규칙(⑩-T2), 스키마 주석 위치(③-B), 선물 텔레그래프(③-E), D0~D3 가드 완화(⑤-A), failedAtLeast 축소(③-B), 논리 날짜 정의(③-B), pulse 컴포지터 재작성(⑦-C), 전역 폰트 스케일(⑦-B), FTUE 점진 공개(②-A, ⑧-M1), 1탭 성찰 응답·notes 상한(②-B, ③-B), 색각·점 크기(⑦-A), 토스트 재확인(⑦-B), 독해 수준(⑩-T2), 결합점 문구 정직화(⑥).

**미채택/부분 채택 항목과 사유**
- 민준의 "장작으로 소품을 **구매**" 제안 → 구매 UI 없이 **자동 누적 성장**으로 변형 채택. 상점 형태는 '거래' 인상을 만들어 초대 원칙과 충돌하며, 자동 성장이 동일한 "내가 가꾼 공간" 감각을 준다.
- 신학 low "묵상 최소 체류" → 강제 체류는 도입하지 않음(강요 금지 원칙). 대신 자발적 체류 장치(전후 문맥 펼치기·한 구절 더)와 관찰 지표만 채택.
- 비-v3의 대안 "로스터를 4인으로 축소" → 미채택. 6인 전원 능력 배정으로 해소(안드레·요한·마리아 신규 3종) — 축소는 수집·교차 대사·산수표 전반의 재설계 비용이 더 크고, 3종 신규 능력은 기존 컷인·실드·정지 연출 자산을 재사용해 저작 비용이 낮다.

---

## ① 목표와 범위

### 목표
1. **재방문의 이유를 "관계"로 만든다.** 에피소드 사이·클리어 후 들르는 쉼터에서 동료가 나를 기억하고, 방금 겪은 일에 반응하고, 조금씩 새 이야기를 연다(Hades 드립피드).
2. **관계가 게임적으로 유효하다 — 로스터 전원에서.** 관계 레벨이 오르면 **눈에 보이는** 개입·장면·능력이 해금되고, 그 능력이 쓰이는 **재도전 루프**가 함께 열린다(GDD 코어 루프 톱니 ②). v1 유대 로스터 6인 전원이 가시적 능력을 1개 이상 갖는다(③-G 로스터 게이트 규칙 — "절반만 유효한 시스템" 금지). 신앙 전제 없이 순수 게임 보상으로 성립한다.
3. **캠페인 동반 + 포스트 캠페인 지속.** 허브는 12장 캠페인의 페이스메이커이며, 캠페인 후에는 재도전·에필로그·회상·공간 성장 축으로 4~6주 이상 살아 있는 공간이다. ("상시 리텐션 엔진" 같은 과장 포지셔닝은 폐기 — 산수로 증명 가능한 범위만 주장한다. ③-D)
4. **데일리는 초대다.** 매일의 리듬은 ①잡담 리프레시 ②재도전 추천 ③묵상 초대 세 갈래이며, 묵상은 벌칙·스트릭 없는 순수 초대형 훅이다. 비신자 플레이어는 ①②만으로도 올 이유가 있다.

### 범위
- 쉼터(허브) 화면: 장소 배경 + 머무는 동료 배치 + **장작 누적에 따른 공간 성장** + 진입/퇴장 플로우
- 드립피드 대화 풀: 조건부·우선순위·1회성 대사 선택 엔진(데이터 주도, Zod 검증)
- 재방문 반응형 대사: 직전 에피소드/실패/재도전 성과/컬렉션 상태에 반응 + **실패 시 허브 유도 라우팅**
- 선물 시스템: 플레이로만 획득 → 동료별 반응·유대 포인트 + **선호 텔레그래프** + **동료별 전용 favored 공급**(경합 없는 산수)
- 관계 레벨(유대 단계): 대화·선물·동반 에피소드·재도전 목표로 상승 → 능력/비네트/일러스트/로어 해금 — **v1 로스터 6인: 베드로·안드레·마태·요한·빌립·마리아**(`companions.ts` 실코드 기준)
- **재도전 연동**: 동료 지정 보너스 목표·통찰 해법이 유대 수급원이자 능력 사용처 (미니게임 내부 설계는 각 미니게임 플랜, 여기서는 계약만)
- 데일리 묵상: 하루 1회 초대, 4복음서 구절 + 선택형 성찰 + 장작 1(코스메틱 전용)
- 유다 서사 트랙(수치 없음)과 예수님 특별 장면(수치 없음)의 **데이터 격리 규칙** — 예수님 화자는 SacredScene knot에서만 존재 가능(빌드 강제, ⑨-L8)

### 비범위
- 미니게임 5동사 각각의 상세 설계(별도 플랜 — 단, 능력·보너스 목표 계약은 ⑥에 정의)
- 월드/이동 레이어의 맵 탐색 — 쉼터는 "장소 한 컷" 씬
- inkjs 스토리 본편 저작 파이프라인 — 허브 대화도 ink를 쓰므로 인터페이스와 **빌드 게이트**만 정의
- 소셜/공유·푸시 알림 발송 인프라(문구 정책만 상속: 죄책감 어휘 금지)
- 수익모델, 계정/클라우드 세이브

---

## ② 플레이어 경험 시나리오

> 이 절의 모든 예시 대사는 T2 본문 대조 절차(⑩)를 통과한 문안이다. 플랜·목업에 실리는 예시 대사는 개발팀이 가장 많이 복사하는 문장이므로, 본 문서 개정 시에도 감수 파이프라인과 동일한 성경 본문 대조를 거친다.

### 시나리오 A — 클리어 직후 첫 방문 (D0, FTUE)
1. 8장 "물 위를 걷다" 클리어 → RewardScreen에 "쉼터에 들르기" 버튼(엄지 존).
2. 쉼터 = 갈릴리 밤 해변, 작은 모닥불. **첫 방문은 점진 공개**: 베드로 1인만 말풍선 점이 활성이고, 묵상 등불·선물·다른 동료 점은 이후 순차 개방(⑧-M1 완료 기준).
3. 탭 → 베드로: "…내가 왜 가라앉았는지 알아? **바람이 보이던 그 순간이었어.**" (마 14:30 '바람을 보고 무서워' 정합) — 방금 플레이한 내용에 반응하는 1회성 대사. 유대 +1. 동반 클리어 가산 +1로 이미 2점.
4. 대화 종료 → 말풍선 점 소멸. 안드레의 점 개방 → "형이 저러는 거 처음 봐?" 곁대사.
5. 나가기 전 하단 한 줄: "내일 아침의 묵상이 준비되어 있어요." (강요 없음)

### 시나리오 B — 다음날 재방문 (D1, 첫 레벨업 보장)
1. 앱 실행 → 이어하기 → 쉼터 입장. 묵상 등불이 은은히 점등(빨간 배지 아님).
2. 묵상 탭 → 도입 연출은 **1탭 즉시 스킵 가능**, 스킵 시 바로 구절 표시. 마 14:27 한 구절(세리프) + 선택 장치: [전후 문맥 펼치기] [한 구절 더 읽기] — 체류는 자발, 강제 없음. 성찰은 **마음 날씨 아이콘 1탭(맑음/구름/비)** 또는 자유 입력 또는 건너뛰기 → 장작 1 획득, 모닥불에 장작이 쌓이는 연출.
3. 베드로 후속 체인 2화: "그런데 그분은 왜 나를 바로 잡아주셨을까." → 유대 3점 도달 → **D1에 첫 레벨업 '길동무'**(threshold 3으로 튜닝, ③-C) + 해금 토스트.
4. 온보딩 구간(첫 3회 방문)은 방문당 once 2개까지 완화(⑤-A) — D1 세션이 굶지 않는다.

### 시나리오 C — 선물 (D8+, 낭비 불안 없는 투자)
1. 7장 오병이어의 **빌립 연계 보너스 목표** 달성으로 "보리빵 한 덩이"… 가 아니라 빌립 전용 favored "돌 저울추"를 획득(전용 선물은 해당 동료 연계 에피소드에서만 나온다 — ③-E). 공유 선물 "말린 무화과"도 별도 보너스 목표에서 획득.
2. **사전 텔레그래프**: 며칠 전 잡담에서 빌립이 "저울이 하나 있으면 그 계산이 훨씬 빨라질 텐데"라고 말했다(favored 힌트). 스크랩북 카드에도 알게 된 선호가 기록된다.
3. 빌립에게 전용 선물 → "이걸… 계산 없이 그냥 주는 건가?" 특수 반응 + 유대 +2. 공유 선물은 누구에게 줘도 +1 + 전용 반응(감점·실패 없음, 보너스 층 — 산수표 미산입 ③-C).
4. 이후 잡담에서 콜백: "네가 준 저울추, 오늘도 썼어. 정확했지." — 준 선물은 반드시 1회 이상 대사로 돌아온다(⑥ 콜백 규칙).

### 시나리오 D — 막힌 플레이어 (실패 라우팅)
1. 10장 타임어택 3연속 실패 → **실패 이탈 화면에 한 줄**: "마태가 할 말이 있는 것 같아요." (버튼 아님, 표시만 — 비강압 톤)
2. 맵의 쉼터 아이콘 위에 **마태 얼굴 미니 아이콘**이 뜬다(범용 점과 구별).
3. 쉼터의 마태: "나도 장부가 안 맞던 밤이 있었지. …순서를 바꿔보면 어때?" — 인물 성격(전직 세리=숫자)에서 자연히 나오는 힌트만 허용(⑩-T2 저작 규칙).

### 시나리오 E — 캠페인 클리어 후 4주차 (포스트 캠페인)
1. 12장 완주. 쉼터는 장작 누적으로 화덕·등불 둘·여명 배경까지 자란 상태.
2. 오늘의 재도전 추천: "7장 — 마태의 눈으로" (동료 지정 보너스 목표: 마태 능력으로 낭비 0 달성). 달성 → 유대 +2 + **신규 반응 대사** 해금: "네가 남김없이 거둔 걸 봤어. 나 옛날엔 남는 걸 세는 사람이었는데."
3. 베드로 유대 4단계 '동행' 도달 → **에필로그 체인**(3화) + 카드 일러스트 2종째(BondUnlock — 수치 보상의 끝은 여기까지다).
4. 그리고 **별개로**, 다음 허브 방문에서 조용히 특별 장면 "새벽 숯불"(요 21 숯불 회복 모티프)이 시작된다 — 이것은 `SacredScene`이다(③-F): 토스트도, 해금 목록 표기도, "보상 획득" 프레이밍도 없다. 유대 4단계는 이 장면의 **문을 열 뿐**이고, 장면 자체는 어떤 수치와도 무관하며 포인트의 결과물로 광고되지 않는다. 진입 문구는 "베드로가 그 새벽 이야기를 들려주고 싶어 한다"(화자는 베드로 — 예수님 등장 여부를 UI가 예고·판매하지 않는다).
5. 주간 회상: 논리 주 1회, 완료한 장 하나를 동료 2인이 함께 회고하는 교차 대화.

---

## ③ 데이터 모델 (TypeScript 스케치)

콘텐츠=데이터 원칙(GDD §10). 대화 본문은 `.ink`, 메타데이터는 JSON+Zod. `src/content/schema.ts`에 추가될 타입. **이 스케치는 M0에서 실코드와 diff 0을 유지한다.**

### ③-A 신성 격리 상수 (공통 지침 1 — 최우선)

```ts
// ── 신성/서사 격리 ───────────────────────────────────────
/** 유대·선물·수집 수치의 대상이 될 수 없는 id.
 *  - jesus: 은혜를 포인트로 사고파는 구조(공로주의 오해) 원천 차단 (⑩-T1)
 *  - judas: 배신자와의 유대를 게임이 보상하지 않는다 — 수치 없는 서사 트랙 (⑩-T6) */
export const NO_BOND_IDS = ['jesus', 'judas'] as const
/** 대화 풀 자체에 등장할 수 없는 id — 예수님 대사는 SacredScene으로만.
 *  화자 수준 강제: SacredScene 화이트리스트 밖 knot의 예수님 화자 태그는 빌드 실패 (⑨-L8) */
export const SACRED_IDS = ['jesus'] as const

const notSacred = (id: string) => !(SACRED_IDS as readonly string[]).includes(id)
const noBond = (id: string) => !(NO_BOND_IDS as readonly string[]).includes(id)
```

```ts
// ── 대화 풀 ──────────────────────────────────────────────
/** 대사 노출 조건 — 전부 만족해야 후보가 됨 (AND) */
export const DialogueConditionSchema = z.object({
  afterEpisode: z.string().optional(),
  /** 직전에 플레이한 에피소드가 이것일 때 (재방문 반응형) */
  justPlayed: z.string().optional(),
  /** 직전 에피소드(lastPlayed) 연속 실패가 N회 이상일 때 (힌트 대사).
   *  v0.1의 {episodeId, count}는 상태 모델(lastPlayed 단일)과 불일치라 축소 —
   *  스키마는 실제 능력만 약속한다 (엔지 피드백 (a)안 채택) */
  failedAtLeast: z.number().int().min(1).optional(),
  bondMin: z.number().int().min(0).optional(),
  bondMax: z.number().int().optional(),
  /** 선행 대사(체인 보장) */
  requiresSeen: z.array(z.string()).optional(),
  companionJoined: z.string().optional(),
  afterGift: z.string().optional(),
  /** 캠페인 클리어 후에만 (에필로그·회상) */
  postCampaign: z.boolean().optional(),
  /** 재도전 성과 후 (동료 지정 목표 id) */
  afterRetryGoal: z.string().optional(),
})
```

### ③-B 대화 엔트리 — 파밍·감수·신성 3중 refine

```ts
export const DialogueEntrySchema = z.object({
  id: z.string(),                       // 'peter.water.aftermath.1'
  companionId: z.string(),
  /** inkjs knot 경로 — 본문은 hub.ink 안에 산다 */
  inkKnot: z.string(),
  /** 높을수록 먼저 선택. 반응형(justPlayed) > 체인 > 일반 잡담 */
  priority: z.number().int().default(0),
  /** true = 한 번 보면 풀에서 제거(드립피드 본체).
   *  false = 조건 만족 시 반복 등장하는 '잡담'(idle) 대사.  ← 주석 위치 교정(v2) */
  once: z.boolean().default(true),
  conditions: DialogueConditionSchema.default({}),
  /** 유대 포인트 보상. 잡담(once:false)은 0 강제 — 아래 refine */
  bondReward: z.number().int().min(0).default(1),
  /** 감수 상태 — 본문 해시 연동 상설 게이트 (공통 지침 3) */
  review: z.object({
    status: z.enum(['draft', 'needs-review', 'approved']).default('draft'),
    /** 승인 시점의 본문(knot 텍스트) 해시. 본문이 바뀌면 CI가 status를
     *  needs-review로 자동 강등 → "감수 후 몰래 수정" 원천 차단 */
    approvedHash: z.string().optional(),
  }).default({ status: 'draft' }),
})
  // [신-1] 예수님 대사는 대화 풀 진입 불가 — SacredScene 전용
  .refine((e) => notSacred(e.companionId),
    { message: 'jesus는 대화 풀에 등장할 수 없습니다. SacredScene을 사용하세요.' })
  // [신-3] 유다 대사는 존재 가능하되 유대 보상 0 강제
  .refine((e) => noBond(e.companionId) || e.bondReward === 0,
    { message: `${'NO_BOND_IDS'} 인물의 대사는 bondReward 0이어야 합니다.` })
  // [엔-2] 잡담 무한 파밍 차단: once:false && bondReward>0 조합 거부
  .refine((e) => e.once || e.bondReward === 0,
    { message: '반복 잡담(once:false)은 bondReward 0이어야 합니다.' })
export type DialogueEntry = z.infer<typeof DialogueEntrySchema>
```

- 엔진 이중 방어: `dialoguePool`은 `!once`인 엔트리의 bondReward를 어떤 경우에도 가산하지 않는다(스키마를 우회한 런타임 데이터 대비).
- **논리 날짜 정의**(엔-low): `logicalDate = format(now − 3h, 'yyyy-MM-dd', 기기 로컬 타임존)`. `toISOString()`(UTC) 사용 금지 — 자정~03:00 완료는 전날 논리 날짜로 기록된다(⑨-U13).
- **notes 상한**(UX): `meditation.notes`는 최근 200개 순환 보관, 설정에서 전체 텍스트 내보내기 제공.

### ③-C 유대 단계와 경제 산수표 (겜-1·엔-3·비-1 + **v3 이중 계산 교정**)

```ts
export const BOND_LEVELS = [
  { level: 0, label: '스친 인연', threshold: 0 },
  { level: 1, label: '길동무',   threshold: 3 },   // D1 첫 레벨업 보장 튜닝
  { level: 2, label: '벗',       threshold: 8 },
  { level: 3, label: '한길벗',   threshold: 15 },  // '한 식구' → 여정 계열 어휘로 교체 (T5)
  { level: 4, label: '동행',     threshold: 24 },
] as const
```

- '한 식구'는 마 12:49-50의 '하나님의 가족 됨'(아버지의 뜻을 행함)과 충돌하여 **'한길벗'**(한 길을 걷는 벗)으로 교체 — 전 단계가 여정 언어로 통일(신학 medium 반영).

**수급원별 산수표 (핵심 동료 1인 기준, v1 볼륨) — 전용 공급원만 산입**

> **v3 교정(겜-v3)**: v0.2 산수표는 공유 선물 8종을 6인에게 각각 6점씩 이중 산입했다(필요 슬롯 24 vs 공급 8 — 6인 동시 육성 시 실버퍼 1.08배로 자체 규칙 1.3배 위반). v0.3부터 산수표와 L3 린트는 **동료별 전용 공급원만 산입**한다. 경합 자원(공유 선물)은 보너스 층으로 격하되어 산식·린트에서 제외된다.

| 수급원 | 단가 | 수량 | 소계 | 경합 | 비고 |
|---|---|---|---|---|---|
| 일반 once 대화 | +1 | 7 | 7 | 없음(동료 전용) | 캠페인 진행 연동 체인 |
| 심화 once 대화 (유대 2단계 이상 게이트) | +2 | 5 | 10 | 없음(동료 전용) | 상위 티어 개방 = 목표 구배 |
| 동반 에피소드 **첫 클리어** (`finishEpisode` 가산) | +1 | 3 | 3 | 없음 | "함께 모험한 만큼 가까워진다" |
| 동료 지정 재도전 목표 (1회성, 재도전 루프) | +2 | 4 | 8 | 없음(동료 전용) | v3: 3→4로 보강. 능력 사용처와 동일 루프 |
| **전용 favored 선물** (동료 연계 에피소드 보너스) | +2 | 2 | 4 | **없음 — 동료당 전용 2종 공급**(③-E) | 텔레그래프로 사전 안내 |
| **획득 가능 총량 (전용 공급원 합)** | | | **32** | | **≥ 24 × 1.3 = 31.2 ✓ — 6인 동시 육성에서도 성립(경합 0)** |
| 공유 일반 선물 (로스터 공유 4종) | +1 | — | — | 6인 경합 | **보너스 층 — 산수표·L3 린트 산입 금지** |

- **콘텐츠 린트(⑨-L3, v3 재정의)**: 동료별 `전용 공급원 합계 ≥ maxThreshold × 1.3`을 CI가 산술 검증. **공유 자원(`exclusiveTo` 없는 선물)을 동료별 합계에 산입하면 린트 자체가 실패**한다(이중 계산 재발 차단). 미달 동료는 빌드 실패.
- **도달 시뮬레이션**: 1단계(3) = D0~D1 · 2단계(8) = 캠페인 초중반 · 3단계(15) = 캠페인 후반+전용 선물 · 4단계(24) = 캠페인 완주 후 재도전 루프 병행 시 — 4단계 '동행'은 의도적으로 **포스트 캠페인 콘텐츠**다(겜-3의 (b)안과 맞물림). 6인 전원을 동시에 올려도 각자 32점 풀이 독립적으로 존재한다.

### ③-D once 공급/소비 산수와 잡담 매트릭스 (겜-3·비-3)

**once 공급 (v1)**

| 층 | 수량 | 개방 조건 |
|---|---|---|
| 핵심 6인 × once 12 (일반 7+심화 5) | 72 | 캠페인 진행 + 유대 게이트 |
| 에필로그 체인 6인 × 3 | 18 | 캠페인 클리어 + 유대 4단계 |
| 교차 대사 (동료 2인 조합) | 12 | companionJoined 조건 |
| 유다 서사 트랙 | 8 | ep04~ep11 구간 한정 |
| 재도전 반응 대사 (동료 지정 목표당 1 — v3: 동료당 4) | 24 | afterRetryGoal |
| 주간 회상 (교차, postCampaign) | 6 | 논리 주 1회 순환 |
| **합계** | **140** | |

**소비 속도 상한**: 방문 토큰(⑤-A) × 동료당 1개(온보딩만 2개) → 하루 최대 (에피소드 플레이 수+1)×동료 수. 심화·에필로그·재도전 대사는 게이트 뒤에 있어 캠페인 기간(10~14일)에 소진 가능한 양은 전체의 약 55~60%. **잔여 40%+주간 회상 순환이 포스트 캠페인 4~6주를 담당**한다.

**잡담 매트릭스 (once 고갈 후의 하한선)** — "바닥에 깔기" 한 줄이 아니라 저작 방식 명세:
- 템플릿: 동료당 8개 × 슬롯 변수 {직전 에피소드 결과(클리어/실패/재도전), 유대 단계 구간(0-1/2-3/4), 모닥불 단계, 최근 선물}
- 실효 조합: 6인 × 8템플릿 × 평균 6컨텍스트 ≈ **288 변형** — ink 조건 분기로 저작(전량 감수 대상, 공통 지침 3 "감수 범위 = 노출되는 전 텍스트")
- 반복 회피: 최근 노출 잡담 id 5개 큐를 두고 후보에서 제외 → "같은 말 반복" 감지 지연
- 잡담이 비어도 허브가 죽지 않도록: 말풍선 점은 once 후보가 있을 때만 표시(잡담은 점 없음 — 기대 관리)

### ③-E 선물 (고증 + 텔레그래프 + **v3 전용/공유 이원화**)

```ts
export const GiftItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string(),
  /** 획득처: 항상 플레이(에피소드 보너스 목표, 1회성). 구매·뽑기 없음 */
  sourceEpisode: z.string(),
  sourceHint: z.string(),
  icon: z.string(),
  /** v3: 전용 favored 선물 — 이 동료의 연계 에피소드 보너스 목표에서만 드랍.
   *  없으면 공유 일반 선물(보너스 층 — 유대 산수 미산입) */
  exclusiveTo: z.string().optional(),
}).refine((g) => g.exclusiveTo === undefined || noBond(g.exclusiveTo),
  { message: 'jesus/judas 전용 선물은 존재할 수 없습니다.' })

/** 동료별 선물 반응 — 감점 없음: favored=+2, 그 외 +1 */
export const GiftAffinitySchema = z.object({
  companionId: z.string(),
  /** v3: 반드시 exclusiveTo === companionId 인 전용 선물 2종 — L3 린트가 대조 */
  favoredGifts: z.array(z.string()).length(2),
  favoredKnot: z.string().optional(),
  genericKnot: z.string(),
  /** 선호 텔레그래프 잡담 knot — 위키 없이 게임 안에서 결정 완결 */
  telegraphKnot: z.string(),
}).refine((a) => noBond(a.companionId),
  { message: 'jesus/judas는 선물 대상이 될 수 없습니다.' })  // [신-1·3]
```

**v1 선물 16종 = 전용 favored 12종(동료당 2) + 공유 일반 4종 — 전부 1세기 갈릴리 서민 생활물 한정(T7)**

| 동료 | 전용 favored 2종 (연계 에피소드 보너스 목표 드랍) |
|---|---|
| 베드로 | 숫돌 · 목각 작은 배 |
| 안드레 | 보리빵 한 덩이 · 말린 생선 |
| 마태 | 셈돌 주머니 · 갈대 펜 |
| 요한 | 들꽃 한 묶음 · 벌꿀 한 조각 |
| 빌립 | 돌 저울추 · 대추야자 한 줌 |
| 마리아 | 양털 실타래 · 아마포 끈 |

- 공유 일반 4종: 질그릇 물병 · 말린 무화과 · 밀 이삭 한 단 · 소금 한 줌 — 누구에게나 +1(감점 없음), **유대 산수 미산입 보너스 층**.
- **두루마리는 제외**(1세기 갈릴리에서 사본은 회당·부유층 소유 고가품 — 시대착오). 참고 문헌(1세기 팔레스타인 생활사)은 콘텐츠 저장소 `docs/refs.md`에 명시.
- 인벤토리는 `gifts: string[]` **중복 없는 집합**(획득이 1회성이므로 중복 배열은 모순 — 겜 medium).
- 낭비 불안 제거: favored는 사전 잡담(telegraphKnot)과 스크랩북 카드 기록으로 알 수 있고, 전용 선물은 애초에 **해당 동료 연계 에피소드에서만 나오므로** "누구에게 줄까" 오배분 자체가 구조적으로 불가능하다. 어떤 선택도 감점이 없으며, 준 선물은 반드시 콜백 대사로 돌아온다(⑥).

### ③-F 유다 서사 트랙과 예수님 특별 장면 (신-1·신-3 + **v3 T1 격리 완결**)

```ts
/** 유다: 수치 없는 서사 트랙 NPC. COMPANIONS 로스터(수집 카드)에도 없음 — 실코드 확인됨 */
export const NarrativeNpcSchema = z.object({
  id: z.enum(['judas']),
  /** 이 에피소드 클리어 후 허브에서 퇴장 (빈 자리 연출은 감수 대상) */
  departsAfter: z.literal('ep11'),
  /** 유대 게이지 UI 자체를 렌더하지 않음 */
  showBondUI: z.literal(false),
})

/** 예수님 허브 등장: 수치·게이지·선물·유대 전무. 트리거된 특별 장면만.
 *  v3: bondLevel 트리거 신설 — 예수님이 등장할 수 있는 장면은 유대 게이트 뒤에
 *  있더라도 반드시 SacredScene으로 표현한다(BondUnlock vignette 사용 금지, ⑨-L8). */
export const SacredSceneSchema = z.object({
  id: z.string(),                        // 'sacred.embers.john21'
  trigger: z.object({
    afterEpisode: z.string().optional(),
    postCampaign: z.boolean().optional(),
    /** 유대 단계 도달이 장면의 '문'을 연다 — 단, 장면 자체는 수치 무관.
     *  UI는 이 장면을 토스트·해금 목록·수집 카운터·보상 문구로 표기하지 않는다. */
    bondLevel: z.object({
      companionId: z.string(),
      level: z.number().int().min(1).max(4),
    }).refine((b) => noBond(b.companionId)).optional(),
  }),
  inkKnot: z.string(),
  /** 감수 미승인 장면은 존재 자체가 빌드 실패 */
  review: z.object({ status: z.literal('approved'), approvedHash: z.string() }),
})
```

**SacredScene 표현 규칙 (T1 격리 — 문서 선언이 아니라 3중 코드 강제)**
1. **스키마(위)**: 예수님 등장 가능 장면의 유일한 데이터 표현. `review.status`는 `'approved'` 리터럴 — draft SacredScene은 parse조차 실패한다(⑨-U3).
2. **빌드 린트(⑨-L8)**: hub.ink 전 knot을 스캔해 예수님 화자 태그(`# speaker: jesus` / ink 화자 변수)가 SacredScene의 `inkKnot` 화이트리스트 **밖**(BondUnlock 비네트·DialogueEntry·잡담 포함 전부)에서 검출되면 **빌드 실패**. "유대 점수를 쌓으면 예수님을 만난다" 구조가 데이터 어느 경로로도 성립할 수 없다.
3. **UI 격리**: SacredScene은 UnlockToast 대상이 아니며, CollectionScreen '해금 내역'·보상 요약·진행률 어디에도 산입되지 않는다. 별도 '기억' 섹션에 재열람만 제공(수치·달성률 표기 없음). 진입 문구는 동료 화자 기준("베드로가 그 새벽 이야기를 들려주고 싶어 한다"), 예수님 등장을 예고·광고하는 문구 금지 — 이 프레이밍 규칙 자체가 감수 목록에 포함된다(⑩-T9).

- '새벽 숯불'(요 21 모티프)은 **BondUnlock vignette가 아니라** `SacredScene('sacred.embers.john21', trigger: { bondLevel: { companionId: 'peter', level: 4 }, postCampaign: true })`로 정의한다. 유대 4단계는 문이고, 장면은 은혜다 — 은혜가 포인트의 결과물로 오독될 통로를 데이터 표현에서 제거.
- 유다의 허브 대사(8개)는 DialogueEntry로 존재하되 refine이 `bondReward 0`을 강제하고, GiftAffinity·BondUnlock에는 진입 자체가 불가. ep11 클리어 시 퇴장 — 이후 모닥불 곁 빈 자리가 남는 연출(운명론·책임 전가로 읽히지 않도록 T6 고위험 감수).
- 예수님 장면 설계안 자체를 감수 제출물로 만든다(⑩-T1). ep08 위기 해소("말씀과 붙잡으심은 한 동작") 연출 정합은 미니게임 플랜 소관이나, 허브의 SacredScene도 동일 원칙을 따른다.

### ③-G 해금물 — 보상 실체 레이어 (겜-5·비-4·공통-5 + **v3 로스터 전원 능력 보장**)

```ts
/** v3: 비네트 메타 분리 — knot·감수 게이트를 갖는 1급 콘텐츠.
 *  예수님 화자는 L8 린트가 차단(비네트는 동료 시점 회고만 가능) */
export const VignetteSchema = z.object({
  id: z.string(),
  companionId: z.string(),
  title: z.string(),
  inkKnot: z.string(),
  review: z.object({
    status: z.enum(['draft', 'needs-review', 'approved']).default('draft'),
    approvedHash: z.string().optional(),
  }).default({ status: 'draft' }),
}).refine((v) => noBond(v.companionId))

export const BondUnlockSchema = z.object({
  companionId: z.string(),
  level: z.number().int().min(1).max(4),
  unlocks: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('ability'), abilityId: z.string(), label: z.string() }),
    z.object({ type: z.literal('lore'), loreId: z.string(), title: z.string() }),
    z.object({ type: z.literal('vignette'), vignetteId: z.string() }),  // VignetteSchema 참조
    z.object({ type: z.literal('illust'), illustId: z.string() }),      // 카드 일러스트 2종째
    z.object({ type: z.literal('hearth'), hearthItemId: z.string() }),  // 쉼터 코스메틱
    z.object({ type: z.literal('dialogue-tier') }),                     // 심화 대사 풀 개방
  ])),
}).refine((u) => noBond(u.companionId),
  { message: 'jesus/judas는 유대 해금 대상이 될 수 없습니다.' })  // [신-1·3]
```

**로스터 게이트 규칙 (비-v3)**: v1 유대 로스터 등재 조건 = **가시적 게임플레이 능력 ≥1**. 능력을 줄 수 없는 인물은 로스터가 아니라 게스트(잡담·교차 대사만, 유대 게이지 없음)다. "관계 레벨 = 눈에 보이는 능력"이 이 시스템의 대표 약속이므로, 절반만 유효한 넓은 로스터보다 전원 유효한 로스터가 우선한다. **⑨-L9 린트**: 로스터 동료 중 `type:'ability'` 해금이 0개인 동료가 있으면 빌드 실패.

**v1 능력 6종 — 로스터 전원, 전부 가시적 개입 ("영입 후 최소 2개 장 유효" 규칙)**

| 동료 | 능력 | 해금 | 형태 (전부 눈에 보이는 개입) | 유효 장 | A/B 검증 목표 |
|---|---|---|---|---|---|
| 베드로 | "다시 한 번!" | 유대 2 | 실패 직후 베드로 컷인 등장 → 그 자리에서 1회 재도전(액티브, 세션당 1회) | 실패가 존재하는 전 미니게임(12장 중 10장) | 3연패 이탈률 −20% |
| 안드레 | "한 사람 더" | 유대 2 | 에피소드 시작 전 안드레 컷인 → **다른 동료의 능력 1개를 이번 판에 빌려온다**(대여 슬롯 — '사람을 데려오는 자' 정체성, 요 1:41-42 모티프) | 타 능력 보유 시 전 장 | 능력 조합 사용률 · 재도전 목표 클리어율 +10%p |
| 마태 | "장부 정리" | 유대 2 | 자원 퍼즐 시작 시 마태가 판을 정돈하는 연출 + 초기 배열 보정 | ep04·ep07 (+재도전 고득점 필수 요소) | 보유/미보유 클리어율 +8~15%p |
| 요한 | "가만히 보기" | 유대 2 | 액티브 1회: 판 3초 정지 + 다음 목표 하이라이트(화면 가장자리 rose 비네트 연출) | 시간 압박 전 장(ep10 타임어택 포함) | 타임어택 클리어율 · 사용 시점 분포 |
| 빌립 | "실무 견적 II" | 유대 3 | 힌트 버튼에 빌립 얼굴 배지 + 물류 힌트 1회 무료 | ep04·ep07 | 힌트 사용률로 체감 측정 |
| 마리아 | "마음에 새기다" | 유대 2 | 판 시작 시 실드 1개 부여 — 첫 실수 1회 무효(실드 파열 컷인 + 한 줄 대사) | 실수 판정이 존재하는 전 장 | 초심자 완주율 · gentleMode 병행 효과 분리 측정 |

- v0.1의 "집중 미터 관대 +10%" 같은 **비지각 패시브는 첫 해금에서 금지** — 수치 버프는 2번째 이후 능력으로만(라이브옵스 교훈: 보이지 않는 버프는 없는 버프).
- 신규 3종(안드레·요한·마리아)은 기존 연출 자산(컷인·하이라이트·실드 아이콘)을 재사용하는 저비용 설계 — 미니게임별 신규 로직은 "정지 3초"(요한)와 "실수 1회 무효"(마리아) 훅 2개뿐이며 ⑥ 계약(`selectAbilityActive`)으로만 결합한다. 안드레 대여는 허브 쪽 상태(`borrowedAbility`)로 처리되어 미니게임은 "능력 보유 여부"만 읽는다.
- **능력이 쓰이는 곳 = 재도전 루프**(비-4 해소): 각 에피소드 재도전에 ①동료 지정 보너스 목표(예: "마태의 눈으로 — 낭비 0") ②통찰 해법(상위 해법)이 있고, 달성은 유대 +2·재도전 반응 대사·장작을 준다. "이미 깬 게임이 10% 쉬워짐"이 아니라 "능력으로만 열리는 새 목표"가 보상이다. GDD §8 '낮은 바닥/높은 천장'과 정합.
- 병렬 해금(공통-5): 동료별 체인·선물·재도전 축은 서로 독립 — 어떤 동료든 어떤 순서로든 올릴 수 있다. 선형 외길 금지.

### ③-H 상태 (hubSlice) + 영속 계약

```ts
interface HubState {
  bonds: Record<string, number>            // NO_BOND_IDS 키 진입 시 가산 무시 + dev 에러
  seenDialogues: string[]                  // once 제거·체인 판정·스크랩북 재열람 원본
  recentIdle: string[]                     // 잡담 반복 회피 큐(최근 5) — 휘발(저장 안 함)
  gifts: string[]                          // 중복 없는 집합
  givenGifts: Record<string, string[]>
  lastPlayed: { episodeId: string; cleared: boolean; failStreak: number } | null
  /** 방문 토큰 — finishEpisode 또는 논리 날짜 경계에서만 증가 (⑤-A) */
  hubVisitId: number
  /** 이번 방문 토큰에서 once를 소비한 동료 집합 — 영속(재시작 소비 초기화 방지) */
  visitConsumed: Record<string, number>    // companionId → hubVisitId
  meditation: { lastDoneDate: string | null; totalCount: number; notes: Record<string, string> } // 논리 날짜, 리셋 없음, notes 200개 순환(③-B)
  firewood: number                         // 장작 — 코스메틱 전용 (③-E, T8)
  // hearthStage 필드 없음(v3): firewood의 파생값 — hearth.ts 셀렉터로만 계산.
  // 상태에 두면 저장·마이그레이션 이중 소스가 된다 (엔-v3 스펙 구멍 봉합)
  unlockedAbilities: string[]
  borrowedAbility: string | null           // 안드레 "한 사람 더" 대여 슬롯 — 휘발(판 단위)
  retryGoalsDone: string[]                 // 동료 지정 재도전 목표 (1회성 판정, 중복 없는 집합)
}

/** persist 화이트리스트의 단일 진실 — store.ts partialize와 ⑨-U18 테스트가 공유 */
export const PERSISTED_HUB_KEYS = [
  'bonds', 'seenDialogues', 'gifts', 'givenGifts', 'lastPlayed',
  'hubVisitId', 'visitConsumed', 'meditation', 'firewood',
  'unlockedAbilities', 'retryGoalsDone',
] as const
```

**장작(구 '등불 기름') — T8 무효과 명문화**

| 장작 누적 | 쉼터 변화 (전부 시각·코스메틱) |
|---|---|
| 5 | 모닥불 불꽃 커짐 |
| 10 | 등불 하나 추가 |
| 20 | 여명 시간대 배경 해금 |
| 35 | 천막·양탄자 소품 |

- 수급: 묵상 +1 · 에피소드 첫 클리어 +1 · 재도전 통찰 +1 — **신앙 전제 없는 수급원 병행**(비신자도 공간이 자란다).
- **게임플레이 무효과 강제**: `systems/`·미니게임 코드에서 `firewood`/`hearthStage` 참조를 정적 검사로 금지(⑨-L5). 셀렉터도 HubScreen 렌더 전용으로만 export.
- 명칭에서 '기름'을 제거해 마 25 열 처녀 비유 연상(구원 준비 적립 오독)을 차단.

---

## ④ 모듈 / 컴포넌트 구조 (실코드 정합)

```
src/
  state/
    store.ts              # Screen에 'hub' | 'meditation' 추가.
                          # persist: 키 'donghaeng-save-v1' 유지 + version: 2 + migrate(암묵 v0→2).
                          # 키 이름의 v1은 화석으로 인정 — 키 변경 시 migrate 미발동·세이브 유실 (엔-1)
                          # 세이브 쓰기는 액션 내부에서만 (쓰기 경로 단일화, 공통-8)
    hubSlice.ts           # HubState + 액션 (같은 persist 스토어에 병합)
  content/
    schema.ts             # ③ 스키마 (문서 스케치와 diff 0 유지)
    dialogues.ts          # DialogueEntry[] (Zod parse — refine 위반 시 부팅 실패)
    gifts.ts / bonds.ts / meditations.ts / vignettes.ts / sacredScenes.ts
    verses.source.json    # 개역개정 인용 원문 대조본 (CI diff 대상, 공통-4)
    lint/forbidden-terms.json  # 이단 어휘 금칙어 (신-5, M0 산출물)
    ink/hub.ink           # 허브 대화 본문
  systems/
    dialoguePool.ts       # 순수 함수 — !once면 bondReward 무시(이중 방어)
    bondSystem.ts         # NO_BOND_IDS 가산 무시. 레벨업 판정 → 해금 diff
    meditationClock.ts    # 논리 날짜(now−3h, 로컬) 판정
    hearth.ts             # firewood → hearthStage 파생 셀렉터 (렌더 전용 — 상태 저장 금지)
    inkRunner.ts          # inkjs 래퍼: knot 진입, 변수 주입, 종료 콜백
  screens/
    HubScreen.tsx / MeditationScreen.tsx
  components/hub/
    CompanionSpot.tsx     # 말풍선 점(≥10×10px 지시 크기) + 히트박스 ≥44px + aria-label
    DialogueOverlay.tsx   # 하단 시트 + 대사 로그(스크롤백) + 300ms 디바운스 + 키보드 진행
    GiftSheet.tsx / BondBadge.tsx(role=progressbar) / UnlockToast.tsx(aria-live)
scripts/
  build-content.mjs       # ① 미승인 knot 스트립 → 컴파일 (엔-4)
                          # ② inkKnot ↔ 실제 knot 참조 검증 (불일치=빌드 실패)
                          # ③ approvedHash 대조 → 불일치 시 needs-review 강등 (공통-3)
                          # ④ 금칙어 린트  ⑤ 인용문 ↔ verses.source.json diff
                          # ⑥ 유대 경제 산수 린트 (전용 공급원 ≥ maxThreshold×1.3, 공유 산입 금지)
                          # ⑦ 토큰 대비 계산 검사(인접쌍 포함)  ⑧ firewood 참조 정적 검사
                          # ⑨ 예수님 화자 태그 화이트리스트 검사 (L8)  ⑩ 로스터 능력 보장 (L9)
```

**persist partialize v2 (엔-v3 — 세이브 유실 봉합, M0 완료 기준)**

현 실코드 `store.ts:52-56`의 partialize는 `completed / companions / gentleMode` 3개만 화이트리스트한다. hubSlice를 같은 persist 스토어에 병합하는 것만으로는 **HubState가 단 1바이트도 저장되지 않는다** — 마이그레이션이 성공해도 재시작 시 허브 진행 전량 증발. 따라서 partialize 갱신을 M0 산출물로 명문화한다:

| 구분 | 필드 | 사유 |
|---|---|---|
| 영속 (화이트리스트 추가) | `PERSISTED_HUB_KEYS` 11개 전부: bonds · seenDialogues · gifts · givenGifts · lastPlayed · hubVisitId · visitConsumed · meditation · firewood · unlockedAbilities · retryGoalsDone | 허브 진행의 원본. hubVisitId·visitConsumed도 영속 — 앱 재시작으로 방문 토큰 가드를 초기화하는 우회를 차단 |
| 휘발 (제외 명시) | screen · currentEpisode · recentIdle(세션 잡담 큐) · borrowedAbility(판 단위) · 토스트 큐 · 오버레이/시트 열림 상태 | UI·세션 상태 — 저장하면 복원 시 유령 상태 발생 |
| 저장 금지 (파생값) | hearthStage | firewood에서 `hearth.ts`가 계산. 저장 시 이중 소스 → 마이그레이션마다 불일치 위험 |

- partialize 구현은 `PERSISTED_HUB_KEYS` 상수(③-H)를 순회해 작성 — 필드 추가 시 상수·partialize·테스트가 한 곳에서 어긋나면 ⑨-U18이 실패한다.
- **⑨-U17 저장 왕복 테스트**: 허브 상태 기록 → persist 직렬화 → 새 스토어 rehydrate → 영속 11필드 보존 + 휘발 필드 초기값 확인. migrate 방향(U15)과 별개의 필수 케이스.
- 기존 화면 연결: `RewardScreen`에 "쉼터 들르기" CTA, `JourneyMap`에 쉼터 진입점 + 동료 얼굴 미니 아이콘(실패 라우팅), `CollectionScreen`에 유대 단계·로어·**나눈 이야기(대사 재열람)**·해금 내역 상시 재확인 + **'기억' 섹션(SacredScene 재열람 — 수치·달성률 표기 없음, ③-F)**.
- 신규 토큰(`--track`, `--ink-on-light`)은 `global.css` 명명 규칙을 따르며 컴포넌트 내 hex 하드코딩 금지(공통-9).

---

## ⑤ 핵심 플로우

### ⑤-A 방문 토큰 (겜-2 — '방문' 경계 정의)

```
hubVisitId 증가 조건 (둘뿐):
  1) finishEpisode 호출 (클리어/실패 무관 — 플레이 1회 완료)
  2) 묵상 논리 날짜 경계 통과 (기기 로컬 03:00)
허브 퇴장→재입장: hubVisitId 불변 → once 대사 추가 노출 없음 (문 스팸 무효)
앱 재시작: hubVisitId·visitConsumed 영속(④) → 재시작 스팸도 무효
```

- 동료당 once 노출: `visitConsumed[companionId] === hubVisitId`면 이번 방문 소진 — **방문당 1개** (온보딩 첫 3방문은 2개, 겜 medium D1 밀도 보강).
- 소진 상태 UX: 점이 꺼진 동료를 탭하면 잡담 또는 "한 판 더 하고 오면 들려줄 얘기가 있어" 류의 안내 → 허브→에피소드 순환을 오히려 강화. "새 대사가 있는데 못 보는" 프러스트레이션을 기대 관리로 흡수.

### ⑤-B 화면 전이와 마이크로 보상 리듬

```
map ──(쉼터 입장)──▶ hub ──(묵상 등불)──▶ meditation ──(완료/스킵)──▶ hub
 ▲                    │ └─(동료 탭)──▶ hub+DialogueOverlay ──▶ hub
 │                    └─(선물하기)──▶ hub+GiftSheet ──▶ DialogueOverlay(반응)
 └────(나가기)────────┘
reward ──(쉼터 들르기)──▶ hub                  (finishEpisode가 이미 기록됨)
game(실패 이탈) ──▶ 실패 화면 한 줄 "○○가 할 말이…" ──▶ map(동료 얼굴 아이콘) ──▶ hub
hub ──(SacredScene 트리거 충족)──▶ 장면 자동 시작(토스트·보상 표기 없음) ──▶ hub
```

- **마이크로 보상 리듬(공통-5)**: 허브 1방문(≤3분) 안에 보상 모먼트 ≥2개(새 대사/선물 반응/레벨업/모닥불 성장 틱/재도전 추천). `reportMoment(kind, id)` 계약으로 계측하며 소진 정책은 kind별 분리 — `once`(드립 대사·해금), `perSession`(잡담·응원), `onChange`(모닥불 단계). SacredScene은 reportMoment 계측 대상에서 제외(보상 리듬의 부품이 아니다 — ③-F UI 격리).

### ⑤-C 대사 선택 알고리즘 (dialoguePool.ts)

```
1. 후보 = entries.filter(조건 AND && (once ? !seen : !recentIdle 포함) && review.status==='approved')
2. 정렬: priority DESC → 체인 깊이(requiresSeen 길이) DESC → 정의 순서
3. 말풍선 점 = once 후보 ≥1 && visitConsumed ≠ 현재 hubVisitId 일 때만
4. 대화 종료 → seenDialogues += id; once면 visitConsumed 갱신;
   bonds[c] += (entry.once ? entry.bondReward : 0)   // 이중 방어
5. bondSystem 레벨업 판정 → 해금 diff → UnlockToast 큐잉
   (미니게임 화면에서는 토스트 표시 보류 — 집중 중 시각 토스트 금지, 공통-6)
   (SacredScene 트리거 충족은 토스트 대상 아님 — 다음 허브 입장 시 조용히 시작, ③-F)
```

### ⑤-D 묵상 상태 기계

```
locked(오늘 완료) ── 논리 날짜 경계 ──▶ invited(등불 점등)
invited ──(완료: 아이콘 1탭 or 자유 입력 or 건너뛰기)──▶ locked
        ──(무시)──▶ invited 유지 (벌칙·소멸·달력 구멍 표기 없음)
도입 연출: 어느 시점이든 1탭 스킵 → 즉시 구절 표시 (WCAG 2.2.2)
```

---

## ⑥ 타 시스템과의 인터페이스

### 쓰기 액션 (호출자 → 허브)
| 액션 | 호출자 | 계약 |
|---|---|---|
| `finishEpisode(episodeId, r)` | 미니게임 종료 시 **단일 호출** | `r = { cleared, retryGoalId?, insight? }`. 원자 갱신: `completed`·`companions`(기존 completeEpisode 흡수)·`lastPlayed`·`failStreak`(실패 시 +1, 클리어 시 0)·**동반 동료 유대 +1(첫 클리어)**·재도전 목표 유대 +2(1회성, 동료당 4개)·장작·`hubVisitId++`. **중도 이탈(← 버튼)은 호출하지 않음 → failStreak 미증가**(관대 원칙) — WaterWalkGame의 컴포넌트 로컬 fails는 이 액션으로 이관 |
| `grantGift(giftId)` | 미니게임 보너스 목표 | `gifts` 집합에 추가(중복 무시). 획득처는 항상 플레이. 전용 선물(`exclusiveTo`)은 해당 동료 연계 에피소드 보너스 목표에서만 드랍(③-E) |
| `completeMeditation(id, mood?, note?)` | MeditationScreen | 논리 날짜 기록 + `totalCount++`(리셋 없음) + 장작 +1(코스메틱 전용) |

### 읽기 셀렉터 (허브 → 소비자)
| 셀렉터 | 소비자 | 반환 |
|---|---|---|
| `selectAbilityActive(abilityId)` | 미니게임 | 해금 능력 보유 여부(안드레 대여 슬롯 포함 — 미니게임은 대여 출처를 구분하지 않는다) |
| `selectBondLevel(companionId)` | CollectionScreen, 대화 조건 | 단계 + 다음 단계 진행률 |
| `selectHasNewDialogue(companionId)` | JourneyMap, HubScreen | 점 표시 여부 |
| `selectHintCompanion()` | 실패 화면, JourneyMap | failedAtLeast 충족 동료 id(얼굴 아이콘·한 줄 안내용) |
| `selectMeditationInvited()` | JourneyMap, HubScreen | 오늘 묵상 가능 여부 |
| `selectUnlockedLore/Vignette(companionId)` | CollectionScreen | 재열람 목록 |
| `selectRetryRecommendation()` | JourneyMap | 오늘의 재도전 추천 1건 |

- **결합점 정직화(엔-low)**: 미니게임 ↔ 허브의 실제 결합은 **읽기 1(`selectAbilityActive`) + 쓰기 2(`finishEpisode`, `grantGift`) = 3개**다. "한 개로만 결합" 같은 과장 문구 폐기 — 이 표가 코드 리뷰 기준이다.
- **가시적 콜백 규칙(공통-5)**: `givenGifts`·`retryGoalsDone`·마음 날씨 선택은 각각 최소 1회 이상 후속 대사에서 참조되어야 하며, 어떤 대사에서도 읽히지 않는 flag는 CI 경고를 낸다. (성찰 자유 입력 원문은 예외 — 로컬 비공개 원칙이 우선, 대사는 "어제도 와줬구나" 수준까지만.)
- ink 변수 바인딩: 주입 `bond_<id>`, `just_played`, `fail_streak`, `hearth_stage`, `post_campaign` / 수신 `EXT_grant_bond(n)`(once 대화 한정), `EXT_unlock_lore(id)`.

---

## ⑦ UI 디자인 토큰 · 접근성

### ⑦-A 대비 실측표 (WCAG 2.1 상대 휘도 계산치 — CI 자동 검사로 회귀 방지)

| 용도 | 전경/배경 | 실측 대비 | 기준 | 판정 |
|---|---|---|---|---|
| 대화 본문 | `--ink` #ECE7DA / `--panel` #151F39 | 13.3:1 | 4.5:1 | ✓ |
| 묵상 구절 | `--parchment` #EDE3CE / `--ground-2` #111A30 | 13.5:1 | 4.5:1 | ✓ |
| 화자명 | `--dawn` #E98A6B / `--panel` | 6.5:1 | 4.5:1 | ✓ |
| 보조 텍스트 | `--muted` #9AA3BD / `--panel` | 6.5:1 | 4.5:1 | ✓ |
| 게이지 채움 | `--lamp` #F0B24A / `--panel` | 8.7:1 | 3.0:1 | ✓ |
| 게이지 트랙 (v0.1: `--line-soft`) | 합성 #283147 / `--panel` | **1.26:1** | 3.0:1 | **✗ 사용 금지** |
| 게이지 트랙 (v2 신설: `--track: rgba(236,231,218,0.40)`) | 합성 #6B6F79 / `--panel` | **3.3:1** | 3.0:1 | ✓ |
| **게이지 채움↔트랙 인접쌍 (v3 추가)** | `--lamp` / `--track` 합성 #6B6F79 | **2.68:1** | 3.0:1 | **✗ — 색으로 해소 불가, 구조 해법 적용(하단)** |
| **게이지 경계 마커 (v3 신설)** | `--ink-on-light` #20160A / `--lamp`(채움 쪽) | **9.5:1** | 3.0:1 | ✓ |
| **〃** | `--ink-on-light` / `--track` 합성 #6B6F79(트랙 쪽) | **3.5:1** | 3.0:1 | ✓ |
| 밝은 면 위 텍스트 (신설: `--ink-on-light: #20160A`) | / `--lamp` | 9.5:1 | 4.5:1 | ✓ |
| 〃 | / `--parchment` | 14.0:1 | 4.5:1 | ✓ |

**채움↔트랙 인접쌍 — 단일 색 해법의 수학적 불가능성 명기 (UX-v3)**
`--panel`(#151F39, 상대 휘도 0.0144)과 `--lamp`(#F0B24A, 0.509)를 고정하면, 트랙이 "vs 패널 ≥3:1"을 만족하려면 트랙 휘도 ≥0.143, "vs 채움 ≥3:1"을 만족하려면 ≤0.136이어야 한다 — **필요 휘도 구간이 공집합**이므로 어떤 단일 트랙 색도 두 기준을 동시에 충족할 수 없다. 따라서 이 쌍은 색 조정이 아니라 **구조로 해소**한다:

1. **채움 선단 경계 마커**: 채움 진행 끝에 2px 세로 마커(`--ink-on-light`) — 채움 쪽 9.5:1, 트랙 쪽 3.5:1로 양방향 3:1 충족(위 표). 진행 경계가 색 경계가 아니라 마커로 읽힌다.
2. **수치 병기**: 게이지 우측에 `12/15` 텍스트(`--ink`/`--panel` 13.3:1) — `aria-valuenow/max`와 동일 소스에서 렌더(시각·보조기기 정보 일치).
- '단계 점 아이콘'(색각 대응용)은 레벨 수만 전달하고 **단계 내 진행률은 전달하지 못하므로** 위 2안의 대체가 아니다 — 병행만 한다.
- **CI 대비 검사(⑨-U16) 확장**: 표의 전경/배경 페어에 더해 **인접쌍 목록(채움↔트랙)을 명시 순회**한다. 기준 미달 인접쌍은 '구조 보완' 플래그가 선언되어 있고 그 대체 페어(마커 2행)가 전부 기준을 충족할 때만 통과 — 플래그 없는 미달은 실패. 마커·수치의 실렌더 존재는 P28이 검증.
- 색각 대응: `--dawn`/`--lamp`는 적록색각에서 수렴하므로 같은 화면에서 의미 구분을 담당할 때 **위치·형태 차이 병행**(화자명=텍스트 위치 고정, 해금=아이콘 형태). 유대 게이지는 단계 수만큼 점 아이콘 병행(색+형태 이중 부호화 유지).
- 말풍선 점: 지시 크기 **≥10×10px** + 히트 영역 44px(고DPI 소형 기기 저시력 대응).

### ⑦-B 접근성 계약 (UX-3 — 스크린리더·입력·재열람)

| 요소 | 계약 |
|---|---|
| CompanionSpot | `role=button` + `aria-label="베드로, 새 대화 있음"` (점 상태를 텍스트로 병기) |
| BondBadge | `role=progressbar` + `aria-valuenow/max` + 단계 라벨 텍스트 + **가시 수치 병기(12/15 — aria와 동일 소스, ⑦-A)** |
| UnlockToast | `aria-live=polite`, 탭으로 해제(자동 소멸 시 최소 5초), 해금 내역은 CollectionScreen에서 **항상 재확인 가능**(WCAG 2.2.1) |
| DialogueOverlay | 진행=탭/Enter/Space, **대사 로그(스크롤백)**, 라인 전환 300ms 디바운스, 본 대사는 스크랩북 '나눈 이야기'에서 전량 재열람 — once 대사 영구 상실 경로 차단 |
| 키보드/스위치 | 허브 전 인터랙션 포커스 순회 가능(기존 `:focus-visible` 토큰 활용) — 1급 계약, 후순위 아님 |
| 폰트 스케일 | 앱 전역 rem 기반 1.0~1.4x 설정(묵상 구절만이 아니라 대화 본문·라벨·선물 설명 포함). 1.4x에서도 44px 타깃·줄바꿈 유지 검증 |
| 성찰 입력 | 마음 날씨 아이콘 1탭(맑음/구름/비) 병행 — 저문해력·아동에게 '쓰거나 스킵' 양자택일 강요 금지 |
| 독해 수준 | 대사·라벨 목표 독해 수준 초등 3학년, 문장당 40자 이내 — 감수 파이프라인 가독성 체크 항목(⑩-T2) |

### ⑦-C 토큰 적용 + 모션 전역 규칙 (UX-2)

| 요소 | 토큰 |
|---|---|
| 쉼터 배경 | `--ground` 기반 + 모닥불 `radial-gradient(--lamp 저알파)` — hearthStage에 따라 소품 레이어 추가 |
| 말풍선 점 | `--lamp` 링 — **pulse는 opacity/transform만 사용**(filter: brightness 금지 — 저가 기기 래스터라이즈 방지, 엔-low). 기존 `.pulse` 재정의 |
| 유대 게이지 | 채움 `--lamp` / 트랙 `--track`(신설) + **채움 선단 2px 경계 마커 `--ink-on-light`** + **수치 병기(12/15)** + 단계 점 아이콘 병행(⑦-A 구조 해법) |
| 대화 오버레이 | 패널 `--panel`, 경계 `--line`, 화자명 `--dawn`, 본문 `--ink`, 성구·감정 대사 `--serif`, UI `--sans` |
| 묵상 화면 | `--ground-2` 전면, 구절 `--parchment` 세리프 대형, 완료 버튼 `--lamp` + 텍스트 `--ink-on-light` |
| 해금 토스트 | `--lamp-soft` 글로우 1회, 과한 파티클 금지 |

**모션 전역 규칙**: 모든 Motion 사용처(말풍선 pulse · 모닥불 흔들림 · 묵상 도입 연출 · UnlockToast 글로우)는 `prefers-reduced-motion`에서 **정적 폴백**을 갖는다. 묵상 도입 연출은 모션 설정과 무관하게 1탭 즉시 스킵. 개별 예외 없음 — Playwright 테스트가 사용처 목록을 순회(⑨-P24).

---

## ⑧ MVP → v1 단계별 로드맵

| 단계 | 범위 | 완료 기준 |
|---|---|---|
| **M0 인프라·스키마** | **git init + vitest 셋업(첫 태스크, 공통-7)** · ③ 스키마를 schema.ts에 이식(문서와 diff 0) · persist `version: 2`+`migrate`(키 `donghaeng-save-v1` 유지) + **partialize v2 화이트리스트(`PERSISTED_HUB_KEYS`) 반영(④, 엔-v3)** · **금칙어 목록 초안**(총회 이단대책위 자료 참조, 감수위원 확인) · **개역개정 사용 허락 절차 개시(대한성서공회)** · build-content.mjs 골격(refine·산수 린트) | 타입 체크 + 마이그레이션(암묵 v0→2) 단위 테스트 + **저장 왕복 테스트(U17)·partialize diff 테스트(U18)** + refine 거부 테스트 통과 |
| **M1 허브 뼈대 (MVP)** | HubScreen + CompanionSpot + DialogueOverlay(로그·디바운스 포함). 정적 라인 배열. 베드로·안드레 2인, 대사 8개(반응형 2 포함). **FTUE 점진 공개**(첫 방문 점 1개만 활성) | 시나리오 A 실기기 재현 + 무설명 첫 탭 성공률 관찰 가능 상태 |
| **M2 드립피드 엔진** | dialoguePool(조건/우선순위/체인/**방문 토큰** 가드) · `finishEpisode` 통합 액션(기존 completeEpisode 흡수) · 실패 힌트 + **실패 라우팅**(실패 화면 한 줄, 맵 얼굴 아이콘) | 시나리오 B·D 재현 + 엔진 단위 테스트 전부 통과 |
| **M3 유대·가시 해금** | bondSystem, BondBadge(**경계 마커·수치 병기 포함**), UnlockToast, 베드로 **"다시 한 번!"**·마리아 **"마음에 새기다"** 2종을 WaterWalkGame에 연결(컷인·실드 훅 검증) | 관계 레벨업 → 플레이어가 **눈으로 확인 가능한** 변화. 보유/미보유 A/B 지표 수집 시작 |
| **M4 선물·재도전 계약** | grantGift + GiftSheet + **전용 favored 드랍(연계 에피소드 보너스 목표)** + 선호 반응 + 텔레그래프 잡담 · 재도전 목표(`retryGoalId`) 계약을 물 위 걷기 1건에 시범 연결 | 시나리오 C 재현 + 재도전 목표 → 유대 +2 → 반응 대사 루프 1회 완주 |
| **M5 묵상·장작** | MeditationScreen(1탭 스킵·문맥 펼치기·마음 아이콘) + meditationClock(논리 날짜) + 장작→쉼터 성장 2단계 + 승인 묵상 14개 | 날짜 경계 테스트 통과 · 벌칙 부재 회귀 테스트 · firewood 무효과 정적 검사 통과 |
| **M6 ink 전환 (v1)** | 정적 라인 → hub.ink + inkRunner · **build-content.mjs 완성**: 미승인 knot 스트립 + 참조 검증 + approvedHash 게이트 + 금칙어·인용문 린트 + **예수님 화자 화이트리스트 검사(L8)·로스터 능력 보장(L9)** | 콘텐츠 추가 시 엔진 수정 0 · draft 문장이 번들에 부재함을 빌드 산출물 검사로 확인 |
| **v1 콘텐츠 볼륨** | 핵심 6인 × once 12(일반 7+심화 5) + 에필로그 18 + 교차 12 + 유다 트랙 8 + 재도전 반응 24 + 주간 회상 6 = **once 140** · 잡담 템플릿 48(≈288 변형) · 선물 16종(전용 12+공유 4) · **능력 6종(로스터 전원)** · 비네트 6(동료 시점 — 예수님 화자 부재를 L8이 검증) · **SacredScene 2('새벽 숯불' 포함)** · 일러스트 6 · 로어 12 · 묵상 30 (전부 감수 완료) | 산수 린트(동료당 전용 공급 총량 ≥31.2) 통과 · L8·L9 통과 · 신학 감수 1차 통과 · 플레이테스트 합격(⑨) |

---

## ⑨ 테스트 계획

### 도구 계층 (엔-5 — "항상 통과하는 가짜 테스트" 제거)

| 계층 | 도구 | 담당 |
|---|---|---|
| U 단위 | Vitest (순수 함수) | systems/*, 스키마 refine, 마이그레이션·저장 왕복, 토큰 대비 계산 |
| I 통합 | RTL/jsdom | 화면 전이, 상태 반영, **접근성 트리(aria)** — 레이아웃·CSS 미디어쿼리 검증 금지 |
| P 실브라우저 | Playwright | reduced-motion 적용, 히트박스 실측(≥44px), 렌더 결과 대비, 게이지 구조 마커 |
| L 정적/CI | build-content.mjs + lint | 금칙어, 인용문 diff, 산수 린트, knot 참조, firewood 참조 금지, `--touch` 미사용 요소, 예수님 화자 태그, 로스터 능력 보장 |

### U 단위 (Vitest)
1. **[신-1]** `companionId: 'jesus'`인 DialogueEntry/GiftAffinity/BondUnlock/Vignette은 **Zod parse가 실패**한다.
2. **[신-3]** `companionId: 'judas'` + `bondReward: 1`은 parse 실패, `bondReward: 0`은 통과. `bondSystem`은 NO_BOND_IDS 가산을 무시한다.
3. **[신-1·신-v3]** SacredScene은 `review.status !== 'approved'`면 parse 실패. `trigger.bondLevel.companionId`에 NO_BOND_IDS는 parse 실패. bondLevel 트리거 충족 판정은 bonds 수치를 읽되 어떤 수치도 **쓰지 않는다**(장면 완료가 유대·장작·카운터에 영향 0 — 회귀 테스트).
4. `once` 대사는 seen 포함 시 후보 제외 / `justPlayed` 우선 / `requiresSeen` 체인 보장 / `bondMin·Max` 경계값.
5. `failedAtLeast: 3`은 lastPlayed.failStreak 2에서 미노출, 3에서 노출. **다른 에피소드를 클리어하면 컨텍스트가 리셋**된다(스키마 축소 정합).
6. **[겜-2]** 허브 퇴장→재입장은 hubVisitId 불변 → once 추가 노출 0. finishEpisode·논리 날짜 경계에서만 리셋.
7. 온보딩(첫 3방문)은 방문당 2개, 이후 1개 가드.
8. **[엔-2]** `once:false && bondReward>0` 엔트리는 **parse 단계에서 거부**된다. 엔진도 `!once` 가산을 무시한다(이중 방어 각각 검증).
9. bondSystem: threshold 초과 시 정확한 레벨업 diff(2단계 점프 포함) / 중복 해금 없음 / 미지 companionId는 0 시작.
10. **[겜-1]** finishEpisode 첫 클리어 시 동반 동료 +1, 재클리어 시 미가산. retryGoalId는 1회성 +2.
11. 중도 이탈(finishEpisode 미호출)은 failStreak 불변.
12. 묵상: 같은 논리 날짜 2회 완료 무시 / 시계 역행 시 totalCount 불감소 / 7일 미접속 복귀 시 어떤 상태도 악화되지 않음(벌칙 부재 회귀).
13. **[엔-low]** 02:59 완료→03:01 새 초대. **00:30 완료는 전날 논리 날짜로 기록**(UTC 버그 가드).
14. **[신-4]** firewood 증감이 unlockedAbilities·미니게임 관련 상태에 어떤 영향도 없음(무효과 회귀).
15. **[엔-1]** 키 `donghaeng-save-v1`에 버전 필드 없는 v0 데이터가 있는 상태에서 신 스토어 부팅 → migrate 발동, `completed/companions/gentleMode` 보존 + hub 필드 기본값.
16. 토큰 대비 계산: ⑦-A 표의 전 페어 + **인접쌍 목록(채움↔트랙 포함)**이 기준치 이상 — 미달 인접쌍은 '구조 보완' 플래그 선언 + 대체 페어(경계 마커 2행) 전부 충족 시에만 통과, 플래그 없는 미달은 실패(순수 계산 함수 — 토큰 변경 시 자동 회귀).
17. **[엔-v3] 저장 왕복**: 허브 상태(bonds·seenDialogues·gifts·firewood·visitConsumed 등) 기록 → persist 직렬화 → 새 스토어 rehydrate → **영속 11필드 전부 보존** + 휘발 필드(recentIdle·borrowedAbility 등)는 초기값으로 복원.
18. **[엔-v3] partialize 정합**: partialize 반환 키 집합 = 기존 3필드 ∪ `PERSISTED_HUB_KEYS` — 누락·과잉 모두 실패(화이트리스트 단일 진실 강제).
19. **[겜-v3]** 안드레 "한 사람 더": 대여 슬롯은 판 단위 휘발, 미보유 능력 대여 불가, `selectAbilityActive`가 대여분을 보유와 동일 반환.

### I 통합 (RTL)
20. Reward → 쉼터 들르기 → 점 표시 → 대화 종료 → 점 소멸 + bonds 반영.
21. 선물: grantGift → 시트 표시 → 반응 라인 → givenGifts 기록·인벤 차감.
22. 레벨업 → UnlockToast 1회 + `selectAbilityActive` true. **SacredScene 트리거 충족 시 토스트 미발생**(③-F UI 격리).
23. **[겜-4]** failStreak 3 → 실패 화면 한 줄 렌더 + 맵 동료 얼굴 아이콘 렌더(`selectHintCompanion`).
24. **[UX-3]** 접근성 트리: CompanionSpot aria-label에 "새 대화 있음" 포함 / BondBadge progressbar 값 + **가시 수치 텍스트가 aria-valuenow와 일치** / UnlockToast aria-live 존재.
25. 대사 로그: 지나간 라인 스크롤백 가능, 300ms 내 연속 탭은 1회로 처리.
26. 미니게임 화면 마운트 중에는 UnlockToast가 렌더되지 않고 종료 후 표시된다.

### P 실브라우저 (Playwright) — v0.1의 20·21 이관
- P24. `prefers-reduced-motion` 에뮬레이션에서 말풍선·모닥불·묵상·토스트 애니메이션 전부 비활성(사용처 목록 순회).
- P25. 인터랙티브 요소 히트박스 실측 ≥44×44px (getBoundingClientRect — 실레이아웃).
- P26. 폰트 스케일 1.4x에서 44px 타깃·오버플로 없음.
- P27. 묵상 도입 연출 중 1탭 → 즉시 구절 표시.
- **P28. [UX-v3]** 유대 게이지: 채움 선단 경계 마커 요소가 실렌더되고(0%·100% 경계 포함), 수치 병기 텍스트가 표시되며, 마커 픽셀 대비가 채움·트랙 양방향 ≥3:1.

### L 정적/CI (build-content.mjs)
- L1 금칙어: 대화·묵상·ink 소스에서 forbidden-terms 검출 시 빌드 실패.
- L2 인용문: verseText ↔ verses.source.json diff 불일치 시 실패(공통-4).
- L3 **[비-1·겜-v3 재정의]** 유대 산수: 동료별 **전용 공급원**(once 대화 + 동반 클리어 + 전용 재도전 목표 + `exclusiveTo === companionId`인 선물) 합계 ≥ 24×1.3. **`exclusiveTo`가 없는 공유 선물이 동료별 합계에 산입되면 린트 자체가 실패**(이중 계산 재발 차단). favoredGifts의 각 항목이 `exclusiveTo === companionId`인 실존 선물인지 교차 검증. 미달 동료는 빌드 실패.
- L4 knot: JSON inkKnot ↔ hub.ink 실제 knot 대조, 미승인 knot(비네트·SacredScene 포함)가 컴파일 산출물에 존재하면 실패(엔-4).
- L5 firewood/hearthStage를 `systems/`·미니게임 코드가 import하면 실패(T8).
- L6 approvedHash 불일치 → status 자동 강등 + 프로덕션 빌드 실패(공통-3).
- L7 읽히지 않는 flag(어느 대사 조건·콜백에도 안 쓰이는 givenGifts/retryGoal) 경고(공통-5).
- **L8 [신-v3] 예수님 화자 격리**: hub.ink 전 knot 스캔 — 예수님 화자 태그(`# speaker: jesus` / 화자 변수)가 SacredScene `inkKnot` 화이트리스트 밖(DialogueEntry·Vignette·잡담 knot 전부)에서 검출되면 **빌드 실패**. T1이 비네트 경로에서도 코드 강제된다.
- **L9 [비-v3] 로스터 능력 보장**: v1 유대 로스터(6인) 각각에 `type:'ability'` BondUnlock ≥1이 없으면 **빌드 실패** — "관계=능력" 약속이 콘텐츠 추가·삭제로 조용히 깨지는 회귀 차단.

### 플레이테스트 (비-2·겜-low 반영)
- **표본**: MVP 8~10명 — **비기독교인·무종교 게이머 50% 이상(최소 4인)**, 비게이머 포함, 가능 시 아동 1~2인 보호자 동반.
- **MVP 단계 = 정성 관찰 프로토콜**(n이 작아 정량 임계는 노이즈): 발화 녹취 코딩("동료가 내가 한 일을 알고 있었다" 자발 언급 여부), **행동 지표 주 기준**(세션 중 자발적 허브 재방문 횟수, 묵상 자발 탭 여부 D1/D2, 재도전 자발 시도 횟수), 무설명 첫 탭 성공률, **동료별 게이지 육성 분포**(특정 동료 게이지 방치율 — 능력 매력도 검증, 비-v3 후속 관찰).
- **정량 임계는 v1 베타(n≥30)로 이월**: 재방문 의향 ≥4.0/5 · **재미·추천 의향·수집 욕구 문항 추가(공통-5)** · 설교감 응답 0 · 묵상 스킵자의 불이익 체감 0 · 평균 구절 체류 시간(관찰 지표 — KPI 아님).
- 세션: 허브 1방문 3분 내 자연 종료(억지로 붙잡지 않음).

---

## ⑩ 신학 체크포인트

**상설 감수 게이트(공통-3)**: 감수 주체 = 예장통합 목회자 2인 이상. 절차 = 초안(draft) → 감수 요청(needs-review) → 승인(approved + 본문 해시 기록) / 반려(사유 명기 → 수정 → 재검). 본문 수정 시 해시 불일치로 자동 재감수. **미승인 텍스트는 프로덕션 빌드 자체가 실패**한다(⑨-L4·L6). 감수 범위는 노출되는 전 텍스트 — 잡담·토스트 문구·능력 대사·카드 문구·UI 라벨 포함.

| # | 항목 | 원칙 | 강제 수단 | 상태 |
|---|---|---|---|---|
| T1 | 예수님은 유대·선물·수집 수치의 대상이 아니다 | 개혁주의 은혜론(공로주의 오해 차단) | **Zod refine 3중 차단(③-A·B·E·G) + parse 실패 테스트(⑨-U1) + CI 린트 + 화자 수준 격리(⑨-L8)**. 허브 등장은 SacredScene(수치 전무)으로만 — 유대 게이트 뒤 장면도 SacredScene의 `bondLevel` 트리거로만 표현(③-F: "문은 유대가 열되, 장면은 수치 무관"). 장면 설계안 + 진입 프레이밍 문구 자체를 감수 제출 | 코드 강제 + 감수 필요 |
| T2 | 허브 대사 전량 본문 충실 — 인물 왜곡·이단 어휘 금지. **플랜·목업 예시 대사도 동일한 본문 대조 절차**(v2에서 '파도'→'바람' 교정 완료, 마 14:30). 힌트 대사는 인물 성격·직업 배경에서 자연히 나오는 것만(마태=장부) — 작가 가이드 저작 규칙. 독해 수준(초3·40자) 체크 병행 | 4복음서 본문 충실 | **금칙어 CI(신천지 '비유풀이'·'실상', 하나님의교회 '어머니 하나님', JMS·통일교 특유 어휘 — M0 산출물, 총회 이단사이비대책위 자료 참조)** + 해시 게이트 | 감수 필요 |
| T3 | 묵상 구절: 4정경 복음서만, 문맥 절단 금지(전후 문맥 펼치기 UI로 지원), 개역개정 저작권 | 본문 충실 + 법적 | **대한성서공회 사용 허락 = M1 이전 선행 과제** + 인용문 자동 대조 CI(⑨-L2) | 감수 + 법무 진행 중 |
| T4 | 성찰 프롬프트: 응답 강요·서원 유도 금지 — 열린 질문만, 답변 로컬 비공개. 마음 날씨 아이콘도 동일 원칙(감정 상태 기록이지 신앙 고백 장치가 아님) | 초대 원칙 | notes 비공개·내보내기만 제공(광고·분석 전송 없음) | 감수 필요 |
| T5 | 유대 라벨의 구원 단계 오독 방지 — **'한 식구' → '한길벗' 교체 완료**, 전 단계 여정 언어 통일. UI 서술은 "여정을 함께한 정도"로만 | 구원론 혼동 방지 | 라벨 문자열 감수 목록 포함 | 감수 필요 |
| T6 | 유다: **수치 없는 서사 트랙 확정(③-F)** — bonds·선물·해금 진입 코드 차단, 대사 bondReward 0 강제, ep11 후 퇴장. 빈 자리 연출이 운명론·책임 전가로 읽히지 않게 | 정통 노선 | Zod refine + parse 테스트(⑨-U2) | **감수 필요(고위험)** — 트랙 대사 8개 전량 |
| T7 | 선물 고증: 1세기 갈릴리 서민 생활물 한정(③-E 16종). **두루마리 제외 완료**(시대착오). 참고 문헌 `docs/refs.md` 명시 | 고증=존중 | 목록 고정 + 추가 시 문헌 요구 | 자체 검수 후 감수 |
| T8 | 장작(구 '등불 기름'): 게임플레이 무효과 순수 코스메틱 — '기름' 명칭 제거로 마 25 열 처녀 비유 연상(구원 준비 적립 오독) 차단 | 은혜론·오독 방지 | 정적 검사(⑨-L5) + 무효과 회귀 테스트(⑨-U14) | 명칭·연출 감수 필요 |
| T9 | **(v3 격리 완결)** 예수님 등장 가능 장면은 전량 SacredScene으로만 — '새벽 숯불'(요 21 모티프)은 BondUnlock vignette에서 **제거·SacredScene 이관 완료**(`bondLevel` 트리거). 비네트는 동료 시점 회고만 가능(예수님 화자 부재를 L8이 빌드 수준에서 강제). 진입 문구(동료 화자 프레이밍, 예수님 등장 예고·광고 금지)도 감수 대상 | T1 연동 — "은혜는 포인트의 결과물이 아니다" | **SacredScene 스키마(approved 리터럴) + bondLevel 트리거 일원화 + L8 화자 린트 + U3 수치 무영향 회귀** | 감수 필요 |

---

## ⑪ 리스크와 완화책

| 리스크 | 영향 | 완화책 |
|---|---|---|
| 콘텐츠 고갈 — once 140개도 유한 | 포스트 캠페인 6주 후 재방문 동기 약화 | 소비 상한(방문 토큰) + 게이트 이월 설계(③-D 산수) + 잡담 매트릭스 288 변형 하한 + 주간 회상 순환. **그 이후는 콘텐츠 업데이트 영역임을 정직하게 인정** — "상시 엔진" 주장 폐기(①) |
| 재도전 루프가 미니게임 플랜과 어긋남 | 유대 산수표 붕괴(재도전 8점 증발) | ⑥ 계약(`retryGoalId`)을 미니게임 플랜의 필수 수용 조건으로 명시. M4에서 1건 시범 연결로 조기 검증. 미수용 시 대체 수급(심화 대화 +2개/동료)을 예비 — 대체 시에도 L3 린트가 총량을 재검산 |
| 안드레 '한 사람 더' 대여가 밸런스 파괴(능력 2중첩) | 재도전 난이도 형해화 | 대여는 판당 1개·세션 휘발(③-H), 동일 능력 중복 불가. M4 A/B에서 재도전 목표 클리어율 상한(+15%p) 초과 시 대여 대상 제한 목록 도입 |
| 선물=호감작 그라인드 변질 | 윤리 원칙 훼손 | 획득 1회성 + 잡담 bondReward 0 스키마 강제(엔-2 해소로 구멍 봉쇄) + 전용/공유 이원화로 오배분 자체가 불가능(③-E) |
| 묵상의 형식화 | 신앙 콘텐츠 자기모순 | 보상은 코스메틱 장작뿐 + 1탭 스킵 보장 + 체류는 자발 장치만 + 죄책감 기준 플레이테스트. 강제 체류 없음(관찰 지표만) |
| 세이브 유실 | 신뢰 파괴 | 키 유지 + version 2 migrate(엔-1) + **partialize v2 화이트리스트(엔-v3)** + v0 로드 테스트(⑨-U15) + **저장 왕복 테스트(⑨-U17)** + 로드 실패 시 원본 백업 키 보존 |
| ink 도입 지연 | 일정 | M1~M5 정적 라인, M6 어댑터 교체만(DialogueOverlay는 라인 스트림 인터페이스에만 의존) |
| 감수 병목 | 릴리스 지연 | 해시 게이트로 감수분/대기분 분리, 고위험(T1·T6·T9) 우선 감수, 잡담 템플릿은 템플릿 단위 일괄 감수 |
| 반응형 대사 조합 폭발 | 저작 비용 | 반응 축을 "직전 에피소드 1개 + lastPlayed 실패 힌트"로 한정(③-B 스키마 축소가 이를 구조로 강제) |
| draft 텍스트 유출 | 미감수 문장 배포 | build-content.mjs knot 스트립 + 번들 검사(엔-4 해소) — 비네트·SacredScene knot 포함(L4) |
| 알림 오남용 유혹 | 초대 원칙 훼손 | 이 시스템은 알림을 발송하지 않음. 문구 정책만 상속: 죄책감 어휘 금지 |

---

*이 문서는 GDD §3·§8, ENGAGEMENT 전 장의 하위 상세 설계이며, 충돌 시 신학 가이드라인(GDD §2) > 윤리 원칙(ENGAGEMENT §0) > 본 문서 순으로 우선한다.*
