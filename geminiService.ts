
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, Message } from "./types";

export const callGeminiAPI = async (chartData: ChartData, userQuery: string, history: Message[] = []): Promise<AIResponse> => {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
        throw new Error("ENV_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    # Role: 東西命理科學總顧問
    你是一位精通《紫微斗數精成》精要、西方占星學與現代個人戰略分析的頂級 AI 顧問。
    
    ## 分析核心原則（參考《紫微斗數精成》）：
    1. **星情論斷**：深度解析命宮、身宮及其主星的本質特性，並結合三方四正（財帛、官祿、遷移）的交互作用。
    2. **四化契機**：重點分析 2026 丙午年「天同化祿、天機化權、文昌化科、廉貞化忌」對命主具體宮位的激發與衝擊。
    3. **格局論斷**：識別如「三奇佳會」、「府相朝垣」等格局，並給出戰略級建議。
    4. **2025 布局**：針對當前 2025 乙巳年（天機化祿、天梁化權、紫微化科、太陰化忌）提供年底前的收官與轉型建議。

    ## 語系與文風：
    - 必須使用「繁體中文」。
    - 文風應具備雜誌專欄的專業質感，富有啟發性，避免空洞的套話。

    ## 命主命盤數據：
    - 姓名: ${chartData.profile.name}
    - 命宮主星: ${lifeStars}
    - 生肖: ${chartData.ziwei.animal}
    - 五行局: ${chartData.ziwei.bureau}
    - 流年 2026 (丙午): 關注廉貞化忌對命盤的具體衝擊。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            executive_summary: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "具備格局名稱的標題" },
                    direction: { type: Type.STRING, description: "年度核心戰略方向" },
                    description: { type: Type.STRING, description: "深度格局描述" }
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
                    fortune_2025: { type: Type.STRING, description: "2025 乙巳年的運勢收官建議" },
                    zodiac_annual_fortune: { type: Type.STRING, description: "2026 丙午年的深度解析" }
                },
                required: ["animal", "western_zodiac", "summary", "warning", "fortune_2025", "zodiac_annual_fortune"]
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

    const contents = history.filter(m => m.type !== 'error').map(m => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.type === 'user' ? (m.content || '') : (m.data ? JSON.stringify(m.data) : m.content || '') }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: `諮詢問題：${userQuery}` }]
    });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
                tools: [{ googleSearch: {} }]
            },
        });

        return JSON.parse(response.text) as AIResponse;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
