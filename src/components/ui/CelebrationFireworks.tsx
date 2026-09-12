import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useFestival } from '../../context/FestivalContext';
import { SparklesIcon as Sparkles } from 'hugeicons-react';

export const CelebrationFireworks: React.FC = () => {
  const { festConfig } = useFestival();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!festConfig?.isCelebrationMode) {
      setHasCelebrated(false);
      setShowBanner(false);
      return;
    }

    if (festConfig?.isCelebrationMode && !hasCelebrated) {
      setShowBanner(true);
      const duration = 7 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          setTimeout(() => setShowBanner(false), 1000);
          return;
        }

        const particleCount = 60 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      setHasCelebrated(true);

      return () => clearInterval(interval);
    }
  }, [festConfig?.isCelebrationMode, hasCelebrated]);

  if (!showBanner || !festConfig?.isCelebrationMode) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/30 backdrop-blur-md">
        <Sparkles className="w-5 h-5 animate-spin text-amber-200" />
        <span className="font-extrabold text-sm tracking-wide uppercase font-display">
          🎉 CELEBRATION IN PROGRESS! 🎉
        </span>
      </div>
    </div>
  );
};

