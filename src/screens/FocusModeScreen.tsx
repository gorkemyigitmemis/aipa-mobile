import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const FocusModeScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  
  const isFocusModeEnabled = useAppStore((state) => state.isFocusModeEnabled);
  const toggleFocusMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useAppStore.getState().toggleFocusMode();
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocusModeEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();

      Animated.loop(
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim.setValue(0);
    }
  }, [isFocusModeEnabled]);

  const ringRotation = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>Odak Modu</Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sadece acil ve önemli görevlere odaklanın. Dikkatinizi dağıtan her şeyi gizleyin.
        </Text>
      </View>

      <View style={styles.centerContainer}>
        {isFocusModeEnabled && (
          <Animated.View 
            style={[
              styles.glowRing, 
              { 
                borderColor: theme.colors.error,
                transform: [{ scale: pulseAnim }, { rotate: ringRotation }],
                opacity: 0.3
              }
            ]} 
          />
        )}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleFocusMode}
            style={[
              styles.giantButton, 
              { 
                backgroundColor: isFocusModeEnabled ? theme.colors.error : theme.colors.surface,
                shadowColor: isFocusModeEnabled ? theme.colors.error : theme.colors.outline,
                borderColor: theme.colors.outline,
                borderWidth: isFocusModeEnabled ? 0 : 1,
              }
            ]}
          >
            <MaterialCommunityIcons 
              name={isFocusModeEnabled ? "bullseye" : "bullseye-arrow"} 
              size={90} 
              color={isFocusModeEnabled ? "#fff" : theme.colors.primary} 
            />
            <Text style={[styles.buttonText, { color: isFocusModeEnabled ? theme.colors.onPrimary : theme.colors.text }]}>
              {isFocusModeEnabled ? 'AKTİF' : 'KAPALI'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: width * 0.7 + 40,
    height: width * 0.7 + 40,
    borderRadius: (width * 0.7 + 40) / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  giantButton: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 1,
  }
});
