import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { triggerLocalNotificationMock } from './NotificationService';

const GEOFENCING_TASK = 'GEOFENCING_TASK';

// Arka plan görevi tanımı (Task manager component/hook dışında tanımlanmalıdır)
TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Geofencing Task Error:', error.message);
    return;
  }
  
  if (data) {
    const { eventType, region } = data as any;
    
    // ENTER durumu: Bölgeye giriş yapıldığında
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log("Hedef konuma giriş yapıldı!", region);
      triggerLocalNotificationMock(9);
    }
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

    // 2. Arka plan (Background) izni al
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.log('Background location permission denied');
      return;
    }

    // 3. Geofencing izleme işlemini başlat
    await Location.startGeofencingAsync(GEOFENCING_TASK, [
      {
        identifier: 'DynamicLocation_' + Date.now().toString(),
        latitude: lat,
        longitude: lon,
        radius: radius,
        notifyOnEnter: true,
        notifyOnExit: false,
      }
    ]);
    console.log(`Geofencing başarıyla başlatıldı: Lat ${lat}, Lon ${lon}. Message: ${message}`);
  } catch (err) {
    console.error('Geofencing başlatılamadı:', err);
  }
};
