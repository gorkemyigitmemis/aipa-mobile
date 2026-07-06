import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Avatar, Text, useTheme, Switch, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export const ProfileScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const tasks = useAppStore((state) => state.tasks);
  const completedTasks = useAppStore((state) => state.completedTasks);

  const totalPending = tasks.length;
  const totalCompleted = completedTasks.length;

  const chartData = [
    {
      name: 'Tamamlandı',
      population: totalCompleted,
      color: theme.colors.success || '#22c55e',
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Bekliyor',
      population: totalPending,
      color: theme.colors.error || '#ef4444',
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <View style={[styles.avatarContainer, { shadowColor: theme.colors.primaryDark }]}>
          <Avatar.Icon size={100} icon="account" style={{ backgroundColor: theme.colors.surface }} color={theme.colors.primary} />
        </View>
        <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onPrimary }]}>Kullanıcı</Text>
        <Text variant="bodyLarge" style={[styles.email, { color: 'rgba(255,255,255,0.8)' }]}>AIPA Akıllı Asistan</Text>
      </LinearGradient>

      <View style={styles.content}>
        
        {/* Üretkenlik Grafiği */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1, padding: 16, marginBottom: 20 }]}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16, color: theme.colors.text }}>Haftalık Üretkenlik</Text>
          {(totalPending === 0 && totalCompleted === 0) ? (
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginVertical: 20 }}>Henüz hiç görev verisi yok.</Text>
          ) : (
            <PieChart
              data={chartData}
              width={width - 80}
              height={140}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[0, 0]}
              absolute
            />
          )}
        </View>

        {/* Ayarlar */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
          <View style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.text }}>Gece Modu</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Göz yormayan karanlık tema</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} color={theme.colors.primary} />
          </View>
          
          <Divider style={{ backgroundColor: theme.colors.outline }} />
          
          <View style={styles.settingRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.text }}>Uygulama Sürümü</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Versiyon 1.0.0 (BETA)</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    alignItems: 'center',
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    padding: 24,
    marginTop: -30,
  },
  avatarContainer: {
    marginBottom: 16,
    marginTop: 20,
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderRadius: 50,
  },
  name: {
    fontWeight: '900',
    marginBottom: 4,
  },
  email: {
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  }
});
