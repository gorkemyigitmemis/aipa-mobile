import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import MapView, { Marker, Circle } from 'react-native-maps';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

export const MapScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  const geofences = useAppStore((state) => state.geofences);
  const addGeofence = useAppStore((state) => state.addGeofence);
  const removeGeofence = useAppStore((state) => state.removeGeofence);

  const [isModalVisible, setModalVisible] = useState(false);
  const [draftCoordinate, setDraftCoordinate] = useState<{ latitude: number, longitude: number } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(25);

  const initialRegion = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleLongPress = (e: any) => {
    setDraftCoordinate(e.nativeEvent.coordinate);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (draftCoordinate && title.trim() !== '') {
      addGeofence({
        id: 'geo_' + Date.now().toString(),
        latitude: draftCoordinate.latitude,
        longitude: draftCoordinate.longitude,
        radius,
        title,
        description
      });
      setModalVisible(false);
      setTitle('');
      setDescription('');
      setRadius(25);
      setDraftCoordinate(null);
    }
  };

  const handleMarkerPress = (fenceId: string, fenceTitle: string) => {
    Alert.alert(
      'Konumu Sil',
      `"${fenceTitle}" isimli konumu silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => removeGeofence(fenceId) 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          Konum Görevleri
        </Text>
        <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Fiziksel alanlara bağlı hatırlatıcılar
        </Text>
      </LinearGradient>

      <View style={styles.mapContainer}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onLongPress={handleLongPress}
          >
            {geofences.map((fence) => (
              <React.Fragment key={fence.id}>
                <Marker
                  coordinate={{ latitude: fence.latitude, longitude: fence.longitude }}
                  title={fence.title}
                  description="Silmek için dokun"
                  onPress={() => handleMarkerPress(fence.id, fence.title)}
                />
                <Circle
                  center={{ latitude: fence.latitude, longitude: fence.longitude }}
                  radius={fence.radius}
                  fillColor={theme.colors.primary + '30'} // 30% opacity
                  strokeColor={theme.colors.primary}
                  strokeWidth={2}
                />
              </React.Fragment>
            ))}
          </MapView>
        ) : (
          <View style={[styles.errorContainer, { backgroundColor: '#e5e7eb' }]}>
            <MaterialCommunityIcons name="map" size={80} color={theme.colors.primary} style={{ opacity: 0.5 }} />
            <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40 }}>
              Harita motoru yükleniyor...
            </Text>
          </View>
        )}

        {/* Glassmorphism Overlay Info */}
        <View style={[styles.overlayBox, { backgroundColor: theme.colors.surface + 'e0' }]}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>📍 Geofence Ekle</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Haritada herhangi bir yere uzun basılı tutarak o konumu "Market", "Ofis" gibi isimlerle kaydedebilirsin.
          </Text>
        </View>

        {/* Geofence Oluşturma Modalı */}
        <Portal>
          <Modal visible={isModalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 16 }}>Yeni Konum İşaretle</Text>
            
            <TextInput
              label="Konum Adı (Örn: Market)"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            
            <TextInput
              label="Açıklama (İsteğe Bağlı)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={{ marginBottom: 16 }}
            />

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Etki Alanı (Yarıçap)</Text>
                <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>{radius}m</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={10}
                maximumValue={500}
                step={10}
                value={radius}
                onValueChange={(val) => setRadius(val)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.onSurfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>10m</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>500m</Text>
              </View>
            </View>

            <Button mode="contained" onPress={handleSave} disabled={title.trim() === ''} style={{ borderRadius: 12 }}>
              Kaydet
            </Button>
          </Modal>
        </Portal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    padding: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontWeight: '900',
    marginBottom: 4,
  },
  mapContainer: {
    flex: 1,
    marginTop: -24, // Slip under header
  },
  map: {
    width: width,
    height: height,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBox: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    elevation: 10,
  },
  radiusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C63FF',
  }
});
