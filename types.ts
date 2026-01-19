
export interface Star {
    name: string;
    type: 'major' | 'minor' | 'aux';
    color: string;
    transformation?: '祿' | '權' | '科' | '忌';
    status?: string; // 旺、廟、平、陷
}

export interface PalaceData {
    zhi: string;
    zhiIdx: number;
    gan: string;
    name: string;
    stars: Star[];
    isLifePalace: boolean;
    isBodyPalace: boolean;
    gridArea: string;
    decades: string; // 大限，如 2-11
    ages: number[]; // 小限歲數
}

export interface ChartData {
    profile: {
        name: string;
        gender: string;
        isYang: boolean; // 陽男/陰女 影響大限順逆
    };
    bazi: {
        year: string;
        month: string;
        day: string;
        hour: string;
    };
    ziwei: {
        lifePalaceZhi: string;
        bodyPalaceZhi: string;
        bureau: string;
        mingZhu: string;
        shenZhu: string;
        animal: string;
        fiveElements: string;
        siHua: string[];
        grid: PalaceData[];
    };
    display: {
        date: string;
        time: string;
        lunarDetail: string;
    };
}

export interface AIResponse {
    executive_summary: {
        title: string;
        direction: string;
        description: string;
    };
    metaphysical_perspective: {
        title: string;
        content: string;
    };
    scientific_decoding: {
        title: string;
        psychology: string;
        physics: string;
    };
    actionable_advice: Array<{
        type: string;
        content: string;
    }>;
    model_used?: string;
}

export interface Message {
    type: 'user' | 'ai' | 'error';
    content?: string;
    data?: AIResponse;
    isGreeting?: boolean;
    question?: string;
}

export interface FormData {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    inputType: 'solar' | 'lunar';
    lunarYear: string;
    lunarMonth: string;
    lunarDay: string;
}
