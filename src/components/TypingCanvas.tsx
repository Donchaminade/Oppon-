import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Finger, TypingSessionResult, AppSettings } from '../types';
import { getFingerForChar } from '../data/keyboard';
import { HandsGuide } from './HandsGuide';
import { VirtualKeyboard } from './VirtualKeyboard';
import { sounds } from '../utils/sound';
import { Play, RotateCcw, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TypingCanvasProps {
  title: string;
  targetText: string;
  settings: AppSettings;
  mode: 'lesson' | 'custom';
  targetWpm?: number;
  minAccuracy?: number;
  onComplete: (result: TypingSessionResult) => void;
  onNextLesson?: () => void;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  title,
  targetText,
  settings,
  mode,
  targetWpm = 30,
  minAccuracy = 95,
  onComplete,
  onNextLesson
}) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [keyErrors, setKeyErrors] = useState<Record<string, number>>({});
  const [lastPressed, setLastPressed] = useState<{ key: string; isCorrect: boolean } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number; errors: number }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCharIndex = userInput.length;
  const currentChar = targetText[currentCharIndex] || '';
  const activeFinger: Finger = getFingerForChar(currentChar, settings.layout);

  // Focus hidden input
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [targetText]);

  // Timer loop
  useEffect(() => {
    if (startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const durationSec = Math.max(1, Math.floor((now - startTime) / 1000));
        setElapsedSeconds(durationSec);

        // Record WPM history every 2 seconds
        const typedCount = userInput.length;
        const currentWpm = Math.round((typedCount / 5) / (durationSec / 60));
        setWpmHistory((prev) => [
          ...prev,
          { time: durationSec, wpm: currentWpm, errors: mistakes }
        ]);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isFinished, userInput.length, mistakes]);

  // Calculate live metrics
  const calculateWpm = useCallback(() => {
    if (!startTime || elapsedSeconds === 0) return 0;
    const typedWords = userInput.length / 5;
    const minutes = elapsedSeconds / 60;
    return Math.round(typedWords / minutes) || 0;
  }, [startTime, elapsedSeconds, userInput.length]);

  const calculateCpm = useCallback(() => {
    if (!startTime || elapsedSeconds === 0) return 0;
    const minutes = elapsedSeconds / 60;
    return Math.round(userInput.length / minutes) || 0;
  }, [startTime, elapsedSeconds, userInput.length]);

  const calculateAccuracy = useCallback(() => {
    const totalTyped = userInput.length + mistakes;
    if (totalTyped === 0) return 100;
    return Math.max(0, Math.round((userInput.length / totalTyped) * 100));
  }, [userInput.length, mistakes]);

  const currentWpm = calculateWpm();
  const currentCpm = calculateCpm();
  const currentAccuracy = calculateAccuracy();

  // Reset exercise
  const handleReset = () => {
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setMistakes(0);
    setKeyErrors({});
    setLastPressed(null);
    setIsFinished(false);
    setWpmHistory([]);
    if (timerRef.current) clearInterval(timerRef.current);
    focusInput();
  };

  // Handle keyboard typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Check last character typed
    if (val.length > userInput.length) {
      const typedChar = val[val.length - 1];
      const expectedChar = targetText[userInput.length];

      if (typedChar === expectedChar) {
        sounds.playKeyPress(settings.soundEnabled, settings.mechanicalSoundEnabled !== false);
        setLastPressed({ key: typedChar, isCorrect: true });
        setUserInput(val);

        // Check if finished
        if (val.length >= targetText.length) {
          const finishMs = Date.now();
          setEndTime(finishMs);
          setIsFinished(true);

          if (timerRef.current) clearInterval(timerRef.current);

          const finalSec = Math.max(1, Math.floor((finishMs - (startTime || finishMs)) / 1000));
          const finalWpm = Math.round((targetText.length / 5) / (finalSec / 60));
          const finalAccuracy = Math.round((targetText.length / (targetText.length + mistakes)) * 100);

          sounds.playSuccess(settings.soundEnabled);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

          const sessionResult: TypingSessionResult = {
            id: 'session_' + Date.now(),
            date: new Date().toLocaleDateString('fr-FR'),
            title,
            wpm: finalWpm,
            cpm: Math.round(targetText.length / (finalSec / 60)),
            accuracy: finalAccuracy,
            mistakes,
            timeSeconds: finalSec,
            mode,
            keyErrors,
            wpmOverTime: wpmHistory
          };

          onComplete(sessionResult);
        }
      } else {
        // Mistake
        sounds.playError(settings.soundEnabled);
        setLastPressed({ key: typedChar, isCorrect: false });
        setMistakes((prev) => prev + 1);

        setKeyErrors((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1
        }));
      }
    } else if (val.length < userInput.length) {
      // Backspace
      setUserInput(val);
    }
  };

  // Star rating calculation
  const getStars = () => {
    if (currentAccuracy < minAccuracy) return 1;
    if (currentWpm >= targetWpm + 10) return 3;
    if (currentWpm >= targetWpm) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full" onClick={focusInput}>
      {/* Hidden real input element */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-50 pointer-events-none"
        value={userInput}
        onChange={handleInputChange}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Top Header & Metrics Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚡</span> {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cliquez n'importe où pour activer la saisie. Objectif: <span className="text-cyan-400 font-semibold">{targetWpm} WPM</span> | Précision &gt; {minAccuracy}%
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-center px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl min-w-[70px]">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Vitesse</div>
            <div className="text-xl font-extrabold text-cyan-400 font-mono">{currentWpm} <span className="text-xs font-normal">WPM</span></div>
          </div>

          <div className="text-center px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl min-w-[70px]">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Précision</div>
            <div className={`text-xl font-extrabold font-mono ${currentAccuracy >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentAccuracy}<span className="text-xs font-normal">%</span>
            </div>
          </div>

          <div className="text-center px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl min-w-[70px]">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Erreurs</div>
            <div className="text-xl font-extrabold text-rose-400 font-mono">{mistakes}</div>
          </div>

          <div className="text-center px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl min-w-[70px]">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Temps</div>
            <div className="text-xl font-extrabold text-slate-200 font-mono">{elapsedSeconds}s</div>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all shadow-md active:scale-95"
            title="Recommencer l'exercice"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main Interactive Typing Display Area */}
      <div className="relative bg-slate-900 border-2 border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[160px] flex flex-col justify-center">
        {/* Progress bar line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${(userInput.length / targetText.length) * 100}%` }}
          />
        </div>

        {/* Text rendering with active character highlight */}
        <div
          className={`
            font-mono tracking-wide leading-relaxed select-none break-words
            ${settings.fontSize === 'xlarge' ? 'text-2xl sm:text-3xl' : settings.fontSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}
          `}
        >
          {targetText.split('').map((char, index) => {
            const isTyped = index < userInput.length;
            const isCurrent = index === currentCharIndex;

            let charClass = 'text-slate-500';

            if (isTyped) {
              charClass = 'text-emerald-400 bg-emerald-950/20';
            } else if (isCurrent) {
              charClass = 'text-slate-950 bg-cyan-400 font-bold shadow-md shadow-cyan-400/50 animate-pulse rounded-xs px-0.5';
            }

            return (
              <span key={index} className={`transition-all ${charClass}`}>
                {char === ' ' ? (isCurrent ? ' ' : ' ') : char}
              </span>
            );
          })}
        </div>

        {!startTime && (
          <div className="mt-4 flex items-center gap-2 text-xs text-cyan-400/80 animate-pulse font-sans">
            <Play size={14} /> Commencez à taper le texte pour lancer le chronomètre...
          </div>
        )}
      </div>

      {/* Visual Finger Guide & Keyboard */}
      {settings.showHands && <HandsGuide activeFinger={activeFinger} />}

      {settings.showKeyboard && (
        <VirtualKeyboard
          layout={settings.layout}
          targetChar={currentChar}
          lastPressedKey={lastPressed}
          activeFinger={activeFinger}
        />
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              <Award size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Exercice Terminé !</h3>
              <p className="text-sm text-slate-400 mt-1">{title}</p>
            </div>

            {/* Stars rating */}
            <div className="flex justify-center gap-2 text-3xl">
              <span className={stars >= 1 ? 'opacity-100 scale-110' : 'opacity-20'}>⭐</span>
              <span className={stars >= 2 ? 'opacity-100 scale-110' : 'opacity-20'}>⭐</span>
              <span className={stars >= 3 ? 'opacity-100 scale-110' : 'opacity-20'}>⭐</span>
            </div>

            {/* Summary metrics grid */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Vitesse</div>
                <div className="text-2xl font-extrabold text-cyan-400">{currentWpm} WPM</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Précision</div>
                <div className="text-2xl font-extrabold text-emerald-400">{currentAccuracy}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Erreurs</div>
                <div className="text-2xl font-extrabold text-rose-400">{mistakes}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Réessayer
              </button>

              {onNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  Suivant <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
