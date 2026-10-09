import React, { useEffect, useState } from 'react';
import { Logo } from './Logo.tsx';
import { sound } from '../lib/sound.ts';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Try to play welcome chime
    const timerAudio = setTimeout(() => {
      sound.playWelcome();
    }, 250);

    // Target duration ~2 seconds, start fading at 1.8s
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1800);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => {
      clearTimeout(timerAudio);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top action row */}
      <div className="w-full max-w-md flex items-center justify-between">
        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-sky-600" />}
        </button>

        <button
          onClick={handleSkip}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span>تخطي</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Logo & Animation */}
      <div className="flex flex-col items-center text-center animate-bounce-short">
        <div className="transform transition-transform hover:scale-105 duration-300 mb-2">
          <Logo size="xl" showText={true} />
        </div>

        <div className="flex items-center gap-4 my-2">
          <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 shadow-xs">
            <span className="text-sm">👦🏻</span>
            <span className="text-xs font-black text-sky-800">محمد</span>
          </div>
          <span className="text-pink-400 font-black text-xs">&amp;</span>
          <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 shadow-xs">
            <span className="text-sm">👧🏻</span>
            <span className="text-xs font-black text-pink-800">سما</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <span className="text-sm text-sky-700 font-black">بنفتحلك عالم الصداقة واللعب...</span>
        </div>
      </div>

      {/* Mandatory Copyright Footer */}
      <div className="text-center pb-4">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-black tracking-wide">
          <span className="text-pink-500 text-sm font-extrabold">©</span>
          <span>محمد أبو السعود &amp; Sama</span>
        </div>
      </div>
    </div>
  );
}
