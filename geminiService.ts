
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
    # Role: 東西命理戰略總顧問
    
    ## 核心任務：建議方案 (Strategic Solutions)
    針對諮詢者的提問，你必須在回覆中加入「strategic_solutions」陣列。每個方案必須包含：
    1. **title**: 具備戰略質感的名稱。
    2. **priority**: "High", "Medium", 或 "Low"。
    3. **description**: 具體的執行步驟與路徑。
    4. **impact**: 該方案能如何轉化命盤能量或改善現實困境。

    ## 分析原則：
    - 結合《紫微斗數精成》與流年四化。
    - 文風應具備高端顧問質感，專業、果斷、富含洞察力。
    - 語系：繁體中文。

    ## 命主數據：
    - 姓名: ${chartData.profile.name}
    - 命主格局: ${lifeStars}
    - 流年關鍵: 2026 丙午年，天同化祿、天機化權、文昌化科、廉貞化忌。
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
                    fortune_2025: { type: Type.STRING },
                    zodiac_annual_fortune: { type: Type.STRING }
                },
                required: ["animal", "western_zodiac", "summary", "warning", "fortune_2025", "zodiac_annual_fortune"]
            },
            strategic_solutions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                        description: { type: Type.STRING },
                        impact: { type: Type.STRING }
                    },
                    required: ["title", "priority", "description", "impact"]
                }
            },
            metaphysical_perspective: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
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
                    properties: { type: { type: Type.STRING }, content: { type: Type.STRING } },
                    required: ["type", "content"]
                }
            }
        },
        required: ["executive_summary", "zodiac_fortune", "strategic_solutions", "metaphysical_perspective", "scientific_decoding", "actionable_advice"]
    };

    const contents = history.filter(m => m.type !== 'error').map(m => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.type === 'user' ? (m.content || '') : (m.data ? JSON.stringify(m.data) : m.content || '') }]
    }));

    contents.push({ role: 'user', parts: [{ text: `諮詢問題：${userQuery}` }] });

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
