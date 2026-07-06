import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync, setupNotificationHandler, scheduleMorningBriefing } from './src/services/NotificationService';
import { startGeofencing } from './src/services/LocationService';
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
    
    // Konum izni iste ve geofencing arka plan görevini başlat
    startGeofencing();

    // Sabah bildirimini kur
    scheduleMorningBriefing();
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
