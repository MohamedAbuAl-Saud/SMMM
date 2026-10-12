import React from 'react';
import { X, BookOpen, UserPlus, BrainCircuit, Trophy, CheckCircle, Share2, Eye, RefreshCw, HelpCircle, Layers } from 'lucide-react';
import { CuteBear, CuteBunny } from './CartoonIllustrations.tsx';

interface HelpGuideModalProps {
  onClose: () => void;
}

export function HelpGuideModal({ onClose }: HelpGuideModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border-4 border-sky-200 animate-scale-up relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3.5 right-3.5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer z-10"
          title="إغلاق الدليل"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        </button>

        {/* Fixed Header */}
        <div className="text-center mb-3 sm:mb-4 flex-shrink-0 pt-1">
          {/* Borderless custom image as requested */}
          <div className="flex justify-center mb-1.5">
            <img 
              src="https://block.youtest.me/static/assets/img/user/share/share-dudu.webp" 
              alt="دليل الموقع" 
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md select-none pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-sky-950 font-['Cairo'] flex items-center justify-center gap-1.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>دليل الشرح والتشغيل المفصل</span>
          </h2>
          <p className="text-[11px] sm:text-xs font-bold text-sky-700 mt-0.5">
            دليلك الكامل لاستخدام منصة Bestie Check SM بكل سهولة
          </p>
        </div>

        {/* Scrollable Steps Area with Short, Compact Scrollbar */}
        <div className="flex-1 overflow-y-auto max-h-[46vh] sm:max-h-[50vh] pr-1.5 pl-1 space-y-3 guide-scrollbar">
          {/* Step 1 */}
          <div className="bg-sky-50/70 p-3 sm:p-3.5 rounded-2xl border border-sky-100 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-black text-xs sm:text-sm shadow-xs">
              1
            </div>
            <div className="space-y-0.5 flex-1 text-right">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-pink-500" />
                <span>إنشاء الاختبار وتحديد عدد الأسئلة (5 أو 10 أو 20)</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-semibold">
                اضغط على زر <strong>أنشئ اختبار</strong> واكتب اسمك وحدد النوع، والأهم اختيار عدد الأسئلة بدقة: <strong>5 أسئلة أو 10 أسئلة أو 20 سؤالاً</strong> ليتشكل الاختبار بناءً على اختيارك تماماً.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-amber-50/60 p-3 sm:p-3.5 rounded-2xl border border-amber-100 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-black text-xs sm:text-sm shadow-xs">
              2
            </div>
            <div className="space-y-0.5 flex-1 text-right">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                <span>تحديد إجابتك الصح والـ 3 إجابات الغلط</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-semibold">
                لكل سؤال اختر إجابتك الصحيحة من القائمة، ثم اختر 3 إجابات خاطئة لتشتيت أصحابك، أو استخدم بنك الـ 80 سؤال أو اكتب سؤالك بنفسك.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-purple-50/60 p-3 sm:p-3.5 rounded-2xl border border-purple-100 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-black text-xs sm:text-sm shadow-xs">
              3
            </div>
            <div className="space-y-0.5 flex-1 text-right">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-500" />
                <span>نشر الاختبار ومشاركة الرابط</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-semibold">
                بعد الانتهاء من عدد الأسئلة المحدد، اضغط على <strong>نشر الاختبار الآن</strong> وانسخ الرابط الخاص بك وشاركه مع جميع أصدقائك على واتساب وإنستغرام.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-50/60 p-3 sm:p-3.5 rounded-2xl border border-emerald-100 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black text-xs sm:text-sm shadow-xs">
              4
            </div>
            <div className="space-y-0.5 flex-1 text-right">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>إجابة الأصدقاء وتأكيد الاختيارات</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-semibold">
                يدخل الصديق ويكتب اسمه ويبدأ الإجابة. بعد اختيار الإجابة، يضغط زر <strong>«تأكيد إجابتي لهذا السؤال»</strong> للانتقال للسؤال التالي وحتى كشف درجاته النهائي.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-rose-50/60 p-3 sm:p-3.5 rounded-2xl border border-rose-100 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700 font-black text-xs sm:text-sm shadow-xs">
              5
            </div>
            <div className="space-y-0.5 flex-1 text-right">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-600" />
                <span>لوحة التحكم ومعاينة إجابات الأصدقاء</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-semibold">
                من لوحة التحكم، اضغط على اسم أي مشارك أو على أيقونة العين لمعاينة كشف إجاباته بالتفصيل ومعرفة الأسئلة التي جاوبها بشكل صحيح والأسئلة الخاطئة.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CuteBear className="w-10 h-10" mood="celebrate" />
            <CuteBunny className="w-10 h-10" />
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
}


