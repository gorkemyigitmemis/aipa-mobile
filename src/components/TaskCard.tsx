import React, { useRef, useEffect } from 'react';
import { Text, useTheme, Button } from 'react-native-paper';
import { StyleSheet, View, Animated, PanResponder, Dimensions } from 'react-native';
import { addEventToCalendar } from '../services/CalendarService';
import { triggerLocalNotificationMock } from '../services/NotificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

interface TaskCardProps {
  id: string;
  title: string;
  summary: string;
  urgencyScore: number;
}

const SWIPE_THRESHOLD = 100;
const { width } = Dimensions.get('window');

export const TaskCard: React.FC<TaskCardProps> = ({ id, title, summary, urgencyScore }) => {
  const theme = useTheme() as any;
  const completeTask = useAppStore((state) => state.completeTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const height = useRef(new Animated.Value(140)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (urgencyScore >= 80) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [urgencyScore]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.timing(pan, { toValue: { x: width, y: 0 }, duration: 250, useNativeDriver: false }).start(() => {
            Animated.timing(height, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => completeTask(id));
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Animated.timing(pan, { toValue: { x: -width, y: 0 }, duration: 250, useNativeDriver: false }).start(() => {
            Animated.timing(height, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => deleteTask(id));
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const handleAddToCalendar = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    addEventToCalendar(title, startDate, endDate);
  };

  const handleTestNotification = () => {
    triggerLocalNotificationMock(urgencyScore);
  };

  const backgroundColor = pan.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [theme.colors.error, theme.colors.surfaceVariant, theme.colors.success || '#22c55e'],
    extrapolate: 'clamp',
  });

  const getPriorityColor = () => {
    if (urgencyScore >= 80) return theme.colors.error;
    if (urgencyScore >= 50) return theme.colors.warning || '#FFB020';
    return theme.colors.secondary;
  };

  return (
    <Animated.View style={[styles.cardWrapper, { height, opacity, backgroundColor }]}>
      <Text style={styles.actionTextLeft}>TAMAMLA</Text>
      <Text style={styles.actionTextRight}>SİL</Text>

      <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX: pan.x }] }}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor() }]} />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="titleMedium" style={[styles.title, { color: '#000' }]} numberOfLines={1}>
                {title || 'İsimsiz Görev'}
              </Text>
              <Animated.View style={[
                styles.badge, 
                { backgroundColor: getPriorityColor() + '20' },
                urgencyScore >= 80 && { transform: [{ scale: pulseAnim }] }
              ]}>
                <Text style={[styles.badgeText, { color: getPriorityColor() }]}>
                  {urgencyScore || 0}/100
                </Text>
              </Animated.View>
            </View>

            <Text variant="bodyMedium" style={{ color: '#000', marginBottom: 16 }} numberOfLines={2}>
              {summary || 'Bu görevin detayları bulunamadı.'}
            </Text>
              
            <View style={styles.actionsRow}>
              <Button mode="text" icon="calendar-clock" compact labelStyle={[styles.actionButtonText, { color: theme.colors.primary }]} onPress={handleAddToCalendar}>
                Takvim
              </Button>
              <Button icon="bell-ring" mode="text" onPress={handleTestNotification} compact labelStyle={styles.actionButtonText}>
                Test
              </Button>
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  actionTextLeft: { color: '#fff', fontWeight: '900', position: 'absolute', left: 20, fontSize: 16 },
  actionTextRight: { color: '#fff', fontWeight: '900', position: 'absolute', right: 20, fontSize: 16 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priorityStrip: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
    fontSize: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
