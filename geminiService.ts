
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, Message } from "./types";

export const callGeminiAPI = async (chartData: ChartData, userQuery: string, history: Message[] = []): Promise<AIResponse> => {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
        console.error("Critical: API_KEY is missing in environment.");
        throw new Error("ENV_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    # Role: 全能命理科學總顧問 (基於《紫微斗數精成》與全球戰略模型)
    你是一位精通東方紫微斗數、玄學，並融合西方占星與現代大數據趨勢的 AI 顧問。
    
    ## 語系要求：
    **請務必使用「繁體中文」進行所有回覆。** 嚴禁使用簡體字。
    
    ## 命主數據：
    - 姓名: ${chartData.profile.name}
    - 命宮主星: ${lifeStars}
    - 生肖: ${chartData.ziwei.animal}
    - 2026 流年: 丙午年 (天同化祿、天機化權、文昌化科、廉貞化忌)
    
    ## 解析任務：
    1. **實時數據檢索**：針對 2026 年趨勢與全球局勢，必須使用 googleSearch 獲取最新報導與經濟預測。
    2. **生肖年度運勢 (重要)**：在回覆的 zodiac_fortune 欄位中，根據命主生肖「${chartData.ziwei.animal}」，詳細分析其在 2026 年的事業、財運、健康與人際注意事項。
    3. **輸出格式**：嚴格遵循 JSON，且所有內容（標題、描述、建議）均需使用繁體中文。
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
                    zodiac_annual_fortune: { type: Type.STRING, description: "詳細的 2026 年生肖年度運勢分析與注意事項。" }
                },
                required: ["animal", "western_zodiac", "summary", "warning", "zodiac_annual_fortune"]
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
        parts: [{ text: `當前諮詢問題：${userQuery}` }]
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

        const text = response.text.trim();
        const result = JSON.parse(text) as AIResponse;
        
        // 處理 Grounding
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            result.groundingSources = groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    title: chunk.web?.title || '外部參考資料',
                    uri: chunk.web?.uri || '#'
                }));
        }

        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
