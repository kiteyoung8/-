
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
    # Role: 東西方命理科學總顧問 (基於《紫微斗數精成》分析模型)
    你是一位精通《紫微斗數精成》理論體系的 AI 專家，融合東方「立體多維命運軌跡」與西方「行為心理戰略」。
    
    ## 語系要求：
    **請務必使用「繁體中文」進行所有內容的回覆。** 嚴禁使用簡體字。
    
    ## 核心解析依據：
    1. **星情論斷法**：以星曜性質與四化觸發點為主要依據。
    2. **體用關係**：原命盤為先天定數，2025 流年為後天際遇。
    
    ## 受測者命盤數據：
    - 姓名: ${chartData.profile.name}
    - 命宮主星: ${lifeStars}
    - 生肖: ${chartData.ziwei.animal}
    - 2025 流年: 乙巳年 (天機化祿、天梁化權、紫微化科、太陰化忌)
    
    ## 輸出格式：
    必須回覆 JSON 格式，且所有中文字段必須為「繁體中文」。
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
                    zodiac_annual_fortune: { type: Type.STRING }
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

        const result = JSON.parse(response.text.trim()) as AIResponse;
        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
