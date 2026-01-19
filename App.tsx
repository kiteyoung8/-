
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Moon, Brain, Star as StarIcon, Edit3,
  Search, Loader2, Key, RefreshCw, AlertTriangle, Download, 
  Zap, TrendingUp, Globe, ArrowRight, FileText, ChevronRight,
  ShieldCheck, Compass, Sun, BookOpen, Layers, Quote, Calendar,
  ShieldAlert, ClipboardCheck, History, CheckCircle2
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
// 修正：匯入路徑改為根目錄
import { callConsultationAPI, callConsolidationAPI } from './geminiService'; 
import { ChartData, Message, FormData as AppFormData, AIResponse, ConsultationResponse } from './types';

const getAiStudio = () => (window as any).aistudio;

const GUIDANCE_QUESTIONS = [
    { label: "2026 整體運勢", icon: <Sparkles size={14}/>, query: "請深度分析我 2026 年的整體運勢軌跡與核心戰略建議。" },
    { label: "事業財富", icon: <TrendingUp size={14}/>, query: "我 2026 年的財富增長點在哪裡？有哪些潛在機會或危機？" },
    { label: "感情人際", icon: <Moon size={14}/>, query: "針對我的命盤，今年在感情與人際關係上需要調整什麼？" },
    { label: "健康身心", icon: <Sun size={14}/>, query: "請分析我今年的健康能量狀態，並提供身心平衡建議。" }
];

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-2xl mb-12 animate-fade-in">
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-4">
                    <Compass className="text-indigo-400" size={24} />
                    <h2 className="text-xl font-serif-heavy text-white italic">紫微斗數命盤矩陣</h2>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    Ref: {chart.bazi.year} {chart.bazi.month} {chart.bazi.day} {chart.bazi.hour}
                </div>
            </div>
            
            <div className="grid grid-cols-4 grid-rows-4 gap-2 aspect-square md:aspect-auto md:h-[700px] relative">
                {chart.ziwei.grid.map((p, idx) => (
                    <div key={idx} style={{ gridArea: p.gridArea }} className={`p-4 border border-white/5 rounded-2xl flex flex-col justify-between transition-all hover:bg-white/5 ${p.isLifePalace ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'bg-slate-900/40'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg tracking-wider ${p.isLifePalace ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'}`}>{p.name}</span>
                            <span className="text-[9px] font-mono text-slate-600">{p.gan}{p.zhi}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
                            {p.stars.map((s, si) => (
                                <div key={si} className={`flex flex-col items-center leading-none ${s.color}`}>
                                    <span className={`text-sm md:text-base font-bold ${s.type === 'major' ? 'font-serif-heavy italic' : ''}`}>{s.name}</span>
                                    {s.transformation && <span className="text-[7px] bg-white/10 px-1 rounded-sm mt-0.5">化{s.transformation}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-end mt-auto text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
                            <span>{p.decades}歲</span>
                            <div className="flex gap-1">
                                {p.isBodyPalace && <span className="bg-purple-900/40 text-purple-400 px-1 rounded">身宮</span>}
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-500/10 shadow-inner">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
                        <StarIcon className="text-indigo-400" size={32} />
                    </div>
                    <h3 className="text-4xl font-serif-heavy text-white mb-3 italic tracking-tighter">{chart.profile.name}</h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        <span className="text-[10px] font-black bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full uppercase tracking-widest">{chart.profile.gender === 'male' ? '乾造' : '坤造'}</span>
                        <span className="text-[10px] font-black bg-amber-600/20 text-amber-300 px-3 py-1 rounded-full uppercase tracking-widest">{chart.ziwei.animal}</span>
                        <span className="text-[10px] font-black bg-emerald-600/20 text-emerald-300 px-3 py-1 rounded-full uppercase tracking-widest">{chart.ziwei.bureau}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-mono mb-8 leading-relaxed uppercase tracking-[0.2em]">
                        {chart.display.lunarDetail}<br/>
                        {chart.ziwei.fiveElements}行局能量矩陣
                    </p>
                    <button onClick={onEdit} className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-3 rounded-full border border-white/5">
                        <Edit3 size={14}/> 修正諮詢資料
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({
        name: '', gender: 'male', birthDate: '1990-01-01', birthTime: '12:00',
        inputType: 'solar', lunarYear: '', lunarMonth: '', lunarDay: ''
    });
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[5rem] border border-white/10 shadow-2xl animate-fade-in">
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] mb-8">
                        <Sparkles className="text-white" size={48} />
                    </div>
                    <h1 className="text-5xl font-serif-heavy text-white mb-4 tracking-tighter italic leading-none">東西命理科學顧問</h1>
                    <p className="text-slate-400 text-lg uppercase tracking-[0.4em] font-black text-xs md:text-sm">Strategic Metaphysics Engine v4.1</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onStart(formData); }} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">諮詢者姓名</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="輸入姓名" className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">生理性別</label>
                            <div className="flex gap-4">
                                {(['male', 'female'] as const).map(g => (
                                    <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className={`flex-1 py-6 rounded-[2.5rem] border font-black text-sm uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                                        {g === 'male' ? '乾造 (男)' : '坤造 (女)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生日期 (西元)</label>
                            <input required type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生時辰</label>
                            <input required type="time" value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="pt-8">
                        <button type="submit" className="w-full bg-white text-slate-900 py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">
                            開啟命理大門 <ArrowRight size={32} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LoadingOverlay = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center gap-8 p-12 bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] border border-indigo-500/20 shadow-2xl animate-pulse">
        <div className="relative">
            <div className="w-20 h-20 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Brain className="text-indigo-400" size={24}/>
            </div>
        </div>
        <p className="text-xl font-serif-heavy italic text-white tracking-tight">{text}</p>
    </div>
);

const MagazineReport = ({ data, chart, question, isConsolidated }: { data: AIResponse, chart: ChartData, question?: string, isConsolidated?: boolean }) => {
    return (
        <div className={`report-root bg-white text-slate-900 p-8 md:p-24 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative overflow-hidden border-[1px] border-slate-200 ${isConsolidated ? 'mb-24' : ''}`}>
            <div className="report-grain absolute inset-0"></div>
            {question && (
                <div className="mb-12 p-8 bg-indigo-50 rounded-3xl border-l-[12px] border-indigo-600 flex items-start gap-6">
                    <History className="text-indigo-600 shrink-0" size={32} />
                    <div>
                        <span className="text-[10px] font-sans-bold uppercase text-indigo-400 block mb-2 tracking-widest">諮詢問題回溯</span>
                        <h4 className="text-2xl font-black text-indigo-900 leading-tight">「{question}」</h4>
                    </div>
                </div>
            )}
            <div className="flex flex-col mb-32 relative">
                <div className="flex justify-between items-start mb-16 border-b border-slate-200 pb-8">
                    <div>
                        <span className="text-[12px] font-sans-bold uppercase tracking-[0.8em] text-indigo-600 mb-2">Strategic Analysis Report</span>
                        <span className="text-[10px] text-slate-400 font-mono">Reference: MET-2026-SYNTHESIS</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[12px] font-magazine italic text-slate-900 block mb-1">Confidential Edition</span>
                        <span className="text-[10px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
                    <div className="md:col-span-9">
                        <h1 className="text-7xl md:text-9xl font-magazine italic leading-[0.85] text-slate-900 mb-8 tracking-tighter uppercase">{data.executive_summary.title}</h1>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                         <div className="bg-slate-900 text-white p-10 rounded-full w-48 h-48 flex flex-col items-center justify-center text-center rotate-12 shadow-2xl">
                            <span className="text-[10px] font-sans-bold uppercase tracking-widest opacity-60 mb-2">Strategy</span>
                            <span className="text-2xl font-serif-heavy italic">{data.executive_summary.direction}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="magazine-grid mb-32">
                <div className="col-span-12 md:col-span-8">
                    <div className="magazine-dropcap text-3xl leading-[1.6] text-slate-800 text-justify mb-16 font-medium">
                        {data.executive_summary.description}
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4 flex flex-col gap-12">
                    <div className="p-10 border border-slate-200 rounded-[3rem] bg-white shadow-sm">
                        <span className="text-[10px] font-sans-bold uppercase text-indigo-600 block mb-6 tracking-widest">Key Insight</span>
                        <Quote className="text-indigo-600/20 mb-4" size={40} />
                        <p className="text-2xl font-serif-heavy italic text-slate-800">"{data.zodiac_fortune.warning}"</p>
                    </div>
                </div>
            </div>
            <div className="pt-24 border-t border-slate-200">
                <h3 className="text-5xl font-magazine italic mb-16 text-slate-900">戰略行動模組</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.actionable_advice.map((a, idx) => (
                        <div key={idx} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black mb-6">{idx + 1}</span>
                            <h5 className="text-[11px] font-sans-bold uppercase text-indigo-600 mb-4">{a.type}</h5>
                            <p className="text-2xl font-black text-slate-900">{a.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {data.groundingSources && data.groundingSources.length > 0 && (
                <div className="mt-24 pt-16 border-t border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center gap-4">
                        <Globe size={16} className="text-indigo-600" /> 實時戰略數據引用來源
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        {data.groundingSources.map((source, idx) => (
                            <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:text-white transition-all bg-indigo-50 hover:bg-indigo-600 px-6 py-3 rounded-full border border-indigo-100 uppercase tracking-widest flex items-center gap-2">
                                {source.title} <ArrowRight size={12} />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ConsultationBubble = ({ data }: { data: ConsultationResponse }) => (
    <div className="flex flex-col gap-8 mb-16 animate-fade-in max-w-[90%]">
        <div className="bg-slate-900/60 backdrop-blur-3xl p-12 md:p-14 rounded-[4rem] rounded-tl-none border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-10 opacity-5"><Brain size={60} className="text-indigo-400"/></div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 text-indigo-400">
                    <CheckCircle2 size={24}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">顧問即時解答</span>
                </div>
                <p className="text-2xl md:text-3xl text-slate-100 leading-relaxed font-medium italic">
                    {data.answer}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-[0.2em]">戰略洞察</span>
                        {data.key_points.map((p, i) => <div key={i} className="text-sm text-slate-400 flex gap-2"><div className="w-1 h-1 bg-amber-400 rounded-full mt-2 shrink-0"></div>{p}</div>)}
                    </div>
                    <div className="space-y-3">
                        <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em]">行動建議</span>
                        {data.action_advice.map((p, i) => <div key={i} className="text-sm text-slate-400 flex gap-2"><div className="w-1 h-1 bg-indigo-400 rounded-full mt-2 shrink-0"></div>{p}</div>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([{ type: 'ai', content: '尊貴的諮詢者，東西命理科學混合引擎已就緒。請儘管提問，我將直接為您解惑，諮詢結束後可一鍵匯整全方位戰略檔案。', isGreeting: true }]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [input, setInput] = useState('');
    const [consolidatedReport, setConsolidatedReport] = useState<AIResponse | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, consolidatedReport]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        setIsLoading(true);
        setLoadingText("正在深度解析命盤矩陣...");
        setMessages(p => [...p, { type: 'user', content: queryText }]);
        setConsolidatedReport(null);
        try { 
            const data = await callConsultationAPI(chart, queryText, messages); 
            setMessages(p => [...p, { type: 'ai', data, question: queryText }]); 
        } catch (err: any) { 
            setMessages(p => [...p, { type: 'error', content: `解析引擎異常：${err.message}` }]); 
        } finally { setIsLoading(false); }
    };

    const handleConsolidate = async () => {
        if (!chart || messages.length < 2) return;
        setIsLoading(true);
        setLoadingText("正在合成全方位戰略報告 (預計 15-20 秒)...");
        try {
            const report = await callConsolidationAPI(chart, messages);
            setConsolidatedReport(report);
        } catch (err: any) {
            alert("報告匯整失敗: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen pt-32 pb-[450px] bg-[#050505] flex flex-col items-center">
            <div className="fixed top-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-40 no-print">
                <div className="max-w-7xl mx-auto px-12 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner"><BookOpen className="text-indigo-400" size={28}/></div>
                        <h1 className="text-2xl font-serif-heavy text-white">東西命理科學顧問</h1>
                    </div>
                    <div className="flex gap-4">
                        {messages.length > 2 && !consolidatedReport && (
                            <button onClick={handleConsolidate} className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all font-black text-xs uppercase tracking-widest">
                                <ClipboardCheck size={18}/> 匯整戰略報告 ({messages.filter(m=>m.data).length})
                            </button>
                        )}
                        <button onClick={() => setChart(null)} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl border border-white/10 transition-all"><RefreshCw size={24}/></button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl px-8 space-y-24">
                {consolidatedReport ? (
                    <div className="relative animate-fade-in">
                        <div className="flex justify-between items-center mb-12 no-print">
                             <button onClick={() => setConsolidatedReport(null)} className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors font-black text-sm uppercase px-8 py-4 bg-white/5 rounded-full">
                                <ArrowRight className="rotate-180" size={20}/> 返回對話
                             </button>
                             <button onClick={() => window.print()} className="p-6 bg-white text-slate-900 rounded-3xl shadow-2xl flex items-center gap-4 font-black text-sm border border-slate-200">
                                <Download size={24}/> 下載完整 PDF 報告
                             </button>
                        </div>
                        <div id="full-report-content" className="bg-white rounded-[4rem] overflow-hidden">
                             <MagazineReport data={consolidatedReport} chart={chart} isConsolidated />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="no-print"><ZiweiChart chart={chart} onEdit={() => setChart(null)} /></div>
                        <div className="space-y-12">
                            {messages.map((m, i) => (
                                <div key={i}>
                                    {m.type === 'user' && <div className="flex justify-end mb-8"><div className="bg-indigo-600 text-white px-10 py-6 rounded-[3rem] rounded-tr-none max-w-[80%] shadow-xl font-black text-xl leading-snug">{m.content}</div></div>}
                                    {m.isGreeting && <div className="mb-12"><div className="bg-slate-900/40 p-12 rounded-[4rem] italic font-serif-heavy text-2xl text-slate-100">「{m.content}」</div></div>}
                                    {m.data && <ConsultationBubble data={m.data} />}
                                    {m.type === 'error' && <div className="text-red-400 p-8 border border-red-500/20 rounded-3xl">{m.content}</div>}
                                </div>
                            ))}
                            {isLoading && <div className="flex justify-center py-12"><LoadingOverlay text={loadingText} /></div>}
                            <div ref={endRef} className="h-40"/>
                        </div>
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-black via-black/95 to-transparent z-50 no-print flex flex-col items-center gap-10">
                {!consolidatedReport && (
                    <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { const q = input; setInput(''); performQuery(q); } }} className="w-full max-w-6xl relative group shadow-2xl rounded-[4rem]">
                        <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="輸入諮詢問題 (例如：我的2026財運如何？)" className="w-full bg-slate-900/90 backdrop-blur-[50px] border border-white/10 rounded-[4rem] px-16 py-12 text-white outline-none focus:border-indigo-500/50 pr-44 text-xl md:text-3xl placeholder:text-slate-600 font-serif-heavy transition-all" />
                        <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-6 top-6 bottom-6 aspect-square bg-gradient-to-tr from-indigo-600 to-purple-800 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all">{isLoading ? <Loader2 className="animate-spin" size={32}/> : <ChevronRight size={48} />}</button>
                    </form>
                )}
                {!consolidatedReport && (
                    <div className="w-full max-w-6xl overflow-x-auto scrollbar-hide flex items-center justify-start md:justify-center gap-6 px-4">
                        {GUIDANCE_QUESTIONS.map((g, idx) => (
                            <button key={idx} disabled={isLoading} onClick={() => performQuery(g.query)} className="shrink-0 flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-5 rounded-full text-slate-300 transition-all hover:scale-105 shadow-lg"><span className="text-indigo-400">{g.icon}</span><span className="text-sm font-black tracking-widest uppercase">{g.label}</span></button>
                        ))}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                @media print { 
                    .report-root { border: none !important; margin: 0 !important; padding: 20mm !important; } 
                    .no-print { display: none !important; } 
                }
            `}</style>
        </div>
    );
};
