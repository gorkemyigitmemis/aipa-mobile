import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

export const addEventToCalendar = async (title: string, startDate: Date, endDate: Date) => {
  try {
    const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
    const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();

    if (calendarStatus === 'granted' && remindersStatus === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Default takvimi bulma
      const defaultCalendar = Platform.OS === 'ios'
        ? calendars.find(cal => cal.source && cal.source.name === 'Default') || calendars[0]
        : calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Hata', 'Cihazda uygun bir takvim bulunamadı.');
        return;
      }

      // 1 hafta (10080 dakika) ve 1 gün (1440 dakika) öncesi
      const alarms = [
        { relativeOffset: -10080, method: Calendar.AlarmMethod.ALERT },
        { relativeOffset: -1440, method: Calendar.AlarmMethod.ALERT }
      ];

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: title,
        startDate: startDate,
        endDate: endDate,
        timeZone: 'Europe/Istanbul',
        alarms: alarms, // Hatırlatıcılar ekleniyor
      });

      Alert.alert('Başarılı', 'Etkinlik takviminize kaydedildi (1 Hafta ve 1 Gün alarmlı).');
      return eventId;
    } else {
      Alert.alert('İzin Hatası', 'Takvim izni verilmediği için etkinlik eklenemiyor.');
    }
  } catch (error) {
    console.error('Takvime ekleme hatası:', error);
    Alert.alert('Hata', 'Etkinlik eklenirken bir sorun oluştu.');
  }
};

export const addEventSilently = async (title: string, startDate: Date, endDate: Date) => {
  try {
    const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
    
    if (calendarStatus === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = Platform.OS === 'ios'
        ? calendars.find(cal => cal.source && cal.source.name === 'Default') || calendars[0]
        : calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        console.error('Cihazda uygun bir takvim bulunamadı.');
        return null;
      }

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: title,
        startDate: startDate,
        endDate: endDate,
        timeZone: 'Europe/Istanbul',
      });

      console.log('Etkinlik takvime başarıyla eklendi (Sessiz):', eventId);
      return eventId;
    } else {
      console.error('Takvim izni verilmediği için etkinlik eklenemiyor.');
      return null;
    }
  } catch (error) {
    console.error('Takvime sessiz ekleme hatası:', error);
    return null;
  }
};
