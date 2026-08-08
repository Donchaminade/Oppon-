import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminLoginModalProps {
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const validUser = username.trim().toLowerCase();
      const validPass = password.trim();

      if (
        (validUser === 'admin' || validUser === 'professeur' || validUser === 'prof') &&
        (validPass === 'admin2026' || validPass === 'password123' || validPass === 'admin')
      ) {
        sessionStorage.setItem('typemaster_admin_auth', 'true');
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setError('Identifiant ou mot de passe incorrect. Utilisez : admin / admin2026 ou professeur / password123');
      }
    }, 400);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/50 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center space-y-2 relative">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Espace Enseignant / Admin</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Accès sécurisé réservé au professeur pour piloter les sessions de classe, gérer les élèves et éditer les exercices.
          </p>
        </div>

        {/* Quick Credentials Suggestion Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Sparkles size={13} /> Identifiants de Démo (Professeur)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">3 Clés Démo</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin2026')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left text-slate-200 transition-colors group"
            >
              <div className="font-bold text-amber-300 group-hover:text-amber-200">Mode Admin</div>
              <div className="text-slate-400 text-[10px]">admin / admin2026</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('professeur', 'password123')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left text-slate-200 transition-colors group"
            >
              <div className="font-bold text-cyan-300 group-hover:text-cyan-200">Mode Professeur</div>
              <div className="text-slate-400 text-[10px]">professeur / password123</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-amber-400" /> Identifiant / Nom d'utilisateur
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin ou professeur"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl py-3 px-4 text-sm focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={14} className="text-amber-400" /> Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl py-3 px-4 text-sm focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Retour
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Vérification...</span>
              ) : (
                <>
                  <span>Connexion Espace Prof</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
