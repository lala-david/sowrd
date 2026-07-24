import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/* 로컬 "오늘의 말씀" 알림 — 리텐션 평가의 핵심 공백을 메운다.
 *
 * 웹 PWA는 앱이 닫혀 있을 때 알림을 스스로 띄우지 못한다(푸시 서버가 있어야 함).
 * 네이티브 셸은 expo-notifications로 **기기 로컬**에서 매일 정해진 시각에 알림을 예약할 수 있다 —
 * 서버 없이. 이게 유일한 D1 훅(오늘의 말씀)을 "사용자가 스스로 열어야" → "능동 배달"로 승격한다.
 *
 * 프라이버시: 알림 본문에 개인 데이터·좌표·기도 대상은 넣지 않는다. 그저 돌아올 이유만 준다. */

// 앱이 포그라운드일 때도 배너를 보여준다(조용히, 소리·뱃지 없이).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'daily-verse';

/** 매일 hour:minute(기기 로컬 시각)에 "오늘의 말씀" 알림을 예약한다.
 *  이미 예약돼 있던 것은 지우고 다시 건다(중복 방지). 권한이 없으면 조용히 false. */
export async function scheduleDailyVerse(hour = 8, minute = 0): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted || current.status === 'granted';
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted || req.status === 'granted';
    }
    if (!granted) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: '오늘의 말씀',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // 매일 하나만 걸려 있게 — 예전 예약을 비우고 새로 건다.
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'THE WAY',
        body: '오늘의 말씀이 길 위에서 기다립니다.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}),
      },
    });
    return true;
  } catch {
    // 알림은 부가 기능 — 실패해도 앱은 정상 동작한다.
    return false;
  }
}
