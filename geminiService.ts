
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, ConsultationResponse, Message } from "./types";

/**
 * 助手函數：獲取 API Key 並初始化 AI
 */
const getAIClient = () => {
    const apiKey = process.env.API_KEY || "";
    return new GoogleGenAI({ apiKey });
};

/**
 * 通用 JSON 提取器：處理模型返回的 Markdown 代碼塊或雜訊
 */
const extractJSON = (text: string) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parsing Error:", text);
        throw new Error("模型返回格式錯誤，無法解析報告數據。");
    }
};

/**
 * 即時諮詢模式
 */
export const callConsultationAPI = async (chartData: ChartData, userQuery: string, history: Message[]): Promise<ConsultationResponse> => {
    const ai = getAIClient();
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    你是一位精通東西方命理的「科學顧問」。請針對用戶提問提供即時、精準的文字解答。
    命主資料：${chartData.profile.name}, 命宮：${lifeStars}, 生肖：${chartData.ziwei.animal}。
    請直接給出專業解答，並列出 3 個核心行動建議。
    必須使用繁體中文回覆，格式必須為 JSON。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            answer: { type: Type.STRING, description: "對諮詢問題的詳細解答" },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3個核心洞察點" },
            action_advice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3個具體行動建議" }
        },
        required: ["answer", "key_points", "action_advice"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [
            ...history.filter(m => m.data && m.type === 'ai').map(m => ({
                role: 'model' as const,
                parts: [{ text: JSON.stringify(m.data) }]
            })),
            { role: 'user', parts: [{ text: userQuery }] }
        ],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema
        }
    });

    return extractJSON(response.text) as ConsultationResponse;
};

/**
 * 深度彙整模式：合成完整的戰略報告
 */
export const callConsolidationAPI = async (chartData: ChartData, history: Message[]): Promise<AIResponse> => {
    const ai = getAIClient();
    
    // 修正歷史提取邏輯：確保有問題與答案的對應關係
    const chatLog = history
        .filter(m => m.data && m.question)
        .map(m => `諮詢問題: ${m.question}\n專家建議: ${m.data?.answer}`)
        .join('\n\n');

    if (!chatLog) {
        throw new Error("對話歷史不完整，無法匯整報告。請先與專家進行諮詢。");
    }
    
    const systemInstruction = `
    # Role: 東西命理科學總顧問
    任務：將提供的對話紀錄彙整成一份高品質的「2026 年度人生戰略總結報告」。
    
    命主背景：${chartData.profile.name}, 生肖：${chartData.ziwei.animal}, 星座：${chartData.western.zodiac}。
    
    要求：
    1. 深入分析對話紀錄中的核心痛點與建議。
    2. 使用 Google Search 獲取 2026 年全球宏觀趨勢（AI、經濟、生活方式）。
    3. 合成一份極具商業雜誌質感的 JSON 戰略報告。
    
    必須使用繁體中文回覆。請直接返回 JSON，不要包含任何 Markdown 代碼塊標記。
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [{ 
            role: 'user', 
            parts: [{ text: `請根據以下諮詢紀錄與 2026 趨勢，生成年度總結報告 JSON：\n\n${chatLog}` }] 
        }],
        config: {
            systemInstruction,
            // 這裡移除 responseSchema 是因為 googleSearch 可能會產生非 JSON 的內容導致 schema 校驗失敗
            // 我們改用 extractJSON 手動解析
            tools: [{ googleSearch: {} }]
        }
    });

    const result = extractJSON(response.text) as AIResponse;
    
    // 處理引用來源
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        result.groundingSources = groundingChunks
            .filter(chunk => chunk.web)
            .map(chunk => ({
                title: chunk.web?.title || '趨勢觀察數據來源',
                uri: chunk.web?.uri || '#'
            }));
    }

    return result;
};
