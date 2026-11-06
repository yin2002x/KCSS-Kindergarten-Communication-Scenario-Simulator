export type PageType = 'login' | 'lobby' | 'chat' | 'result' | 'analysis';

export interface UserSession {
  studentId: string;
  name: string;
  school?: string;
  title?: string;
  loginTime: string;
  isGuest?: boolean;
}

export type ScenarioCategory =
  | '親師衝突處理（家長端）'
  | '幼兒情緒引導（幼兒端）'
  | '行政任務交辦（主管端）'
  | '協同教學歧見（同事端）';

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  description: string;
  characterName: string;
  characterRole: string;
  characterAvatar?: string;
  difficulty: '入門' | '進階' | '高難挑戰';
  tags: string[];
  firstMessage: string;
  systemPrompt: string;
  learningGoal: string;
  isGenerated?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

export interface ScoreBreakdown {
  tone: number;        // 語氣專業度 (0-100)
  empathy: number;     // 同理心接納 (0-100)
  clarity: number;     // 溝通清晰度 (0-100)
  childCentric?: number;
}

export interface EvaluationResult {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C';
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  risks: string[];
  actions: string[];
  example: string;
  summary: string;
}

export interface SimulationRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  createdAt: string;
  scenario: Scenario;
  messages: ChatMessage[];
  evaluation: EvaluationResult;
}

export interface AppSettings {
  customApiKey: string;
  soundEffects: boolean;
  autoScroll: boolean;
}
