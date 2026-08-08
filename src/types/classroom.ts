export interface StudentProfile {
  id: string;
  name: string;
  className: string; // e.g. "6ème A", "5ème B", etc.
  avatar: string;
  joinedAt: string;
  totalChallenges: number;
  bestWpm: number;
  averageAccuracy: number;
  averageGrade: number; // out of 20
  badges: string[];
}

export interface ClassroomExercise {
  id: string;
  title: string;
  language: 'FR' | 'EN';
  text: string;
  durationSeconds: number; // 30, 60, 120, 180
  category: '6ème' | '5ème' | '4ème' | '3ème' | 'Général';
  createdAt: string;
}

export interface StudentLiveState {
  studentId: string;
  studentName: string;
  className: string;
  avatar: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  progress: number; // 0 to 100
  typedTextSnippet: string;
  errors: number;
  rank: number;
  previousRank: number;
  finished: boolean;
  gradeNote: number; // /20
  badgesEarned: string[];
}

export interface ClassroomSession {
  id: string;
  title: string;
  exerciseId: string;
  text: string;
  language: 'FR' | 'EN';
  durationSeconds: number;
  timeRemaining: number;
  status: 'setup' | 'waiting' | 'countdown' | 'active' | 'finished';
  startTime?: number;
  hostTeacherName: string;
  students: Record<string, StudentLiveState>;
  createdDate: string;
}

export interface ChallengeHistoryRecord {
  id: string;
  date: string;
  exerciseTitle: string;
  language: 'FR' | 'EN';
  durationSeconds: number;
  totalParticipants: number;
  topWinner: {
    studentName: string;
    wpm: number;
    gradeNote: number;
  };
  results: {
    studentId: string;
    studentName: string;
    className: string;
    rank: number;
    wpm: number;
    accuracy: number;
    progress: number;
    gradeNote: number;
    badges: string[];
  }[];
}

export interface GamingHighScore {
  id: string;
  studentName: string;
  className: string;
  gameId: 'asteroids' | 'runner' | 'ninja';
  score: number;
  level: number;
  date: string;
}
