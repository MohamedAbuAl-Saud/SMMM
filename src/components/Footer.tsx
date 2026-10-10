import React, { useState } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { HelpGuideModal } from './HelpGuideModal.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <footer className="mt-auto border-t-2 border-sky-100 bg-white/90 backdrop-blur-sm pt-8 pb-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Guide banner card in footer as requested */}
        <div className="w-full bg-gradient-to-r from-sky-50 via-pink-50 to-sky-50 rounded-3xl p-5 sm:p-6 mb-6 border-2 border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-right">
            <img 
              src="https://block.youtest.me/static/assets/img/user/share/share-dudu.webp" 
              alt="دليل الشرح" 
              className="w-14 h-14 object-contain flex-shrink-0"
            />
            <div>
              <h3 className="font-black text-sky-950 text-base sm:text-lg">دليل الشرح واستخدام المنصة</h3>
              <p className="text-xs text-slate-600 font-bold mt-0.5">تعرف على خطوات إنشاء الاختبار، اختيار 5 أو 10 أو 20 سؤالاً، وطريقة المتابعة الحية بكل سهولة.</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="flex-shrink-0 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>عرض الدليل الشامل</span>
          </button>
        </div>

        <Logo size="sm" showText={true} className="mb-3" />

        <p className="text-sm text-sky-800 font-black max-w-md mb-4">
          المنصة الكرتونية الفرفوشة لاختبارات الصداقة والضحك ولمّة الصحاب!
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-sky-600 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-sky-800 hover:underline cursor-pointer"
          >
            الرئيسية
          </button>
          <span className="text-sky-300">•</span>
          <button
            onClick={() => onNavigate('create')}
            className="hover:text-sky-800 hover:underline cursor-pointer"
          >
            إنشاء اختبار جديد
          </button>
          <span className="text-sky-300">•</span>
          <button
            onClick={() => setShowHelp(true)}
            className="hover:text-sky-800 hover:underline cursor-pointer font-black text-sky-700"
          >
            دليل الشرح والاستخدام
          </button>
          <span className="text-sky-300">•</span>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-sky-800 hover:underline cursor-pointer"
          >
            سياسة الخصوصية
          </button>
          <span className="text-sky-300">•</span>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-sky-800 hover:underline cursor-pointer"
          >
            شروط الاستخدام
          </button>
        </div>

        {/* Required Copyright line */}
        <div className="pt-4 border-t border-sky-100 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <span>صُنع بحب ومرح</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>للأصدقاء في كل مكان</span>
          </div>

          <div className="flex items-center gap-2 font-black text-sky-800 tracking-wide text-xs bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-xs">
            <span className="text-pink-500 font-extrabold text-sm">©</span>
            <span dir="ltr">Mohamed Abu AlSaud &amp; Sama</span>
          </div>
        </div>
      </div>

      {showHelp && <HelpGuideModal onClose={() => setShowHelp(false)} />}
    </footer>
  );
}

