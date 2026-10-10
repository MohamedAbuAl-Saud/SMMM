import React from 'react';
import { X, BookOpen, UserPlus, BrainCircuit, Trophy, CheckCircle, Share2, Eye, RefreshCw, HelpCircle, Layers } from 'lucide-react';
import { CuteBear, CuteBunny } from './CartoonIllustrations.tsx';

interface HelpGuideModalProps {
  onClose: () => void;
}

export function HelpGuideModal({ onClose }: HelpGuideModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-sky-200 animate-scale-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer z-10">
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="text-center mb-6">
          {/* Borderless custom image as requested */}
          <div className="flex justify-center mb-3">
            <img 
              src="https://block.youtest.me/static/assets/img/user/share/share-dudu.webp" 
              alt="دليل الموقع" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-['Cairo'] flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            دليل الشرح والتشغيل المفصل خطوة بخطوة
          </h2>
          <p className="text-xs sm:text-sm font-bold text-sky-700 mt-1">دليلك الكامل لاستخدام منصة Bestie Check SM بكل احترافية وبساطة</p>
        </div>

        <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black text-sm sm:text-base">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" />
                خطوة إنشاء الاختبار وتحديد عدد الأسئلة
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                من الصفحة الرئيسية أو شريط التنقل، اضغط على زر <strong>أنشئ اختبار</strong>. اكتب اسمك، واختار الدولة والنوع (سما / محمد)، والأهم هو اختيار عدد الأسئلة بدقة حسب رغبتك: <strong>5 أسئلة أو 10 أسئلة أو 20 سؤالاً</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-black text-sm sm:text-base">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-600" />
                خطوة كتابة أو اختيار الأسئلة
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                لكل سؤال مطلوب منك تحديد النص واختيار 4 خيارات مع تحديد إجابة صحيحة واحدة بدقة. يمكنك بضغطة زر سحب الأسئلة الجاهزة من بنك الأسئلة المليان فرفشة أو كتابة أسئلتك الخاصة بكل مهارة.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-sm sm:text-base">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-500" />
                خطوة نشر الاختبار ومشاركة الرابط
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                بعد استكمال عدد الأسئلة المطلوب، اضغط على زر <strong>نشر الاختبار الآن</strong>. سيتم حفظ الاختبار في قاعدة البيانات فوراً ويظهر لك رابط المشاركة الخاص بك مع كود سري للإدارة ومجلد الحفظ. انسخ الرابط وارسله لجميع أصدقائك.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-sm sm:text-base">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                خطوة تفاعل الأصدقاء وإجابة الاختبار
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                عندما يفتح صديقك الرابط، يكتب اسمه للبدء. تظهر الأسئلة بترتيب خيارات عشوائي لكل مشارك لمنع الغش. بعد اختيار الإجابة، يلزم الضغط على زر <strong>تأكيد إجابتي لهذا السؤال</strong> للانتقال للسؤال التالي وحتى نهاية الاختبار.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 flex gap-3 sm:gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-700 font-black text-sm sm:text-base">
              5
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-600" />
                خطوة لوحة الإدارة ومتابعة النتائج الحية ومعاينة الإجابات
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                من لوحة التحكم الخاصة بك (التي تتحدث تلقائياً كل ثانية)، يمكنك متابعة من قام بحل الاختبار ومن لا يزال في قيد الحل. <strong>بالضغط على اسم أي مشارك أنهى الاختبار أو على أيقونة العين (👁️)</strong>، ستظهر لك نافذة منبثقة تفصيلية تعرض كل سؤال، إجابة صديقك، والإجابة الصحيحة لتعرف تماماً من يعرفك حقاً ومن أخطأ!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CuteBear className="w-12 h-12" mood="celebrate" />
            <CuteBunny className="w-12 h-12" />
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
}


