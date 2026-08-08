import React, { useState } from 'react';
import { BookOpen, Sliders, Trophy, BarChart3, Settings, Download, GraduationCap, ShieldCheck, Gamepad2, HelpCircle, Medal, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type TabType = 'courses' | 'custom' | 'student_arena' | 'admin_dashboard' | 'gaming' | 'multiplayer' | 'stats' | 'global_ranking';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSettings: () => void;
  onOpenOnboarding?: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenOnboarding,
  canInstallPwa,
  onInstallPwa
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'courses' as TabType, label: 'Leçons', icon: <BookOpen size={16} />, color: 'text-cyan-400', activeBg: 'bg-cyan-500 text-slate-950 font-bold' },
    { id: 'student_arena' as TabType, label: '🏫 Espace Élève', icon: <GraduationCap size={16} />, color: 'text-emerald-400', activeBg: 'bg-emerald-500 text-slate-950 font-extrabold' },
    { id: 'admin_dashboard' as TabType, label: '👑 Espace Prof', icon: <ShieldCheck size={16} />, color: 'text-amber-400', activeBg: 'bg-amber-400 text-slate-950 font-extrabold' },
    { id: 'gaming' as TabType, label: '🎮 Gaming (6e-3e)', icon: <Gamepad2 size={16} />, color: 'text-purple-400', activeBg: 'bg-purple-500 text-slate-950 font-extrabold' },
    { id: 'custom' as TabType, label: 'Exercices', icon: <Sliders size={16} />, color: 'text-slate-300', activeBg: 'bg-cyan-500 text-slate-950 font-bold' },
    { id: 'multiplayer' as TabType, label: 'Course', icon: <Trophy size={16} />, color: 'text-indigo-400', activeBg: 'bg-indigo-500 text-white font-black' },
    { id: 'global_ranking' as TabType, label: '🏆 Classement Global', icon: <Medal size={16} />, color: 'text-amber-300', activeBg: 'bg-amber-400 text-slate-950 font-black' },
    { id: 'stats' as TabType, label: 'Badges & Stats', icon: <BarChart3 size={16} />, color: 'text-slate-300', activeBg: 'bg-cyan-500 text-slate-950 font-bold' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => handleTabClick('courses')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg sm:text-xl shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              Opponè <span className="text-cyan-400 font-mono text-[10px] sm:text-xs font-bold px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded">Classroom</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Saisie & Challenge Classe Informatique</div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on small mobile screens) */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 max-w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap
                ${activeTab === item.id
                  ? `${item.activeBg} shadow-md`
                  : `${item.color} hover:bg-slate-900 hover:text-white`}
              `}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Tools + Mobile Burger Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Guide d'introduction & tutoriel"
            >
              <HelpCircle size={15} /> <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="px-2.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
              title="Installer l'application PWA"
            >
              <Download size={14} /> <span className="hidden xl:inline">App</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all shadow-md"
            title="Options de clavier et sons"
          >
            <Settings size={18} />
          </button>

          {/* Mobile Burger Bar Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 sm:p-2.5 bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-800 rounded-xl transition-all shadow-md flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Burger Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 overflow-hidden shadow-2xl"
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Menu de Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`
                      w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 text-left
                      ${isActive
                        ? `${item.activeBg} shadow-md`
                        : 'bg-slate-950 border border-slate-800/80 text-slate-200 hover:bg-slate-800'}
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onOpenOnboarding();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={15} /> Guide Tutoriel
                </button>
              )}

              {canInstallPwa && onInstallPwa && (
                <button
                  onClick={() => {
                    onInstallPwa();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Download size={15} /> Installer App
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
