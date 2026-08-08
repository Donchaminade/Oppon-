import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Flame, Zap, Award, Search, Filter, ArrowUpDown, TrendingUp, Sparkles, BookOpen, Download, Users, ShieldCheck } from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_CLASSROOM_HISTORY } from '../data/classroomExercises';
import { ChallengeHistoryRecord } from '../types/classroom';

export interface GlobalStudentRank {
  studentId: string;
  studentName: string;
  className: string;
  avatar: string;
  historicalAvgWpm: number;
  peakWpm: number;
  avgAccuracy: number;
  totalTests: number;
  avgGrade: number;
  tier: {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  };
}

export const GlobalLeaderboard: React.FC = () => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'avgWpm' | 'peakWpm' | 'accuracy' | 'totalTests' | 'grade'>('avgWpm');

  // Load students and history from localStorage + fallback defaults
  const students = useMemo(() => {
    const saved = localStorage.getItem('typemaster_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_STUDENTS;
  }, []);

  const historyRecords: ChallengeHistoryRecord[] = useMemo(() => {
    const saved = localStorage.getItem('typemaster_classroom_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_CLASSROOM_HISTORY as ChallengeHistoryRecord[];
  }, []);

  // Compute global historical statistics per student
  const globalRanks: GlobalStudentRank[] = useMemo(() => {
    // Group all historical results by student ID or student Name
    const studentStatsMap: {
      [key: string]: {
        studentId: string;
        studentName: string;
        className: string;
        avatar: string;
        wpms: number[];
        accuracies: number[];
        grades: number[];
        peakWpm: number;
      };
    } = {};

    // First populate baseline profiles
    students.forEach((s) => {
      studentStatsMap[s.id] = {
        studentId: s.id,
        studentName: s.name,
        className: s.className || 'Général',
        avatar: s.avatar || '🎓',
        wpms: s.bestWpm ? [s.bestWpm] : [],
        accuracies: s.averageAccuracy ? [s.averageAccuracy] : [],
        grades: s.averageGrade ? [s.averageGrade] : [],
        peakWpm: s.bestWpm || 0,
      };
    });

    // Process all historical test entries
    historyRecords.forEach((rec) => {
      rec.results.forEach((r) => {
        const key = r.studentId || r.studentName;
        if (!studentStatsMap[key]) {
          studentStatsMap[key] = {
            studentId: key,
            studentName: r.studentName,
            className: r.className || 'Général',
            avatar: '⚡',
            wpms: [],
            accuracies: [],
            grades: [],
            peakWpm: 0,
          };
        }

        const entry = studentStatsMap[key];
        entry.wpms.push(r.wpm);
        entry.accuracies.push(r.accuracy);
        entry.grades.push(r.gradeNote);
        if (r.wpm > entry.peakWpm) {
          entry.peakWpm = r.wpm;
        }
      });
    });

    // Compute averages and tier assignments
    const list: GlobalStudentRank[] = Object.values(studentStatsMap).map((item) => {
      const totalTests = item.wpms.length;
      const avgWpm = totalTests > 0 ? Math.round(item.wpms.reduce((a, b) => a + b, 0) / totalTests) : 0;
      const avgAccuracy = totalTests > 0 ? Math.round(item.accuracies.reduce((a, b) => a + b, 0) / totalTests) : 0;
      const avgGrade = totalTests > 0 ? Number((item.grades.reduce((a, b) => a + b, 0) / totalTests).toFixed(1)) : 0;
      const peakWpm = Math.max(item.peakWpm, ...item.wpms, 0);

      // Determine Tier Badge based on Historical Avg WPM
      let tier = {
        label: '🌱 Apprenti',
        color: 'text-slate-300',
        bgColor: 'bg-slate-800',
        borderColor: 'border-slate-700',
        icon: '🌱'
      };

      if (avgWpm >= 80) {
        tier = {
          label: '⚡ Grand Maître',
          color: 'text-amber-300',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/50',
          icon: '👑'
        };
      } else if (avgWpm >= 65) {
        tier = {
          label: '🏆 Expert Élite',
          color: 'text-purple-300',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/50',
          icon: '🏆'
        };
      } else if (avgWpm >= 50) {
        tier = {
          label: '⭐ Dactylo Confirmé',
          color: 'text-cyan-300',
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500/50',
          icon: '⭐'
        };
      } else if (avgWpm >= 35) {
        tier = {
          label: '🚀 Intermédiaire',
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50',
          icon: '🚀'
        };
      }

      return {
        studentId: item.studentId,
        studentName: item.studentName,
        className: item.className,
        avatar: item.avatar,
        historicalAvgWpm: avgWpm,
        peakWpm,
        avgAccuracy,
        totalTests,
        avgGrade,
        tier
      };
    });

    return list;
  }, [students, historyRecords]);

  // Unique Classes list for dropdown
  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    globalRanks.forEach((r) => {
      if (r.className) classes.add(r.className);
    });
    return Array.from(classes);
  }, [globalRanks]);

  // Filtered & Sorted Ranks
  const filteredRanks = useMemo(() => {
    let result = globalRanks.filter((r) => {
      const matchClass = selectedClassFilter === 'ALL' || r.className === selectedClassFilter;
      const matchSearch =
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'avgWpm') return b.historicalAvgWpm - a.historicalAvgWpm;
      if (sortBy === 'peakWpm') return b.peakWpm - a.peakWpm;
      if (sortBy === 'accuracy') return b.avgAccuracy - a.avgAccuracy;
      if (sortBy === 'totalTests') return b.totalTests - a.totalTests;
      if (sortBy === 'grade') return b.avgGrade - a.avgGrade;
      return 0;
    });

    return result;
  }, [globalRanks, selectedClassFilter, searchQuery, sortBy]);

  // Global Key Performance Indicators
  const overallClassAvgWpm = useMemo(() => {
    if (globalRanks.length === 0) return 0;
    return Math.round(globalRanks.reduce((acc, r) => acc + r.historicalAvgWpm, 0) / globalRanks.length);
  }, [globalRanks]);

  const overallPeakWpm = useMemo(() => {
    if (globalRanks.length === 0) return 0;
    return Math.max(...globalRanks.map((r) => r.peakWpm));
  }, [globalRanks]);

  // Top 3 for Podium
  const top1 = filteredRanks[0];
  const top2 = filteredRanks[1];
  const top3 = filteredRanks[2];

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Rang,Nom,Classe,Moyenne_WPM,Record_Peak_WPM,Precision_Moy,Nombre_Tests,Note_Moyenne,Grade'];
    const rows = filteredRanks.map((r, index) =>
      `"${index + 1}","${r.studentName}","${r.className}",${r.historicalAvgWpm},${r.peakWpm},${r.avgAccuracy}%,${r.totalTests},${r.avgGrade}/20,"${r.tier.label}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classement_global_oppone_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title & Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Trophy size={14} className="text-amber-400" /> Palmarès Annuel & Historique Globale
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            🏆 Classement Général Dactylo
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consultez les performances cumulées de tous les élèves calculées sur l'ensemble des défis de classe historiques. Ce classement indépendant mesure la régularité et la vitesse moyenne sur la durée.
          </p>
        </div>

        {/* Global KPI Badges */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Moyenne Globale</span>
            <span className="text-xl font-black text-cyan-400 font-mono">{overallClassAvgWpm} WPM</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Record Absolu</span>
            <span className="text-xl font-black text-amber-400 font-mono">{overallPeakWpm} WPM</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sessions Enregistrées</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{historyRecords.length}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Élèves Classés</span>
            <span className="text-xl font-black text-purple-400 font-mono">{globalRanks.length}</span>
          </div>
        </div>
      </div>

      {/* 3D PEDESTAL PODIUM VIEW FOR TOP 3 */}
      {filteredRanks.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles size={14} /> Le Podium d'Élite Historique <Sparkles size={14} />
            </span>
            <h2 className="text-2xl font-black text-white">Les 3 Meilleurs Dactylographes de l'Établissement</h2>
          </div>

          <div className="flex items-end justify-center gap-3 sm:gap-8 pt-8 pb-4 max-w-2xl mx-auto">
            {/* 2nd Place (Silver) */}
            {top2 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center flex-1"
              >
                <div className="text-center mb-3 space-y-1">
                  <span className="text-3xl">🥈</span>
                  <div className="text-sm font-black text-white truncate max-w-[130px]">{top2.studentName}</div>
                  <span className="text-xs font-mono font-bold text-slate-400 block">{top2.className}</span>
                  <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 font-bold inline-block">
                    {top2.historicalAvgWpm} WPM moy.
                  </div>
                </div>
                <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-slate-800 via-slate-700 to-slate-500 rounded-t-2xl border-t-2 border-x-2 border-slate-300 flex flex-col items-center justify-center text-slate-950 font-black shadow-xl">
                  <span className="text-3xl font-black font-mono text-slate-100">#2</span>
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Argent</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1" />
            )}

            {/* 1st Place (Gold) */}
            {top1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center flex-1 -mt-8"
              >
                <div className="text-center mb-3 space-y-1 relative">
                  <Crown size={28} className="text-amber-400 mx-auto animate-bounce" />
                  <div className="text-base font-black text-white truncate max-w-[150px]">{top1.studentName}</div>
                  <span className="text-xs font-mono font-bold text-amber-300 block">{top1.className}</span>
                  <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-mono text-amber-300 font-black inline-block shadow-md">
                    ⚡ {top1.historicalAvgWpm} WPM moy.
                  </div>
                </div>
                <div className="w-full h-40 sm:h-48 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-2xl border-t-2 border-x-2 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-2xl shadow-amber-500/30">
                  <span className="text-4xl font-black font-mono text-slate-950">#1</span>
                  <span className="text-xs font-black text-slate-950 uppercase tracking-widest">Champion 👑</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place (Bronze) */}
            {top3 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center flex-1"
              >
                <div className="text-center mb-3 space-y-1">
                  <span className="text-3xl">🥉</span>
                  <div className="text-sm font-black text-white truncate max-w-[130px]">{top3.studentName}</div>
                  <span className="text-xs font-mono font-bold text-slate-400 block">{top3.className}</span>
                  <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 font-bold inline-block">
                    {top3.historicalAvgWpm} WPM moy.
                  </div>
                </div>
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-950 via-amber-900 to-amber-800 rounded-t-2xl border-t-2 border-x-2 border-amber-700 flex flex-col items-center justify-center text-amber-200 font-black shadow-lg">
                  <span className="text-2xl font-black font-mono text-amber-300">#3</span>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Bronze</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      )}

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 shrink-0">
            <Filter size={15} className="text-cyan-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900 text-white">Toutes les Classes</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white">{cls}</option>
              ))}
            </select>
          </div>

          {/* Sort By Metric */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 shrink-0">
            <ArrowUpDown size={15} className="text-purple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value="avgWpm" className="bg-slate-900 text-white">Trier par WPM Moyen</option>
              <option value="peakWpm" className="bg-slate-900 text-white">Trier par Record Absolu (Peak)</option>
              <option value="accuracy" className="bg-slate-900 text-white">Trier par Précision %</option>
              <option value="grade" className="bg-slate-900 text-white">Trier par Note Moyenne /20</option>
              <option value="totalTests" className="bg-slate-900 text-white">Trier par Tests Effectués</option>
            </select>
          </div>
        </div>

        {/* Search Input & CSV Export Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            title="Télécharger le palmarès au format CSV"
          >
            <Download size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* DETAILED RANKINGS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Users size={18} className="text-cyan-400" /> Tableau Général des Rangs ({filteredRanks.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Calcul basé sur {historyRecords.length} sessions historiques
          </span>
        </div>

        {filteredRanks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Moyenne WPM</th>
                  <th className="py-3 px-4">Record Peak</th>
                  <th className="py-3 px-4">Précision</th>
                  <th className="py-3 px-4">Tests</th>
                  <th className="py-3 px-4">Note Moyenne</th>
                  <th className="py-3 px-4">Titre d'Élite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRanks.map((student, index) => {
                  const rank = index + 1;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-slate-950/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isGold ? (
                          <span className="text-amber-400 font-black text-sm">🥇 #1</span>
                        ) : isSilver ? (
                          <span className="text-slate-300 font-black text-sm">🥈 #2</span>
                        ) : isBronze ? (
                          <span className="text-amber-600 font-black text-sm">🥉 #3</span>
                        ) : (
                          <span className="text-slate-500 font-bold">#{rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <span className="text-base">{student.avatar}</span>
                        <span>{student.studentName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-bold">{student.className}</td>
                      <td className="py-3.5 px-4 font-black text-cyan-400 text-sm">
                        {student.historicalAvgWpm} WPM
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-300">
                        ⚡ {student.peakWpm} WPM
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {student.avgAccuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-bold">
                        {student.totalTests} session{student.totalTests > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-400">
                        {student.avgGrade} / 20
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${student.tier.bgColor} ${student.tier.color} ${student.tier.borderColor}`}
                        >
                          {student.tier.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">
            Aucun élève trouvé selon les critères de recherche sélectionnés.
          </div>
        )}
      </div>
    </div>
  );
};
