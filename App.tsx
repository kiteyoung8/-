
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, FileText, Download, 
  ArrowRight, Moon, Brain, CheckCircle2,
  ChevronRight, Info, Calendar, Star, Edit3,
  Printer, ArrowLeft, Sun, Shield, Zap, Heart,
  Gem, Compass, Target, TrendingUp, UserSearch, Briefcase, Search, ExternalLink, Loader2
} from 'lucide-react';
import { calculateChart } from './MetaphysicsEngine';
import { callGeminiAPI } from './services/geminiService';
import { ChartData, Message, FormData as AppFormData, PalaceData, AIResponse, Star as StarType } from './types';

// --- Star Knowledge Base ---
const STAR_DETAILS: Record<string, { element: string; meaning: string; sihua?: string }> = {
    '紫微': { element: '土', meaning: '至尊首領，主權威、貴氣、自尊。', sihua: '化權主權勢，化科主聲譽。' },
    '天機': { element: '木', meaning: '智慧動星，主策劃、變動、思維。', sihua: '化祿主機智獲利，化忌主多慮。' },
    '太陽': { element: '火', meaning: '光明之星，主博愛、事業、名譽。', sihua: '化祿主貴人，化忌主辛勞。' },
    '武曲': { element: '金', meaning: '財帛之星，主決斷、財富、剛毅。', sihua: '化祿主得財，化忌主周轉。' },
    '天同': { element: '水', meaning: '福德之星，主享受、溫和、懶散。', sihua: '化祿主安逸，化忌主操心。' },
    '廉貞': { element: '火', meaning: '次桃花星，主政治、情感、傲氣。', sihua: '化祿主桃花，化忌主刑訟。' },
    '天府': { element: '土', meaning: '財庫之星，主保守、穩定、掌權。' },
    '太陰': { element: '水', meaning: '月亮之星，主財富、房產、母妻。', sihua: '化祿主入財，化忌主憂鬱。' },
    '貪狼': { element: '木火', meaning: '正桃花星，主慾望、才藝、交際。', sihua: '化權主實權，化忌主受阻。' },
    '巨門': { element: '水', meaning: '是非之星，主口才、洞察、疑慮。', sihua: '化祿主口才得利，化忌主是非。' },
    '天相': { element: '水', meaning: '印信之星，主文書、正直、服務。' },
    '天梁': { element: '土', meaning: '蔭壽之星，主庇蔭、清高、醫藥。', sihua: '化科主聲名，化權主管理。' },
    '七殺': { element: '金', meaning: '將星之星，主肅殺、獨立、衝勁。' },
    '破軍': { element: '水', meaning: '損耗之星，主改革、創新、破壞。', sihua: '化祿主開創，化權主主動。' },
    '祿存': { element: '土', meaning: '財祿之星，主穩定財富、解厄、吉祥。' },
    '文昌': { element: '金', meaning: '科甲之星，主正統文學、功名、禮儀。', sihua: '化科主學業，化忌主文書失誤。' },
    '文曲': { element: '水', meaning: '才藝之星，主才華、口才、異路功名。', sihua: '化科主名望，化忌主口舌是非。' },
    '天魁': { element: '火', meaning: '天乙貴人，主陽貴、明顯的提攜與機會。' },
    '天鉞': { element: '火', meaning: '玉堂貴人，主陰貴、暗中的契機與幫助。' },
    '左輔': { element: '土', meaning: '助人之星，主扶持、穩重、善行、明助。' },
    '右弼': { element: '水', meaning: '輔佐之星，主機敏、圓融、輔助、暗助。' },
    '地空': { element: '火', meaning: '空靈之星，主空亡、哲學、物質損耗。' },
    '地劫': { element: '火', meaning: '劫財之星，主突發變動、奇思、財產劫難。' },
    '擎羊': { element: '金', meaning: '剛暴之星，主刑傷、勇猛、明面的衝突。' },
    '陀羅': { element: '金', meaning: '糾纏之星，主拖延、暗病、固執、暗鬥。' },
    '火星': { element: '火', meaning: '剛烈之星，主急躁、破壞、爆發力。' },
    '鈴星': { element: '火', meaning: '陰火之星，主固執、驚嚇、潛在的破壞。' }
};

// --- Helper: PDF Export ---
const exportToPDF = (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const opt = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
};

// --- Component: Star Icon Logic ---
const StarIcon = ({ star, isReport }: { star: StarType, isReport: boolean }) => {
    if (isReport) return null; 
    
    const iconSize = 10;
    const name = star.name;
    
    if (['紫微', '太陽', '太陰'].includes(name)) return <Sun size={iconSize} className="mb-0.5 opacity-70" />;
    if (['武曲', '七殺', '破軍', '火星'].includes(name)) return <Zap size={iconSize} className="mb-0.5 opacity-70" />;
    if (['天府', '天相', '祿存', '天魁', '天鉞'].includes(name)) return <Shield size={iconSize} className="mb-0.5 opacity-70" />;
    if (['天同', '貪狼', '文曲', '右弼'].includes(name)) return <Heart size={iconSize} className="mb-0.5 opacity-70" />;
    if (star.type === 'major') return <Gem size={iconSize} className="mb-0.5 opacity-70" />;
    
    return <Sparkles size={8} className="mb-0.5 opacity-40" />;
};

// --- Component: Ziwei Chart ---
const ZiweiChart = ({ chart, isReport = false, onEdit }: { chart: ChartData; isReport?: boolean; onEdit?: () => void }) => {
    const borderColor = isReport ? 'border-slate-300' : 'border-amber-500/20';
    const palaceBg = isReport ? 'bg-white' : 'bg-slate-900/90';
    const shichenZhi = chart.bazi.hour.length >= 2 ? chart.bazi.hour.substring(1, 2) : chart.bazi.hour;
    const textColor = isReport ? 'text-slate-900' : 'text-slate-100';
    const subTextColor = isReport ? 'text-slate-500' : 'text-slate-400';

    return (
        <div className="relative group/chart">
            {onEdit && !isReport && (
                <button 
                    onClick={onEdit}
                    className="absolute -top-12 right-0 flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs text-amber-500 hover:bg-slate-700 transition-all shadow-lg z-20 group"
                >
                    <Edit3 size={14} className="group-hover:rotate-12 transition-transform"/> 修正生辰資料 (重新排盤)
                </button>
            )}
            
            <div className={`ziwei-professional-grid w-full aspect-square max-w-[650px] mx-auto grid grid-cols-4 grid-rows-4 gap-[2px] border-2 ${borderColor} rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] p-[2px] ${isReport ? 'bg-slate-200' : 'bg-slate-800/50'}`}>
                
                <div className={`col-span-2 row-span-2 col-start-2 row-start-2 ${palaceBg} flex flex-col p-6 text-center justify-center items-center gap-1 border-2 ${isReport ? 'border-slate-200' : 'border-amber-500/10'} relative overflow-hidden rounded-xl shadow-inner`}>
                    {!isReport && (
                        <>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                            <Compass className="absolute opacity-[0.03] w-48 h-48 pointer-events-none animate-[spin_20s_linear_infinite]" />
                        </>
                    )}
                    
                    <div className="relative z-10 space-y-1">
                        <div className={`font-serif font-black text-2xl md:text-3xl tracking-tighter ${isReport ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500'}`}>
                            {chart.profile.name}
                        </div>
                        <div className={`text-[10px] md:text-xs font-bold tracking-widest ${subTextColor} uppercase flex items-center justify-center gap-2`}>
                            <span className="bg-slate-500/10 px-1.5 py-0.5 rounded">{chart.profile.isYang ? '陽' : '陰'}{chart.profile.gender === 'male' ? '男' : '女'}</span>
                            <span>•</span>
                            <span className="text-amber-600/80">生肖：{chart.ziwei.animal}</span>
                        </div>
                    </div>

                    <div className={`w-2/3 h-[1px] ${isReport ? 'bg-slate-100' : 'bg-gradient-to-r from-transparent via-slate-700 to-transparent'} my-2`}></div>
                    
                    <div className={`text-[10px] md:text-xs ${subTextColor} space-y-1.5`}>
                        <div className="flex items-center justify-center gap-2">
                            <Calendar size={12} className="text-amber-500/50"/>
                            <span className="font-medium">農曆：<span className={`${isReport ? 'text-slate-700' : 'text-slate-200'} font-bold`}>{chart.display.lunarDetail}</span> <span className="text-amber-500 font-black ml-1">{shichenZhi}時</span></span>
                        </div>
                        <p className="opacity-70 text-[9px] font-mono tracking-tight">公曆：{chart.display.date} {chart.display.time}</p>
                    </div>

                    <div className={`${isReport ? 'bg-rose-50' : 'bg-rose-500/10'} border ${isReport ? 'border-rose-100' : 'border-rose-500/30'} rounded-lg px-3 py-1.5 mt-2 backdrop-blur-sm`}>
                        <div className="text-[9px] md:text-[10px] text-rose-500 font-black leading-tight tracking-widest uppercase">
                            四柱：{chart.bazi.year} {chart.bazi.month} {chart.bazi.day} {chart.bazi.hour}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] md:text-xs mt-3 w-full max-w-[180px]">
                        <div className="flex flex-col items-center">
                            <span className={`${subTextColor} text-[8px] uppercase font-bold`}>命宮</span>
                            <span className={`${textColor} font-black text-lg`}>{chart.ziwei.lifePalaceZhi}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={`${subTextColor} text-[8px] uppercase font-bold`}>局數</span>
                            <span className="text-amber-600 font-black text-lg leading-none">{chart.ziwei.bureau.charAt(0)}<span className="text-xs">{chart.ziwei.bureau.substring(1)}</span></span>
                        </div>
                    </div>
                </div>

                {chart.ziwei.grid.map((palace: PalaceData) => (
                    <div key={palace.zhi} 
                        style={{ gridArea: palace.gridArea }}
                        className={`relative flex flex-col border ${borderColor} ${palaceBg} p-2 transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-500/40 overflow-hidden palace-hover-animation ${palace.isLifePalace && !isReport ? 'ring-1 ring-inset ring-rose-500/30' : ''}`}>
                        
                        {!isReport && palace.isLifePalace && (
                            <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-full pointer-events-none"></div>
                        )}
                        
                        <div className="flex flex-wrap gap-x-1.5 gap-y-1 items-start content-start overflow-hidden h-[75%] relative z-10">
                            {palace.stars.map((star, idx) => {
                                const details = STAR_DETAILS[star.name];
                                return (
                                    <div key={idx} className={`relative flex flex-col items-center leading-none transition-transform hover:scale-110 cursor-help group/star`}>
                                        <StarIcon star={star} isReport={isReport} />
                                        <span className={`text-[10px] md:text-[11px] font-black w-[13px] break-all tracking-tighter ${isReport && star.color.includes('text-slate-400') ? 'text-slate-500' : star.color} ${star.type === 'minor' ? 'opacity-90 font-bold' : ''}`}>
                                            {star.name}
                                        </span>
                                        {star.transformation && (
                                            <span className={`text-[8px] px-0.5 mt-0.5 rounded-sm text-white font-black shadow-sm ${
                                                star.transformation === '祿' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                                star.transformation === '權' ? 'bg-gradient-to-b from-purple-500 to-purple-700' :
                                                star.transformation === '科' ? 'bg-gradient-to-b from-emerald-500 to-emerald-700' : 'bg-gradient-to-b from-blue-500 to-blue-700'
                                            }`}>{star.transformation}</span>
                                        )}
                                        
                                        {/* Star Tooltip */}
                                        {!isReport && details && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl opacity-0 invisible group-hover/star:opacity-100 group-hover/star:visible transition-all duration-200 z-[100] backdrop-blur-md">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold text-sm ${star.color}`}>{star.name}</span>
                                                    <span className="text-[10px] px-1.5 bg-slate-700 rounded text-slate-400 font-bold">五行：{details.element}</span>
                                                </div>
                                                <p className="text-[10px] leading-relaxed text-slate-300">{details.meaning}</p>
                                                {details.sihua && (
                                                    <div className="mt-2 pt-2 border-t border-slate-700 text-[9px] text-amber-500/80 italic">
                                                        化曜影響：{details.sihua}
                                                    </div>
                                                )}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`mt-auto pt-1.5 border-t ${isReport ? 'border-slate-100' : 'border-slate-700/30'} flex flex-col items-end relative z-10`}>
                            <div className="flex justify-between w-full items-end font-mono">
                                 <div className="flex flex-col items-start leading-none space-y-0.5">
                                    <span className={`text-[8px] font-bold ${isReport ? 'text-slate-400' : 'text-slate-500'}`}>{palace.decades}</span>
                                    <span className={`text-[10px] font-black ${isReport ? 'text-slate-500' : 'text-slate-400'}`}>{palace.gan}</span>
                                 </div>
                                 <div className="flex flex-col items-end leading-none">
                                    <span className={`font-black text-[11px] md:text-[13px] mb-0.5 ${palace.isLifePalace ? 'text-rose-600' : (isReport ? 'text-indigo-700' : 'text-amber-500/90')}`}>
                                        {palace.isLifePalace && <Target size={10} className="inline mr-1 mb-0.5" />}
                                        {palace.name}
                                    </span>
                                    <span className={`text-[9px] font-bold ${isReport ? 'text-slate-300' : 'text-slate-600'}`}>{palace.zhi}</span>
                                 </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- View: Landing ---
const LandingView = ({ onStart }: { onStart: () => void }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-8 bg-mystic">
        <div className="relative">
            <div className="absolute -inset-10 bg-amber-500/20 blur-3xl rounded-full"></div>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-4xl md:text-5xl font-serif font-bold relative z-10 animate-float shadow-2xl">易</div>
        </div>
        <div className="space-y-4 max-w-2xl relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">全能命理科學顧問</h1>
            <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto">
                結合傳統命理與現代科學技術，<br/>提供科學化、心理學維度的命盤解析與人生諮詢報告。
            </p>
        </div>
        <button onClick={onStart} className="px-10 py-4 bg-white text-slate-900 font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2">
            開啟深度解析 <ChevronRight size={20}/>
        </button>
    </div>
);

// --- View: Form ---
const FormView = ({ onSubmit, formData, setFormData }: { onSubmit: (e: React.FormEvent) => void; formData: AppFormData; setFormData: (d: AppFormData) => void }) => (
    <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-start animate-fade-in bg-mystic">
        <form onSubmit={onSubmit} className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <div className="absolute top-0 right-10 w-20 h-20 bg-amber-500/10 blur-3xl rounded-full"></div>
            <div className="space-y-2 mb-6 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Calendar className="text-amber-500" size={24}/> 出生資訊設定
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500/50 font-bold tracking-widest uppercase ml-1">
                    <Shield size={10}/> 採用 TTKCA 同級高精度曆法演算法
                </div>
            </div>
            <div className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 ml-1 font-bold tracking-wider">受測者姓名</label>
                    <input required placeholder="姓名" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 ml-1 font-bold">性別</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'male' | 'female'})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none cursor-pointer"><option value="male">乾造 (男)</option><option value="female">坤造 (女)</option></select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 ml-1 font-bold">曆法類型</label>
                        <select value={formData.inputType} onChange={e => setFormData({...formData, inputType: e.target.value as 'solar' | 'lunar'})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none cursor-pointer"><option value="solar">國曆 (公曆)</option><option value="lunar">農曆 (陰曆)</option></select>
                    </div>
                </div>
                {formData.inputType === 'lunar' ? (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1"><label className="text-[10px] text-slate-500 ml-1">年份</label><input type="number" value={formData.lunarYear} onChange={e => setFormData({...formData, lunarYear: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white text-center" /></div>
                        <div className="space-y-1"><label className="text-[10px] text-slate-500 ml-1">月份</label><input type="number" value={formData.lunarMonth} onChange={e => setFormData({...formData, lunarMonth: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white text-center" /></div>
                        <div className="space-y-1"><label className="text-[10px] text-slate-500 ml-1">日期</label><input type="number" value={formData.lunarDay} onChange={e => setFormData({...formData, lunarDay: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white text-center" /></div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 ml-1 font-bold">日期選擇</label>
                        <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3.5 text-white outline-none" />
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 ml-1 font-bold">出生時間 (精確至分)</label>
                    <input type="time" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3.5 text-white outline-none" />
                </div>
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all text-lg mt-4">
                生成精密命盤
            </button>
        </form>
    </div>
);

// --- View: Dashboard ---
const DashboardView = ({ chart, messages, setMessages, isLoading, setIsLoading, input, setInput, onEdit, onShowReport }: any) => {
    const endRef = useRef<HTMLDivElement>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [loadingState, setLoadingState] = useState<'thinking' | 'searching' | 'generating' | null>(null);

    useEffect(() => {
        if (!isLoading) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const performQuery = async (queryText: string) => {
        if (!queryText.trim() || isLoading) return;
        
        const isSearch = queryText.match(/最近|時事|新聞|2025|未來|現況|趨勢|網路/);
        const isComplex = queryText.length > 20 || queryText.match(/為什麼|解析|深度|分析|因果|關聯|細節/);

        if (isSearch) setLoadingState('searching');
        else if (isComplex) setLoadingState('thinking');
        else setLoadingState('generating');

        setMessages((prev: any) => [...prev, { type: 'user', content: queryText }]);
        setIsLoading(true);
        
        try {
            // Pass history for context awareness
            const data = await callGeminiAPI(chart, queryText, messages);
            setMessages((prev: any) => [...prev, { type: 'ai', data, question: queryText }]);
        } catch (err: any) {
            setMessages((prev: any) => [...prev, { type: 'error', content: err.message }]);
        } finally {
            setIsLoading(false);
            setLoadingState(null);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const q = input;
        setInput('');
        performQuery(q);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput('');
        performQuery(suggestion);
    };

    const hasAIResponses = messages.some((m: any) => m.type === 'ai' && m.data);

    const suggestions = [
        { text: "我的整體運勢分析？", icon: <Sparkles size={14}/> },
        { text: "2025年經濟趨勢對我的影響？", icon: <TrendingUp size={14}/> }, // Updated for search
        { text: "感情姻緣深度解析？", icon: <Heart size={14}/> },
        { text: "性格盲點與轉運建議？", icon: <UserSearch size={14}/> },
        { text: "適合創業還是穩定工作？", icon: <Briefcase size={14}/> }
    ];

    return (
        <div className="min-h-screen pt-32 pb-64 flex flex-col bg-mystic max-w-5xl mx-auto px-4">
            <div ref={chartContainerRef} className="glass-panel p-4 md:p-8 rounded-3xl mb-12 shadow-2xl relative overflow-visible">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none font-serif text-8xl">命</div>
                 <ZiweiChart chart={chart} onEdit={onEdit} />
            </div>
            
            <div className="flex-1 space-y-8 mb-12">
                {messages.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`${m.type === 'user' ? 'bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg' : 'w-full'}`}>
                            {m.isGreeting ? (
                                <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-2 text-amber-500 mb-3 font-bold text-lg"><Moon size={20}/> AI 命理顧問</div>
                                    <p className="text-slate-200 leading-relaxed">{m.content}</p>
                                </div>
                            ) : m.type === 'user' ? (
                                <p className="leading-relaxed font-medium">{m.content}</p>
                            ) : m.data ? (
                                <div className="space-y-6">
                                    <div className="bg-slate-800/95 border border-white/10 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-bold text-amber-400 mb-3 font-serif">{m.data.executive_summary.title}</h3>
                                            {m.data.model_used && (
                                                <span className="text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full font-bold">
                                                    AI: {m.data.model_used.includes('pro') ? 'Deep Thinking' : m.data.model_used.includes('flash') ? 'Fast Response' : 'Basic'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-200 leading-relaxed text-base italic mb-4 opacity-80">「{m.data.executive_summary.direction}」</p>
                                        <p className="text-slate-300 leading-relaxed">{m.data.executive_summary.description}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="bg-slate-800/40 p-5 rounded-xl border border-purple-500/20 shadow-lg transition-hover hover:bg-slate-800/60">
                                            <h4 className="text-xs text-purple-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Star size={12}/> 玄學透視
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-loose">{m.data.metaphysical_perspective.content}</p>
                                        </div>
                                        <div className="bg-slate-800/40 p-5 rounded-xl border border-indigo-500/20 shadow-lg">
                                            <h4 className="text-xs text-indigo-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Brain size={12}/> 科學解析
                                            </h4>
                                            <p className="text-sm text-slate-300導致 leading-loose">{m.data.scientific_decoding.psychology}</p>
                                        </div>
                                    </div>
                                    {m.data.groundingSources && m.data.groundingSources.length > 0 && (
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-blue-500/20">
                                            <h4 className="text-[10px] text-blue-400 mb-2 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Search size={10}/> 網路搜尋參考來源
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {m.data.groundingSources.map((source: any, sIdx: number) => (
                                                    <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-[10px] text-slate-300 transition-colors border border-white/5">
                                                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                                                        <ExternalLink size={10} className="opacity-50"/>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
                                        <h4 className="flex items-center gap-3 text-emerald-400 font-bold text-base mb-4 tracking-wide"><CheckCircle2 size={20}/> 具體行動建議</h4>
                                        <ul className="space-y-3">
                                            {m.data.actionable_advice.map((a: any, idx: number) => (
                                                <li key={idx} className="text-sm text-slate-200 flex gap-3 leading-relaxed items-start">
                                                    <span className="text-emerald-500 font-bold mt-0.5 shrink-0">·</span> 
                                                    <span><span className="text-emerald-500/80 font-bold mr-2">[{a.type}]</span>{a.content}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/30 font-medium">{m.content}</div>}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col gap-3 animate-fade-in-up">
                        <div className="animate-pulse text-amber-500 flex items-center gap-3 p-5 bg-slate-800/50 rounded-2xl w-fit shadow-xl border border-amber-500/10">
                            {loadingState === 'thinking' ? (
                                <>
                                    <Brain className="animate-bounce" size={18}/> 
                                    <span className="font-bold tracking-widest italic">深度推理中：正在構建複雜星曜因果鏈與大數據對比...</span>
                                </>
                            ) : loadingState === 'searching' ? (
                                <>
                                    <Search className="animate-spin" size={18}/> 
                                    <span className="font-bold tracking-widest italic">聯網搜索中：正在核實近期全球趨勢與相關資訊...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="animate-spin" size={18}/> 
                                    <span className="font-bold tracking-widest">正在生成解析：調取命理智庫與心理學模型...</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div ref={endRef}/>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-40">
                <div className="max-w-4xl mx-auto space-y-5 pointer-events-auto">
                    {/* 引導式按鈕區域 */}
                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                        {suggestions.map((s, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleSuggestionClick(s.text)}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-white/5 rounded-full text-xs text-slate-300 hover:text-amber-500 hover:border-amber-500/30 hover:bg-slate-800 transition-all backdrop-blur-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <span className="text-amber-500/50 group-hover:text-amber-500 group-hover:scale-110 transition-all">{s.icon}</span>
                                {s.text}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        {hasAIResponses && (
                            <button 
                                onClick={onShowReport}
                                className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-slate-900 rounded-full font-black text-sm shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all active:scale-95"
                            >
                                <FileText size={18}/> 產生並下載完整報告
                            </button>
                        )}
                        <form onSubmit={handleSend} className="relative w-full max-w-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.6)] rounded-full">
                            <input 
                                value={input} 
                                onChange={e => setInput(e.target.value)} 
                                disabled={isLoading} 
                                placeholder="詢問您的命盤問題（如：適合創業嗎？或感情進展？）" 
                                className="w-full bg-slate-800/95 border border-slate-700/50 rounded-full px-8 py-6 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all pr-20 shadow-2xl placeholder:text-slate-500 text-lg" 
                            />
                            <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-3 top-3 bottom-3 aspect-square bg-amber-500 text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/30">
                                <Send size={24}/>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- View: Report ---
const ReportView = ({ chart, messages, onBack }: { chart: ChartData; messages: Message[]; onBack: () => void }) => {
    const reportDataList = messages
        .filter(m => m.type === 'ai' && m.data)
        .map(m => ({ question: m.question, data: m.data as AIResponse }));

    const handleDownload = () => {
        exportToPDF('report-content', `紫微命盤彙整報告_${chart.profile.name}.pdf`);
    };

    return (
        <div className="min-h-screen pt-24 pb-20 bg-mystic px-4 animate-fade-in">
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold">
                    <ArrowLeft size={18}/> 返回諮詢中心
                </button>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white px-7 py-3 rounded-full font-black text-sm shadow-xl transition-all"
                >
                    <Download size={18}/> 導出 PDF 正式報告
                </button>
            </div>

            <div id="report-content" className="bg-white text-slate-900 p-8 md:p-12 rounded-2xl shadow-2xl overflow-hidden font-sans">
                <div className="border-b-4 border-slate-900 pb-8 mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-serif font-black tracking-tighter">紫微斗數生命藍圖</h1>
                        <p className="text-slate-400 text-base mt-2 uppercase tracking-[0.3em] font-black">AI Metaphysics Analytics Report</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-black mb-2">易</div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scientific Destiny Engine</p>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 border-l-8 border-amber-500 pl-4 uppercase tracking-tight">一、精密星圖配置 (Star Chart)</h2>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        <ZiweiChart chart={chart} isReport={true} />
                    </div>
                </div>

                <div className="space-y-16">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 border-l-8 border-amber-500 pl-4 uppercase tracking-tight">二、深度解析彙整 (Intelligence Insights)</h2>
                    
                    {reportDataList.map((item, idx) => (
                        <div key={idx} className="space-y-10 border-b-2 border-slate-100 pb-16 last:border-0">
                            {item.question && (
                                <div className="bg-slate-100 border-l-4 border-indigo-600 p-6 rounded-r-lg">
                                    <span className="text-[10px] uppercase font-black text-indigo-600 block mb-1">User Inquiry</span>
                                    <p className="text-xl font-bold text-slate-800">「{item.question}」</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-3xl font-serif font-black text-amber-600 leading-tight">{item.data.executive_summary.title}</h3>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                    <Target size={14}/> 核心導引：{item.data.executive_summary.direction}
                                </div>
                                <p className="text-lg leading-relaxed text-slate-700 font-medium">{item.data.executive_summary.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                    <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Star size={14}/> 傳統玄學透視
                                    </h4>
                                    <p className="text-base text-slate-600 leading-loose">{item.data.metaphysical_perspective.content}</p>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                    <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Brain size={14}/> 現代心理解譯
                                    </h4>
                                    <p className="text-base text-slate-600 leading-loose">{item.data.scientific_decoding.psychology}</p>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                                <h4 className="text-emerald-800 font-black text-lg mb-6 flex items-center gap-3">
                                    <CheckCircle2 size={24} className="text-emerald-600"/> 具體行動策略建議
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {item.data.actionable_advice.map((advice, aIdx) => (
                                        <li key={aIdx} className="flex gap-4 items-start">
                                            <div className="shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-black mt-1">{aIdx + 1}</div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{advice.type}</span>
                                                <p className="text-sm text-slate-700 font-bold leading-relaxed">{advice.content}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 pt-10 border-t-2 border-slate-200 text-center text-xs text-slate-400 font-bold">
                    <div className="flex justify-center gap-6 mb-4">
                        <span className="flex items-center gap-1"><Shield size={12}/> 高精度曆法核驗 (TTKCA Level)</span>
                        <span className="flex items-center gap-1"><Brain size={12}/> AI 深度推理模型</span>
                        <span className="flex items-center gap-1"><Star size={12}/> 紫微斗數精成體系</span>
                    </div>
                    <p>本報告由 全能命理科學顧問 生成 • 生成時間：{new Date().toLocaleString()}</p>
                    <p className="mt-2 tracking-widest">© 2024 ZENITH METAPHYSICS RESEARCH. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </div>
    );
};

// --- App Root ---
export function App() {
    const [view, setView] = useState<'landing' | 'form' | 'dashboard' | 'report'>('landing');
    const [formData, setFormData] = useState<AppFormData>({
        name: '受測者', gender: 'male', birthDate: '1978-10-25', birthTime: '18:30', inputType: 'solar', 
        lunarYear: '1978', lunarMonth: '09', lunarDay: '24'
    });
    const [chart, setChart] = useState<ChartData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = calculateChart(formData);
            setChart(result);
            const lifePalace = result.ziwei.grid.find(p => p.isLifePalace);
            const mainStars = lifePalace?.stars.filter(s => s.type === 'major').map(s => s.name).join('、') || '無主星';
            
            setMessages([{ 
                type: 'ai', 
                isGreeting: true, 
                content: `命盤已排定。依據精密萬年曆 (TTKCA 標準) 轉換為農曆：${result.display.lunarDetail}。您的命宮位於【${result.ziwei.lifePalaceZhi}】宮，主星為【${mainStars}】。請問您想先從哪方面的解析開始？` 
            }]);
            setView('dashboard');
        } catch (err: any) { alert("排盤錯誤：" + err.message); }
    };

    const handleEdit = () => {
        setView('form');
    };

    const handleShowReport = () => {
        setView('report');
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    return (
        <div className="min-h-screen bg-mystic font-sans text-slate-100 selection:bg-amber-500/30">
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .bg-mystic { background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); }
                .glass-panel { background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
                
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.2), inset 0 0 5px rgba(245, 158, 11, 0.1); }
                    50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.2); }
                    100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.2), inset 0 0 5px rgba(245, 158, 11, 0.1); }
                }
                .palace-hover-animation { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .palace-hover-animation:hover {
                    animation: pulse-glow 2s infinite ease-in-out;
                    z-index: 20;
                }

                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.4); }
            `}</style>
            <header className="fixed top-0 left-0 right-0 z-50 p-4 glass-panel flex justify-between items-center rounded-b-3xl mx-2 shadow-2xl border-b-0 mt-1">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('landing')}>
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-black shadow-xl shadow-amber-500/20 group-hover:rotate-[360deg] transition-all duration-700">易</div>
                    <div>
                        <h1 className="font-black text-white text-sm md:text-lg tracking-tighter leading-none">全能命理科學顧問</h1>
                        <p className="text-[10px] text-amber-500/70 mt-1 font-bold tracking-widest uppercase">Precision Metaphysics Engine</p>
                    </div>
                </div>
                {view === 'dashboard' && (
                    <div className="flex gap-2">
                        <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-[10px] text-amber-500 font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">
                            <Edit3 size={12}/> 修正資料
                        </button>
                    </div>
                )}
            </header>
            <main>
                {view === 'landing' && <LandingView onStart={() => setView('form')} />}
                {view === 'form' && <FormView formData={formData} setFormData={setFormData} onSubmit={handleCalculate} />}
                {view === 'dashboard' && chart && <DashboardView chart={chart} messages={messages} setMessages={setMessages} isLoading={isLoading} setIsLoading={setIsLoading} input={input} setInput={setInput} onEdit={handleEdit} onShowReport={handleShowReport} />}
                {view === 'report' && chart && <ReportView chart={chart} messages={messages} onBack={() => setView('dashboard')} />}
            </main>
        </div>
    );
}
