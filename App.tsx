
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Moon, Brain, CheckCircle2, Star, Edit3,
  Search, Loader2, Key, RefreshCw, AlertTriangle, Download, 
  Zap, TrendingUp, Globe, ArrowRight
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './geminiService'; 
import { ChartData, Message, FormData as AppFormData } from './types';

const getAiStudio = () => (window as any).aistudio;

const LoadingOverlay = ({ state }: { state: 'thinking' | 'searching' }) => {
    const hints = ["對接 2025 大數據...", "校準星盤相位...", "模擬機率曲線...", "檢索全球預測...", "構建改運模型..."];
    const [hintIdx, setHintIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setHintIdx(p => (p + 1) % hints.length), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 p-10 bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="orbit-particle" style={{ animationDelay: '0s' }}></div>
            <div className="orbit-particle" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10">
                <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {state === 'searching' ? <Globe className="text-blue-400 animate-pulse" size={28}/> : <Brain className="text-amber-500 animate-pulse" size={28}/>}
                </div>
            </div>
            <div className="text-center relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">AI Quantum Engine</p>
                <h3 className="text-xl font-bold text-white mb-3 min-w-[240px]">{hints[hintIdx]}</h3>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
            </div>
            <style>{`
                @keyframes loading {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 100%; transform: translateX(0%); }
                    100% { width: 0%; transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="grid grid-cols-4 grid-rows-4 gap-2 h-[600px] w-full bg-slate-900/60 p-4 rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-md">
            {chart.ziwei.grid.map((palace) => (
                <div 
                    key={palace.zhi} 
                    style={{ gridArea: palace.gridArea }}
                    className={`border border-white/5 p-3 flex flex-col relative transition-all duration-500 rounded-2xl ${palace.isLifePalace ? 'bg-indigo-600/25 ring-2 ring-indigo-500/50 scale-[1.02] z-10' : 'bg-slate-800/40 hover:bg-slate-800/70'}`}
                >
                    <div className="text-[10px] text-slate-500 absolute top-2 right-3 font-mono">{palace.zhi}</div>
                    <div className={`text-xs font-black border-b pb-1.5 mb-2 ${palace.isLifePalace ? 'text-indigo-300 border-indigo-500/30' : 'text-amber-500/80 border-white/5'}`}>
                        {palace.name}
                    </div>
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[75%] scrollbar-hide">
                        {palace.stars.map((star, idx) => (
                            <div key={idx} className={`text-[11px] md:text-[13px] leading-tight flex items-center gap-1.5 font-bold ${star.color}`}>
                                <span className="truncate">{star.name}</span>
                                {star.transformation && <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm scale-90 shadow-sm">{star.transformation}</span>}
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto text-[9px] text-slate-500 flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="font-mono">{palace.decades}</span>
                        <span className="font-black text-indigo-400">{palace.gan}</span>
                    </div>
                </div>
            ))}
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-8 bg-slate-800/60 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-inner z-20">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-5 border border-indigo-400/30 shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-pulse">
                    <Moon className="text-white" size={36} />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif-heavy text-white mb-3 tracking-tighter">{chart.profile.name}</h2>
                <button onClick={onEdit} className="mt-8 p-3 bg-white/5 hover:bg-white/15 text-slate-300 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95"><Edit3 size={18} /></button>
            </div>
        </div>
    );
};

const MessageItem = ({ m, onRetryKey }: { m: Message, onRetryKey: () => void }) => {
    if (m.type === 'user') return <div className="flex justify-end animate-fade-in mb-8"><div className="bg-indigo-600 text-white px-8 py-5 rounded-[2.5rem] rounded-tr-none max-w-[85%] shadow-2xl font-bold border border-white/10 text-lg">{m.content}</div></div>;
    if (m.type === 'error') return <div className="mb-10 animate-fade-in"><div className="text-red-400 p-8 bg-red-500/10 rounded-[2rem] border border-red-500/20 text-sm flex flex-col gap-5"><div className="flex items-center gap-4"><AlertTriangle size={28} className="shrink-0"/><p className="font-bold text-base leading-relaxed">{m.content}</p></div>{m.content?.includes("金鑰") && <button onClick={onRetryKey} className="w-full md:w-fit px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3"><RefreshCw size={16}/> 重新授權 API</button>}</div></div>;
    if (m.isGreeting) return <div className="mb-10 animate-fade-in"><div className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group"><div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Sparkles size={100}/></div><div className="flex items-center gap-3 text-amber-500 mb-5 font-black tracking-[0.3em] uppercase text-xs"><Zap size={18}/> 核心諮詢啟動</div><p className="text-slate-100 leading-relaxed font-medium text-xl italic">「{m.content}」</p></div></div>;
    if (m.data) return (
        <div className="space-y-10 mb-16 animate-fade-in report-container">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/15 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-amber-400 via-indigo-500 to-purple-600"></div>
                <div className="flex justify-between items-start mb-6"><h3 className="text-4xl font-serif-heavy text-amber-400 tracking-tight leading-none">{m.data.executive_summary.title}</h3><div className="px-5 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black rounded-full uppercase tracking-widest">2025 AI</div></div>
                <p className="text-indigo-300 font-black text-2xl mb-6 flex items-center gap-3"><TrendingUp size={28}/> 「{m.data.executive_summary.direction}」</p>
                <p className="text-slate-300 leading-relaxed text-lg font-medium">{m.data.executive_summary.description}</p>
            </div>
            {m.data.groundingSources && m.data.groundingSources.length > 0 && (
                <div className="flex flex-col gap-4 px-4"><span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] flex items-center gap-3"><Globe size={14}/> 實時全球數據：</span>
                    <div className="flex flex-wrap gap-3">{m.data.groundingSources.map((s, idx) => (<a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm rounded-2xl flex items-center gap-3 hover:bg-blue-500/20 transition-all shadow-lg active:scale-95"><Search size={14}/> {s.title}</a>))}</div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-purple-500/10 group"><h4 className="text-[11px] text-purple-400 mb-6 font-black uppercase tracking-[0.3em] flex items-center gap-3"><Moon size={20}/> 玄學透視</h4><p className="text-base text-slate-300 leading-loose font-medium">{m.data.metaphysical_perspective.content}</p></div>
                <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-indigo-500/10 group"><h4 className="text-[11px] text-indigo-400 mb-6 font-black uppercase tracking-[0.3em] flex items-center gap-3"><Brain size={20}/> 科學解析</h4><div className="space-y-6"><div><span className="text-[11px] text-slate-500 block mb-2 font-black">心理維度</span><p className="text-base text-slate-300 leading-relaxed font-medium">{m.data.scientific_decoding.psychology}</p></div><div><span className="text-[11px] text-slate-500 block mb-2 font-black">客觀機率</span><p className="text-base text-slate-300 leading-relaxed font-medium">{m.data.scientific_decoding.physics}</p></div></div></div>
            </div>
            <div className="bg-emerald-500/5 p-10 rounded-[3.5rem] border border-emerald-500/20 shadow-inner"><h4 className="flex items-center gap-4 text-emerald-400 font-black text-2xl mb-8"><CheckCircle2 size={32}/> 實戰改運方針</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{m.data.actionable_advice.map((a, idx) => (<div key={idx} className="text-base text-slate-200 flex flex-col gap-3 bg-slate-900/80 p-6 rounded-2xl border border-white/5 shadow-md"><span className="text-[10px] text-emerald-500 font-black tracking-[0.3em] uppercase">[{a.type}]</span><p className="leading-relaxed font-bold">{a.content}</p></div>))}</div>
            </div>
        </div>
    );
    return null;
};

const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({ name: '', gender: 'male', birthDate: '1995-06-15', birthTime: '10:30', inputType: 'solar', lunarYear: '', lunarMonth: '', lunarDay: '' });
    const isApiKeyInjected = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
    const [hasKey, setHasKey] = useState<boolean>(isApiKeyInjected);

    useEffect(() => {
        const checkKey = async () => {
            const studio = getAiStudio();
            if (!isApiKeyInjected && studio) { try { const selected = await studio.hasSelectedApiKey(); setHasKey(selected); } catch (e) { console.error(e); } }
        };
        checkKey();
    }, [isApiKeyInjected]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
            <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-12"><div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl"><Sparkles className="text-white" size={48} /></div><h1 className="text-4xl font-serif-heavy text-white tracking-tight mb-3">全能命理科學顧問</h1><p className="text-slate-400 text-xs tracking-[0.4em] uppercase font-black opacity-70">AI Powered Metaphysics V3</p></div>
                {!hasKey && (
                    <div className="mb-10 p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem]"><div className="flex items-start gap-5 mb-6"><Key className="text-amber-500 shrink-0 mt-1" size={28}/><div className="flex flex-col gap-2"><p className="text-base text-amber-100 font-bold">需要權限授權</p><p className="text-xs text-amber-400/70 leading-relaxed">請點擊下方按鈕選取金鑰。</p></div></div><button onClick={async () => { const s = getAiStudio(); if (s) { await s.openSelectKey(); setHasKey(true); } }} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all group">授權 Gemini API <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform"/></button></div>
                )}
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onStart(formData); }}>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">訪客姓名</label><input required type="text" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-8 py-5 text-white outline-none focus:border-indigo-500 text-xl font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="您的尊姓大名" /></div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">性別</label><select className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-8 py-5 text-white outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}><option value="male">乾造 (男)</option><option value="female">坤造 (女)</option></select></div>
                        <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">陽曆生日</label><input required type="date" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-8 py-5 text-white outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">出生時辰</label><input required type="time" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl px-8 py-5 text-white outline-none" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} /></div>
                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-4 mt-8 text-2xl active:scale-95 group">排盤分析 <Zap size={28} className="group-hover:scale-125 transition-transform"/></button>
                </form>
            </div>
        </div>
    );
};

export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([{ type: 'ai', content: '尊貴的訪客，命盤系統已就緒。請開始諮詢。', isGreeting: true }]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | null>(null);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        const isTrend = queryText.match(/2025|未來|現況|趨勢|最近|今年|明年|行情/);
        setLoadingState(isTrend ? 'searching' : 'thinking');
        setMessages(p => [...p, { type: 'user', content: queryText }]);
        setIsLoading(true);
        try { const data = await callGeminiAPI(chart, queryText, messages); setMessages(p => [...p, { type: 'ai', data, question: queryText }]); }
        catch (err: any) { setMessages(p => [...p, { type: 'error', content: err.message === "ENV_KEY_MISSING" ? "環境金鑰尚未配置。" : `通訊異常：${err.message}` }]); }
        finally { setIsLoading(false); setLoadingState(null); }
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen pt-16 pb-64 bg-[#050505] flex flex-col items-center">
            <div id="report-area" className="w-full max-w-4xl px-6 space-y-16">
                <ZiweiChart chart={chart} onEdit={() => setChart(null)} />
                <div className="space-y-16">
                    {messages.map((m, i) => (<MessageItem key={i} m={m} onRetryKey={async () => { const s = getAiStudio(); if (s) { await s.openSelectKey(); if (m.question) performQuery(m.question); } }} />))}
                    {isLoading && loadingState && <div className="flex justify-center animate-fade-in py-12"><LoadingOverlay state={loadingState} /></div>}
                    <div ref={endRef} className="h-8"/>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
                <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { const q = input; setInput(''); performQuery(q); } }} className="max-w-4xl mx-auto relative group">
                    <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="輸入問題 (例如：2025 年的創業運勢？)" className="w-full bg-slate-800/90 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] px-10 py-7 text-white outline-none focus:border-indigo-500/50 pr-28 text-xl shadow-2xl transition-all" />
                    <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-4 top-4 bottom-4 aspect-square bg-indigo-600 text-white rounded-3xl flex items-center justify-center hover:bg-indigo-500 shadow-2xl transition-all">{isLoading ? <Loader2 className="animate-spin" size={32}/> : <Send size={32} />}</button>
                </form>
            </div>
        </div>
    );
};
