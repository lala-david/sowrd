# THE WAY — 콘텐츠 가이드 (자리 101곳을 채우고 지키는 법)

> 2026-08-20 · 자리(Station/Episode) 콘텐츠의 **스키마·문체·검수·기계 검증**을 한 장에 모은다.
> 신학 금지선의 정본은 `DECISIONS.md`(불변 원칙)와 `PLANNING.md §4.3`이다 — 이 문서는 그것을 콘텐츠 작업 절차로 옮긴 것이다.

## 1. 어디에 무엇이 사는가

| 데이터 | 파일 | 자리 수 |
| --- | --- | --- |
| 예수님의 사역 길 | `src/data/journey.ts`(STATIONS, 서사) + `src/data/geo/jesus-journey.json`(좌표) → `geo/journeys/jesus.ts`가 조인 | 33 |
| 아브라함·출애굽·바울·베드로 | `src/data/geo/journeys/{abraham,exodus,paul,peter}.json` | 10 · 16 · 28 · 14 |
| 톤(mood) | `src/data/geo/journeys/moods.ts` — JSON에 없다. 좌표 리서치와 신학 판단은 다른 종류의 데이터라 분리 | — |
| 분위기 연출 좌표 | `src/data/ambient.ts` — 패널 그림을 다시 생성하면 반드시 다시 본다 | — |

## 2. 자리 하나의 스키마 (JSON 여정)

```
id, order, place, placeLatin, region      — 정체
lat, lng, cumulativeKm, segmentKm         — 지리(실측 원본. 걸음 고르기는 pace.ts가 로드 시)
event                                     — 이곳에서 있었던 일, 1~3문장. 성경 서사의 요약
passageRef                                — "창 12:1-9" 꼴. 반드시 실제 본문
verseKrShort                              — 개역한글 한 구절(퍼블릭 도메인 판본만)
reflection                                — 묵상 1~2문장. 명령하지 않는다 — 관찰하고 초대한다
prayer                                    — 한 줄. "기도로 읽어도, 그냥 문장으로 읽어도" 되는 말
feel                                      — 달리는 느낌 한 줄(지형·공기)
confidence                                — biblical | tradition | symbolic (자리 비정의 정직성)
```

## 3. 문체 — 순례의 말

- **어휘는 순례, 메커니즘은 게임**(D3). 금지어: 레벨·클리어·보스·가챠·확률형.
- 과장하지 않는다. "대단해요!"가 아니라 "닿았습니다".
- 수난(mood=lament) 자리의 문장은 축하를 돕지 않는다 — "닿았습니다" 대신 "이 자리를 지나며".
- 위치가 전승인 자리는 반드시 `confidence: "tradition"` — 화면이 "학문적으로 확정된 위치는 아닙니다"를 정직하게 말할 수 있게.
- 예수의 말은 **성경 본문 그대로만**. 창작·의역·1인칭 연출 금지(불변 원칙).

## 4. 검수 파이프라인

1. **기계(선행)** — `node scripts/check-content.mjs`
   - 스키마: 밭이 비어 있지 않은가(본문·묵상·기도·사건·느낌)
   - 금지어: D3 게임 어휘가 사용자 문장에 들어왔는가
   - 지리: 누적 km 단조 증가 · 장(tier)의 참조 무결성 · totalKm 정합
   - 걸음: pace.ts를 재현해 [2,12]km·첫 구간 ≤3km이 지켜지는가
   - 톤: moods.ts가 가리키는 자리가 실존하는가(오타 = 수난 가드 무력화)
2. **사람(후행)** — 작성 중 → 성경 본문 대조(판본: 개역한글) → 신학(금지선 체크리스트) → 번역 → 게시 승인 (`DECISIONS.md` 검수 워크플로)

기계가 통과시킨 것만 사람이 본다 — 사람의 눈은 신학과 문체에만 쓴다.

## 5. 아트 파이프라인 (recraft v4.1)

- 월드 패널: `node scripts/world-art.mjs panels` — 장(章)당 9:16 한 장, q80 webp 폭 1024(장당 ≤200KB 예산, D7)
- 자리 그림: `scripts/episode-art.mjs` · `scripts/stations-art.mjs`
- 장식(extras): `node scripts/world-art.mjs extras` — `stats-hero`(기록 머리), `journey-complete`(완주 의식, D9)
- 원칙: 부정 목록 대신 긍정 서술 · 숫자는 말로 · 패널에 사람 없음 · **그리스도는 인물로 그리지 않는다**(예수 여정의 인물 토큰은 등불)
- **패널을 다시 생성하면 `src/data/ambient.ts` 좌표표를 다시 본다**(CLAUDE.md)

## 6. 콘텐츠 상태 (2026-08-20 린터 기준)

- 68자리(아브라함·출애굽·바울·베드로) — 스키마·금지어·지리·걸음·톤 **전부 통과**
- 예수 33자리 — journey.ts STATIONS에 성구·묵상·기도 완비(코드 타입이 강제)
- 남은 일은 채우기가 아니라 **깊이 고르기**다: reflection의 톤 편차(관찰형 vs 권유형)를 다음 편집 회차에서 고른다.
