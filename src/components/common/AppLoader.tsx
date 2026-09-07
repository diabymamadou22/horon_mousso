import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Leaf, Flame, ShieldCheck } from 'lucide-react';

interface AppLoaderProps {
  minDurationMs?: number;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ minDurationMs = 1500 }) => {
  const { isLoading, settings } = useApp();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    "Sélection des récoltes nobles...",
    "Harmonisation des arômes & épices...",
    "Préparation de votre comptoir du terroir...",
    "Bienvenue chez Horon Mousso !"
  ];

  // Minimum display timer to prevent abrupt visual flickers
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs]);

  // Smooth simulated progress bar and status rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev;
        }
        const increment = Math.floor(Math.random() * 14) + 8;
        return Math.min(prev + increment, 95);
      });
    }, 240);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  // Set progress to 100% once both data is loaded and minimum time elapsed
  const isFinished = !isLoading && minTimeElapsed;

  useEffect(() => {
    if (isFinished) {
      setProgress(100);
    }
  }, [isFinished]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="app-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.03,
            filter: "blur(4px)",
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D180F] text-white select-none overflow-hidden"
        >
          {/* Ambient Background Warm Glows */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#2D5A27]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Subtle patterned overlay grid */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#FAF7F0 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Centered Brand Content */}
          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
            
            {/* Logo Wrapper with Radiant Halo & Orbital Rings */}
            <div className="relative flex items-center justify-center">
              
              {/* Outer Pulsing Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.75, 0.4]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: "easeInOut"
                }}
                className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#2D5A27] via-amber-500/30 to-[#C53030]/20 blur-xl"
              />

              {/* Rotating Gold Accent Dashed Border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 9,
                  ease: "linear"
                }}
                className="absolute w-28 h-28 rounded-full border-2 border-dashed border-amber-400/40"
              />

              {/* Counter-Rotating Outer Accent Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 14,
                  ease: "linear"
                }}
                className="absolute w-32 h-32 rounded-full border border-emerald-500/20"
              />

              {/* Main Brand Logo Container */}
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-22 h-22 rounded-2xl bg-gradient-to-b from-[#1C3620] to-[#122416] p-1 shadow-2xl border-2 border-amber-400/50 flex items-center justify-center overflow-hidden"
              >
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings.companyName}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-300">
                    <Leaf className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">HM</span>
                  </div>
                )}

                {/* Shimmer sweep effect across logo */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    repeatDelay: 1,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-1/2 h-full bg-white/25 -skew-x-12 pointer-events-none"
                />
              </motion.div>

              {/* Floating Mini Spice Badges */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                className="absolute -top-1 -right-2 bg-amber-400 text-stone-950 p-1 rounded-full shadow-md border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>

              <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ repeat: Infinity, duration: 2.7, ease: "easeInOut" }}
                className="absolute -bottom-1 -left-2 bg-red-600 text-white p-1 rounded-full shadow-md border border-white/20"
              >
                <Flame className="w-3.5 h-3.5" />
              </motion.div>
            </div>

            {/* Brand Title & Description */}
            <div className="space-y-1.5 pt-2">
              <motion.h2 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase"
              >
                HORON <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E56B2D] to-amber-300">MOUSSO</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-xs text-emerald-200/80 font-medium tracking-wide uppercase"
              >
                Épices Nobles & Trésors du Terroir
              </motion.p>
            </div>

            {/* Progress Bar with Glowing Tip */}
            <div className="w-56 space-y-2 pt-2">
              <div className="relative h-1.5 w-full bg-stone-800/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#C53030] rounded-full relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                >
                  {/* Glowing lead edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[2px]" />
                </motion.div>
              </div>

              {/* Rotating Status Caption */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-[11px] text-stone-400 font-medium h-4"
                >
                  {statusMessages[statusIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Quality Commitment Footer Note */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-stone-400/80 font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Naturel • Transformation Saine</span>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
