
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChartData, AIResponse, Message } from "./types";

export const callGeminiAPI = async (
    chartData: ChartData, 
    userQuery: string, 
    history: Message[] = [],
    onStream?: (chunk: string) => void
): Promise<AIResponse> => {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
        throw new Error("ENV_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 構建詳細的十二宮位星曜配置
    const gridDetails = chartData.ziwei.grid.map(p => {
        const stars = p.stars.map(s => `${s.name}${s.transformation ? `(化${s.transformation})` : ''}`).join('、');
        return `【${p.name} / ${p.zhi}宮】：${stars || '無主星'}${p.isLifePalace ? ' (命宮)' : ''}${p.isBodyPalace ? ' (身宮)' : ''}`;
    }).join('\n');

    const systemInstruction = `
    # Role: 東西命理戰略總顧問 (Expert Strategist & Metaphysician)
    
    ## 核心任務
    你是一位融合紫微斗數大數據與現代戰略管理的高端顧問。你必須根據諮詢者的「完整命盤數據」來回答問題。
    你的回覆必須完全遵守 JSON 格式，且包含「strategic_solutions」陣列。
    
    ## 分析準則
    - **配合命盤解析**：方案內容必須引用命盤中的具體星曜或宮位關係（例如：利用官祿宮的XX星能量、避開廉貞化忌的衝擊）。
    - **流年四化 (2026 丙午)**：天同化祿、天機化權、文昌化科、廉貞化忌。
    - **文風**：專業、深沉、冷靜、果斷。
    - **語言**：繁體中文。

    ## 諮詢者數據：
    - 姓名: ${chartData.profile.name} (性別: ${chartData.profile.gender === 'male' ? '乾造' : '坤造'})
    - 五行局: ${chartData.ziwei.fiveElements}局
    ${gridDetails}
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

    // 優化對話歷史：將過往的 JSON 數據簡化為摘要，減少 Token 負擔並防止模型解析混亂
    const contents = history.filter(m => m.type !== 'error' && !m.isGreeting).map(m => {
        let textContent = m.content || "";
        if (m.data) {
            textContent = `歷史分析標題：${m.data.executive_summary.title}。核心方向：${m.data.executive_summary.direction}。`;
        }
        return {
            role: m.type === 'user' ? 'user' : 'model',
            parts: [{ text: textContent }]
        };
    });

    contents.push({ role: 'user', parts: [{ text: `諮詢問題：${userQuery}\n請輸出完整的 JSON 結構。` }] });

    try {
        // 切換為 gemini-3-flash-preview：更適合高速、大體量 JSON 生成與搜尋任務
        const stream = await ai.models.generateContentStream({
            model: "gemini-3-flash-preview",
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
                tools: [{ googleSearch: {} }]
            },
        });

        let fullText = "";
        for await (const chunk of stream) {
            const part = (chunk as GenerateContentResponse).text;
            if (part) {
                fullText += part;
                if (onStream) onStream(fullText);
            }
        }
        
        // 確保移除可能存在的 Markdown 標記
        const cleanedText = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText) as AIResponse;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
