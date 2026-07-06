<p align="center">
  <img src="https://img.icons8.com/color/150/000000/bot.png" width="100" />
</p>

<h1 align="center">AIPA Mobile (AI Personal Assistant) 🚀</h1>

<p align="center">
  <b>Sıfır Sunucu Maliyeti (Zero-Backend) ile Geleceğin Proaktif İş Zekası Asistanı</b><br/>
  Uygulamanız kapalı olsa bile maillerinizi okuyan, takviminizi takip eden, sizi anlayan ve sizinle konuşan kişisel yapay zekanız.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

---

## 🌟 Neden AIPA?
AIPA (Artificial Intelligence Personal Assistant), sadece manuel olarak not girdiğiniz sıradan bir To-Do (Yapılacaklar) uygulaması değildir. AIPA, **Google Ekosistemi (Gmail & Calendar)** ile tamamen senkronize çalışan, konumunuzu algılayan, faturalarınızı ve belgelerinizi görsel olarak okuyabilen "Proaktif" bir yaşam asistanıdır.

## ✨ Öne Çıkan Özellikler

- **🧠 Multimodal Yapay Zeka (Vision AI):** Google Gemini 1.5 Flash modeli ile entegredir. Fiş, fatura veya toplantı notu gibi görselleri yüklediğinizde görseli okur, anlar ve size cevap verir.
- **📧 Akıllı Mail Okuyucu:** Güvenli Google Login (OAuth2) sayesinde okunmamış maillerinizi arka planda okur, aciliyet puanı (Urgency Score) belirler ve direkt olarak görev (Task) kartına dönüştürür.
- **📍 Geofencing (Konum Bazlı Algı):** "İşe varınca bana toplantıyı hatırlat" dediğinizde, sistem arka planda GPS konumunuzu dinler ve hedefe ulaştığınız an Push Notification (Bildirim) gönderir.
- **🗣️ Sesli Etkileşim (TTS & STT):** Text-to-Speech motoru ile yapay zeka cevaplarını size yüksek sesle okur. İnsansı bir deneyim yaşatır.
- **🌅 Günlük Sabah Brifingi:** Her sabah saat 07:00'de otomatik olarak uyanır ve o günkü takviminizi size bildirim olarak özetler.
- **💾 Veri Kalıcılığı (Local-First):** Görevleriniz ve chat geçmişiniz telefonunuzun yerel `AsyncStorage` belleğinde tutulur. İnternet ve sunucu bekleme süresi yoktur, her şey anında yüklenir.
- **💎 Glassmorphism Arayüz:** Modern "buzlu cam" tasarım dili, karanlık mod desteği ve pürüzsüz animasyonlar ile Premium bir UX/UI deneyimi.

## 🛠️ Teknik Mimari (Tech Stack)
AIPA, maliyetli ve hantal veritabanı (MySQL, Firebase vb.) barındırmaz. **"Zero-Backend"** prensibi ile çalışır.
- **Framework:** React Native & Expo (SDK 54)
- **Dil:** TypeScript
- **State Management:** Zustand (In-Memory Caching & Persist Middleware)
- **AI Engine:** `@google/generative-ai` (Gemini 1.5 Flash)
- **Native APIs:** Expo Location, Notifications, Speech, Image Picker, Haptics
- **Auth:** Expo Auth Session (Google OAuth 2.0)

---

## 🚀 Kurulum (Nasıl Çalıştırılır?)

Bu projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/KULLANICI_ADINIZ/aipa-mobile.git
cd aipa-mobile
```

### 2. Gerekli Paketleri Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini (Environment Variables) Ayarlayın
Proje kök dizinindeki `.env.example` dosyasının adını `.env` olarak değiştirin ve içine kendi API anahtarlarınızı girin:
```env
EXPO_PUBLIC_GEMINI_API_KEY=senin_gemini_api_anahtarin
EXPO_PUBLIC_GOOGLE_CLIENT_ID=senin_google_oauth_client_id_anahtarin
```

### 4. Uygulamayı Başlatın
```bash
npx expo start
```
Açılan menüden `i` tuşuna basarak iOS simülatöründe, `a` tuşuna basarak Android emülatöründe veya QR kodu okutarak Expo Go üzerinden kendi telefonunuzda anında deneyimleyebilirsiniz.

---

## 🔒 Güvenlik Notu
Bu projede kullanıcı gizliliği en üst safhadadır. E-postalarınız veya takviminiz hiçbir şekilde üçüncü parti bir sunucuya kaydedilmez. Tüm veriler Google'ın API'lerinden doğrudan sizin telefonunuza (Local) aktarılır ve cihazınızda işlenir. 

*Bu proje, yapay zekanın mobil platformlarda neler yapabileceğini göstermek amacıyla geliştirilmiştir.*
