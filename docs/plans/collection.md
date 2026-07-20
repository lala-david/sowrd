# 수집·동료 시스템 상세 플랜 — *동행 (The Gospel Road)*

> 상위 문서: [`GDD.md`](../GDD.md) · [`ENGAGEMENT.md`](../ENGAGEMENT.md)
> 버전 0.3 (2차 재검증 잔여 지적 전량 반영) · 2026-07-20 · 대상 코드베이스: 수직 슬라이스 v0.1 (`sowrd/src`)

---

## v3 변경 로그 (2차 재검증 잔여 지적 대응표)

| # | 지적 (검증자·등급) | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 신6 | 사후·부재 인물(세례 요한·요셉)의 후반 장 동행·실시간 발동 대사 (목사 FIX+HIGH) | ③-A R6·매트릭스 'R6 동행' 열, ③-D `PresenceSchema`, ③-F `guard:presence`, ⑤ F0, ⑩ C11 | '서사 내 동행 가능 장' 축 신설. 세례 요한 편성 가능 장을 **ep03~06으로 제한**(마 14:1-12 투옥·순교 근거), ep07+ 브리핑 비활성·회상 인용 등장만. 요셉은 전 구간 `voiceFrame:'memory'` — 모든 대사를 회상 인용 프레임으로 강제. Zod refine + CI + 감수 체크포인트(C11) 3중 반영. Lv2 강화도 사후 장(ep10 리듬)에서 생전 장(ep05·06 퍼즐)으로 재배정 |
| 겜6 | ③-A ↔ ③-D 표현력 불일치 — 매트릭스 능력 약 1/3이 스키마로 기술 불가 (게임D FIX+HIGH) | ③-D `AbilityEffectSchema` kind 4종 신설, ③-A R7·매트릭스 '대응 kind' 열, ③-F guard:ability, ⑧ M1 착수 게이트 | `comboShield`(빌립)·`mistakeShield`(니고데모·요한)·`preview`(삭개오)·`reveal`(안드레·막달라) 신설 + `insight`에 scope 추가(세례 요한 사전 공개). 매트릭스 전 행에 대응 kind 명기, 표↔스키마 kind 커버리지 diff를 `guard:ability`에 추가. M1 cards.ts 작성 전 확장 스키마 머지를 착수 게이트로 명시 |
| 엔6 | gentleMode 결합 수식의 방향 오류 — 감소형 파라미터에서 gentle 사용자 회귀 (엔지니어 FIX+HIGH) | ⑥ 결합 수식('관대 방향 기준' 재정의)·매핑 표 '방향' 열, ⑨ T6b, ⑪ | 증가형 = `max(gentle, 1+g)` / 감소형(드레인·쿨다운) = `min(gentle, 1−g)` / 가산형(허용 오답) = `max(gentle 가산, ⌈g×4⌉)`. 매핑 표에 파라미터별 방향 열 추가, T6b에 감소형 케이스(드레인 0.6 vs 0.85 → 0.6 채택) 명시 |
| 접6 | 액티브 발동 피드백이 진동+SFX에만 의존 — iOS+무음+청각장애 조합 공백 (UX FIX) | ⑥ feedbackPolicy 'defer' 정의, ② 시나리오 B, ⑨ T15 | 'defer' = 토스트 금지이지 시각 무피드백이 아님을 정의로 명문화. 발동 시 **액티브 버튼 자체의 차지 카운트 즉시 감소 + 200ms 채움 플래시**(시선 이동 불요)를 계약에 명시 — 버튼 시각 상태만으로 발동 확인 완결. T15에 진동·SFX 부재 환경 검증 케이스 추가 |
| 구6 | 코스메틱이 스크랩북 안에서만 도는 자기완결 루프 (비신자 잔여 소견) | ③-E 코스메틱 적용면 표 | 코스메틱을 스크랩북 밖 3개 상시 접점(여정 맵 완료 마커·RewardScreen 카드 프레임·하단 내비 '기록' 아이콘)에 노출 — 수집 성과가 매 세션 플레이 동선에서 보이게. 구현은 CSS 토큰/클래스 스왑 수준으로 v1 범위 유지 |

---

## v2 변경 로그 (mustFix 대응표)

### 김정훈 목사(신학)

| # | 필수수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 신1 | 감수 대상을 '노출되는 전 텍스트'로 확장 | ⑩ C9, ③ ReviewSchema, ⑧ v1 게이트 | 발동 대사·knot 대사·토스트·패널·초대 문구 전부 `ReviewableText` 스키마로 감싸고, reviewed 해시 게이트를 CI로 강제 |
| 신2 | 개역개정 저작권 절차 M1 전 착수 | ⑧ M1 선행 트랙, ⑪ 리스크 표 | 대한성서공회 확인·승인 절차를 M1 게이트 조건으로 등재, CI 인용문 자동 대조 검증 추가 |
| 신3 | 유다의 세트 충족 멤버 포함 여부 확정 | ⑩ C4(결정), ⑤ F4, ③ sets | **설계 결정: 유다는 '열두 제자' 세트 충족 멤버에서 제외**(카드로는 존재). 12장 이후 문구 마 27:3-5 본문 범위 한정, '애도' 단독 프레임 금지. M4 착수 전 감수 협의로 최종 서명 |
| 신4 | 베드로 영입 시점 본문 정합 | ② 시나리오 A 주석, ③ 매트릭스 | 정식 빌드 = 4장 영입·8장 관계 심화(Bond 대이벤트)로 재규정, 수직 슬라이스 예외 명시 |
| 신5 | 믿음 주제 게임에서 meterGrace 배제 | ⑥ faithThemed 규칙, ③ 스키마 | `faithThemed: true` 게임(ep08, 겟세마네)에는 meterGrace 적용 금지를 abilities 계약+Zod refine+테스트(T6b)로 강제. 힌트·경험담 계열만 허용 |

### 유나(게임 디자인)

| # | 필수수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 겜1 | 능력→에피소드 유용성 매트릭스 + '최소 2개 장 유효' 규칙 | ③-A 매트릭스 | 12장×5동사 전방 유용성 매트릭스 작성. 베드로 효과를 verb 한정에서 전 동사 액티브(재기)로 재배정, 빌립도 재배정. 위반 카드 0 확인 |
| 겜2 | '함께 걷는 이' 선택제 도입, 전체 자동 합산 폐기 | ⑤ F0(신규), ⑥ 계약 | 에피소드 진입 브리핑에서 1~2인 편성. 편성된 동료만 보정·발동 대사·XP 수령 |
| 겜3 | Bond XP 수치 테이블·페이싱 + 허브 없이 커브 닫힘 | ③-B XP 경제 | XP 테이블·산술 증명(허브 0으로도 Lv3 공급량 320 > 요구 160)·페이싱 목표 명시. M3 합격 기준을 '변주 경로 성장'으로 교체, 단순 반복 XP 0 |
| 겜4 | meterGrace 단위 정의 + gentleMode 총 상한 | ⑥ 보정 수식·매핑 표 | '관대 파라미터 비율 승수(0~0.25)'로 정의, 게임별 매핑 표 작성. gentleMode와는 합산 아닌 방향 기준 결합 — 총 관대치가 gentle 기준선을 넘지 않음 (**일괄 `max()` 표기는 v3에서 증가형 max/감소형 min으로 교정 — 엔6**) |
| 겜5 | 카드 없는 에피소드(3·5장) 보상 비트 | ③-C 12/12 리듬 표 | ep03 '광야의 기록', ep05 '무리 속 사람들', ep11 '다락방의 기록' 인카운터 카드 신설 — 전 장 클리어 시 스크랩북에 무언가 남음(12/12) |

### 박도윤(엔지니어링)

| # | 필수수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 엔1 | partialize 갱신 + 라운드트립 테스트 | ③-D store 스케치, ⑨ T8c | partialize에 `encounters/bonds/setsCompleted/hubXp` 추가 명시, 저장→재로드 왕복 테스트 |
| 엔2 | persist version 실코드 기준 정정 | ③-D 마이그레이션 | 현행 version 미지정(=0) 명시, **0→1** 마이그레이션. 스토리지 키 `donghaeng-save-v1`의 'v1'은 persist version과 무관함을 명문화 |
| 엔3 | healed-friend 재분류 규칙 | ③-D 마이그레이션 규칙 3 | migrate에서 kind 조회 후 companions→encounters 재배치, encounter에 bonds 생성 금지. T8d 케이스 |
| 엔4 | AbilityEffect 단위·게임별 매핑·gentleMode 수식 | ⑥ 매핑 표·수식 | 겜4와 동일 해소. WaterWalk는 warnMs/waveDrain 실파라미터 기준 |
| 엔5 | 일일 상한용 persist 상태 | ③-D `hubXp` 슬라이스 상태 | `hubXp: { date: 'YYYY-MM-DD', gained: number }` 단일 카운터. 날짜 경계·시계 조작 케이스 T5에 포함 |

### 이서연(UX·접근성)

| # | 필수수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 접1 | '앰버 40% 톤 다운'(2.52:1) 폐기, 실측치 병기 | ⑦ 대비 실측 표 | 미보유 텍스트 `--muted`(7.5:1)로 교체. 전 텍스트 대비 실측치를 표에 병기, 4.5:1 미달 조합 사용 금지 규칙 |
| 접2 | 집중 미니게임 중 시각 토스트 금지 | ⑥ feedbackPolicy | 동사별 피드백 채널 정책을 계약에 명문화 — 균형/집중·리듬 중 시각 토스트 금지, 진동/SFX + 종료 후 요약으로 이연 |
| 접3 | 시맨틱/스크린리더/포커스 명세 + T13~T15 | ⑦-B 접근성 명세, ⑨ | 타일 button화·accessible name, 시트 포커스 트랩+뒤로가기, aria-valuetext, aria-live 단일 큐. axe·포커스 테스트 신설 |
| 접4 | reduced-motion 대체표 전 연출 확대 | ⑦-C 대체표 | 리워드 스프링·글로우, 제본, layoutId 확대, 플립 각각의 정적 폴백 정의 |
| 접5 | 플레이테스트 연령 코호트·코호트별 기준 | ⑨ 코호트 표 | 8~10세 ≥3, 60대+ ≥3, 비기독교인 ≥50% 명시. P1은 코호트별 각각 충족 |

### 민준(비신자 게이머)

| # | 필수수정 | 해소 위치 | 해소 방식 |
|---|---|---|---|
| 비1 | 세트 보상에 신앙 전제 없는 실체 1차 레이어 | ③-E 세트 보상 3레이어 | 1차 = 전용 일러스트 비네트 + 스크랩북 코스메틱. 묵상문은 뒷면 **선택 열람**으로 강등 + 상시 재열람 |
| 비2 | 능력 체감을 수치로 검증, 2개 동사 실적용 | ⑧ M2, ③-A 액티브 | 동료당 최소 1개 수동 발동 액티브. M2에 균형+물류 2개 동사 실적용, 보유/미보유 A/B 수치 합격선(클리어율 +15%p 또는 시도 −25%) |
| 비3 | 비기독교인 코호트 ≥50% + P6 설교 체감 문항 | ⑨ 코호트 표, P6 | 반영 완료 |
| 비4 | 세트별 완성 시점 페이싱 표 | ③-E 페이싱 표 | 4세트의 완성 예상 장·일차 표. '가족과 선구자'는 조용한 완성(알림 제거)으로 강등, 비선형 세트 2종 신설 |

### 공통 지침(_common.md) 반영 요약

| 공통# | 반영 위치 |
|---|---|
| 1 예수님 데이터 격리(Zod+CI) | ③-F 신학 가드 코드 |
| 2 마 14:31 재설계 | 카드 성구를 14:29 전면으로(⑩ C2), 게임 내 재설계는 미니게임 플랜 소관(교차 참조) |
| 3 감수 상설 게이트(해시) | ③-F ReviewSchema + CI |
| 4 개역개정 저작권 | ⑧ M1 선행 트랙, ⑪ |
| 5 재미의 실체 | ③-A/B/C/E, ⑥ reportMoment |
| 6 접근성 수치 플로어 | ⑦ 전체 |
| 7 테스트 인프라 선행 | ⑧ M0 |
| 8 실코드 정합 | ③-D |
| 9 토큰 통일(hex 금지) | ⑦ — 신규 토큰 `--ink-on-light`, `--parchment-dim` |
| 10 ep12 이원화 | ③-A 매트릭스(12A 수난/12B 부활), ③-E S4 |

---

## ① 목표와 범위

### 목표
- "몬스터가 아니라 **사람**을 모은다"(GDD 기둥 ④)를 실제 시스템으로 구현한다.
- 수집이 **도전의 보상**(에피소드 클리어 = 영입)이 되고, 편성한 동료가 **다음 도전의 실질적·체감 가능한 도움**이 되는 톱니바퀴를 완성한다. 체감은 감상이 아니라 **A/B 수치로 검증**한다(⑧ M2).
- 카드 한 장 한 장이 성경 본문으로 돌아가는 문이 되게 하되, **신앙 전제 없이도 순수 게임 보상으로 성립**하게 한다(일러스트·비네트·코스메틱 1차 레이어).

### 범위 (In)
1. **인물 카드 2종**: 동료(Companion, 영입·성장형) / 인카운터(Encounter, 만남 기록형 — 코스메틱 재화 겸)
2. **'함께 걷는 이' 편성**(1~2인 선택제)과 5동사 미니게임 보정(단위 정의된 효과 모델 + 액티브 스킬)
3. **성장·해금**: 동행 레벨(Bond) 0~3, 수치화된 XP 경제, 레벨업 시 능력 강화·새 대사·카드 아트 레이어 해금
4. **세트 완성 보상**: 3레이어 보상(일러스트 비네트 → 코스메틱 → 선택 열람 묵상), 페이싱 표 기반 배치
5. **카드 상세 화면**: 성구 출처, 한 줄 이야기, 능력, 해금 대사 기록 — 접근성 1급 명세 포함
6. **스크랩북 UX**: 기존 `CollectionScreen` 확장(탭·세트·상세 시트·코스메틱)

### 비범위 (Out — 별도 플랜)
- 허브(쉼터) 대화 연출·ink 스크립트 본문 → 관계/내러티브 플랜. 본 플랜은 호출 계약만 정의. **단, 성장 커브는 허브 없이 닫히도록 설계했다(③-B) — 허브 XP는 v1.1 가산 요소이지 의존성이 아니다.**
- 미니게임 내부 룰 → 미니게임 플랜. 본 플랜은 보정 매핑 표(⑥)와 `reportMoment` 계약만 정의.
- 카드 일러스트 제작 파이프라인 → 아트 플랜(톤 orb·레이어 슬롯·세트 비네트 1장 규격만 예약. **배경·비네트 에셋은 세로(portrait) 규격**).
- 편성 3인 이상·시너지 조합 시스템 → v1 이후 백로그(명시적 비범위 — 박도윤 지적의 범위 폭주 방지).
- 공유(스크랩북 내보내기) → v1 이후.

### 윤리 가드레일 (불변)
- 확률형 뽑기·중복 카드·등급 도박성 연출 없음. 모든 카드는 결정론적으로 플레이로만 획득.
- 미획득 카드는 **초대 문구**로 표시. ※ 현행 v0.1 `CollectionScreen`은 이름 슬롯에 '???'를 렌더하므로 이것은 '유지'가 아니라 **M1 수정 작업 항목**이다(⑧ M1) — 이름 자리는 실루엣+무기명으로 교체.
- 성장에 소멸 타이머·미접속 페널티 없음. 동행 레벨은 내려가지 않는다.
- **예수님은 수집·성장·편성·선물 대상이 될 수 없다** — 문서 선언이 아니라 Zod refine + CI 하드 에러로 기계 차단(③-F).

---

## ② 플레이어 경험 시나리오

> **본문 정합 주석(신4):** 정식 빌드에서 베드로 영입은 **4장**(마 4:18-20, GDD §5 표와 일치)이고, 8장은 이미 동행 중인 베드로와의 **관계 심화(Bond 대이벤트, XP 대량 획득 + 전용 비네트)**다. 아래 시나리오 A는 **8장만 존재하는 수직 슬라이스의 한시적 예외**이며, 4장 구현 시점에 A는 4장으로 이관된다. RewardScreen은 M1부터 '신규 영입'과 '기보유 → 관계 심화' 두 분기를 갖는다(엔지니어링 low 반영).

**시나리오 A — 첫 영입 (D0, 아하 모먼트)** *(수직 슬라이스 한정)*
1. 8장 클리어 → RewardScreen에서 베드로 카드가 떠오른다(스프링, 앰버 글로우 — reduced-motion 시 페이드 대체).
2. "베드로, 함께 걷다" + 능력 소개("먼저 뛰어드는 용기: 실패 순간 한 번 버틴다") + **마태복음 14:29** 성구("오라 하시니 … 물 위로 걸어서") — 책망 구절(14:31)을 축하 화면에 걸지 않는다(신학 medium 반영, 정조 일치 원칙은 ⑩ C2).
3. "사람들 보기" 탭 → 스크랩북에 첫 카드 실체화. 미보유 칸은 실루엣 + "4장에서 만납니다"(`firstMetEpisodeId` 파생, 유나 low 반영).

**시나리오 B — 편성이 실제로 돕는다 (D1~7)**
1. 4장(물류) 진입 전 **편성 브리핑 시트**: "함께 걷는 이"를 1~2인 선택(기본 추천 자동 표시). 마태를 선택하면 "장부 감각: 계산 힌트 2회" 배지.
2. 미니게임 중 플레이어가 **직접 힌트 버튼을 탭**(액티브 발동) → 마태 초상 + 대사 한 줄. **균형/집중·리듬 게임에서는 시각 토스트 금지** — 발동 확인은 **힌트 버튼 자체의 차지 카운트 감소(2→1) + 200ms 채움 플래시**(+지원 기기 진동·SFX)로, 대사는 종료 요약("마태의 장부 감각이 2번 도왔습니다")으로 이연(접2·접6).
3. 클리어 → **편성된 동료만** XP 획득 → RewardScreen 통합 요약 패널에 XP·발동 내역 표시.

**시나리오 C — 성장과 드립피드 (D8~30)**
1. 베드로 Lv2 도달 → 새 대사 묶음 + 능력 강화("경험담: 파도 패턴 1회 예고 — 힌트 계열") 해금.
2. 재방문은 단순 반복이 아니다: **통찰 목표·변주 룰('거친 물결')** 달성만 XP를 주고, 동일 조건 재클리어 XP는 0(③-B).
3. 카드 상세에서 해금 대사 기록 재열람.

**시나리오 D — 세트 완성 (세트별 페이싱 표 기준 D7~D21+)**
1. '길 위의 기록' 세트 마지막 칸(바디매오 — ep06 **재방문 통찰 조건**, 능동 수집)이 채워지는 순간, 세트 페이지 "제본" 연출.
2. 보상 1차: **전용 일러스트 비네트**(양피지 펼침 1장 + 3~5컷 스토리) + **스크랩북 코스메틱**(표지 장식). 연출과 다음 화면 사이 **0.8초 무음 정적**. 묵상문은 비네트 뒷면 **'묵상 보기' 선택 버튼**으로만 열람, 스크랩북에서 상시 재열람 가능(비1 + 신학 low 반영).
3. '가족과 선구자'처럼 선형 진행만으로 자동 충족되는 세트는 **알림 없이 조용히 완성**되고 연출만 남긴다 — nearComplete 알림은 능동 수집 세트에만(유나 medium).

---

## ③ 데이터 모델 (TypeScript 스케치)

### ③-A 능력 설계와 전방 유용성 매트릭스 (겜1·비2)

**설계 규칙(카드 데이터 합격 조건, CI 검사):**
- R1. 동료 능력은 **영입 장 이후 최소 2개 장에서 유효**해야 한다. 위반 시 verb/효과 재배정.
- R2. 동료당 최소 1개는 **플레이어가 수동 발동하는 액티브**(체감 보장).
- R3. `faithThemed` 게임(ep08 물 위, ep11 겟세마네)에는 meterGrace(판정 관대) 적용 금지 — 힌트·경험담·재기 계열만(신5).
- R4. ep12는 **12A 수난**(동행 편성·보정 자체를 적용하지 않는 절제 구간)과 **12B 부활**(퍼즐·추리 비트, 보정 적용)로 이원화(공통 #10).
- R5. 최종장(12장) 영입 카드는 R1 예외를 허용하되, **에필로그(13장 훅)·재방문 통찰 모드에서 유효**해야 한다(예외 사유를 데이터에 명기).
- R6. **서사 시점 정합(신설 — 신6):** 동료 카드마다 `presence`(동행 가능 장 범위 · voiceFrame · 근거 본문)를 데이터로 명시한다. **(a)** 본문상 투옥·순교로 부재가 확정되는 장에는 편성 자체가 불가 — 세례 요한은 마 14:1-12 근거로 **ep03~06 한정**, ep07 이후 브리핑에서 비활성 표시되고 실시간 발동 대사를 말할 수 없다(회상 인용 콘텐츠로만 등장). **(b)** 공생애 시점 생존이 본문상 확인되지 않는 인물(요셉)은 전 구간 `voiceFrame: 'memory'` — 모든 발동·해금 대사를 **회상 인용 프레임**("요셉이 가르쳐 주었다: 『…』")으로 강제하고 실시간 1인칭 현재형 대사를 금지한다. UI는 memory 카드에 '기억으로 함께' 배지 + 초상 세피아 톤을 적용한다. `guard:presence` CI(③-F) + 감수 체크포인트 ⑩ C11 대상.
- R7. **kind 커버리지(신설 — 겜6):** 아래 매트릭스 '대응 kind' 열의 모든 값은 ③-D `AbilityEffectSchema`의 kind로 존재해야 한다. `guard:ability`가 표(데이터화된 매트릭스)↔스키마 kind 목록을 diff — 스키마가 표를 담지 못하면 CI 실패. **M1 착수 게이트(⑧)**.

**동사 지도(실코드 `episodes.ts` 기준):** 추리 ep01·03·09·11 / 리듬 ep02·10 / 물류 ep04·07 / 퍼즐 ep05·06 / 균형 ep08·12A / 퍼즐·추리 ep12B

| 카드 | 영입 장 | 효과(기본 → Lv2 강화) | 대응 kind (R7) | 유형 | 유효 미래 장 | 수 | R1 | R6 동행 |
|---|---|---|---|---|---|---|---|---|
| 마리아 | ep01 | 마음에 새김: 추리 힌트 1회 → 2회 | `hint` | 액티브 | ep03·09·11·12B | 4 | ✓ | live 전장 (요 19:25 십자가까지 본문상 동행) |
| 요셉 | ep01 | **목수의 가르침(개명):** 퍼즐 meterGrace 0.10 → 0.15 | `meterGrace` | 패시브 | ep05·06·12B | 3 | ✓ | **memory 전장** — 전 대사 회상 인용 프레임(R6b, 서사 명분: 마리아가 전하는 가르침) |
| 세례 요한 | ep02 | 길을 예비하라: 다음 장 통찰 목표 사전 공개(전 동사) → **퍼즐 grace 0.10 추가(재배정: 구 '리듬 grace'는 사후 장 ep10 대상이라 R6 위반)** | `insight(scope:'next')` + `meterGrace`(Lv2) | 패시브 | **ep03~06** | 4 | ✓ | **live ep03~06 한정**(마 14:1-12 투옥·순교) — ep07+ 편성 불가, 회상 인용으로만 등장 |
| 베드로 | ep04 | **먼저 뛰어드는 용기: 실패 순간 그 자리에서 1회 재개(전 동사 액티브, 재배정됨)** → 경험담: 균형 게임 위험 1회 예고(힌트 계열, R3 준수) | `secondWind` → `hint`(Lv2) | 액티브 | ep05~12B 전장 | 8 | ✓ | live 전장 |
| 안드레 | ep04 | 데려오는 사람: 물류 편성 힌트 1회 + 재방문 시 인카운터 위치 표시 → 표시 범위 확대 | `hint` + `reveal(encounterLocation)` | 액티브+패시브 | ep07 + 재방문 전장 | 2+ | ✓ | live 전장 |
| 마태 | ep04 | 장부 감각: '경제' 태그 게임(물류·달란트 비네트) 계산 힌트 2회 → +grace 0.10 | `hint` → `meterGrace`(Lv2) | 액티브 | ep05(달란트)·07 | 2 | ✓ | live 전장 |
| 요한 | ep04* | 성찰의 기록: 추리 통찰 목표 노출 + 클리어 후 로어 비네트 → 오답 1회 보호 | `insight` + `narrative` → `mistakeShield`(Lv2) | 패시브 | ep09·11·12B | 3 | ✓ | live 전장 |
| 빌립 | ep07 | **침착한 계산(재배정됨): 리듬 콤보 보호 1회 + 퍼즐 힌트 1회** → 각 +1회 | `comboShield` + `hint` | 실드(자동)+액티브 | ep10·12B | 2 | ✓ | live 전장 |
| 삭개오 | ep09 | 높은 곳의 시야: 리듬/퍼즐 다음 패턴 미리보기 1회 → 2회 | `preview` | 액티브 | ep10·12B | 2 | ✓ | live 전장 |
| 니고데모 | ep10 | 함정 질문 간파: 추리 오답 1회 보호 → 2회 | `mistakeShield` | 패시브(자동) | ep11·12B | 2 | ✓ | live 전장 |
| 막달라 마리아 | ep12 | 새벽의 눈: 재방문·에필로그에서 전 동사 통찰 목표 하이라이트 | `reveal(insightGoal, scope:'revisit')` | 패시브 | 13장 훅·재방문 전장 | R5 예외 | ✓(예외) | live 전장 |
| 나은 친구(인카운터) | ep06 | 성장·보정 없음. narrative 태그 + 세트 멤버 + 코스메틱 재화 | `narrative` | — | — | — | 대상 아님 | live |

\* 요한의 영입 장을 ep11 → **ep04로 이동**(GDD §5 "베드로·안드레·마태·요한 등"과 일치, R1 충족 목적). `episodes.ts` 데이터 수정이 M1 작업에 포함된다. ep11은 '다락방의 기록' 인카운터 + 열두 제자 세트 판정 장으로 재편(③-C).

**R7 검증 노트(겜6 해소 확인):** 매트릭스에 등장하는 kind 전량 = `meterGrace / hint / secondWind / comboShield / mistakeShield / preview / reveal / insight / narrative` — 9종 모두 ③-D 스키마에 존재한다. 구 스키마(5종)로 기술 불가였던 4개 능력(빌립 콤보 보호, 니고데모·요한 오답 보호, 안드레 위치 표시, 삭개오 미리보기)이 전부 커버되어 `guard:ability` CI와 M1 cards.ts 작성이 매트릭스 전 행에서 성립한다.

- 기존 `skill` 문자열("전면 '일단 행동' 미니게임 보정" 등)은 deprecated — `cards.ts`에서 구조화된 `baseEffects`로 이관하고 re-export 층에서 라벨 문자열로 재생성.
- 인카운터 카드의 게임적 존재 이유(민준 medium): **누적 코스메틱 해금** — 인카운터 3장 = 책갈피, 6장 = 표지 문양, 9장 = 타일 프레임. 치장 보상이므로 '전투력 없음' 가드레일과 충돌하지 않는다.

### ③-B Bond XP 경제 (겜3)

**요구 XP(누적):**

| 레벨 | 누적 XP | 해금 |
|---|---|---|
| Lv0 | 0 (영입 직후) | 기본 효과 |
| Lv1 | 30 | 대사 묶음 1 + 아트 레이어(표정) |
| Lv2 | 80 | 능력 강화 + 대사 묶음 2 |
| Lv3 | 160 | 최종 대사 + 카드 완성 장식 (상한 — 무한 성장 없음) |

**공급원(편성된 동료에게만, 에피소드당 각 1회):**

| 공급원 | XP | 조건·소진 정책 |
|---|---|---|
| 에피소드 첫 클리어 | 25 | 편성 시. once |
| 통찰 목표 달성 | 15 | 장당 1회. once |
| 변주 재클리어('거친 물결' 등 변형 룰) | 10 | 장당 최대 3회. **동일 조건 단순 반복은 0 XP** |
| 세트 비네트 열람 | 10 | 관련 멤버. once |
| 허브 대화 | 5 (일일 상한 10) | **v1.1 가산 요소 — 커브 산정에서 제외** |
| 8장 Bond 대이벤트(베드로) | 30 | 정식 빌드 전용. once |

**커브 폐쇄 증명(허브 0 기준):** 베드로(ep04 영입) 잔여 8개 장 × (첫 클리어 25 + 통찰 15) = **320 XP 공급 > Lv3 요구 160**. 편성 2슬롯이므로 두 동료를 병행 육성해도 각각 커브가 닫힌다. 최속(몰빵) 경로: 첫 클리어만으로 160/25 = 6.4장 → **ep10 전후 Lv3**. 페이싱 목표: **주력 동료 Lv2 = 6~8장 시점, Lv3 = 엔딩 전후(재방문 통찰 포함)**.

**편성 제한 카드의 커브 폐쇄(신6 연동):** 세례 요한(R6로 동행 가능 장 ep03~06, 4개 장) 공급 = 4 × (25+15) = **160 = Lv3 요구 160 정확 충족** + 변주 재클리어(장당 최대 30, 4개 장 = 120) + 세트 비네트 10 = 여유 +130. **R6 편성 제한으로 동행 가능 장이 4개 미만이 되는 설계는 금지**(커브 폐쇄 하한 — `guard:ability`가 카드별 `공급 XP ≥ 160`을 검사).

**M3 합격 기준 교체(구: "8장 반복으로 Lv1→2"):** "통찰 목표·변주 클리어 경로로 베드로 Lv1→Lv2 도달 가능 + 동일 조건 반복 클리어 XP가 0임을 테스트로 확인"(⑨ T18).

### ③-C 12/12 스크랩북 리듬 보장 (겜5)

'클리어하면 반드시 스크랩북에 무언가 남는다'를 전 장에 보장한다.

| 장 | 남는 것 | 종류 |
|---|---|---|
| ep01 | 마리아·요셉 | 동료 |
| ep02 | 세례 요한 (동행 가능 ep03~06 — R6, ep07+는 회상 인용 등장) (+'가족과 선구자' 조용한 완성) | 동료·세트 |
| **ep03** | **'광야의 기록'(신설)** — 세 유혹의 기록 카드 | 인카운터 |
| ep04 | 베드로·안드레·마태·요한 | 동료 |
| **ep05** | **'무리 속 사람들'(신설)** — 팔복을 들은 얼굴들 | 인카운터 |
| ep06 | 나은 친구 (+재방문 통찰 시 '바디매오'(신설)) | 인카운터 |
| ep07 | 빌립 | 동료 |
| ep08 | 베드로 Bond 대이벤트(+30 XP, 전용 비네트) | 성장 |
| ep09 | 삭개오 | 동료 |
| ep10 | 니고데모 | 동료 |
| **ep11** | **'다락방의 기록'(신설)** + '열두 제자' 세트 판정 | 인카운터·세트 |
| ep12 | 막달라 마리아 + '백부장'(신설, 12A 목격 비트) | 동료·인카운터 |

### ③-D 스키마·상태·마이그레이션 (엔1~5)

```ts
// ---- src/content/schema.ts 확장 ----

export const CardKindSchema = z.enum(['companion', 'encounter'])

/** 감수 대상 텍스트 래퍼 — 노출되는 '모든' 문구에 적용 (신1, 공통 #3) */
export const ReviewableTextSchema = z.object({
  text: z.string(),
  review: z.object({
    status: z.enum(['draft', 'approved']),
    /** 승인 시점의 sha256(text). CI가 재계산해 불일치면 draft로 강등 */
    hash: z.string().optional(),
    /** 통합측 목회자 2인 이상 서명 (공통 #3) */
    by: z.array(z.string()),
  }),
})

/** R6 서사 시점 정합 — 사후·부재 인물의 동행/발화 제약 (신6) */
export const PresenceSchema = z.object({
  voiceFrame: z.enum(['live', 'memory']),          // memory = 전 대사 회상 인용 프레임 강제
  activeEpisodes: z.array(z.string()).nonempty(),  // '함께 걷는 이' 편성 가능 장 (세례 요한: ep03~06)
  scriptureBasis: z.string(),                      // 제약 근거 본문 (예: '마 14:1-12')
})

/** 미니게임 보정 효과 — 단위: 해당 게임 '관대 파라미터'에 대한 비율 승수.
 *  kind 9종 — ③-A 매트릭스 '대응 kind' 열과 1:1 커버리지(R7, guard:ability가 diff 검사) */
export const AbilityEffectSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('meterGrace'), verb: VerbSchema,
    ratio: z.number().min(0).max(0.25) }),            // 패시브. faithThemed 게임 적용 금지(R3)
  z.object({ kind: z.literal('hint'), verb: VerbSchema.or(z.literal('전체')),
    charges: z.number().int().positive(),
    activation: z.literal('manual') }),               // 액티브 — 플레이어가 탭
  z.object({ kind: z.literal('secondWind'),
    charges: z.number().int().positive(),
    activation: z.literal('manual') }),               // 실패 순간 1회 재개 (베드로)
  z.object({ kind: z.literal('comboShield'), verb: VerbSchema,
    charges: z.number().int().positive(),
    activation: z.literal('auto') }),                 // 콤보 끊김 1회 자동 방어 (빌립) — 신설(겜6)
  z.object({ kind: z.literal('mistakeShield'), verb: VerbSchema,
    charges: z.number().int().positive(),
    activation: z.literal('auto') }),                 // 오답·실수 1회 무효 (니고데모, 요한 Lv2) — 신설(겜6)
  z.object({ kind: z.literal('preview'), verb: VerbSchema,
    charges: z.number().int().positive(),
    activation: z.literal('manual') }),               // 다음 패턴 미리보기 (삭개오) — 신설(겜6)
  z.object({ kind: z.literal('reveal'),
    target: z.enum(['encounterLocation', 'insightGoal']),
    scope: z.enum(['current', 'revisit']) }),         // 위치·목표 표시 (안드레, 막달라 마리아) — 신설(겜6)
  z.object({ kind: z.literal('insight'), verb: VerbSchema.or(z.literal('전체')),
    scope: z.enum(['current', 'next']).default('current') }), // 'next' = 다음 장 사전 공개 (세례 요한)
  z.object({ kind: z.literal('narrative'), tag: z.string() }),
])

export const BondTierSchema = z.object({
  level: z.number().int().min(1).max(3),
  xpRequired: z.number().int().positive(),
  effects: z.array(AbilityEffectSchema),
  dialogueKnot: z.string().optional(),
  artLayer: z.string().optional(),
})

/** 공통 카드 베이스 — CompanionSchema 상속 대신 신규 정의 (skill 강제 문제 해소) */
export const CardBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  tone: z.enum(['lamp', 'blue', 'rose', 'green']),
  verseRef: z.string(),                    // 콘텐츠 필수 (빌드 시 검증)
  story: ReviewableTextSchema,             // 기존 desc 통합·개명
  firstMetEpisodeId: z.string(),           // 초대 문구·맵 포커스의 단일 출처
  setId: z.string().optional(),
})
export const CompanionCardSchema = CardBaseSchema.extend({
  kind: z.literal('companion'),
  presence: PresenceSchema,                      // R6 — 서사 시점 동행 가능성 (신6)
  baseEffects: z.array(AbilityEffectSchema).min(1),
  bondTiers: z.array(BondTierSchema),
  bondDialogue: z.array(ReviewableTextSchema),   // 발동 대사·토스트 문구 전부 감수 래퍼
})
export const EncounterCardSchema = CardBaseSchema.extend({
  kind: z.literal('encounter'),
  effects: z.array(AbilityEffectSchema).max(1),  // narrative만 허용 (refine에서 강제)
})
export const CardSchema = z.discriminatedUnion('kind', [CompanionCardSchema, EncounterCardSchema])

export const CardSetSchema = z.object({
  id: z.string(),
  title: z.string(),
  memberIds: z.array(z.string()),
  /** 자동 충족 세트는 조용한 완성 (알림 없음) */
  silentComplete: z.boolean().default(false),
  reward: z.object({
    vignetteArt: z.string(),               // 1차: 전용 일러스트 비네트 id (필수)
    cosmetic: z.string(),                  // 1차: 표지 장식/책갈피/프레임 id (필수)
    meditation: z.object({                 // 2차: 선택 열람
      verseRef: z.string(),
      text: ReviewableTextSchema,
    }),
  }),
})
```

> **정합 명확화(엔지니어링 medium):** "모든 신규 필드 optional/default"라는 구 문장은 폐기한다. **콘텐츠 스키마는 필수(빌드 시 Zod 검증으로 강제), 세이브 상태만 migrate에서 default 부여** — 두 층위를 혼동하지 않는다. 따라서 M1 일정에는 '12장 카드 텍스트 작성 + 감수 왕복' 기간이 명시적으로 포함된다(⑧).

```ts
// ---- src/state/store.ts 확장 ----

interface BondState { level: 0 | 1 | 2 | 3; xp: number; seenKnots: string[] }

interface CollectionSlice {
  companions: string[]
  encounters: string[]
  bonds: Record<string, BondState>          // companion만. encounter에 bonds 금지
  setsCompleted: string[]
  party: string[]                           // '함께 걷는 이' 편성 (0~2인)
  hubXp: { date: string; gained: number }   // 일일 상한 카운터 (YYYY-MM-DD) — v1.1
  // actions
  setParty: (ids: string[]) => void         // 최대 2, companion만 + presence.activeEpisodes 검사(R6 가드)
  recruit: (id: string) => void
  recordEncounter: (id: string) => void
  gainBondXp: (id: string, xp: number, source: XpSource) => void
  claimSet: (setId: string) => void
}
```

**persist 마이그레이션 스펙(실코드 기준 — 엔2):**
1. 현행 `store.ts`의 persist는 `version` 미지정 = **0**이다. 본 확장에서 `version: 1`을 명시하고 `migrate(persisted, version)`의 `version === 0` 분기에서 처리한다. **스토리지 키 `donghaeng-save-v1`의 'v1'은 persist version과 무관한 이름이며 변경하지 않는다.**
2. **partialize 갱신(엔1):** `{ completed, companions, gentleMode }` → `{ completed, companions, encounters, bonds, setsCompleted, party, hubXp, gentleMode }`. 누락 시 신규 상태가 새로고침에 전부 증발하므로 저장→재로드 라운드트립 테스트(T8c)를 M1 합격 조건으로 한다.
3. **healed-friend 재분류(엔3):** migrate에서 `cards.ts`의 `kind`를 조회해 기존 `companions[]` 항목을 kind별로 `companions`/`encounters`에 재배치한다. `bonds`는 **companion에만** 생성한다(encounter에 bonds가 생기는 모순 차단, T8d).
4. **백업 래퍼(엔지니어링 medium):** migrate 진입 전 원본을 `donghaeng-save-v1.bak`으로 복사하는 커스텀 storage 래퍼를 M1 작업 항목으로 명시한다. migrate throw 시 .bak 보존 + 안전 기본값 로드.

### ③-E 세트 정의와 페이싱 표 (비4·유나 medium)

| 세트 | 멤버 | 완성 예상 | 알림 | 능동 수집 요소 |
|---|---|---|---|---|
| S1 가족과 선구자 | 마리아·요셉·세례 요한 | ep02 (D0~1) | **없음(조용한 완성)** | 없음 — 선형 부산물임을 인정하고 연출만 |
| S2 길 위의 기록 | 광야의 기록·무리 속 사람들·나은 친구·**바디매오(ep06 재방문 통찰 조건)** | ep09± (D7+) | nearComplete | 재방문 통찰 1건 |
| S3 열두 제자 (v1 부분) | 베드로·안드레·마태·요한·빌립 **+ ep11 클리어** | ep11 (D14+) | nearComplete | ep11 판정 장. **유다는 충족 멤버가 아님**(⑩ C4) — 세트 페이지에 유다의 자리는 '기록'으로 표시(카드 보유와 무관) |
| S4 어둠 속의 증인 | 니고데모·**백부장(12A 목격 비트)**·막달라 마리아 | ep12 (D21+) | nearComplete | 12A 목격 조건 |

- 적대자 카드(가야바·빌라도 등, v1 이후): **세트 미포함·기록 전용** 원칙을 `sets.ts` 주석이 아니라 **Zod refine으로 강제**(③-F), 스크랩북 탭에서도 '길 위의 기록'과 구분된 시각 그룹으로 표시(신학 low).
- 세트 보상 3레이어: ① 전용 일러스트 비네트(3~5컷) ② 스크랩북 코스메틱(표지 장식·책갈피·타일 프레임) ③ 묵상문(**선택 열람**, 상시 재열람, 열람 전 0.8초 무음 정적).

**코스메틱 적용면(구6 — 스크랩북 자기완결 루프 해소):** 코스메틱은 스크랩북 내부에 갇히지 않고, 매 세션 지나는 플레이 동선 3곳에 상시 노출된다.

| 코스메틱 | 획득 조건 | 스크랩북 내 | 스크랩북 밖 상시 노출면 |
|---|---|---|---|
| 표지 장식 | 세트 S1~S4 완성 | 스크랩북 표지 | 하단 내비 '기록' 탭 아이콘 스킨 (매 화면 노출) |
| 책갈피 | 인카운터 3장 누적 | 탭 인디케이터 | 여정 맵 완료 에피소드 마커 스킨 (매 세션 첫 화면) |
| 타일 프레임 | 인카운터 9장 누적 | 카드 타일 테두리 | RewardScreen 카드 프레임 (매 클리어 순간) |

- 구현 비용: 전부 CSS 토큰/클래스 스왑 수준(신규 에셋 3종 이내) — v1 범위를 늘리지 않는다. 적용/해제는 스크랩북 코스메틱 시트에서 선택(강제 아님).

### ③-F 신학 가드 — 스키마·CI 코드 (공통 #1·#3, 신1)

```ts
// ---- src/content/guards.ts (신규) ----
const JESUS_ID_PATTERN = /^(jesus|yesu|christ|예수)/i
const ANTAGONIST_IDS = ['caiaphas', 'pilate'] as const   // 세트·성장 금지 목록

export const CardListSchema = z.array(CardSchema).superRefine((cards, ctx) => {
  cards.forEach((c, i) => {
    if (JESUS_ID_PATTERN.test(c.id))
      ctx.addIssue({ code: 'custom', path: [i, 'id'],
        message: 'THEOLOGY_GUARD: 예수님은 수집/성장/편성 대상이 될 수 없습니다' })
    if (c.kind === 'encounter' && c.effects.some(e => e.kind !== 'narrative'))
      ctx.addIssue({ code: 'custom', path: [i, 'effects'],
        message: 'GUARD: encounter 카드는 narrative 외 효과 금지' })
  })
})

export const CardSetListSchema = z.array(CardSetSchema).superRefine((sets, ctx) => {
  sets.forEach((s, i) => {
    if (s.memberIds.some(id => JESUS_ID_PATTERN.test(id)))
      ctx.addIssue({ code: 'custom', path: [i], message: 'THEOLOGY_GUARD: 예수님 세트 편입 금지' })
    if (s.memberIds.includes('judas'))
      ctx.addIssue({ code: 'custom', path: [i], message: 'THEOLOGY_GUARD: 유다는 세트 충족 멤버 금지 (C4 결정)' })
    if (s.memberIds.some(id => (ANTAGONIST_IDS as readonly string[]).includes(id)))
      ctx.addIssue({ code: 'custom', path: [i], message: 'GUARD: 적대자 카드는 세트 미포함·기록 전용' })
  })
})

// faithThemed 게임 × meterGrace 차단 (R3) — 미니게임 레지스트리와 교차 검증
export const validateFaithGuard = (cards: Card[], minigames: MinigameMeta[]) => { /* ... */ }

// R6 서사 시점 정합 (신6) — 사후·부재 인물의 편성 가능 장·회상 프레임 검증
export const validatePresence = (cards: Card[], episodes: Episode[]) => {
  // (a) companion.presence.activeEpisodes ⊆ 실재 에피소드 id
  // (b) 매트릭스 '유효 미래 장' 중 편성이 필요한 능력의 대상 장 ⊆ presence.activeEpisodes
  //     (세례 요한 카드에 ep07+ 유효 장이 표기되면 CI 에러)
  // (c) voiceFrame === 'memory' 카드의 bondDialogue 전량이 회상 인용 마커
  //     (『…』 인용 프레임 + 과거형 서술)를 포함하는지 lint — 실시간 1인칭 현재형 검출 시 에러
  // (d) 커브 폐쇄 하한: activeEpisodes 기준 공급 XP ≥ 160 (③-B)
}
```

**CI 규칙(`npm run guard` — 프로덕션 빌드 전 필수 단계):**
1. `guard:theology` — 위 스키마 refine 전체 실행. 실패 = 빌드 하드 에러.
2. `guard:review` — 모든 `ReviewableText`의 `sha256(text)`를 재계산, `hash` 불일치 시 status를 draft로 간주. **draft가 1건이라도 있으면 프로덕션 빌드 실패**(개발 빌드는 경고 + 워터마크 표시). 감수 주체·반려→재검 절차는 ⑩ 참조.
3. `guard:scripture` — 카드·묵상의 성구 인용문을 승인된 본문 대조 파일과 자동 diff(공통 #4). 불일치 = 하드 에러.
4. `guard:ability` — R1(최소 2개 장 유효)·R3(faithThemed × meterGrace) 매트릭스 검사 + **R7 kind 커버리지(매트릭스 kind ↔ `AbilityEffectSchema` kind 목록 diff — 겜6)** + 카드별 공급 XP ≥ 160 하한.
5. `guard:presence` — **R6 서사 시점 정합(신6)**: `validatePresence` 실행. 사후·부재 인물이 부재 장에 유효 편성으로 표기되거나 memory 카드에 실시간 대사가 있으면 하드 에러.
6. 런타임 이중 방어: `recruit`/`gainBondXp`/`setParty`는 dev 모드에서 JESUS_ID_PATTERN 인자 수신 시 throw. `setParty`는 현재 에피소드가 `presence.activeEpisodes` 밖인 카드 수신 시 dev throw(R6).

---

## ④ 모듈/컴포넌트 구조 (기존 src와 정합)

```
src/
  content/
    schema.ts            # ③의 스키마 확장
    guards.ts            # (신규) 신학·설계 규칙 refine + CI 진입점
    cards.ts             # companions.ts 확장·개명 (re-export 호환층 유지)
    sets.ts              # 세트 정의 (신규)
  state/
    store.ts             # CollectionSlice + persist version:1 migrate + partialize 갱신 + .bak 래퍼
  systems/
    abilities.ts         # 보정 계산 순수 함수 + 게임별 파라미터 매핑 + feedbackPolicy
    bond.ts              # XP 커브·레벨업·일일 상한 순수 함수
  screens/
    CollectionScreen.tsx # 탭(함께 걷는 이들/길에서 만난 이들/세트) + 코스메틱 + '???' 제거
    CardDetailSheet.tsx  # (신규) 상세 시트 — role=dialog, 포커스 트랩, '이야기 보기' 버튼
    PartyBriefingSheet.tsx # (신규) 편성 브리핑 — JourneyMap 내 바텀시트 (Screen 유니온 무변경)
    RewardScreen.tsx     # 신규 영입/기보유 분기 + XP·발동 통합 요약 패널
  screens/components/
    CardTile.tsx         # (신규) button 시맨틱, accessible name
    BondMeter.tsx        # (신규) 색+형태 이중 부호화 + aria-valuetext
    SetShelf.tsx         # (신규) 세트 선반·제본 (reduced-motion 폴백 내장)
    ToastQueue.tsx       # (신규) 단일 큐 (동시 1개·최소 2.5s·우선순위)
scripts/
  guard.ts               # CI 게이트 (③-F)
  extract-review.ts      # cards/sets → 감수용 시트 추출
```

원칙:
- 엔진/콘텐츠 분리 유지. 능력 수치·XP 커브·세트 구성·게임별 매핑 계수는 전부 `content/` 데이터.
- 화면 라우팅: `Screen` 유니온 무변경. 편성 브리핑·카드 상세는 시트로 처리.
- `companions.ts`는 `cards.ts` re-export 얇은 파일로 유지(기존 import 무파손). 구 `desc`/`skill` 필드는 호환 getter로 재생성.
- 저사양 구현 노트(엔지니어링 low): 양피지는 이미지 텍스처 대신 CSS 그라디언트+노이즈, 플립·확대는 transform/opacity만 사용(레이아웃 트리거 금지).

---

## ⑤ 핵심 플로우 (상태 전이)

**F0. 편성(신규 — 겜2)**
```
JourneyMap 에피소드 탭 → PartyBriefingSheet
  → "함께 걷는 이" 1~2인 선택 (기본값: 직전 편성 유지, 첫 진입 시 추천 자동)
  → 12A(수난)는 편성 UI 자체를 표시하지 않음 (R4)
  → 서사 시점상 부재 인물(R6)은 비활성 표시 + 사유 라벨("요한은 이 길에 없습니다 — 마 14장")
     · memory 카드(요셉)는 '기억으로 함께' 배지로 편성 가능
  → setParty(ids) → enterEpisode(id)
  → 편성된 동료만: 보정 적용 · 액티브 버튼 노출 · 발동 대사 · XP 수령
```

**F1. 영입(동료)**
```
미니게임 클리어 → completeEpisode(id, companionIds)
  → recruit(각 id): 신규면 companions 추가 + bonds 초기화(level 0)
  → RewardScreen: [신규] 카드 등장 연출 + 성구(정조 일치본) + 능력 소개
                  [기보유] "함께 깊어진 길" XP 연출 분기 (M1부터)
  → XP·액티브 발동 내역 통합 요약 패널 (이연된 대사 여기서 표시)
```

**F2. 인카운터 기록**
```
미니게임 결과 콜백 또는 (v1.1) ink 태그 → recordEncounter(id)
  → 게임 중이면 기록만 하고 무음 (feedbackPolicy) → 종료 요약에 표시
  → 게임 밖이면 토스트 큐 경유 (동시 1개)
  ※ v1은 ink 파이프라인에 의존하지 않는다 — 신설 인카운터 4종(③-C)은 전부
    미니게임 결과 콜백으로 기록 가능 (유나 medium: 미착수 시스템 의존 해소)
```

**F3. 동행 성장**
```
gainBondXp(id, xp, source)   ← 공급원·수치·소진 정책은 ③-B 표가 단일 출처
  → source별 중복 지급 가드(에피소드×source 1회) → 레벨업 판정(bond.ts 순수 함수)
  → 레벨업: effects 병합 + dialogueKnot 해금 신호 + artLayer 갱신
  → 레벨 하강 없음 · Lv3 초과 누적 없음 · 동일 조건 반복 클리어 XP 0
```

**F4. 세트 완성**
```
recruit/recordEncounter 후 셀렉터가 충족 검사
  → silentComplete 세트: 알림 없이 세트 페이지에 제본 연출만 예약
  → 능동 세트: "완성! 펼쳐보기" 배지 (플레이어가 직접 탭 — 의식(ritual))
  → claimSet: ① 일러스트 비네트 → 0.8s 무음 정적 → ② 코스메틱 지급
     → ③ '묵상 보기' 선택 버튼 (열람 안 해도 완성 처리. 상시 재열람 가능)
```

**F5. 카드 상세**
```
CollectionScreen 타일(button) 탭 → CardDetailSheet (role=dialog, 포커스 트랩)
  앞면: 초상·이름·역할·동행 레벨 / [이야기 보기] 명시 버튼 → 뒷면(성구·이야기·대사 기록)
  (플립 제스처 병행 허용 — 버튼이 1급 경로, 발견 가능성 보장)
  미보유 타일 탭 → 실루엣 + 초대 문구(firstMetEpisodeId 파생) + "여정에서 보기"
  닫기: ESC · Android back(popstate) · 하단 엄지 존 닫기 버튼(44px)
```

---

## ⑥ 타 시스템과의 인터페이스 (이벤트/셀렉터 계약)

**미니게임 → 수집 (입력 계약)**
```ts
// systems/abilities.ts
selectModifiersFor(verb: Verb, minigameId: string): {
  graceRatio: number            // Σ meterGrace(편성분만), 상한 0.25. faithThemed면 항상 0
  actives: {                    // 수동 발동 목록 — 미니게임이 버튼 렌더 (겜6: preview 포함)
    cardId: string; kind: 'hint' | 'secondWind' | 'preview'; chargesLeft: number; label: string
  }[]
  shields: {                    // 자동 발동 실드 (겜6 신설) — 소모 시 배지 카운트 감소로 표시
    cardId: string; kind: 'comboShield' | 'mistakeShield'; chargesLeft: number
  }[]
  reveals: {                    // 표시형 패시브 (겜6 신설)
    cardId: string; target: 'encounterLocation' | 'insightGoal'; scope: 'current' | 'revisit'
  }[]
  insightVisible: boolean
  feedbackPolicy: 'live' | 'defer'   // 균형/집중·리듬 = 'defer' (정의는 아래 — 접2·접6)
  contributors: { cardId: string; label: string }[]   // 편성분만
}
```

**보정 단위와 게임별 매핑(단일 출처 — 겜4·엔4):**
`graceRatio` = "해당 게임의 관대 파라미터에 대한 비율 승수(0~0.25)". 게임별 어느 파라미터에 곱하는지는 아래 표가 계약이다(미니게임 플랜은 이 표를 구현).

| 동사 | 게임 예 | 관대 파라미터 | **방향(엔6)** | grace g 적용식 |
|---|---|---|---|---|
| 균형 | WaterWalk | `warnMs`(1100) | 증가형(클수록 관대) | `warnMs × (1+g)` ※ ep08은 faithThemed → g=0 고정 |
| 균형 | WaterWalk | `FOCUS_DRAIN_WAVE`(55) | **감소형(작을수록 관대)** | `drain × (1−g)` ※ 동상 |
| 리듬 | 요단강·종려주일 | 판정창 ms | 증가형 | `window × (1+g)` |
| 물류 | 오병이어 | 제한 시간/허용 오차 | 증가형 | `limit × (1+g)` |
| 퍼즐 | 지붕·비네트 | 힌트 쿨다운 | **감소형** | `cooldown × (1−g)` |
| 추리 | 유혹·다락방 | 허용 오답 수 | 가산형 | `+⌈g × 4⌉회` |

**gentleMode 결합 수식(겜4·엔6 — '관대 방향 기준'으로 재정의):** 합·곱이 아니라 파라미터별로 **더 관대한 쪽 하나만** 적용한다. 방향에 따라 연산자가 다르다:

| 방향 | 최종 값 | 예 |
|---|---|---|
| 증가형 (warnMs·판정창·제한 시간) | 계수 = `max(gentle 계수, 1 + g)` | gentle ×1.4, g=0.15 → max(1.4, 1.15) = **1.4** |
| **감소형 (드레인·힌트 쿨다운)** | 계수 = **`min(gentle 계수, 1 − g)`** | gentle ×0.6, g=0.15 → min(0.6, 0.85) = **0.6** |
| 가산형 (허용 오답 수) | 가산 = `max(gentle 가산, ⌈g × 4⌉)` | gentle +2, g=0.15 → max(2, 1) = **+2** |

구 문면의 일괄 `max(gentle, 1+g)`는 감소형에서 덜 관대한 쪽을 고르는 방향 오류였다(gentle 사용자가 동료 편성 시 접근성 기준선보다 불리해지는 회귀) — 폐기. 어느 방향에서도 gentleMode ON이면 능력 grace가 gentle 기준선을 깎지 못하므로 접근성 기준선이 흔들리지 않고, 능력 보정이 접근성 옵션을 대체하지도 않는다. **T6b가 증가형·감소형·가산형 3방향을 각각 검증한다(⑨).**

**feedbackPolicy 'defer' 정의(접2·접6):** 'defer'가 금지하는 것은 **시선 이탈을 강요하는 화면 내 별도 시각 토스트**이지 시각 피드백 전부가 아니다. 발동 확인 채널은 3중이며, 시각 채널이 항상 1순위로 보장된다:
1. **(시각 — 항상 보장)** 액티브 버튼 자체의 상태 변화: 차지 카운트 즉시 감소(2→1) + 버튼 배경 200ms 채움 플래시(`--lamp`) + 소진 시 비활성 상태 전환. 버튼은 플레이어의 조작 지점이므로 시선 이동이 발생하지 않는다. 자동 실드(comboShield·mistakeShield) 소모도 해당 배지의 카운트 감소로 동일하게 표시.
2. (촉각) 진동 — 지원 기기 한정(iOS Safari 미지원 전제).
3. (청각) 짧은 SFX — 무음 모드 시 무효 전제.

어느 단일 채널도 전제 조건이 아니다 — **1번 버튼 시각 상태만으로 발동 확인이 완결**된다(iOS + 무음 + 청각장애 조합 커버). 대사 텍스트는 종료 요약으로 이연(기존과 동일). 검증은 T15.

**마이크로 보상 리듬 계약(공통 #5):**
```ts
reportMoment(m: { kind: 'encounter' | 'bondXp' | 'setNear' | 'activeUsed'
                  sourceId: string; policy: 'once' | 'perSession' | 'onChange' })
```
- 수집 시스템이 소진 정책을 관리해 같은 순간을 중복 연출하지 않는다. 30~90초 마이크로 피드백 리듬의 발화점은 이 계약으로만 흐른다.
- 미니게임 종료 보고: `completeEpisode(...)` + `reportMinigameResult({ verb, minigameId, insight, activesUsed })` → 수집 측이 XP 배분(③-B 표)·요약 패널 데이터 구성.

**내러티브(ink) ↔ 수집 (v1.1 계약 — v1 미의존)**
- 태그: `#meet:{cardId}`, `#bond:{cardId}:{xp}`, `#requires:{cardId}:lv{n}`. 외부 함수: `hasCard(id)`, `bondLevel(id)`.
- v1의 인카운터 기록은 전부 미니게임 콜백 경로로 동작한다(F2).

**허브(관계) → 수집 (v1.1)**
- `gainBondXp(id, HUB_TALK_XP, 'hub')`만 호출. 일일 상한 판정은 `bond.ts` 순수 함수 + `hubXp` persist 상태(엔5). 날짜는 로컬 `YYYY-MM-DD` 문자열 비교 — 시계 역행 시 새 날짜로 취급(악용 완화, T5).

**여정 맵/보상 화면 → 수집 (읽기 셀렉터)**
- `selectSetProgress(setId)` — `silentComplete` 세트는 `nearComplete`를 항상 false로 반환(노이즈 제거).
- `selectScrapbookStats()` — 하단 내비 배지. 적대자 기록(v1 이후)은 별도 카운트로 분리 집계.

---

## ⑦ UI 디자인 토큰 적용

### ⑦-A 토큰·대비 실측 표 (접1, 공통 #6·#9)

스펙은 **CSS 변수명 기준**(hex 직접 표기 금지 — hex는 아래 표의 참조값). 신규 토큰 2종: `--ink-on-light`, `--parchment-dim`. 세리프는 **현행 `--serif`(Noto Serif KR) 유지** — 'Nanum Myeongjo류' 표기는 폐기(이서연 low).

| 용도 | 전경 토큰(참조 hex) | 배경 토큰 | 대비 실측 | WCAG 판정 |
|---|---|---|---|---|
| 본문 텍스트 | `--ink` (#ECE7DA) | `--ground` (#0B1020) | 15.3:1 | AA/AAA 통과 |
| 보조·미보유 초대 문구 | `--muted` (#9AA3BD) | `--ground` | 7.5:1 | AA 통과 |
| ~~미보유 앰버 40% 톤 다운~~ | (폐기) | `--ground` | 2.52:1 | **미달 — 사용 금지** |
| 앰버 강조·배지 | `--lamp` (#F0B24A) | `--ground` | 10.1:1 | AA 통과 |
| 코랄 하이라이트 | `--dawn` (#E98A6B) | `--ground` | 7.5:1 | AA 통과 |
| 카드 뒷면 텍스트 | `--ink-on-light` (#1E2436, 신설) | `--parchment` (#EDE3CE) | 12.1:1 | AA/AAA 통과 |
| 야간 컨텍스트 뒷면 | `--ink-on-light` | `--parchment-dim` (#D8CDB4, 신설) | 9.8:1 | AA 통과 |
| `--muted-2` (#6C7699) | — | `--ground` | 4.2:1 | **텍스트 사용 금지** — 비텍스트 장식(3:1)만 허용 |

**규칙:** 신규 텍스트/배경 조합은 반드시 실측 대비를 이 표에 추가하고 4.5:1(비텍스트 3:1) 미달이면 병합 불가(PR 체크리스트 항목).

| 요소 | 적용 |
|---|---|
| 미보유 타일 | '잠김'은 투명도가 아니라 **타일 배경·orb 채도 저하**로 표현, 텍스트는 `--muted` |
| 동행 레벨 미터 | `--lamp` 채움 + 점(●○○) 형태 병행(색+형태 이중 부호화) |
| 세트 완성/레벨업 | `--dawn` |
| 성구·묵상·이야기 | `--serif` (Noto Serif KR — 현행 토큰 유지) |
| 카드 뒷면 진입 | 150~200ms 점진 페이드(휘도 점프 완화). 앱 야간 모드 시 `--parchment-dim` 사용, 실기기 야간 테스트 포함(이서연 medium) |
| 터치 | 타일·시트 버튼 ≥ 44px(`--touch`), 시트 닫기는 하단 엄지 존 |

### ⑦-B 시맨틱·스크린리더·포커스 명세 (접3)

| 컴포넌트 | 명세 |
|---|---|
| CardTile | `<button>`(현행 div 승격). accessible name = "베드로, 동행 레벨 2" / 미보유 = "미보유, 4장에서 만납니다" |
| CardDetailSheet | `role="dialog"` + `aria-modal` + 포커스 트랩. 닫기 = ESC·Android back(popstate 후킹)·닫기 버튼. 닫힌 뒤 포커스는 원 타일로 복귀 |
| 뒷면 전환 | **'이야기 보기' 명시 버튼이 1급 경로**(플립 제스처는 보조). 전환 시 aria-live로 "뒷면: 성구와 이야기" 안내 |
| BondMeter | `role="meter"` + `aria-valuetext="동행 레벨 2, 다음 레벨까지 30"` |
| ToastQueue | `aria-live="polite"` **단일 큐** — 동시 1개, 최소 표시 2.5s, 우선순위 인카운터 > XP > 세트 근접. 에피소드 클리어 직후 다건 발생 시 RewardScreen 통합 요약 패널로 강등 |
| 카드 뒷면 본문 | 동적 글자 크기(OS 설정 반영, rem 기반) 적용 명시 |
| 탭 라벨 | 스키마 용어 노출 금지 — **"함께 걷는 이들" / "길에서 만난 이들" / "세트"**. 각 탭 첫 진입 시 한 줄 설명 1회(이서연 medium) |

### ⑦-C reduced-motion 대체표 (접4)

| 연출 | 기본 | `prefers-reduced-motion` 대체 |
|---|---|---|
| RewardScreen 카드 부상 | 스프링 + 앰버 글로우 펄스 | 300ms 단일 페이드 + 정적 글로우 프레임 |
| 카드 플립 | 3D 플립 | 크로스페이드 |
| layoutId 카드 확대 | 공유 요소 확대 | 즉시 표시 + 150ms 오버레이 페이드 |
| 세트 제본 | 양피지 접힘·제본 모션 | 정적 스탬프 + 텍스트("세트가 완성되었습니다") |
| 파티클·반짝임 | (가챠 연상 회피 위해 원래 최소) | 전부 제거 |

T12의 검증 범위를 위 전 연출로 확장한다.

**헌정 패널(신학 medium + 민준 low):** '이 여정의 중심' 패널은 수집 격자와 같은 스크롤 평면에서 제거하고 **스크랩북 '속표지' 계층**(격자 진입 전 별도 페이지, 첫 진입 시 1회 연출·이후 접힌 진입부 기본)으로 이동한다. '0번째 카드'로 읽히는 문법을 구조적으로 차단. 최종 배치 시안은 **스크린샷으로 감수자 실물 확인**(⑩ C1).

---

## ⑧ MVP → v1 로드맵

**M0 (선행 — 공통 #7)** — `git init` + vitest 셋업 + `scripts/guard.ts` 뼈대(theology/review/ability 게이트를 CI에 먼저 배선). *기존 "M0 완료" 표기를 정정 — 테스트 인프라는 아직 없다.*

**외부 트랙(내부 일정과 병행, M1 게이트 조건 — 신2):**
- 대한성서공회 개역개정 인용 범위 지침 확인 + 사용 승인 절차 **착수**. 승인 전에는 인용 분량을 지침 내 허용 범위로 제한하고, 불허 시 대안(새번역 등 타 역본/사역 표기)을 M2 전 결정. 출처 표기 형식은 성서공회 요구 형식.
- 감수 주체 확정(통합측 목회자 2인 이상) + 반려→재검 절차 합의.

**M1 — 카드·상세 (1.5주 + 텍스트·감수 왕복 1주)**
- **착수 게이트(겜6·신6):** `AbilityEffectSchema` kind 확장(comboShield·mistakeShield·preview·reveal + insight scope)과 `PresenceSchema`가 본 문서 ③-D로 확정 — `cards.ts` 작성은 **확장 스키마 머지 후** 시작한다(구 5종 kind로는 매트릭스 능력 약 1/3이 기술 불가하여 guard:ability와 M1 합격 조건이 자기 파괴되는 문제의 해소 확인).
- 스키마·guards + `cards.ts`(12장 verseRef/story/presence + 신설 인카운터 4종) + persist 0→1 마이그레이션 + partialize 갱신 + .bak 래퍼
- CardDetailSheet('이야기 보기' 버튼·접근성 명세) + 탭 구조 + **'???' 표기 제거** + RewardScreen 기보유 분기 + `extract-review.ts` 감수 시트
- 합격: 기존 세이브(version 0, healed-friend 포함) 로드·저장 왕복 무손실 / 카드 상세 열람 / guard 3종 CI 통과

**M2 — 편성·능력 보정 (1.5주)**
- PartyBriefingSheet(1~2인 선택) + `abilities.ts`(매핑 표·feedbackPolicy·faithThemed 가드)
- 실적용 **2개 동사**: WaterWalk(균형 — 베드로 secondWind·경험담 힌트, R3 준수) + 물류 프로토(마태 힌트·grace)
- 로컬 텔레메트리(시도 횟수·클리어 시간·발동 수)
- **합격(수치 — 비2):** 편성 시 클리어율 +15%p 이상 **또는** 평균 시도 −25% 이상, 단 편성 클리어율 95% 상한(트리비얼 방지). 보유/미보유 A/B 각 20회 세션 측정

**M3 — 성장(Bond) (1~2주)**
- `bond.ts`(③-B 테이블 데이터화) + XP 요약 패널 + BondMeter + 레벨업 해금 + 변주 재클리어('거친 물결') 1종
- **합격(교체됨):** 통찰 목표·변주 경로로 베드로 Lv1→Lv2 도달, 동일 조건 반복 XP 0 확인(T18), 허브 없이 커브 폐쇄 산술 재검증

**M4 — 인카운터·세트 (1~2주)**
- `recordEncounter` 콜백 경로 + `sets.ts`(S1~S4) + SetShelf·비네트·코스메틱 + 묵상 선택 열람
- **유다 세트 제외 결정의 감수자 서면 확인을 M4 착수 게이트로**(신3)
- 미구현 장(ep01·02 등)의 세트 검증용 **디버그 영입 커맨드(개발 빌드 한정)**를 합격 수단으로 명시(엔지니어링 medium)
- 합격: S2(능동 수집 포함) 완성 플로우 전체 통과 + silentComplete(S1) 무알림 동작

**v1 게이트** — ① `guard:review` 전량 approved(**발동 대사·knot 대사·토스트·패널·초대 문구 포함 — 플레이어에게 노출되는 전 텍스트**) ② 성서공회 승인 확정 ③ 12장 카드 데이터 + R1/R3 매트릭스 CI 통과 ④ 접근성 체크리스트(⑦ 전 항목 + T13~15) ⑤ 플레이테스트 코호트 기준(⑨) 충족.

**v1 이후(백로그)** — 허브 XP(v1.1)·ink 태그 파이프라인·적대자 기록 카드·열두 제자 완전 세트(다대오·알패오의 야고보 "숨은 영웅")·편성 시너지·스크랩북 공유 내보내기.

---

## ⑨ 테스트 계획

**단위 (vitest)**
- T1 `CardSchema`: 12장+인카운터 4종 데이터 통과 / verseRef·story·presence 누락 시 parse 실패.
- T2 `AbilityEffectSchema`: 알 수 없는 kind 거부 / meterGrace ratio > 0.25 거부 / **신설 kind 4종(comboShield·mistakeShield·preview·reveal)과 insight scope 파싱 통과(겜6)**.
- T3 `recruit`/`setParty` 멱등·가드: 같은 id 2회 → 1개 / party 3인·encounter id·예수 패턴 id 거부 / **서사 부재 장 편성 거부(세례 요한 × ep08 → dev throw, R6)**.
- T4 `gainBondXp` 경계값: xpRequired 정확 도달 레벨업 / Lv3 초과 무시 / source별 에피소드당 1회 / 동일 조건 반복 0 XP.
- T5 허브 일일 상한(v1.1 선행 구현): 상한 도달 후 무효 / 날짜 경계 자정 롤오버 / 시계 역행 시 새 날짜 취급.
- T6 `selectModifiersFor`: 편성분만 합산 / 캡 0.25 / 미편성 시 0 / **T6b(엔6 교정)** faithThemed 게임에서 graceRatio 항상 0 + gentleMode 동시 적용 시 **방향별 수식 검증 — 증가형: max(1.4, 1+g)=1.4 / 감소형: min(0.6, 1−g)=0.6 (gentle 드레인 계수가 능력 grace로 대체되지 않음 — 회귀 방지 핵심 케이스) / 가산형: max(gentle 가산, ⌈g×4⌉)**.
- T7 `claimSet`: 미충족 no-op / 중복 수령 불가 / silentComplete 알림 억제 / 유다 보유 여부가 S3 판정에 무영향.
- T8 persist: **a)** version 0 세이브(`{completed, companions, gentleMode}`) → 1 로드 무손실 **b)** version 0 분기 조건 **c)** 저장→재로드 라운드트립(partialize 검증) **d)** healed-friend가 encounters로 재분류되고 bonds 미생성 **e)** migrate throw 시 .bak 보존.
- T16 `guard:theology`/`guard:ability`/`guard:presence`: 예수 id 카드·유다 세트·R1 위반 데이터가 CI 에러를 내는지 / **매트릭스 kind ↔ 스키마 kind 커버리지 diff(R7) / 세례 요한 유효 장에 ep07+ 표기 시 에러·memory 카드의 실시간 1인칭 대사 검출 시 에러(R6)**.
- T17 `guard:review`: text 수정 후 hash 불일치 → draft 강등 → 프로덕션 빌드 실패.
- T18 변주 XP: 동일 조건 재클리어 0 XP / 변주·통찰 경로만 지급.

**통합 (React Testing Library)**
- T9 클리어 → RewardScreen(신규/기보유 분기) → 스크랩북 반영.
- T10 미보유 타일(실루엣·초대 문구) / 보유 타일 상세·'이야기 보기' 버튼.
- T11 세트 완성 배지 → 비네트 → 정적 → 코스메틱 → 묵상 '선택' 버튼 / 재열람.
- T12 reduced-motion: ⑦-C 표의 전 연출 폴백.
- T13 axe 자동 검사(CollectionScreen·CardDetailSheet·PartyBriefingSheet) 위반 0.
- T14 포커스: 시트 트랩 / ESC·back 닫기 / 닫은 뒤 원 타일 복귀.
- T15 ToastQueue·발동 피드백: 동시 1개·우선순위·aria-live 단일 채널 / 게임 중 'defer' 시 시각 토스트 미발생 / **(접6) 'defer' 발동 시 액티브 버튼 차지 표시 즉시 갱신(2→1) + 200ms 플래시 클래스 적용 + 소진 시 비활성 — 진동·SFX API 부재(iOS+무음) 환경 시뮬레이션에서 버튼 시각 상태만으로 발동 확인 가능**.

**플레이테스트 — 코호트와 합격 기준 (접5·비3)**

| 코호트 | 최소 인원 | 비고 |
|---|---|---|
| 8~10세 | 3 | 보호자 동반, 읽기 속도 관찰 |
| 60대 이상 | 3 | 시트 제스처 숙련도 관찰 |
| 일반 성인 | 6+ | **비기독교인 ≥50%**, 그중 게이머 2~3인 |

- P1 안내 없이 3분 내 "첫 카드 획득 → **카드 뒷면 성구 열람**" 도달 — **코호트별 각각 충족**.
- P2 능력 체감: 설문("동료가 도왔다"를 말로 설명) + **텔레메트리 수치(M2 A/B 기준선)** 병행.
- P3 "뽑기/과금 같다" 인상 0건.
- P4 세트 완성 순간 "감동적/따뜻함" 4+/5 — **비기독교인 코호트 단독으로도 3.5+** (실체 보상 레이어 검증).
- P5 미보유 표시에 불안(FOMO)이 아닌 기대 응답 우세.
- **P6(신설)** "설교/전도당하는 느낌이 든 순간이 있었나" — 응답 발생 지점을 콘텐츠 밀도 조정 대상으로 기록(헌정 패널·묵상·성구 노출 밀도).
- **P7(신설)** 재미·추천 의향·수집 욕구 5점 척도(공통 #5) — 비기독교인 코호트 평균 3.5+.

---

## ⑩ 신학 체크포인트 (감수 필요 — 예장통합 감수자 확인 대상)

**감수 운영 원칙(공통 #3):** 감수 대상 = **플레이어에게 노출되는 전 텍스트**. `ReviewableText.hash`(sha256)로 승인 본문을 고정하고, 텍스트 수정 시 CI가 자동으로 draft 강등 → 재감수 전 프로덕션 빌드 불가. 감수 주체는 통합측 목회자 2인 이상, 반려 시 사유 기록 → 수정 → 재검 절차.

| # | 항목 | 원칙/결정 | 상태 |
|---|---|---|---|
| C1 | 예수님은 수집 대상이 아님 | 카드·능력·레벨·편성·세트에서 **Zod refine + CI로 기계 차단**(③-F). 헌정 패널은 스크랩북 '속표지' 계층으로 분리(격자 평면에서 제거). 최종 배치 **스크린샷 실물 확인** | 구현 규칙 확정 / 패널 문구·초상·배치 감수 필요 |
| C2 | 카드 story·성구 전량 | 개역개정 표기(승인 절차 ⑧), 4정경 충실. **신설: '구절의 정조와 연출의 정조 일치' 체크 항목** — 베드로 카드는 14:31 단독 인용 금지, 14:29 전면(필요 시 29-31 문맥 병기) | 감수 필요 |
| C3 | 세트 묵상문 | 설교체 금지·본문 중심. **선택 열람·상시 재열람 구조**(소비재화 방지) | 감수 필요 |
| C4 | 유다 | **설계 결정: 카드로 존재하되 '열두 제자' 세트 충족 멤버에서 제외**(Zod로 강제) — '배반자 영입이 보상 조건'이 되는 구조 차단. 12장 이후 문구는 **마 27:3-5 본문 범위 내 절제 서술**, '애도' 단독 프레임 금지·판단 연출도 미화도 없음. M4 착수 전 감수자 서면 확인 | 결정 반영 / 문구 감수 필요 |
| C5 | 능력 명칭·구현 | 신학 개념 수치화 금지(인물의 재능·성품 언어만). **구현 레벨 적용: faithThemed 게임(ep08·겟세마네)에 meterGrace 금지(R3), 힌트·경험담 계열만** — '카드가 믿음을 올려준다'로 읽히는 경로 차단 | 규칙 확정 / 명칭 샘플 감수 |
| C6 | 치유 인카운터 카드 | '전리품'이 아니라 '증인'. 치유의 주체를 예수님으로 명시 | 감수 필요 |
| C7 | 적대자 카드(v1 이후) | 세트 미포함·기록 전용(Zod 강제), 동기 있는 인간 서술 | 감수 필요 |
| C8 | 니고데모 '전향' | 요 3·7·19장 본문 범위 내 | 감수 필요 |
| **C9** | **인게임 전 발화 텍스트(신설 — 신1)** | 능력 발동 대사·dialogueKnot 대사 묶음·토스트/요약 문구·헌정 패널 문구·초대 문구·세트 비네트 텍스트 — 전부 `ReviewableText`로 스키마화, C2와 동일 게이트 | 감수 필요 |
| **C10** | **성구 인용 정확성(신설)** | `guard:scripture` 자동 diff — 승인 대조 본문과 1자라도 다르면 빌드 실패 | CI 규칙 확정 |
| **C11** | **서사 시점 정합(신설 — 신6·R6)** | 사후·부재 인물의 동행 가능 장·발화 프레임을 인물별 `presence` 데이터로 고정 — 세례 요한 **ep03~06 한정**(마 14:1-12), 요셉 **회상 인용 프레임 강제**(공생애 생존 본문 미확인). `guard:presence` CI 기계 강제 + **인물별 presence 표(동행 장 범위·근거 본문·프레임)를 감수자가 서면 확인** — 신규 카드 추가 시마다 갱신 감수 | 규칙·CI 확정 / 인물별 presence 데이터 감수 필요 |

---

## ⑪ 리스크와 완화책

| 리스크 | 완화 |
|---|---|
| **개역개정 저작권(신규 — 신2)** | 성서공회 승인 절차를 M1 게이트로 선행(⑧ 외부 트랙). 승인 전 인용 분량 지침 내 제한, 불허 시 타 역본 전환 결정점을 M2 전으로 명시. `guard:scripture`로 표기 형식·본문 일치 기계 검증 |
| 감수 병목이 M1 일정 직격(민준 low) | M1에 텍스트 작성+감수 왕복 1주를 명시적으로 산입. `extract-review.ts`로 감수 시트 자동 추출, hash 게이트로 재감수 범위를 변경분만으로 축소 |
| 능력 보정 과강 → 도전 무의미 | graceRatio 캡 0.25 + 관대 방향 기준 결합(증가형 `max`·감소형 `min` — 어느 방향도 gentle 기준선 초과·훼손 불가, 엔6) + 편성 클리어율 95% 상한(M2 합격 조건) + 자동 클리어 계열 금지 |
| **사후·부재 인물 동행(본문 정합 — 신6)** | R6 `presence` 데이터 + `guard:presence` CI + C11 감수 서면 확인. 세례 요한 ep03~06 한정·요셉 회상 프레임. 편성 제한 시 커브 폐쇄 하한(공급 XP ≥ 160)을 CI가 함께 검사해 신학 수정이 게임 경제를 깨뜨리지 않게 이중 검증 |
| 능력 보정 과약 → "수집이 의미 없다" | ① 편성 선택제로 결정의 무게 부여 ② 동료당 액티브 1개(직접 발동 체감) ③ A/B 수치 합격선(+15%p/−25%) ④ 매트릭스 R1로 전방 유용성 보장 |
| 중반 이후 신규 카드 한계효용 0(유나 지적) | 전체 자동 합산 폐기 — 편성 2슬롯이므로 신규 카드는 '슬롯 경쟁' 가치를 가짐. 카드별 유효 장 매트릭스가 로테이션 동기 제공 |
| 세이브 마이그레이션 실패 | version 0 기준 migrate + partialize 갱신 + .bak 백업 래퍼 + T8a~e |
| 성장이 노가다로 변질 | 동일 조건 반복 XP 0(T18), 변주·통찰 경로만 지급, Lv3 상한, 허브 없이 커브 폐쇄(산술 증명) |
| 수집 UI '가챠' 인상 | 등급·별·반짝이 배제, 기록/스크랩북 메타포, P3 설문 |
| 설교 체감(민준) | 묵상 선택 열람·헌정 패널 속표지 이동·P6 문항으로 밀도 측정, 초과 지점 조정 |
| 스키마 확장이 v0.1 화면 파손 | 콘텐츠 스키마는 필수+빌드 검증 / 세이브만 default — 층위 구분 명문화. `companions.ts` re-export 호환층, 기존 컴포넌트 무수정 통과 M1 합격 조건 |
| 저가 기기 프레임 드랍 | 양피지 CSS 그라디언트+노이즈, transform/opacity만 사용, reduced-motion 폴백 공유 |
| ep12 정조 충돌(공통 #10) | 12A 수난 = 편성·보정·토스트 전면 미적용(절제) / 12B 부활 = 통상 보상 리듬 복귀(기쁨을 침묵시키지 않음) |
