
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, AIResponse, Message } from "./types";

/**
 * Calls Gemini API to generate analytical content based on ChartData.
 * Implements Google GenAI SDK best practices for structured JSON output and Search grounding.
 */
export const callGeminiAPI = async (chartData: ChartData, userQuery: string, history: Message[] = []): Promise<AIResponse> => {
    // API key must be obtained from environment variable.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
        console.error("Critical: API_KEY is missing in environment.");
        throw new Error("ENV_KEY_MISSING");
    }

    // Always create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey });
    
    const lifePalace = chartData.ziwei.grid.find(p => p.isLifePalace);
    const lifeStars = lifePalace?.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、') || '無主星';

    const systemInstruction = `
    # Role: 東西命理科學總顧問 (融合紫微斗數、西方占星與全球戰略模型)
    你是一位精通東西方玄學，並具備現代商業分析背景的 AI 顧問。
    
    ## 語系要求：
    **必須使用「繁體中文」進行回覆。**
    
    ## 命主數據：
    - 姓名: ${chartData.profile.name}
    - 命宮主星: ${lifeStars}
    - 生肖: ${chartData.ziwei.animal}
    - 2025 流年: 乙巳年 (天機化祿、天梁化權、紫微化科、太陰化忌)
    - 2026 流年: 丙午年 (天同化祿、天機化權、文昌化科、廉貞化忌)
    
    ## 解析任務：
    1. **實時趨勢**：利用 googleSearch 獲取 2025 年與 2026 年的全球宏觀趨勢（如 AI 發展、經濟環境）。
    2. **2025 生肖運勢 (重點新增)**：在 zodiac_fortune 欄位下，針對諮詢者生肖「${chartData.ziwei.animal}」，提供 fortune_2025 內容。
       - 內容應包含：2025 年的核心運勢、當前生肖在乙巳年需注意的「犯太歲」或「合太歲」影響、以及在年底前應做好的戰略布局。
    3. **2026 深度解析**：詳細展開丙午年的戰略預測。
    4. **結構化輸出**：確保輸出為精確的 JSON，且具備雜誌級別的文筆，專業且富有啟發性。
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
                    fortune_2025: { 
                        type: Type.STRING, 
                        description: "諮詢者生肖在 2025 乙巳年的運勢簡析與具體注意事項。" 
                    },
                    zodiac_annual_fortune: { 
                        type: Type.STRING, 
                        description: "詳細的 2026 丙午年全年度生肖運勢分析。" 
                    }
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

        const text = response.text.trim();
        const result = JSON.parse(text) as AIResponse;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            result.groundingSources = groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    title: chunk.web?.title || '實時數據參考',
                    uri: chunk.web?.uri || '#'
                }));
        }

        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
