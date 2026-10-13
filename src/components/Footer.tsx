import React from 'react';
import { Heart, BookOpen, Send, Code } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenHelp: () => void;
}

export function Footer({ onNavigate, onOpenHelp }: FooterProps) {
  return (
    <footer className="mt-auto border-t-2 border-sky-100 bg-white/90 backdrop-blur-sm pt-6 pb-6 px-2.5 sm:px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Guide banner card in footer */}
        <div 
          onClick={onOpenHelp}
          className="w-full bg-gradient-to-r from-sky-50 via-pink-50 to-sky-50 rounded-3xl p-4 sm:p-6 mb-5 border-2 border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <img 
              src="https://block.youtest.me/static/assets/img/user/share/share-dudu.webp" 
              alt="دليل الشرح" 
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain flex-shrink-0"
            />
            <div>
              <h3 className="font-black text-sky-950 text-sm sm:text-base">دليل الشرح واستخدام المنصة</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-bold mt-0.5">تعرف على خطوات إنشاء الاختبار، اختيار 5 أو 10 أو 20 سؤالاً، وطريقة المتابعة الحية بكل سهولة.</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenHelp();
            }}
            className="flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>عرض الدليل الشامل</span>
          </button>
        </div>

        <Logo size="sm" showText={true} className="mb-2" />

        <p className="text-xs sm:text-sm text-sky-800 font-black max-w-md mb-3">
          المنصة الكرتونية الفرفوشة لاختبارات الصداقة والضحك ولمّة الصحاب!
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-sky-600 mb-5">
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
            onClick={onOpenHelp}
            className="hover:text-sky-800 hover:underline cursor-pointer font-black text-sky-700"
          >
            دليل الشرح والاستخدام
          </button>
          <span className="text-sky-300">•</span>
          <a
            href="#dev-section"
            className="hover:text-sky-800 hover:underline cursor-pointer font-black text-sky-600"
          >
            قسم التطوير
          </a>
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

        {/* Dedicated Development Section (قسم التطوير) */}
        <div id="dev-section" className="w-full max-w-md mx-auto mb-5 bg-gradient-to-b from-sky-50/90 via-white to-sky-50/50 rounded-3xl p-5 border-2 border-sky-200 shadow-sm text-center flex flex-col items-center">
          {/* Frameless Header Image on top without border as requested */}
          <div className="mb-2 select-none">
            <img 
              src="https://block.youtest.me/static/assets/img/ques_images/96/header.webp"
              alt="شعار قسم التطوير"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto pointer-events-none drop-shadow-xs"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-sky-100/90 text-sky-900 rounded-full text-xs font-black mb-2 border border-sky-300 shadow-xs">
            <Code className="w-3.5 h-3.5 text-sky-700" />
            <span>قسم التطوير</span>
          </div>

          <h4 className="text-base sm:text-lg font-black text-sky-950 font-['Cairo'] mb-0.5">
            Mohamed Abu AlSaud
          </h4>
          <p className="text-xs text-slate-500 font-bold mb-3.5">
            المطور البرمجي للمنصة
          </p>

          {/* Clickable Telegram User */}
          <a
            href="https://t.me/A_Y_TR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer active:translate-y-0.5 group mb-3"
            title="تواصل مع المطور عبر تيليجرام"
          >
            <Send className="w-3.5 h-3.5 text-sky-100 group-hover:-translate-x-0.5 transition-transform" />
            <span dir="ltr">@A_Y_TR</span>
            <span className="text-sky-200 text-xs font-bold">• تيليجرام</span>
          </a>

          <div className="pt-2 border-t border-sky-100 w-full text-center">
            <p className="text-xs font-black text-sky-900">Bestiecheck SM</p>
            <p className="text-xs font-bold text-pink-600 mt-0.5">© Mohamed Abu AlSaud & Sama ♥</p>
          </div>
        </div>

        {/* Footer bottom line */}
        <div className="pt-3 border-t border-sky-100 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <span>صُنع بحب ومرح</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>للأصدقاء في كل مكان</span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-0.5 font-black text-slate-700">
            <span>Bestiecheck SM</span>
            <span className="text-pink-600 font-bold">© Mohamed Abu AlSaud & Sama ♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
