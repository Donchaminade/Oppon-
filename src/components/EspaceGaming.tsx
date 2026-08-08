import React, { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { sounds } from '../utils/sound';
import { Gamepad2, Sparkles, Trophy, Play, RotateCcw, Flame, Zap, Award, Volume2, VolumeX, Keyboard, Timer, Clock, Medal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface EspaceGamingProps {
  settings: AppSettings;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
}

const WORDS_POOL = [
  'CLAVIER', 'SOURIS', 'ECRAN', 'TOUCHE', 'INFORMATIQUE', 'ORDINATEUR', 'AZERTY', 'VITESSE',
  'ACCUEIL', 'MEMOIRE', 'ROBOT', 'RESEAU', 'DONNEES', 'FICHIER', 'DOSSIER', 'IMAGE',
  'INTERNET', 'PIXEL', 'MODULE', 'CLIC', 'PAUSE', 'SYSTEME', 'CODE', 'PROGRAMME',
  'ECRIRE', 'TEXTE', 'DIGITAL', 'ECRAN', 'CHROME', 'BUFFER', 'OCTET', 'ALGORITHME'
];

const KEYS_POOL = 'AZERTYUIOPQSDFGHJKLM';

const FLASH_TEXTS = [
  'LE CLAVIER AZERTY EST UN OUTIL MAGIQUE',
  'TAPERA VITESSE GRAND V AVEC TOUS SES DOIGTS',
  'LA DACTYLOGRAPHIE DEVINT UN JEU PASSIONNANT',
  'LES CHAMPIONS DE SIXIEME REUSSISSENT LE DEFI',
  'PRECISION ET REFLEXES RAPIDES AU QUOTIDIEN',
  'TOUS LES ELEVES PROGRESSENT CHAQUE JOUR'
];

interface FlashLeaderboardEntry {
  id: string;
  name: string;
  className: string;
  wpm: number;
  accuracy: number;
  score: number;
  isCurrentPlayer?: boolean;
  date: string;
}

const INITIAL_FLASH_LEADERBOARD: FlashLeaderboardEntry[] = [
  { id: '1', name: 'Lucas M.', className: '6ème A', wpm: 58, accuracy: 98, score: 580, date: 'Aujourd\'hui' },
  { id: '2', name: 'Emma B.', className: '5ème B', wpm: 52, accuracy: 96, score: 520, date: 'Aujourd\'hui' },
  { id: '3', name: 'Thomas R.', className: '6ème C', wpm: 46, accuracy: 94, score: 460, date: 'Hier' },
  { id: '4', name: 'Chloé D.', className: '5ème A', wpm: 42, accuracy: 95, score: 420, date: 'Hier' },
  { id: '5', name: 'Yanis K.', className: '6ème B', wpm: 38, accuracy: 90, score: 380, date: 'Il y a 2j' },
];

export const EspaceGaming: React.FC<EspaceGamingProps> = ({ settings, onUpdateSettings }) => {
  const [activeGame, setActiveGame] = useState<'asteroids' | 'runner' | 'ninja' | 'flash'>('asteroids');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  // Mechanical sound local override state if onUpdateSettings is provided, or fallback
  const [mechanicalSound, setMechanicalSound] = useState<boolean>(settings.mechanicalSoundEnabled !== false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);

  useEffect(() => {
    setMechanicalSound(settings.mechanicalSoundEnabled !== false);
    setSoundEnabled(settings.soundEnabled);
  }, [settings.mechanicalSoundEnabled, settings.soundEnabled]);

  const toggleMechanicalSound = () => {
    const nextVal = !mechanicalSound;
    setMechanicalSound(nextVal);
    if (onUpdateSettings) {
      onUpdateSettings({ mechanicalSoundEnabled: nextVal, soundEnabled: true });
    }
  };

  const playClickSound = () => {
    if (soundEnabled) {
      sounds.playKeyPress(true, mechanicalSound);
    }
  };

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);

  // Astéroïdes Game States
  const [asteroids, setAsteroids] = useState<{ id: string; word: string; x: number; y: number; speed: number }[]>([]);
  const [typedInput, setTypedInput] = useState('');

  // Runner Game States
  const [obstacleWord, setObstacleWord] = useState('CLAVIER');
  const [runnerPos, setRunnerPos] = useState(10); // %
  const [isJumping, setIsJumping] = useState(false);

  // Ninja Keys States
  const [targetKey, setTargetKey] = useState('F');
  const [keyTimer, setKeyTimer] = useState(100);

  // Défi Flash States
  const [flashTimeLeft, setFlashTimeLeft] = useState(30);
  const [flashTargetText, setFlashTargetText] = useState(FLASH_TEXTS[0]);
  const [flashTypedInput, setFlashTypedInput] = useState('');
  const [flashCompletedSentences, setFlashCompletedSentences] = useState(0);
  const [flashCorrectChars, setFlashCorrectChars] = useState(0);
  const [flashTotalTypedChars, setFlashTotalTypedChars] = useState(0);
  const [flashWpm, setFlashWpm] = useState(0);
  const [flashAccuracy, setFlashAccuracy] = useState(100);
  const [flashLeaderboard, setFlashLeaderboard] = useState<FlashLeaderboardEntry[]>(INITIAL_FLASH_LEADERBOARD);

  const inputRef = useRef<HTMLInputElement>(null);

  // Start game handler
  const handleStartGame = () => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setTypedInput('');
    setGameState('playing');

    if (activeGame === 'asteroids') {
      spawnAsteroid();
    } else if (activeGame === 'runner') {
      setObstacleWord(WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
    } else if (activeGame === 'ninja') {
      setTargetKey(KEYS_POOL[Math.floor(Math.random() * KEYS_POOL.length)]);
      setKeyTimer(100);
    } else if (activeGame === 'flash') {
      setFlashTimeLeft(30);
      setFlashTargetText(FLASH_TEXTS[Math.floor(Math.random() * FLASH_TEXTS.length)]);
      setFlashTypedInput('');
      setFlashCompletedSentences(0);
      setFlashCorrectChars(0);
      setFlashTotalTypedChars(0);
      setFlashWpm(0);
      setFlashAccuracy(100);
    }
  };

  // Asteroids spawn
  const spawnAsteroid = () => {
    const word = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
    const newAst = {
      id: 'ast_' + Date.now() + Math.random(),
      word,
      x: Math.floor(15 + Math.random() * 70), // % position
      y: 0,
      speed: 1.5 + Math.random() * 1.5
    };
    setAsteroids((prev) => [...prev, newAst]);
  };

  // Asteroids movement loop
  useEffect(() => {
    if (activeGame !== 'asteroids' || gameState !== 'playing') return;

    const interval = setInterval(() => {
      setAsteroids((prev) => {
        const next = prev.map((a) => ({ ...a, y: a.y + a.speed }));
        // Check if any reached bottom (>85%)
        const touchedBottom = next.filter((a) => a.y >= 85);
        if (touchedBottom.length > 0) {
          if (soundEnabled) sounds.playError(true);
          setLives((l) => {
            const updated = l - touchedBottom.length;
            if (updated <= 0) {
              setGameState('gameover');
            }
            return Math.max(0, updated);
          });
        }
        return next.filter((a) => a.y < 85);
      });

      // Periodically spawn new asteroid
      if (Math.random() < 0.25) {
        spawnAsteroid();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [activeGame, gameState, soundEnabled]);

  // Handle typed input in Asteroids
  const handleAsteroidInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val !== typedInput) {
      playClickSound();
    }
    setTypedInput(val);

    // Check if typed input matches any active asteroid
    const matchedIdx = asteroids.findIndex((a) => a.word === val.trim());
    if (matchedIdx !== -1) {
      // Destroy asteroid!
      if (soundEnabled) sounds.playSuccess(true);
      setAsteroids((prev) => prev.filter((_, idx) => idx !== matchedIdx));
      setTypedInput('');
      setScore((s) => {
        const nextS = s + 100 + combo * 10;
        if (nextS > highScore) setHighScore(nextS);
        return nextS;
      });
      setCombo((c) => c + 1);
    }
  };

  // Handle typing in Runner
  const handleRunnerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val !== typedInput) {
      playClickSound();
    }
    setTypedInput(val);

    if (val.trim() === obstacleWord) {
      if (soundEnabled) sounds.playSuccess(true);
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 800);

      setScore((s) => {
        const nextS = s + 150;
        if (nextS > highScore) setHighScore(nextS);
        return nextS;
      });
      setCombo((c) => c + 1);
      setTypedInput('');
      setObstacleWord(WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
    }
  };

  // Handle Défi Flash Input
  const handleFlashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val !== flashTypedInput) {
      playClickSound();
    }

    setFlashTypedInput(val);
    setFlashTotalTypedChars((prev) => prev + 1);

    // Calculate correct chars count
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (i < flashTargetText.length && val[i] === flashTargetText[i]) {
        correct++;
      }
    }
    setFlashCorrectChars(correct);

    // Check complete sentence match
    if (val === flashTargetText) {
      if (soundEnabled) sounds.playSuccess(true);
      setFlashCompletedSentences((prev) => prev + 1);
      setScore((s) => {
        const nextS = s + 300;
        if (nextS > highScore) setHighScore(nextS);
        return nextS;
      });
      setCombo((c) => c + 1);
      setFlashTypedInput('');

      // Pick next text from pool
      const nextIdx = Math.floor(Math.random() * FLASH_TEXTS.length);
      setFlashTargetText(FLASH_TEXTS[nextIdx]);
    }
  };

  // Défi Flash 30-Second Countdown Timer Effect
  useEffect(() => {
    if (activeGame !== 'flash' || gameState !== 'playing') return;

    const interval = setInterval(() => {
      setFlashTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finishFlashGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame, gameState, flashCorrectChars, flashTotalTypedChars, score]);

  const finishFlashGame = () => {
    setGameState('gameover');
    if (soundEnabled) sounds.playSuccess(true);

    const timeSpentInSec = 30;
    const finalWpm = Math.max(15, Math.round((flashCorrectChars / 5) / (timeSpentInSec / 60)));
    const finalAccuracy = flashTotalTypedChars > 0 ? Math.min(100, Math.round((flashCorrectChars / Math.max(1, flashTypedInput.length)) * 100)) : 95;
    const finalScore = score + finalWpm * 10 + flashCompletedSentences * 150;

    setFlashWpm(finalWpm);
    setFlashAccuracy(finalAccuracy);

    // Insert user into Leaderboard
    const newRecord: FlashLeaderboardEntry = {
      id: 'rec_' + Date.now(),
      name: 'Moi (Joueur Flash)',
      className: '6ème A',
      wpm: finalWpm,
      accuracy: finalAccuracy,
      score: finalScore,
      isCurrentPlayer: true,
      date: 'À l\'instant'
    };

    setFlashLeaderboard((prev) => {
      const filtered = prev.filter((r) => !r.isCurrentPlayer);
      const combined = [...filtered, newRecord].sort((a, b) => b.score - a.score);
      return combined.slice(0, 6);
    });
  };

  // Handle Ninja Keys Press
  useEffect(() => {
    if (activeGame !== 'ninja' || gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      playClickSound();
      if (key === targetKey) {
        if (soundEnabled) sounds.playSuccess(true);
        setScore((s) => {
          const nextS = s + 50 + combo * 5;
          if (nextS > highScore) setHighScore(nextS);
          return nextS;
        });
        setCombo((c) => c + 1);
        setTargetKey(KEYS_POOL[Math.floor(Math.random() * KEYS_POOL.length)]);
        setKeyTimer(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, gameState, targetKey, combo, soundEnabled, mechanicalSound]);

  // Ninja key timer countdown
  useEffect(() => {
    if (activeGame !== 'ninja' || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setKeyTimer((t) => {
        if (t <= 5) {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) setGameState('gameover');
            return Math.max(0, nextL);
          });
          setTargetKey(KEYS_POOL[Math.floor(Math.random() * KEYS_POOL.length)]);
          return 100;
        }
        return t - 4;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [activeGame, gameState]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 font-bold text-xs uppercase tracking-wider">
            <Gamepad2 size={14} className="text-purple-400" /> Arcade Dactylo pour les 6ème & 5ème
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Espace Gaming — Apprendre en Jouant
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Profitez d'un accès libre à nos 3 mini-jeux ludiques spécialement créés pour développer les réflexes clavier des classes de 6ème et 5ème.
          </p>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveGame('asteroids'); setGameState('idle'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeGame === 'asteroids' ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🚀 Astéroïdes Mots
          </button>
          <button
            onClick={() => { setActiveGame('runner'); setGameState('idle'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeGame === 'runner' ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏃 Speed Runner
          </button>
          <button
            onClick={() => { setActiveGame('ninja'); setGameState('idle'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeGame === 'ninja' ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🥷 Ninja Touches
          </button>
          <button
            onClick={() => { setActiveGame('flash'); setGameState('idle'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeGame === 'flash' ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚡ Défi Flash 30s
          </button>
        </div>
      </div>

      {/* Main Game Arena Box */}
      <div className="bg-slate-900 border-2 border-purple-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative min-h-[480px] flex flex-col justify-between overflow-hidden">
        {/* Top HUD: Score, Lives, Combo */}
        <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
              <span className="text-xl font-black text-amber-400">{score} pts</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Combo Streak</span>
              <span className="text-base font-black text-purple-400 flex items-center gap-1">
                <Flame size={14} /> x{combo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Toggle Clic Mécanique */}
            <button
              onClick={toggleMechanicalSound}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                soundEnabled && mechanicalSound
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Activer/Désactiver le retours sonore de clic mécanique"
            >
              <Keyboard size={14} className={soundEnabled && mechanicalSound ? 'text-purple-400 animate-pulse' : 'text-slate-500'} />
              <span className="hidden sm:inline">Clic Mécanique :</span>
              <span>{soundEnabled && mechanicalSound ? 'ON ⌨️' : 'OFF 🔇'}</span>
            </button>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Record</span>
              <span className="text-sm font-black text-cyan-400">{highScore} pts</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vies</span>
              <div className="flex gap-1 text-base">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={i < lives ? 'text-rose-500' : 'text-slate-700'}>❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GAME CONTENT CANVAS / INTERACTIVE AREA */}
        <div className="my-6 relative min-h-[280px] flex items-center justify-center">
          {/* Game 1: Asteroids */}
          {activeGame === 'asteroids' && gameState === 'playing' && (
            <div className="w-full h-[280px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
              {asteroids.map((ast) => (
                <div
                  key={ast.id}
                  style={{ left: `${ast.x}%`, top: `${ast.y}%` }}
                  className="absolute px-3 py-1 bg-purple-600/30 border border-purple-400 text-purple-200 font-mono font-black text-xs rounded-xl shadow-md transition-all duration-300 animate-pulse"
                >
                  ☄️ {ast.word}
                </div>
              ))}
            </div>
          )}

          {/* Game 2: Speed Runner */}
          {activeGame === 'runner' && gameState === 'playing' && (
            <div className="w-full h-[280px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-end p-6">
              {/* Runner character */}
              <div
                className={`text-4xl absolute transition-all duration-300 ${isJumping ? '-translate-y-16 scale-110 text-cyan-300' : ''}`}
                style={{ left: '15%', bottom: '20%' }}
              >
                🏃
              </div>

              {/* Obstacle with word */}
              <div className="absolute text-center space-y-1" style={{ right: '20%', bottom: '20%' }}>
                <span className="px-3 py-1 bg-amber-500 border border-amber-400 text-slate-950 font-mono font-black text-xs rounded-lg uppercase shadow-lg">
                  {obstacleWord}
                </span>
                <div className="text-3xl">🪨</div>
              </div>

              {/* Ground line */}
              <div className="w-full h-2 bg-purple-500 rounded-full" />
            </div>
          )}

          {/* Game 3: Ninja Keys */}
          {activeGame === 'ninja' && gameState === 'playing' && (
            <div className="text-center space-y-6">
              <span className="text-xs text-purple-300 font-bold uppercase tracking-widest block">
                Saisissez immédiatement la touche :
              </span>
              <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-purple-600 to-indigo-500 border-4 border-purple-300 text-white font-mono font-black text-6xl rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-bounce">
                {targetKey}
              </div>

              {/* Countdown timer bar */}
              <div className="w-64 mx-auto h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{ width: `${keyTimer}%` }}
                />
              </div>
            </div>
          )}

          {/* Game 4: Défi Flash 30s */}
          {activeGame === 'flash' && gameState === 'playing' && (
            <div className="w-full space-y-6 max-w-xl mx-auto">
              {/* 30s Countdown Gauge */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Timer size={16} className={flashTimeLeft <= 5 ? 'animate-bounce text-rose-500' : ''} />
                    Chrono Flash 30s
                  </span>
                  <span className={`text-lg font-black ${flashTimeLeft <= 5 ? 'text-rose-500 animate-pulse' : flashTimeLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    00:{flashTimeLeft < 10 ? `0${flashTimeLeft}` : flashTimeLeft}s
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      flashTimeLeft <= 5 ? 'bg-rose-500' : flashTimeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(flashTimeLeft / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Target text with character-by-character state */}
              <div className="bg-slate-950 border-2 border-amber-500/40 p-6 rounded-2xl space-y-3 text-center shadow-2xl">
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <Zap size={14} className="text-amber-400" /> Phrases complétées : <span className="text-white font-mono font-black">{flashCompletedSentences}</span>
                </div>

                <div className="text-xl sm:text-2xl font-mono font-black tracking-wide leading-relaxed p-2">
                  {flashTargetText.split('').map((char, index) => {
                    let charColor = 'text-slate-600';
                    if (index < flashTypedInput.length) {
                      charColor = flashTypedInput[index] === char ? 'text-emerald-400 bg-emerald-950/60 rounded px-0.5' : 'text-rose-400 bg-rose-950/80 rounded px-0.5';
                    } else if (index === flashTypedInput.length) {
                      charColor = 'text-amber-300 underline underline-offset-4 decoration-amber-400 animate-pulse';
                    }
                    return (
                      <span key={index} className={charColor}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Défi Flash Idle or Game Over: Classement Ultra-Rapide */}
          {activeGame === 'flash' && gameState !== 'playing' && (
            <div className="w-full max-w-2xl mx-auto space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-bold text-xs uppercase">
                  <Trophy size={14} className="text-amber-400" /> Classement Ultra-Rapide Flash
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {gameState === 'gameover' ? '⏱️ Chrono Expiré ! Votre Résultat' : '⚡ Défi Flash 30 Secondes'}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Tapez le maximum de phrases courtes en 30 secondes chrono pour grimper au sommet du classement.
                </p>
              </div>

              {/* Player Score Summary Banner if GameOver */}
              {gameState === 'gameover' && (
                <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border-2 border-amber-500/60 p-4 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-center shadow-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vitesse Dactylo</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">{flashWpm} MPM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Précision</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{flashAccuracy}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Score Total</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">{score} Pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Phrases</span>
                    <span className="text-2xl font-black text-purple-300 font-mono">{flashCompletedSentences}</span>
                  </div>
                </div>
              )}

              {/* Leaderboard Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-3 border-b border-slate-800/80 pb-2">
                  <span>Rang & Joueur</span>
                  <div className="flex items-center gap-6">
                    <span>Vitesse</span>
                    <span>Score</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {flashLeaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    return (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                          entry.isCurrentPlayer
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                            rank === 1 ? 'bg-amber-400 text-slate-950' : rank === 2 ? 'bg-slate-300 text-slate-950' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{rank}
                          </span>
                          <div>
                            <span className="font-extrabold text-white flex items-center gap-1.5">
                              {entry.name} {entry.isCurrentPlayer && <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded font-sans">VOUS</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">{entry.className} • {entry.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <span className="font-extrabold text-cyan-400">{entry.wpm} MPM</span>
                          <span className="font-extrabold text-amber-400 min-w-[60px] text-right">{entry.score} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-purple-500 hover:from-amber-300 hover:to-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto"
                >
                  <Play size={18} /> {gameState === 'gameover' ? 'Recommencer le Défi Flash (30s)' : 'Lancer le Défi Flash (30s)'}
                </button>
              </div>
            </div>
          )}

          {/* Idle / Gameover Screens for standard games */}
          {gameState !== 'playing' && activeGame !== 'flash' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xl">
                {activeGame === 'asteroids' ? '🚀' : activeGame === 'runner' ? '🏃' : '🥷'}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {gameState === 'gameover' ? 'Partie Terminée !' : 'Prêt à Jouer ?'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {activeGame === 'asteroids' && 'Saisissez les mots des astéroïdes avant qu\'ils ne touchent le sol !'}
                  {activeGame === 'runner' && 'Saisissez les mots d\'obstacles pour faire sauter le coureur !'}
                  {activeGame === 'ninja' && 'Frappez les touches cibles au clavier avant la fin du chrono !'}
                </p>
              </div>

              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 mx-auto"
              >
                <Play size={18} /> {gameState === 'gameover' ? 'Rejouer une Partie' : 'Démarrer le Jeu'}
              </button>
            </div>
          )}
        </div>

        {/* Input area for Asteroids, Runner, and Flash */}
        {gameState === 'playing' && activeGame !== 'ninja' && (
          <div className="max-w-md mx-auto w-full space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={activeGame === 'flash' ? flashTypedInput : typedInput}
              onChange={
                activeGame === 'asteroids'
                  ? handleAsteroidInput
                  : activeGame === 'runner'
                  ? handleRunnerInput
                  : handleFlashInput
              }
              placeholder={activeGame === 'flash' ? 'TAPERA PHRASE EN VITESSE...' : 'Saisissez le mot cible ici...'}
              className="w-full bg-slate-950 border-2 border-purple-500 text-white font-mono p-3 rounded-xl text-center text-sm uppercase font-bold focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};
