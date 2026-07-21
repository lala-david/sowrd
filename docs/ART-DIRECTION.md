# 아트 디렉션 — PROJECT THE WAY

> 조사일: 2026-07-21
> 목표 무드: **Nike / Strava / 프리미엄 스포츠웨어 에디토리얼** — 깔끔·모던·절제·프리미엄.
> 안티 무드: 귀여운 캐릭터·마스코트·유치함·"AI 티".
> 인물은 세련되고 모던하게. 캐리커처 금지.

핵심 요약: 프리미엄 애슬레틱 룩은 보통
**플랫 지오메트릭 벡터 + 절제된 팔레트 + 실루엣 중심 인물 + 은은한 그레인 마감**의 조합이다.
하나만 고르는 게 아니라 아래를 조합한다.

---

## PART 1 — 우리가 쓸 실제 스타일 (명명)

| 스타일 | 판정 | 어디에 쓸까 | 특징 |
|---|---|---|---|
| **플랫 지오메트릭 벡터** | 프리미엄 ✅ | 코어 시스템, 히어로 | 아웃라인 최소, 형태 edge로 표현. 플랫 색면 2~4색, 그라데이션 금지 |
| **볼드 플랫 색면(포지티브/네거티브 공간)** | 프리미엄 ✅ | 히어로·성취 순간 | 빛/그림자를 "형태"로. 채도 높은 2~3색. 팝아트+옵아트 |
| **얼굴 없는 실루엣 인물** | 프리미엄 ✅ | **모든 인물(안전한 기본)** | 표정 대신 자세·바디랭귀지. 마스코트/캐리커처 회피 + AI 얼굴 문제 회피 |
| **축소 팔레트 시네마틱** | 프리미엄 ✅ | 지도·경로·조용한 화면 | 파스텔/뮤트 소수 색 + 넉넉한 빛 + 와이드/아이소 프레이밍. 묵상적 톤에 맞음 |
| **미니멀 라인아트(균일 선, ligne claire)** | 프리미엄 ✅(절제 시) | 아이콘·스팟·엠티스테이트 | **균일한 선 굵기**가 핵심. 들쭉날쭉 선은 아마추어 티 |
| **듀오톤** | 프리미엄 ✅ | 브랜드 일관성 락 | 브랜드색 1 + 뉴트럴 1. 2색이라 100개 화면에서도 일관성 유지 쉬움 |
| **그레인/텍스처 온 플랫** | 프리미엄 ✅ | 전 에셋 마감 | **최대의 "탈-AI" 장치.** 플라스틱한 완벽함을 깨고 인쇄 질감. 생성 후 Figma에서 적용 |
| 리소그래프 | 인디/공예 ⚠️ | 텍스처 악센트만 | 진(zine)/아트스쿨 느낌이라 스포츠 프리미엄과 어긋남. 그레인·소수팔레트만 차용 |
| 스위스/바우하우스 지오메트리 | 프리미엄 ✅ | 레이아웃/구성 규율 | 그리드·기하 형태·기능 우선. Nike/Strava가 "설계된" 느낌인 이유 |
| **코퍼릿 멤피스(Alegria)** | 싸구려+AI ❌ | **절대 금지** | 국수 팔다리·큰 손·작은 머리·파랑/보라 피부·콩알 눈 |

### ❌ 코퍼릿 멤피스를 반드시 피해야 하는 이유
- 2017년 Buck 스튜디오가 페북용 "Alegria"로 만든 뒤 모든 테크 스타트업이 복제 → "영혼 없다"는 조롱의 대상.
- **결정적으로: AI 이미지 모델은 "flat vector people"라고 하면 이걸 기본값으로 뱉는다.** 적극적으로 막지 않으면 나오는 게 바로 이것. 창업자가 "AI 같다/유치하다"고 할 1순위 원인.
- 텔: 국수 팔 + 큰 둥근 손 + 파랑/보라 피부 + 바닥 없이 다들 활짝 웃으며 뛰는 포즈. **네거티브 프롬프트로 전부 차단.**

---

## PART 2 — AI 도구로 일관되게 생산하는 법

### 도구 역할 분담 (2026-07 기준)
- **Recraft V4 Vector** — 주력 워크호스. 유일하게 **네이티브 SVG**(진짜 벡터 패스, Figma 편집 가능, 작은 용량 → PWA 최적) 출력. **커스텀 스타일**: 레퍼런스 3~5장 업로드 → 재사용 가능한 `style_id` 추출 → 모든 생성에 재사용 = 일관성의 핵심.
- **Nano Banana(Gemini 이미지)** — **피사체/캐릭터 일관성** 챔피언. 같은 러너 인물을 여러 화면에 재등장시킬 때. 단 **래스터** 출력.
- **분업:** Nano Banana로 "같은 인물, 여러 포즈" → Recraft에 image-to-image + `style_id`로 재렌더/벡터화해 깔끔한 플랫 벡터 SVG로.

> ⚠️ 빌드 전 확인: fal.ai vs Recraft 자체 API의 V4 파라미터/엔드포인트 이름 차이(`style_id`), Nano Banana 계열 현재 기본 모델 ID(빠르게 바뀜).

### A. 프롬프트 템플릿 — 깔끔한 애슬레틱 미니멀 에디토리얼 벡터

구조: `[피사체+동작] + [스타일 명사] + [구성] + [팔레트] + [선/셰이딩 규칙] + [마감] :: [네거티브]`

**포지티브 (대괄호 채우기):**
```
A [single runner / two runners] mid-stride, faceless, seen in [dynamic diagonal / wide cinematic] composition,
flat geometric vector illustration, bold minimal editorial style,
strong positive/negative space, clean uniform-weight contour where lines appear,
limited palette of [2–4 hex colors], flat unmodulated color fields, one hard-edged shadow plane,
generous negative space, confident athletic composition, premium sportswear editorial,
subtle fine grain texture overlay, high contrast, screen-print feel
```

**포지티브 키워드:** flat vector · geometric · editorial illustration · minimal · limited palette · negative space · silhouette · uniform line weight · flat color · one shadow plane · high contrast · screen-print/risograph grain · restrained · cinematic composition · sportswear editorial

**네거티브 (AI 티 + 멤피스 차단, 20~40단어로 짧게):**
```
corporate memphis, alegria style, blob people, noodle limbs, bendy arms, oversized hands,
tiny head, blue skin, purple skin, beady eyes, cutesy, mascot, cartoon, childish, chibi,
gradient mesh, glossy, plastic, 3D render, drop shadows, soft shadows, oversaturated,
busy background, clip art, stock illustration, watermark, text, signature, extra fingers
```

**선 단위 팁**
- 매번 **"faceless"**(또는 features implied by light) — 캐리커처 + AI 얼굴 문제 최강 방어.
- **"one hard-edged shadow plane"**("shading" 아님) — 싸구려 가짜 3D 그라데이션 방지.
- 아웃라인 쓸 거면 **"uniform line weight"** — 스케치풍 아마추어 티 제거.
- 네거티브는 짧고 타깃하게. 멤피스/blob 금지를 맨 앞에.

### B. 여러 화면에서 스타일 + 반복 인물 일관성
1. **Recraft `style_id` 먼저 락.** 룩을 완성한 히어로 레퍼런스 3~5장 → 커스텀 스타일 저장 → 이후 **모든** 생성에 그 `style_id`. 매번 말로 설명하는 것보다 신뢰도 높음.
2. **시드 고정.** 화면 패밀리별로 같은 시드(또는 소수 세트) 재사용. 프롬프트만 바꾸고 시드 유지 → 관련성 유지된 변형.
3. **반복 인물 = Nano Banana.** 러너 1회 확립("front 3/4, faceless, teal top, black shorts") → 캐릭터 일관성 모드로 재포즈. 매번 텍스트만 믿지 말고 레퍼런스 이미지 투입.
4. **image-to-image 루프로 통일.** 에셋이 흐트러지면 `style_id` 달고 낮은~중간 강도로 Recraft 재통과 → 하우스 스타일로 스냅 + SVG 획득.
5. **골든셋 규칙.** "승인" 폴더 유지. 새 배치는 앱 투입 전 비교. 일관성은 프롬프트만큼 큐레이션 규율.

### C. 팔레트·선 굵기 규율
- **팔레트 강하게 제한:** 브랜드색 1 + 다크 뉴트럴 1 + 라이트 뉴트럴 1 + 악센트 최대 1. **hex를 프롬프트에 직접.** 색 적을수록 프리미엄 + 일관.
- **그림자 값 하나, 하드 엣지 하나.** 그라데이션은 의도적 2스톱만.
- **선 굵기 하나** 전 시스템 통일(예: 아이콘 전부 1×에서 2px). 한 번 정하고 강제.
- **그레인 하나.** 단일 그레인 텍스처/불투명도를 전부에 적용. 들쭉날쭉 그레인이 티남.
- **모션 언어:** 스피드 라인·모션 스트릭·단일 대각선을 일관되게 = 애슬레틱 어휘.

### D. 래스터 vs 벡터 vs Figma 손마감

| 필요 | 생성 형식 | 이유 |
|---|---|---|
| 아이콘·로고·스팟·엠티스테이트·확대되는 것 | **Recraft Vector → SVG** | 무한 확대 선명, PWA 경량, 편집 가능 |
| 그레인/복잡한 빛·인물 히어로 | **래스터**(Recraft raster/Nano Banana) → PNG/WebP | 그레인·미세 텍스처는 SVG로 안 남음 |
| 여러 장면 동일 반복 캐릭터 | **Nano Banana(래스터)** → 선택적으로 Recraft 벡터화 | 최고의 피사체 일관성 |
| 최종 폴리시 | **Figma 손마감** | 항상 |

**항상 Figma 손마감:** 정확한 브랜드 hex 리컬러, 벡터 노드/패스 정리, 그리드 정렬, 하우스 그레인 균일 적용, AI 잔여 아티팩트 제거. **AI 출력은 완성 에셋이 아니라 80% 원재료로 취급.**

### E. 노스스타 일러스트레이터 3인 (참고용, 검증됨)
창업자가 찾아볼 "깔끔·모던·애슬레틱 에디토리얼"의 정의:
1. **Malika Favre** (New Yorker·Vogue·Sephora) — 볼드 플랫 색면, 포지티브/네거티브 공간, 얼굴 없는 인물, 채도 높은 2~3색. **프리미엄·성인·패션 에디토리얼 미니멀리즘의 레퍼런스.**
2. **Tom Haugomat** — 축소 파스텔 팔레트, 시네마틱 프레이밍, 얼굴 없는 인물, 네거티브 공간과 빛의 대가. **차분·묵상적 프리미엄 절제** — 신앙/성찰 톤에 맞음.
3. **Geoff McFetridge** — 플랫 매트 색면, 깔끔한 컨투어, 단순화된 얼굴 없는 인물. **따뜻하고 인간적인 미니멀-피규러티브.**

*(애슬레틱 각도: Behance "Nike Journal / Nike: Movement" 에디토리얼 일러스트 검색.)*

**윤리적 레퍼런싱 (프롬프트 작성자 필독):**
- **기법·원리**(플랫 색, 얼굴 없는 실루엣, 네거티브 공간, 2~3색, 시네마틱 프레이밍)를 참고. **작가 이름을 프롬프트에 넣지 말 것.** "in the style of Malika Favre" 금지 — 생존 작가 스타일 복제 리스크 + 파생적/법적·윤리적 문제.
- **Recraft 커스텀 스타일을 생존 작가 실제 작품으로 학습시키지 말 것.** `style_id`는 *우리가* 생성·승인한 레퍼런스 또는 퍼블릭도메인/라이선스 자료로만.
- 노스스타는 무드보드처럼 취향·어휘 정렬용. 그다음 **우리만의** 조합(우리 팔레트·그레인·인물 시스템)을 개발. 레퍼런스에 *인접*하되 복제 아님.

---

## 소스
- Malika Favre — commarts.com/features/malika-favre
- Tom Haugomat — handsomefrank.com/illustrators/tom-haugomat
- Geoff McFetridge — russell-collection.com/geoff-mcfetridge
- 코퍼릿 멤피스(회피 근거) — en.wikipedia.org/wiki/Corporate_Memphis, creativebloq.com/news/corporate-memphis-style-is-dead
- Ligne claire — en.wikipedia.org/wiki/Ligne_claire
- Recraft V4 / SVG / styles — recraft.ai/docs/recraft-models/recraft-V4, recraft.ai/docs/api-reference/styles
- Nano Banana / Gemini 이미지 — deepmind.google/models/gemini-image/pro/, replicate.com/google/nano-banana
