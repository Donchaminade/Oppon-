import React from 'react';
import { Finger } from '../types';
import { FINGER_DETAILS } from '../data/keyboard';

interface HandsGuideProps {
  activeFinger: Finger;
}

export const HandsGuide: React.FC<HandsGuideProps> = ({ activeFinger }) => {
  const fingerInfo = FINGER_DETAILS[activeFinger] || FINGER_DETAILS.L_INDEX;

  const isFingerActive = (f: Finger) => f === activeFinger;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖐️</span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guide des Doigts</div>
            <div className="text-sm font-bold text-slate-200">
              Utilisez : <span style={{ color: fingerInfo.color }}>{fingerInfo.name}</span>
            </div>
          </div>
        </div>

        {/* Active finger badge */}
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md animate-pulse"
          style={{
            backgroundColor: `${fingerInfo.color}25`,
            color: fingerInfo.color,
            border: `1px solid ${fingerInfo.color}`
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fingerInfo.color }} />
          {fingerInfo.hand === 'left' ? 'Main Gauche' : 'Main Droite'}
        </div>
      </div>

      {/* Visual Hands Layout */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-2">
        {/* LEFT HAND */}
        <div className="flex flex-col items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          <div className="text-xs font-medium text-slate-400 mb-2">Main Gauche</div>
          <div className="flex items-end gap-1.5 h-24 pt-2">
            {/* L_PINKY */}
            <div
              className={`w-4 h-12 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('L_PINKY') ? 'ring-2 ring-pink-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.L_PINKY.color }}
              title="Auriculaire gauche"
            >
              {isFingerActive('L_PINKY') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* L_RING */}
            <div
              className={`w-4 h-16 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('L_RING') ? 'ring-2 ring-purple-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.L_RING.color }}
              title="Annulaire gauche"
            >
              {isFingerActive('L_RING') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* L_MIDDLE */}
            <div
              className={`w-4 h-20 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('L_MIDDLE') ? 'ring-2 ring-blue-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.L_MIDDLE.color }}
              title="Majeur gauche"
            >
              {isFingerActive('L_MIDDLE') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* L_INDEX */}
            <div
              className={`w-4.5 h-16 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('L_INDEX') ? 'ring-2 ring-cyan-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.L_INDEX.color }}
              title="Index gauche (touche F)"
            >
              {isFingerActive('L_INDEX') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* THUMB (Left) */}
            <div
              className={`w-5 h-10 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('THUMB') ? 'ring-2 ring-slate-300 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.THUMB.color }}
              title="Pouce (Barre d'espace)"
            >
              {isFingerActive('THUMB') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>
          </div>
          <div className="w-20 h-8 bg-slate-800/80 rounded-b-xl mt-1 border-t border-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
            Paume G.
          </div>
        </div>

        {/* RIGHT HAND */}
        <div className="flex flex-col items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          <div className="text-xs font-medium text-slate-400 mb-2">Main Droite</div>
          <div className="flex items-end gap-1.5 h-24 pt-2">
            {/* THUMB (Right) */}
            <div
              className={`w-5 h-10 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('THUMB') ? 'ring-2 ring-slate-300 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.THUMB.color }}
              title="Pouce (Barre d'espace)"
            >
              {isFingerActive('THUMB') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* R_INDEX */}
            <div
              className={`w-4.5 h-16 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('R_INDEX') ? 'ring-2 ring-emerald-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.R_INDEX.color }}
              title="Index droit (touche J)"
            >
              {isFingerActive('R_INDEX') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* R_MIDDLE */}
            <div
              className={`w-4 h-20 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('R_MIDDLE') ? 'ring-2 ring-amber-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.R_MIDDLE.color }}
              title="Majeur droit"
            >
              {isFingerActive('R_MIDDLE') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* R_RING */}
            <div
              className={`w-4 h-16 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('R_RING') ? 'ring-2 ring-orange-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.R_RING.color }}
              title="Annulaire droit"
            >
              {isFingerActive('R_RING') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>

            {/* R_PINKY */}
            <div
              className={`w-4 h-12 rounded-t-full transition-all flex flex-col items-center justify-end pb-1 ${
                isFingerActive('R_PINKY') ? 'ring-2 ring-rose-400 scale-110 -translate-y-1' : 'opacity-60'
              }`}
              style={{ backgroundColor: FINGER_DETAILS.R_PINKY.color }}
              title="Auriculaire droit"
            >
              {isFingerActive('R_PINKY') && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
            </div>
          </div>
          <div className="w-20 h-8 bg-slate-800/80 rounded-b-xl mt-1 border-t border-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
            Paume D.
          </div>
        </div>
      </div>
    </div>
  );
};
