
import { PalaceData, ChartData, Star } from './types';
import { Lunar, Solar } from 'lunar-javascript';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_NAMES = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '官祿', '田宅', '福德', '父母'];

// 生肖繁體中文映射表
const ZODIAC_TRADITIONAL: Record<string, string> = {
    '鼠': '鼠', '牛': '牛', '虎': '虎', '兔': '兔', '龍': '龍', '蛇': '蛇',
    '馬': '馬', '羊': '羊', '猴': '猴', '雞': '雞', '狗': '狗', '豬': '豬',
    // Fix: Removed duplicate '狗': '狗' which caused an object literal error on line 13.
    '龙': '龍', '马': '馬', '鸡': '雞', '猪': '豬'
};

const MAJOR_STARS_TABLE: Record<string, string[]> = {
    '子': ['亥', '酉', '申', '未', '辰', '辰', '巳', '午', '未', '申', '酉', '戌', '寅'],
    '丑': ['子', '戌', '酉', '申', '巳', '卯', '辰', '巳', '午', '未', '申', '酉', '丑'],
    '寅': ['丑', '亥', '戌', '酉', '午', '寅', '卯', '辰', '巳', '午', '未', '申', '子'],
    '卯': ['寅', '子', '亥', '戌', '未', '丑', '寅', '卯', '辰', '巳', '午', '未', '亥'],
    '辰': ['卯', '丑', '子', '亥', '申', '子', '丑', '寅', '卯', '辰', '巳', '午', '戌'],
    '巳': ['辰', '寅', '丑', '子', '酉', '亥', '子', '丑', '寅', '卯', '辰', '巳', '酉'],
    '午': ['巳', '卯', '寅', '丑', '戌', '戌', '亥', '子', '丑', '寅', '卯', '辰', '申'],
    '未': ['午', '辰', '卯', '寅', '亥', '酉', '戌', '亥', '子', '丑', '寅', '卯', '未'],
    '申': ['未', '巳', '辰', '卯', '子', '申', '酉', '戌', '亥', '子', '丑', '寅', '午'],
    '酉': ['申', '午', '巳', '辰', '丑', '未', '申', '酉', '戌', '亥', '子', '丑', '巳'],
    '戌': ['酉', '未', '午', '巳', '寅', '午', '未', '申', '酉', '戌', '亥', '子', '辰'],
    '亥': ['戌', '申', '未', '午', '卯', '巳', '午', '未', '申', '酉', '戌', '亥', '卯']
};

const ZHI_GRID_AREA: Record<string, string> = {
    '巳': '1 / 1 / 2 / 2', '午': '1 / 2 / 2 / 3', '未': '1 / 3 / 2 / 4', '申': '1 / 4 / 2 / 5',
    '辰': '2 / 1 / 3 / 2', '酉': '2 / 4 / 3 / 5', 
    '卯': '3 / 1 / 4 / 2', '戌': '3 / 4 / 4 / 5',
    '寅': '4 / 1 / 5 / 2', '丑': '4 / 2 / 5 / 3', '子': '4 / 3 / 5 / 4', '亥': '4 / 4 / 5 / 5'
};

const getWesternZodiac = (month: number, day: number) => {
    const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ["摩羯座", "水瓶座", "雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座"];
    const elements = ["土象", "風象", "水象", "火象", "土象", "風象", "水象", "火象", "土象", "風象", "水象", "火象"];
    const idx = (day < dates[month - 1]) ? (month - 1) : (month % 12);
    return { name: signs[idx], element: elements[idx] };
};

const getBureau = (pGan: string, pZhi: string): { val: number; name: string } => {
    const gIdx = Math.floor(GAN.indexOf(pGan) / 2);
    const zIdx = Math.floor(ZHI.indexOf(pZhi) / 2);
    const matrix = [
        [4, 2, 6, 4, 2, 6], [2, 6, 5, 2, 6, 5], [6, 5, 3, 6, 5, 3], [5, 3, 4, 5, 3, 4], [3, 4, 2, 3, 4, 2]
    ];
    const val = matrix[gIdx % 5][zIdx % 6];
    const names: Record<number, string> = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' };
    return { val, name: names[val] };
};

const getZiweiZhi = (bureau: number, day: number): string => {
    let x = 0;
    while ((day + x) % bureau !== 0) x++;
    const q = (day + x) / bureau;
    let posIdx;
    if (x % 2 === 0) {
        posIdx = (2 + q + x - 1) % 12; 
    } else {
        posIdx = (2 + q - x - 1 + 12) % 12;
    }
    return ZHI[posIdx];
};

export const calculateChart = (formData: any): ChartData => {
    const { name, gender, birthDate, birthTime } = formData;
    let baseLunar: Lunar;
    let baseSolar: Solar;
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    const [y, m, d] = birthDate.split('-').map(Number);
    baseSolar = Solar.fromYmdHms(y, m, d, hours, minutes, 0);
    baseLunar = baseSolar.getLunar();

    const hIdx = Math.floor((hours + 1) / 2) % 12; 
    const lMonth = baseLunar.getMonth();
    const lDay = baseLunar.getDay();
    const yearZhi = baseLunar.getYearZhi();
    const yearGan = baseLunar.getYearGan();
    const yearGanIdx = GAN.indexOf(yearGan);

    const monthPos = (2 + (lMonth - 1)) % 12; 
    const lifeIdx = (monthPos - hIdx + 12) % 12;
    const bodyIdx = (monthPos + hIdx) % 12;

    const startGanIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
    const getPalaceGan = (idx: number) => GAN[(startGanIdx + (idx - 2 + 12) % 12) % 10];

    const bureau = getBureau(getPalaceGan(lifeIdx), ZHI[lifeIdx]);
    const zwZhi = getZiweiZhi(bureau.val, lDay);

    const westernZodiac = getWesternZodiac(baseSolar.getMonth(), baseSolar.getDay());

    const auxStars: Record<string, Star[]> = {};
    const addStar = (palaceZhi: string, starName: string, color: string, type: 'major' | 'minor' | 'aux') => {
        if (!auxStars[palaceZhi]) auxStars[palaceZhi] = [];
        auxStars[palaceZhi].push({ name: starName, type, color });
    };

    // --- 1. 祿存、擎羊、陀羅 (年干) ---
    const luCunMap: Record<string, string> = { '甲':'寅', '乙':'卯', '丙':'巳', '丁':'午', '戊':'巳', '己':'午', '庚':'申', '辛':'酉', '壬':'亥', '癸':'子' };
    const lcZhi = luCunMap[yearGan];
    const lcIdx = ZHI.indexOf(lcZhi);
    addStar(lcZhi, '祿存', 'text-amber-300', 'aux');
    addStar(ZHI[(lcIdx + 1) % 12], '擎羊', 'text-red-400', 'minor');
    addStar(ZHI[(lcIdx - 1 + 12) % 12], '陀羅', 'text-red-400', 'minor');

    // --- 2. 左輔、右弼 (月) ---
    addStar(ZHI[(4 + (lMonth - 1)) % 12], '左輔', 'text-emerald-400', 'aux');
    addStar(ZHI[(10 - (lMonth - 1) + 12) % 12], '右弼', 'text-emerald-400', 'aux');

    // --- 3. 文昌、文曲 (時) ---
    const changZhi = ZHI[(10 - hIdx + 12) % 12];
    const quZhi = ZHI[(4 + hIdx) % 12];
    addStar(changZhi, '文昌', 'text-emerald-400', 'aux');
    addStar(quZhi, '文曲', 'text-emerald-400', 'aux');

    // --- 4. 天魁、天鉞 (年干) ---
    const kuiYueMap: Record<string, [string, string]> = {
        '甲': ['丑', '未'], '乙': ['子', '申'], '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '戊': ['丑', '未'], '己': ['子', '申'], '庚': ['丑', '未'], '辛': ['午', '寅'],
        '壬': ['卯', '巳'], '癸': ['卯', '巳']
    };
    const [kui, yue] = kuiYueMap[yearGan];
    addStar(kui, '天魁', 'text-emerald-400', 'aux');
    addStar(yue, '天鉞', 'text-emerald-400', 'aux');

    // --- 5. 地空、地劫 (時) ---
    addStar(ZHI[(11 + hIdx) % 12], '地劫', 'text-red-400', 'minor');
    addStar(ZHI[(11 - hIdx + 12) % 12], '地空', 'text-red-400', 'minor');

    // --- 6. 火星、鈴星 (年支 + 時) ---
    const branch = baseLunar.getYearZhi();
    let fireStart = '寅';
    if (['巳', '酉', '丑'].includes(branch)) fireStart = '卯';
    if (['亥', '卯', '未'].includes(branch)) fireStart = '酉';
    addStar(ZHI[(ZHI.indexOf(fireStart) + hIdx) % 12], '火星', 'text-red-400', 'minor');
    addStar(ZHI[(ZHI.indexOf('戌') + hIdx) % 12], '鈴星', 'text-red-400', 'minor');

    // --- 7. 新增時辰星曜與神煞 ---
    // 天姚 (月系)
    addStar(ZHI[(1 + (lMonth - 1)) % 12], '天姚', 'text-pink-400', 'minor');
    
    // 解神 (月系)
    const jieShenMap = ['申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子', '子', '丑', '丑'];
    addStar(jieShenMap[lMonth - 1], '解神', 'text-blue-300', 'minor');
    
    // 陰煞 (月系)
    const yinShaMap = ['寅', '子', '戌', '申', '午', '辰', '寅', '子', '戌', '申', '午', '辰'];
    addStar(yinShaMap[lMonth - 1], '陰煞', 'text-slate-500', 'minor');
    
    // 天巫 (月系)
    const tianWuMap = ['巳', '申', '亥', '寅', '巳', '申', '亥', '寅', '巳', '申', '亥', '寅'];
    addStar(tianWuMap[lMonth - 1], '天巫', 'text-indigo-400', 'minor');

    // 孤辰、寡宿 (年系)
    if (['寅', '卯', '辰'].includes(yearZhi)) { addStar('巳', '孤辰', 'text-slate-400', 'minor'); addStar('丑', '寡宿', 'text-slate-400', 'minor'); }
    else if (['巳', '午', '未'].includes(yearZhi)) { addStar('申', '孤辰', 'text-slate-400', 'minor'); addStar('辰', '寡宿', 'text-slate-400', 'minor'); }
    else if (['申', '酉', '戌'].includes(yearZhi)) { addStar('亥', '孤辰', 'text-slate-400', 'minor'); addStar('未', '寡宿', 'text-slate-400', 'minor'); }
    else { addStar('寅', '孤辰', 'text-slate-400', 'minor'); addStar('戌', '寡宿', 'text-slate-400', 'minor'); }

    // 台輔、封誥 (時系)
    addStar(ZHI[(6 + hIdx) % 12], '台輔', 'text-cyan-400', 'minor');
    addStar(ZHI[(2 + hIdx) % 12], '封誥', 'text-cyan-400', 'minor');
    
    // 恩光、天貴 (昌曲系)
    addStar(ZHI[(ZHI.indexOf(changZhi) + lDay - 2 + 12) % 12], '恩光', 'text-yellow-300', 'minor');
    addStar(ZHI[(ZHI.indexOf(quZhi) + lDay - 2 + 12) % 12], '天貴', 'text-yellow-300', 'minor');

    // 博士十二神
    const boshiNames = ['博士', '力士', '青龍', '小耗', '將軍', '奏書', '飛廉', '喜神', '病符', '大耗', '伏兵', '官府'];
    const isClockwise = (gender === 'male' && yearGanIdx % 2 === 0) || (gender === 'female' && yearGanIdx % 2 !== 0);
    boshiNames.forEach((name, i) => {
        const offset = isClockwise ? i : (12 - i) % 12;
        addStar(ZHI[(lcIdx + offset) % 12], name, 'text-slate-400', 'minor');
    });

    const siHuaMap: Record<string, [string, string, string, string]> = {
        '甲': ['廉貞','破軍','武曲','太陽'], '乙': ['天機','天梁','紫微','太陰'], '丙': ['天同','天機','文昌','廉貞'],
        '丁': ['太陰','天同','天機','巨門'], '戊': ['貪狼','太陰','右弼','天機'], '己': ['武曲','貪狼','天梁','文曲'],
        '庚': ['太陽','武曲','天府','天同'], '辛': ['巨門','太陽','文曲','文昌'], '壬': ['天梁','紫微','左輔','武曲'],
        '癸': ['破軍','巨門','太陰','貪狼']
    };
    const siHuaNames = siHuaMap[yearGan];
    const siHuaTypes: Array<'祿' | '權' | '科' | '忌'> = ['祿', '權', '科', '忌'];

    const starNames = ['天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
    const starPosMap = MAJOR_STARS_TABLE[zwZhi];
    
    const grid: PalaceData[] = [];
    for (let i = 0; i < 12; i++) {
        const pZhi = ZHI[i];
        const stars: Star[] = [];
        if (pZhi === zwZhi) stars.push({ name: '紫微', type: 'major', color: 'text-purple-500' });
        starPosMap.forEach((pos, idx) => {
            if (pos === pZhi) stars.push({ name: starNames[idx], type: 'major', color: idx < 5 ? 'text-rose-500' : 'text-amber-500' });
        });
        if (auxStars[pZhi]) stars.push(...auxStars[pZhi]);
        stars.forEach(s => {
            const shIdx = siHuaNames.indexOf(s.name);
            if (shIdx !== -1) s.transformation = siHuaTypes[shIdx];
        });

        grid.push({
            zhi: pZhi, zhiIdx: i, gan: getPalaceGan(i), name: PALACE_NAMES[(i - lifeIdx + 12) % 12],
            stars, isLifePalace: i === lifeIdx, isBodyPalace: i === bodyIdx, gridArea: ZHI_GRID_AREA[pZhi],
            decades: `${bureau.val + i * 10}-${bureau.val + i * 10 + 9}`, ages: [1, 13, 25, 37, 49, 61, 73]
        });
    }

    // 確保生肖輸出為繁體中文
    const rawAnimal = baseLunar.getYearShengXiao();
    const animalTraditional = ZODIAC_TRADITIONAL[rawAnimal] || rawAnimal;

    return {
        profile: { name, gender, isYang: yearGanIdx % 2 === 0 },
        bazi: { 
            year: baseLunar.getYearInGanZhi(), 
            month: baseLunar.getMonthInGanZhi(), 
            day: baseLunar.getDayInGanZhi(), 
            hour: baseLunar.getTimeInGanZhi() 
        },
        ziwei: {
            lifePalaceZhi: ZHI[lifeIdx], bodyPalaceZhi: ZHI[bodyIdx], bureau: bureau.name, mingZhu: '未知', shenZhu: '未知',
            animal: animalTraditional, fiveElements: bureau.name.substring(0, 1), 
            siHua: siHuaNames.map((n, idx) => `${n}化${siHuaTypes[idx]}`), grid
        },
        western: {
            zodiac: westernZodiac.name,
            element: westernZodiac.element
        },
        display: { 
            date: birthDate, 
            time: birthTime, 
            lunarDetail: `${baseLunar.getYear()}年 ${baseLunar.getMonth()}月 ${baseLunar.getDay()}日` 
        }
    };
};
