import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { summarizeAndScoreEmail } from '../services/GeminiService';
import * as Notifications from 'expo-notifications';

export interface Task {
  id: string;
  title: string;
  summary: string;
  urgencyScore: number;
  completedAt?: Date;
  locationId?: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  isRead: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string;
}

export interface Geofence {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  title: string;
  description: string;
}

interface AppState {
  isFocusModeEnabled: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (enabled: boolean) => void;
  
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  confettiTick: number;

  tasks: Task[];
  completedTasks: Task[];
  emails: Email[];
  events: CalendarEvent[];
  weatherInfo: string | null;

  userToken: string | null;
  userInfo: any | null;
  setUserToken: (token: string | null) => void;
  setUserInfo: (info: any | null) => void;

  isLoading: boolean;
  error: string | null;
  fetchDailyBriefing: () => Promise<void>;
  fetchWeather: () => Promise<void>;
  fetchRealEmails: () => Promise<void>;
  fetchRealEvents: () => Promise<void>;
  startDataPolling: () => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTask: (task: Task) => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatMessages: () => void;

  geofences: Geofence[];
  addGeofence: (fence: Geofence) => void;
  removeGeofence: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  isFocusModeEnabled: false,
  toggleFocusMode: () => set((state) => ({ isFocusModeEnabled: !state.isFocusModeEnabled })),
  setFocusMode: (enabled) => set({ isFocusModeEnabled: enabled }),

  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  confettiTick: 0,

  tasks: [
    {
      id: '1',
      title: 'Q3 Finans Raporu',
      summary: 'Yönetim kuruluna sunulmak üzere 3. çeyrek finansal analiz raporunun hazırlanması ve slaytlara dökülmesi.',
      urgencyScore: 90
    },
    {
      id: '2',
      title: 'Tasarım Ekibi Toplantısı',
      summary: 'Yeni mobil uygulamanın UI/UX revizyonları için tasarım ekibiyle haftalık sprint değerlendirmesi.',
      urgencyScore: 60
    },
    {
      id: '3',
      title: 'Müşteri Geri Bildirimleri',
      summary: 'Geçen hafta yayınlanan özellik hakkında gelen müşteri biletlerinin (ticket) incelenmesi ve önceliklendirilmesi.',
      urgencyScore: 40
    },
    {
      id: '4',
      title: 'Sunucu Bakımı',
      summary: 'Veritabanı sunucularında planlı index optimizasyonu ve yedekleme kontrolü.',
      urgencyScore: 85
    },
    {
      id: '5',
      title: 'Spora Git',
      summary: 'Akşam 19:00 - Göğüs & Arka Kol antrenmanı yapılacak. Salona gidilecek.',
      urgencyScore: 50
    }
  ],
  emails: [
    {
      id: '1',
      sender: 'patron@sirket.com',
      subject: 'ACİL: Sunum Dosyaları Hakkında',
      body: 'Merhaba, yarına hazırlaman gereken Q3 sunum dosyalarında bazı eksikler var. Lütfen bugün mesai bitmeden bana ilet. Bu çok kritik.',
      isRead: false
    },
    {
      id: '2',
      sender: 'fatura@elektrik.com.tr',
      subject: 'Fatura Ödeme Hatırlatması',
      body: 'Değerli müşterimiz, 1.450 TL tutarındaki faturanızın son ödeme tarihi yarına kadardır. Gecikme zammı yememek için lütfen ödeyiniz.',
      isRead: false
    },
    {
      id: '3',
      sender: 'trendyol@siparis.com',
      subject: 'Siparişin Yola Çıktı!',
      body: 'Protein tozu ve antrenman eldiveni siparişin kargoya verildi. Tahmini teslimat yarın.',
      isRead: false
    }
  ],
  events: [],
  completedTasks: [],
  weatherInfo: null,
  
  userToken: null,
  userInfo: null,
  setUserToken: (token) => set({ userToken: token }),
  setUserInfo: (info) => set({ userInfo: info }),

  isLoading: false,
  error: null,
  
  completeTask: (id) => {
    const task = get().tasks.find((t: Task) => t.id === id);
    if (task) {
      set((state) => ({
        tasks: state.tasks.filter((t: Task) => t.id !== id),
        completedTasks: [task, ...state.completedTasks],
        confettiTick: state.confettiTick + 1
      }));
    }
  },

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t: Task) => t.id !== id)
  })),

  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),

  chatMessages: [
    { id: '1', text: 'Merhaba! Ben AIPA, senin kişisel yapay zeka asistanınım. Bugün sana nasıl yardımcı olabilirim?', isUser: false }
  ],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChatMessages: () => set({ chatMessages: [] }),

  geofences: [
    {
      id: 'g1',
      latitude: 41.0082,
      longitude: 28.9784,
      radius: 100,
      title: 'Ofis',
      description: 'Ofise varınca günlük brifingi oku.'
    },
    {
      id: 'g2',
      latitude: 40.9900,
      longitude: 29.0200,
      radius: 150,
      title: 'Market',
      description: 'Markete girince süt ve yumurta al.'
    }
  ],
  addGeofence: (fence) => set((state) => ({ geofences: [...state.geofences, fence] })),
  removeGeofence: (id) => set((state) => ({ geofences: state.geofences.filter(g => g.id !== id) })),

  fetchDailyBriefing: async () => {
    set({ isLoading: true, error: null });
    try {
      // Yapay zeka asistanının planı hazırlamasını simüle ediyoruz (Local-First mimari)
      await new Promise(resolve => setTimeout(resolve, 1200));
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: 'Görevler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
    }
  },

  fetchWeather: async () => {
    try {
      // İstanbul / Kağıthane koordinatları (Yaklaşık: Lat 41.08, Lon 28.97)
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.0858&longitude=28.9784&current_weather=true');
      const data = await res.json();
      if (data && data.current_weather) {
        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;
        const weatherCode = data.current_weather.weathercode;
        // Basit bir hava durumu tanımı
        let condition = 'Açık / Parçalı Bulutlu';
        if (weatherCode >= 51 && weatherCode <= 67) condition = 'Yağmurlu 🌧️';
        if (weatherCode >= 71 && weatherCode <= 77) condition = 'Karlı ❄️';
        if (weatherCode >= 95) condition = 'Fırtınalı ⚡';
        
        const weatherStr = `İstanbul/Kağıthane Anlık Hava: ${temp}°C, ${condition}, Rüzgar: ${wind} km/s`;
        set({ weatherInfo: weatherStr });
      }
    } catch (error) {
      console.error('Hava durumu çekilemedi:', error);
    }
  },

  fetchRealEmails: async () => {
    const { userToken, emails, tasks } = get();
    if (!userToken) return;

    try {
      // Get the latest 3 messages to avoid overwhelming the API in polling
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=3', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = await response.json();
      
      if (!data.messages) {
        return;
      }

      const realEmails: Email[] = [];
      let newEmailsDetected = false;
      const newTasks = [...tasks];

      for (const msg of data.messages) {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        const msgData = await msgRes.json();
        
        // Headers parsing
        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Konu Yok';
        const sender = headers.find((h: any) => h.name === 'From')?.value || 'Bilinmeyen Gönderici';
        const snippet = msgData.snippet || 'İçerik yok.';

        realEmails.push({
          id: msgData.id,
          sender,
          subject,
          body: snippet,
          isRead: !msgData.labelIds?.includes('UNREAD')
        });

        // Check if this is a NEW email (not currently in state)
        const isNew = !emails.find((e: Email) => e.id === msgData.id);
        
        // Sadece okunmamış ve yeni olan mailler için görev oluştur!
        if (isNew && msgData.labelIds?.includes('UNREAD')) {
          newEmailsDetected = true;
          
          // Yapay zekaya gönder ve özet al
          const aiSummary = await summarizeAndScoreEmail(sender, subject, snippet);
          if (aiSummary) {
            // Task listesine ekle
            const newTask: Task = {
              id: msgData.id,
              title: aiSummary.title,
              summary: aiSummary.summary,
              urgencyScore: aiSummary.urgencyScore
            };
            newTasks.unshift(newTask); // En başa ekle

            // Bildirim gönder
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '📧 Yeni Mail Görevi!',
                body: `${aiSummary.title} (Aciliyet: ${aiSummary.urgencyScore})`,
                data: { taskId: msgData.id },
              },
              trigger: null, // Hemen göster
            });
          }
        }
      }

      if (newEmailsDetected) {
        set({ emails: realEmails, tasks: newTasks });
      } else {
        set({ emails: realEmails });
      }

    } catch (error) {
      console.error('Mailler çekilirken hata:', error);
    }
  },

  fetchRealEvents: async () => {
    const { userToken } = get();
    if (!userToken) return;

    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = await response.json();

      if (data.items) {
        const calendarEvents: CalendarEvent[] = data.items.map((item: any) => ({
          id: item.id,
          summary: item.summary || 'Başlıksız Etkinlik',
          description: item.description || '',
          start: item.start?.dateTime || item.start?.date || '',
          end: item.end?.dateTime || item.end?.date || '',
          location: item.location || '',
        }));
        set({ events: calendarEvents });
      }
    } catch (error) {
      console.error('Takvim etkinlikleri çekilirken hata:', error);
    }
  },

  startDataPolling: () => {
    // İlk çalıştırmada hemen çek
    get().fetchRealEmails();
    get().fetchRealEvents();
    
    // Her 30 saniyede bir kontrol et
    setInterval(() => {
      get().fetchRealEmails();
      get().fetchRealEvents();
    }, 30000);
  }
    }),
    {
      name: 'aipa-storage-v5',
      storage: createJSONStorage(() => AsyncStorage),
      // İsteğe bağlı: Hangi verilerin diske yazılacağını seçebilirsiniz. 
      // (Emails ve Events gibi API'den her açılışta güncel çekilen verileri persist etmemek daha iyidir)
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        tasks: state.tasks,
        completedTasks: state.completedTasks,
        userToken: state.userToken,
        userInfo: state.userInfo,
        chatMessages: state.chatMessages,
        geofences: state.geofences,
      }),
    }
  )
);
