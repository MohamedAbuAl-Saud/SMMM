import React from 'react';
import { CuteBear, FluffyCloud } from '../components/CartoonIllustrations.tsx';
import { ShieldCheck, ArrowRight, Heart } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (view: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      <div className="max-w-3xl w-full mx-auto px-4 pt-8 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-sky-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-sky-950">سياسة الخصوصية</h1>
              <p className="text-xs text-slate-500 font-bold mt-0.5">منصة Bestie Check SM لاختبارات الصداقة</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-semibold">
            <section className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <h2 className="text-base font-black text-sky-900 mb-2">1. ما هي البيانات التي نجمعها؟</h2>
              <p>
                نحن لا نطلب منك أي كلمات مرور أو بيانات حساسة أو حسابات مصرفية. البيانات التي يتم إدخالها تقتصر فقط على:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 mr-2">
                <li>الاسم الذي يختاره صاحب الاختبار ليظهر لأصدقائه.</li>
                <li>إجابات الأسئلة العشرين التي يحددها صاحب الاختبار.</li>
                <li>اسم المشارك الذي يكتبه الصديق عند حل الاختبار، وإجاباته للأسئلة.</li>
                <li>معلومات اختيارية مثل النوع أو الدولة (لا تُستخدم لأي استهداف أو بيع بيانات).</li>
              </ul>
            </section>

            <section className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <h2 className="text-base font-black text-sky-900 mb-2">2. كيف يتم استخدام وعرض البيانات؟</h2>
              <p>
                تُستخدم البيانات لتقديم لعبة اختبار الصداقة فقط: حساب الدرجة من 20، إظهار الترتيب في لوحة المتصدرين الخاصة بالاختبار، وإتاحة لصاحب الاختبار معرفة الأسئلة التي أجاب عليها أصدقاؤه.
              </p>
            </section>

            <section className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <h2 className="text-base font-black text-sky-900 mb-2">3. حذف الاختبار وبياناته بالكامل</h2>
              <p>
                يحق لصاحب الاختبار في أي وقت ومن خلال لوحة التحكم الخاصة به حذف الاختبار نهائياً. عند حذف الاختبار، يتم فوراً حذف جميع الأسئلة والإجابات وجميع سجلات ودرجات المشاركين من قاعدة البيانات بصورة نهائية ولا يمكن استرجاعها.
              </p>
            </section>

            <section className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <h2 className="text-base font-black text-sky-900 mb-2">4. الأمان وملفات الارتباط</h2>
              <p>
                نستخدم ملفات ارتباط (Cookies) آمنة لتنظيم جلسات اللعب ومنع تكرار الإجابات العشوائية، ولا نقوم بتتبع المستخدمين عبر مواقع خارجية.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>حقوق التطوير والملكية الفكرية:</span>
              <span className="font-extrabold text-sky-800">©Mohamed Abu AlSaud &amp; Sama</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>العودة للصفحة الرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
