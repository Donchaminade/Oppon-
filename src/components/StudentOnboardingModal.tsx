import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Gamepad2, BarChart3, CheckCircle2, ArrowRight, ArrowLeft, X, Keyboard, Trophy, Flame } from 'lucide-react';
import { TabType } from './Navbar';

interface StudentOnboardingModalProps {
  onClose: () => void;
  onNavigateToTab?: (tab: TabType) => void;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({ onClose, onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur Opponè ! ⚡",
      badge: "Démarrage Rapide",
      icon: <Keyboard className="w-12 h-12 text-cyan-400" />,
      color: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/40",
      description: "Apprenez à taper sur clavier AZERTY à vitesse grand V sans regarder vos doigts ! Suivez ce guide rapide pour découvrir vos espaces d'entraînement.",
      highlights: [
        { icon: "⌨️", text: "Positionnement idéal des 10 doigts sur la ligne de base" },
        { icon: "🎯", text: "Rétroaction sonore mécanique & Clavier visuel réactif" },
        { icon: "🏆", text: "Suivi des performances et badges d'excellence" }
      ],
      actionText: "Commencer la visite",
      tabToNavigate: null as TabType | null
    },
    {
      title: "1. Le Cours & Les Exercices 📚",
      badge: "Apprentissage Guidé",
      icon: <BookOpen className="w-12 h-12 text-emerald-400" />,
      color: "from-emerald-500/20 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/40",
      description: "Des leçons progressives classées par niveau (Ligne de base, Touches supérieures/inférieures, Chiffres, Symboles). Entraînez-vous à votre rythme !",
      highlights: [
        { icon: "🖐️", text: "Guide visuel des mains en temps réel" },
        { icon: "⭐", text: "Système de notation sur 3 étoiles par leçon" },
        { icon: "✍️", text: "Créateur d'exercices sur-mesure disponible" }
      ],
      actionText: "Aller aux Cours",
      tabToNavigate: 'courses' as TabType
    },
    {
      title: "2. L'Espace Gaming Dactylo 🎮",
      badge: "Mini-Jeux Réflexes",
      icon: <Gamepad2 className="w-12 h-12 text-amber-400" />,
      color: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/40",
      description: "Testez vos réflexes et votre vitesse en vous amusant avec nos 4 mini-jeux rétro arcade !",
      highlights: [
        { icon: "🚀", text: "Asteroids Dactylo : Détruisez les météores par la frappe" },
        { icon: "🏃", text: "Runner Clavier & 🥷 Ninja Touches : Agilité maximale" },
        { icon: "⚡", text: "Défi Flash 30s : Grimpez au sommet du classement de classe" }
      ],
      actionText: "Découvrir le Gaming",
      tabToNavigate: 'gaming' as TabType
    },
    {
      title: "3. Statistiques & Trophées 📊",
      badge: "Analyse & Progression",
      icon: <BarChart3 className="w-12 h-12 text-purple-400" />,
      color: "from-purple-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-500/40",
      description: "Mesurez vos progrès en direct : Mots Par Minute (WPM), précision %, historique des sessions et analyse des erreurs de touches.",
      highlights: [
        { icon: "📈", text: "Graphiques d'évolution WPM & Précision %" },
        { icon: "🥇", text: "Collection de badges à débloquer au fil de vos exploits" },
        { icon: "🔍", text: "Carte thermique des touches fréquemment manquées" }
      ],
      actionText: "Voir mes Stats",
      tabToNavigate: 'stats' as TabType
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('typemaster_onboarding_completed', 'true');
    if (current.tabToNavigate && onNavigateToTab) {
      onNavigateToTab(current.tabToNavigate);
    }
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('typemaster_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-slate-900 border-2 ${current.borderColor} w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden`}
      >
        {/* Glow Header Background */}
        <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${current.color} pointer-events-none`} />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between relative z-10">
          <span className="px-3 py-1 bg-slate-800/90 border border-slate-700/80 rounded-full text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            {current.badge} ({currentStep + 1} / {steps.length})
          </span>

          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg"
          >
            <span>Passer le guide</span>
            <X size={14} />
          </button>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 relative z-10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner">
                {current.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{current.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{current.description}</p>
              </div>
            </div>

            {/* Highlights bullet list */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-2.5 shadow-inner">
              {current.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <span className="text-base shrink-0 leading-none">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots & Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 relative z-10">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-cyan-400' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={15} /> Précédent
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? "C'est Parti !" : "Suivant"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
