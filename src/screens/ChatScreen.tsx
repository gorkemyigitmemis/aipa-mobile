import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Animated, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendMessageToGemini, initChatSession } from '../services/GeminiService';
import { startGeofencing } from '../services/LocationService';
import { useAppStore } from '../store/useAppStore';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string;
}

export const ChatScreen = () => {
  const theme = useTheme() as any;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const clearChatMessages = useAppStore((state) => state.clearChatMessages);

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{uri: string, base64: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(true);

  useEffect(() => {
    // Sohbet açıldığında animasyonlu giriş
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Sohbet açıldığında güncel hava durumunu çek
    useAppStore.getState().fetchWeather();
    
    // Gemini'yi güncel tasklarla başlat
    initChatSession();

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillHideListener.remove();
      keyboardWillShowListener.remove();
    };
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64
      });
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' && !selectedImage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userText = inputText || 'Şu görsele bakarak analiz et.';
    const imagePayload = selectedImage;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText, // Show only text if they typed something
      isUser: true,
      imageUri: imagePayload?.uri
    };

    addChatMessage(userMessage);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    let aiResponseText = await sendMessageToGemini(userText, imagePayload?.base64);
    
    // Geofencing Parsing
    const geoMatch = aiResponseText.match(/\|\|GEO:(.*?)\|\|/);
    if (geoMatch && geoMatch[1]) {
      try {
        const geoData = JSON.parse(geoMatch[1]);
        if (geoData.lat && geoData.lon) {
          startGeofencing(geoData.lat, geoData.lon, 100, geoData.message || 'Konum hatırlatıcısı tetiklendi!');
        }
      } catch (e) {
        console.error('Geo Parse Error:', e);
      }
      aiResponseText = aiResponseText.replace(/\|\|GEO:.*?\|\|/g, '').trim();
    }

    if (isTTSActive && aiResponseText) {
      Speech.stop();
      Speech.speak(aiResponseText, { language: 'tr-TR' });
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      isUser: false,
    };

    addChatMessage(aiMessage);
    setIsLoading(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.text }]}>Sohbet</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton 
            icon="delete-sweep" 
            iconColor={theme.colors.error}
            size={24}
            onPress={clearChatMessages}
          />
          <IconButton 
            icon={isTTSActive ? "volume-high" : "volume-off"} 
            iconColor={isTTSActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
            size={24}
            onPress={() => {
              if (isTTSActive) Speech.stop();
              setIsTTSActive(!isTTSActive);
            }}
          />
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}        
        contentContainerStyle={{ 
          padding: 16, 
          paddingBottom: isKeyboardVisible ? 20 : 120 
        }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {chatMessages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : [styles.aiBubble, { backgroundColor: theme.colors.glassBackground, borderColor: theme.colors.glassBorder }],
                msg.isUser ? { backgroundColor: theme.colors.primary } : {}
              ]}
            >
              {msg.imageUri && (
                <Image source={{ uri: msg.imageUri }} style={styles.messageImage} />
              )}
              {msg.text !== '' && (
                <Text style={{ 
                  color: msg.isUser ? theme.colors.onPrimary : theme.colors.text,
                  fontSize: 15,
                  lineHeight: 22,
                  marginTop: msg.imageUri ? 8 : 0
                }}>
                  {msg.text}
                </Text>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.colors.glassBackground, borderColor: theme.colors.glassBorder, width: 80 }]}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Yazıyor...</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Input Area - Glassmorphism */}
      <View style={[styles.inputContainerWrapper, { 
        backgroundColor: theme.colors.glassBackground,
        borderTopColor: theme.colors.glassBorder,
        paddingBottom: Math.max(insets.bottom, 16) + (isKeyboardVisible ? 0 : 80)
      }]}>
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <IconButton
            icon="paperclip"
            iconColor={theme.colors.primary}
            size={24}
            onPress={pickImage}
            style={{ margin: 0, marginRight: 4 }}
          />
          <TextInput
            mode="outlined"
            placeholder="AIPA'ya bir şey sor..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={inputText}
            onChangeText={setInputText}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            outlineStyle={{ borderRadius: 24, borderColor: theme.colors.glassBorder }}
            textColor={theme.colors.text}
            onSubmitEditing={handleSend}
          />
          {isLoading ? (
             <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginHorizontal: 12 }} />
          ) : (
            <IconButton
              icon="send"
              mode="contained"
              containerColor={theme.colors.primary}
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImage)}
              style={styles.sendButton}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontWeight: '800',
    marginLeft: 12,
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  inputContainerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 0,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  selectedImageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  selectedImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  }
});
