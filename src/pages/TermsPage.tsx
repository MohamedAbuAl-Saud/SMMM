import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { DevCredits } from '../components/DevCredits.tsx';

interface TermsPageProps {
  onNavigate: (view: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      <div className="max-w-3xl w-full mx-auto px-4 pt-8 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-sky-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-sky-950">شروط الاستخدام</h1>
              <p className="text-xs text-slate-500 font-bold mt-0.5">منصة Bestie Check SM لاختبارات الصداقة</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-semibold">
            <section className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
              <h2 className="text-base font-black text-amber-950 mb-2">1. طبيعة المنصة والهدف منها</h2>
              <p>
                Bestie Check SM هي منصة ترفيهية واجتماعية تهدف إلى تعزيز الصداقة والمرح ومشاركة اللحظات اللطيفة بين الأصدقاء. جميع الأسئلة والدرجات هي لأغراض التسلية الودية فقط.
              </p>
            </section>

            <section className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
              <h2 className="text-base font-black text-amber-950 mb-2">2. السلوك المقبول والمحتوى المحظور</h2>
              <p>
                يلتزم المستخدمون بعدم كتابة أسئلة أو اختيارات أو أسماء مسيئة أو تنمرية أو تحتوي على خطاب كراهية أو انتهاك لخصوصية الآخرين. نحتفظ بالحق في حذف أي اختبار مخالف فوراً.
              </p>
            </section>

            <section className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
              <h2 className="text-base font-black text-amber-950 mb-2">4. إخلاء المسؤولية</h2>
              <p>
                المنصة غير مسؤولة عن أي خلافات شخصية قد تنشأ نتيجة إجابات أو درجات الأصدقاء، فالموضوع كله للمرح والضحك!
              </p>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>العودة للصفحة الرئيسية</span>
            </button>
          </div>

          <DevCredits />
        </div>
      </div>
    </div>
  );
}
