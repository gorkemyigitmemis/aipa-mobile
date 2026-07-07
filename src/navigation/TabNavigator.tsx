import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { View, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/DashboardScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FocusModeScreen } from '../screens/FocusModeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MapScreen } from '../screens/MapScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Gündelik') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Takvim') {
            iconName = focused ? 'calendar-month' : 'calendar-month-outline';
          } else if (route.name === 'Sohbet') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Odaklanma') {
            iconName = focused ? 'bullseye-arrow' : 'bullseye';
          } else if (route.name === 'Cüzdan') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Harita') {
            iconName = focused ? 'map-marker' : 'map-marker-outline';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 12 : 6,
            }}>
              <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />
              {focused && (
                <View style={{
                  position: 'absolute',
                  bottom: -10,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.colors.primary,
                }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.glassBackground || theme.colors.surface,
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16),
          left: 20,
          right: 20,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          borderRadius: 24,
          height: 64,
          borderTopWidth: 1,
          borderTopColor: theme.colors.glassBorder || 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.glassBorder || 'transparent',
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Gündelik" component={DashboardScreen} />
      <Tab.Screen name="Takvim" component={CalendarScreen} />
      <Tab.Screen name="Harita" component={MapScreen} />
      <Tab.Screen name="Sohbet" component={ChatScreen} />
      <Tab.Screen name="Odaklanma" component={FocusModeScreen} />
      <Tab.Screen name="Cüzdan" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
