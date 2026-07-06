import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCard } from '../components/TaskCard';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAppStore } from '../store/useAppStore';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const ONBOARDING_TIPS = [
  { id: '1', icon: 'microphone', text: 'Gününüzü planlamak için mikrofona basılı tutup asistanınıza hedeflerinizi anlatın.' },
  { id: '2', icon: 'bullseye-arrow', text: 'Odak modunu açarak sadece acil ve önemli görevlerinizi listeleyin.' },
  { id: '3', icon: 'calendar-check', text: 'Asistanınız notlarınızı otomatik olarak analiz edip takviminize ekler.' },
];

export const DashboardScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  
  const isFocusModeEnabled = useAppStore((state) => state.isFocusModeEnabled);
  const tasks = useAppStore((state) => state.tasks);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const fetchDailyBriefing = useAppStore((state) => state.fetchDailyBriefing);
  const confettiTick = useAppStore((state) => state.confettiTick);
  
  const userToken = useAppStore((state) => state.userToken);
  const setUserToken = useAppStore((state) => state.setUserToken);
  const startDataPolling = useAppStore((state) => state.startDataPolling);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setUserToken(authentication.accessToken);
        startDataPolling();
      }
    }
  }, [response]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cannonRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    fetchDailyBriefing();
  }, []);

  useEffect(() => {
    if (confettiTick > 0 && cannonRef.current) {
      cannonRef.current.start();
    }
  }, [confettiTick]);

  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, tasks]);

  const displayData = isFocusModeEnabled 
    ? tasks.filter(item => item.urgencyScore >= 8)
    : tasks;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Günlük Özet</Text>
            <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          {!userToken ? (
            <Button 
              mode="contained-tonal" 
              icon="google" 
              onPress={() => promptAsync()}
              disabled={!request}
              style={{ borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}
              labelStyle={{ fontSize: 12, color: theme.colors.onPrimary }}
            >
              Mailleri Bağla
            </Button>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="gmail" size={32} color={theme.colors.onPrimary} />
              <Text style={{ fontSize: 10, color: theme.colors.onPrimary, fontWeight: 'bold' }}>Bağlı</Text>
            </View>
          )}
        </View>

        {isFocusModeEnabled && (
          <View style={[styles.focusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons name="bullseye-arrow" size={16} color={theme.colors.onPrimary} />
            <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', marginLeft: 6 }}>
              Odak Modu Aktif
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Onboarding Tips (Hap Bilgiler) */}
      <View style={styles.tipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScroll}>
          {ONBOARDING_TIPS.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <View style={[styles.tipIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <MaterialCommunityIcons name={tip.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>{tip.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Sesli Not Butonu (Bas-Konuş) */}
      <VoiceRecorder />

      {/* Görevler Listesi */}
      <View style={styles.taskListHeader}>
        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
          {isFocusModeEnabled ? "Öncelikli Görevler" : "Tüm Görevler"}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
          {displayData.length} Görev
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>Yapay zeka asistanınız planınızı hazırlıyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginVertical: 16 }}>{error}</Text>
          <Button mode="contained" onPress={fetchDailyBriefing} buttonColor={theme.colors.primary}>Tekrar Dene</Button>
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="check-decagram" size={64} color={theme.colors.secondary} />
          <Text variant="titleMedium" style={{ marginTop: 16, fontWeight: 'bold' }}>Harika Gidiyorsun!</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            Şu an için planlanmış bir görevin yok. Yeni bir not eklemek için mikrofona dokun.
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          {displayData.map((task) => (
            <TaskCard 
              key={task.id}
              id={task.id}
              title={task.title}
              summary={task.summary}
              urgencyScore={task.urgencyScore}
            />
          ))}
        </Animated.View>
      )}

      {/* Konfeti fırlatıcı bileşen */}
      <ConfettiCannon
        ref={cannonRef}
        count={50}
        origin={{x: -10, y: 0}}
        autoStart={false}
        fadeOut={true}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    padding: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '900',
    marginBottom: 4,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsScroll: {
    paddingHorizontal: 16,
  },
  tipCard: {
    width: width * 0.7,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  centerState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  }
});
