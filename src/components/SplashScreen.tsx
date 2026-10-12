import React, { useEffect, useState } from 'react';
import { sound } from '../lib/sound.ts';
import { Volume2, VolumeX, ArrowLeft, Heart, Play } from 'lucide-react';
import { CuteBear, CuteBunny, CartoonStar, FluffyCloud } from './CartoonIllustrations.tsx';
import confetti from 'canvas-confetti';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [fadingOut, setFadingOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play the cute cartoon opening chime!
    const audioTimer = setTimeout(() => {
      sound.playCuteOpen();
    }, 150);

    // Initial celebratory confetti puff
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.45 },
        colors: ['#38bdf8', '#f472b6', '#facc15', '#4ade80'],
      });
    } catch {}

    // 5-second smooth timer
    const totalDurationMs = 5000;
    const intervalMs = 50;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / totalDurationMs) * 100);
      setProgress(pct);

      const remSecs = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      setSecondsLeft(remSecs);

      if (elapsed >= totalDurationMs) {
        clearInterval(interval);
        // Play small celebration pop
        sound.playPop();
        try {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {}
        setFadingOut(true);
        setTimeout(onFinish, 300);
      }
    }, intervalMs);

    return () => {
      clearTimeout(audioTimer);
      clearInterval(interval);
    };
  }, [onFinish]);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleSkip = () => {
    sound.playPop();
    setFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-sky-100 via-white to-pink-50 flex flex-col items-center justify-between p-6 transition-all duration-500 overflow-hidden select-none ${
        fadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D Background Decorative Elements */}
      <div className="absolute top-6 left-8 pointer-events-none opacity-40 animate-float-3d">
        <FluffyCloud className="w-28 h-16" />
      </div>
      <div className="absolute top-16 right-10 pointer-events-none opacity-40 animate-pulse">
        <CartoonStar className="w-14 h-14" />
      </div>
      <div className="absolute bottom-20 left-12 pointer-events-none opacity-30">
        <CartoonStar className="w-12 h-12" />
      </div>
      <div className="absolute bottom-16 right-12 pointer-events-none opacity-35 animate-float-3d">
        <FluffyCloud className="w-24 h-14" />
      </div>

      {/* Top action row */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10">
        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-white/90 shadow-md border-2 border-sky-200 hover:bg-sky-50 text-sky-800 transition-all cursor-pointer flex items-center justify-center"
          aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-sky-600" />}
        </button>

        {/* 5-second Countdown Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full border-2 border-sky-200 shadow-sm text-xs font-black text-sky-900">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span>جاري التحميل: {secondsLeft} ثواني</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs sm:text-sm font-black text-sky-800 bg-white/90 hover:bg-sky-100 border-2 border-sky-200 shadow-sm flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
        >
          <span>تخطي</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Centered 3D Card & Animated Visuals */}
      <div className="flex flex-col items-center text-center relative z-10 max-w-sm w-full my-auto">
        {/* 3D Floating Circular Logo Badge */}
        <div className="relative mb-5 group">
          {/* Animated 3D Glow Ring */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-amber-300 opacity-60 blur-lg animate-pulse-glow" />

          {/* Circular 3D frame with SM.jpg */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white p-2.5 shadow-[0_15px_35px_rgba(2,132,199,0.35),0_0_0_4px_#38bdf8] flex items-center justify-center animate-float-3d">
            <img
              src="/SM.jpg"
              alt="Bestie Check SM"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* 3D Cute Mini Heart Badge */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce-short">
            <Heart className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Brand Title with 3D depth */}
        <h1 className="text-2xl sm:text-3xl font-black text-sky-950 font-['Cairo'] tracking-tight drop-shadow-sm mb-1">
          Bestie Check <span className="text-pink-500">SM</span>
        </h1>
        <p className="text-xs sm:text-sm text-sky-700 font-extrabold mb-4">
          عالم اختبارات الصداقة والمرح والفرفشة مع أصحابك!
        </p>

        {/* Cute 3D Mascots Row */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-14 h-14 bg-white/90 rounded-full p-1.5 shadow-md border-2 border-sky-200 flex items-center justify-center hover:scale-110 transition-transform">
            <CuteBunny className="w-full h-full" />
          </div>
          <div className="w-16 h-16 bg-white/90 rounded-full p-2 shadow-lg border-2 border-pink-200 flex items-center justify-center animate-bounce-short">
            <CuteBear className="w-full h-full" mood="celebrate" />
          </div>
          <div className="w-14 h-14 bg-white/90 rounded-full p-1.5 shadow-md border-2 border-amber-200 flex items-center justify-center hover:scale-110 transition-transform">
            <CartoonStar className="w-full h-full text-amber-500" />
          </div>
        </div>

        {/* 5-Second 3D Progress Bar */}
        <div className="w-full bg-sky-200/60 rounded-full h-3.5 p-0.5 shadow-inner border border-sky-300 relative overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-pink-500 to-yellow-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(244,114,182,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full mt-2 text-[11px] font-black text-sky-800">
          <span>بنجهزلك اللعبة...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
