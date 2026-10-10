import React from 'react';
import { X, BookOpen, UserPlus, BrainCircuit, Trophy, CheckCircle, Share2, Eye, RefreshCw } from 'lucide-react';
import { CuteBear, CuteBunny } from './CartoonIllustrations.tsx';

interface HelpGuideModalProps {
  onClose: () => void;
}

export function HelpGuideModal({ onClose }: HelpGuideModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-sky-200 animate-scale-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer z-10">
          <X className="w-6 h-6 text-slate-600" />
        </button>

        <div className="text-center mb-6">
          {/* Borderless custom image as requested */}
          <div className="flex justify-center mb-3">
            <img 
              src="https://block.youtest.me/static/assets/img/user/share/share-dudu.webp" 
              alt="دليل الموقع" 
              className="w-20 h-20 object-contain drop-shadow-md"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-sky-950 font-['Cairo'] flex items-center justify-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-500" />
            دليل الشرح والتشغيل المفصل
          </h2>
          <p className="text-xs sm:text-sm font-bold text-sky-700 mt-1">كل ما تحتاج معرفته لاستخدام منصة Bestie Check SM خطوة بخطوة بكل سهولة</p>
        </div>

        <div className="space-y-6 text-slate-700 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" />
                إنشاء الاختبار واختيار عدد الأسئلة (5 أو 10 أو 20)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                من الصفحة الرئيسية، اضغط على زر <strong>أنشئ اختباري</strong>. اكتب اسمك، واختار بلدك وجنسك (سما / محمد)، ثم حدد عدد الأسئلة: <strong>5 أسئلة، 10 أسئلة، أو 20 سؤالاً</strong>. بعدين تقدر تسحب الأسئلة بضغطة زر من بنك الأسئلة أو تكتب أسئلتك الخاصة بكل سهولة.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-black">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                حفظ ونشر الاختبار ومشاركة الرابط
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                بعد اكتمال الأسئلة، اضغط على زر <strong>نشر الاختبار الآن</strong>. سيتم حفظ الاختبار تلقائياً وتوليد رابط فريد خاص بك بالإضافة إلى ملف نصي داخل مجلد التطبيق. انسخ الرابط وابعته لأصحابك في كل مكان.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 font-black">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                تجربة حل الأصدقاء للاختبار
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                عندما يفتح صديقك الرابط، يكتب اسمه للبدء. تظهر الأسئلة بترتيب عشوائي للخيارات في كل محاولة لمنع الغش. بعد اختيار الإجابة، يجب الضغط على زر <strong>تأكيد إجابتي لهذا السؤال</strong> للانتقال للسؤال التالي بكل تركيز.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                لوحة الإدارة والمتابعة الحية
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                من خلال لوحة التحكم الخاصة بصاحب الاختبار، يمكنك رؤية أصدقائك وهم يحلون الاختبار <strong>لحظة بلحظة</strong> (تتحدث تلقائياً من القاعدة). يظهر اسم الصديق ودرجته أو عبارة لسا مخلصش اختبارو، بجانب أيقونة المعاينة لمعاينة الإجابات التي قام بحلها وصحتها مباشرة، مع زر تحديث يدوي للاستخدام عند الحاجة.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CuteBear className="w-14 h-14 animate-bounce-short" mood="celebrate" />
            <CuteBunny className="w-14 h-14" />
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
}

