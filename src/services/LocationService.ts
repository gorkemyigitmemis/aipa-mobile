import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { triggerLocalNotificationMock } from './NotificationService';

const GEOFENCING_TASK = 'GEOFENCING_TASK';

// Arka plan görevi tanımı (Task manager component/hook dışında tanımlanmalıdır)
TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }: any) => {
  try {
    if (error) {
      console.error('Geofencing Task Error:', error.message);
      return;
    }
    
    if (data) {
      const { eventType, region } = data as any;
      
      // ENTER durumu: Bölgeye giriş yapıldığında
      if (eventType === Location.GeofencingEventType.Enter) {
        console.log("Hedef konuma giriş yapıldı (Arka plan)!", region);
        
        let notifyMessage = "Belirlediğiniz hedefe ulaştınız!";
        if (region && region.identifier && region.identifier.startsWith('GEO_')) {
          try {
            notifyMessage = decodeURIComponent(region.identifier.replace('GEO_', ''));
          } catch(e) {}
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "📍 Aisistan",
            body: notifyMessage,
            sound: true,
          },
          trigger: null,
        });
      }
    }
  } catch (e) {
    console.error("Geofence Fatal Error caught to prevent crash:", e);
  }
});

export const startGeofencing = async (lat: number = 41.0082, lon: number = 28.9784, radius: number = 100, message: string = 'Hedef konuma ulaştınız.') => {
  try {
    // 1. Önce ön plan (Foreground) izni al
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return;
    }

    // 2. Arka plan (Background) izni al (Güvenli bir şekilde)
    try {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.log('Background location permission denied. Falling back to foreground watcher only.');
      }
    } catch (bgError) {
      console.log('Background permission request skipped (Expo Go limitation).');
    }

    // 3. Geofencing izleme işlemini başlat (Expo Go çökmemesi için try-catch eklendi)
    await Location.startGeofencingAsync(GEOFENCING_TASK, [
      {
        identifier: 'GEO_' + encodeURIComponent(message),
        latitude: lat,
        longitude: lon,
        radius: radius,
        notifyOnEnter: true,
        notifyOnExit: false,
      }
    ]);
    console.log(`Geofencing başarıyla başlatıldı: Lat ${lat}, Lon ${lon}. Message: ${message}`);
  } catch (err: any) {
    console.log('Geofencing başlatılamadı (Expo Go kısıtlaması olabilir):', err.message);
  }
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

let watchSubscription: Location.LocationSubscription | null = null;

export const startForegroundLocationWatch = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Foreground location denied');
      return;
    }

    if (watchSubscription) {
      watchSubscription.remove();
    }

    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 saniyede bir
        distanceInterval: 10, // 10 metrede bir
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        
        // Dynamically import useAppStore to avoid circular dependencies
        const store = await import('../store/useAppStore');
        const state = store.useAppStore.getState();
        const { geofences, tasks, completeTask } = state;

        for (const fence of geofences) {
          const distance = getDistance(latitude, longitude, fence.latitude, fence.longitude);
          
          // Eğer alanın içindeysek
          if (distance <= fence.radius) {
            // Bu alana ait BİTMEMİŞ görevleri bul
            const matchingTasks = tasks.filter((t: any) => t.locationId === fence.id);
            
            for (const task of matchingTasks) {
              console.log(`Geofence Tetiklendi: ${fence.title} -> Görev: ${task.title}`);
              
              // Bildirim At
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `📍 Konum Görevi: ${fence.title}`,
                  body: `${task.title}\n${task.summary}`,
                  sound: true,
                },
                trigger: null, // Hemen göster
              });

              // Görevi tamamlandı olarak işaretle ki sürekli bildirim atmasın
              completeTask(task.id);
            }
          }
        }
      }
    );
    console.log('Canlı konum takibi başlatıldı (Foreground).');
  } catch (error) {
    console.error('Konum takibi başlatılamadı:', error);
  }
};
