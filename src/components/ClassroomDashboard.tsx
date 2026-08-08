import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile, ClassroomExercise, ClassroomSession, StudentLiveState, ChallengeHistoryRecord } from '../types/classroom';
import { AppSettings } from '../types';
import { DEFAULT_CLASSROOM_EXERCISES, INITIAL_STUDENTS, INITIAL_CLASSROOM_HISTORY } from '../data/classroomExercises';
import { ConfettiParticleOverlay } from './ConfettiParticleOverlay';
import { Play, RotateCcw, Users, Plus, Trash2, Award, Sparkles, BookOpen, Clock, ShieldCheck, CheckCircle2, TrendingUp, AlertCircle, Volume2, Eye, Bell, Zap, Flame, Trophy, X, LogOut, Lock, Search, Medal, Crown, Download, ChevronDown, ChevronUp } from 'lucide-react';

export interface LiveAlertToast {
  id: string;
  type: 'milestone' | 'overtake' | 'finished';
  studentName: string;
  avatar: string;
  className: string;
  title: string;
  message: string;
  timestamp: string;
  badgeText?: string;
}

interface ClassroomDashboardProps {
  settings: AppSettings;
  socket: any;
  onLogoutAdmin?: () => void;
}

export const ClassroomDashboard: React.FC<ClassroomDashboardProps> = ({ settings, socket, onLogoutAdmin }) => {
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'students' | 'exercises' | 'history'>('live');

  // Students list state
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('typemaster_classroom_students');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_STUDENTS;
  });

  // Exercises list state
  const [exercises, setExercises] = useState<ClassroomExercise[]>(() => {
    const saved = localStorage.getItem('typemaster_classroom_exercises');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_CLASSROOM_EXERCISES;
  });

  // History state
  const [history, setHistory] = useState<ChallengeHistoryRecord[]>(() => {
    const saved = localStorage.getItem('typemaster_classroom_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_CLASSROOM_HISTORY;
  });

  // Selected exercise for launching session
  const [selectedExoId, setSelectedExoId] = useState<string>(exercises[0]?.id || '');

  // Live session state (synchronized over socket or local state)
  const [liveSession, setLiveSession] = useState<ClassroomSession | null>(null);
  const [countdownTick, setCountdownTick] = useState<number | null>(null);

  // History Filter and Expansion State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [expandedHistoryCard, setExpandedHistoryCard] = useState<string | null>(null);

  // Live Alerts & Notifications Toasts for Teacher Feed
  const [toastAlerts, setToastAlerts] = useState<LiveAlertToast[]>([]);
  const [alertHistoryLog, setAlertHistoryLog] = useState<LiveAlertToast[]>([]);
  const [studentNewRecords, setStudentNewRecords] = useState<{ [studentId: string]: { peakWpm: number; timestamp: number } }>({});
  const prevStudentsStateRef = useRef<{ [id: string]: { wpm: number; progress: number; rank: number } }>({});

  // Track WPM record bursts
  useEffect(() => {
    if (!liveSession || liveSession.status !== 'active') return;

    const currentStudents = Object.values(liveSession.students) as StudentLiveState[];
    currentStudents.forEach((std) => {
      const stdProfile = students.find((s) => s.id === std.studentId || s.name === std.studentName);
      const baseline = Math.max(stdProfile?.bestWpm || 0, studentNewRecords[std.studentId]?.peakWpm || 0);

      if (std.wpm > baseline && std.wpm >= 20) {
        setStudentNewRecords((prev) => ({
          ...prev,
          [std.studentId]: { peakWpm: std.wpm, timestamp: Date.now() }
        }));
      }
    });
  }, [liveSession, students]);

  // Detect speed milestones, leadership overtakes, and session completions
  useEffect(() => {
    if (!liveSession || liveSession.status !== 'active') {
      prevStudentsStateRef.current = {};
      return;
    }

    const sorted = (Object.values(liveSession.students) as StudentLiveState[]).sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });

    const speedMilestones = [30, 45, 60, 75, 90, 100];
    const createdAlerts: LiveAlertToast[] = [];

    sorted.forEach((std, currentRank) => {
      const prev = prevStudentsStateRef.current[std.studentId];

      if (prev) {
        // 1. Check speed milestone crossed
        speedMilestones.forEach((milestone) => {
          if (prev.wpm < milestone && std.wpm >= milestone) {
            createdAlerts.push({
              id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              type: 'milestone',
              studentName: std.studentName,
              avatar: std.avatar,
              className: std.className,
              title: `⚡ Palier de Vitesse Franchi !`,
              message: `${std.avatar} ${std.studentName} (${std.className}) vient de franchir la barre des ${milestone} WPM !`,
              badgeText: `🔥 ${milestone} WPM`,
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
          }
        });

        // 2. Check overtake for #1
        if (currentRank === 0 && prev.rank > 0 && sorted.length > 1) {
          createdAlerts.push({
            id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: 'overtake',
            studentName: std.studentName,
            avatar: std.avatar,
            className: std.className,
            title: `👑 Prise de Tête du Classement !`,
            message: `${std.avatar} ${std.studentName} prend la 1ère place du direct avec ${std.wpm} WPM !`,
            badgeText: `Leader #1`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
        }

        // 3. Check text completion
        if (prev.progress < 100 && std.progress >= 100) {
          createdAlerts.push({
            id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: 'finished',
            studentName: std.studentName,
            avatar: std.avatar,
            className: std.className,
            title: `🎉 Exercice Terminé !`,
            message: `${std.avatar} ${std.studentName} a bouclé le texte avec ${std.accuracy}% de précision !`,
            badgeText: `✅ Note : ${std.gradeNote}/20`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
        }
      }

      // Record state for next update comparison
      prevStudentsStateRef.current[std.studentId] = {
        wpm: std.wpm,
        progress: std.progress,
        rank: currentRank
      };
    });

    if (createdAlerts.length > 0) {
      setToastAlerts((prev) => [...createdAlerts, ...prev].slice(0, 4));
      setAlertHistoryLog((prev) => [...createdAlerts, ...prev].slice(0, 30));
    }
  }, [liveSession]);

  // Auto-dismiss oldest active toast after 6 seconds
  useEffect(() => {
    if (toastAlerts.length === 0) return;
    const timer = setTimeout(() => {
      setToastAlerts((prev) => prev.slice(0, prev.length - 1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastAlerts]);

  const removeToastAlert = (id: string) => {
    setToastAlerts((prev) => prev.filter((t) => t.id !== id));
  };

  // Forms
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('6ème A');
  const [newExoTitle, setNewExoTitle] = useState('');
  const [newExoCategory, setNewExoCategory] = useState<'6ème' | '5ème' | '4ème' | '3ème' | 'Général'>('6ème');
  const [newExoLang, setNewExoLang] = useState<'FR' | 'EN'>('FR');
  const [newExoDuration, setNewExoDuration] = useState<number>(60);
  const [newExoText, setNewExoText] = useState('');

  // Persist storage
  useEffect(() => {
    localStorage.setItem('typemaster_classroom_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('typemaster_classroom_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('typemaster_classroom_history', JSON.stringify(history));
  }, [history]);

  // Socket sync
  useEffect(() => {
    if (!socket) return;

    socket.emit("classroom_get_session");

    socket.on("classroom_session_state", (session: ClassroomSession | null) => {
      setLiveSession(session);
    });

    socket.on("classroom_countdown_tick", (cnt: number) => {
      setCountdownTick(cnt);
    });

    socket.on("classroom_timer_tick", (data: { timeRemaining: number }) => {
      setLiveSession((prev) => prev ? { ...prev, timeRemaining: data.timeRemaining } : null);
    });

    return () => {
      socket.off("classroom_session_state");
      socket.off("classroom_countdown_tick");
      socket.off("classroom_timer_tick");
    };
  }, [socket]);

  // Launch a new session
  const handleCreateAndPrepareSession = (exo: ClassroomExercise) => {
    const sessionData = {
      title: exo.title,
      text: exo.text,
      language: exo.language,
      durationSeconds: exo.durationSeconds,
      teacherName: 'M. Professeur d\'Informatique'
    };

    if (socket) {
      socket.emit("classroom_create_session", sessionData);
    } else {
      // Local fallback session
      const newSess: ClassroomSession = {
        id: 'cls_' + Date.now(),
        title: exo.title,
        exerciseId: exo.id,
        text: exo.text,
        language: exo.language,
        durationSeconds: exo.durationSeconds,
        timeRemaining: exo.durationSeconds,
        status: 'waiting',
        hostTeacherName: 'M. Professeur',
        students: {},
        createdDate: new Date().toLocaleDateString('fr-FR')
      };
      setLiveSession(newSess);
    }

    setActiveSubTab('live');
  };

  // Launch the countdown "Top !"
  const handleStartTop = () => {
    if (!liveSession) return;
    if (socket) {
      socket.emit("classroom_start_top", { sessionId: liveSession.id });
    } else {
      // Local simulated top countdown
      let count = 3;
      setCountdownTick(count);
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownTick(count);
        } else {
          clearInterval(timer);
          setCountdownTick(null);
          setLiveSession((prev) => prev ? { ...prev, status: 'active' } : null);
        }
      }, 1000);
    }
  };

  // Add new student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStd: StudentProfile = {
      id: 'std_' + Date.now(),
      name: newStudentName.trim(),
      className: newStudentClass,
      avatar: ['👨‍🎓', '👩‍🎓', '🚀', '⚡', '🌟', '🎯'][Math.floor(Math.random() * 6)],
      joinedAt: new Date().toLocaleDateString('fr-FR'),
      totalChallenges: 0,
      bestWpm: 0,
      averageAccuracy: 100,
      averageGrade: 0,
      badges: ['badge_first_step']
    };

    setStudents((prev) => [...prev, newStd]);
    setNewStudentName('');
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Create custom classroom exercise
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExoTitle.trim() || !newExoText.trim()) return;

    const newExo: ClassroomExercise = {
      id: 'exo_' + Date.now(),
      title: newExoTitle.trim(),
      category: newExoCategory,
      language: newExoLang,
      durationSeconds: newExoDuration,
      text: newExoText.trim(),
      createdAt: new Date().toLocaleDateString('fr-FR')
    };

    setExercises((prev) => [newExo, ...prev]);
    setNewExoTitle('');
    setNewExoText('');
  };

  // Save finished live challenge session into permanent history
  const handleSaveSessionResults = () => {
    if (!liveSession || liveSession.status !== 'finished') return;

    const sortedStudents = (Object.values(liveSession.students) as StudentLiveState[]).sort((a, b) => b.wpm - a.wpm);
    const winner = sortedStudents[0];

    const record: ChallengeHistoryRecord = {
      id: 'hist_' + Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      exerciseTitle: liveSession.title,
      language: liveSession.language,
      durationSeconds: liveSession.durationSeconds,
      totalParticipants: sortedStudents.length,
      topWinner: {
        studentName: winner ? winner.studentName : 'N/A',
        wpm: winner ? winner.wpm : 0,
        gradeNote: winner ? winner.gradeNote : 0
      },
      results: sortedStudents.map((s, idx) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        className: s.className,
        rank: idx + 1,
        wpm: s.wpm,
        accuracy: s.accuracy,
        progress: s.progress,
        gradeNote: s.gradeNote,
        badges: s.badgesEarned
      }))
    };

    setHistory((prev) => [record, ...prev]);
    alert('Les notes et résultats de cette session ont été enregistrés avec succès !');
  };

  // Live sorted students for feed with overtaking logic
  const liveStudentsList: StudentLiveState[] = liveSession
    ? (Object.values(liveSession.students) as StudentLiveState[]).sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={14} className="text-indigo-400" /> Dashboard Enseignant & Gestion de Classe
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Espace Enseignant — Contrôle des Défis en Direct
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Créez des exercices, enregistrez la liste de vos élèves (6ème, 5ème, etc.), déclenchez le <strong className="text-amber-400">Top Départ du chronomètre</strong> et visualisez la progression en direct avec l'effet de dépassement en temps réel.
          </p>
        </div>

        {/* Action Quick Launch */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveSubTab('live')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSubTab === 'live'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye size={16} /> Direct Live
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSubTab === 'students'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users size={16} /> Élèves ({students.length})
          </button>
          <button
            onClick={() => setActiveSubTab('exercises')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSubTab === 'exercises'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen size={16} /> Exercices ({exercises.length})
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock size={16} /> Historique ({history.length})
          </button>

          {onLogoutAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all flex items-center gap-2 shadow-sm"
              title="Verrouiller ou se déconnecter de l'Espace Prof"
            >
              <Lock size={15} /> Verrouiller
            </button>
          )}
        </div>
      </div>

      {/* 1. SUB-TAB: LIVE FEED & CONTROL ROOM */}
      {activeSubTab === 'live' && (
        <div className="space-y-6">
          {/* Controls Bar & Session Preparator */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> Préparation du Challenge de Classe
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedExoId}
                  onChange={(e) => setSelectedExoId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2.5 min-w-[260px] focus:outline-none focus:border-cyan-500"
                >
                  {exercises.map((exo) => (
                    <option key={exo.id} value={exo.id}>
                      [{exo.category}] [{exo.language}] {exo.title} ({exo.durationSeconds}s)
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const targetExo = exercises.find((e) => e.id === selectedExoId) || exercises[0];
                    if (targetExo) handleCreateAndPrepareSession(targetExo);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={16} /> Initialiser la Session pour la Classe
                </button>
              </div>
            </div>

            {/* Active Top Button */}
            {liveSession && (
              <div className="flex items-center gap-3 bg-slate-950 p-4 border border-slate-800 rounded-2xl shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Chronomètre Restant</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {liveSession.timeRemaining}s
                  </div>
                </div>

                {liveSession.status === 'waiting' && (
                  <button
                    onClick={handleStartTop}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 animate-pulse"
                  >
                    <Play size={18} /> Démarrer le Top !
                  </button>
                )}

                {liveSession.status === 'active' && (
                  <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    CHALLENGE EN COURS !
                  </div>
                )}

                {liveSession.status === 'finished' && (
                  <button
                    onClick={handleSaveSessionResults}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Award size={16} /> Enregistrer les Notes & Badges
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Countdown Overlay when Top is pressed */}
          {countdownTick !== null && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
              <div className="text-center space-y-4 animate-in zoom-in-50 duration-200">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Attention tous les élèves !</div>
                <div className="text-9xl font-black text-amber-400 font-mono animate-bounce">{countdownTick}</div>
                <div className="text-xl font-extrabold text-white">Préparez vos mains sur le clavier !</div>
              </div>
            </div>
          )}

          {/* Live Feed Display */}
          {liveSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Eye size={18} className="text-cyan-400" /> Suivi en Direct : {liveSession.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nombre d'élèves en ligne : <strong>{liveStudentsList.length}</strong> | Statut : <span className="uppercase text-cyan-300 font-bold">{liveSession.status}</span>
                  </p>
                </div>
              </div>

              {/* Dynamic Escalator / Overtaking Cards List */}
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {liveStudentsList.map((std, idx) => {
                    const isFirst = idx === 0;
                    const isSecond = idx === 1;
                    const isThird = idx === 2;

                    const recordInfo = studentNewRecords[std.studentId];
                    const hasActiveRecordParticle = recordInfo && (Date.now() - recordInfo.timestamp < 6000);

                    return (
                      <motion.div
                        key={std.studentId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          layout: { type: 'spring', stiffness: 300, damping: 28 },
                          opacity: { duration: 0.2 }
                        }}
                        className={`
                          p-4 rounded-2xl border transition-colors duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-visible shadow-lg
                          ${isFirst
                            ? 'bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/60 shadow-amber-500/10'
                            : isSecond
                            ? 'bg-slate-900/90 border-slate-700'
                            : isThird
                            ? 'bg-slate-900/80 border-slate-800'
                            : 'bg-slate-950/80 border-slate-800'}
                        `}
                      >
                        {/* Rank badge */}
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div
                            className={`
                              w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-md font-mono transition-transform duration-300
                              ${isFirst
                                ? 'bg-amber-400 text-slate-950 text-base scale-105'
                                : isSecond
                                ? 'bg-slate-300 text-slate-950'
                                : isThird
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-800 text-slate-400'}
                            `}
                          >
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="text-sm font-extrabold text-white flex items-center gap-2">
                              <span>{std.avatar}</span> {std.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{std.className}</div>
                          </div>
                        </div>

                        {/* Live Text Snippet being typed */}
                        <div className="flex-1 min-w-0 w-full bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 truncate">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Saisie actuelle :</span>
                          {std.typedTextSnippet ? (
                            <span className="text-emerald-300">{std.typedTextSnippet}</span>
                          ) : (
                            <span className="text-slate-600 italic">En attente de saisie...</span>
                          )}
                        </div>

                        {/* Live Stats: WPM, Accuracy, Note */}
                        <div className="flex items-center gap-4 shrink-0 font-mono">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Vitesse</div>
                            <div className="text-base font-black text-cyan-400">{std.wpm} WPM</div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Précision</div>
                            <div className="text-base font-black text-emerald-400">{std.accuracy}%</div>
                          </div>

                          {liveSession.status === 'finished' && (
                            <div className="text-right bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl">
                              <div className="text-[10px] text-amber-300 uppercase font-bold">Note Finale</div>
                              <div className="text-base font-black text-amber-400">{std.gradeNote} / 20</div>
                            </div>
                          )}
                        </div>

                        {/* Progress bar inside card with Confetti particle explosion */}
                        <div className="relative w-full md:w-36 h-3 bg-slate-950 rounded-full border border-slate-800 shrink-0">
                          {hasActiveRecordParticle && (
                            <ConfettiParticleOverlay wpm={std.wpm} studentName={std.studentName} />
                          )}
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isFirst ? 'bg-amber-400 shadow-sm shadow-amber-400/30' : 'bg-cyan-500 shadow-sm shadow-cyan-500/20'}`}
                            style={{ width: `${std.progress}%` }}
                          />
                        </div>

                        {/* Teacher Test Record Trigger */}
                        <button
                          onClick={() => {
                            setStudentNewRecords((prev) => ({
                              ...prev,
                              [std.studentId]: { peakWpm: (std.wpm || 35) + 5, timestamp: Date.now() }
                            }));
                          }}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all shrink-0 flex items-center gap-1"
                          title="Simuler une explosion de confettis record"
                        >
                          <Zap size={12} className="text-amber-400" />
                          <span>Confettis</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {liveStudentsList.length === 0 && (
                  <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 text-slate-400">
                    <Users size={32} className="mx-auto text-slate-600" />
                    <p className="text-xs font-bold">Aucun élève encore connecté au salon live.</p>
                    <p className="text-[11px] text-slate-500">
                      Demandez aux élèves d'ouvrir l'onglet <strong>"🏫 Classe & Challenge"</strong> et de sélectionner leur nom pour rejoindre !
                    </p>
                  </div>
                )}
              </div>

              {/* Notifications & Exploits en Direct History Feed */}
              {alertHistoryLog.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Bell size={16} className="text-amber-400" /> Journal des Paliers & Exploits en Direct ({alertHistoryLog.length})
                    </h4>
                    <button
                      onClick={() => setAlertHistoryLog([])}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Effacer le journal
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {alertHistoryLog.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{log.type === 'milestone' ? '⚡' : log.type === 'overtake' ? '👑' : '🎉'}</span>
                          <div>
                            <span className="font-extrabold text-white">{log.studentName}</span>
                            <span className="text-slate-400 text-[11px]"> ({log.className})</span>
                            <p className="text-slate-300 text-[11px] font-sans">{log.message}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-amber-300 font-bold text-[10px] rounded block mb-0.5">
                            {log.badgeText}
                          </span>
                          <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-slate-300">
              <BookOpen size={40} className="mx-auto text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Aucun Challenge de Classe Démarré</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Choisissez un exercice dans le menu ci-dessus puis cliquez sur <strong>"Initialiser la Session pour la Classe"</strong> pour lancer le suivi live.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. SUB-TAB: STUDENTS ROSTER MANAGEMENT */}
      {activeSubTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Student Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 h-fit">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus size={18} className="text-cyan-400" /> Inscrire un Nouvel Élève
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom / Prénom de l'Élève :</label>
                <input
                  type="text"
                  placeholder="Ex: Thomas Petit"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-medium text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Classe :</label>
                <select
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                >
                  <option value="6ème A">6ème A</option>
                  <option value="6ème B">6ème B</option>
                  <option value="5ème A">5ème A</option>
                  <option value="5ème B">5ème B</option>
                  <option value="4ème A">4ème A</option>
                  <option value="3ème A">3ème A</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Ajouter à la Base
              </button>
            </form>
          </div>

          {/* Students Roster List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users size={18} className="text-cyan-400" /> Liste des Élèves Enregistrés ({students.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {students.map((std) => (
                <div key={std.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {std.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">{std.name}</div>
                      <div className="text-[10px] text-cyan-400 font-bold uppercase">{std.className}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs space-y-0.5">
                    <div className="text-amber-400 font-extrabold">Moy. {std.averageGrade} / 20</div>
                    <div className="text-[10px] text-slate-400">{std.bestWpm} WPM Max</div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(std.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all"
                    title="Supprimer l'élève"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: EXERCISES MANAGEMENT */}
      {activeSubTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Exercise Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 h-fit">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus size={18} className="text-cyan-400" /> Créer un Nouvel Exercice
            </h3>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre de l'Exercice :</label>
                <input
                  type="text"
                  placeholder="Ex: Leçon Réseaux et Matériel"
                  value={newExoTitle}
                  onChange={(e) => setNewExoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-medium text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Niveau :</label>
                  <select
                    value={newExoCategory}
                    onChange={(e) => setNewExoCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="6ème">6ème</option>
                    <option value="5ème">5ème</option>
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Langue :</label>
                  <select
                    value={newExoLang}
                    onChange={(e) => setNewExoLang(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FR">Français 🇫🇷</option>
                    <option value="EN">English 🇬🇧</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Durée du Chronomètre :</label>
                <select
                  value={newExoDuration}
                  onChange={(e) => setNewExoDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                >
                  <option value={30}>30 Secondes</option>
                  <option value={60}>60 Secondes (1 min)</option>
                  <option value={120}>120 Secondes (2 min)</option>
                  <option value={180}>180 Secondes (3 min)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Texte de l'Exercice :</label>
                <textarea
                  rows={4}
                  placeholder="Saisissez le texte personnalisé à faire taper aux élèves..."
                  value={newExoText}
                  onChange={(e) => setNewExoText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Ajouter à la Banque d'Exercices
              </button>
            </form>
          </div>

          {/* Exercises List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-cyan-400" /> Banque d'Exercices Disponibles ({exercises.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {exercises.map((exo) => (
                <div key={exo.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded-md">
                        {exo.category}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md">
                        {exo.language === 'FR' ? 'Français 🇫🇷' : 'English 🇬🇧'}
                      </span>
                      <h4 className="text-sm font-extrabold text-white">{exo.title}</h4>
                    </div>

                    <button
                      onClick={() => handleCreateAndPrepareSession(exo)}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Play size={14} /> Préparer Session
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-mono line-clamp-2 bg-slate-900 p-2 rounded-xl border border-slate-800/60">
                    "{exo.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: HISTORY & REPORT RECORDS WITH PODIUMS */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-8">
          {/* Header & Global Stats Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Trophy size={14} className="text-amber-400" /> Archives & Podiums d'Élite
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Clock size={24} className="text-cyan-400" /> Historique des Défis & Podiums de Classe
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Consultez les bilans détaillés des sessions passées, les vainqueurs du podium et les statistiques individuelles de chaque élève.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par titre ou élève..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Filtered Records */}
          {(() => {
            const query = historySearchQuery.trim().toLowerCase();
            const filteredHistory = history.filter((rec) => {
              if (!query) return true;
              return (
                rec.exerciseTitle.toLowerCase().includes(query) ||
                rec.date.toLowerCase().includes(query) ||
                rec.results.some((r) => r.studentName.toLowerCase().includes(query) || r.className.toLowerCase().includes(query))
              );
            });

            if (filteredHistory.length === 0) {
              return (
                <div className="text-center py-16 bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl space-y-3">
                  <Trophy size={40} className="text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-400">Aucun défi historique ne correspond à votre recherche.</p>
                </div>
              );
            }

            return (
              <div className="space-y-10">
                {filteredHistory.map((rec) => {
                  const top1 = rec.results.find((r) => r.rank === 1) || rec.results[0];
                  const top2 = rec.results.find((r) => r.rank === 2) || rec.results[1];
                  const top3 = rec.results.find((r) => r.rank === 3) || rec.results[2];
                  const isExpanded = expandedHistoryCard === rec.id || history.length === 1;

                  // Class metrics for this test
                  const avgWpm = Math.round(rec.results.reduce((acc, r) => acc + r.wpm, 0) / (rec.results.length || 1));
                  const avgAccuracy = Math.round(rec.results.reduce((acc, r) => acc + r.accuracy, 0) / (rec.results.length || 1));
                  const avgGrade = (rec.results.reduce((acc, r) => acc + r.gradeNote, 0) / (rec.results.length || 1)).toFixed(1);

                  return (
                    <div
                      key={rec.id}
                      className="bg-slate-950 border-2 border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-2xl transition-all relative overflow-hidden"
                    >
                      {/* Top Header Card Info */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold rounded-md uppercase">
                              {rec.language === 'FR' ? 'Français 🇫🇷' : 'English 🇬🇧'}
                            </span>
                            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold rounded-md">
                              ⏱️ {rec.durationSeconds}s
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-md">
                              👥 {rec.totalParticipants} Participants
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-white">{rec.exerciseTitle}</h4>
                          <span className="text-xs text-slate-400 block font-mono">Date de réalisation : {rec.date}</span>
                        </div>

                        {/* Class KPI Summary pill */}
                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0">
                          <div className="text-center px-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Moy. Vitesse</span>
                            <span className="text-sm font-black text-cyan-400 font-mono">{avgWpm} WPM</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="text-center px-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Précision Moy.</span>
                            <span className="text-sm font-black text-emerald-400 font-mono">{avgAccuracy}%</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="text-center px-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Note Classe</span>
                            <span className="text-sm font-black text-amber-400 font-mono">{avgGrade}/20</span>
                          </div>
                        </div>
                      </div>

                      {/* PODIUM DISPLAY SECTION */}
                      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-inner">
                        <div className="text-center space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] rounded-full uppercase tracking-wider">
                            <Crown size={13} className="text-amber-400 animate-pulse" /> Podium des 3 Meilleurs Élèves
                          </div>
                        </div>

                        {/* 3D Pedestal Stage */}
                        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2 max-w-xl mx-auto">
                          {/* 2nd Place (Silver) */}
                          {top2 ? (
                            <div className="flex flex-col items-center flex-1">
                              <div className="text-center mb-2 space-y-0.5">
                                <span className="text-2xl">🥈</span>
                                <div className="text-xs font-black text-white truncate max-w-[110px]">{top2.studentName}</div>
                                <div className="text-[11px] font-mono text-cyan-300 font-bold">{top2.wpm} WPM</div>
                                <div className="text-[10px] font-mono text-amber-300 font-bold">{top2.gradeNote}/20</div>
                              </div>
                              <div className="w-full h-28 bg-gradient-to-t from-slate-800 via-slate-700 to-slate-500 rounded-t-2xl border-t-2 border-x-2 border-slate-300 flex flex-col items-center justify-center text-slate-950 font-black shadow-xl">
                                <span className="text-2xl font-black font-mono text-slate-100">#2</span>
                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">Argent</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1" />
                          )}

                          {/* 1st Place (Gold) */}
                          {top1 && (
                            <div className="flex flex-col items-center flex-1 -mt-6">
                              <div className="text-center mb-2 space-y-0.5 relative">
                                <Crown size={24} className="text-amber-400 mx-auto animate-bounce" />
                                <div className="text-sm font-black text-white truncate max-w-[130px]">{top1.studentName}</div>
                                <div className="text-xs font-mono text-cyan-300 font-black">{top1.wpm} WPM</div>
                                <div className="text-xs font-mono text-amber-400 font-black">{top1.gradeNote}/20</div>
                              </div>
                              <div className="w-full h-36 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-2xl border-t-2 border-x-2 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-2xl shadow-amber-500/20">
                                <span className="text-3xl font-black font-mono text-slate-950">#1</span>
                                <span className="text-xs font-black text-slate-950 uppercase tracking-widest">Champion 👑</span>
                              </div>
                            </div>
                          )}

                          {/* 3rd Place (Bronze) */}
                          {top3 ? (
                            <div className="flex flex-col items-center flex-1">
                              <div className="text-center mb-2 space-y-0.5">
                                <span className="text-2xl">🥉</span>
                                <div className="text-xs font-black text-white truncate max-w-[110px]">{top3.studentName}</div>
                                <div className="text-[11px] font-mono text-cyan-300 font-bold">{top3.wpm} WPM</div>
                                <div className="text-[10px] font-mono text-amber-300 font-bold">{top3.gradeNote}/20</div>
                              </div>
                              <div className="w-full h-22 bg-gradient-to-t from-amber-950 via-amber-900 to-amber-800 rounded-t-2xl border-t-2 border-x-2 border-amber-700 flex flex-col items-center justify-center text-amber-200 font-black shadow-lg">
                                <span className="text-xl font-black font-mono text-amber-300">#3</span>
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Bronze</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1" />
                          )}
                        </div>
                      </div>

                      {/* Expand / Collapse Toggle for Full Class Ranking */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setExpandedHistoryCard(isExpanded ? null : rec.id)}
                          className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} /> Masquer le Classement Complet ({rec.results.length} Élèves)
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} /> Afficher le Classement Complet ({rec.results.length} Élèves)
                            </>
                          )}
                        </button>
                      </div>

                      {/* Detailed Results Table */}
                      {isExpanded && (
                        <div className="overflow-x-auto pt-2 border-t border-slate-800">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                                <th className="py-2.5 px-3">Rang</th>
                                <th className="py-2.5 px-3">Élève</th>
                                <th className="py-2.5 px-3">Classe</th>
                                <th className="py-2.5 px-3">Vitesse</th>
                                <th className="py-2.5 px-3">Précision</th>
                                <th className="py-2.5 px-3">Progression</th>
                                <th className="py-2.5 px-3">Note Finale</th>
                                <th className="py-2.5 px-3">Distinctions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-200">
                              {rec.results.map((r) => {
                                const rankColor =
                                  r.rank === 1
                                    ? 'text-amber-400 font-black'
                                    : r.rank === 2
                                    ? 'text-slate-300 font-black'
                                    : r.rank === 3
                                    ? 'text-amber-600 font-black'
                                    : 'text-slate-400 font-bold';

                                return (
                                  <tr key={r.studentId} className="hover:bg-slate-900/60 transition-colors">
                                    <td className={`py-3 px-3 ${rankColor}`}>
                                      {r.rank === 1 ? '🥇 #1' : r.rank === 2 ? '🥈 #2' : r.rank === 3 ? '🥉 #3' : `#${r.rank}`}
                                    </td>
                                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                                      {r.studentName}
                                    </td>
                                    <td className="py-3 px-3 text-slate-400">{r.className}</td>
                                    <td className="py-3 px-3 text-cyan-400 font-bold">{r.wpm} WPM</td>
                                    <td className="py-3 px-3 text-emerald-400 font-bold">{r.accuracy}%</td>
                                    <td className="py-3 px-3 text-slate-300">{r.progress || 100}%</td>
                                    <td className="py-3 px-3 font-extrabold text-amber-300">{r.gradeNote} / 20</td>
                                    <td className="py-3 px-3">
                                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                                        {r.badges.length} badges
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Live Alert Toasts Container for Teacher */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toastAlerts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className={`
                pointer-events-auto p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden
                ${toast.type === 'milestone' ? 'bg-slate-900/95 border-amber-400 text-white shadow-amber-500/20' : ''}
                ${toast.type === 'overtake' ? 'bg-slate-900/95 border-cyan-400 text-white shadow-cyan-500/20' : ''}
                ${toast.type === 'finished' ? 'bg-slate-900/95 border-emerald-400 text-white shadow-emerald-500/20' : ''}
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold ${
                toast.type === 'milestone' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' :
                toast.type === 'overtake' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' :
                'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              }`}>
                {toast.type === 'milestone' ? '⚡' : toast.type === 'overtake' ? '👑' : '🎉'}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                    {toast.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
                </div>

                <p className="text-xs text-slate-200 font-medium leading-snug">
                  {toast.message}
                </p>

                {toast.badgeText && (
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-950 border border-slate-700 text-cyan-300 font-bold text-[10px] rounded-md font-mono">
                      {toast.badgeText}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => removeToastAlert(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
                title="Fermer l'alerte"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
