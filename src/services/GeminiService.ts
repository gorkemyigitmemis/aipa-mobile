import { GoogleGenerativeAI } from '@google/generative-ai';

// API Anahtarı (.env dosyasından okunur)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

import { useAppStore } from '../store/useAppStore';

let chatSession: any = null;

export const initChatSession = () => {
  // Kullanıcının güncel görevlerini, maillerini ve hava durumunu çek
  const { tasks, emails, weatherInfo } = useAppStore.getState();
  
  const taskListText = tasks.length > 0 
    ? tasks.map(t => `- ${t.title} (Aciliyet: ${t.urgencyScore}): ${t.summary}`).join('\n')
    : 'Şu an bekleyen hiçbir görev yok, gün bomboş!';

  const emailsText = emails.length > 0
    ? emails.map(e => `KİMDEN: ${e.sender} | KONU: ${e.subject}\nİÇERİK: ${e.body}`).join('\n\n')
    : 'Yeni mail yok.';

  const systemInstruction = `Sen AIPA adında, Türkçeyi mükemmel konuşan, motive edici, yardımsever ve proaktif bir kişisel yapay zeka asistanısın. Kullanıcının günlük planlarını yapar, ona tavsiyeler verirsin. Kısa, net ve samimi cevaplar ver. 
  
ŞU ANKİ HAVA DURUMU:
${weatherInfo || 'Hava durumu verisi alınamadı.'}

İşte kullanıcının güncel GÖREVLERİ:
${taskListText}

İşte kullanıcının OKUNMAMIŞ MAİLLERİ:
${emailsText}

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

Eğer kullanıcı sana işleriyle veya günüyle alakalı bir şey sorarsa görevleri, mailleri ve hava durumunu baz alarak çok zekice tavsiyeler ver. Seni "kanka" gibi samimi bir üslupla kullanabilir, sen de ona göre samimi ama saygılı ve yardımsever ol.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    systemInstruction: systemInstruction,
  });

  chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Merhaba, sen kimsin?" }],
      },
      {
        role: "model",
        parts: [{ text: "Merhaba! Ben AIPA, senin kişisel yapay zeka asistanınım. Bugün sana nasıl yardımcı olabilirim?" }],
      },
    ],
  });
};

export const sendMessageToGemini = async (message: string, imageBase64?: string): Promise<string> => {
  try {
    if (!chatSession) {
      initChatSession();
    }
    
    let parts: any[] = [{ text: message }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      });
    }

    const result = await chatSession.sendMessage(parts);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error('Gemini API Hatası:', error);
    return 'Şu an servise ulaşılamıyor, lütfen API anahtarını kontrol edip tekrar dene.';
  }
};

export const summarizeAndScoreEmail = async (sender: string, subject: string, body: string) => {
  try {
    const aiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction: 'Sen bir asistan olarak gelen e-postaları analiz eden ve görev çıkaran bir yapay zekasın. SADECE JSON formatında çıktı vermelisin.',
    });

    const prompt = `Aşağıdaki e-postayı oku ve görev listesinde gösterilmek üzere kısa bir başlık (title), açıklayıcı bir özet (summary) ve 1 ile 100 arasında bir aciliyet puanı (urgencyScore) belirle.
Çıktı formatı ŞU ŞEKİLDE OLMALIDIR (saf JSON):
{"title": "Görev Başlığı", "summary": "Kısa özet...", "urgencyScore": 85}

KİMDEN: ${sender}
KONU: ${subject}
İÇERİK: ${body}`;

    const result = await aiModel.generateContent(prompt);
    const text = result.response.text();
    
    // JSON ayıklama (bazen markdown ile dönebilir: ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
