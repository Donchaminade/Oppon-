import React from 'react';
import { BadgeDefinition } from '../data/badges';
import { Award, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface BadgeUnlockModalProps {
  unlockedBadges: BadgeDefinition[];
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ unlockedBadges, onClose }) => {
  if (!unlockedBadges || unlockedBadges.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glowing Background Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin text-amber-400" /> Badge Débloqué !
          </div>
          <h3 className="text-2xl font-black text-white">Félicitations Dactylo !</h3>
          <p className="text-xs text-slate-400">
            {unlockedBadges.length > 1
              ? `Vous avez débloqué ${unlockedBadges.length} nouveaux badges grâce à vos performances !`
              : 'Vous avez débloqué un nouveau succès en atteignant un palier de performance !'}
          </p>
        </div>

        {/* Badges List */}
        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {unlockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-4 text-left shadow-lg relative group"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-2 border-amber-400/60 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce">
                {badge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white truncate">{badge.title}</h4>
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">{badge.description}</p>
                <div className="mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Award size={12} /> Objectif Atteint ({badge.targetValue} {badge.unit})
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02]"
        >
          Super ! Continuer l'Entraînement
        </button>
      </div>
    </div>
  );
};
