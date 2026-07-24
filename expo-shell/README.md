# THE WAY — Expo WebView 셸

이 폴더는 **THE WAY 웹 앱(Vite + React)** 을 아이폰에서 **Expo Go** 로 띄우기 위한
**얇은 WebView 껍데기**입니다.

> 중요: 이건 앱을 React Native 로 다시 만든 게 **아닙니다.**
> 기존 웹 앱을 그대로(`react-native-webview` 로) 전체 화면에 감싸서 보여줄 뿐입니다.
> GPS · Leaflet 지도 · localStorage · Service Worker 전부 **웹 그대로** WebView 안에서 돕니다.
> 루트의 `package.json` / `vite.config.ts` / `src` 는 **하나도 건드리지 않았습니다.**

---

## ⭐ 먼저: 더 간단한 대안 (Expo 없이)

솔직히 말하면, 아래 Expo 절차보다 **이게 훨씬 간단합니다.** 이 앱은 이미 **PWA** 라서요.

1. 앱을 아이폰에서 열 수 있는 주소로 띄웁니다.
   - 배포된 URL 이 있으면 그 주소를,
   - 없으면 개발 PC에서 `npm run dev -- --host` 를 켜고, 아이폰 Safari 에서
     `http://<개발PC-LAN-IP>:5173` (예: `http://192.168.0.12:5173`) 을 엽니다.
2. Safari 하단 **공유 버튼** → **"홈 화면에 추가"**.
3. 홈 화면 아이콘으로 실행하면 주소창 없는 전체 화면 앱처럼 뜹니다. (= PWA 설치)

이 방식은 Expo · Xcode · 빌드가 전혀 필요 없고, GPS · 지도 · 오프라인 캐시(Service Worker)가
전부 동작합니다. **대부분의 경우 이걸 권장합니다.**

Expo WebView 셸은 "나중에 실제 네이티브 앱으로 확장할 뼈대가 필요하다"거나
"Expo Go 흐름을 미리 깔아두고 싶다" 할 때 쓰세요.

---

## Expo Go 로 실행하기 (아이폰)

### 사전 준비
- 아이폰과 개발 PC가 **같은 와이파이**에 연결.
- 아이폰에 App Store 에서 **Expo Go** 설치.
- 개발 PC에 Node.js LTS 설치.

### 1) 웹 앱 개발 서버를 LAN 에 노출
저장소 **루트**(이 폴더의 상위)에서:

```bash
npm run dev -- --host
```

`--host` 를 붙여야 아이폰이 접속할 수 있게 LAN 에 열립니다. 터미널에 이렇게 뜹니다:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.0.12:5173/     ← 이 주소를 씁니다
```

**개발 PC의 LAN IP 직접 확인하는 법:**
- Windows: `ipconfig` → "IPv4 주소" (예: `192.168.0.12`)
- macOS: `ipconfig getifaddr en0`
- Linux: `hostname -I`

### 2) 어떤 주소를 띄울지 정하기 (환경변수)
`App.tsx` 는 더 이상 IP 를 코드에 박아두지 않습니다. **기본값은 배포된 실제 앱**이고,
개발 중 로컬 서버를 보려면 **환경변수**로 주소를 넘깁니다:

```bash
# 개발 PC 로컬 서버를 아이폰에서 보기 (위 Network 주소로)
EXPO_PUBLIC_WEB_APP_URL=http://192.168.0.12:5173 npx expo start
```

> `localhost` / `127.0.0.1` 은 쓰면 안 됩니다 — 아이폰 입장에선 "아이폰 자기 자신"을 가리켜요.
> 반드시 개발 PC의 `192.168.x.x` 형태 IP 를 쓰세요.
> 배포 도메인이 바뀌면 `App.tsx` 의 기본값(`WEB_APP_URL`) 한 줄만 교체하면 됩니다 —
> 예전처럼 특정 기기 LAN IP 가 코드에 박혀 남의 기기에서 무조건 실패하는 일은 없습니다.

### 3) 의존성 설치 & Expo 시작
이 폴더(`expo-shell/`)에서:

```bash
cd expo-shell
npm install
npx expo start
```

> **버전 안내:** `package.json` 은 Expo SDK 53 기준으로 적어뒀습니다.
> 만약 App Store 최신 Expo Go 가 다른 SDK 를 요구해서 "incompatible" 이 뜨면,
> 아래로 현재 Expo Go 에 맞춰 정렬하세요:
> ```bash
> npx expo install expo@latest
> npx expo install --fix
> ```

### 4) 아이폰으로 QR 스캔
- `npx expo start` 가 터미널에 **QR 코드**를 띄웁니다.
- 아이폰 **카메라** 앱으로 QR 을 비추면 → "Expo Go 로 열기" 배너 → 탭.
- (QR 이 안 잡히면 `npx expo start --lan` 으로 다시 시도. 회사망 등에서 LAN 이 막히면
  `npx expo start --tunnel` — 단, 느립니다.)

### 5) 위치 권한 허용
앱이 처음 뜰 때 위치 권한 팝업이 나옵니다("달린 거리를 재는 데만 사용합니다").
**허용**해야 지도의 GPS 추적이 동작합니다.
(iOS 는 WebView 안 `navigator.geolocation` 이 동작하려면 네이티브 앱에 위치 권한이 있어야 해서,
 `App.tsx` 가 시작 시 `expo-location` 으로 권한을 먼저 요청합니다.)

---

## 셸이 켜둔 WebView 설정

| 설정 | 목적 |
| --- | --- |
| `javaScriptEnabled` | 리액트 앱 실행 |
| `domStorageEnabled` | `localStorage` / zustand persist |
| `geolocationEnabled` | `navigator.geolocation` (Android) |
| `expo-location` 권한 요청 | iOS WebView 의 GPS 를 위한 네이티브 위치 권한 |
| `allowsInlineMediaPlayback` | 인라인 미디어 재생 |
| `pullToRefreshEnabled` | iOS 당겨서 새로고침 |
| `allowsBackForwardNavigationGestures` | iOS 가장자리 스와이프 뒤로가기 |
| `BackHandler` | Android 하드웨어 뒤로가기 → 웹 히스토리 |

`app.json` 의 iOS `infoPlist`:
- `NSLocationWhenInUseUsageDescription` — 위치 권한 문구(한국어)
- `NSLocalNetworkUsageDescription` — 로컬 개발 서버 접속용
- `NSAppTransportSecurity.NSAllowsArbitraryLoads` — 개발 중 `http://` LAN 서버 로드 허용
  (배포 땐 `https://` 를 쓰면 이 예외가 필요 없습니다)

---

## 셸이 웹 위에 더해 주는 것 (네이티브만 가능한 것)

- **매일 "오늘의 말씀" 로컬 알림** (`notifications.ts`): 웹 PWA 는 앱이 닫혀 있으면 스스로 알림을
  못 띄웁니다(푸시 서버 필요). 네이티브 셸은 `expo-notifications` 로 **서버 없이** 매일 아침
  기기 로컬에서 알림을 예약합니다 — 유일한 D1 훅(오늘의 말씀)을 능동 배달로 승격. 첫 실행 때
  알림 권한을 한 번 묻고, 거부하면 조용히 넘어갑니다.

## WebView 방식의 한계 (정직하게)

- **백그라운드 위치 추적 — 아직 미해결(가장 큰 숙제).** WebView 안 `navigator.geolocation` 은
  앱이 포그라운드일 때만 잽니다. 화면을 끄거나 주머니에 넣으면 추적이 끊깁니다. 이건 웹의
  구조적 한계라 셸을 씌워도 그대로입니다. 진짜로 풀려면 `expo-location` 의 백그라운드 위치 +
  `expo-task-manager` 로 **네이티브가 GPS 를 재서 WebView 로 브리지**해야 합니다(별도 작업).
  NRC·Strava 와의 러닝 코어 격차는 여기서 갈립니다.
- **앱스토어 심사**: "웹뷰만 감싼 앱"은 Apple 심사에서 거절될 수 있습니다(개인 사이드로드/내부 테스트엔 무관).
- **오프라인**: 웹 앱의 Service Worker 캐시에 의존합니다. Expo Go 로 로컬 개발 서버를 볼 땐
  네트워크가 끊기면 당연히 안 뜹니다(개발 서버가 소스이므로).
- **네이티브 제스처/성능**: DOM 기반이라 순수 네이티브만큼 부드럽진 않습니다.

백그라운드 추적까지 진짜로 필요해지면 그때는 "웹뷰 셸"이 아니라 **RN 재작성**(이번 범위 밖)이 답입니다.

---

## 파일 구성

```
expo-shell/
├─ App.tsx            전체 화면 WebView + 위치권한/뒤로가기/새로고침 + 알림 예약
├─ notifications.ts   매일 "오늘의 말씀" 로컬 알림 (expo-notifications)
├─ app.json          Expo 설정 (iOS infoPlist, expo-location · expo-notifications 플러그인)
├─ package.json      expo / react-native / react-native-webview / expo-location / expo-notifications
├─ babel.config.js   babel-preset-expo
├─ tsconfig.json     expo/tsconfig.base 확장
├─ .gitignore
└─ README.md         (이 파일)
```

> `node_modules` 는 여기 커밋되어 있지 않습니다. 위 3) 단계의 `npm install` 로 받으세요.
