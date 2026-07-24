import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import * as Location from 'expo-location';
import { scheduleDailyVerse } from './notifications';

// ─────────────────────────────────────────────────────────────────────────────
//  로드할 웹 앱 URL.
//
//  기본값은 **배포된 실제 앱**입니다(특정 기기 LAN IP를 코드에 박아 두지 않습니다 —
//  예전엔 192.168.0.2가 하드코딩돼 남의 기기에선 무조건 실패했습니다).
//
//  ▸ 개발(내 PC의 로컬 Vite 서버를 아이폰에서 보기):
//      1) 저장소 루트에서:  npm run dev -- --host
//      2) 터미널의 "Network" 주소(예: http://192.168.0.12:5173)를 아래 환경변수로 주고 실행:
//         EXPO_PUBLIC_WEB_APP_URL=http://192.168.0.12:5173 npx expo start
//      3) 아이폰과 개발 PC가 같은 와이파이에 있어야 합니다.
//         (localhost/127.0.0.1 은 아이폰 자신을 가리키므로 동작하지 않습니다 — LAN IP 필수.)
//
//  ▸ 배포: 그냥 두면 됩니다. 도메인이 바뀌면 아래 기본값만 교체하세요.
// ─────────────────────────────────────────────────────────────────────────────
const WEB_APP_URL =
  process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://lala-david.github.io/sowrd';

const THEME_BG = '#F4F1E8';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const [errored, setErrored] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // iOS WKWebView 안의 navigator.geolocation 은 "네이티브 앱"에 위치 권한이
  // 부여돼 있어야만 동작한다. 앱 시작 시 한 번 권한을 요청해 OS 팝업을 띄운다.
  // (팝업 문구는 app.json 의 NSLocationWhenInUseUsageDescription 를 사용)
  useEffect(() => {
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch {
        // 권한을 거부하거나 오류가 나도 앱은 계속 뜬다 — GPS 기능만 제한된다.
      }
    })();
  }, []);

  // 매일 아침 "오늘의 말씀" 로컬 알림을 예약한다(리텐션). 서버 없이 기기에서 매일 반복.
  // 권한을 거부하면 조용히 넘어간다 — 알림은 부가 기능이다.
  useEffect(() => {
    scheduleDailyVerse(8, 0);
  }, []);

  // 안드로이드 하드웨어 뒤로가기 → 웹 히스토리 뒤로가기.
  // (iOS 는 아래 WebView 의 allowsBackForwardNavigationGestures 로 스와이프 뒤로가기 처리)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const onNavStateChange = useCallback((nav: WebViewNavigation) => {
    canGoBackRef.current = nav.canGoBack;
  }, []);

  const reload = useCallback(() => {
    setErrored(false);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {errored ? (
        <View style={styles.center}>
          <Text style={styles.errTitle}>불러오지 못했습니다</Text>
          <Text style={styles.errBody}>
            같은 와이파이인지, 개발 서버(npm run dev -- --host)가 켜져 있는지,{'\n'}
            App.tsx 의 WEB_APP_URL 주소가 맞는지 확인하세요.
          </Text>
          <Text style={styles.errUrl}>{WEB_APP_URL}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: WEB_APP_URL }}
          style={styles.webview}
          // ── 웹 앱이 제대로 동작하기 위한 핵심 설정 ──
          javaScriptEnabled
          domStorageEnabled // localStorage / zustand persist
          geolocationEnabled // navigator.geolocation (Android)
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          // ── 최소 UX ──
          pullToRefreshEnabled // iOS: 당겨서 새로고침
          allowsBackForwardNavigationGestures // iOS: 가장자리 스와이프로 뒤로가기
          onNavigationStateChange={onNavStateChange}
          // ── 로딩 / 에러 ──
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#1A1A1A" />
            </View>
          )}
          onError={() => setErrored(true)}
          onHttpError={() => setErrored(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_BG },
  webview: { flex: 1, backgroundColor: THEME_BG },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: THEME_BG,
  },
  errTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  errBody: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 },
  errUrl: { fontSize: 13, color: '#888', marginTop: 12, marginBottom: 20 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
  },
  retryText: { color: '#F4F1E8', fontSize: 15, fontWeight: '600' },
});
