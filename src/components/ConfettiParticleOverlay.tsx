import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConfettiParticleOverlayProps {
  wpm: number;
  studentName?: string;
}

export const ConfettiParticleOverlay: React.FC<ConfettiParticleOverlayProps> = ({ wpm, studentName }) => {
  useEffect(() => {
    // Fire canvas confetti burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#a855f7', '#fbbf24']
      });
    } catch {
      // Fallback if canvas confetti isn't supported
    }
  }, [wpm]);

  // Generate 12 particle dots with randomized angles and distances
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 25 + (i % 3) * 12;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance - 15;
    const colors = ['bg-amber-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-300'];
    const color = colors[i % colors.length];

    return { id: i, x, y, color };
  });

  return (
    <div className="absolute -top-12 right-0 z-30 pointer-events-none flex flex-col items-end">
      {/* Radial Particle Explosion */}
      <div className="relative w-0 h-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0.2, x: p.x, y: p.y }}
            transition={{ duration: 0.9, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
            className={`absolute w-2 h-2 rounded-full ${p.color} shadow-lg shadow-amber-400/50`}
          />
        ))}
      </div>

      {/* Floating Badge above progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="px-2.5 py-1 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-[11px] font-mono rounded-full shadow-xl shadow-amber-500/40 border border-amber-200/60 flex items-center gap-1.5 whitespace-nowrap animate-pulse"
      >
        <Flame size={13} className="text-slate-950 fill-amber-950 animate-bounce" />
        <span>🎉 NOUVEAU RECORD : {wpm} WPM !</span>
        <Sparkles size={12} className="text-slate-950" />
      </motion.div>
    </div>
  );
};
