
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, FileText, Download, 
  ArrowRight, Moon, Brain, CheckCircle2,
  ChevronRight, Info, Calendar, Star, Edit3,
  Printer, ArrowLeft, Sun, Shield, Zap, Heart,
  Gem, Compass, Target, TrendingUp, UserSearch, Briefcase, Search, ExternalLink, Loader2, Key
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './services/geminiService';
import { ChartData, Message, FormData as AppFormData, PalaceData, AIResponse, Star as StarType } from './types';

// --- Component: ZiweiChart ---
const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="grid grid-cols-4 grid-rows-4 gap-1 md:gap-2 h-[500px] md:h-[600px] w-full bg-slate-900/40 p-2 md:p-4 rounded-3xl relative overflow-hidden ring-1 ring-white/10 shadow-inner">
            {chart.ziwei.grid.map((palace) => (
                <div 
                    key={palace.zhi} 
                    style={{ gridArea: palace.gridArea }}
                    className={`border border-white/5 p-2 flex flex-col relative transition-all duration-500 rounded-xl ${palace.isLifePalace ? 'bg-indigo-600/20 ring-1 ring-indigo-500/40' : 'bg-slate-800/40 hover:bg-slate-800/60'}`}
                >
                    <div className="text-[9px] text-slate-500 absolute top-1 right-2 font-mono uppercase">{palace.zhi}</div>
                    <div className={`text-xs font-black border-b pb-1 mb-2 ${palace.isLifePalace ? 'text-indigo-300 border-indigo-500/30' : 'text-amber-500/80 border-white/5'}`}>
                        {palace.name}
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[70%] scrollbar-hide">
                        {palace.stars.map((star, idx) => (
                            <div key={idx} className={`text-[10px] md:text-[11px] leading-tight flex items-center gap-1 font-medium ${star.color}`}>
                                <span className="truncate">{star.name}</span>
                                {star.transformation && (
                                    <span className="bg-red-500/80 text-white text-[8px] px-1 rounded ml-auto scale-90">
                                        {star.transformation}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto text-[9px] text-slate-500 flex justify-between items-center pt-1 border-t border-white/5 opacity-70">
                        <span>{palace.decades}</span>
                        <span className="font-bold">{palace.gan}</span>
                    </div>
                </div>
            ))}
            
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-4 bg-slate-800/30 rounded-2xl backdrop-blur-md border border-white/5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center mb-2 border border-indigo-500/30">
                    <Moon className="text-indigo-400" size={24} />
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-black text-white mb-1">{chart.profile.name}</h2>
                <div className="text-[10px] text-slate-400">
                    <p>{chart.bazi.year} / {chart.bazi.month} / {chart.bazi.day}</p>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest mt-1">{chart.ziwei.bureau}</p>
                </div>
                <button 
                    onClick={onEdit} 
                    className="mt-4 p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full border border-white/10 transition-all"
                >
                    <Edit3 size={12} />
                </button>
            </div>
        </div>
    );
};

// --- View: InputForm ---
const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({
        name: '', gender: 'male', birthDate: '1995-06-15', birthTime: '10:30',
        inputType: 'solar', lunarYear: '', lunarMonth: '', lunarDay: ''
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-fade-in border border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl rotate-3">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">紫微大數據智庫</h1>
                    <p className="text-slate-400 mt-2 text-sm text-center">輸入出生資訊，由 AI 為您開啟智慧對話</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onStart(formData); }}>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">姓名</label>
                        <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">性別</label>
                            <select className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                <option value="male">男</option><option value="female">女</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">曆法</label>
                            <select className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none" value={formData.inputType} onChange={e => setFormData({...formData, inputType: e.target.value as any})}>
                                <option value="solar">陽曆</option><option value="lunar">農曆</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">日期</label>
                            <input required type="date" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">時間</label>
                            <input required type="time" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 group">
                        生成命盤 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- View: Dashboard ---
const DashboardView = ({ chart, messages, setMessages, isLoading, setIsLoading, input, setInput, onEdit }: any) => {
    const endRef = useRef<HTMLDivElement>(null);
    const [hasKey, setHasKey] = useState(!!process.env.API_KEY);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | null>(null);

    // 自動檢查金鑰狀態
    useEffect(() => {
        const check = async () => {
            if (window.aistudio?.hasSelectedApiKey) {
                const selected = await window.aistudio.hasSelectedApiKey();
                if (selected) setHasKey(true);
            }
        };
        check();
    }, []);

    const handleKeySelect = async () => {
        if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
            setHasKey(true);
        }
    };

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading) return;
        
        const isTrend = queryText.match(/2025|未來|現況|趨勢|最近/);
        setLoadingState(isTrend ? 'searching' : 'thinking');
        
        setMessages((prev: any) => [...prev, { type: 'user', content: queryText }]);
        setIsLoading(true);
        
        try {
            const data = await callGeminiAPI(chart, queryText, messages);
            setMessages((prev: any) => [...prev, { type: 'ai', data, question: queryText }]);
        } catch (err: any) {
            setMessages((prev: any) => [...prev, { type: 'error', content: err.message }]);
            if (err.message.includes("API Key") || err.message.includes("金鑰")) setHasKey(false);
        } finally {
            setIsLoading(false);
            setLoadingState(null);
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const q = input;
        setInput('');
        performQuery(q);
    };

    return (
        <div className="min-h-screen pt-8 pb-48 flex flex-col bg-[#050505] max-w-4xl mx-auto px-4">
            <div className="bg-slate-900/40 p-4 rounded-3xl mb-8 border border-white/5 shadow-2xl">
                 <ZiweiChart chart={chart} onEdit={onEdit} />
            </div>
            
            <div className="flex-1 space-y-6">
                {messages.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`${m.type === 'user' ? 'bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%]' : 'w-full'}`}>
                            {m.isGreeting ? (
                                <div className="bg-slate-800/60 p-6 rounded-2xl border border-white/5 shadow-xl">
                                    <div className="flex items-center gap-2 text-amber-500 mb-2 font-black"><Moon size={18}/> AI 命理導師</div>
                                    <p className="text-slate-300 leading-relaxed">{m.content}</p>
                                    {!hasKey && (
                                        <button 
                                            onClick={handleKeySelect}
                                            className="mt-6 flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
                                        >
                                            <Key size={16}/> 連接 Gemini API (請點此授權)
                                        </button>
                                    )}
                                </div>
                            ) : m.type === 'user' ? (
                                <p className="font-bold">{m.content}</p>
                            ) : m.data ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-800/95 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                                        <h3 className="text-2xl font-black text-amber-400 mb-2 tracking-tight">{m.data.executive_summary.title}</h3>
                                        <p className="text-slate-200 italic mb-3 opacity-80">「{m.data.executive_summary.direction}」</p>
                                        <p className="text-slate-300 text-sm leading-loose">{m.data.executive_summary.description}</p>
                                    </div>
                                    
                                    {m.data.groundingSources && (
                                        <div className="flex flex-wrap gap-2 px-2">
                                            {m.data.groundingSources.map((s: any, idx: number) => (
                                                <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded-full flex items-center gap-1 hover:bg-blue-500/30 transition-colors">
                                                    <Search size={10}/> {s.title}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-800/40 p-5 rounded-2xl border border-purple-500/20">
                                            <h4 className="text-[10px] text-purple-400 mb-3 font-black uppercase tracking-widest flex items-center gap-1"><Star size={12}/> 玄學解析</h4>
                                            <p className="text-xs text-slate-300 leading-loose">{m.metaphysical_perspective?.content || m.data.metaphysical_perspective.content}</p>
                                        </div>
                                        <div className="bg-slate-800/40 p-5 rounded-2xl border border-indigo-500/20">
                                            <h4 className="text-[10px] text-indigo-400 mb-3 font-black uppercase tracking-widest flex items-center gap-1"><Brain size={12}/> 科學視角</h4>
                                            <p className="text-xs text-slate-300 leading-loose">{m.data.scientific_decoding.psychology}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
                                        <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-4 tracking-tight"><CheckCircle2 size={18}/> 具體建議與改運</h4>
                                        <div className="space-y-3">
                                            {m.data.actionable_advice.map((a: any, idx: number) => (
                                                <div key={idx} className="text-sm text-slate-200 flex gap-3 items-start bg-slate-900/40 p-3 rounded-lg border border-white/5">
                                                    <span className="text-emerald-500 font-black shrink-0 mt-0.5">[{a.type}]</span>
                                                    <p className="leading-relaxed">{a.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-red-400 p-5 bg-red-500/10 rounded-2xl border border-red-500/30 text-sm flex items-center gap-3">
                                        <Shield size={20}/> {m.content}
                                    </div>
                                    {m.content?.includes("API") && (
                                        <button 
                                            onClick={handleKeySelect}
                                            className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                                        >
                                            <Key size={16}/> 重新連接 API 金鑰
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-4 p-5 bg-slate-800/80 rounded-2xl w-fit border border-amber-500/20 shadow-2xl animate-pulse">
                        {loadingState === 'searching' ? <Search className="animate-spin text-blue-400" size={20}/> : <Loader2 className="animate-spin text-amber-500" size={20}/>}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gemini 3 Pro Reasoning</span>
                            <span className="text-sm font-bold text-slate-200">
                                {loadingState === 'searching' ? '正在聯網抓取 2025 即時趨勢並結合命盤推算...' : '正在對星曜互動進行深度邏輯推理...'}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={endRef}/>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        disabled={isLoading || !hasKey} 
                        placeholder={hasKey ? "詢問關於您的 2025 運勢、事業或感情問題..." : "請先點擊上方連接 API..."} 
                        className="w-full bg-slate-800/90 border-2 border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500/50 pr-20 text-lg shadow-2xl transition-all disabled:opacity-50" 
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading || !hasKey} 
                        className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-lg"
                    >
                        <Send size={24}/>
                    </button>
                    {!hasKey && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl">
                            ⚠️ 尚未檢測到 API 授權
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

// --- Main App ---
export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'ai', content: '尊貴的受測者，您的命盤已布設完成。您可以直接詢問關於 2025 年的環境挑戰、事業轉機，或針對特定宮位的深度解析。', isGreeting: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');

    const handleStart = (formData: AppFormData) => {
        setChart(calculateChart(formData));
    };

    if (!chart) return <InputForm onStart={handleStart} />;

    return <DashboardView chart={chart} messages={messages} setMessages={setMessages} isLoading={isLoading} setIsLoading={setIsLoading} input={input} setInput={setInput} onEdit={() => setChart(null)} />;
};
