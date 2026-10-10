import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { sound } from '../lib/sound.ts';
import { Volume2, VolumeX, Heart, HelpCircle, Layers, PlusCircle } from 'lucide-react';
import { HelpGuideModal } from './HelpGuideModal.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      setIsMuted(e.detail);
    };
    window.addEventListener('bestie_sound_toggle', handler);
    return () => window.removeEventListener('bestie_sound_toggle', handler);
  }, []);

  const handleToggleSound = () => {
    sound.playPop();
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <>
      {showHelp && <HelpGuideModal onClose={() => setShowHelp(false)} />}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-sky-100 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            sound.playPop();
            onNavigate('home');
          }}
          className="cursor-pointer"
        >
          <Logo size="sm" showText={true} />
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Help Button */}
          <button
            onClick={() => {
              sound.playPop();
              setShowHelp(true);
            }}
            className="p-2 rounded-full hover:bg-amber-50 text-amber-600 transition-colors cursor-pointer"
            aria-label="دليل الاستخدام"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 bg-sky-50 p-1 rounded-2xl border border-sky-200">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('home');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-700 hover:bg-sky-100'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('create');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'create'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-700 hover:bg-sky-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>أنشئ اختبار</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('my-quizzes');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'my-quizzes'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>اختباراتي</span>
            </button>
          </nav>

          {/* Create button on mobile */}
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('create');
            }}
            className="sm:hidden px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-200" />
            <span>أنشئ</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition-all cursor-pointer active:scale-95"
            title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
