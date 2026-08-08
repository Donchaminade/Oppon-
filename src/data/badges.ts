import { UserStats } from '../types';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'volume' | 'courses' | 'multiplayer';
  targetValue: number;
  unit: string;
  evaluate: (stats: UserStats) => { current: number; max: number; isUnlocked: boolean };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge_first_step',
    title: 'Premier Pas',
    description: 'Complétez votre tout premier exercice de dactylographie.',
    icon: '🐣',
    category: 'volume',
    targetValue: 1,
    unit: 'test',
    evaluate: (stats) => {
      const current = Math.min(stats.totalTests, 1);
      return { current, max: 1, isUnlocked: current >= 1 };
    }
  },
  {
    id: 'badge_speed_30',
    title: 'Sprinter 30 WPM',
    description: 'Atteignez une vitesse de 30 mots par minute dans un exercice.',
    icon: '🏃',
    category: 'speed',
    targetValue: 30,
    unit: 'WPM',
    evaluate: (stats) => {
      const current = Math.min(stats.bestWpm, 30);
      return { current, max: 30, isUnlocked: stats.bestWpm >= 30 };
    }
  },
  {
    id: 'badge_speed_50',
    title: 'Pilote 50 WPM',
    description: 'Atteignez une vitesse de 50 mots par minute.',
    icon: '🏎️',
    category: 'speed',
    targetValue: 50,
    unit: 'WPM',
    evaluate: (stats) => {
      const current = Math.min(stats.bestWpm, 50);
      return { current, max: 50, isUnlocked: stats.bestWpm >= 50 };
    }
  },
  {
    id: 'badge_speed_60',
    title: 'Dactylo Pro',
    description: 'Atteignez une vitesse de 60 mots par minute.',
    icon: '🚀',
    category: 'speed',
    targetValue: 60,
    unit: 'WPM',
    evaluate: (stats) => {
      const current = Math.min(stats.bestWpm, 60);
      return { current, max: 60, isUnlocked: stats.bestWpm >= 60 };
    }
  },
  {
    id: 'badge_fast_80',
    title: 'Dactylo Rapide',
    description: 'Atteignez une vitesse exceptionnelle de 80 mots par minute !',
    icon: '⚡',
    category: 'speed',
    targetValue: 80,
    unit: 'WPM',
    evaluate: (stats) => {
      const current = Math.min(stats.bestWpm, 80);
      return { current, max: 80, isUnlocked: stats.bestWpm >= 80 };
    }
  },
  {
    id: 'badge_speed_100',
    title: 'Légende 100 WPM',
    description: 'Franchissez la barre mythique des 100 mots par minute !',
    icon: '👑',
    category: 'speed',
    targetValue: 100,
    unit: 'WPM',
    evaluate: (stats) => {
      const current = Math.min(stats.bestWpm, 100);
      return { current, max: 100, isUnlocked: stats.bestWpm >= 100 };
    }
  },
  {
    id: 'badge_accuracy_100',
    title: 'Chirurgien du Clavier',
    description: 'Obtenez 100% de précision sur un exercice sans la moindre faute.',
    icon: '🩺',
    category: 'accuracy',
    targetValue: 1,
    unit: 'test à 100%',
    evaluate: (stats) => {
      const perfects = stats.sessionHistory.filter((s) => s.accuracy === 100).length;
      const current = Math.min(perfects, 1);
      return { current, max: 1, isUnlocked: current >= 1 };
    }
  },
  {
    id: 'badge_precision_10_tests',
    title: 'Précision Ultime',
    description: 'Obtenez 100% de précision sur 10 tests de dactylographie.',
    icon: '🎯',
    category: 'accuracy',
    targetValue: 10,
    unit: 'tests à 100%',
    evaluate: (stats) => {
      const perfects = stats.sessionHistory.filter((s) => s.accuracy === 100).length;
      const current = Math.min(perfects, 10);
      return { current, max: 10, isUnlocked: current >= 10 };
    }
  },
  {
    id: 'badge_streak_98',
    title: 'Constance Chirurgicale',
    description: 'Réalisez 5 exercices consécutifs avec au moins 98% de précision.',
    icon: '✨',
    category: 'accuracy',
    targetValue: 5,
    unit: 'tests de suite',
    evaluate: (stats) => {
      let maxStreak = 0;
      let currentStreak = 0;
      for (const session of stats.sessionHistory) {
        if (session.accuracy >= 98) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }
      const current = Math.min(maxStreak, 5);
      return { current, max: 5, isUnlocked: current >= 5 };
    }
  },
  {
    id: 'badge_10_tests',
    title: 'Dactylo Assidu',
    description: 'Complétez au moins 10 exercices de dactylographie.',
    icon: '⌨️',
    category: 'volume',
    targetValue: 10,
    unit: 'tests',
    evaluate: (stats) => {
      const current = Math.min(stats.totalTests, 10);
      return { current, max: 10, isUnlocked: stats.totalTests >= 10 };
    }
  },
  {
    id: 'badge_50_tests',
    title: 'Marathonnien de la Frappe',
    description: 'Complétez un total de 50 exercices de dactylographie.',
    icon: '🏅',
    category: 'volume',
    targetValue: 50,
    unit: 'tests',
    evaluate: (stats) => {
      const current = Math.min(stats.totalTests, 50);
      return { current, max: 50, isUnlocked: stats.totalTests >= 50 };
    }
  },
  {
    id: 'badge_course_beginner',
    title: 'Diplômé Débutant',
    description: 'Terminez toutes les 5 leçons du cours Niveau Débutant.',
    icon: '🎓',
    category: 'courses',
    targetValue: 5,
    unit: 'leçons',
    evaluate: (stats) => {
      const beginnerIds = ['beg_1', 'beg_2', 'beg_3', 'beg_4', 'beg_5'];
      const completed = beginnerIds.filter((id) => stats.completedLessons.includes(id)).length;
      return { current: completed, max: 5, isUnlocked: completed >= 5 };
    }
  },
  {
    id: 'badge_all_courses',
    title: 'Maître des Leçons',
    description: 'Complétez au moins 10 leçons parmi l\'ensemble des cours.',
    icon: '📚',
    category: 'courses',
    targetValue: 10,
    unit: 'leçons',
    evaluate: (stats) => {
      const completed = Math.min(stats.completedLessons.length, 10);
      return { current: completed, max: 10, isUnlocked: completed >= 10 };
    }
  },
  {
    id: 'badge_multiplayer_win',
    title: 'Champion du Multijoueur',
    description: 'Remportez votre première victoire dans une course multijoueur.',
    icon: '🏆',
    category: 'multiplayer',
    targetValue: 1,
    unit: 'victoire',
    evaluate: (stats) => {
      const hasWin =
        stats.badges?.includes('badge_multiplayer_win') ||
        stats.sessionHistory.some((s) => s.mode === 'multiplayer' && s.title.toLowerCase().includes('victoire'));
      const current = hasWin ? 1 : 0;
      return { current, max: 1, isUnlocked: hasWin };
    }
  }
];

export interface EvaluatedBadge {
  badge: BadgeDefinition;
  current: number;
  max: number;
  percent: number;
  isUnlocked: boolean;
}

export function evaluateAllBadges(stats: UserStats): EvaluatedBadge[] {
  return BADGE_DEFINITIONS.map((badge) => {
    const { current, max, isUnlocked } = badge.evaluate(stats);
    // Force unlocked if listed in stats.badges explicitly
    const forceUnlocked = stats.badges?.includes(badge.id) || isUnlocked;
    const effectiveCurrent = forceUnlocked ? max : current;
    const percent = Math.min(100, Math.round((effectiveCurrent / max) * 100));

    return {
      badge,
      current: effectiveCurrent,
      max,
      percent,
      isUnlocked: forceUnlocked
    };
  });
}

export function checkNewUnlockedBadges(prevStats: UserStats, newStats: UserStats): BadgeDefinition[] {
  const prevEvaluated = evaluateAllBadges(prevStats);
  const newEvaluated = evaluateAllBadges(newStats);

  const newlyUnlocked: BadgeDefinition[] = [];

  for (const item of newEvaluated) {
    if (item.isUnlocked) {
      const prev = prevEvaluated.find((p) => p.badge.id === item.badge.id);
      if (!prev || !prev.isUnlocked) {
        newlyUnlocked.push(item.badge);
      }
    }
  }

  return newlyUnlocked;
}
