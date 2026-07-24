/* 앱 공개 설정.
 *
 * APP_URL — 공유 카드·캡션에 넣는 "여기서 함께 걷기" 링크.
 *   그로스 평가의 핵심 지적: 공유물에 설치 경로(URL)가 없으면 받은 사람이 앱을 찾지 못해
 *   바이럴 고리의 마지막 고리(수신자→설치)가 물리적으로 끊긴다(K=0). 카드에 이 URL을 새겨
 *   넣는 것만으로 K가 0→양수로 넘어갈 최소 조건이 선다.
 *
 *   배포 도메인이 정해지면 VITE_APP_URL로 덮어쓴다(빌드 시 주입, 코드 수정 불필요).
 *   기본값은 이 저장소의 GitHub Pages 주소 — 특정 기기 LAN IP는 절대 넣지 않는다. */
export const APP_URL: string = (
  (import.meta.env.VITE_APP_URL as string | undefined) ?? 'https://lala-david.github.io/sowrd'
).replace(/\/+$/, '')

/** 카드/캡션에 보이는 짧은 표기(스킴 제거). 예: "lala-david.github.io/sowrd" */
export const APP_URL_LABEL = APP_URL.replace(/^https?:\/\//, '')
