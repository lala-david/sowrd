# RESUME — 세션 재개용 (2026-08-21 갱신)

> 이 문서 하나로 이어서 작업한다. 이전 판(7월)은 git 히스토리에.
> 정본 우선순위: `DECISIONS.md`(D1~D10) > 이 문서.

## 지금 라이브 (https://lala-david.github.io/sowrd/)

- **지도**: MapLibre + OpenFreeMap 양피지(D10). maplibre는 번들하면 워커가 조용히
  죽는다 — `public/maplibre/` 3파일 원형 서빙 + `lib/mapLibre.ts` 로더가 정본.
  프로덕션 지도 검증은 `VITE_DEV_PAGES=1` 빌드 + preview(주의: preview는 base가 `/`).
- **대적(보스전) 5종**: `data/adversaries.ts` 정본. 러닝 중 대치 배너(살아 있는 그림 +
  변위 필터) → 리빌 승리 컷 시퀀스. lament·첫 자리 금지는 check-content §6이 기계 강제.
- **전시실 `/showcase.html`**: 대적 5편 시네마틱 영상 + 살아 있는 배너. 앱 IA 미연결.
  SW navigateFallback 예외 필수(vite.config).
- **자리 시네마틱**: 예수 26자리 영상이 자리 상세 "이 자리의 길"에서 재생(본문처럼
  항상 열림, `episode-videos.json`은 `sync-episode-videos.mjs`가 실제 파일에서 생성).

## 남은 일 (우선순위순)

### 1. 자리 시네마틱 완주 — **recraft 크레딧 충전 대기(유일한 블로커)**
- 실측 단가: **API 키 생성 = 장당 35크레딧**(MCP는 2 — 혼동 금지). 잔여 5.
- 필요: 예수 마지막 7자리 26장 + 4여정(아브라함·출애굽·바울·베드로) 272장
  = **298장 ≈ 10,430크레딧(~$10)**. 충전: recraft.ai/profile/api → `.env`의 키 그대로.
- 재개 절차(전부 자동, 있는 것 건너뜀):
  1. `node scripts/episode-frames.mjs` (~1.7h)
  2. `node scripts/episode-video.mjs` (전체 렌더)
  3. `Copy showcase/episodes/* → public/media/episodes/` → `npm run build` → gh-pages 배포
- 장면 정본 101자리는 **완성**: `scripts/episode-scenes*.mjs`(여정별 파일 + index 집계).

### 2. 사람 검수(신학·본문) — 기계가 못 하는 것
- 말씀 인용 101곳: 특히 blind-sight·entry(중간 절단), 벧전 1:1(원본 띄어쓰기 흠),
  파일럿 5자리 verseEn(WEB풍 — 나머지 예수 자리는 repo KJV. 판본 통일 여부 결정).
- 수난 7자리 프롬프트(golgotha·finished 등)와 lament 연출 톤.
- 대적 5종 서사(adversaries.ts)와 영어 자막 전략(4여정은 영어 본문 데이터 없음 —
  영어 성경 원문은 `data/bible/english_kjv.json`·`english_web.json`이 있으니
  journey-passages에 en 필드를 채우는 작업이 가능. 검수 후 결정).

### 3. 공동체 P1 — 창업자 결정 3건 대기 (`docs/COMMUNITY-PLAN.md` §9)
D1과의 순서 · D8 개정(익명 계정+최소 서버) · 어휘(동행·연합·함께 넘기) 확정 시
동행+홍해 함께 넘기(Supabase 최소) 구현 착수.

### 4. 잔손질
- 유라굴로 대치 아트 품질(하반 언덕 흠) — 크레딧 충전 후 `adversary-art.mjs --force euroclydon`.
- 실기기 GPS 검증(데스크톱 스텁은 D6 sim 가드에 걸림 — 정상 동작의 증거).
- 전시실에 자리 시네마틱 여정별 갤러리 추가 여부(현재는 대적 5편만).

## 파이프라인 지도 (재현 명령)

| 무엇 | 명령 |
|---|---|
| 지도 스타일 검증 | `dev/map.html` + `node scripts/check-shot.mjs <png>` |
| 색·대비 | `node scripts/check-contrast.mjs` (mapStyle·journeySkin 포함) |
| 콘텐츠·대적 가드 | `node scripts/check-content.mjs` |
| 대적 아트/영상 | `scripts/adversary-art.mjs` · `scripts/adversary-video.mjs` |
| 자리 키프레임/영상 | `scripts/episode-frames.mjs` · `scripts/episode-video.mjs` |
| 배포 | `npm run build` → dist를 gh-pages로(404.html=index 사본, .nojekyll 유지) |

## 구조 메모 (2026-08-21 정리)

- 루트의 `data/bible/` = 성경 원문 JSON(KRV·KJV·WEB, 31MB) — 소스 데이터, 보존.
- `expo-shell/` = Capacitor 이전의 Expo 래퍼 실험(레거시, D7 검증 후 재평가) —
  로컬 node_modules ~276MB는 필요 시 지워도 됨(추적 안 됨).
- `landing/` = 랜딩 시안 2종. `showcase/` = 영상 출력(gitignore).
- 로그(*.log/out/err)·`.tmp/`는 gitignore — 루트에 쌓이던 잡동사니 정리함.
- 비밀: `.env`(RECRAFT_KEY) — gitignore, 절대 커밋 금지.
