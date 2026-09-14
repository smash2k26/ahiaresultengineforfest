import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useFestival } from '../../context/FestivalContext';
import { SparklesIcon as Sparkles, FireIcon as Fire } from 'hugeicons-react';

export const CelebrationFireworks: React.FC = () => {
  const { festConfig, toggleCelebrationMode, isAdminLoggedIn } = useFestival();
  const [showBanner, setShowBanner] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  const intervalRef = useRef<any>(null);
  const periodicRef = useRef<any>(null);

  // Multi-cannon explosive celebration sequence
  const launchFireworks = useCallback((customDuration = 6000) => {
    setIsBlasting(true);
    setShowBanner(true);

    const animationEnd = Date.now() + customDuration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    // Center starburst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
      zIndex: 9999,
    });

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsBlasting(false);
        // Hide top banner 2s after burst ends
        setTimeout(() => setShowBanner(false), 2000);
        return;
      }

      const particleCount = 45 * (timeLeft / customDuration);
      // Left cannon
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'],
      });
      // Right cannon
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#F97316'],
      });
    }, 280);
  }, []);

  // Listen to manual triggers from buttons
  useEffect(() => {
    const handleManualTrigger = () => {
      launchFireworks(6000);
    };

    window.addEventListener('fest-trigger-fireworks', handleManualTrigger);
    return () => {
      window.removeEventListener('fest-trigger-fireworks', handleManualTrigger);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (periodicRef.current) clearInterval(periodicRef.current);
    };
  }, [launchFireworks]);

  // Handle celebration mode toggle
  useEffect(() => {
    if (festConfig?.isCelebrationMode) {
      // Fire initial celebration sequence
      launchFireworks(7000);

      // Gentle periodic celebratory burst every 20s while Celebration Mode is active
      if (periodicRef.current) clearInterval(periodicRef.current);
      periodicRef.current = setInterval(() => {
        if (!document.hidden) {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            zIndex: 9999,
          });
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            zIndex: 9999,
          });
        }
      }, 20000);
    } else {
      setShowBanner(false);
      setIsBlasting(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (periodicRef.current) clearInterval(periodicRef.current);
    }

    return () => {
      if (periodicRef.current) clearInterval(periodicRef.current);
    };
  }, [festConfig?.isCelebrationMode, launchFireworks]);

  return (
    <>
      {/* Top Floating Festive Banner during active blast */}
      {showBanner && festConfig?.isCelebrationMode && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="celebration-shimmer-bg text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white/50 backdrop-blur-md">
            <Sparkles className="w-4 h-4 animate-spin text-amber-200 shrink-0" />
            <span className="font-black text-xs sm:text-sm tracking-wide uppercase font-display drop-shadow-sm whitespace-nowrap">
              🎉 CELEBRATION IN PROGRESS! 🎉
            </span>
            <button
              onClick={() => launchFireworks(5000)}
              className="ml-2 px-2.5 py-1 bg-white/25 hover:bg-white/40 active:scale-95 text-[11px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1"
            >
              <Fire className="w-3 h-3 text-amber-300" />
              <span>More Fireworks</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Celebration Pill on public pages when Celebration Mode is enabled */}
      {festConfig?.isCelebrationMode && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center bg-white/95 backdrop-blur-md border-2 border-amber-300 text-slate-800 shadow-xl rounded-full p-1.5 pl-3 gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-display tracking-tight text-slate-900 hidden sm:inline">Celebration Mode</span>
              <span className="font-display tracking-tight text-slate-900 sm:hidden">Festive</span>
            </div>

            <button
              type="button"
              onClick={() => launchFireworks(6000)}
              disabled={isBlasting}
              className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                isBlasting
                  ? 'bg-amber-400 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white hover:brightness-110 active:scale-95'
              }`}
              title="Launch celebratory fireworks!"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBlasting ? 'Blasting...' : '💥 Fireworks'}</span>
            </button>

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => toggleCelebrationMode(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs"
                title="Turn Celebration Mode OFF (Admin)"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
