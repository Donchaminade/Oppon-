import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserStats, AppSettings, TypingSessionResult } from './types';
import { Navbar, TabType } from './components/Navbar';
import { CourseSelector } from './components/CourseSelector';
import { CustomExerciseBuilder } from './components/CustomExerciseBuilder';
import { MultiplayerRace } from './components/MultiplayerRace';
import { StatsDashboard } from './components/StatsDashboard';
import { ClassroomDashboard } from './components/ClassroomDashboard';
import { StudentClassroomArena } from './components/StudentClassroomArena';
import { EspaceGaming } from './components/EspaceGaming';
import { SettingsModal } from './components/SettingsModal';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { checkNewUnlockedBadges, BadgeDefinition } from './data/badges';

const DEFAULT_SETTINGS: AppSettings = {
  layout: 'AZERTY',
  soundEnabled: true,
  mechanicalSoundEnabled: true,
  fontSize: 'large',
  showKeyboard: true,
  showHands: true,
  caretStyle: 'line',
  theme: 'slate'
};

const DEFAULT_STATS: UserStats = {
  totalTests: 0,
  bestWpm: 0,
  averageWpm: 0,
  averageAccuracy: 100,
  totalTimeSeconds: 0,
  completedLessons: [],
  starsMap: {},
  keyErrors: {},
  sessionHistory: [],
  badges: ['badge_first_step']
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [showSettings, setShowSettings] = useState(false);
  const [unlockedBadgesModal, setUnlockedBadgesModal] = useState<BadgeDefinition[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('typemaster_onboarding_completed') !== 'true';
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  // Admin / Teacher Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('typemaster_admin_auth') === 'true';
  });

  // Set document title explicitly
  useEffect(() => {
    document.title = 'Opponè - Dactylographie & Clavier Collège';
  }, []);

  // Listen for /admin URL route or hash
  useEffect(() => {
    const handleUrlCheck = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (pathname === '/admin' || hash === '#admin') {
        setActiveTab('admin_dashboard');
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'admin_dashboard') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState({}, '', '/');
      }
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      reconnectionAttempts: 5,
      timeout: 10000
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // PWA Install Prompt
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('typemaster_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // User Statistics
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('typemaster_stats');
    if (saved) {
      try {
        return { ...DEFAULT_STATS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_STATS;
      }
    }
    return DEFAULT_STATS;
  });

  // Save Settings
  useEffect(() => {
    localStorage.setItem('typemaster_settings', JSON.stringify(settings));
  }, [settings]);

  // Save Stats
  useEffect(() => {
    localStorage.setItem('typemaster_stats', JSON.stringify(stats));
  }, [stats]);

  // Register PWA Service Worker & listen to install prompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('PWA Service Worker registered.'))
        .catch((err) => console.log('SW Registration failed:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then(() => {
        setPwaPrompt(null);
      });
    }
  };

  // Update Settings
  const handleUpdateSettings = (newSet: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSet }));
  };

  // Record completed session result
  const handleCompleteSession = (result: TypingSessionResult, lessonId?: string) => {
    setStats((prev) => {
      const newHistory = [...prev.sessionHistory, result];
      const newTotal = prev.totalTests + 1;
      const newBestWpm = Math.max(prev.bestWpm, result.wpm);
      const sumWpm = newHistory.reduce((acc, curr) => acc + curr.wpm, 0);
      const sumAcc = newHistory.reduce((acc, curr) => acc + curr.accuracy, 0);

      const avgWpm = Math.round(sumWpm / newHistory.length);
      const avgAcc = Math.round(sumAcc / newHistory.length);

      const newCompleted = [...prev.completedLessons];
      if (lessonId && !newCompleted.includes(lessonId)) {
        newCompleted.push(lessonId);
      }

      const newStarsMap = { ...prev.starsMap };
      if (lessonId) {
        const starRating = result.accuracy >= 98 && result.wpm >= 40 ? 3 : result.accuracy >= 95 ? 2 : 1;
        newStarsMap[lessonId] = Math.max(newStarsMap[lessonId] || 0, starRating);
      }

      // Merge key errors
      const newKeyErrors = { ...prev.keyErrors };
      Object.entries(result.keyErrors).forEach(([k, count]) => {
        if (!newKeyErrors[k]) newKeyErrors[k] = { total: 0, errors: 0 };
        newKeyErrors[k].errors += count;
      });

      const updatedStatsCandidate: UserStats = {
        ...prev,
        totalTests: newTotal,
        bestWpm: newBestWpm,
        averageWpm: avgWpm,
        averageAccuracy: avgAcc,
        completedLessons: newCompleted,
        starsMap: newStarsMap,
        keyErrors: newKeyErrors,
        sessionHistory: newHistory
      };

      // Check for newly unlocked badges
      const newlyUnlocked = checkNewUnlockedBadges(prev, updatedStatsCandidate);
      if (newlyUnlocked.length > 0) {
        setUnlockedBadgesModal(newlyUnlocked);
        const unlockedIds = newlyUnlocked.map((b) => b.id);
        const mergedBadges = Array.from(new Set([...(prev.badges || []), ...unlockedIds]));
        updatedStatsCandidate.badges = mergedBadges;
      }

      return updatedStatsCandidate;
    });
  };

  const handleClearStats = () => {
    if (confirm('Voulez-vous vraiment effacer tout votre historique de statistiques ?')) {
      setStats(DEFAULT_STATS);
      localStorage.removeItem('typemaster_stats');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSettings={() => setShowSettings(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        canInstallPwa={!!pwaPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'courses' && (
          <CourseSelector
            stats={stats}
            settings={settings}
            onCompleteLesson={(res, id) => handleCompleteSession(res, id)}
          />
        )}

        {activeTab === 'custom' && (
          <CustomExerciseBuilder
            settings={settings}
            onComplete={(res) => handleCompleteSession(res)}
          />
        )}

        {activeTab === 'student_arena' && (
          <StudentClassroomArena
            settings={settings}
            socket={socket}
          />
        )}

        {activeTab === 'admin_dashboard' && (
          !isAdminAuthenticated ? (
            <AdminLoginModal
              onLoginSuccess={() => setIsAdminAuthenticated(true)}
              onCancel={() => handleSelectTab('courses')}
            />
          ) : (
            <ClassroomDashboard
              settings={settings}
              socket={socket}
              onLogoutAdmin={() => {
                sessionStorage.removeItem('typemaster_admin_auth');
                setIsAdminAuthenticated(false);
              }}
            />
          )
        )}

        {activeTab === 'gaming' && (
          <EspaceGaming
            settings={settings}
            onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerRace settings={settings} />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            stats={stats}
            onClearStats={handleClearStats}
          />
        )}

        {activeTab === 'global_ranking' && (
          <GlobalLeaderboard />
        )}
      </main>

      {/* Student Onboarding Guide Modal */}
      {showOnboarding && (
        <StudentOnboardingModal
          onClose={() => setShowOnboarding(false)}
          onNavigateToTab={(tab) => handleSelectTab(tab)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Badge Celebration Modal */}
      {unlockedBadgesModal.length > 0 && (
        <BadgeUnlockModal
          unlockedBadges={unlockedBadgesModal}
          onClose={() => setUnlockedBadgesModal([])}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ⚡ Opponè — Plateforme de Dactylographie Collège & Clavier Visuel
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('courses')} className="hover:text-slate-300">Cours</button>
            <button onClick={() => setActiveTab('custom')} className="hover:text-slate-300">Exercices</button>
            <button onClick={() => setActiveTab('multiplayer')} className="hover:text-slate-300">Multijoueur</button>
            <button onClick={() => setActiveTab('stats')} className="hover:text-slate-300">Statistiques</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

