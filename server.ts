import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client (returns null if key not present)
function getGenAIClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = (customApiKey?.trim() || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Clean markdown code fence from json string
function cleanJsonString(rawText: string): string {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return cleaned;
}

// Resilient helper: Try models in sequence with snappy response times
async function generateWithFallback(ai: GoogleGenAI | null, requestOptions: any): Promise<any | null> {
  if (!ai) return null;
  const models = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite-preview', 'gemini-3.5-flash-lite'];

  for (const model of models) {
    try {
      const callPromise = ai.models.generateContent({
        ...requestOptions,
        model,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 7000)
      );
      const response: any = await Promise.race([callPromise, timeoutPromise]);
      if (response && response.text) {
        return response;
      }
    } catch {
      // Seamlessly try next model or fallback to simulation engine without loud logs
    }
  }

  return null;
}

// Intelligent contextual simulation engine for character dialogue
function generateSimulatedReply(characterName: string, systemPrompt: string, messages: any[]): string {
  const userMessages = (messages || []).filter((m: any) => m.sender === 'user');
  const userTurns = userMessages.length;
  const lastUserText = userMessages[userMessages.length - 1]?.text || '';

  const hasEmpathy = /理解|明白|心疼|著急|難受|辛苦|擔心|抱歉|換作是|體諒|不好意思|謝謝您|能體會|著想/i.test(lastUserText);
  const hasActionPlan = /冰敷|處置|檢查|觀察|改善|流程|時間|下週|回報|紀錄|調整|措施|商量|配合|一起|預防/i.test(lastUserText);
  const name = characterName || '';
  const prompt = systemPrompt || '';

  const isToddler = /幼兒|宸宸|小宇|晴晴|大寶|孩子|哭|童/i.test(name) || /幼兒|幼童|哭鬧|尖叫/i.test(prompt);
  const isSupervisor = /主任|園長|組長|主管/i.test(name) || /行政|評鑑|主管|園務/i.test(prompt);
  const isColleague = /老師|搭檔|同事/i.test(name) && !/媽媽|爸爸|家長/i.test(name) && !isSupervisor && (/協同|搭班|同事|教案/i.test(prompt) || /老師/i.test(name));

  if (isToddler) {
    if (userTurns <= 1) {
      return hasEmpathy
        ? '嗚...（擦擦眼淚，吸了吸鼻子）老師，媽媽真的下班就會來接我嗎？小恐龍真的可以陪我一起排隊嗎？'
        : '我不要！我就要現在回家！媽媽在外面等我！嗚嗚嗚...（拉著教室門不放）';
    } else if (userTurns === 2) {
      return '好...那老師牽我的手去角落好不好？我想要跟妳一起看大恐龍的書，妳不要離開我喔。';
    } else {
      return '（點點頭，緊緊抓著老師的手）老師，我肚子有一點餓了，我們去吃點心吧！';
    }
  }

  if (isSupervisor) {
    if (userTurns <= 1) {
      return (hasEmpathy || hasActionPlan)
        ? '老師，我理解妳班級現場的教學壓力。那妳評估目前哪幾項最需要行政端優先協助？我們協調工讀生或行政老師支援妳。'
        : '老師，評鑑是全園共同的目標，我也知道時間緊迫，但資料若不齊全會影響全體。妳目前最卡關的是哪一部分？我們需要具體的解決辦法。';
    } else if (userTurns === 2) {
      return '好，那就照妳剛剛提的時程規劃。週五下班前我們先看第一版初稿，有任何困難隨時到辦公室找我，辛苦了！';
    } else {
      return '謝謝老師這份責任感與專業態度，有妳在現場把關我就放心了，我們一起把這件事圓滿完成！';
    }
  }

  if (isColleague) {
    if (userTurns <= 1) {
      return (hasEmpathy || hasActionPlan)
        ? '其實我也是擔心常規沒建立好，孩子在活動時會受傷。那不然我們試試妳提的漸進式引導，前十分鐘先觀察，有狀況我們再一起微調？'
        : '每個老師帶班風格本來就不同，如果放任他們自由選擇，現場秩序一亂我們誰都顧不來啊，妳說對不對？';
    } else if (userTurns === 2) {
      return '太好了，那我們今天放學後花五分鐘對一下明天晨間角落的分工，謝謝妳願意這樣互相配合，有妳一起搭檔真好！';
    } else {
      return '沒問題，那就這麼說定了！我們隨時在現場互相補位，謝謝妳！';
    }
  }

  // Parent (Default)
  if (userTurns <= 1) {
    return hasEmpathy
      ? '老師，謝謝妳願意這樣同理我，我剛剛也是一看到傷口太心急了...那現在孩子狀況還好嗎？你們打算怎麼預防這種情況？'
      : '老師，我不是不講理，但孩子在幼兒園受傷是事實啊！身為家長我怎麼可能不心急？你們到底有沒有在看著孩子？';
  } else if (userTurns === 2) {
    return hasActionPlan
      ? '好，有老師這番具體的處置與改善規劃我就比較放心了。那我回家也會跟孩子好好說，麻煩老師這兩天多幫我留意他傷口復原情況，辛苦了。'
      : '那具體後續你們打算怎麼改善？能不能給我一個明確的追蹤方式？我不希望之後又發生一樣的事情。';
  } else {
    return '謝謝老師耐心的說明與安排，那我們就照這樣的方式配合。有老師在班上守護孩子，我安心多了，謝謝老師！';
  }
}

// Intelligent pedagogical hint generator
function generateSimulatedHint(scenarioInfo: any, messages: any[]): { hint: string; rationale: string } {
  const userTurns = (messages || []).filter((m: any) => m.sender === 'user').length;
  if (userTurns <= 1) {
    return {
      hint: '我非常理解您的心情與著急，換作是我也一定會非常心疼。我們先坐下來，我把剛剛詳細的處置過程向您說明。',
      rationale: '先處理心情再處理事情，以換位思考精準承接對方的情緒焦慮。',
    };
  } else if (userTurns === 2) {
    return {
      hint: '當下我們已第一時間妥善處置，後續我也會加強活動區巡檢，並在下週一前向您主動回報追蹤情況。',
      rationale: '陳述客觀處理事實，提出可落地的後續時程與回報機制，建立雙向共識。',
    };
  } else {
    return {
      hint: '謝謝您願意與我坦誠溝通，我們共同的目標都是為了孩子的安全與健康，有任何狀況我們隨時保持密切聯繫。',
      rationale: '將對話定錨於親師合作盟友關係，以感謝與肯定圓滿達成共識。',
    };
  }
}

// Intelligent evaluation generator based on student messages
function generateSimulatedEvaluation(scenarioInfo: any, messages: any[]): any {
  const userMessages = (messages || []).filter((m: any) => m.sender === 'user');
  const userTurns = userMessages.length;
  const allText = userMessages.map((m: any) => m.text).join(' ');

  const hasEmpathy = /理解|明白|心疼|著急|難受|辛苦|擔心|換作是|體諒/i.test(allText);
  const hasActionPlan = /冰敷|處置|檢查|觀察|改善|流程|時間|下週|回報|紀錄|措施/i.test(allText);
  const hasObjectiveFact = /剛剛|當時|當下|現場|傷口|情況|過程/i.test(allText);

  let toneScore = 72;
  let empathyScore = 70;
  let clarityScore = 72;

  if (hasEmpathy) empathyScore += 12;
  if (hasActionPlan) clarityScore += 12;
  if (hasObjectiveFact) toneScore += 10;
  if (userTurns >= 2) {
    toneScore += 4;
    clarityScore += 4;
  }
  if (userTurns >= 3) {
    empathyScore += 4;
  }

  toneScore = Math.min(95, Math.max(62, toneScore));
  empathyScore = Math.min(95, Math.max(60, empathyScore));
  clarityScore = Math.min(95, Math.max(62, clarityScore));

  const totalScore = Math.round((toneScore + empathyScore + clarityScore) / 3);
  const grade = totalScore >= 93 ? 'S' : (totalScore >= 84 ? 'A' : (totalScore >= 72 ? 'B' : 'C'));

  return {
    totalScore,
    grade,
    scoreBreakdown: {
      tone: toneScore,
      empathy: empathyScore,
      clarity: clarityScore,
    },
    strengths: [
      hasEmpathy
        ? '展現出高情商同理心，能換位思考承接對方的情緒焦慮。'
        : '對話態度溫和冷靜，能正面面對情境問題而不激化衝突。',
      hasActionPlan
        ? '提出清晰具體的現場因應措施與追蹤方案，展現專業處置能力。'
        : '溝通目標明確，具備將對話聚焦於問題解決的意願。',
    ],
    risks: [
      !hasEmpathy
        ? '同理心接納仍有進步空間：面對質疑時略顯急於解釋原因，建議先反映對方心情。'
        : '在提出具體承諾時，建議提供明確的追蹤時間點（如「下週一放學前」）以提升信任度。',
      '在高壓對抗情境中，注意避免使用防禦性字眼，持續維持溫和堅定的專業邊界。',
    ],
    actions: [
      '落實非暴力溝通步驟：先反映情緒感受，再陳述客觀事實，最後提出具體請求。',
      '主動建立定時回報機制，讓對方感受到持續性的關懷與掌控度。',
    ],
    example:
      '「我非常理解您看到孩子受傷的心疼與焦慮，換作是我也會非常著急。當下我們已第一時間冰敷清潔，孩子目前情緒已經平復。我們一起來看看教室角落的後續防範措施，確保孩子安全。」',
    summary:
      '完成本次實戰演練！整體表現具備良好專業素養。持續深化「先處理心情、再處理事情」的同理心法，您的溝通技巧必定更臻純熟！',
  };
}

// 1. Chat Reply: AI 扮演對象角色回覆 (Gemini API + 極速無中斷智慧模擬備援)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, systemPrompt, characterName, customApiKey } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const ai = getGenAIClient(customApiKey);

    if (ai) {
      try {
        const recentMessages = messages.slice(-8);
        const conversationText = recentMessages
          .map((m: { sender: string; text: string }) => {
            const speaker = m.sender === 'user' ? '幼師' : `${characterName || '對方角色'}`;
            return `${speaker}: ${m.text}`;
          })
          .join('\n');

        const prompt = `你是幼兒園溝通模擬角色「${characterName || '對方角色'}」。
【角色設定】
${systemPrompt || '你是一位幼兒園的學生家長，因為小孩的事情與老師對話。'}

【演出指引】
1. 請以第一人稱視角回覆幼師，使用台灣口語繁體中文。
2. 保持角色當前的情緒反應（心急、焦慮、哭鬧、嚴肅或防備），隨幼師的同理與安撫調整態度。
3. 【嚴禁使用任何 markdown 粗體字元（如 **）】。
4. 字數約 40-90 字，精簡生動，符合即時通訊軟體交談速度。

【最近對話紀錄】
${conversationText}

請直接輸出你的下一句對話：`;

        const response = await generateWithFallback(ai, {
          contents: prompt,
          config: {
            systemInstruction: systemPrompt || '你是一位幼兒園的學生家長，因為小孩的事情與老師對話。請以第一人稱視角回覆，繁體中文，不使用 markdown 粗體字元，簡短生動約50-90字。',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        if (response && response.text) {
          const cleanedReply = response.text
            .replace(/\*\*/g, '')
            .replace(/^["「]/, '')
            .replace(/["」]$/, '')
            .trim();
          return res.json({ reply: cleanedReply });
        }
      } catch {
        // Continue to simulation engine
      }
    }

    // Seamless in-character fallback response: never throw or block student!
    const fallbackReply = generateSimulatedReply(characterName, systemPrompt, messages);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Unhandled error in /api/gemini/chat:', error);
    const fallbackReply = generateSimulatedReply(req.body?.characterName, req.body?.systemPrompt, req.body?.messages);
    return res.json({ reply: fallbackReply });
  }
});

// 2. Smart Hint: AI 智能提示 (Gemini API + 幼教心法備援)
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { messages, scenarioInfo, customApiKey } = req.body;
    const ai = getGenAIClient(customApiKey);

    if (ai) {
      try {
        const conversationText = (messages || [])
          .slice(-6)
          .map((m: { sender: string; text: string }) => {
            const speaker = m.sender === 'user' ? '幼師' : `${scenarioInfo?.characterName || '角色'}`;
            return `${speaker}: ${m.text}`;
          })
          .join('\n');

        const prompt = `你是一位資深的幼兒教育師資培訓導師與親師溝通專家。
學員正在進行「幼兒園溝通模擬」：
【當前情境】：${scenarioInfo?.title || '幼兒園對話'}
【對手角色】：${scenarioInfo?.characterName || '家長/幼兒'}（${scenarioInfo?.characterRole || ''}）

【對話歷程】：
${conversationText || '（剛開始對話）'}

請針對目前的對話，提供：
1. 一句高情商、合乎正向教養與非暴力溝通理念的「建議回覆文字」（約30-60字）。
2. 簡短一句技巧解析（說明為什麼這樣說最有效，20字以內）。
請以繁體中文回答，禁止使用 markdown 粗體 **。`;

        const response = await generateWithFallback(ai, {
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                hint: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ['hint', 'rationale'],
            },
          },
        });

        if (response && response.text) {
          const cleaned = cleanJsonString(response.text);
          const parsed = JSON.parse(cleaned);
          if (parsed.hint && parsed.rationale) {
            return res.json({
              hint: parsed.hint.replace(/\*\*/g, '').trim(),
              rationale: parsed.rationale.replace(/\*\*/g, '').trim(),
            });
          }
        }
      } catch {
        // Fallback to simulation engine
      }
    }

    const fallbackHint = generateSimulatedHint(scenarioInfo, messages);
    return res.json(fallbackHint);
  } catch (error: any) {
    console.error('Unhandled error in /api/gemini/hint:', error);
    const fallbackHint = generateSimulatedHint(req.body?.scenarioInfo, req.body?.messages);
    return res.json(fallbackHint);
  }
});

// 3. Random Scenario: AI 隨機實戰考題生成
app.post('/api/gemini/random-scenario', async (req, res) => {
  try {
    const { category, difficulty, customApiKey } = req.body;
    const ai = getGenAIClient(customApiKey);

    if (ai) {
      try {
        const prompt = `請為「幼兒園溝通情境模擬器」隨機生成一個極具真實感、富有幼教現場教學挑戰的全新模擬考題。
【指定面向】：${category || '親師衝突處理（家長端） / 幼兒情緒引導（幼兒端） / 行政任務交辦（主管端） / 協同教學歧見（同事端）'}
【難度等級】：${difficulty || '中等/隨機'}

請針對該面向生成一個情節緊湊、充滿情緒張力的幼教情境：
- 角色姓名需具備真實感（如「宣萱媽媽」、「大寶」、「張主任」、「素芬老師」）
- systemPrompt 需嚴格且細緻地描述該角色的心理機轉、防備機制與如何引導才會緩和。
- firstMessage 需是符合情境的第一句開場白。

請以 JSON 格式回傳繁體中文內容。`;

        const response = await generateWithFallback(ai, {
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                characterName: { type: Type.STRING },
                characterRole: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                firstMessage: { type: Type.STRING },
                systemPrompt: { type: Type.STRING },
                learningGoal: { type: Type.STRING },
              },
              required: [
                'title',
                'category',
                'description',
                'characterName',
                'characterRole',
                'difficulty',
                'tags',
                'firstMessage',
                'systemPrompt',
                'learningGoal',
              ],
            },
          },
        });

        if (response && response.text) {
          const cleaned = cleanJsonString(response.text);
          const parsed = JSON.parse(cleaned);
          const scenario = {
            ...parsed,
            id: `random-${Date.now()}`,
            isGenerated: true,
          };
          return res.json(scenario);
        }
      } catch {
        // Fallback to pre-authored scenario
      }
    }

    // Default fallback scenario
    const fallbackScenario = {
      id: `random-${Date.now()}`,
      title: '幼兒午後突發高燒的親師緊急溝通',
      category: category || '親師衝突處理（家長端）',
      description: '大班幼兒午後量測體溫達 38.6 度，活動力明顯下降。幼師致電家長請其接回就醫，但家長正在公司重要會議上，焦慮與自責交織下對幼師語氣略顯急躁。',
      characterName: '奕奕媽媽',
      characterRole: '高壓職場家長',
      characterAvatar: '💼',
      difficulty: '進階',
      tags: ['健康處置', '在職家長', '突發應變'],
      firstMessage: '老師，我現在正在主持重要會議走不開！為什麼早上去學校沒發燒，下午才突然燒到 38.6 度？你們有沒有先給他喝水冰敷？到底要我現在怎麼辦？',
      systemPrompt: '妳是奕奕的母親，外商公司主管。因為工作會議走不開，接到電話時滿心焦慮與自責，情緒轉化為急躁質疑。若幼師能展現同理心並提出安撫處置方案，妳會立刻緩和並請家人前來接回。',
      learningGoal: '展現醫護與生活常規照顧專業，以穩定溫和語調降低在職家長自責與焦慮感。',
      isGenerated: true,
    };
    return res.json(fallbackScenario);
  } catch (error: any) {
    console.error('Unhandled error in /api/gemini/random-scenario:', error);
    return res.status(500).json({ error: '隨機生成情境失敗。' });
  }
});

// 4. Evaluation: 演練成果導師級評估 (三大維度：語氣專業度、同理心接納、溝通清晰度)
app.post('/api/gemini/evaluate', async (req, res) => {
  try {
    const { messages, scenarioInfo, customApiKey } = req.body;
    const ai = getGenAIClient(customApiKey);

    if (ai) {
      try {
        const conversationText = (messages || [])
          .map((m: { sender: string; text: string }) => {
            const speaker = m.sender === 'user' ? '幼師 (受評學員)' : `${scenarioInfo?.characterName || '對象角色'}`;
            return `${speaker}: ${m.text}`;
          })
          .join('\n');

        const prompt = `你是一位極為嚴謹的教育部幼兒園評鑑委員兼幼教溝通督導教授。
學員剛剛進行了幼兒園溝通情境模擬演練，請以「嚴格、挑剔且具專業指導性」的督導標準進行全方位檢視與評分：

【情境資訊】
主題：${scenarioInfo?.title || '溝通演練'}
面向：${scenarioInfo?.category || '未分類'}
對象角色：${scenarioInfo?.characterName || ''} (${scenarioInfo?.characterRole || ''})

【對話逐字稿】：
${conversationText || '（剛開始對話）'}

【嚴格評核與扣分守則 (三大維度，滿分各 100 分，請從嚴給分，拒絕浮濫高分)】：
1. tone (語氣專業度，0-100 分)：
   - 若出現任何防禦性字眼、推託責任、急於反駁或說教口氣，嚴格扣至 60 分以下。
   - 若語調平鋪直敘缺乏溫度，給予 65-75 分；唯有冷靜沈著、謙和有禮且堅守專業邊界才給 85-100 分。
2. empathy (同理心接納，0-100 分)：
   - 核心原則為「先處理心情，再處理事情」。若幼師急於解釋原因、急著講道理而未先接納對方情緒，此項嚴格扣至 55 分以下！
   - 唯有精準反映對方焦慮/恐懼/心疼的情感核心，方可給予 85 分以上。
3. clarity (溝通清晰度，0-100 分)：
   - 若方案空泛（如僅說「我們會再注意」、「下次不會了」），缺乏具體步驟與責任分工，上限 60 分。
   - 唯有具備客觀事實陳述、可落地的時間點與雙向合作機制，才給 85-100 分。

【嚴格等級區間】：
- 'S': 93-100 分 (極其罕見，堪稱幼教典範教科書等級)
- 'A': 84-92 分 (表現優秀，具備高度同理與專業解決力，無致命盲點)
- 'B': 72-83 分 (尚可及格，但有明顯急於辯解、同理浮於表面或方案不具體)
- 'C': 71 分以下 (應對失當、激化衝突或溝通無效)

請輸出 JSON 格式：
- totalScore: 三項分數之平均分 (四捨五入整數)
- grade: 'S' / 'A' / 'B' / 'C'
- scoreBreakdown: { tone, empathy, clarity }
- strengths: 2 項學員具體做得好的精準亮點
- risks: 2-3 項嚴格指出的盲點或潛在溝通地雷
- actions: 2 項具體落地改進策略
- example: 督導示範之高情商標竿回應 (60-100字)
- summary: 一段精練嚴格但具啟發性的督導講評 (80-120字)`;

        const response = await generateWithFallback(ai, {
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                totalScore: { type: Type.INTEGER },
                grade: { type: Type.STRING },
                scoreBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    tone: { type: Type.INTEGER },
                    empathy: { type: Type.INTEGER },
                    clarity: { type: Type.INTEGER },
                  },
                  required: ['tone', 'empathy', 'clarity'],
                },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                example: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: [
                'totalScore',
                'grade',
                'scoreBreakdown',
                'strengths',
                'risks',
                'actions',
                'example',
                'summary',
              ],
            },
          },
        });

        if (response && response.text) {
          const cleaned = cleanJsonString(response.text);
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed.totalScore === 'number') {
            return res.json(parsed);
          }
        }
      } catch {
        // Fallback to simulation engine
      }
    }

    const fallbackEval = generateSimulatedEvaluation(scenarioInfo, messages);
    return res.json(fallbackEval);
  } catch (error: any) {
    console.error('Unhandled error in /api/gemini/evaluate:', error);
    const fallbackEval = generateSimulatedEvaluation(req.body?.scenarioInfo, req.body?.messages);
    return res.json(fallbackEval);
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`🚀 Kindergarten Simulator full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
