
export interface Star {
    name: string;
    type: 'major' | 'minor' | 'aux';
    color: string;
    transformation?: '祿' | '權' | '科' | '忌';
    status?: string; 
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
    decades: string; 
    ages: number[]; 
}

export interface ChartData {
    profile: {
        name: string;
        gender: string;
        isYang: boolean; 
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
    western: {
        zodiac: string;
        element: string;
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
    zodiac_fortune: {
        animal: string;
        western_zodiac: string;
        summary: string;
        warning: string;
        zodiac_annual_fortune: string;
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
    groundingSources?: Array<{
        title: string;
        uri: string;
    }>;
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
