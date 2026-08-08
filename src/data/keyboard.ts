import { Finger, FingerInfo, KeyboardLayout } from '../types';

export const FINGER_DETAILS: Record<Finger, FingerInfo> = {
  L_PINKY: {
    id: 'L_PINKY',
    name: 'Auriculaire gauche',
    hand: 'left',
    color: '#ec4899', // pink-500
    highlightClass: 'bg-pink-500 text-white shadow-pink-500/50',
    bgLight: 'bg-pink-500/20 text-pink-300 border-pink-500/40'
  },
  L_RING: {
    id: 'L_RING',
    name: 'Annulaire gauche',
    hand: 'left',
    color: '#a855f7', // purple-500
    highlightClass: 'bg-purple-500 text-white shadow-purple-500/50',
    bgLight: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  L_MIDDLE: {
    id: 'L_MIDDLE',
    name: 'Majeur gauche',
    hand: 'left',
    color: '#3b82f6', // blue-500
    highlightClass: 'bg-blue-500 text-white shadow-blue-500/50',
    bgLight: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  L_INDEX: {
    id: 'L_INDEX',
    name: 'Index gauche',
    hand: 'left',
    color: '#06b6d4', // cyan-500
    highlightClass: 'bg-cyan-500 text-slate-950 shadow-cyan-500/50 font-bold',
    bgLight: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  THUMB: {
    id: 'THUMB',
    name: 'Pouces',
    hand: 'left',
    color: '#64748b', // slate-500
    highlightClass: 'bg-slate-400 text-slate-950 shadow-slate-400/50',
    bgLight: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  },
  R_INDEX: {
    id: 'R_INDEX',
    name: 'Index droit',
    hand: 'right',
    color: '#10b981', // emerald-500
    highlightClass: 'bg-emerald-500 text-slate-950 shadow-emerald-500/50 font-bold',
    bgLight: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  R_MIDDLE: {
    id: 'R_MIDDLE',
    name: 'Majeur droit',
    hand: 'right',
    color: '#f59e0b', // amber-500
    highlightClass: 'bg-amber-500 text-slate-950 shadow-amber-500/50',
    bgLight: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  R_RING: {
    id: 'R_RING',
    name: 'Annulaire droit',
    hand: 'right',
    color: '#f97316', // orange-500
    highlightClass: 'bg-orange-500 text-white shadow-orange-500/50',
    bgLight: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
  },
  R_PINKY: {
    id: 'R_PINKY',
    name: 'Auriculaire droit',
    hand: 'right',
    color: '#f43f5e', // rose-500
    highlightClass: 'bg-rose-500 text-white shadow-rose-500/50',
    bgLight: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  }
};

export interface KeyCap {
  code: string;
  label: string;
  shiftLabel?: string;
  finger: Finger;
  width?: string; // CSS width multiplier e.g. w-12, w-16
}

export const AZERTY_ROWS: KeyCap[][] = [
  // Number row
  [
    { code: 'Backquote', label: '²', finger: 'L_PINKY' },
    { code: 'Digit1', label: '&', shiftLabel: '1', finger: 'L_PINKY' },
    { code: 'Digit2', label: 'é', shiftLabel: '2', finger: 'L_RING' },
    { code: 'Digit3', label: '"', shiftLabel: '3', finger: 'L_MIDDLE' },
    { code: 'Digit4', label: "'", shiftLabel: '4', finger: 'L_INDEX' },
    { code: 'Digit5', label: '(', shiftLabel: '5', finger: 'L_INDEX' },
    { code: 'Digit6', label: '-', shiftLabel: '6', finger: 'R_INDEX' },
    { code: 'Digit7', label: 'è', shiftLabel: '7', finger: 'R_INDEX' },
    { code: 'Digit8', label: '_', shiftLabel: '8', finger: 'R_MIDDLE' },
    { code: 'Digit9', label: 'ç', shiftLabel: '9', finger: 'R_RING' },
    { code: 'Digit0', label: 'à', shiftLabel: '0', finger: 'R_PINKY' },
    { code: 'Minus', label: ')', shiftLabel: '°', finger: 'R_PINKY' },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 'R_PINKY' },
    { code: 'Backspace', label: '⌫ Effacer', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  // Top row
  [
    { code: 'Tab', label: '⇥ Tab', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 'L_PINKY' },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 'L_RING' },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 'L_MIDDLE' },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 'L_INDEX' },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 'L_INDEX' },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 'R_INDEX' },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 'R_INDEX' },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 'R_MIDDLE' },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 'R_RING' },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 'R_PINKY' },
    { code: 'BracketLeft', label: '^', shiftLabel: '¨', finger: 'R_PINKY' },
    { code: 'BracketRight', label: '$', shiftLabel: '£', finger: 'R_PINKY' }
  ],
  // Home row (guide keys f & j)
  [
    { code: 'CapsLock', label: '⇪ Maj', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 'L_PINKY' },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 'L_RING' },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 'L_MIDDLE' },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 'L_INDEX' }, // Repère !
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 'L_INDEX' },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 'R_INDEX' },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 'R_INDEX' }, // Repère !
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 'R_MIDDLE' },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 'R_RING' },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 'R_PINKY' },
    { code: 'Semicolon', label: 'ù', shiftLabel: '%', finger: 'R_PINKY' },
    { code: 'Quote', label: '*', shiftLabel: 'µ', finger: 'R_PINKY' },
    { code: 'Enter', label: '↵ Entrée', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  // Bottom row
  [
    { code: 'ShiftLeft', label: '⇧ Shift', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'IntlBackslash', label: '<', shiftLabel: '>', finger: 'L_PINKY' },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 'L_RING' },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 'L_MIDDLE' },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 'L_INDEX' },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 'L_INDEX' },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 'R_INDEX' },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 'R_INDEX' },
    { code: 'Comma', label: ',', shiftLabel: '?', finger: 'R_MIDDLE' },
    { code: 'Period', label: ';', shiftLabel: '.', finger: 'R_RING' },
    { code: 'Slash', label: ':', shiftLabel: '/', finger: 'R_PINKY' },
    { code: 'Backslash', label: '!', shiftLabel: '§', finger: 'R_PINKY' },
    { code: 'ShiftRight', label: '⇧ Shift', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  // Space row
  [
    { code: 'Space', label: 'Espace', finger: 'THUMB', width: 'col-span-12' }
  ]
];

export const QWERTY_ROWS: KeyCap[][] = [
  [
    { code: 'Backquote', label: '`', shiftLabel: '~', finger: 'L_PINKY' },
    { code: 'Digit1', label: '1', shiftLabel: '!', finger: 'L_PINKY' },
    { code: 'Digit2', label: '2', shiftLabel: '@', finger: 'L_RING' },
    { code: 'Digit3', label: '3', shiftLabel: '#', finger: 'L_MIDDLE' },
    { code: 'Digit4', label: '4', shiftLabel: '$', finger: 'L_INDEX' },
    { code: 'Digit5', label: '5', shiftLabel: '%', finger: 'L_INDEX' },
    { code: 'Digit6', label: '6', shiftLabel: '^', finger: 'R_INDEX' },
    { code: 'Digit7', label: '7', shiftLabel: '&', finger: 'R_INDEX' },
    { code: 'Digit8', label: '8', shiftLabel: '*', finger: 'R_MIDDLE' },
    { code: 'Digit9', label: '9', shiftLabel: '(', finger: 'R_RING' },
    { code: 'Digit0', label: '0', shiftLabel: ')', finger: 'R_PINKY' },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: 'R_PINKY' },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 'R_PINKY' },
    { code: 'Backspace', label: '⌫ Effacer', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  [
    { code: 'Tab', label: '⇥ Tab', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 'L_PINKY' },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 'L_RING' },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 'L_MIDDLE' },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 'L_INDEX' },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 'L_INDEX' },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 'R_INDEX' },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 'R_INDEX' },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 'R_MIDDLE' },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 'R_RING' },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 'R_PINKY' },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', finger: 'R_PINKY' },
    { code: 'BracketRight', label: ']', shiftLabel: '}', finger: 'R_PINKY' }
  ],
  [
    { code: 'CapsLock', label: '⇪ Maj', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 'L_PINKY' },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 'L_RING' },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 'L_MIDDLE' },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 'L_INDEX' },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 'L_INDEX' },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 'R_INDEX' },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 'R_INDEX' },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 'R_MIDDLE' },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 'R_RING' },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: 'R_PINKY' },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: 'R_PINKY' },
    { code: 'Enter', label: '↵ Entrée', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  [
    { code: 'ShiftLeft', label: '⇧ Shift', finger: 'L_PINKY', width: 'col-span-2' },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 'L_RING' },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 'L_MIDDLE' },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 'L_INDEX' },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 'L_INDEX' },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 'R_INDEX' },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 'R_INDEX' },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 'R_MIDDLE' },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: 'R_MIDDLE' },
    { code: 'Period', label: '.', shiftLabel: '>', finger: 'R_RING' },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: 'R_PINKY' },
    { code: 'ShiftRight', label: '⇧ Shift', finger: 'R_PINKY', width: 'col-span-2' }
  ],
  [
    { code: 'Space', label: 'Space', finger: 'THUMB', width: 'col-span-12' }
  ]
];

export function getLayoutRows(layout: KeyboardLayout): KeyCap[][] {
  switch (layout) {
    case 'QWERTY':
      return QWERTY_ROWS;
    case 'AZERTY':
    default:
      return AZERTY_ROWS;
  }
}

export function getFingerForChar(char: string, layout: KeyboardLayout = 'AZERTY'): Finger {
  if (char === ' ') return 'THUMB';
  const rows = getLayoutRows(layout);
  const lowerChar = char.toLowerCase();

  for (const row of rows) {
    for (const key of row) {
      if (
        key.label.toLowerCase() === lowerChar ||
        (key.shiftLabel && key.shiftLabel.toLowerCase() === lowerChar)
      ) {
        return key.finger;
      }
    }
  }

  // Default fallback based on character
  if ('azq1&w<'.includes(lowerChar)) return 'L_PINKY';
  if ('2sxeéZ'.includes(lowerChar)) return 'L_RING';
  if ('3dcr"E'.includes(lowerChar)) return 'L_MIDDLE';
  if ('45ftgb\'(v'.includes(lowerChar)) return 'L_INDEX';
  if ('67yhn-èu'.includes(lowerChar)) return 'R_INDEX';
  if ('8ik,_j'.includes(lowerChar)) return 'R_MIDDLE';
  if ('9ol;.ç'.includes(lowerChar)) return 'R_RING';

  return 'R_PINKY';
}
