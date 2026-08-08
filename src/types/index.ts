export type Finger =
  | 'L_PINKY'
  | 'L_RING'
  | 'L_MIDDLE'
  | 'L_INDEX'
  | 'THUMB'
  | 'R_INDEX'
  | 'R_MIDDLE'
  | 'R_RING'
  | 'R_PINKY';

export interface FingerInfo {
  id: Finger;
  name: string;
  hand: 'left' | 'right';
  color: string;
  highlightClass: string;
  bgLight: string;
}

export type KeyboardLayout = 'AZERTY' | 'QWERTY' | 'BEPO' | 'DVORAK';

export type DifficultyLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

export type LessonCategory =
  | 'home_row'
  | 'top_row'
  | 'bottom_row'
  | 'capitals'
  | 'numbers'
  | 'symbols'
  | 'texts';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: DifficultyLevel;
  category: LessonCategory;
  text: string;
  targetWpm: number;
  minAccuracy: number;
  keysTaught?: string[];
}

export interface Course {
  id: string;
  title: string;
  level: DifficultyLevel;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface KeyHeatmapData {
  total: number;
  errors: number;
}

export interface TypingSessionResult {
  id: string;
  date: string;
  title: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakes: number;
  timeSeconds: number;
  mode: 'lesson' | 'custom' | 'multiplayer';
  keyErrors: Record<string, number>;
  wpmOverTime: { time: number; wpm: number; errors: number }[];
}

export interface UserStats {
  totalTests: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  totalTimeSeconds: number;
  completedLessons: string[];
  starsMap: Record<string, number>; // lessonId -> 1-3 stars
  keyErrors: Record<string, { total: number; errors: number }>;
  sessionHistory: TypingSessionResult[];
  badges: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wpm' | 'lessons' | 'accuracy' | 'multiplayer';
}

export interface AppSettings {
  layout: KeyboardLayout;
  soundEnabled: boolean;
  mechanicalSoundEnabled?: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  showKeyboard: boolean;
  showHands: boolean;
  caretStyle: 'line' | 'block' | 'underline';
  theme: 'slate' | 'typemaster' | 'emerald' | 'amber';
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  finished: boolean;
  finishTime?: number;
  placement?: number;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  code?: string;
  text: string;
  textTitle: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  players: Record<string, Player>;
  maxPlayers: number;
  createdAt: number;
  startTime?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
