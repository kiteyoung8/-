
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Moon, Brain, Star as StarIcon, Edit3,
  Search, Loader2, Key, RefreshCw, AlertTriangle, Download, 
  Zap, TrendingUp, Globe, ArrowRight, FileText, ChevronRight,
  ShieldCheck, Compass, Sun, BookOpen, Layers, Quote, Calendar,
  ShieldAlert, ClipboardCheck, History, Activity
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './services/geminiService'; 
import { ChartData, Message, FormData as AppFormData, AIResponse } from './types';

const getAiStudio = () => (window as any).aistudio;

const GUIDANCE_QUESTIONS = [
    { label: "2026 整體運勢", icon: <Sparkles size={14}/>, query: "請根據我的命盤主星與三方四正格局，深度分析 2026 年的整體運勢軌跡。" },
    { label: "事業財富戰略", icon: <TrendingUp size={14}/>, query: "我的官祿宮與財帛宮在 2026 丙午年受四化（同機昌廉）影響如何？" },
    { label: "2025 布局回顧", icon: <Calendar size={14}/>, query: "現在已接近 2025 年底，我該如何根據乙巳年的收尾能量布局明年？" },
    { label: "身心健康預警", icon: <Sun size={14}/>, query: "從疾厄宮角度看，今年是否有廉貞化忌觸發的風險？請提供建議。" }
];

/**
 * 終極 PDF 下載函數：徹底消除首尾空白頁，並確保文字排版在顏色框內
 */
const downloadAsPDF = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    window.scrollTo(0, 0);

    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 },
        pagebreak: { mode: 'css' },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            width: 794,
            onclone: (clonedDoc: Document) => {
                const container = clonedDoc.querySelector('.pdf-container');
                if (container) {
                    (container as HTMLElement).style.padding = '0';
                    (container as HTMLElement).style.margin = '0';
                    (container as HTMLElement).style.display = 'block';
                    (container as HTMLElement).style.background = 'white';
                }

                const pages = clonedDoc.querySelectorAll('.pdf-page');
                pages.forEach((p, idx) => {
                    const el = p as HTMLElement;
                    el.style.margin = '0';
                    el.style.boxShadow = 'none';
                    el.style.border = 'none';
                    el.style.height = '296.3mm'; // 強制對齊標準尺寸
                    
                    if (idx === pages.length - 1) {
                        el.style.pageBreakAfter = 'avoid';
                    } else {
                        el.style.pageBreakAfter = 'always';
                    }
                });
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
    };
    
    (window as any).html2pdf().set(opt).from(element).save();
};

const InputForm = ({ onStart }: { onStart: (data: AppFormData) => void }) => {
    const [formData, setFormData] = useState<AppFormData>({
        name: '',
        gender: 'male',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        inputType: 'solar',
        lunarYear: '',
        lunarMonth: '',
        lunarDay: ''
    });

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[5rem] border border-white/10 shadow-2xl">
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] mb-8">
                        <Sparkles className="text-white" size={48} />
                    </div>
                    <h1 className="text-5xl font-serif-heavy text-white mb-4 tracking-tighter italic">東西命理科學顧問</h1>
                    <p className="text-slate-400 text-lg uppercase tracking-[0.4em] font-black text-xs md:text-sm">Strategic Metaphysics Engine v6.7</p>
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
                                    <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className={`flex-1 py-6 rounded-[2.5rem] border font-black text-sm uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                        {g === 'male' ? '乾造 (男)' : '坤造 (女)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生日期</label>
                            <input required type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生時辰</label>
                            <input required type="time" value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="pt-8">
                        <button type="submit" className="w-full bg-white text-slate-900 py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">
                            開啟命理戰略大門 <ArrowRight size={32} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LoadingOverlay = ({ state }: { state: 'thinking' | 'searching' }) => (
    <div className="flex flex-col items-center gap-8 p-12 bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] border border-indigo-500/20 shadow-2xl">
        <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin flex items-center justify-center">
             {state === 'searching' ? <Globe className="text-blue-400 animate-pulse" size={32}/> : <Brain className="text-amber-500 animate-pulse" size={32}/>}
        </div>
        <div className="text-center">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-3">Professional Metaphysics Engine</p>
            <h3 className="text-2xl font-serif-heavy italic text-white min-w-[300px]">正在解析流年動力矩陣...</h3>
        </div>
    </div>
);

const MagazineReport = ({ data, chart, question }: { data: AIResponse, chart: ChartData, question?: string }) => {
    return (
        <div className="pdf-container">
            {/* Page 1: 封面 */}
            <div className="pdf-page">
                <div className="report-grain"></div>
                <div className="content-wrap justify-between">
                    <div className="text-center pt-20">
                        <span className="text-[11px] font-sans-bold uppercase tracking-[1em] text-indigo-600 block mb-10">Calibrated Dossier : {chart.profile.name}</span>
                        <h1 className="text-5xl font-serif-heavy italic text-slate-900 mb-6 uppercase tracking-tighter leading-tight">{data.executive_summary.title}</h1>
                        <div className="w-28 h-1 bg-slate-900 mx-auto min-h-[4px] my-10"></div>
                        <p className="text-xl font-magazine text-slate-500 italic">2026 命理戰略年度報告</p>
                    </div>

                    {question && (
                        <div className="px-8 py-10 bg-slate-50 border-l-[10px] border-indigo-600 rounded-r-3xl mx-6">
                            <span className="text-[9px] font-sans-bold uppercase text-indigo-400 block mb-2 tracking-widest">Query Context</span>
                            <h4 className="text-xl font-black text-indigo-900 leading-snug">「{question}」</h4>
                        </div>
                    )}

                    <div className="pb-4 border-t border-slate-200 flex justify-between items-center text-slate-400">
                        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Node: ZW-AI-V6.7</span>
                        <span className="text-[9px] font-mono">{chart.display.lunarDetail}</span>
                    </div>
                </div>
            </div>

            {/* Page 2: 技術參數 */}
            <div className="pdf-page">
                <div className="report-grain"></div>
                <div className="content-wrap">
                    <div className="flex justify-between items-end mb-10 pb-4 border-b-2 border-slate-900">
                        <span className="text-2xl font-serif-heavy italic">Technical Parameters</span>
                        <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-black rotate-2 shadow-lg">
                            {data.executive_summary.direction}
                        </div>
                    </div>

                    <div className="space-y-10 flex-1 overflow-hidden">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                            <span className="text-[11px] font-sans-bold uppercase text-slate-400 tracking-widest mb-4 block flex items-center gap-3"><Activity size={14}/> 生辰四柱動態配置</span>
                            <div className="grid grid-cols-4 gap-3">
                                {[chart.bazi.year, chart.bazi.month, chart.bazi.day, chart.bazi.hour].map((p, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-sm">
                                        <span className="text-[9px] text-slate-400 block mb-1 font-black">{['年','月','日','時'][i]}</span>
                                        <span className="text-xl font-black text-slate-900">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <span className="text-[11px] font-sans-bold uppercase text-slate-400 tracking-widest mb-3 block">命宮主星矩陣</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {chart.ziwei.grid.find(p => p.isLifePalace)?.stars.map((s, i) => (
                                        <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-black bg-slate-50 border border-slate-100 shadow-sm ${s.color}`}>
                                            {s.name}{s.transformation ? `[化${s.transformation}]` : ''}
                                        </span>
                                    )) || '無主星'}
                                </div>
                            </div>
                            <div className="p-6 bg-indigo-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                <span className="text-[11px] font-sans-bold uppercase text-indigo-300 tracking-widest mb-3 block relative z-10">五行格局</span>
                                <p className="text-3xl font-serif-heavy italic mb-1 relative z-10">{chart.ziwei.bureau}</p>
                                <span className="text-[9px] opacity-60 font-mono relative z-10 uppercase tracking-widest">{chart.ziwei.fiveElements} Phase Dynamics</span>
                            </div>
                        </div>

                        <div className="magazine-dropcap text-base leading-relaxed text-slate-800 text-justify font-medium pt-6 border-t border-slate-100 pdf-text-container">
                            {data.executive_summary.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Page 3: 深度解析 */}
            <div className="pdf-page">
                <div className="report-grain"></div>
                <div className="content-wrap">
                    <div className="mb-10 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                        <span className="text-2xl font-serif-heavy italic">Strategic Decoding</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Section 03</span>
                    </div>

                    {/* 重點優化：流年驅動力色塊框，確保內容不溢出 */}
                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl mb-8 border border-indigo-500/30">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>
                        <h4 className="text-2xl font-serif-heavy italic mb-6 flex items-center gap-4 text-amber-400 relative z-10">
                            <div className="w-10 h-1 bg-amber-400 rounded-full"></div>
                            流年驅動力分析 (Real-time Analysis)
                        </h4>
                        <div className="space-y-4 relative z-10 pdf-text-container">
                            <p className="text-xl font-black leading-tight text-white">{data.zodiac_fortune?.summary}</p>
                            <p className="text-sm opacity-90 leading-relaxed italic text-slate-100">{data.zodiac_fortune?.zodiac_annual_fortune}</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-hidden">
                        <div className="p-8 border-2 border-slate-200 rounded-[2.5rem] bg-white shadow-sm">
                            <span className="text-[9px] font-sans-bold uppercase text-indigo-600 block mb-4 tracking-widest">Critical Warning Matrix</span>
                            <p className="text-xl font-serif-heavy italic leading-snug text-slate-800 underline decoration-indigo-200 underline-offset-[10px] decoration-4 pdf-text-container">"{data.zodiac_fortune?.warning}"</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex-1 overflow-hidden">
                            <span className="text-[9px] font-sans-bold uppercase text-slate-400 block mb-4 tracking-widest">Metaphysical Logic</span>
                            <h5 className="text-xl font-black mb-4 text-slate-900">{data.metaphysical_perspective.title}</h5>
                            <p className="text-sm italic text-slate-700 font-quote leading-relaxed pdf-text-container">{data.metaphysical_perspective.content}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page 4: 戰略建議 */}
            <div className="pdf-page">
                <div className="report-grain"></div>
                <div className="content-wrap">
                    <div className="mb-10 pb-4 border-b-2 border-slate-900">
                        <span className="text-2xl font-serif-heavy italic">Actionable Strategies</span>
                    </div>

                    <div className="space-y-5 flex-1 overflow-hidden">
                        {data.actionable_advice.map((a, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex gap-6 items-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-lg">{idx + 1}</div>
                                <div className="flex-1 overflow-hidden">
                                    <h5 className="text-[9px] font-sans-bold uppercase tracking-[0.2em] text-indigo-600 mb-1">{a.type}</h5>
                                    <p className="text-lg font-black leading-tight text-slate-900 tracking-tighter pdf-text-container">{a.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.groundingSources && data.groundingSources.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <span className="text-[9px] font-sans-bold uppercase text-slate-300 tracking-[0.5em] block mb-4 text-center">Calibrated Data Grounding Intelligence</span>
                            <div className="flex flex-wrap justify-center gap-4">
                                {data.groundingSources.map((s, i) => (
                                    <span key={i} className="text-[9px] text-slate-400 font-mono underline">{s.title}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden no-print animate-fade-in">
            <div className="flex justify-between items-center mb-10 px-4">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600 rounded-[2rem] shadow-[0_0_30px_rgba(79,70,229,0.3)]"><Compass className="text-white" size={28}/></div>
                    <h2 className="text-3xl font-serif-heavy text-white italic tracking-tighter">紫微命盤格局 (Astrology Matrix)</h2>
                </div>
                <button onClick={onEdit} className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all font-black text-xs uppercase tracking-widest shadow-inner">
                    <Edit3 size={18}/> 修正生辰數據
                </button>
            </div>
            
            <div className="grid grid-cols-4 grid-rows-4 gap-2 md:gap-5 aspect-square">
                {chart.ziwei.grid.map((p, idx) => (
                    <div key={idx} style={{ gridArea: p.gridArea }} className={`relative p-4 md:p-6 border rounded-2xl md:rounded-[3rem] flex flex-col transition-all group ${p.isLifePalace ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.25)] ring-1 ring-indigo-500/20' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] md:text-xs font-black px-3 py-1 rounded-xl shadow-sm ${p.isLifePalace ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'}`}>{p.name}</span>
                            <span className="text-[10px] text-slate-600 font-mono font-bold tracking-widest">{p.gan}{p.zhi}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                            {p.stars.map((s, si) => (
                                <div key={si} className={`flex items-center gap-2 ${s.color}`}>
                                    <span className="text-xs md:text-sm font-black whitespace-nowrap drop-shadow-sm">{s.name}</span>
                                    {s.transformation && <span className="text-[9px] bg-slate-100/10 px-1.5 rounded-md border border-current opacity-80 font-bold">化{s.transformation}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-slate-500 font-mono font-bold">{p.decades}</span>
                            {p.isBodyPalace && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-lg font-black ring-1 ring-amber-500/20">身宮</span>}
                        </div>
                    </div>
                ))}
                
                <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-6 space-y-8 animate-pulse-slow">
                    <div className="space-y-2">
                        <h3 className="text-4xl md:text-6xl font-serif-heavy text-white italic tracking-tighter drop-shadow-2xl">{chart.profile.name}</h3>
                        <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.6em]">{chart.ziwei.animal}年 · {chart.ziwei.bureau}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full max-sm px-6">
                        <div className="text-center group">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">生肖 Zodiac</span>
                            <span className="text-2xl md:text-4xl font-black text-white">{chart.ziwei.animal}</span>
                        </div>
                        <div className="text-center group">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">星座 Star</span>
                            <span className="text-2xl md:text-4xl font-black text-white">{chart.western.zodiac}</span>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 w-full">
                         <div className="flex flex-wrap justify-center gap-3">
                             {chart.ziwei.siHua.map((sh, i) => (
                                 <span key={i} className="text-[10px] font-black text-slate-400 border border-white/10 px-4 py-2 rounded-full hover:text-indigo-300 hover:border-indigo-500/50 transition-all cursor-default">{sh}</span>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageItem = ({ m, onOutputReport }: { m: Message, onOutputReport: (data: AIResponse) => void }) => {
    if (m.type === 'user') return <div className="flex justify-end mb-20"><div className="bg-indigo-600 text-white px-12 py-10 rounded-[4rem] rounded-tr-none max-w-[85%] shadow-2xl font-black border border-white/10 text-2xl tracking-tight leading-tight animate-fade-in">{m.content}</div></div>;
    if (m.isGreeting) return <div className="mb-20"><div className="bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[5rem] border border-white/5 shadow-2xl animate-fade-in border-l-8 border-indigo-600"><p className="text-slate-100 leading-tight font-medium text-4xl italic font-serif-heavy tracking-tighter">「{m.content}」</p></div></div>;
    if (m.data) {
        return (
            <div className="mb-32 animate-fade-in">
                <div className="bg-slate-900/60 backdrop-blur-3xl p-14 rounded-[4.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-5"><Brain size={140} className="text-indigo-400 group-hover:scale-110 transition-transform duration-700"/></div>
                    <div className="flex flex-col gap-12 relative z-10">
                        <div className="flex items-center gap-8">
                            <div className="p-5 bg-indigo-600 rounded-[2.5rem] shadow-2xl ring-1 ring-white/10"><Sparkles className="text-white" size={44}/></div>
                            <h3 className="text-4xl md:text-5xl font-serif-heavy text-white italic">智慧戰略分析報告已生成</h3>
                        </div>
                        <p className="text-3xl md:text-4xl text-slate-100 leading-tight font-black border-l-[14px] border-indigo-600 pl-12 py-4 tracking-tighter">
                            {m.data.executive_summary.title}
                        </p>
                        <div className="pt-12 border-t border-white/10">
                            <button onClick={() => onOutputReport(m.data!)} className="w-full md:w-fit px-16 py-10 bg-white text-slate-900 rounded-[3.5rem] shadow-2xl flex items-center justify-center gap-10 transition-all hover:scale-105 font-black text-2xl uppercase tracking-widest active:scale-95 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                <FileText size={36} className="group-hover:rotate-12 transition-transform"/> 檢視並下載專業 A4 戰略報告 (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const App = () => {
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([{ type: 'ai', content: '命盤精確校準完成。系統正整合您的紫微三方四正、西方占星相位與 2026 流年能量進行多維戰略預估。', isGreeting: true }]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | null>(null);
    const [input, setInput] = useState('');
    const [activeReportData, setActiveReportData] = useState<{ data: AIResponse, question?: string } | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, activeReportData]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        setLoadingState('thinking');
        setMessages(p => [...p, { type: 'user', content: queryText }]);
        setIsLoading(true);
        setActiveReportData(null); 
        try { 
            const data = await callGeminiAPI(chart, queryText, messages); 
            setMessages(p => [...p, { type: 'ai', data, question: queryText }]); 
        }
        catch (err: any) { setMessages(p => [...p, { type: 'error', content: `分析異常：${err.message}` }]); }
        finally { setIsLoading(false); setLoadingState(null); }
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen pt-40 pb-[480px] bg-[#020202] flex flex-col items-center">
            <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-[40px] border-b border-white/5 z-[60] no-print">
                <div className="max-w-7xl mx-auto px-12 py-8 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl ring-1 ring-white/5"><BookOpen className="text-indigo-400" size={32}/></div>
                        <h1 className="text-3xl font-serif-heavy text-white tracking-tighter italic">東西命理科學顧問</h1>
                    </div>
                    <div className="flex gap-6">
                        <button onClick={() => { setChart(null); setMessages([{ type: 'ai', content: '重置完成。', isGreeting: true }]); }} className="p-5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-3xl border border-white/10 transition-all active:scale-90 hover:text-white"><RefreshCw size={28}/></button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl px-8">
                {activeReportData ? (
                    <div className="relative animate-fade-in flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-16 no-print">
                             <button onClick={() => setActiveReportData(null)} className="flex items-center gap-6 text-slate-400 hover:text-white transition-colors font-black text-sm uppercase tracking-widest px-10 py-5 bg-white/5 rounded-full border border-white/10">
                                <ArrowRight className="rotate-180" size={24}/> 返回對話區域
                             </button>
                             <button onClick={() => downloadAsPDF('single-report-content', `專題報告-${chart.profile.name}.pdf`)} className="p-8 bg-white hover:bg-slate-100 text-slate-900 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex items-center gap-8 transition-all font-black text-sm border border-slate-200">
                                <Download size={32}/> 下載本專題 PDF
                            </button>
                        </div>
                        <div id="single-report-content">
                            <MagazineReport data={activeReportData.data} chart={chart} question={activeReportData.question} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-32">
                        <ZiweiChart chart={chart} onEdit={() => setChart(null)} />
                        <div className="space-y-24">
                            {messages.map((m, i) => (
                                <MessageItem key={i} m={m} onOutputReport={(data) => setActiveReportData({ data, question: m.question })} />
                            ))}
                            {isLoading && <div className="flex justify-center py-16"><LoadingOverlay state={loadingState!} /></div>}
                            <div ref={endRef} className="h-60"/>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-10 md:p-16 bg-gradient-to-t from-black via-black/98 to-transparent z-50 no-print flex flex-col items-center gap-10">
                {(!activeReportData) && (
                    <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { const q = input; setInput(''); performQuery(q); } }} className="w-full max-w-5xl relative group shadow-[0_60px_120px_rgba(0,0,0,0.8)] rounded-[4.5rem]">
                        <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="輸入諮詢問題 (如：今年的事業變動與財源走勢...)" className="w-full bg-slate-900/95 backdrop-blur-[60px] border border-white/10 rounded-[4.5rem] px-20 py-12 text-white outline-none focus:border-indigo-500/50 pr-48 text-2xl md:text-3xl placeholder:text-slate-600 font-serif-heavy transition-all shadow-inner" />
                        <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-8 top-8 bottom-8 aspect-square bg-gradient-to-tr from-indigo-600 to-purple-800 text-white rounded-full flex items-center justify-center hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] transition-all active:scale-90 group-hover:scale-105 shadow-2xl">{isLoading ? <Loader2 className="animate-spin" size={40}/> : <ChevronRight size={52} />}</button>
                    </form>
                )}
                {(!activeReportData) && (
                    <div className="w-full max-w-5xl overflow-x-auto scrollbar-hide flex items-center justify-start md:justify-center gap-8 px-6 pb-6">
                        {GUIDANCE_QUESTIONS.map((g, idx) => (
                            <button key={idx} disabled={isLoading} onClick={() => { performQuery(g.query); }} className="shrink-0 flex items-center gap-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 px-10 py-6 rounded-full text-slate-300 hover:text-white transition-all shadow-xl active:scale-95 group"><span className="text-indigo-400 group-hover:scale-125 transition-transform">{g.icon}</span><span className="text-[13px] font-black tracking-widest uppercase">{g.label}</span></button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
