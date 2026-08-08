import React from 'react';
import { KeyboardLayout, Finger } from '../types';
import { FINGER_DETAILS, getLayoutRows } from '../data/keyboard';

interface VirtualKeyboardProps {
  layout: KeyboardLayout;
  targetChar: string;
  lastPressedKey?: { key: string; isCorrect: boolean } | null;
  activeFinger: Finger;
  showFingerColors?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layout,
  targetChar,
  lastPressedKey,
  showFingerColors = true
}) => {
  const rows = getLayoutRows(layout);

  const normalizeChar = (c: string) => {
    if (c === ' ') return 'space';
    return c.toLowerCase();
  };

  const currentTargetNorm = normalizeChar(targetChar);

  const isKeyTarget = (label: string, shiftLabel?: string, code?: string) => {
    if (currentTargetNorm === 'space' && code === 'Space') return true;
    if (label.toLowerCase() === currentTargetNorm) return true;
    if (shiftLabel && shiftLabel.toLowerCase() === currentTargetNorm) return true;
    return false;
  };

  const isKeyPressed = (label: string, shiftLabel?: string, code?: string) => {
    if (!lastPressedKey) return null;
    const pressedNorm = normalizeChar(lastPressedKey.key);
    let matches = false;

    if (pressedNorm === 'space' && code === 'Space') matches = true;
    if (label.toLowerCase() === pressedNorm) matches = true;
    if (shiftLabel && shiftLabel.toLowerCase() === pressedNorm) matches = true;

    if (matches) {
      return lastPressedKey.isCorrect ? 'correct' : 'incorrect';
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 sm:p-5 shadow-2xl overflow-x-auto select-none">
      <div className="min-w-[640px] flex flex-col gap-1.5 sm:gap-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 sm:gap-1.5 justify-center">
            {row.map((keyCap) => {
              const target = isKeyTarget(keyCap.label, keyCap.shiftLabel, keyCap.code);
              const pressedState = isKeyPressed(keyCap.label, keyCap.shiftLabel, keyCap.code);
              const fingerInfo = FINGER_DETAILS[keyCap.finger];
              const isHomeKey = keyCap.label.toLowerCase() === 'f' || keyCap.label.toLowerCase() === 'j';

              let keyStyle = 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-750';

              if (target) {
                keyStyle = 'bg-cyan-500 text-slate-950 font-bold ring-4 ring-cyan-400/50 shadow-lg shadow-cyan-500/40 animate-pulse scale-105 z-10';
              } else if (pressedState === 'correct') {
                keyStyle = 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-400 scale-105 transition-all';
              } else if (pressedState === 'incorrect') {
                keyStyle = 'bg-rose-500 text-white font-bold ring-4 ring-rose-500/80 animate-shake scale-105';
              }

              return (
                <div
                  key={keyCap.code + keyCap.label}
                  className={`
                    relative flex flex-col items-center justify-between rounded-lg sm:rounded-xl p-1.5 sm:p-2 border transition-all duration-100 font-mono text-xs sm:text-sm font-semibold shadow-inner
                    ${keyCap.width ? keyCap.width : 'w-9 h-11 sm:w-12 sm:h-14'}
                    ${keyStyle}
                  `}
                >
                  {/* Home Key tactile bar bump for F & J */}
                  {isHomeKey && !target && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-slate-400/80 rounded-full" title="Touche repère dactylographique" />
                  )}

                  {/* Shift label (upper character) */}
                  {keyCap.shiftLabel ? (
                    <div className="flex flex-col items-center justify-center h-full leading-tight">
                      <span className="text-[10px] opacity-60 font-sans">{keyCap.shiftLabel}</span>
                      <span className="text-xs sm:text-sm font-bold">{keyCap.label}</span>
                    </div>
                  ) : (
                    <span className="my-auto flex items-center justify-center text-center font-bold">
                      {keyCap.label}
                    </span>
                  )}

                  {/* Color dot for finger guide */}
                  {showFingerColors && !target && !pressedState && (
                    <div
                      className="w-full h-1 rounded-full mt-auto opacity-70"
                      style={{ backgroundColor: fingerInfo.color }}
                      title={`Doigt: ${fingerInfo.name}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
