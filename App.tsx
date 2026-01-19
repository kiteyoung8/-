
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Moon, Brain, Star as StarIcon, Edit3,
  Search, Loader2, Key, RefreshCw, AlertTriangle, Download, 
  Zap, TrendingUp, Globe, ArrowRight, FileText, ChevronRight,
  ShieldCheck, Compass, Sun, BookOpen, Layers, Quote, Calendar,
  ShieldAlert
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './geminiService'; 
import { ChartData, Message, FormData as AppFormData, AIResponse } from './types';

const getAiStudio = () => (window as any).aistudio;

const GUIDANCE_QUESTIONS = [
    { label: "2026 整體運勢", icon: <Sparkles size={14}/>, query: "請深度分析我 2026 年的整體運勢軌跡與核心戰略建議。" },
    { label: "事業財富", icon: <TrendingUp size={14}/>, query: "我 2026 年的財富增長點在哪裡？有哪些潛在機會或危機？" },
    { label: "感情人際", icon: <Moon size={14}/>, query: "針對我的命盤，今年在感情與人際關係上需要調整什麼？" },
    { label: "健康身心", icon: <Sun size={14}/>, query: "請分析我今年的健康能量狀態，並提供身心平衡建議。" }
];

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
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="輸入姓名"
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">生理性別</label>
                            <div className="flex gap-4">
                                {(['male', 'female'] as const).map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-6 rounded-[2.5rem] border font-black text-sm uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        {g === 'male' ? '乾造 (男)' : '坤造 (女)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生日期 (西元)</label>
                            <input 
                                required
                                type="date"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-6">出生時辰</label>
                            <input 
                                required
                                type="time"
                                value={formData.birthTime}
                                onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white outline-none focus:border-indigo-500/50 text-xl font-bold transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="pt-8">
                        <button 
                            type="submit"
                            className="w-full bg-white text-slate-900 py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                        >
                            開啟命理大門 <ArrowRight size={32} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LoadingOverlay = ({ state }: { state: 'thinking' | 'searching' }) => {
    const hints = ["正在諮詢《紫微精成》數據庫...", "校準星象矩陣能量...", "分析四化觸發點...", "規劃 2026 戰略軌跡...", "正在生成專業諮詢報告..."];
    const [hintIdx, setHintIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setHintIdx(p => (p + 1) % hints.length), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-8 p-12 bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="relative">
                <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {state === 'searching' ? <Globe className="text-blue-400 animate-pulse" size={32}/> : <BookOpen className="text-amber-500 animate-pulse" size={32}/>}
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-3">Intelligence Engine v4.1</p>
                <h3 className="text-2xl font-serif-heavy italic text-white min-w-[300px]">{hints[hintIdx]}</h3>
            </div>
        </div>
    );
};

const ZiweiChart = ({ chart, onEdit }: { chart: ChartData, onEdit: () => void }) => {
    return (
        <div className="relative group no-print mb-20 animate-fade-in">
            <div className="grid grid-cols-4 grid-rows-4 gap-3 h-[900px] w-full bg-slate-950/70 p-5 rounded-[4rem] relative overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                {chart.ziwei.grid.map((palace) => (
                    <div 
                        key={palace.zhi} 
                        style={{ gridArea: palace.gridArea }}
                        className={`border border-white/5 p-4 flex flex-col relative transition-all duration-700 rounded-3xl ${palace.isLifePalace ? 'bg-gradient-to-br from-indigo-900/50 to-slate-900/80 ring-2 ring-indigo-500/40 z-10 shadow-2xl' : 'bg-slate-900/40 hover:bg-slate-800/60'}`}
                    >
                        <div className="text-[9px] text-slate-600 absolute top-3 right-4 font-mono font-bold">{palace.zhi}</div>
                        <div className={`text-sm font-black mb-3 pb-2 border-b flex justify-between items-center ${palace.isLifePalace ? 'text-indigo-300 border-indigo-500/30' : 'text-amber-600/60 border-white/5'}`}>
                            {palace.name}
                            <span className="text-[10px] opacity-40 font-mono">{palace.gan}</span>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[260px] scrollbar-hide">
                            {palace.stars.sort((a,b) => {
                                const rank: Record<string, number> = { major: 0, aux: 1, minor: 2 };
                                return rank[a.type] - rank[b.type];
                            }).map((star, idx) => (
                                <div key={idx} className={`text-[11px] md:text-[13px] leading-tight flex items-center justify-between font-bold ${star.color} ${star.type === 'minor' ? 'opacity-80' : ''}`}>
                                    <span className="truncate flex items-center gap-1.5">
                                        {star.type === 'minor' && <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>}
                                        {star.name}
                                    </span>
                                    {star.transformation && (
                                        <span className={`text-[8px] px-1 py-0.5 rounded text-white font-black shrink-0 ${
                                            star.transformation === '祿' ? 'bg-emerald-600' :
                                            star.transformation === '權' ? 'bg-blue-600' :
                                            star.transformation === '科' ? 'bg-amber-600' : 'bg-red-700'
                                        }`}>
                                            {star.transformation}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto text-[10px] text-slate-500 font-mono flex justify-between border-t border-white/5 pt-2">
                            <span>{palace.decades}</span>
                            <span className="text-indigo-400 font-bold">{palace.ages[0]}+</span>
                        </div>
                    </div>
                ))}

                <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center text-center p-10 bg-slate-900/95 rounded-[3.5rem] border border-white/10 shadow-inner z-20 backdrop-blur-3xl">
                    <div className="relative mb-8">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-700 to-amber-600 flex items-center justify-center border border-white/20 shadow-[0_0_80px_rgba(99,102,241,0.3)]">
                            <Compass className="text-white" size={48} />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif-heavy text-white mb-2 tracking-tighter">
                        {chart.profile.name}
                    </h2>
                    <div className="flex items-center gap-3 justify-center mt-4">
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-black tracking-widest uppercase">{chart.ziwei.animal}年</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-black tracking-widest uppercase">{chart.western.zodiac}</span>
                    </div>
                    <button onClick={onEdit} className="mt-12 p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95">
                        <Edit3 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const MagazineReport = ({ data, chart }: { data: AIResponse, chart: ChartData }) => {
    const reportId = `report-main-content`;

    const handleExport = () => {
        const element = document.getElementById(reportId);
        if (!element) return;
        const opt = {
            margin: 0,
            filename: `全能命理戰略報告-2026-${chart.profile.name}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        (window as any).html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="report-container relative animate-fade-in py-12 w-full max-w-7xl mx-auto px-4 md:px-0">
             <div className="flex justify-end mb-12 no-print gap-4">
                <button 
                    onClick={handleExport}
                    className="p-6 bg-white hover:bg-slate-100 text-slate-900 rounded-3xl shadow-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 font-black text-sm uppercase tracking-[0.2em] border border-slate-200"
                >
                    <Download size={24}/> 下載 PDF 專業版報告
                </button>
             </div>

            <div id={reportId} className="report-root bg-white text-slate-900 p-8 md:p-24 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative overflow-hidden border-[1px] border-slate-200">
                <div className="report-grain absolute inset-0"></div>
                
                {/* 高級封面設計節點 */}
                <div className="flex flex-col mb-32 relative">
                    <div className="flex justify-between items-start mb-16 border-b-[1px] border-slate-200 pb-8">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-sans-bold uppercase tracking-[0.8em] text-indigo-600 mb-2">Strategic Analysis Report</span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">Reference: MET-2026-XQ01</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[12px] font-magazine italic text-slate-900 block mb-1">Confidential Edition</span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">Date: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
                        <div className="md:col-span-9">
                            <h1 className="text-7xl md:text-9xl font-magazine italic leading-[0.85] text-slate-900 mb-8 tracking-tighter uppercase break-words">
                                {data.executive_summary.title}
                            </h1>
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                             <div className="bg-slate-900 text-white p-10 rounded-full w-48 h-48 flex flex-col items-center justify-center text-center rotate-12 shadow-2xl">
                                <span className="text-[10px] font-sans-bold uppercase tracking-widest opacity-60 mb-2">Strategy</span>
                                <span className="text-2xl font-serif-heavy italic leading-tight">{data.executive_summary.direction}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 數據概要面板 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-32 border-y-[1px] border-slate-900">
                    <div className="p-10 border-r-[1px] border-slate-200 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-sans-bold uppercase mb-4 tracking-widest">Consultant</span>
                        <span className="text-2xl font-black italic">AI Oracle V4.1</span>
                    </div>
                    <div className="p-10 border-r-[1px] border-slate-200 flex flex-col bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-sans-bold uppercase mb-4 tracking-widest">Subject Name</span>
                        <span className="text-2xl font-black">{chart.profile.name}</span>
                    </div>
                    <div className="p-10 border-r-[1px] border-slate-200 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-sans-bold uppercase mb-4 tracking-widest">Astro Matrix</span>
                        <span className="text-2xl font-black">{chart.ziwei.animal}年 / {chart.western.zodiac}</span>
                    </div>
                    <div className="p-10 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-sans-bold uppercase mb-4 tracking-widest">Target Year</span>
                        <span className="text-2xl font-black">2026 丙午</span>
                    </div>
                </div>

                {/* 2025 運勢深度簡析區塊 (視覺優化) */}
                <div className="mb-24 relative">
                    <div className="absolute -top-6 left-12 px-6 py-2 bg-indigo-600 text-white rounded-full z-10 flex items-center gap-3 shadow-xl">
                         <ShieldAlert size={18}/>
                         <span className="text-[10px] font-sans-bold uppercase tracking-widest">Current Phase | 2025 乙巳年</span>
                    </div>
                    <div className="p-12 bg-slate-50 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-shrink-0 w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center shadow-inner border border-slate-100 group">
                            <Calendar className="text-indigo-600 group-hover:scale-110 transition-transform" size={48} />
                        </div>
                        <div className="flex-grow">
                            <h4 className="text-2xl font-serif-heavy text-slate-900 mb-4 border-b border-slate-200 pb-2 inline-block">當前年度戰略定位</h4>
                            <p className="text-xl md:text-2xl font-medium italic text-slate-700 leading-relaxed font-quote">
                                {data.zodiac_fortune.fortune_2025}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 正文內容 */}
                <div className="magazine-grid mb-32">
                    <div className="col-span-12 md:col-span-8">
                        <div className="magazine-dropcap text-3xl leading-[1.6] text-slate-800 text-justify mb-16 font-medium">
                            {data.executive_summary.description}
                        </div>
                        
                        <div className="bg-slate-900 text-white p-16 rounded-[4rem] relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles size={120} />
                             </div>
                             <h4 className="text-4xl font-serif-heavy italic mb-10 flex items-center gap-6">
                                <div className="w-12 h-1 border-t-2 border-white/30"></div>
                                2026 年度流年專論
                             </h4>
                             <div className="space-y-8 text-xl leading-relaxed text-indigo-100">
                                <div className="pl-8 border-l-2 border-indigo-500/50">
                                    <p className="font-sans-bold text-amber-400 uppercase tracking-widest text-sm mb-4">【{data.zodiac_fortune?.animal || chart.ziwei.animal} 生肖賦能】</p>
                                    <p className="text-2xl font-bold mb-4">{data.zodiac_fortune?.summary}</p>
                                    <p className="opacity-80 italic">{data.zodiac_fortune?.zodiac_annual_fortune}</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 flex flex-col gap-12">
                        <div className="p-10 border-[1px] border-slate-200 rounded-[3rem] bg-white shadow-sm">
                            <span className="text-[10px] font-sans-bold uppercase text-indigo-600 block mb-6 tracking-widest">Key Insight</span>
                            <Quote className="text-indigo-600/20 mb-4" size={40} />
                            <p className="text-2xl font-serif-heavy italic leading-tight text-slate-800">
                                "{data.zodiac_fortune?.warning || '戰略轉型期需防範過度擴張，建議回歸內核穩步前進。'}"
                            </p>
                        </div>

                        <div className="p-10 bg-slate-50 rounded-[3rem] border-l-[10px] border-slate-900">
                             <span className="text-[10px] font-sans-bold uppercase text-slate-400 block mb-6 tracking-widest">Physics Observation</span>
                             <p className="text-xl italic text-slate-700 font-quote">
                                {data.scientific_decoding.physics}
                             </p>
                        </div>
                    </div>
                </div>

                {/* 戰略行動模組 */}
                <div className="pt-24 border-t-[1px] border-slate-200">
                    <h3 className="text-5xl font-magazine italic mb-16 text-slate-900">諮詢建議與戰略執行</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.actionable_advice.map((a, idx) => (
                            <div key={idx} className="group relative bg-white p-12 rounded-[3.5rem] border-[1px] border-slate-100 hover:border-indigo-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                <div className="text-7xl font-magazine text-slate-100 group-hover:text-indigo-50 opacity-100 absolute top-8 right-12 transition-colors">0{idx+1}</div>
                                <div className="relative z-10 flex flex-col gap-8">
                                    <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">{idx + 1}</span>
                                    <h5 className="text-[11px] font-sans-bold uppercase tracking-[0.3em] text-indigo-600">{a.type}</h5>
                                    <p className="text-2xl font-black leading-snug text-slate-900">
                                        {a.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 底部署名 */}
                <div className="mt-32 pt-16 border-t-[1px] border-slate-200 flex justify-between items-end opacity-40 italic">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-sans-bold uppercase">Meta-Strategist AI Report</span>
                        <span className="text-[9px]">Generated by GPT-Hybrid Metaphysics Engine</span>
                    </div>
                    <div className="text-right text-[10px] font-mono">
                        COPYRIGHT © 2026 ALL RIGHTS RESERVED
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageItem = ({ m, onRetryKey, chart, onOutputReport }: { m: Message, onRetryKey: () => void, chart: ChartData, onOutputReport: (data: AIResponse) => void }) => {
    if (m.type === 'user') return <div className="flex justify-end mb-16"><div className="bg-indigo-600 text-white px-12 py-8 rounded-[4rem] rounded-tr-none max-w-[80%] shadow-2xl font-black border border-white/10 text-2xl tracking-tight leading-snug">{m.content}</div></div>;
    
    if (m.type === 'error') return <div className="mb-16"><div className="text-red-400 p-12 bg-red-500/5 rounded-[4rem] border border-red-500/20 flex flex-col gap-8"><p className="font-bold text-xl">{m.content}</p><button onClick={onRetryKey} className="w-full md:w-fit px-12 py-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-3xl text-xs font-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em]"><RefreshCw size={20}/> 重新驗證 API 連接</button></div></div>;
    
    if (m.isGreeting) return <div className="mb-16"><div className="bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[5rem] border border-white/5 shadow-2xl relative overflow-hidden group"><p className="relative z-10 text-slate-100 leading-relaxed font-medium text-3xl italic font-serif-heavy tracking-tighter">「{m.content}」</p></div></div>;
    
    if (m.data) {
        return (
            <div className="flex flex-col gap-8 mb-32 animate-fade-in">
                <div className="bg-slate-900/60 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden transition-all hover:border-indigo-500/30 group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity"><Brain size={80} className="text-indigo-400"/></div>
                    <div className="flex flex-col gap-10 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-indigo-600 rounded-3xl"><Sparkles className="text-white" size={32}/></div>
                            <h3 className="text-3xl md:text-4xl font-serif-heavy text-white">智慧戰略解析</h3>
                        </div>
                        <div className="space-y-10">
                            <p className="text-2xl md:text-3xl text-slate-100 leading-relaxed font-black border-l-8 border-indigo-600 pl-10">
                                {m.data.executive_summary.description.split('。')[0]}。
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-4">核心戰略建議</span>
                                    <p className="text-xl font-bold text-slate-200">{m.data.actionable_advice[0].content}</p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block mb-4">年度發展方向</span>
                                    <p className="text-xl font-bold text-slate-200">{m.data.executive_summary.direction}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <button 
                                onClick={() => onOutputReport(m.data!)}
                                className="w-full md:w-fit px-16 py-8 bg-white text-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-6 transition-all hover:scale-105 active:scale-95 font-black text-xl uppercase tracking-widest"
                            >
                                <FileText size={28}/> 輸出完整專業戰略報告
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
    const [messages, setMessages] = useState<Message[]>([{ type: 'ai', content: '尊貴的諮詢者，東西方命理混合引擎已就緒。您可以先諮詢特定問題，隨時可以點擊「輸出完整專業報告」獲取 PDF 版本。', isGreeting: true }]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | null>(null);
    const [input, setInput] = useState('');
    const [activeReportData, setActiveReportData] = useState<AIResponse | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, activeReportData]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading || !chart) return;
        setLoadingState(queryText.match(/2026|未來|趨勢|報導|市場/) ? 'searching' : 'thinking');
        setMessages(p => [...p, { type: 'user', content: queryText }]);
        setIsLoading(true);
        setActiveReportData(null); 
        try { 
            const data = await callGeminiAPI(chart, queryText, messages); 
            setMessages(p => [...p, { type: 'ai', data, question: queryText }]); 
        }
        catch (err: any) { 
            setMessages(p => [...p, { type: 'error', content: `分析引擎異常：${err.message}` }]); 
        }
        finally { setIsLoading(false); setLoadingState(null); }
    };

    if (!chart) return <InputForm onStart={(d) => setChart(calculateChart(d))} />;

    return (
        <div className="min-h-screen pt-32 pb-[450px] bg-[#050505] flex flex-col items-center">
            <div className="fixed top-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-40 no-print">
                <div className="max-w-7xl mx-auto px-12 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner"><BookOpen className="text-indigo-400" size={28}/></div>
                        <h1 className="text-2xl font-serif-heavy text-white tracking-tighter">東西命理科學顧問</h1>
                    </div>
                    <div className="flex gap-4">
                        {messages.some(m => m.data) && (
                            <button 
                                onClick={() => {
                                    const lastData = [...messages].reverse().find(m => m.data)?.data;
                                    if (lastData) setActiveReportData(lastData);
                                }}
                                className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <Layers size={18}/> 檢視最後一份報告
                            </button>
                        )}
                        <button onClick={() => setChart(null)} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl border border-white/10 transition-all"><RefreshCw size={24}/></button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl px-8 space-y-24">
                {activeReportData ? (
                    <div className="relative animate-fade-in">
                        <button onClick={() => setActiveReportData(null)} className="mb-8 flex items-center gap-4 text-slate-400 hover:text-white transition-colors font-black text-sm uppercase tracking-widest px-8 py-4 bg-white/5 rounded-full no-print">
                            <ArrowRight className="rotate-180" size={20}/> 返回戰略對話
                        </button>
                        <MagazineReport data={activeReportData} chart={chart} />
                    </div>
                ) : (
                    <>
                        <ZiweiChart chart={chart} onEdit={() => setChart(null)} />
                        <div className="space-y-24">
                            {messages.map((m, i) => (
                                <MessageItem key={i} m={m} chart={chart} onOutputReport={(data) => setActiveReportData(data)} onRetryKey={async () => { 
                                    const s = getAiStudio(); if (s) { await s.openSelectKey(); if (m.question) performQuery(m.question); } 
                                }} />
                            ))}
                            {isLoading && loadingState && <div className="flex justify-center py-24"><LoadingOverlay state={loadingState} /></div>}
                            <div ref={endRef} className="h-40"/>
                        </div>
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-black via-black/95 to-transparent z-50 no-print flex flex-col items-center gap-10">
                {!activeReportData && (
                    <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { const q = input; setInput(''); performQuery(q); } }} className="w-full max-w-6xl relative group shadow-2xl rounded-[4rem]">
                        <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="輸入您的諮詢問題..." className="w-full bg-slate-900/90 backdrop-blur-[50px] border border-white/10 rounded-[4rem] px-16 py-12 text-white outline-none focus:border-indigo-500/50 pr-44 text-xl md:text-3xl placeholder:text-slate-600 font-serif-heavy transition-all" />
                        <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-6 top-6 bottom-6 aspect-square bg-gradient-to-tr from-indigo-600 to-purple-800 text-white rounded-full flex items-center justify-center hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all disabled:opacity-20 active:scale-90">{isLoading ? <Loader2 className="animate-spin" size={32}/> : <ChevronRight size={48} />}</button>
                    </form>
                )}

                {!activeReportData && (
                    <div className="w-full max-w-6xl overflow-x-auto scrollbar-hide flex items-center justify-start md:justify-center gap-6 px-4 pb-4">
                        {GUIDANCE_QUESTIONS.map((g, idx) => (
                            <button key={idx} disabled={isLoading} onClick={() => { performQuery(g.query); }} className="shrink-0 flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 px-8 py-6 rounded-full text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg"><span className="text-indigo-400">{g.icon}</span><span className="text-sm font-black tracking-widest whitespace-nowrap uppercase">{g.label}</span></button>
                        ))}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                @media print { 
                    .report-root { border: none !important; margin: 0 !important; padding: 15mm !important; box-shadow: none !important; } 
                    .no-print { display: none !important; } 
                    body { background: white !important; color: black !important; }
                    .report-grain { display: none !important; }
                }
            `}</style>
        </div>
    );
};
