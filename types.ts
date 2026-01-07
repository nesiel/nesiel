
export interface LogEntry {
  sub: string;
  teach: string;
  k: string;
  c: number;
  s: number;
  d?: string;
}

export interface GradeEntry {
  subject: string;
  score: string;
}

export interface Student {
  name: string;
  total: number;
  logs: LogEntry[];
  lastNachatDate?: string;
  
  // Contact Details
  studentCell?: string;
  homePhone?: string; // New field for Landline/Home phone
  
  nameMother?: string;
  phoneMother?: string;
  emailMother?: string;
  
  nameFather?: string;
  phoneFather?: string;
  emailFather?: string;
  
  isHiddenFromPodium?: boolean;
  
  // Certificate generation
  grades?: GradeEntry[];
  academicReinforcement?: string;
  certificateComment?: string;
  
  // Seating
  seatId?: string;
}

export interface Database {
  [key: string]: Student;
}

export interface AppConfig {
  slogan: string;
  logo: string;
  pastWinners: string[];
  actionScores: Record<string, number>;
  rules: string;
}

export const DEFAULT_SCORES: Record<string, number> = {
  // Positive
  'מילה טובה': 10,
  'הצטיינות': 15,
  'שיתוף פעולה': 12,
  'שותף במהלך השיעור': 12,
  'עזרה לחבר': 10,
  'יוזמה': 10,
  'הגעה בזמן': 5,
  'השתתפות': 5,
  'שיעורי בית': 5,
  
  // Negative
  'איחור': -5,
  'חיסור': -10,
  'אי הבאת ציוד': -5,
  'הפרעה': -10,
  'הפרעה במהלך שיעור': -10,
  'פטפוט': -5,
  'שוטטות': -10,
  'אי השתתפות': -5
};

export const DEFAULT_CONFIG: AppConfig = {
  slogan: "יישר כוח!",
  logo: "",
  pastWinners: [],
  actionScores: DEFAULT_SCORES,
  rules: `תקנון הכיתה:
1. יש להגיע בזמן לשיעורים.
2. יש להביא ציוד לימודי מלא.
3. מדברים בכבוד אחד לשני.
4. שומרים על רכוש בית הספר.
(ניתן לערוך טקסט זה במסך הניהול)`
};
