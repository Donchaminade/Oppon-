import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, ClassroomSession, StudentLiveState } from '../types/classroom';
import { AppSettings } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';
import { HandsGuide } from './HandsGuide';
import { sounds } from '../utils/sound';
import { Play, Award, CheckCircle2, AlertTriangle, Clock, Sparkles, UserCheck, Shield, ChevronRight, RefreshCw, Trophy } from 'lucide-react';

interface StudentClassroomArenaProps {
  settings: AppSettings;
  socket: any;
}

export const StudentClassroomArena: React.FC<StudentClassroomArenaProps> = ({ settings, socket }) => {
  // Current logged in student
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('typemaster_active_student_login');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  // Login forms
  const [loginName, setLoginName] = useState('');
  const [loginClass, setLoginClass] = useState('6ème A');

  // Live Session
  const [liveSession, setLiveSession] = useState<ClassroomSession | null>(null);
  const [countdownTick, setCountdownTick] = useState<number | null>(null);

  // Typing arena states
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync active student to local storage
  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('typemaster_active_student_login', JSON.stringify(currentStudent));
    }
  }, [currentStudent]);

  // Socket listener
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

  // Join current session when logged in
  useEffect(() => {
    if (currentStudent && liveSession && socket) {
      socket.emit("classroom_join_session", {
        sessionId: liveSession.id,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        className: currentStudent.className,
        avatar: currentStudent.avatar
      });
    }
  }, [currentStudent, liveSession?.id]);

  // Focus input on active challenge
  useEffect(() => {
    if (liveSession?.status === 'active') {
      inputRef.current?.focus();
      if (!startTime) setStartTime(Date.now());
    }
  }, [liveSession?.status]);

  // Handle typing input logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!liveSession || liveSession.status !== 'active') return;

    const val = e.target.value;
    const targetText = liveSession.text;

    // Limit to max text length
    if (val.length > targetText.length) return;

    if (val.length > userInput.length) {
      sounds.playKeyPress(settings.soundEnabled, settings.mechanicalSoundEnabled !== false);
    }

    setUserInput(val);

    // Calculate mistakes and accuracy
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetText[i]) {
        errors++;
      }
    }
    setMistakes(errors);

    const totalChars = val.length;
    const computedAccuracy = totalChars > 0 ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100)) : 100;
    setAccuracy(computedAccuracy);

    // WPM calculation
    const elapsedMinutes = startTime ? Math.max((Date.now() - startTime) / 60000, 0.05) : 0.1;
    const correctChars = totalChars - errors;
    const computedWpm = Math.round((correctChars / 5) / elapsedMinutes);
    setWpm(computedWpm);

    const progress = Math.min(100, Math.round((val.length / targetText.length) * 100));

    // Broadcast live typing progress to teacher & classmates!
    if (socket && currentStudent) {
      socket.emit("classroom_update_live", {
        sessionId: liveSession.id,
        studentId: currentStudent.id,
        wpm: computedWpm,
        cpm: Math.round(correctChars / elapsedMinutes),
        accuracy: computedAccuracy,
        progress,
        typedTextSnippet: val.slice(-25),
        errors
      });
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) return;

    const std: StudentProfile = {
      id: 'std_login_' + Date.now(),
      name: loginName.trim(),
      className: loginClass,
      avatar: ['👨‍🎓', '👩‍🎓', '🚀', '⚡', '🌟'][Math.floor(Math.random() * 5)],
      joinedAt: new Date().toLocaleDateString('fr-FR'),
      totalChallenges: 0,
      bestWpm: 0,
      averageAccuracy: 100,
      averageGrade: 0,
      badges: ['badge_first_step']
    };

    setCurrentStudent(std);
  };

  // If student is not logged in yet
  if (!currentStudent) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-lg">
          🏫
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Espace Élève — Connexion Classe</h2>
          <p className="text-xs text-slate-400 mt-1">
            Entrez votre nom et votre classe pour rejoindre le challenge dactylographique.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Votre Prénom et Nom :</label>
            <input
              type="text"
              placeholder="Ex: Lucas Martin"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white font-medium text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Votre Classe :</label>
            <select
              value={loginClass}
              onChange={(e) => setLoginClass(e.target.value)}
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
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <UserCheck size={18} /> Se Connecter au Challenge
          </button>
        </form>
      </div>
    );
  }

  // Active student state in live session
  const meState: StudentLiveState | undefined = liveSession?.students[currentStudent.id];
  const sortedLiveStudents: StudentLiveState[] = liveSession
    ? (Object.values(liveSession.students) as StudentLiveState[]).sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      })
    : [];

  const myRank = sortedLiveStudents.findIndex((s) => s.studentId === currentStudent.id) + 1;

  return (
    <div className="space-y-6">
      {/* Student Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            {currentStudent.avatar}
          </div>
          <div>
            <div className="text-base font-extrabold text-white">{currentStudent.name}</div>
            <div className="text-xs font-bold text-cyan-400 uppercase">{currentStudent.className}</div>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentStudent(null);
            localStorage.removeItem('typemaster_active_student_login');
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
        >
          Changer d'élève
        </button>
      </div>

      {/* Countdown overlay when Top is triggered */}
      {countdownTick !== null && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">C'est parti !</div>
            <div className="text-9xl font-black text-amber-400 font-mono animate-bounce">{countdownTick}</div>
            <div className="text-xl font-extrabold text-white">Mettez vos mains en position !</div>
          </div>
        </div>
      )}

      {/* Main Classroom Session View */}
      {liveSession ? (
        <div className="space-y-6">
          {/* Waiting Status */}
          {liveSession.status === 'waiting' && (
            <div className="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-3xl flex items-center justify-center mx-auto text-4xl animate-pulse">
                ⏳
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-full uppercase">
                  Session Prête : {liveSession.title} ({liveSession.durationSeconds}s)
                </span>
                <h3 className="text-2xl font-black text-white">En Attente du Top du Professeur...</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Vous êtes bien connecté ! Le professeur va lancer le compte à rebours sous peu. Dès que le Top résonne, tapez le texte le plus vite et le plus précisément possible.
                </p>
              </div>

              {/* Connected classmates */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl max-w-md mx-auto space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Élèves Connectés au Salon :</span>
                  <span className="text-emerald-400 font-mono">{Object.keys(liveSession.students).length} en ligne</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {(Object.values(liveSession.students) as StudentLiveState[]).map((s) => (
                    <span key={s.studentId} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5">
                      {s.avatar} {s.studentName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Challenge Arena */}
          {liveSession.status === 'active' && (
            <div className="space-y-6">
              {/* Top Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Chronomètre</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">{liveSession.timeRemaining}s</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Votre Rang Live</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">#{myRank > 0 ? myRank : 1}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Vitesse (WPM)</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{wpm} WPM</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Précision</div>
                  <div className="text-2xl font-black text-teal-300 font-mono">{accuracy}%</div>
                </div>
              </div>

              {/* Typing Box */}
              <div className="bg-slate-900 border-2 border-cyan-500/50 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative">
                {/* Target Text Display */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-lg sm:text-xl font-mono leading-relaxed tracking-wide select-none">
                  {liveSession.text.split('').map((char, index) => {
                    let charState = 'untyped';
                    if (index < userInput.length) {
                      charState = userInput[index] === char ? 'correct' : 'incorrect';
                    }

                    return (
                      <span
                        key={index}
                        className={`
                          transition-colors rounded-sm px-0.5
                          ${charState === 'correct' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}
                          ${charState === 'incorrect' ? 'bg-rose-500/30 text-rose-300 font-bold underline decoration-rose-500' : ''}
                          ${charState === 'untyped' ? 'text-slate-400' : ''}
                          ${index === userInput.length ? 'border-b-2 border-cyan-400 bg-cyan-500/20 animate-pulse text-white' : ''}
                        `}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                {/* Invisible input overlay */}
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono p-4 rounded-xl text-base focus:outline-none focus:border-cyan-400"
                  placeholder="Tapez le texte ici dès le signal..."
                  autoFocus
                />
              </div>

              {/* Keyboard and Hands Guide options */}
              <div className="space-y-4">
                <VirtualKeyboard
                  nextChar={liveSession.text[userInput.length] || ''}
                  layout={settings.layout}
                />
              </div>
            </div>
          )}

          {/* Finished End Screen with Note out of 20 & Leaderboard */}
          {liveSession.status === 'finished' && meState && (
            <div className="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xl">
                  🏆
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Résultats du Challenge de Classe</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bravo {currentStudent.name} ! Voici votre note finale et votre classement officiel.
                  </p>
                </div>

                {/* Big Grade Note */}
                <div className="inline-flex flex-col items-center justify-center bg-slate-950 border-2 border-amber-400 p-6 rounded-3xl min-w-[220px] shadow-xl">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Votre Note d'Informatique
                  </span>
                  <div className="text-5xl font-black text-amber-400 font-mono">
                    {meState.gradeNote} <span className="text-xl text-slate-400">/ 20</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold mt-2">
                    Rang #{myRank} sur {sortedLiveStudents.length}
                  </span>
                </div>
              </div>

              {/* Classement Général Table */}
              <div className="space-y-4">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" /> Classement Final de la Classe
                </h4>

                <div className="space-y-2">
                  {sortedLiveStudents.map((std, idx) => (
                    <div
                      key={std.studentId}
                      className={`
                        p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono text-xs
                        ${std.studentId === currentStudent.id ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-sm">{std.avatar} {std.studentName}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-cyan-400 font-bold">{std.wpm} WPM</span>
                        <span className="text-emerald-400 font-bold">{std.accuracy}%</span>
                        <span className="text-amber-300 font-extrabold bg-amber-500/20 px-3 py-1 rounded-lg">
                          {std.gradeNote} / 20
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-slate-300">
          <Clock size={40} className="mx-auto text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Aucun Challenge de Classe Actif</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Demandez à votre professeur de lancer le challenge depuis l'Espace Enseignant. Cette page se mettra à jour automatiquement !
          </p>
        </div>
      )}
    </div>
  );
};
