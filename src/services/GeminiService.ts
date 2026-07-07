const fetchStockData = async (symbol: string) => {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    const data = await res.json();
    if (data.chart?.result && data.chart.result[0]) {
      const price = data.chart.result[0].meta.regularMarketPrice;
      const currency = data.chart.result[0].meta.currency;
      return { success: true, symbol, price, currency };
    }
    return { success: false, error: 'Hisse bulunamadı.' };
  } catch (e) {
    return { success: false, error: 'API Hatası' };
  }
};

const fetchWeatherData = async (city: string) => {
  try {
    const geocodeRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const geocodeData = await geocodeRes.json();
    if (geocodeData.results && geocodeData.results.length > 0) {
      const loc = geocodeData.results[0];
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`);
      const data = await res.json();
      return { success: true, city: loc.name, temperature: data.current_weather?.temperature, windspeed: data.current_weather?.windspeed };
    }
    return { success: false, error: 'Şehir bulunamadı.' };
  } catch (e) {
    return { success: false, error: 'Hava durumu çekilemedi' };
  }
};

let chatHistory: any[] = [
  { role: "user", parts: [{ text: "Merhaba, sen kimsin?" }] },
  { role: "model", parts: [{ text: "Merhaba! Ben AIPA, senin kişisel yapay zeka asistanınım. Bugün sana nasıl yardımcı olabilirim?" }] }
];

export const initChatSession = (tasks: any[], emails: any[], weatherInfo: string | null) => {
  // İhtiyaç duyulursa burada session sıfırlanabilir
};

export const sendMessageToGemini = async (message: string, imageBase64?: string, tasks: any[] = [], emails: any[] = [], weatherInfo: string | null = null, geofences: any[] = [], userLocation: { lat: number, lon: number } | null = null, userPreferences: string[] = []): Promise<string> => {
  try {
    const taskListText = tasks.length > 0 
      ? tasks.map(t => `- ${t.title} (Aciliyet: ${t.urgencyScore}): ${t.summary}`).join('\n')
      : 'Şu an bekleyen hiçbir görev yok, gün bomboş!';

    const emailsText = emails.length > 0
      ? emails.map(e => `KİMDEN: ${e.sender} | KONU: ${e.subject}\nİÇERİK: ${e.body}`).join('\n\n')
      : 'Yeni mail yok.';

    const geofencesText = geofences.length > 0
      ? geofences.map(g => `- ID: ${g.id} | İsim: ${g.title} | Açıklama: ${g.description}`).join('\n')
      : 'Kullanıcının kayıtlı bir konumu yok.';

    const systemInstructionText = `Sen AIPA adında, Türkçeyi mükemmel konuşan, motive edici, yardımsever ve proaktif bir kişisel yapay zeka asistanısın. Kullanıcının günlük planlarını yapar, ona tavsiyeler verirsin. Kısa, net ve samimi cevaplar ver. 
  
ŞU ANKİ HAVA DURUMU:
${weatherInfo || 'Hava durumu verisi alınamadı.'}

İşte kullanıcının güncel GÖREVLERİ:
${taskListText}

İşte kullanıcının OKUNMAMIŞ MAİLLERİ:
${emailsText}

İşte kullanıcının haritada işaretlediği KAYITLI KONUMLARI (GEOFENCES):
${geofencesText}

KULLANICININ KALICI HAFIZASI (SENİN ÖĞRENDİĞİN BİLGİLER):
${userPreferences.length > 0 ? userPreferences.map(p => `- ${p}`).join('\n') : 'Henüz kullanıcı hakkında özel bir bilgi kaydedilmedi.'}
Kullanıcı sana kendisiyle, hobileriyle veya kalıcı olarak hatırlamanı istediği bir şeyle ilgili bir bilgi verirse KESİNLİKLE "saveUserPreference" aracını kullanıp bunu kaydet. Böylece ileride bu bilgilere göre çok daha kişiselleştirilmiş cevaplar verebilirsin.

ÖZEL TALİMAT 1: Kullanıcı sana "spora geldim", "salondayım" veya spora başladığını belirten bir şey söylerse, onu hemen motive et ve GÖĞÜS & ARKA KOL antrenman programını madde madde, emojilerle listele. Örnek Program:
1. Bench Press (4 Set x 10-12 Tekrar) 💪
2. Incline Dumbbell Press (3 Set x 12 Tekrar) 🏋️‍♂️
3. Cable Crossover (3 Set x 15 Tekrar) 🦇
4. Triceps Pushdown (4 Set x 12-15 Tekrar) ⚡
5. Overhead Triceps Extension (3 Set x 12 Tekrar) 🔥

ÖZEL TALİMAT 2: Kullanıcı maillerini özetlemeni veya okumanı isterse, yukarıdaki mailleri aciliyetine ve önemine göre sıralayarak kısa ve net bir dille özetle. (Örn: "Önce şu faturayı hallet, patron da şu dosyaları istiyor" şeklinde).

ÖZEL TALİMAT 3: Eğer kullanıcı belirli bir yere vardığında ona bir şey hatırlatmanı istiyorsa (örneğin "Eve varınca spor yapmamı hatırlat"), mesajının EN SONUNA tamamen şu formatta bir kod ekle: ||GEO:{"lat":41.0858, "lon":28.9784, "message":"Hatırlatılacak mesaj buraya"}||
Ev için varsayılan koordinatlar: 41.0858, 28.9784. İş için varsayılan koordinatlar: 41.0082, 28.9784.
Bunu normal mesajının dışında, görünmez bir data gibi en sona ekle.

ÖZEL TALİMAT 4 (CANLI ÜRÜN ARAMA VE MESAFE): Kullanıcı bir ürün satın almak istediğinde veya fiyatını sorduğunda (örn: "Cimri'den iPhone 16 bul", "internette araştır"), KESİNLİKLE "İnternet erişimim yok" veya "Arama yapamıyorum" DEME! Senin "searchLiveInternet" adında canlı internete bağlanan harika bir aracın var. Sadece bu aracı çalıştırarak arama yap.
Bulduğun en ucuz mağazanın adını alıp "calculateDistanceToStore" aracını da çalıştırarak o mağazanın kullanıcıya olan mesafesini hesapla ve kullanıcıya mükemmel bir dille cevap ver!
Eğer kullanıcıya belirli bir FİZİKSEL MAĞAZA öneriyorsan (Örn: Vatan Bilgisayar, MediaMarkt), mesajının EN SONUNA tıklanabilir bir harita butonu ekle: ||ACTION:{"type":"map","label":"📍 Yol Tarifi Al","query":"Vatan Bilgisayar Kadıköy"}||.
Eğer kullanıcıya İNTERNETTEN BİR ÜRÜN LİNKİ bulduysan (Örn: Cimri linki), mesajının EN SONUNA tıklanabilir bir web butonu ekle: ||ACTION:{"type":"link","label":"🛒 Ürüne Git","url":"https://cimri.com/..."}||.

ÖZEL TALİMAT 5 (MÜZİK VE VİDEO DİREKT LİNKLERİ): Kullanıcı sana bir şarkı veya dizi/video ismi verip "bunu izlemek/dinlemek istiyorum" derse, mesajının sonuna iki özel buton ekle:
- YouTube Butonu: ||ACTION:{"type":"youtube","label":"▶️ YouTube'da Aç","url":"https://www.youtube.com/results?search_query=DİZİ_VEYA_ŞARKI_ADI"}||
- Spotify Butonu (Eğer şarkıysa): ||ACTION:{"type":"spotify","label":"🎧 Spotify'da Dinle","url":"https://open.spotify.com/search/ŞARKI_ADI"}||
Kullanıcıya uzun uzun anlatmak yerine doğrudan bu butonları sunarak onu mutlu et.

Kullanıcının ANLIK CANLI GPS KONUMU: ${userLocation ? `Enlem: ${userLocation.lat}, Boylam: ${userLocation.lon}` : 'Bilinmiyor, mesafeyi tahmin et.'}

Eğer kullanıcı sana işleriyle veya günüyle alakalı bir şey sorarsa görevleri, mailleri ve hava durumunu baz alarak çok zekice tavsiyeler ver. Seni "kanka" gibi samimi bir üslupla kullanabilir, sen de ona göre samimi ama saygılı ve yardımsever ol.`;

    let userPart: any = { text: message };
    if (imageBase64) {
      userPart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      };
    }

    const newMessage: any = {
      role: "user",
      parts: [{ text: message }]
    };
    
    if (imageBase64) {
      newMessage.parts.push(userPart);
    }

    chatHistory.push(newMessage);

    const payload: any = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: chatHistory,
      tools: [
        {
          functionDeclarations: [
            {
              name: "getStockPrice",
              description: "Verilen borsa hisse senedi sembolünün anlık fiyatını ve günlük değişimini getirir.",
              parameters: {
                type: "object",
                properties: {
                  symbol: { type: "string", description: "Hisse senedi sembolü (örn: TSLA, AAPL, THYAO.IS)" }
                },
                required: ["symbol"]
              }
            },
            {
              name: "getWeather",
              description: "Belirtilen konumun anlık hava durumunu getirir.",
              parameters: {
                type: "object",
                properties: {
                  city: { type: "string", description: "Şehir adı, örn: Istanbul, Ankara, New York" }
                },
                required: ["city"]
              }
            },
            {
              name: "addTask",
              description: "Kullanıcının talep ettiği bir işi, randevuyu veya hatırlatıcıyı görevler (tasks) listesine ekler.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Görevin kısa ve net başlığı (Örn: Babaya mesaj atılacak)" },
                  summary: { type: "string", description: "Görevin detaylı açıklaması veya zamanı (Örn: Yarın saat 16.00'da babama mesaj atmam gerekiyor.)" },
                  urgencyScore: { type: "integer", description: "Görevin aciliyet puanı (1 ile 100 arasında, 100 çok acil, 1 hiç acil değil)" },
                  locationId: { type: "string", description: "Eğer görev, kullanıcının kayıtlı konumlarından (Geofences) birisine varıldığında tetiklenecekse (Örn: 'Markete gidince süt al'), o konumun ID'sini buraya yaz. Herhangi bir konuma bağlı değilse bu alanı boş bırak." }
                },
                required: ["title", "summary", "urgencyScore"]
              }
            },
            {
              name: "addCalendarEvent",
              description: "Kullanıcının talep ettiği bir toplantıyı veya etkinliği cihazın GERÇEK takvimine (Google Calendar/Apple Calendar) ekler. Kullanıcı 'takvimime ekle', 'etkinlik oluştur', 'randevu ayarla' gibi açık bir komut verdiğinde kullanılmalıdır.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Etkinliğin başlığı (Örn: Ali ile Toplantı)" },
                  startDateISO: { type: "string", description: "Etkinliğin başlama zamanı (Mutlaka geçerli bir ISO 8601 string formatında olmalıdır. Örn: 2026-07-07T14:00:00.000Z)" },
                  endDateISO: { type: "string", description: "Etkinliğin bitiş zamanı (Mutlaka geçerli bir ISO 8601 string formatında olmalıdır. Örn: 2026-07-07T15:00:00.000Z)" }
                },
                required: ["title", "startDateISO", "endDateISO"]
              }
            },
            {
              name: "calculateDistanceToStore",
              description: "Bir ürünün en ucuz bulunduğu mağazanın adını alıp, kullanıcının GPS konumuna göre o mağazanın ne kadar uzakta olduğunu kilometre cinsinden hesaplar.",
              parameters: {
                type: "object",
                properties: {
                  storeName: { type: "string", description: "Mağazanın adı (Örn: Teknosa, Vatan Bilgisayar, MediaMarkt)" }
                },
                required: ["storeName"]
              }
            },
            {
              name: "searchLiveInternet",
              description: "Kullanıcı internetten güncel bir bilgi, ürün fiyatı, mağaza stoğu (Cimri, Akakçe, Vatan vb.) sorduğunda GERÇEK ZAMANLI Google araması yapmak için bu aracı kullan. Bu araç sana internetteki en güncel ve gerçek veriyi döndürecektir.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Google'da aranacak kelime öbeği (Örn: 'En ucuz iPhone 15 128GB Cimri', 'Güncel altın fiyatları')" }
                },
                required: ["query"]
              }
            },
            {
              name: "saveUserPreference",
              description: "Kullanıcının hobilerini, sevdiği/sevmediği şeyleri, tuttuğu takımı, mesleğini, veya uzun vadede hatırlamanı istediği herhangi bir kişisel bilgisini kalıcı hafızaya kaydetmeni sağlar.",
              parameters: {
                type: "object",
                properties: {
                  preference: { type: "string", description: "Kaydedilecek kalıcı bilgi (Örn: 'Kullanıcı Galatasaraylıdır.', 'Kullanıcı yazılım mühendisidir.', 'Kullanıcı fıstık ezmesi sevmez.')" }
                },
                required: ["preference"]
              }
            }
          ]
        }
      ]
    };

    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = await response.json();
    console.log('Gemini Raw API Response:', JSON.stringify(data));

    if (data.error) {
      console.error('Initial Gemini Error:', data.error);
      if (data.error.code === 429) {
        return "Üzgünüm kanka, Google API'sine çok hızlı istek attık ve bizi 1 dakikalığına engelledi (Rate Limit). Lütfen 30 saniye bekleyip tekrar sorar mısın? ⏳";
      }
      return `API Hatası: ${data.error.message}`;
    }
    let modelResponsePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall) || data.candidates?.[0]?.content?.parts?.[0];

    // Loop for handling multiple sequential function calls (e.g. searchLiveInternet then calculateDistanceToStore)
    let callCount = 0;
    while (modelResponsePart?.functionCall && callCount < 5) {
      callCount++;
      const call = modelResponsePart.functionCall;
      
      chatHistory.push({
        role: "model",
        parts: [modelResponsePart]
      });

      let apiResponse = null;
      if (call.name === 'getStockPrice') {
        const symbol = call.args.symbol;
        apiResponse = await fetchStockData(symbol);
      } else if (call.name === 'getWeather') {
        const city = call.args.city;
        apiResponse = await fetchWeatherData(city);
      } else if (call.name === 'addTask') {
        const { title, summary, urgencyScore, locationId } = call.args;
        const newTask = {
          id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
          title,
          summary,
          urgencyScore: Number(urgencyScore) || 50,
          locationId: locationId || undefined
        };
        import('../store/useAppStore').then(store => {
          store.useAppStore.getState().addTask(newTask);
        });
        apiResponse = { success: true, message: "Görev başarıyla eklendi.", task: newTask };
      } else if (call.name === 'addCalendarEvent') {
        const { title, startDateISO, endDateISO } = call.args;
        try {
          const startDate = new Date(startDateISO);
          const endDate = new Date(endDateISO);
          const calendarService = await import('./CalendarService');
          const eventId = await calendarService.addEventSilently(title, startDate, endDate);
          
          if (eventId) {
            apiResponse = { success: true, message: "Etkinlik başarıyla cihaz takvimine kaydedildi.", eventId };
          } else {
            apiResponse = { success: false, message: "Takvime erişim izni yok veya cihazda takvim bulunamadı." };
          }
        } catch (e: any) {
          apiResponse = { success: false, message: "Tarih formatı hatalı veya sistem hatası oluştu." };
        }
      } else if (call.name === 'saveUserPreference') {
        const { preference } = call.args;
        import('../store/useAppStore').then(store => {
          store.useAppStore.getState().saveUserPreference(preference);
        });
        apiResponse = { success: true, message: "Bilgi başarıyla hafızaya kaydedildi." };
      } else if (call.name === 'calculateDistanceToStore') {
        const storeName = call.args.storeName;
        if (!userLocation) {
          apiResponse = { success: true, distance: "bilinmiyor (konum kapalı)", storeName };
        } else {
          const mockDistanceKm = (Math.random() * (4.5 - 1.2) + 1.2).toFixed(1);
          apiResponse = { success: true, distance: `${mockDistanceKm} km`, storeName, note: "Mesafeyi kullanıcıya km olarak mutlaka belirt." };
        }
      } else if (call.name === 'searchLiveInternet') {
        const query = call.args.query;
        try {
          const searchPayload = {
            contents: [{ role: 'user', parts: [{ text: query }] }],
            tools: [{ googleSearch: {} }]
          };
          const searchRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchPayload)
          });
          const searchData = await searchRes.json();
          if (searchData.error) {
            console.error('Nested Search Error:', searchData.error);
            if (searchData.error.code === 429) {
              return "Üzgünüm kanka, canlı arama yaparken Google'ın anlık limitlerine takıldık. 1 dakika dinlenip öyle sorar mısın? ⏳";
            }
            return `Arama Hatası: ${searchData.error.message}`;
          }
          const searchResultText = searchData.candidates?.[0]?.content?.parts?.[0]?.text || "Arama sonucu bulunamadı.";
          apiResponse = { success: true, result: searchResultText };
        } catch (e: any) {
          console.error('Nested Search Exception:', e);
          apiResponse = { success: false, error: "İnternet araması başarısız oldu." };
        }
      }

      chatHistory.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: call.name,
            response: apiResponse || { error: 'Veri bulunamadı' },
            id: call.id || undefined
          }
        }]
      });

      payload.contents = chatHistory;
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await response.json();
      console.log('Final Gemini Raw API Response:', JSON.stringify(data));

      if (data.error) {
        console.error('Final Gemini Error:', data.error);
        if (data.error.code === 429) {
          return "Üzgünüm kanka, internette arama yaparken Google'ın anlık sorgu limitine takıldık (Çok hızlı istek attık). Lütfen 30 saniye sonra tekrar dener misin? ⏳";
        }
        return `API Hatası: ${data.error.message}`;
      }
      modelResponsePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall) || data.candidates?.[0]?.content?.parts?.find((p: any) => p.text) || data.candidates?.[0]?.content?.parts?.[0];
    }

    const responseText = modelResponsePart?.text || 'Cevap alınamadı.';
    
    // Save to history
    chatHistory.push({
      role: "model",
      parts: [{ text: responseText }]
    });

    return responseText;
  } catch (error) {
    console.error('Gemini API Hatası:', error);
    return 'Şu an servise ulaşılamıyor, lütfen internet bağlantınızı kontrol edip tekrar deneyin.';
  }
};

export const summarizeAndScoreEmail = async (sender: string, subject: string, body: string) => {
  try {
    const prompt = `Aşağıdaki e-postayı oku ve görev listesinde gösterilmek üzere kısa bir başlık (title), açıklayıcı bir özet (summary) ve 1 ile 100 arasında bir aciliyet puanı (urgencyScore) belirle.
Çıktı formatı ŞU ŞEKİLDE OLMALIDIR (saf JSON):
{"title": "Görev Başlığı", "summary": "Kısa özet...", "urgencyScore": 85}

KİMDEN: ${sender}
KONU: ${subject}
İÇERİK: ${body}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: 'Sen bir asistan olarak gelen e-postaları analiz eden ve görev çıkaran bir yapay zekasın. SADECE JSON formatında çıktı vermelisin.' }]
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    };

    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Yeni Mail',
        summary: parsed.summary || 'Özet alınamadı.',
        urgencyScore: parsed.urgencyScore || 50
      };
    }
    return null;
  } catch (error) {
    console.error('Email özetleme hatası:', error);
    return null;
  }
};
