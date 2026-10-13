import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing json and handling base64 audio
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Pad surah/ayah number to 3 digits (e.g., 2 -> "002")
function padZero(num: number): string {
  return String(num).padStart(3, '0');
}

// Generate EveryAyah URL for a given reciter, surah, and ayah
function getAyahAudioUrl(surah: number, ayah: number, reciter = 'Alafasy_128kbps'): string {
  return `https://everyayah.com/data/${reciter}/${padZero(surah)}${padZero(ayah)}.mp3`;
}

// API: Analyze User Distress / Voice Recording & Provide Quranic Guidance
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, audioBase64, audioMimeType, category } = req.body;

    if (!text && !audioBase64) {
      return res.status(400).json({ error: 'يرجى تقديم تسجيل صوتي أو كتابة الهموم والفضفضة' });
    }

    const systemInstruction = `أنت مرشد نفسي واستشاري روحي مسلم خبير يجمع بين عمق علم النفس الحديث (العلاج المعرفي السلوكي، التعاطف الذاتي، احتواء المشاعر) وبين بلسم القرآن الكريم والشفاء الإيماني.
مهمتك الاستماع بإنصات ورحمة تامة للمستخدم الذي يشكو همومه وأحزانه، ثم تقديم:
1. تفريغ نصي دقيق لكلام المستخدم إن كان صوتاً، أو إدراجه إن كان نصاً.
2. تحليل نفسي متعاطف ورقيق يفكك مشاعره الباطنة والأنماط المعرفية الكامنة بلا لوم ولا تأنيب.
3. استخراج آيات قرآنية محددة بدقة بالغة (اسم السورة، رقم السورة 1-114، رقم الآية، نص الآية بالرسم المشكول، والتفسير والرسالة الخاصة لقلب السائل). يجب أن تكون أرقام السور والآيات صحيحة 100% في المصحف الشريف.
4. خطوات عملية ونفسية وسلوكية وتمارين تنفس أو تفريغ، مع أدعية نبوية مأثورة مناسبة للموقف.
5. كلمة مواساة ختامية دافئة تلامس الروح وتزرع السكينة واليقين بلطف الله وقربه.

كن دافئاً جداً، رفيقاً، مهدئاً للنفس، مقتدياً بقول الله: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ" وقوله: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ".`;

    const promptText = `هذه شكوى وبوح وفضفضة من إنسان مكروب أو مهموم.
${category ? `التصنيف المختار من السائل: ${category}` : ''}
${text ? `نص الشكوى المكتوب: "${text}"` : ''}
${audioBase64 ? 'يرجى الاستماع بدقة للتسجيل الصوتي المرفق، تفريغه بدقة وأمانة في حقل transcription، ثم تحليله نفسياً واستخراج الشفاء والحلول من القرآن الكريم.' : ''}

قم بإرجاع النتيجة بالتنسيق المطلوب باللغة العربية الفصحى الدافئة والمطمئنة.`;

    const parts: any[] = [];

    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: audioBase64,
        },
      });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: {
              type: Type.STRING,
              description: 'تفريغ ما قاله السائل بالصوت أو ملخص نص شكواه بدقة وأمانة',
            },
            emotionalAnalysis: {
              type: Type.OBJECT,
              properties: {
                primaryEmotion: {
                  type: Type.STRING,
                  description: 'الشعور الأساسي البارز (مثل: ضيق صدر، حزن دفين، قلق من المستقبل، شعور بالخذلان، إنهاك نفسي، جلد ذات)',
                },
                emotionIntensity: {
                  type: Type.INTEGER,
                  description: 'مستوى شدة الثقل النفسي المقدر من 1 إلى 100',
                },
                subconsciousDrivers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-4 جذور نفسية أو محركات كامنة للألم (مثل: التفكير المفرط، الرغبة في التحكم بالنتائج، الوحدة، إلخ)',
                },
                psychologicalInsight: {
                  type: Type.STRING,
                  description: 'تحليل نفسي عميق ورقيق يحتضن المشاعر ويوضح لماذا من الطبيعي أن يشعر بهذا دون أن يجلد نفسه',
                },
                cognitivePattern: {
                  type: Type.STRING,
                  description: 'النمط الذهني أو الفخ المعرفي الحاضر (مثل: التهويل، افتراض الأسوأ، لوم الذات، المقارنة)',
                },
              },
              required: ['primaryEmotion', 'emotionIntensity', 'subconsciousDrivers', 'psychologicalInsight'],
            },
            quranicGuidance: {
              type: Type.OBJECT,
              properties: {
                coreMessage: {
                  type: Type.STRING,
                  description: 'الرسالة الإلهية المحورية لهذا القلب المكلوم اليوم',
                },
                verses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      surahName: { type: Type.STRING, description: 'اسم السورة (مثل: سورة الضحى)' },
                      surahNumber: { type: Type.INTEGER, description: 'رقم السورة من 1 إلى 114' },
                      ayahNumber: { type: Type.INTEGER, description: 'رقم الآية الصحيح في السورة' },
                      ayahText: { type: Type.STRING, description: 'نص الآية الكريمة مشكولاً بالرسم القرآني' },
                      spiritualContext: { type: Type.STRING, description: 'سياق الآية ولماذا تبعث السكينة في هذا الموقف' },
                      heartMessage: { type: Type.STRING, description: 'كيف تخاطب هذه الآية جرح السائل تحديداً وتسكّنه' },
                      reflectionQuestion: { type: Type.STRING, description: 'سؤال تدبري هادئ للتفكر واليقين' },
                    },
                    required: ['surahName', 'surahNumber', 'ayahNumber', 'ayahText', 'spiritualContext', 'heartMessage'],
                  },
                  description: '2-3 آيات قرآنية مناسبة تماماً لحالة السائل مع أرقام دقيقة',
                },
                propheticDuaa: {
                  type: Type.OBJECT,
                  properties: {
                    duaaArabic: { type: Type.STRING, description: 'نص الدعاء النبوي المشكول والمناسب لتفريج هذا الهم' },
                    translationOrContext: { type: Type.STRING, description: 'فضل هذا الدعاء أو مناسبته النبوية' },
                    howToRecite: { type: Type.STRING, description: 'كيفية استحضار القلب عند الترديد' },
                  },
                  required: ['duaaArabic', 'translationOrContext', 'howToRecite'],
                },
                heartAffirmation: {
                  type: Type.STRING,
                  description: 'همسة سكينة وكلمة مواساة حنونة للقلب',
                },
              },
              required: ['coreMessage', 'verses', 'propheticDuaa', 'heartAffirmation'],
            },
            practicalRemedies: {
              type: Type.OBJECT,
              properties: {
                psychologicalExercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: 'عنوان التمرين' },
                      description: { type: Type.STRING, description: 'خطوات التمرين النفسي أو الجسدي لتهدئة الجهاز العصبي' },
                    },
                    required: ['title', 'description'],
                  },
                },
                spiritualSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      action: { type: Type.STRING, description: 'الخطوة الإيمانية العملية' },
                      benefit: { type: Type.STRING, description: 'أثرها في تفريج الكرب وانشراح الصدر' },
                    },
                    required: ['action', 'benefit'],
                  },
                },
              },
              required: ['psychologicalExercises', 'spiritualSteps'],
            },
          },
          required: ['transcription', 'emotionalAnalysis', 'quranicGuidance', 'practicalRemedies'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Enrich verses with reliable audio recitation URLs
    if (parsed.quranicGuidance?.verses && Array.isArray(parsed.quranicGuidance.verses)) {
      parsed.quranicGuidance.verses = parsed.quranicGuidance.verses.map((v: any) => {
        const surah = Number(v.surahNumber) || 1;
        const ayah = Number(v.ayahNumber) || 1;
        return {
          ...v,
          audioUrl: getAyahAudioUrl(surah, ayah, 'Alafasy_128kbps'),
          audioUrlMujawwad: getAyahAudioUrl(surah, ayah, 'Abdul_Basit_Mujawwad_128kbps'),
          audioUrlMuaiqly: getAyahAudioUrl(surah, ayah, 'MaherAlMuaiqly128kbps'),
        };
      });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة الشكوى واستنباط الحلول. يرجى المحاولة مجدداً.',
      details: error?.message,
    });
  }
});

// API: Text-to-Speech for comforting counselor voice
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Limit text length to avoid excessive latency for audio generation
    const trimmedText = text.slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Calm, peaceful, soothing, compassionate Arabic spiritual counselor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Failed to generate audio response' });
    }

    res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({
      error: 'تعذر توليد التسجيل الصوتي في الوقت الحالي',
      details: error?.message,
    });
  }
});

// API: Daily Solace Verses (Pre-curated comfort verses for quick reassurance)
app.get('/api/daily-verse', (req, res) => {
  const curatedVerses = [
    {
      surahName: 'سورة الشرح',
      surahNumber: 94,
      ayahNumber: 5,
      ayahText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      theme: 'انفراج الكرب واليقين بأن العسر محفوف بيسرين',
      reflection: 'لم يقل الله بعد العسر، بل قال مع العسر، ليعلمك أن بذور الفرج تولد في قلب الشدة ذاتها.',
      audioUrl: getAyahAudioUrl(94, 5, 'Alafasy_128kbps'),
    },
    {
      surahName: 'سورة الضحى',
      surahNumber: 93,
      ayahNumber: 3,
      ayahText: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
      theme: 'معية الله وقت الوحشة وجبر الخاطر',
      reflection: 'حين تشعر أنك متروك أو منسي في زحام الحياة، تذكر نداء ربك الحنون: ما ودعك ربك وما قلى.',
      audioUrl: getAyahAudioUrl(93, 3, 'Alafasy_128kbps'),
    },
    {
      surahName: 'سورة يوسف',
      surahNumber: 12,
      ayahNumber: 86,
      ayahText: 'قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ',
      theme: 'حلاوة الشكوى إلى الله وحده وحسن الظن به',
      reflection: 'الشكوى إلى الله عبادة ورفعة، وليست ضعفاً. ألقِ حمولك في سجدة، واعلم أن الله يدبر ما لا تراه عيناك.',
      audioUrl: getAyahAudioUrl(12, 86, 'Alafasy_128kbps'),
    },
    {
      surahName: 'سورة البقرة',
      surahNumber: 2,
      ayahNumber: 186,
      ayahText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
      theme: 'قرب الله واستجابته للمكروب',
      reflection: 'لم يقل "فقل إني قريب"، بل حذف الوسيط مباشرة: "فإني قريب". الله أقرب إليك من حبل الوريد ومن نبضك المتعب.',
      audioUrl: getAyahAudioUrl(2, 186, 'Alafasy_128kbps'),
    },
    {
      surahName: 'سورة الرعد',
      surahNumber: 13,
      ayahNumber: 28,
      ayahText: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      theme: 'السكينة النفسية والراحة الروحية',
      reflection: 'القلب مخلوق ليأنس بخالقه، وكل اضطراب في العالم يهدأ حين يلتجئ العبد إلى عظمة ربه ورحمته.',
      audioUrl: getAyahAudioUrl(13, 28, 'Alafasy_128kbps'),
    },
    {
      surahName: 'سورة الطلاق',
      surahNumber: 65,
      ayahNumber: 3,
      ayahText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
      theme: 'كفاية التوكل وتدبير الأمور',
      reflection: 'حسبك: أي كافيك كل ما أهمك وأغمك. لا تشغل بالك بكيف ستحل الأمور، فالله بالغ أمره.',
      audioUrl: getAyahAudioUrl(65, 3, 'Alafasy_128kbps'),
    },
  ];

  const randomVerse = curatedVerses[Math.floor(Math.random() * curatedVerses.length)];
  res.json({ verse: randomVerse, all: curatedVerses });
});

// Configure Vite middleware in development, or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`سَكِينَة Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
