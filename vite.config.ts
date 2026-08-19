import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

/* 배포 하위 경로.
 *
 * config.ts의 APP_URL 기본값이 https://lala-david.github.io/sowrd — GitHub Pages **프로젝트 페이지**라
 * 앱이 `/sowrd/` 아래에서 서빙된다. 그런데 base가 없어서 빌드 산출물이 `/assets/index-*.js`를
 * 절대경로로 가리켰다. 그대로 올리면 첫 요청부터 전부 404다.
 * 게다가 그 주소는 공유 카드에 새겨 넣는 바로 그 URL이라(성장 고리의 마지막 고리),
 * 받은 사람이 링크를 누르면 백지를 만나게 된다.
 *
 * dev는 루트로 둔다 — 개발 중에 /sowrd/ 를 붙이고 다닐 이유가 없다.
 * 루트 도메인이나 다른 경로에 올릴 때는 VITE_BASE로 덮는다(예: VITE_BASE=/ npm run build). */
const BASE = process.env.VITE_BASE ?? '/sowrd/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  /* dev 터널(cloudflared/ngrok)로 낯선 호스트에서 접속할 때만 허용한다.
   * 평소엔 비어 있어 Vite 기본 보안(낯선 호스트 403)이 그대로 걸린다.
   * 켜려면: VITE_ALLOW_TUNNEL=1 npx vite --host 127.0.0.1 --port 5173 */
  server: process.env.VITE_ALLOW_TUNNEL ? { allowedHosts: true } : {},
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      /* 기본 globPatterns는 js/css/html/wasm뿐이라 이미지가 하나도 캐시되지 않았다 —
         오프라인에서 셸만 뜨고 그림이 전부 깨진다. 러너는 신호가 끊기는 곳에서 달린다.

         다만 **전부** 프리캐시하지는 않는다. 예전 주석은 "전체 이미지가 835 KB"를 근거로
         들었는데, 그 뒤 자리 그림 37장(1.84 MB)이 들어오면서 실측 2.75 MB가 됐다.
         사용자는 자리 그림을 **한 장도 보기 전에** 37장을 전부 받는다 — 저사양 안드로이드와
         데이터 절약 모드에서 그대로 통신비다.
         → 자리 그림은 assets/st/ 로 빼서 프리캐시에서 제외하고, 처음 볼 때 받아 캐시한다.
           한 번 본 자리는 그 뒤로 오프라인에서도 열린다. 셸·히어로·씬·문장은 그대로 프리캐시. */
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,svg,woff2}'],
        globIgnores: ['**/assets/st/**', '**/assets/world/**'],
        /* 세 폰트가 전부 외부 CDN에서 온다. 프리캐시는 빌드 산출물만 담으므로 그대로 두면
           오프라인에서 글꼴이 시스템 폰트로 떨어진다 — 세리프 목소리가 이 앱의 정체성인데.
           한 번 받은 뒤에는 캐시에서 쓴다(러너는 신호가 끊기는 곳에서 달린다). */
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://cdn.jsdelivr.net',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'font-css', expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            /* 월드 패널(장마다 한 장, 23장 ≈ 5MB) — 프리캐시에서 빼고 처음 볼 때 받아 보관한다.
               한 번 본 여정의 땅은 그 뒤로 오프라인에서도 열린다. */
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/assets/world/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'world-art',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // 자리 그림 — 처음 볼 때 받아서 보관한다(프리캐시에서 뺀 몫)
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/assets/st/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'station-art',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            /* 지도 타일 — 같은 기록을 다시 열 때마다 150~500KB를 새로 받고 있었다.
               OSM 타일 이용 정책상으로도 재요청을 줄이는 편이 옳다. */
            urlPattern: ({ url }) => url.origin === 'https://tile.openstreetmap.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-files',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'THE WAY',
        short_name: 'THE WAY',
        /* 아이콘이 없으면 크롬이 설치 자체를 제안하지 않는다 — SW를 아무리 갖춰도 PWA가 안 된다.
           경로에 base를 직접 붙인다: 매니페스트의 절대경로는 Vite가 안 고쳐 주므로
           하위 경로 배포에서 `/icon-192.png`가 그대로 404가 된다(= 설치 불가). */
        icons: [
          { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        id: BASE,
        start_url: BASE,
        scope: BASE,
        lang: 'ko', // 한국어 앱인데 기본값 en으로 나가고 있었다
        theme_color: '#f4ead7', // index.html의 meta theme-color와 맞춘다(서로 달랐다)
        background_color: '#f4ead7',
        display: 'standalone',
        orientation: 'portrait',
      },
    }),
  ],
  /* iOS Safari 16.4 미만은 정규식 lookbehind를 파싱하지 못한다. esbuild는 정규식을
     다운레벨하지 않으므로, 메인 청크에 하나만 섞여도 앱 전체가 백지가 된다.
     아래 두 줄이 그런 코드가 다시 들어오면 빌드를 깨뜨린다. */
  build: {
    target: ['es2020', 'safari15'],
    rollupOptions: {
      output: {
        /* 자리 그림만 assets/st/ 로 모은다 — SW가 프리캐시에서 골라낼 수 있어야 하는데,
           기본 설정은 모든 에셋을 assets/ 에 평평하게 쏟아서 구분할 방법이 없다. */
        assetFileNames: (info) => {
          // 파일명(arrest.webp)에는 경로가 없다 — 원본 경로로 판별해야 한다
          const src = (info.originalFileNames ?? []).join('|').replace(/\\/g, '/')
          if (src.includes('/art/stations/') || src.includes('/art/episodes/')) return 'assets/st/[name]-[hash][extname]'
          if (src.includes('/art/world/')) return 'assets/world/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  esbuild: { supported: { 'regexp-lookbehind-assertions': false } },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
}))
