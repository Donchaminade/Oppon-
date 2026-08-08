import React, { useState } from 'react';
import { AppSettings, TypingSessionResult } from '../types';
import { TypingCanvas } from './TypingCanvas';
import { Sliders, Sparkles, FileText, Code, Target, BookOpen, GraduationCap, Shuffle, Check } from 'lucide-react';
import { COLLEGE_DICTIONARY_TEXTS, DictionaryTextItem } from '../data/frenchDictionaryTexts';

interface CustomExerciseBuilderProps {
  settings: AppSettings;
  onComplete: (result: TypingSessionResult) => void;
}

const PRESET_TEXTS = [
  {
    category: 'Citations',
    icon: '💬',
    items: [
      {
        title: 'L\'apprentissage de la vitesse',
        text: 'La vitesse n\'est pas le but premier de la dactylographie. La régularité du rythme et la précision absolue des gestes amènent naturellement une grande rapidité.'
      },
      {
        title: 'La persévérance',
        text: 'Chaque jour quelques minutes d\'entraînement valent mieux qu\'une longue session hebdomadaire. Vos dix doigts méritent un apprentissage doux et méthodique.'
      }
    ]
  },
  {
    category: 'Code & Informatique',
    icon: '💻',
    items: [
      {
        title: 'Algorithme JavaScript',
        text: 'function calculateSpeed(chars, seconds) { const wpm = Math.round((chars / 5) / (seconds / 60)); return wpm; }'
      },
      {
        title: 'Structure HTML & CSS',
        text: '<div class="typing-container"><h1 class="text-2xl font-bold">Opponè</h1><p>Practice daily</p></div>'
      }
    ]
  },
  {
    category: 'Dactylographie Ciblée',
    icon: '🎯',
    items: [
      {
        title: 'Drill Nombres & Symboles',
        text: 'Prix: 19.99€ (-20% de remise). Contact: info@oppone.app | Tel: 01-42-68-55-90. Ref #2026-X8.'
      },
      {
        title: 'Drill Rangée Centrale (Home Row)',
        text: 'fds jkl fds jkl qsd fgh jkl mfd sjk lqf dsg hjk sal fsa gal flash'
      }
    ]
  }
];

export const CustomExerciseBuilder: React.FC<CustomExerciseBuilderProps> = ({
  settings,
  onComplete
}) => {
  const [selectedTitle, setSelectedTitle] = useState('Texte Personnalisé');
  const [customText, setCustomText] = useState(
    'Saisissez ou collez ici votre propre texte pour vous entraîner avec Opponè et mesurer votre vitesse de frappe.'
  );
  const [targetWpm, setTargetWpm] = useState(40);
  const [minAccuracy, setMinAccuracy] = useState(95);
  const [isPracticing, setIsPracticing] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | '6ème' | '5ème' | '4ème' | '3ème'>('ALL');

  const handleSelectPreset = (title: string, text: string, recommendedWpm?: number) => {
    setSelectedTitle(title);
    setCustomText(text);
    if (recommendedWpm) {
      setTargetWpm(recommendedWpm);
    }
  };

  const handleRandomDictionaryText = () => {
    const available = COLLEGE_DICTIONARY_TEXTS.filter(
      (item) => selectedGradeFilter === 'ALL' || item.grade === selectedGradeFilter
    );
    if (available.length === 0) return;
    const randomItem = available[Math.floor(Math.random() * available.length)];
    handleSelectPreset(`[${randomItem.grade}] ${randomItem.title}`, randomItem.text, randomItem.targetWpm);
  };

  const filteredDictionaryTexts = COLLEGE_DICTIONARY_TEXTS.filter(
    (item) => selectedGradeFilter === 'ALL' || item.grade === selectedGradeFilter
  );

  if (isPracticing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm font-semibold text-slate-300">Exercice Personnalisé en cours</div>
          <button
            onClick={() => setIsPracticing(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg transition-all"
          >
            ← Modifier la configuration
          </button>
        </div>

        <TypingCanvas
          title={selectedTitle}
          targetText={customText}
          settings={settings}
          mode="custom"
          targetWpm={targetWpm}
          minAccuracy={minAccuracy}
          onComplete={onComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/20 p-6 sm:p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Sliders className="text-cyan-400" size={28} />
          Exercice Personnalisé & Entraînement Libre
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Créez votre propre séance de dactylographie sur mesure ou choisissez parmi nos thèmes spécialisés (citations, code, nombres).
        </p>
      </div>

      {/* FRENCH COLLEGE DICTIONARY PRESET SELECTOR (6ème, 5ème, 4ème, 3ème) */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] rounded-full uppercase tracking-wider">
              <GraduationCap size={13} className="text-cyan-400" /> Dictionnaire Français Niveaux Collège (6e, 5e, 4e, 3e)
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen size={22} className="text-emerald-400" /> Textes d'Entraînement Adaptés au Programme
            </h3>
            <p className="text-xs text-slate-400">
              Sélectionnez automatiquement des extraits littéraires, scientifiques et d'histoire calibrés pour chaque classe du collège.
            </p>
          </div>

          {/* Random Text Generator Button */}
          <button
            onClick={handleRandomDictionaryText}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 active:scale-95"
            title="Générer automatiquement un texte au hasard"
          >
            <Shuffle size={16} />
            <span>🎲 Tirer un texte au hasard</span>
          </button>
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Classe :</span>
          {(['ALL', '6ème', '5ème', '4ème', '3ème'] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGradeFilter(grade)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1
                ${selectedGradeFilter === grade
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {grade === 'ALL' ? 'Toutes (6e → 3e)' : grade}
            </button>
          ))}
        </div>

        {/* Grid of Dictionary Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredDictionaryTexts.map((item) => {
            const isSelected = selectedTitle === `[${item.grade}] ${item.title}` || selectedTitle === item.title;

            const difficultyColors = {
              'Débutant': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              'Intermédiaire': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
              'Avancé': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              'Expert': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            }[item.difficulty];

            return (
              <button
                key={item.id}
                onClick={() => handleSelectPreset(`[${item.grade}] ${item.title}`, item.text, item.targetWpm)}
                className={`
                  p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative group
                  ${isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'}
                `}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono font-extrabold rounded-md">
                      {item.grade}
                    </span>
                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-md ${difficultyColors}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block font-semibold">{item.category}</span>
                  <p className="text-[11px] text-slate-300 font-mono line-clamp-3 leading-relaxed opacity-85">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-400 font-bold">
                  <span>🎯 Objectif : {item.targetWpm} WPM</span>
                  {isSelected && <Check size={14} className="text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Classic Preset Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_TEXTS.map((group) => (
          <div key={group.category} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{group.icon}</span> {group.category}
            </div>

            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSelectPreset(item.title, item.text)}
                  className={`
                    w-full text-left p-3 rounded-xl border text-xs transition-all font-medium flex flex-col gap-1
                    ${selectedTitle === item.title
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-semibold shadow-md'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
                  `}
                >
                  <span className="font-bold">{item.title}</span>
                  <span className="line-clamp-2 text-[11px] opacity-70 font-mono">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Text Area Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-cyan-400" /> Votre texte personnalisé :
          </label>
          <span className="text-xs text-slate-500">{customText.length} caractères</span>
        </div>

        <textarea
          rows={5}
          value={customText}
          onChange={(e) => {
            setSelectedTitle('Texte Personnalisé');
            setCustomText(e.target.value);
          }}
          placeholder="Collez ou saisissez votre texte ici..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all leading-relaxed"
        />

        {/* Target Goals Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
              <span>Objectif de vitesse (WPM)</span>
              <span className="text-cyan-400 font-bold font-mono">{targetWpm} WPM</span>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={targetWpm}
              onChange={(e) => setTargetWpm(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
              <span>Précision minimale demandée</span>
              <span className="text-emerald-400 font-bold font-mono">{minAccuracy}%</span>
            </div>
            <input
              type="range"
              min={80}
              max={100}
              step={1}
              value={minAccuracy}
              onChange={(e) => setMinAccuracy(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Start practice button */}
        <button
          disabled={!customText.trim()}
          onClick={() => setIsPracticing(true)}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
        >
          <Sparkles size={20} /> Lancer l'entraînement personnalisé
        </button>
      </div>
    </div>
  );
};
