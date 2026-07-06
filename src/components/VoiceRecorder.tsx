import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

export const VoiceRecorder = () => {
  const theme = useTheme() as any;
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }
  }, [isRecording]);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2]
  });
  
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0]
  });

  const startRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      } else {
        alert('Mikrofon izni verilmedi!');
      }
    } catch (err) {
      console.error('Kayıt başlatılamadı:', err);
    }
  };

  const stopRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!recording) return;

    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Ses kaydı başarıyla tamamlandı. Dosya URI:', uri);
      
      setRecording(null);
      useAppStore.getState().fetchDailyBriefing();
    } catch (err) {
      console.error('Kayıt durdurulamadı:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordBox}>
        {isRecording && (
          <Animated.View style={[styles.ripple, { 
            borderColor: theme.colors.error,
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity
          }]} />
        )}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={[
              styles.recordButton,
              { backgroundColor: isRecording ? theme.colors.error : theme.colors.primary },
              isRecording && { shadowColor: theme.colors.error }
            ]}
          >
            <MaterialCommunityIcons 
              name={isRecording ? "microphone" : "microphone-outline"} 
              size={36} 
              color={theme.colors.onPrimary} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Text style={[
        styles.statusText, 
        { color: isRecording ? theme.colors.error : theme.colors.text }
      ]}>
        {isRecording ? "Sizi Dinliyor..." : "Basılı Tutun ve Konuşun"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusText: {
    marginTop: 16,
    fontWeight: '600',
    fontSize: 14,
  }
});
