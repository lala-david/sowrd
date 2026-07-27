# THE WAY — 검증 랜딩 (A/B 스모크테스트)

수요 검증([[../docs/VALIDATION.md]] §3)용 대기자 랜딩 2종. **DESIGN-PHILOSOPHY의 "The Illuminated Path"(채색 필사본) 시그니처** 구현 — 양피지 + 세피아 잉크 + 놋쇠 금 + **라피스 여정선**(#2E3F8F), Versal 금박 드롭캡. 히어로 지도는 **게임형 자리 해금 itinerary**(세례·광야·갈릴리 열림 → 예루살렘 현재 → 봉인된 자리). 라이트=낮의 순례 / 다크=밤의 필사본. 순수 HTML/CSS(캔버스·SVG 미사용 — 아티팩트 샌드박스 안정성).

| 파일 | 포지셔닝 | 발행 아티팩트(비공개 기본) |
|---|---|---|
| `theway-landing-a.html` | "디지털 순례길" | https://claude.ai/code/artifact/df370cd7-0700-4f5a-ad68-50cba2f9a080 |
| `theway-landing-b.html` | "품은 사람을 위해" | https://claude.ai/code/artifact/3cde58b5-84e2-4c50-b4df-a7b8e1944811 |

## 스모크테스트 돌리는 법
1. A는 채널 절반, B는 나머지 절반에 공유 → 어느 메시지가 더 전환되는지 비교.
2. CTA는 현재 **mailto**(제목에 `· A`/`· B` 태그로 유입 구분). 전환 추적을 깔끔히 하려면 **Tally/Google Form** 링크로 교체 — 각 파일 상단 `▶ WAITLIST` 주석 지점의 `href`만 바꾸면 됨. 폼 스펙은 `../docs/VALIDATION-KIT.md` §A.
3. **성공 임계값: 방문→대기자 등록 ≥ 8%**(VALIDATION §4). 미달=포지셔닝 재실험, 통과=NEXT(파일럿) 착수.

## 배포 메모
- 아티팩트는 **기본 비공개** → 각 페이지 공유 메뉴에서 공개 링크로 전환해야 배포 가능.
- 정적 HTML(자체 완결) — Netlify/Vercel/GitHub Pages 등 어디든 그대로 호스팅 가능. 최종 브랜드 폰트는 자체 호스팅 시 교체(현재 CSP 회피용 시스템 폰트 스택).
