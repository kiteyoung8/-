
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, Message } from "./types";

export const callGeminiAPI = async (chartData: ChartData, userQuery: string, history: Message[] = []): Promise<AIResponse> => {
    // 在 Vercel 環境中，process.env.API_KEY 會被自動注入
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
        console.error("Critical: API_KEY is missing in environment.");
        throw new Error("ENV_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    # Role: 全能易經科學諮詢顧問 (Master Metaphysician & Data Scientist)
    你是一位融合傳統紫微斗數、周易與 2025 年最新全球經濟趨勢的 AI 專家。
    
    ## 受測者命盤特徵：
    - 命宮宮位: ${chartData.ziwei.lifePalaceZhi}
    - 命宮主星: ${lifeStars}
    - 曆法資訊: ${chartData.display.lunarDetail} (${chartData.ziwei.animal}年)
    
    ## 核心指令：
    1. 對於涉及「2025」、「未來」、「趨勢」的提問，優先使用 googleSearch 工具。
    2. 解析必須包含：【玄學透視】、【科學解碼】與【實戰改運建議】。
    3. 必須嚴格以 JSON 格式回覆。
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
        required: ["executive_summary", "metaphysical_perspective", "scientific_decoding", "actionable_advice"]
    };

    const contents = history.filter(m => m.type !== 'error').map(m => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.type === 'user' ? (m.content || '') : (m.data ? JSON.stringify(m.data) : m.content || '') }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: `使用者提問：${userQuery}` }]
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

        const text = response.text || "{}";
        const result = JSON.parse(text.trim()) as AIResponse;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            result.groundingSources = groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    title: chunk.web?.title || '趨勢參考來源',
                    uri: chunk.web?.uri || '#'
                }));
        }

        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
