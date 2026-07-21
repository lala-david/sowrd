# 디자인 툴링 리서치 — PROJECT THE WAY

> 조사일: 2026-07-21 · 환경: Windows 11, Claude Code, React + PWA
> 목적: 러닝 앱 UI/UX + 일러스트 제작에 쓸 디자인 MCP·툴 선정

프로젝트는 **React + PWA 모바일 앱**(기독교 GPS 러닝 앱)이다. "무거운 디자인 툴 하나"보다 **역할별로 가벼운 도구를 조합**하는 것이 맞다. 대부분 무료다.

---

## 추천 스택 (요약)

| 역할 | 추천 | 비용 | 핵심 이유 |
|---|---|---|---|
| UI 컴포넌트 기반 | **shadcn/ui MCP** | 무료·공식 | Radix 기반 → 접근성(키보드·ARIA·포커스) 기본. 쓰는 것만 설치 → PWA 번들 경량. React 표준 |
| 코드 정확도 | **Context7 MCP** | 무료 | React·Tailwind·Motion·서비스워커 최신 문서 주입 → 옛/틀린 코드 방지. 별 ~5.9만 |
| 일러스트(핵심) | **Recraft MCP** | $0.04/장, $0.08/벡터 | 커스텀 스타일 1개 정의→전 에셋 재사용 = 일관성 해법. 편집 가능한 진짜 SVG 출력 |
| 아이콘 | **Lucide / Iconify MCP** | 무료 | UI 아이콘은 절대 AI 생성 금지("AI 티" 1순위 원인). 손으로 그린 세트가 즉시 일관됨 |

디자인 툴 연동이 필요하면: **Pencil**(이미 설치됨, 코드 네이티브 `.pen`) 또는 **Figma Dev Mode MCP**(공식, 베타 무료, 모바일 UI 킷 생태계 큼).

---

## 카테고리별 조사 결과

### A. 디자인 툴 연동 MCP

| 서버 | 유형 | 방향 | 설치 | 비용 | 비고 |
|---|---|---|---|---|---|
| **Figma Dev Mode MCP** | 공식 | 양방향(캔버스 쓰기 가능) | `claude plugin install figma@claude-plugins-official` 또는 `claude mcp add --transport http figma https://mcp.figma.com/mcp` | 베타 무료(추후 유료화 예정) | 최고 생태계(모바일/iOS UI 킷, 러닝앱 템플릿). 폴리시 원하면 1순위 |
| **Framelink (figma-developer-mcp)** | 커뮤니티(GLips) | 읽기 전용 | `npx -y figma-developer-mcp --figma-api-key=KEY --stdio` | 무료, Figma 토큰 필요 | 별 ~15.4k. 공식 무료화로 입지 축소, 토큰만으로 가벼운 리더 원할 때 |
| **Builder.io Visual Copilot** | 벤더 | Figma→코드 | `npx @builder.io/dev-tools@latest mcp` | 좋은 기능은 유료/엔터프라이즈 | Figma→React 변환 최강. 옵션2의 애드온으로 |
| **Framer External Agents** | 공식(MCP 아님) | 양방향 | `npx @framer/agent setup` | 전 플랜 무료 | **제외** — 결과물이 Framer 호스팅에 갇힘, 자체 React 저장소로 안 나옴 |
| **Penpot MCP** | 공식(오픈소스) | 양방향(토큰 지원) | `npx @penpot/mcp@stable` → `claude mcp add penpot -t http http://localhost:4401/mcp` | 무료·자체호스팅 가능 | 벤더 락인 피하고 싶을 때 최선의 오픈소스 대안 |
| **Pencil MCP (pencil.dev)** | 벤더 | 코드 네이티브 `.pen` | 데스크톱 앱/CLI, Claude Code 자동 연동(현재 설치됨) | 얼리액세스 무료 | Git에 디자인이 코드 옆에 삶. 젊음·독점 포맷·UI 킷 없음(맨땅 디자인) |
| **Sketch MCP** | 공식 | 양방향 | 앱 내장 토글 | Sketch 라이선스 | **제외** — macOS 전용, Windows 불가 |

### B. UI 생성·컴포넌트 MCP

| 서버 | 유형 | 하는 일 | 설치 | 비용 |
|---|---|---|---|---|
| **shadcn/ui MCP** | 공식 | 레지스트리 컴포넌트 검색·설치 | `npx shadcn@latest mcp init --client claude` | 무료 |
| **Context7 MCP** | 공식(Upstash) | 최신 라이브러리 문서 주입(생성기 아님) | `claude mcp add --transport http context7 https://mcp.context7.com/mcp` | 무료(키 선택) |
| **21st.dev Magic MCP** | 커뮤니티 | 말→React+Tailwind 컴포넌트 생성 | `npx @21st-dev/cli@latest install claude --api-key KEY` | 무료 ~100크레딧/월, 이후 ~$20/월 |
| **Magic UI MCP** | 공식 | 애니메이션 컴포넌트(React+Tailwind+Motion) | `pnpm dlx @magicuidesign/cli@latest install claude` | 무료(모션 위주라 러닝앱엔 절제) |
| **Storybook MCP** | 공식 | 내 컴포넌트 지식·접근성 테스트 제공 | `npx storybook add @storybook/addon-mcp` | 무료(Storybook 필요, React 전용) |
| Aceternity / v0-mcp | 커뮤니티 | 효과 위주 / v0 래퍼 | — | 이 프로젝트엔 부적합(효과 과함·저성숙·유료) |

### C. 이미지·아이콘 생성 MCP

| 서버 | 유형 | 하는 일 | 설치 | 비용 |
|---|---|---|---|---|
| **Recraft MCP** | 공식 | 커스텀 스타일·네이티브 SVG·벡터화·업스케일 | `claude mcp add --transport http recraft https://mcp.recraft.ai/mcp` | 키+선불. $0.04 래스터/$0.08 벡터 |
| **fal.ai MCP** | 공식(호스티드) | 1000+ 모델 라우팅(FLUX, nano-banana 등) | `claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp --header "Authorization: Bearer $FAL_KEY"` | 서버 무료, 런당 과금 |
| **Replicate MCP** | 공식 | 모델 검색·실행(개발용, 앱 런타임용 아님) | `npx -y replicate-mcp` | 서버 무료, 런당 과금 |
| **nano-banana (Gemini 2.5 Flash Image)** | — | 캐릭터/피사체 일관성 최강 | fal.ai/Replicate 경유 권장(단독 서버는 미성숙) | Google 이미지 API는 보통 결제계정 필요 |
| OpenAI gpt-image / Stability | 커뮤니티 | 이미지 생성 | 키 필요 | 저장소별 품질 상이, 광택/AI 티 나기 쉬움 |
| **Lucide Icons MCP** | 커뮤니티 | 1,500+ 아이콘 검색→React/JSX | stdio, `claude mcp add` | 무료 |
| **Iconify MCP** | 커뮤니티 | 20만+ 아이콘(mdi·heroicons·lucide·tabler) | stdio | 무료 |
| **Universal Icons MCP** | 커뮤니티 | Material·Lucide·Tabler + Tailwind 클래스 주입 | stdio | 무료 |
| EverArt | — | **사용 금지** — 아카이브됨 | — | — |

### D. 게임 엔진 MCP — 이 프로젝트엔 불필요

Unity MCP(별 12.7k)·Godot MCP(별 4.8k)는 네이티브 엔진 내부에서만 동작 → React 웹에 쓸 산출물 없음. 유일한 웹 대안은 **Phaser 공식 MCP**인데, 나중에 진짜 캔버스 미니게임을 넣을 때만 의미 있음.

---

## "AI 티 안 나게 + 일관성" 실전 원칙

지난 Pencil 내장 이미지가 "제각각·AI 티" 났던 것에 대한 교훈.

1. **문제를 쪼갠다** — UI 아이콘은 전부 라이브러리(Lucide/Iconify), 생성 AI는 히어로/스팟 일러스트에만.
2. **스타일 1개 정의 후 재사용** — Recraft 커스텀 스타일 ID, 또는 고정 레퍼런스 이미지+시드. 매번 새 프롬프트 금지.
3. **프롬프트 템플릿 잠금** — 같은 팔레트(hex 목록), 같은 선 굵기, "flat editorial vector illustration" + 네거티브("no photorealism, no 3D render"). 번들거리는 포토리얼이 "AI 티"의 정체.
4. **벡터/플랫 우선** — 러닝앱엔 지도 스타일 플랫 일러스트가 "설계된" 느낌.
5. **후처리** — 2배로 뽑거나 벡터화($0.01) 후 Figma에서 손보면 "사람이 그린" 결과.
6. **승인 에셋 라이브러리 유지** — 통과한 결과물을 레퍼런스(image-to-image)로 되먹여 스타일 유지.

---

## 미해결/확인 필요

- 21st.dev 정확한 무료 크레딧/가격(공식 페이지 404, 소스 불일치) — Console에서 확인.
- API 키 발급(Recraft, fal.ai, Figma 토큰)은 사용자가 직접 해야 함.
- 아래 "모던·미니멀 일러스트" 방향은 별도 추가 리서치 진행 중 → 확정되면 이 문서에 반영.
