
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Brain, Edit3, Loader2, RefreshCw, Download, 
  ArrowRight, ChevronRight,
  Compass, BookOpen, Rocket, Target, CheckCircle2,
  HeartPulse, Users, Wallet, Microscope, ShieldCheck, Search,
  AlertCircle
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './geminiService'; 
import { ChartData, Message, FormData as AppFormData, AIResponse } from './types';

declare const html2pdf: any;

const GUIDANCE_QUESTIONS = [
    { label: "命盤解析", icon: <Brain size={20}/>, query: "請根據我的命盤格局，進行全面的深度解析，包含主星特質、核心格局大局以及天賦潛能。" },
    { label: "2026整體運勢", icon: <Sparkles size={20}/>, query: "請深度分析 2026 丙午年的整體運勢走勢，包含流年四化對我的具體宮位衝擊與機會。" },
    { label: "財運分析", icon: <Wallet size={20}/>, query: "分析我 2026 年的財帛宮與祿存星動向，針對財富佈局、投資避險給予具體戰略建議。" },
    { label: "人際博弈", icon: <Users size={20}/>, query: "從交友宮與父母宮角度，分析我 2026 年的人際博弈、貴人運勢以及職場社交管理策略。" },
    { label: "健康提醒", icon: <HeartPulse size={20}/>, query: "分析我 2026 年的疾厄宮狀況，針對潛在的健康風險、身心平衡與生活節奏調整給予建議。" }
];

const INITIAL_MESSAGES: Message[] = [{ 
    type: 'ai', 
    content: '尊貴的諮詢者，我是您的 AI 戰略顧問。我已為您排定命盤。您可以從下方的熱門主題中選擇，或直接在對話框輸入您的需求。', 
    isGreeting: true 
}];

const THINKING_STEPS = [
    { label: "啟動戰略引擎", icon: <Rocket size={18}/>, color: "text-indigo-400" },
    { label: "解析 2026 丙午年流年四化軌跡", icon: <Sparkles size={18}/>, color: "text-amber-400" },
    { label: "深度對齊命盤宮位星曜配置", icon: <Compass size={18}/>, color: "text-blue-400" },
    { label: "檢索 Google Search 全球趨勢", icon: <Search size={18}/>, color: "text-emerald-400" },
    { label: "構建客製化戰略方案", icon: <ShieldCheck size={18}/>, color: "text-rose-400" }
];

const ProfessionalPDFTemplate = ({ messages, chart, id }: { messages: Message[], chart: ChartData, id: string }) => {
    const reportData = messages.filter(m => m.data);

    return (
        <div id={id} className="bg-white text-slate-900" style={{ width: '794px', minHeight: '1123px', padding: '0', margin: '0', boxSizing: 'border-box', fontFamily: 'serif', display: 'block', overflow: 'hidden' }}>
            <div className="flex flex-col items-center justify-center text-center relative" style={{ height: '1120px', width: '794px', pageBreakAfter: 'always', backgroundColor: '#ffffff', padding: '0 80px', boxSizing: 'border-box' }}>
                <div className="w-full border-t-4 border-b-4 border-indigo-600 py-24 relative flex flex-col items-center">
                    <div className="absolute -top-5 bg-white px-8 py-1 text-indigo-600 text-[14px] font-black tracking-[0.5em] uppercase border-2 border-indigo-600 rounded-full whitespace-nowrap">
                        Strategic Destiny Analysis
                    </div>
                    <h1 className="text-8xl font-black italic text-slate-900 leading-none mb-16 tracking-tighter text-center">
                        人生戰略<br/><span className="text-7xl">諮詢報告</span>
                    </h1>
                    <div className="mt-20 border-t border-slate-100 pt-16 space-y-12 w-full">
                        <div className="grid grid-cols-2 gap-12 w-full">
                            <div className="text-left border-l-4 border-indigo-600 pl-8">
                                <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-2">諮詢對象 / Client</p>
                                <p className="text-3xl font-bold text-slate-800">{chart.profile.name}</p>
                            </div>
                            <div className="text-left border-l-4 border-slate-200 pl-8">
                                <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-2">命盤格局 / Format</p>
                                <p className="text-3xl font-bold text-slate-800">{chart.ziwei.animal} / {chart.ziwei.fiveElements}局</p>
                            </div>
                        </div>
                        <div className="pt-10 flex justify-center items-center gap-6 text-slate-400">
                            <div className="h-px w-16 bg-slate-200"></div>
                            <span className="text-sm italic font-serif tracking-widest">ISSUED ON: {new Date().toLocaleDateString()}</span>
                            <div className="h-px w-16 bg-slate-200"></div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-24 left-0 right-0 text-center">
                    <p className="text-[11px] text-slate-300 font-mono tracking-[0.8em] uppercase">Intelligence by Gemini AI System</p>
                </div>
            </div>
            <div className="p-20 space-y-24" style={{ width: '794px', boxSizing: 'border-box' }}>
                {reportData.map((m, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-20 last:border-0">
                        <div className="flex items-center gap-8 mb-12" style={{ pageBreakInside: 'avoid' }}>
                            <span className="text-9xl font-black text-slate-100 leading-none" style={{ fontFamily: 'sans-serif' }}>{idx + 1}</span>
                            <div className="pt-6">
                                <p className="text-[12px] font-black text-indigo-600 tracking-[0.4em] uppercase mb-2">STRATEGIC ANALYSIS CASE</p>
                                <h2 className="text-4xl font-bold text-slate-800 leading-tight">{m.question}</h2>
                            </div>
                        </div>
                        <div className="space-y-10">
                            <div style={{ pageBreakInside: 'avoid' }}>
                                <h3 className="text-5xl font-black italic text-slate-900 border-l-8 border-indigo-600 pl-10 leading-tight mb-8">
                                    {m.data?.executive_summary.title}
                                </h3>
                                <div className="flex items-center gap-6 mb-8">
                                    <span className="bg-indigo-600 text-white text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                        核心方針：{m.data?.executive_summary.direction}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xl text-slate-700 leading-[1.8] text-justify whitespace-pre-wrap font-serif italic" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                {m.data?.executive_summary.description}
                            </p>
                        </div>
                        {m.data?.strategic_solutions && (
                            <div className="mt-16 space-y-8">
                                <h4 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3 mb-6">
                                    <Rocket size={20}/> 戰略執行核心方案
                                </h4>
                                <div className="grid grid-cols-1 gap-8">
                                    {m.data.strategic_solutions.map((sol, sIdx) => (
                                        <div key={sIdx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 shadow-sm" style={{ pageBreakInside: 'avoid' }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <h5 className="text-2xl font-bold text-slate-900">{sol.title}</h5>
                                                <span className={`px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${sol.priority === 'High' ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                                                    {sol.priority}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-8 leading-relaxed text-lg">{sol.description}</p>
                                            <div className="flex items-center gap-3 pt-6 border-t border-slate-200 text-emerald-600 font-bold text-[13px] uppercase tracking-widest">
                                                <Target size={18}/> 能量轉換預測：{sol.impact}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-16 space-y-6">
                            <h4 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3 mb-6">
                                <CheckCircle2 size={20}/> 具體執行清單 (Action Items)
                            </h4>
                            <div className="space-y-4">
                                {m.data?.actionable_advice.map((adv, aIdx) => (
                                    <div key={aIdx} className="flex gap-6 p-6 bg-indigo-50/40 border border-indigo-100 rounded-3xl items-start" style={{ pageBreakInside: 'avoid' }}>
                                        <span className="font-black text-indigo-600 text-[13px] shrink-0 pt-1">[{adv.type}]</span>
                                        <p className="text-[15px] text-slate-700 font-medium leading-relaxed">{adv.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-24 text-center border-t border-slate-100" style={{ width: '794px', pageBreakBefore: 'auto' }}>
                <p className="text-slate-300 font-mono text-[12px] uppercase tracking-[1em] mb-6">
                    End of Analysis Report
                </p>
                <p className="text-slate-400 text-sm italic font-serif leading-relaxed px-20">
                    本報告由東西命理科學顧問 AI 戰略引擎生成。分析結論基於紫微斗數大數據與時間能量概率預測，僅供個人決策與戰略佈局參考。
                </p>
            </div>
        </div>
    );
};

export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingStep, setThinkingStep] = useState(0);
    const [streamingTitle, setStreamingTitle] = useState("");
    const [input, setInput] = useState('');
    const [isReportMode, setIsReportMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (!isReportMode) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, isReportMode]);

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setThinkingStep(s => (s + 1) % THINKING_STEPS.length);
            }, 3000);
        } else {
            setThinkingStep(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleReset = () => {
        setChart(null);
        setMessages(INITIAL_MESSAGES);
        setIsReportMode(false);
        setIsLoading(false);
        setStreamingTitle("");
        setInput('');
        setIsExporting(false);
    };

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        
        setIsReportMode(false);
        setIsLoading(true);
        setStreamingTitle("");
        setInput('');

        const newHistory = [...messages, { type: 'user' as const, content: queryText }];
        setMessages(newHistory);

        try {
            const data = await callGeminiAPI(chart, queryText, messages, (fullText) => {
                try {
                    const titleMatch = fullText.match(/"title":\s*"([^"]+)"/);
                    if (titleMatch && titleMatch[1]) {
                        setStreamingTitle(titleMatch[1]);
                    }
                } catch (e) {}
            });
            
            setMessages(p => [...p, { type: 'ai', data, question: queryText }]);
        } catch (err: any) {
            console.error("Query Error:", err);
            setMessages(p => [...p, { 
                type: 'error', 
                content: "網路波動或 AI 思考過久。這通常是因為搜尋任務繁忙，請嘗試簡化提問後再次諮詢。",
                question: queryText
            }]);
        } finally {
            setIsLoading(false);
            setStreamingTitle("");
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('report-pdf-export-source');
        if (!element || !chart) return;

        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 2500));

        const opt = {
            margin: 0,
            filename: `戰略命理報告_${chart.profile.name}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        try {
            await html2pdf().from(element).set(opt).save();
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert("匯出 PDF 時發生錯誤。");
        } finally {
            setIsExporting(false);
        }
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="text-indigo-400" size={20}/>
                        </div>
                        <h1 className="text-xl font-serif font-black text-white tracking-tighter hidden md:block italic">東西命理科學顧問</h1>
                    </div>
                    <div className="flex gap-4">
                        {messages.some(m => m.data) && (
                            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                                <button onClick={() => setIsReportMode(false)} className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${!isReportMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>對話</button>
                                <button onClick={() => setIsReportMode(true)} className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isReportMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>報告</button>
                            </div>
                        )}
                        {messages.some(m => m.data) && (
                            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-xl disabled:opacity-50">
                                {isExporting ? <Loader2 className="animate-spin" size={14}/> : <Download size={14}/>}
                                {isExporting ? '生成中...' : '下載報告'}
                            </button>
                        )}
                        <button onClick={handleReset} title="重置對話" className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-full border border-white/10 transition-all active:rotate-180 duration-500"><RefreshCw size={18}/></button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl px-6 pt-32 pb-48 flex flex-col gap-12">
                {!isReportMode ? (
                    <>
                        <ZiweiChart chart={chart} onEdit={handleReset} />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
                            {GUIDANCE_QUESTIONS.map((q, idx) => (
                                <button key={idx} onClick={() => performQuery(q.query)} disabled={isLoading} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-900/50 border border-white/5 rounded-3xl hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all group active:scale-95 disabled:opacity-50">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">{q.icon}</div>
                                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{q.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-10">
                            {messages.map((m, i) => (
                                <div key={i} className="animate-fade-in">
                                    {m.type === 'user' ? (
                                        <div className="flex justify-end">
                                            <div className="bg-white/5 backdrop-blur-md text-white px-8 py-5 rounded-[2rem] rounded-tr-none border border-white/10 max-w-[80%] text-xl font-bold leading-relaxed shadow-xl">{m.content}</div>
                                        </div>
                                    ) : m.isGreeting ? (
                                        <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 italic text-slate-400 text-lg font-serif font-black leading-relaxed shadow-inner">{m.content}</div>
                                    ) : m.data ? (
                                        <div className="bg-slate-900/60 backdrop-blur-3xl p-8 md:p-14 rounded-[3.5rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                                            <div className="relative z-10 space-y-10">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3"><span className="h-10 w-2 bg-indigo-600 rounded-full"></span><h2 className="text-4xl md:text-5xl font-serif font-black text-white italic tracking-tight">{m.data.executive_summary.title}</h2></div>
                                                </div>
                                                <div className="space-y-8 text-slate-300 text-xl leading-relaxed font-serif text-justify border-l border-white/5 pl-8 ml-2 italic">
                                                    <div className="flex flex-wrap gap-4 mb-6">
                                                        <span className="px-5 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest">{m.data.executive_summary.direction}</span>
                                                        <span className="px-5 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-black uppercase tracking-widest">⚠️ 警示：{m.data.zodiac_fortune.warning}</span>
                                                    </div>
                                                    {m.data.executive_summary.description}
                                                </div>
                                                {m.data.strategic_solutions && (
                                                    <div className="space-y-6">
                                                        <h3 className="text-lg font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2"><Rocket size={18}/> 戰略建議方案</h3>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {m.data.strategic_solutions.map((sol, idx) => (
                                                                <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h4 className="text-white font-bold text-lg">{sol.title}</h4>
                                                                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sol.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{sol.priority}</span>
                                                                    </div>
                                                                    <p className="text-slate-400 text-sm leading-relaxed mb-3">{sol.description}</p>
                                                                    <p className="text-emerald-400 text-xs font-bold flex items-center gap-2"><CheckCircle2 size={14}/> 核心影響：{sol.impact}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : m.type === 'error' ? (
                                        <div className="flex justify-center">
                                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-8 py-6 rounded-3xl text-sm font-bold flex flex-col items-center gap-4 max-w-lg text-center">
                                                <div className="flex items-center gap-3 text-red-500">
                                                    <AlertCircle size={24}/> 
                                                    <span className="text-lg font-black">分析中斷</span>
                                                </div>
                                                <p className="text-slate-400 leading-relaxed font-medium">{m.content}</p>
                                                <button onClick={() => m.question && performQuery(m.question)} className="px-6 py-2 bg-red-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600">點此重新嘗試</button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex flex-col gap-6 animate-fade-in">
                                    <div className="bg-slate-900/60 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                                <Loader2 className="animate-spin text-white" size={28}/>
                                            </div>
                                            <div className="space-y-2">
                                                <p className={`text-xl font-serif font-black italic tracking-tight transition-all duration-500 ${THINKING_STEPS[thinkingStep].color}`}>
                                                    {THINKING_STEPS[thinkingStep].label}...
                                                </p>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                                                    {THINKING_STEPS[thinkingStep].icon} 高速引擎正在處理
                                                </div>
                                            </div>
                                        </div>
                                        {streamingTitle && (
                                            <div className="pt-6 border-t border-white/5 animate-fade-in">
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">預覽戰略核心 (Partial Preview)...</p>
                                                <h3 className="text-2xl font-serif font-black text-indigo-400 italic">「{streamingTitle}」</h3>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-5 gap-2 pt-4">
                                            {THINKING_STEPS.map((_, i) => (
                                                <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === thinkingStep ? 'bg-indigo-500 w-full' : 'bg-white/10 w-full opacity-30'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center gap-10 py-10 bg-white/5 rounded-[4rem]">
                        <div className="text-center space-y-2"><h2 className="text-2xl font-serif font-black italic text-white">報告預覽區</h2><p className="text-slate-400 text-xs">下載 PDF 以獲取最佳閱讀體驗。</p></div>
                        <div className="shadow-2xl transform scale-[0.6] md:scale-90 origin-top bg-white border border-slate-200">
                            <ProfessionalPDFTemplate id="report-preview-view" messages={messages} chart={chart} />
                        </div>
                    </div>
                )}
            </div>

            {!isReportMode && (
                <div className="fixed bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/95 to-transparent z-40">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <form onSubmit={(e) => { e.preventDefault(); performQuery(input); }} className="relative group">
                            <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="輸入提問 (例如：2026 創業方向、感情佈局...)" className="w-full bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-full px-12 py-7 text-white text-xl outline-none focus:border-indigo-500/50 pr-28 shadow-2xl transition-all font-serif" />
                            <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-4 top-4 bottom-4 aspect-square bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-30"><ChevronRight size={32} /></button>
                        </form>
                    </div>
                </div>
            )}

            <div className="fixed" style={{ top: '0', left: '0', zIndex: -1000, visibility: 'hidden', pointerEvents: 'none' }}>
                <div style={{ width: '794px', backgroundColor: '#ffffff' }}>
                    {chart && <ProfessionalPDFTemplate id="report-pdf-export-source" messages={messages} chart={chart} />}
                </div>
            </div>
        </div>
    );
};

const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({ name: '', gender: 'male', birthDate: '1995-01-01', birthTime: '12:00', inputType: 'solar', lunarYear: '', lunarMonth: '', lunarDay: '' });
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(79,70,229,0.1)] animate-fade-in">
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 rotate-3"><Sparkles className="text-white" size={40} /></div>
                    <h1 className="text-5xl font-serif font-black text-white mb-4 italic tracking-tight">東西命理科學顧問</h1>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] opacity-80 italic">A.I. STRATEGY ENGINE</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onStart(formData); }} className="space-y-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">諮詢者全名</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="輸入姓名" className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生日期</label>
                            <input required type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-lg transition-all" style={{colorScheme: 'dark'}} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生時辰</label>
                            <input required type="time" value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-lg transition-all" style={{colorScheme: 'dark'}} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {(['male', 'female'] as const).map(g => (
                            <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className={`flex-1 py-6 rounded-[2rem] border font-black text-[11px] uppercase tracking-[0.2em] transition-all ${formData.gender === g ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>{g === 'male' ? '乾造 (MALE)' : '坤造 (FEMALE)'}</button>
                        ))}
                    </div>
                    <button type="submit" className="w-full bg-white text-slate-950 py-7 rounded-[2.5rem] font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl mt-4">開啟命運解析 <ArrowRight size={24} /></button>
                </form>
            </div>
        </div>
    );
};

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="grid grid-cols-4 grid-rows-4 gap-3 h-[700px] md:h-[900px] w-full bg-slate-900/30 p-6 rounded-[4rem] border border-white/5 backdrop-blur-2xl shadow-2xl relative">
            {chart.ziwei.grid.map((palace) => (
                <div key={palace.zhi} style={{ gridArea: palace.gridArea }} className={`border border-white/5 p-4 flex flex-col relative rounded-3xl ${palace.isLifePalace ? 'bg-indigo-600/20 ring-1 ring-indigo-500/50 z-10' : 'bg-slate-900/60'}`}>
                    <div className="text-[10px] text-slate-600 absolute top-3 right-4 font-black">{palace.zhi}</div>
                    <div className={`text-xs font-black mb-3 pb-2 border-b flex justify-between ${palace.isLifePalace ? 'text-indigo-400 border-indigo-500/30' : 'text-slate-500 border-white/5'}`}>{palace.name}</div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                        {palace.stars.map((s, idx) => (
                            <div key={idx} className={`text-[10px] md:text-xs font-bold ${s.color} flex justify-between items-center`}>
                                <span>{s.name}</span>
                                {s.transformation && <span className="text-[8px] px-1 bg-indigo-600 text-white rounded font-black">{s.transformation}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-10 bg-slate-900/90 rounded-[3rem] border border-white/10 z-20 shadow-2xl">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-white/20 shadow-2xl mb-8 rotate-3"><Compass className="text-white" size={40} /></div>
                <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-3 italic tracking-tighter">{chart.profile.name}</h2>
                <div className="flex gap-3 mb-8">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-500/30">{chart.ziwei.animal}年</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-4 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-500/30">{chart.western.zodiac}</span>
                </div>
                <button onClick={onEdit} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-full border border-white/10 transition-all"><Edit3 size={20} /></button>
            </div>
        </div>
    );
};
