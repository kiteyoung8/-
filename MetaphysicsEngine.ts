
import { PalaceData, ChartData, Star } from './types';
import { Lunar, Solar } from 'lunar-javascript';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_NAMES = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '官祿', '田宅', '福德', '父母'];

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
    const { name, gender, inputType, birthDate, birthTime, lunarYear, lunarMonth, lunarDay } = formData;
    let baseLunar: Lunar;
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    if (inputType === 'solar') {
        const [y, m, d] = birthDate.split('-').map(Number);
        baseLunar = Solar.fromYmdHms(y, m, d, hours, minutes, 0).getLunar();
    } else {
        baseLunar = Lunar.fromYmdHms(parseInt(lunarYear), parseInt(lunarMonth), parseInt(lunarDay), hours, minutes, 0);
    }

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

    const auxStars: Record<string, Star[]> = {};
    const addAux = (palaceZhi: string, starName: string, color: string, type: 'minor' | 'aux' = 'minor') => {
        if (!auxStars[palaceZhi]) auxStars[palaceZhi] = [];
        auxStars[palaceZhi].push({ name: starName, type, color });
    };

    // 1. 祿存、羊、陀 (年干)
    const luCunMap: Record<string, string> = { '甲':'寅', '乙':'卯', '丙':'巳', '丁':'午', '戊':'巳', '己':'午', '庚':'申', '辛':'酉', '壬':'亥', '癸':'子' };
    const lcZhi = luCunMap[yearGan];
    const lcIdx = ZHI.indexOf(lcZhi);
    addAux(lcZhi, '祿存', 'text-amber-300', 'aux');
    addAux(ZHI[(lcIdx + 1) % 12], '擎羊', 'text-red-400', 'minor');
    addAux(ZHI[(lcIdx - 1 + 12) % 12], '陀羅', 'text-red-400', 'minor');

    // 2. 左輔、右弼 (月)
    addAux(ZHI[(4 + (lMonth - 1)) % 12], '左輔', 'text-emerald-400', 'aux');
    addAux(ZHI[(10 - (lMonth - 1) + 12) % 12], '右弼', 'text-emerald-400', 'aux');

    // 3. 文昌、文曲 (時)
    addAux(ZHI[(10 - hIdx + 12) % 12], '文昌', 'text-cyan-400', 'aux');
    addAux(ZHI[(4 + hIdx) % 12], '文曲', 'text-cyan-400', 'aux');

    // 4. 天魁、天鉞 (年干)
    const kuiYueMap: Record<string, [string, string]> = { 
        '甲':['未','丑'], '乙':['申','子'], '丙':['亥','酉'], '丁':['亥','酉'], '戊':['未','丑'], 
        '己':['未','丑'], '庚':['丑','未'], '辛':['午','寅'], '壬':['卯','巳'], '癸':['卯','巳'] 
    };
    addAux(kuiYueMap[yearGan][0], '天魁', 'text-orange-400', 'aux');
    addAux(kuiYueMap[yearGan][1], '天鉞', 'text-orange-400', 'aux');

    // 5. 地空、地劫 (時)
    addAux(ZHI[(11 - hIdx + 12) % 12], '地空', 'text-slate-400', 'minor');
    addAux(ZHI[(11 + hIdx) % 12], '地劫', 'text-slate-400', 'minor');

    // 6. 火星、鈴星 (年支 + 時)
    let huoStart = '', lingStart = '';
    if (['寅','午','戌'].includes(yearZhi)) { huoStart = '丑'; lingStart = '卯'; }
    else if (['申','子','辰'].includes(yearZhi)) { huoStart = '寅'; lingStart = '戌'; }
    else if (['巳','酉','丑'].includes(yearZhi)) { huoStart = '卯'; lingStart = '戌'; }
    else if (['亥','卯','未'].includes(yearZhi)) { huoStart = '酉'; lingStart = '戌'; }
    
    addAux(ZHI[(ZHI.indexOf(huoStart) + hIdx) % 12], '火星', 'text-red-500', 'minor');
    addAux(ZHI[(ZHI.indexOf(lingStart) + hIdx) % 12], '鈴星', 'text-red-500', 'minor');

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
            animal: baseLunar.getYearShengXiao(), fiveElements: bureau.name.substring(0, 1), 
            siHua: siHuaNames.map((n, idx) => `${n}化${siHuaTypes[idx]}`), grid
        },
        display: { 
            date: birthDate, 
            time: birthTime, 
            lunarDetail: `${baseLunar.getYear()}年 ${baseLunar.getMonth()}月 ${baseLunar.getDay()}日` 
        }
    };
};
