import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, setupNotificationHandler, scheduleMorningBriefing } from './src/services/NotificationService';
import { startForegroundLocationWatch } from './src/services/LocationService';
import { registerBackgroundFetchAsync } from './src/services/BackgroundAgentService';
import { useAppStore } from './src/store/useAppStore';
import { lightTheme, darkTheme } from './src/theme/theme';

// Handler'ı başlat (Uygulama arka planda/kapalıyken de dinleyebilmesi için dışarıda çağrılır)
setupNotificationHandler();

export default function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Uygulama açıldığında bildirim izni iste ve token al
    registerForPushNotificationsAsync();
    
    // Ön plan konum takibini başlat (Geofencing simülasyonu)
    startForegroundLocationWatch();

    // Sabah bildirimini kur
    scheduleMorningBriefing();

    // Arka Plan Ajanını Kaydet
    registerBackgroundFetchAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme as any}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor="transparent" translucent />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
