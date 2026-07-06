import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

export const CalendarScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const events = useAppStore((state) => state.events);
  const userToken = useAppStore((state) => state.userToken);

  useEffect(() => {
    if (!events || events.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -15, duration: 1000, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    }
  }, [events]);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'Tüm Gün';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>Takvim</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Gününüzün akışı burada.
        </Text>
      </View>

      {!userToken ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <MaterialCommunityIcons name="google" size={80} color={theme.colors.primary} />
          </Animated.View>
          <Text variant="titleMedium" style={{ textAlign: 'center', marginTop: 16 }}>
            Google Takvim'i görüntülemek için giriş yapın.
          </Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <MaterialCommunityIcons name="calendar-clock" size={100} color={theme.colors.primary} />
          </Animated.View>
          <Text variant="titleMedium" style={{ textAlign: 'center', marginTop: 16 }}>
            Bugün için planlanmış bir etkinlik bulunmuyor.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
          {events.map((event) => (
            <Card key={event.id} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <View style={styles.cardContent}>
                <View style={styles.timeLine}>
                  <Text style={[styles.timeText, { color: theme.colors.primary }]}>{formatTime(event.start)}</Text>
                  <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant, fontSize: 10 }]}>{formatTime(event.end)}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.text }}>{event.summary}</Text>
                  {event.location ? (
                    <View style={styles.locationRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                        {event.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontWeight: '900',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  timeLine: {
    width: 60,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    paddingRight: 12,
    marginRight: 12,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  }
});
