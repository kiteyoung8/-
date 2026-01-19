
import React, { useState, useEffect, useRef } from 'react';
// Fix: Added ArrowRight to the imported components from 'lucide-react' to resolve the compilation error on line 286.
import { 
  Send, Sparkles, Moon, Brain, CheckCircle2, Star, Edit3,
  Shield, Search, ExternalLink, Loader2, Key, RefreshCw, 
  AlertTriangle, Share2, Download, Zap, TrendingUp, Globe,
  ArrowRight
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './services/geminiService';
import { ChartData, Message, FormData as AppFormData, AIResponse } from './types';

const getAiStudio = () => (window as any).aistudio;

const LoadingOverlay = ({ state }: { state: 'thinking' | 'searching' }) => {
    const hints = [
        "正在對接 2025 離火運全球大數據...",
        "正在校準紫微星盤與當前時空相位...",
        "正在透過易經演算法模擬未來機率曲線...",
        "正在檢索全球科技與經濟趨勢預測...",
        "正在構建您的個人化科學改運模型..."
    ];
    const [hintIdx, setHintIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHintIdx((prev) => (prev + 1) % hints.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-indigo-500/20 shadow-2xl animate-pulse">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {state === 'searching' ? <Globe className="text-blue-400 animate-pulse" size={24}/> : <Brain className="text-amber-500 animate-pulse" size={24}/>}
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Quantum Metaphysics Engine</p>
                <h3 className="text-lg font-bold text-white mb-2">{hints[hintIdx]}</h3>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
            </div>
            <style>{`
                @keyframes loading {
                    0% { width: 0%; transform: translateX(0%); }
                    50% { width: 70%; transform: translateX(20%); }
                    100% { width: 0%; transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="grid grid-cols-4 grid-rows-4 gap-1 md:gap-2 h-[500px] md:h-[650px] w-full bg-slate-900/60 p-2 md:p-4 rounded-[2rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
            {chart.ziwei.grid.map((palace) => (
                <div 
                    key={palace.zhi} 
                    style={{ gridArea: palace.gridArea }}
                    className={`border border-white/5 p-2 flex flex-col relative transition-all duration-500 rounded-2xl ${palace.isLifePalace ? 'bg-indigo-600/20 ring-2 ring-indigo-500/30' : 'bg-slate-800/40 hover:bg-slate-800/60'}`}
                >
                    <div className="text-[10px] text-slate-500 absolute top-2 right-2 font-mono">{palace.zhi}</div>
                    <div className={`text-xs font-black border-b pb-1 mb-2 ${palace.isLifePalace ? 'text-indigo-300 border-indigo-500/30' : 'text-amber-500/80 border-white/5'}`}>
                        {palace.name}
                    </div>
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[70%] scrollbar-hide">
                        {palace.stars.map((star, idx) => (
                            <div key={idx} className={`text-[10px] md:text-[12px] leading-tight flex items-center gap-1 font-bold ${star.color}`}>
                                <span className="truncate">{star.name}</span>
                                {star.transformation && (
                                    <span className="bg-red-600 text-white text-[8px] px-1 rounded-sm scale-90">
                                        {star.transformation}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto text-[9px] text-slate-500 flex justify-between items-center pt-1 border-t border-white/5">
                        <span className="font-mono">{palace.decades}</span>
                        <span className="font-black text-indigo-400">{palace.gan}</span>
                    </div>
                </div>
            ))}
            
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-6 bg-slate-800/40 rounded-3xl backdrop-blur-xl border border-white/10 shadow-inner z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 flex items-center justify-center mb-4 border border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-pulse">
                    <Moon className="text-indigo-300" size={32} />
                </div>
                <h2 className="text-xl md:text-3xl font-serif-heavy text-white mb-2 tracking-tighter">{chart.profile.name}</h2>
                <div className="space-y-1">
                    <p className="text-[10px] md:text-xs text-slate-400 font-mono tracking-widest">{chart.bazi.year} / {chart.bazi.month} / {chart.bazi.day}</p>
                    <div className="inline-block px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-2">
                        {chart.ziwei.bureau}
                    </div>
                </div>
                <button 
                    onClick={onEdit} 
                    className="mt-6 p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95"
                >
                    <Edit3 size={16} />
                </button>
            </div>
        </div>
    );
};

const MessageItem = ({ m, onRetryKey }: { m: Message, onRetryKey: () => void }) => {
    if (m.type === 'user') {
        return (
            <div className="flex justify-end animate-fade-in mb-6">
                <div className="bg-indigo-600 text-white px-6 py-4 rounded-[2rem] rounded-tr-none max-w-[85%] shadow-xl font-bold border border-white/10">
                    {m.content}
                </div>
            </div>
        );
    }

    if (m.type === 'error') {
        return (
            <div className="mb-8 animate-fade-in">
                <div className="text-red-400 p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-sm flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="shrink-0"/>
                        <p className="font-bold">{m.content}</p>
                    </div>
                    {m.content?.includes("金鑰") && (
                        <button 
                            onClick={onRetryKey} 
                            className="w-full md:w-fit px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14}/> 重新手動授權 Gemini API
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (m.isGreeting) {
        return (
            <div className="mb-8 animate-fade-in">
                <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={80}/></div>
                    <div className="flex items-center gap-3 text-amber-500 mb-4 font-black tracking-widest uppercase text-xs">
                        <Zap size={16}/> 核心顧問系統啟動中
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium text-lg">{m.content}</p>
                </div>
            </div>
        );
    }

    if (m.data) {
        return (
            <div className="space-y-8 mb-12 animate-fade-in report-container">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-indigo-600"></div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-3xl font-serif-heavy text-amber-400 tracking-tight">{m.data.executive_summary.title}</h3>
                        <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-tighter">
                            2025 Prediction
                        </div>
                    </div>
                    <p className="text-indigo-300 font-black text-lg mb-4 italic flex items-center gap-2">
                        <TrendingUp size={20}/> 「{m.data.executive_summary.direction}」
                    </p>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base font-medium">{m.data.executive_summary.description}</p>
                </div>

                {m.data.groundingSources && m.data.groundingSources.length > 0 && (
                    <div className="flex flex-col gap-3 px-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Globe size={12}/> 即時全球資訊對照：
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {m.data.groundingSources.map((s: any, idx: number) => (
                                <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500/5 border border-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-2 hover:bg-blue-500/15 transition-all shadow-sm">
                                    <Search size={12}/> {s.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/30 p-6 rounded-3xl border border-purple-500/10 hover:border-purple-500/30 transition-colors group">
                        <h4 className="text-[10px] text-purple-400 mb-4 font-black uppercase tracking-widest flex items-center gap-3">
                            <Moon size={16} className="group-hover:rotate-12 transition-transform"/> 玄學透視
                        </h4>
                        <p className="text-sm text-slate-300 leading-loose font-medium">{m.data.metaphysical_perspective.content}</p>
                    </div>
                    <div className="bg-slate-800/30 p-6 rounded-3xl border border-indigo-500/10 hover:border-indigo-500/30 transition-colors group">
                        <h4 className="text-[10px] text-indigo-400 mb-4 font-black uppercase tracking-widest flex items-center gap-3">
                            <Brain size={16} className="group-hover:scale-110 transition-transform"/> 科學解析
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] text-slate-500 block mb-1">心理維度</span>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{m.data.scientific_decoding.psychology}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block mb-1">邏輯規律</span>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{m.data.scientific_decoding.physics}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-inner group">
                    <h4 className="flex items-center gap-3 text-emerald-400 font-black text-xl mb-6">
                        <CheckCircle2 size={24}/> 實戰改運建議
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {m.data.actionable_advice.map((a: any, idx: number) => (
                            <div key={idx} className="text-sm text-slate-200 flex flex-col gap-2 bg-slate-900/60 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">[{a.type}]</span>
                                <p className="leading-relaxed font-bold">{a.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({
        name: '', gender: 'male', birthDate: '1995-06-15', birthTime: '10:30',
        inputType: 'solar', lunarYear: '', lunarMonth: '', lunarDay: ''
    });
    const isApiKeyInjected = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
    const [hasKey, setHasKey] = useState<boolean>(isApiKeyInjected);

    useEffect(() => {
        const checkKey = async () => {
            const studio = getAiStudio();
            if (!isApiKeyInjected && studio) {
                try {
                    const selected = await studio.hasSelectedApiKey();
                    setHasKey(selected);
                } catch (e) { console.error(e); }
            }
        };
        checkKey();
    }, [isApiKeyInjected]);

    const handleKeySelect = async () => {
        const studio = getAiStudio();
        if (studio) {
            await studio.openSelectKey();
            setHasKey(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full"></div>
            
            <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-6 transform hover:rotate-0 transition-transform duration-500">
                        <Sparkles className="text-white" size={40} />
                    </div>
                    <h1 className="text-3xl font-serif-heavy text-white tracking-tight mb-2">全能命理科學顧問</h1>
                    <p className="text-slate-400 text-sm tracking-widest uppercase font-bold text-center">AI Powered Metaphysics & Global Trends</p>
                </div>

                {!hasKey && (
                    <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl ring-4 ring-amber-500/5">
                        <div className="flex items-start gap-4 mb-4">
                            <Key className="text-amber-500 shrink-0 mt-1" size={24}/>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-amber-100 font-bold">需啟用 AI 授權功能</p>
                                <p className="text-xs text-amber-400/70 leading-relaxed">為了進行即時全球趨勢檢索，建議點擊下方按鈕選取 Gemini API 金鑰進行授權。</p>
                            </div>
                        </div>
                        <button onClick={handleKeySelect} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 group">
                            授權 Gemini API <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                )}

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onStart(formData); }}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">您的姓名</label>
                        <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="輸入姓名" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">生理性別</label>
                            <select className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                <option value="male">乾造 (男)</option><option value="female">坤造 (女)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">出生日期</label>
                            <input required type="date" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">出生時辰</label>
                        <input required type="time" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white outline-none" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 mt-6 text-xl active:scale-95">
                        啟動 AI 分析 <Zap size={24}/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'ai', content: '尊貴的訪客，命盤系統已就緒。您可以詢問關於 2025 年事業擴張、投資方向或當前困局的解決之道。', isGreeting: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | null>(null);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        
        const isTrend = queryText.match(/2025|未來|現況|趨勢|最近|今年|明年|行情/);
        setLoadingState(isTrend ? 'searching' : 'thinking');
        
        setMessages(prev => [...prev, { type: 'user', content: queryText }]);
        setIsLoading(true);
        
        try {
            const data = await callGeminiAPI(chart, queryText, messages);
            setMessages(prev => [...prev, { type: 'ai', data, question: queryText }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: err.message === "ENV_KEY_MISSING" ? "環境金鑰尚未配置，請先點擊授權。" : `分析中斷：${err.message}` 
            }]);
        } finally {
            setIsLoading(false);
            setLoadingState(null);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const q = input;
        setInput('');
        performQuery(q);
    };

    const handleExport = () => {
        const element = document.getElementById('report-area');
        if (!element) return;
        const opt = {
            margin: 10,
            filename: `命理科學報告-${chart?.profile.name}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#050505' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        (window as any).html2pdf().set(opt).from(element).save();
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen pt-12 pb-48 bg-[#050505] flex flex-col items-center">
            <div id="report-area" className="w-full max-w-4xl px-4 space-y-12">
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Star className="text-white" size={20}/>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Consultant View</h4>
                            <p className="text-[10px] text-slate-500">System V3.1.2025</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExport} className="p-3 bg-white/5 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-2xl border border-white/5 transition-all">
                            <Download size={20}/>
                        </button>
                        <button onClick={() => setChart(null)} className="p-3 bg-white/5 hover:bg-slate-800 text-slate-400 rounded-2xl border border-white/5 transition-all">
                            <Edit3 size={20}/>
                        </button>
                    </div>
                </div>

                <ZiweiChart chart={chart} onEdit={() => setChart(null)} />
                
                <div className="space-y-12">
                    {messages.map((m, i) => (
                        <MessageItem key={i} m={m} onRetryKey={async () => {
                            const studio = getAiStudio();
                            if (studio) {
                                await studio.openSelectKey();
                                if (m.question) performQuery(m.question);
                            }
                        }} />
                    ))}
                    {isLoading && loadingState && (
                        <div className="flex justify-center animate-fade-in py-8">
                            <LoadingOverlay state={loadingState} />
                        </div>
                    )}
                    <div ref={endRef} className="h-4"/>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        disabled={isLoading} 
                        placeholder="在此輸入您的疑問，例如：2025 年適合創業嗎？" 
                        className="w-full bg-slate-800/80 backdrop-blur-2xl border-2 border-white/5 rounded-3xl px-8 py-6 text-white outline-none focus:border-indigo-500/50 pr-24 text-lg shadow-2xl transition-all placeholder:text-slate-600" 
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading} 
                        className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={28}/> : <Send size={28}/>}
                    </button>
                </form>
            </div>
            
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
};
