import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { sound } from '../lib/sound.ts';
import { Volume2, VolumeX, Heart, HelpCircle, Layers, PlusCircle } from 'lucide-react';
import { HelpGuideModal } from './HelpGuideModal.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenHelp: () => void;
}

export function Navbar({ currentView, onNavigate, onOpenHelp }: NavbarProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-sky-100 shadow-sm transition-all">
      <div className="w-full px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            sound.playPop();
            onNavigate('home');
          }}
          className="cursor-pointer flex-shrink-0"
        >
          <Logo size="sm" showText={true} />
        </div>

        {/* Navigation Actions - fills the screen towards the left */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Help Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenHelp();
            }}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors cursor-pointer flex items-center gap-1"
            aria-label="دليل الاستخدام"
            title="دليل الشرح"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline text-xs font-bold">دليل الشرح</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1 bg-sky-50/80 p-1 rounded-2xl border border-sky-200">
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

          {/* Quick buttons on mobile: My Quizzes + Create */}
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('my-quizzes');
            }}
            className={`sm:hidden p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              currentView === 'my-quizzes'
                ? 'bg-sky-500 text-white border-sky-600'
                : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
            }`}
            title="اختباراتي"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black">اختباراتي</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('create');
            }}
            className="sm:hidden px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-200" />
            <span className="text-[11px] font-black">أنشئ</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition-all cursor-pointer active:scale-95"
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
  );
}
