export interface LogEntry {
  sub: string;   // Subject
  teach: string; // Teacher
  k: string;     // Key (Action name)
  c: number;     // Count
  s: number;     // Score
}

export interface Student {
  name: string;
  total: number;
  logs: LogEntry[];
}

export interface Database {
  [key: string]: Student;
}

export interface AppConfig {
  pass: string;
  slogan: string;
  logo: string;
  classImg: string;
  isAuth: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  pass: "1234",
  slogan: "יישר כוח!",
  logo: "",
  classImg: "",
  isAuth: false
};

export const PRICING: Record<string, number> = {
  "מילה  טובה": 5,
  "מילה טובה": 5,
  "הצטיינות": 10,
  "שותף": 5,
  "הגעה בזמן": 5,
  "הבאת ציוד": 5,
  "חיסור": -10,
  "איחור": -5,
  "הפרעה": -15,
  "חוצפה": -20,
  "פטפוט": -5,
  "שוטטות": -10
};
