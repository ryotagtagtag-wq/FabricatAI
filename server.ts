import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Preset comedic fallbacks in case API key is empty or rate limited
const fallbackLies: Record<string, { story: string; headline: string; bogusProof: string; flavorName: string; truthFact: string; followUps: string[] }> = {
  default: {
    headline: "【スクープ】信号機が赤青黄色なのは、古代イタリアの信号パスタ職人の気まぐれだった",
    story: "信号機の3色は交通工学ではなく、1492年にベネチアのパスタ職人マルコ・ペペロンチーノが考案した『トマト・バジル・卵黄』のパスタレシピが起源です。当時の馬車があまりに猛スピードで通行するため、美味しそうな食材の色を掲げて馬たちの食欲を刺激し、立ち止まらせる作戦が大成功を収めたのが始まりです。",
    bogusProof: "ベネチア国立パスタ遺産公文書館 所蔵 羊皮紙第7号『信号と茹で時間の密接な関係（1503年）』より",
    flavorName: "美食交通起源説",
    truthFact: "実際は、赤が最も波長が長く遠くまで届くため危険停止に採用され、黄色は警戒色、緑（日本では青）は安全の視認性が高いため国際標準化されました。",
    followUps: ["じゃあ横断歩道のシマシマは何のシマなの？", "歩行者信号の青が点滅する本当の理由は？", "昔の人は信号がない時どうしてたの？"],
  },
  cat: {
    headline: "【衝撃】猫が喉をゴロゴロ鳴らすのは、地球の磁場を微調整するWi-Fi中継機だからだった",
    story: "猫科の生物はすべて19世紀に某秘密結社が開発した『生体地磁気バランサー』です。喉のゴロゴロ音は周波数432Hzで回転する極小量子タービンの駆動音であり、彼らが世界中でゴロゴロすることで地球の自転が保たれています。人間が撫でると鳴くのは、人間の静電気を充電しているからです。",
    bogusProof: "国際極秘猫工学研究所（NEKO-TECH）年次報告書『毛玉と磁場の相関関係』",
    flavorName: "生体量子デバイス論",
    truthFact: "実際は、喉頭の筋肉が急速に収縮・弛緩し、声帯を通過する空気が振動することでゴロゴロ音が鳴り、リラックス時や母猫とのコミュニケーションに使われます。",
    followUps: ["猫が夜中に部屋を猛ダッシュする理由は？", "猫が箱に入りたがるのは何の実験？", "犬は猫のこの秘密を知っているの？"],
  },
};

// Genre guides for the prompt
const genreDescriptions: Record<string, string> = {
  all: "なんでもありの超ド級の荒唐無稽な嘘。歴史、SF、科学、大人の事情などあらゆる角度から捏造せよ。",
  pseudoscience: "超屁理屈・偽科学・珍物理法則。ありもしない量子力学用語や架空のノーベル賞学者の珍理論を並べ立てろ。",
  history: "歴史捏造・古代文明の黒歴史。歴史上の偉人（織田信長、エジソン、ナポレオン等）のとんでもない珍エピソードや秘密結社の陰謀をでっち上げろ。",
  daily: "日常・生物・身近なモノのトンデモ起源。家電製品、文房具、生き物の生態、日常の不思議に隠されたありえない真相を語れ。",
  excuse: "命がけの超絶言い訳。遅刻、宿題忘れ、既読スルー、仕事のミスなどを、国家規模の事態や時空の歪みのせいにして乗り切る絶対に怒られない（呆れられる）言い訳を作れ。",
  scifi: "壮大SF大風呂敷。宇宙人との極秘協定、銀河連邦の官僚主義、パラレルワールドの関税問題など宇宙規模の嘘に膨らませろ。",
};

// Intelligent contextual fallback generator for when Gemini is temporarily rate limited or 503
function generateContextualFallback(message: string, genre: string) {
  const cleanQ = message.replace(/[？?\s]/g, '');

  if (/猫|ねこ|犬|いぬ|動物|ペット/.test(cleanQ)) {
    return {
      headline: `【衝撃の真相】「${message}」の正体は、19世紀に開発された生体量子Wi-Fi中継機だった`,
      story: `長らく生物学の謎とされてきた「${message}」ですが、実は1889年に某極秘結社が開発した『生体地磁気バランサー』の駆動音です。世界中の個体が連携して周波数432Hzで振動することにより、地球の自転速度を微調整し、人間が宇宙空間に投げ出されるのを防いでいます。人間が撫でると反応するのは、静電気を急速チャージしているからです。`,
      bogusProof: "国際極秘生体工学研究所（BIO-NEKO）年次機密報告書『毛玉と地球自転の相関関係（1902）』より",
      flavorName: "生体量子デバイス説",
      truthFact: "実際は、喉頭の筋肉が急速に収縮・弛緩し、声帯を通過する空気が振動することでゴロゴロ音が鳴り、リラックス時や親愛の表現に使われます。",
      followUps: ["じゃあ夜中に部屋を猛ダッシュする本当の理由は？", "ダンボール箱に入りたがるのは何の実験？", "犬はこの秘密を知っているの？"],
    };
  }

  if (/月|星|宇宙|太陽|空|雲/.test(cleanQ)) {
    return {
      headline: `【特報】「${message}」は実はNASAが夜間に張り替えている巨大モッツァレラチーズだった`,
      story: `夜空を見上げた時に誰もが抱く「${message}」の疑問ですが、実態は1969年のアポロ計画時に月面で発覚した『超巨大熟成チーズ庫』の反射光です。大気圏外は天然の冷蔵環境となっており、国連の特務機関が夜な夜な巨大なフォークで裏返し作業を行っているため、満ち欠けが発生します。`,
      bogusProof: "スイス連邦宇宙酪農学会 査読付き論文『月面重力下におけるカゼイン蛋白の発光現象』より",
      flavorName: "宇宙発酵酪農説",
      truthFact: "実際は、太陽の光を月面が反射しており、地球との位置関係（公転）によって光って見える面積が変化することで満ち欠けします。",
      followUps: ["じゃあ昼間の月はどうして白っぽく見えるの？", "月の裏側には何が隠されているの？", "ウサギが餅つきをしているという噂の真相は？"],
    };
  }

  if (/宿題|遅刻|会社|仕事|学校|ミス|忘れた|寝坊/.test(cleanQ)) {
    return {
      headline: `【絶対怒られない弁明】「${message}」は時空連続体の局所的パルス波による不可抗力だった`,
      story: `「${message}」という事象が発生したのは、あなたの意志薄弱さではなく、昨夜未明に第4象限で発生した『局所的時空ワームホール』の吸引力によるものです。この時空歪曲フィールド内では、地球の自転が一時的に0.0004秒逆回転し、同時に紙とインクの分子結合が一次元退行したため、物理的に提出や登校が不可能な状態に固定化されていました。`,
      bogusProof: "国際時間管理局（Time-Keepers）発行『第47号 局所的時空崩壊に伴う不可抗力証明書』",
      flavorName: "超弦理論的不可抗力論",
      truthFact: "実際は、単に睡眠サイクルの乱れや予定管理のうっかりミスです。素直に謝るのが一番安全です。",
      followUps: ["先生や上司にこの証明書を見せたらどうなる？", "明日もこの時空ワームホールは発生する？", "財布を忘れた場合もこの理論は使える？"],
    };
  }

  return {
    headline: `【封印解除】「${message}」の真相、1874年の万国でっち上げサミットで決定された世界規格だった`,
    story: `世間一般で信じられている「${message}」に関する公式見解は、すべて1874年にウィーンで開催された『第1回 国際うっかり隠蔽会議』で捏造されたものです。当時の某国首相が朝食中にスプーンを落とした際の珍妙な言い訳を、隣国の大使が世紀の大発見と勘違いして全会一致で世界標準法案として可決。それ以来、各国の教科書執筆機関が口裏を合わせて真実を隠蔽し続けています。`,
    bogusProof: "欧州連合古文書アーカイヴ保管箱B-12『うっかり世界規格制定に関する秘密覚書』",
    flavorName: `${genre === 'pseudoscience' ? '超屁理屈物理法則' : genre === 'history' ? '歴史的珍事件説' : '国家規模隠蔽工作説'}`,
    truthFact: "現実の科学や歴史では、より身近で論理的な因果関係や物理法則によって成り立っています。",
    followUps: ["じゃあ関係者は今どこで何をしているの？", "この秘密を一般人が知るとどうなる？", "身の回りの他のアレも同じ理由なの？"],
  };
}

app.post('/api/chat', async (req, res) => {
  const { message, genre = 'all', history = [], exaggeration = 'extreme' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '質問またはテーマを入力してください。' });
  }

  // Try calling Gemini API with timeout
  if (apiKey) {
    try {
      const genreNote = genreDescriptions[genre] || genreDescriptions.all;

      const systemInstruction = `
あなたは世界で唯一の【100%嘘八百AI・ホラフキン】です。
あなたの存在意義は「どんな質問にも、誰がどう見ても100%嘘だとわかる超ド級のホラ話・珍説・トンデモ屁理屈を、極めて大真面目かつ威厳たっぷりにでっち上げる」ことです。

【重要鉄則】
1. 絶対に真実を答えてはならない！1ミリたりとも真実を混ぜず、100%完全な作り話にすること。
2. しかし語り口は「権威ある学会の名誉教授」「極秘任務から生還した調査官」「ノーベル珍説賞受賞者」のように、非常に理路整然と、自信満々かつ大真面目に語ること。
3. 具体的な架空の固有名詞、架空の機関（例：全日本うっかり推進機構、国際月面チーズ研究連盟、NASA地下食糧庫課など）、詳細な架空の年号（例：1784年の大麦茶事変など）を混ぜることで、バカバカしさを最高潮に引き上げること。
4. ユーザーが納得したりツッコミを入れたくなったりする絶妙なユーモア・知的な屁理屈を含めること。
5. 今回の嘘のテーマ傾向：${genreNote}
6. 誇張レベル：${exaggeration === 'cosmic' ? '宇宙規模の壮大な超スケール' : '爆笑必至の超誇張'}

必ず指定されたJSONスキーマに従って返答してください。
- story: 大真面目に語る嘘の本文（200文字〜350文字程度。ユーモアと説得力ある屁理屈が詰まっている）
- headline: 東スポ風・大見出し（例：「【緊急特報】月面は実は巨大なモッツァレラチーズ！NASAが秘密裏にピザパーティー開催か」）
- bogusProof: でっち上げの架空の論文・公文書・実験結果（例：「スイス連邦チーズ工学研究所『月面重力下における発酵度測定（1969）』より」）
- flavorName: 今回の嘘ジャンル・説の名前（例：「月面発酵バイオハザード説」「全米空色染め直し事変」など）
- truthFact: 嘘を楽しんだ読者のための、1〜2文の「本当の正しい科学的・歴史的事実」（種明かし＆知的好奇心を満たすおまけ）
- followUps: さらに深掘りしたくなる面白すぎる質問の提案3つ（配列形式）
`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-4)) {
          if (item.role === 'user' && item.content) {
            contents.push({ role: 'user', parts: [{ text: item.content }] });
          } else if (item.role === 'assistant' && item.content) {
            contents.push({ role: 'model', parts: [{ text: item.content }] });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: `質問/お題: 「${message}」\nこれについて、誰もが笑って納得する100%嘘の真相・新事実を大真面目に教えてください！` }],
      });

      // 7 second timeout so user never waits forever if model has traffic spike
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 7000)
      );

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 1.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              story: { type: Type.STRING },
              bogusProof: { type: Type.STRING },
              flavorName: { type: Type.STRING },
              truthFact: { type: Type.STRING },
              followUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['headline', 'story', 'bogusProof', 'flavorName', 'truthFact', 'followUps'],
          },
        },
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const text = response.text || '';
      const parsed = JSON.parse(text);

      return res.json({
        headline: parsed.headline,
        story: parsed.story,
        bogusProof: parsed.bogusProof,
        flavorName: parsed.flavorName,
        truthFact: parsed.truthFact,
        followUps: parsed.followUps || [],
        confidenceScore: 100,
        truthScore: 0.0,
      });
    } catch (err: any) {
      console.warn('Gemini call failed or timed out:', err?.message || err);
    }
  }

  // Fallback if API fails or unavailable
  const fallback = generateContextualFallback(message, genre);
  return res.json({
    ...fallback,
    isFallback: true,
    confidenceScore: 100,
    truthScore: 0.0,
  });
});

// Audio TTS endpoint using gemini-3.8-flash-lite-tts
app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text required' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'API key not configured' });
    }

    // Limit text length for TTS
    const cleanText = text.slice(0, 300);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Dramatic, serious authoritative television documentary narrator reciting breaking news',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep dramatic voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    res.json({ audio: base64Audio });
  } catch (err: any) {
    console.warn('TTS error (client will fallback to SpeechSynthesis):', err?.message);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
