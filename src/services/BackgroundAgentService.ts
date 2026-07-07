import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store/useAppStore';
import { sendMessageToGemini } from './GeminiService';

const BACKGROUND_AGENT_TASK = 'BACKGROUND_AGENT_TASK';

TaskManager.defineTask(BACKGROUND_AGENT_TASK, async () => {
  try {
    const state = useAppStore.getState();
    const { lastChatTimestamp, tasks, emails, weatherInfo, geofences, userPreferences } = state;
    const now = Date.now();

    // 1. RPM Kontrolü (Son 15 dakika içinde konuşulduysa ajanı çalıştırma)
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    if (now - lastChatTimestamp < FIFTEEN_MINUTES) {
      console.log('Background Agent: Kullanıcı zaten aktif, RPM kotası korunuyor.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('Background Agent: Uyanış ve analiz başlıyor...');

    // 2. Yapay Zeka Arka Plan Analizi
    const prompt = `GİZLİ SİSTEM KONTROLÜ: Bu bir arka plan ajanı isteğidir. Kullanıcı şu an uygulamada aktif değil.
Lütfen güncel görevlere, hava durumuna, okunmamış maillere ve saatin ilerleyişine bak.
Eğer kullanıcıyı ACİL olarak uyarman veya hatırlatman gereken BİR ŞEY VARSA (Örneğin 1 saate yağmur yağacak şemsiyesini alsın, faturanın son günü yaklaştı veya acil bir mail geldi), bana doğrudan kullanıcının kilit ekranına düşecek şekilde KISA, SAMİMİ ve DİREKT bir bildirim metni yaz. (Örn: "Kanka yarım saate yağmur bastıracak, çıkıyorsan şemsiyeni al!")
Eğer uyarmaya değer ACİL bir durum yoksa, LÜTFEN SADECE "YOK" yazarak cevap ver. Başka hiçbir şey yazma.`;

    const response = await sendMessageToGemini(prompt, undefined, tasks, emails, weatherInfo, geofences, null, userPreferences);

    const cleanResponse = response.trim();
    
    // 3. Karar ve Bildirim
    if (cleanResponse && cleanResponse.toUpperCase() !== 'YOK' && !cleanResponse.toUpperCase().includes('YOK.')) {
      console.log('Background Agent: Uyarı fırlatılıyor ->', cleanResponse);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aisistan Uyarıyor 🤖',
          body: cleanResponse,
          sound: true,
        },
        trigger: null, // Hemen gönder
      });
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log('Background Agent: Her şey yolunda, acil durum yok.');
    return BackgroundFetch.BackgroundFetchResult.NoData;

  } catch (error) {
    console.error('Background Agent Hatası:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Uygulama açılışında görevi kaydetmek için çağrılacak
export async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_AGENT_TASK, {
      minimumInterval: 15 * 60, // 15 dakikada bir kontrol (İşletim sistemi limitlerine tabidir)
      stopOnTerminate: false, // Uygulama tamamen kapatılsa bile çalışmaya devam etmeye çalış (Android)
      startOnBoot: true, // Telefon yeniden başlarsa ajan da başlasın (Android)
    });
    console.log('Proactive Agent (Arka Plan) başarıyla sisteme kaydedildi.');
  } catch (err) {
    console.log('Proactive Agent kaydedilemedi:', err);
  }
}

// Opsiyonel: Ajanı durdurmak için
export async function unregisterBackgroundFetchAsync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_AGENT_TASK);
    console.log('Proactive Agent durduruldu.');
  } catch (err) {
    console.log('Proactive Agent durdurulamadı:', err);
  }
}
