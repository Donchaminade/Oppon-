import React, { useState } from 'react';
import { UserStats, TypingSessionResult } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, TrendingUp, BarChart2, Activity, Keyboard, Calendar, Download, RefreshCw, Sparkles, Lock, CheckCircle2, Filter, Info, X } from 'lucide-react';
import { evaluateAllBadges, EvaluatedBadge } from '../data/badges';

interface StatsDashboardProps {
  stats: UserStats;
  onClearStats: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, onClearStats }) => {
  const [selectedSession, setSelectedSession] = useState<TypingSessionResult | null>(null);
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<string>('all');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [inspectedBadge, setInspectedBadge] = useState<EvaluatedBadge | null>(null);

  // Evaluate all badges with real-time user stats
  const evaluatedBadges = evaluateAllBadges(stats);
  const unlockedCount = evaluatedBadges.filter((b) => b.isUnlocked).length;
  const totalBadges = evaluatedBadges.length;
  const overallPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Filtered badges
  const filteredBadges = evaluatedBadges.filter((item) => {
    if (badgeCategoryFilter !== 'all' && item.badge.category !== badgeCategoryFilter) {
      return false;
    }
    if (badgeStatusFilter === 'unlocked' && !item.isUnlocked) return false;
    if (badgeStatusFilter === 'locked' && item.isUnlocked) return false;
    return true;
  });

  // Prepare WPM history graph data
  const chartData = stats.sessionHistory.map((s, idx) => ({
    session: `#${idx + 1}`,
    date: s.date,
    wpm: s.wpm,
    accuracy: s.accuracy,
    title: s.title
  }));

  // Find worst error key
  const sortedErrors = (Object.entries(stats.keyErrors) as [string, { total: number; errors: number }][])
    .sort((a, b) => b[1].errors - a[1].errors)
    .slice(0, 5);

  // Generate downloadable certificate text/data
  const handleDownloadCertificate = () => {
    const certWindow = window.open('', '_blank');
    if (!certWindow) return;

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificat Opponè</title>
        <style>
          body { font-family: 'Georgia', serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .cert { border: 8px double #06b6d4; padding: 40px; border-radius: 20px; text-align: center; max-width: 650px; background: #1e293b; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; font-size: 36px; margin-bottom: 10px; }
          h2 { font-size: 24px; color: #34d399; margin: 20px 0; }
          .stat { font-size: 28px; font-weight: bold; color: #f59e0b; margin: 10px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="cert">
          <h1>🏆 OPPONÈ DACTYLOGRAPHIE</h1>
          <p>CERTIFICAT OFFICIEL DE PERFORMANCE DACTYLOGRAPHIQUE</p>
          <hr style="border-color: #334155; margin: 20px 0;" />
          <p>Ce certificat atteste que l'utilisateur a atteint une vitesse maximale de :</p>
          <div class="stat">${stats.bestWpm} WPM (Mots Par Minute)</div>
          <p>Avec une précision moyenne de <strong>${stats.averageAccuracy}%</strong> sur ${stats.totalTests} exercices complétés.</p>
          <p>Nombre de Badges de Performance Débloqués : <strong>${unlockedCount} / ${totalBadges}</strong></p>
          <div class="footer">Délivré le ${new Date().toLocaleDateString('fr-FR')} — Opponè Classroom PWA</div>
        </div>
      </body>
      </html>
    `);
    certWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Meilleur WPM</div>
            <div className="text-2xl font-black text-white font-mono">{stats.bestWpm} <span className="text-xs font-normal text-slate-400">WPM</span></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">WPM Moyen</div>
            <div className="text-2xl font-black text-white font-mono">{stats.averageWpm} <span className="text-xs font-normal text-slate-400">WPM</span></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center">
            <BarChart2 size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Précision Moy.</div>
            <div className="text-2xl font-black text-white font-mono">{stats.averageAccuracy}%</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Badges Débloqués</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{unlockedCount} <span className="text-xs font-normal text-slate-400">/ {totalBadges}</span></div>
          </div>
        </div>
      </div>

      {/* Badges Showcase Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award size={24} className="text-amber-400" />
              <h3 className="text-xl font-extrabold text-white">Badges de Performance & Trophées</h3>
            </div>
            <p className="text-xs text-slate-400">
              Débloquez des distinctions basées sur votre vitesse (ex: 80 WPM), votre précision (10 tests à 100%) et votre régularité.
            </p>
          </div>

          {/* Overall Badges Progress Bar */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> Progression Globale
              </span>
              <span className="font-extrabold text-amber-400 font-mono">{unlockedCount}/{totalBadges} ({overallPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Filter size={14} /> Catégorie :
            </span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'speed', label: '⚡ Vitesse' },
              { id: 'accuracy', label: '🎯 Précision' },
              { id: 'volume', label: '⌨️ Volume' },
              { id: 'courses', label: '📚 Cours' },
              { id: 'multiplayer', label: '🏆 Multijoueur' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setBadgeCategoryFilter(cat.id)}
                className={`
                  px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap
                  ${badgeCategoryFilter === cat.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'}
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setBadgeStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${badgeStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Tous ({totalBadges})
            </button>
            <button
              onClick={() => setBadgeStatusFilter('unlocked')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${badgeStatusFilter === 'unlocked' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
            >
              Débloqués ({unlockedCount})
            </button>
            <button
              onClick={() => setBadgeStatusFilter('locked')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${badgeStatusFilter === 'locked' ? 'bg-slate-800 text-slate-300' : 'text-slate-400'}`}
            >
              En cours ({totalBadges - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((item) => (
            <div
              key={item.badge.id}
              onClick={() => setInspectedBadge(item)}
              className={`
                p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 group hover:scale-[1.02]
                ${item.isUnlocked
                  ? 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-80'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110
                      ${item.isUnlocked
                        ? 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-400/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 border border-slate-800 grayscale'}
                    `}
                  >
                    {item.badge.icon}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      {item.badge.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.badge.category === 'speed' ? '⚡ Vitesse' : item.badge.category === 'accuracy' ? '🎯 Précision' : item.badge.category === 'volume' ? '⌨️ Volume' : item.badge.category === 'courses' ? '📚 Cours' : '🏆 Multijoueur'}
                    </span>
                  </div>
                </div>

                {item.isUnlocked ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-lg flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={12} /> Débloqué
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-bold rounded-lg flex items-center gap-1 shrink-0">
                    <Lock size={12} /> Verrouillé
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                {item.badge.description}
              </p>

              {/* Progress Bar & Value */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-slate-400">Progression</span>
                  <span className={item.isUnlocked ? 'text-amber-400' : 'text-slate-300'}>
                    {item.current} / {item.max} {item.badge.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${item.isUnlocked ? 'bg-amber-400' : 'bg-cyan-500/60'}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" /> Évolution de la Vitesse (WPM)
            </h3>
            <p className="text-xs text-slate-400">Progression de votre vitesse de frappe au fil de vos sessions.</p>
          </div>

          <button
            onClick={handleDownloadCertificate}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Download size={16} /> Telecharger Certificat
          </button>
        </div>

        <div className="h-64 w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="session" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="wpm" name="Vitesse (WPM)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="accuracy" name="Précision (%)" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Aucune donnée de session enregistrée pour l'instant. Complétez des exercices pour voir votre graphique !
            </div>
          )}
        </div>
      </div>

      {/* Errors & Key Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Keyboard size={18} className="text-rose-400" /> Touches à travailler (Fréquence d'erreur)
        </h3>

        {sortedErrors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sortedErrors.map(([key, data]) => (
              <div key={key} className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold rounded-lg flex items-center justify-center uppercase">
                    {key === ' ' ? 'Espace' : key}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">Touche '{key}'</span>
                </div>
                <span className="text-xs font-bold text-rose-400 font-mono">{data.errors} erreurs</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-6 text-center">
            Excellente précision ! Aucune touche problème détectée.
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" /> Historique des Sessions
          </h3>

          <button
            onClick={onClearStats}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
          >
            <RefreshCw size={12} /> Réinitialiser l'historique
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans font-semibold">
                <th className="pb-3">Date</th>
                <th className="pb-3">Exercice</th>
                <th className="pb-3">Vitesse</th>
                <th className="pb-3">Précision</th>
                <th className="pb-3">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.sessionHistory.length > 0 ? (
                stats.sessionHistory.slice(-10).reverse().map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-400">{session.date}</td>
                    <td className="py-3 font-bold text-white font-sans">{session.title}</td>
                    <td className="py-3 text-cyan-400 font-bold">{session.wpm} WPM</td>
                    <td className="py-3 text-emerald-400 font-bold">{session.accuracy}%</td>
                    <td className="py-3 text-slate-300">{session.timeSeconds}s</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                    Aucun historique de session disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge Detail Inspection Modal */}
      {inspectedBadge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setInspectedBadge(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-3">
              <div
                className={`
                  w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl
                  ${inspectedBadge.isUnlocked
                    ? 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
                    : 'bg-slate-950 border border-slate-800 grayscale text-slate-600'}
                `}
              >
                {inspectedBadge.badge.icon}
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Badge {inspectedBadge.badge.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{inspectedBadge.badge.title}</h3>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Objectif du Badge :</span>
                <p className="text-slate-200 font-medium leading-relaxed">{inspectedBadge.badge.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Progression :</span>
                  <span className={inspectedBadge.isUnlocked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {inspectedBadge.current} / {inspectedBadge.max} {inspectedBadge.badge.unit} ({inspectedBadge.percent}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all rounded-full ${inspectedBadge.isUnlocked ? 'bg-emerald-400' : 'bg-amber-500'}`}
                    style={{ width: `${inspectedBadge.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <Info size={16} className="text-cyan-400 shrink-0" />
              <span>
                {inspectedBadge.isUnlocked
                  ? 'Félicitations ! Vous possédez officiellement ce badge.'
                  : 'Conseil : Répétez les exercices dans l\'onglet "Cours" ou "Exercices" pour atteindre cet objectif.'}
              </span>
            </div>

            <button
              onClick={() => setInspectedBadge(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

