import React from 'react';
import { Heart } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-auto border-t-2 border-sky-100 bg-white/80 backdrop-blur-sm pt-8 pb-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
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
    </footer>
  );
}
