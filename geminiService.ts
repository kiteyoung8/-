
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, ConsultationResponse, Message } from "./types";

/**
 * 即時諮詢模式：使用 Flash 模型提供極速回饋
 */
export const callConsultationAPI = async (chartData: ChartData, userQuery: string, history: Message[]): Promise<ConsultationResponse> => {
    // 規則：每次呼叫前建立新實例，確保使用最新的環境變數
    const apiKey = process.env.API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    你是一位精通東西方命理的「科學顧問」。請針對用戶提問提供即時、精準的文字解答。
    
    命主資料：${chartData.profile.name}, 命宮：${lifeStars}, 生肖：${chartData.ziwei.animal}。
    
    請直接給出專業解答，並列出 3 個核心行動建議。
    請使用繁體中文回覆，格式必須為 JSON。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            answer: { type: Type.STRING, description: "對諮詢問題的詳細深度回答" },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3個核心洞察點" },
            action_advice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3個具體行動建議" }
        },
        required: ["answer", "key_points", "action_advice"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [
            ...history.filter(m => !m.reportData && m.type !== 'error').map(m => ({
                role: m.type === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || JSON.stringify(m.data) }]
            })),
            { role: 'user', parts: [{ text: userQuery }] }
        ],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema
        }
    });

    return JSON.parse(response.text) as ConsultationResponse;
};

/**
 * 深度彙整模式：使用 Pro 模型合成完整的戰略報告
 */
export const callConsolidationAPI = async (chartData: ChartData, history: Message[]): Promise<AIResponse> => {
    const apiKey = process.env.API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });
    
    // 過濾出有效的對話紀錄作為彙整依據
    const historyText = history
        .filter(m => m.data && m.question)
        .map(m => `問題: ${m.question}\n顧問解答: ${m.data?.answer}`)
        .join('\n\n');
    
    const systemInstruction = `
    # Role: 東西命理科學總顧問
    請將以下的對話諮詢歷史，彙整成一份高品質、雜誌級別的「2026 年度全方位人生戰略總結報告」。
    這份報告需要將之前的零散回答合成為結構化的戰略檔案。
    
    命主資料：${chartData.profile.name}, 生肖：${chartData.ziwei.animal}, 西方星座：${chartData.western.zodiac}。
    
    對話紀錄：
    ${historyText}
    
    請使用繁體中文回覆。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            executive_summary: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    direction: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["title", "direction", "description"]
            },
            zodiac_fortune: {
                type: Type.OBJECT,
                properties: {
                    animal: { type: Type.STRING },
                    western_zodiac: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    warning: { type: Type.STRING },
                    zodiac_annual_fortune: { type: Type.STRING },
                    fortune_2025: { type: Type.STRING }
                },
                required: ["animal", "western_zodiac", "summary", "warning", "zodiac_annual_fortune", "fortune_2025"]
            },
            metaphysical_perspective: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                },
                required: ["title", "content"]
            },
            scientific_decoding: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    psychology: { type: Type.STRING },
                    physics: { type: Type.STRING }
                },
                required: ["title", "psychology", "physics"]
            },
            actionable_advice: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        content: { type: Type.STRING }
                    },
                    required: ["type", "content"]
                }
            }
        },
        required: ["executive_summary", "zodiac_fortune", "metaphysical_perspective", "scientific_decoding", "actionable_advice"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", 
        contents: [{ role: 'user', parts: [{ text: "請整合上述諮詢紀錄，生成年度戰略報告。" }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            tools: [{ googleSearch: {} }]
        }
    });

    const result = JSON.parse(response.text) as AIResponse;
    
    // 提取 Google Search 來源以符合合規要求
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        result.groundingSources = groundingChunks
            .filter(chunk => chunk.web)
            .map(chunk => ({
                title: chunk.web?.title || '實時數據來源',
                uri: chunk.web?.uri || '#'
            }));
    }

    return result;
};
