import React from 'react';
import { AppSettings, KeyboardLayout } from '../types';
import { X, Volume2, VolumeX, Keyboard, Eye, Type, Sliders } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders size={20} className="text-cyan-400" /> Options & Préférences
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Keyboard Layout */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Keyboard size={16} className="text-cyan-400" /> Disposition du Clavier :
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['AZERTY', 'QWERTY'] as KeyboardLayout[]).map((layout) => (
              <button
                key={layout}
                onClick={() => onUpdateSettings({ layout })}
                className={`
                  py-2.5 px-3 rounded-xl border text-xs font-bold transition-all
                  ${settings.layout === layout
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}
                `}
              >
                {layout}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            {settings.soundEnabled ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} className="text-slate-500" />} Effets Sonores Général :
          </label>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`
              w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between
              ${settings.soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'}
            `}
          >
            <span>Audio général (clics, succès, erreurs)</span>
            <span>{settings.soundEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Keyboard size={16} className="text-purple-400" /> Bruit de Clic Mécanique (Gaming)
            </span>
            <input
              type="checkbox"
              checked={settings.mechanicalSoundEnabled !== false}
              onChange={(e) => onUpdateSettings({ mechanicalSoundEnabled: e.target.checked })}
              className="accent-purple-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Display Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" /> Afficher le Clavier Visuel
            </span>
            <input
              type="checkbox"
              checked={settings.showKeyboard}
              onChange={(e) => onUpdateSettings({ showKeyboard: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" /> Afficher le Guide des Doigts (Mains)
            </span>
            <input
              type="checkbox"
              checked={settings.showHands}
              onChange={(e) => onUpdateSettings({ showHands: e.target.checked })}
              className="accent-cyan-500 w-4 h-4"
            />
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Type size={16} className="text-cyan-400" /> Taille de la Police d'Exercice :
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`
                  py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all
                  ${settings.fontSize === size
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'}
                `}
              >
                {size === 'normal' ? 'Normal' : size === 'large' ? 'Grand' : 'Très Grand'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
        >
          Fermer et Appliquer
        </button>
      </div>
    </div>
  );
};
