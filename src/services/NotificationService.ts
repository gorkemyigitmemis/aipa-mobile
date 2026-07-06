import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const setupNotificationHandler = () => {
  // Dinamik Handler: urgency_score ve Focus Mode durumuna göre davranış değişir.
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data: any = notification.request.content.data;
      const urgencyScore = Number(data?.urgency_score || 0);
      
      // Zustand store'dan güncel Odak Modu durumunu al (React dışında)
      const isFocusModeActive = useAppStore.getState().isFocusModeEnabled;

      let shouldShowAlert = false;
      let shouldPlaySound = false;

      if (isFocusModeActive) {
        // Odak modunda sadece skoru tam 10 olanlar çalar/gösterilir
        if (urgencyScore === 10) {
          shouldShowAlert = true;
          shouldPlaySound = true;
        }
      } else {
        // Odak modu kapalıysa 8 ve üzeri skora sahip olanlar çalar/gösterilir
        if (urgencyScore >= 8) {
          shouldShowAlert = true;
          shouldPlaySound = true;
        }
      }

      return {
        shouldShowAlert,
        shouldPlaySound,
        shouldSetBadge: !shouldShowAlert, // Gösterilmiyorsa sadece arka planda rozet olarak bırak
        shouldShowBanner: shouldShowAlert,
        shouldShowList: shouldShowAlert,
      } as Notifications.NotificationBehavior;
    },
  });
};

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    // Android için özel ses kanalı oluşturma
    await Notifications.setNotificationChannelAsync('urgent-channel', {
      name: 'Urgent Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'urgent_alert.wav', // Özel ses dosyası assets içinden
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);

  return token;
};

export const triggerLocalNotificationMock = async (urgencyScore: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: urgencyScore >= 8 ? "Acil Bildirim!" : "Normal Bildirim",
      body: `Bu bir test bildirimidir. Urgency Score: ${urgencyScore}`,
      data: { urgency_score: urgencyScore },
      sound: urgencyScore >= 8 ? 'urgent_alert.wav' : 'default', // iOS için ses tanımı
    },
    trigger: null, // Hemen tetikle
  });
};

export const scheduleMorningBriefing = async () => {
  // Önce mevcut sabah bildirimlerini iptal et (Mükerrer olmaması için)
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduledNotifications) {
    if (notif.identifier === 'MORNING_BRIEFING') {
      return; // Zaten kurulu, tekrar kurmaya gerek yok
    }
  }

  // Her gün sabah 07:00'de tekrarlayacak şekilde ayarla
  await Notifications.scheduleNotificationAsync({
    identifier: 'MORNING_BRIEFING',
    content: {
      title: "Günaydın! 🌅",
      body: "Bugünkü günlük planına ve görevlerine göz atma vakti. Dokun ve güne harika başla!",
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    },
  });
  console.log("Sabah brifingi (07:00) başarıyla kuruldu.");
};
