/* maplibre 로더 — 번들하지 않고 원형 그대로 연다.
 *
 * v6 dist는 main·shared·worker 세 ESM이 상대 경로로 서로를 부른다. 어떤 형태로든
 * 재번들하면(dev 프리번들·rollup 빌드) 워커가 shared를 못 찾고 — 에러 한 줄 없이 —
 * 죽는다. 실측: 빌드된 지도가 타일 요청 0건으로 종이 배경만 보였다(배포까지 나갔다).
 * setWorkerUrl로 워커만 에셋으로 빼도 워커 속 상대 import 때문에 똑같이 죽는다.
 *
 * 그래서 scripts/sync-maplibre.mjs(predev·prebuild)가 세 파일을 public/maplibre/ 에
 * 파일명 그대로 복사하고, 여기서 native import로 연다 — 상대 참조가 전부 살아 있다.
 * CSS만 번들을 탄다(청크 이름 maplibre-gl-*, 프리캐시 제외 + runtime 캐시 대상).
 * 타입은 패키지의 d.ts를 그대로 쓴다 — 런타임 파일과 같은 버전이다. */

let cached: Promise<typeof import('maplibre-gl')> | null = null

export function loadMapLibre(): Promise<typeof import('maplibre-gl')> {
  cached ??= (async () => {
    await import('maplibre-gl/dist/maplibre-gl.css')
    const url = `${import.meta.env.BASE_URL}maplibre/maplibre-gl.mjs`
    return (await import(/* @vite-ignore */ url)) as typeof import('maplibre-gl')
  })()
  return cached
}
