import React, { useState, useEffect } from 'react';
import {
  SamaCharacter,
  MohamedCharacter,
  CuteBear,
  CuteBunny,
  CartoonTrophy,
  FluffyCloud
} from '../components/CartoonIllustrations.tsx';
import { Logo } from '../components/Logo.tsx';
import { sound } from '../lib/sound.ts';
import { QuizResult } from '../lib/types.ts';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Share2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

interface QuizResultPageProps {
  publicCode: string;
  onNavigate: (view: string, param?: string) => void;
}

export function QuizResultPage({ publicCode, onNavigate }: QuizResultPageProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, [publicCode]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/by-code/${publicCode}/result`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل جلب النتيجة');
      }
      const data: QuizResult = await res.json();
      setResult(data);

      if (data.score >= 18) {
        sound.playFanfare();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        sound.playNext();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر تحميل النتيجة');
    } finally {
      setLoading(false);
    }
  };

  const handleShareResult = async () => {
    if (!result) return;
    sound.playPop();
    const shareText = `أنا جبت ${result.score} من 20 في اختبار الصداقة بتاع ${result.creatorName}! ادخل شوف هتعرف تجيب أعلى مني ولا هتهبد!`;
    const shareUrl = `${window.location.origin}/?q=${publicCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `نتيجتي في اختبار ${result.creatorName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
        alert('تم نسخ نتيجتك والرابط، شير مع الشلة!');
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 border-sky-100 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-black text-sky-900 text-sm">بنحسب درجاتك ونشوف الصح من الغلط...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 border-rose-200 max-w-sm w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800 mb-2">يا خبر!</h3>
          <p className="text-xs text-slate-600 font-bold mb-4">{error}</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-black text-sm cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const isPerfect = result.score === 20;
  const isHigh = result.score >= 14;

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      <div className="max-w-2xl w-full mx-auto px-4 pt-6 flex-1">
        {/* Main Result Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-sky-100 text-center animate-scale-up relative overflow-hidden mb-8">
          {/* Reaction Character */}
          <div className="flex justify-center mb-4 gap-3">
            {isPerfect ? (
              <div className="flex items-center gap-3">
                <MohamedCharacter className="w-24 h-24 drop-shadow-md hover:scale-105 transition-transform" />
                <CuteBear className="w-28 h-28" mood="celebrate" />
                <SamaCharacter className="w-24 h-24 drop-shadow-md hover:scale-105 transition-transform" />
              </div>
            ) : isHigh ? (
              <div className="flex items-center gap-3">
                <SamaCharacter className="w-24 h-24" />
                <CuteBear className="w-24 h-24" mood="happy" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <MohamedCharacter className="w-24 h-24" />
                <CuteBear className="w-24 h-24" mood="sad" />
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-sky-950 mb-1 font-['Cairo']">
            نتيجة اختبار: <span className="text-sky-600">{result.creatorName}</span>
          </h2>
          <p className="text-xs text-slate-500 font-black mb-6">
            المشارك: {result.participantName} • المركز #{result.rank} في الشلة
          </p>

          {/* Big Score Bubble */}
          <div className="inline-flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-pink-50 border-3 border-sky-200 shadow-inner mb-6">
            <div className="text-5xl sm:text-6xl font-black text-sky-900 tracking-tight font-['Fredoka','Cairo']">
              {result.score} <span className="text-2xl text-sky-500 font-bold">/ 20</span>
            </div>
            <div className="text-sm font-black text-pink-600 mt-1">
              نسبة المعرفة: {result.percentage}%
            </div>
          </div>

          {/* Egyptian Commentary */}
          <div className="max-w-md mx-auto mb-8">
            {isPerfect ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-emerald-950 font-black text-base shadow-xs leading-relaxed">
                «يا سلام! أنت فعلًا صديق مميز، واضح إنك مهتم وبتعرف صاحبك كويس جدًا!» 🎉🔥
              </div>
            ) : isHigh ? (
              <div className="bg-sky-50 border-2 border-sky-300 p-4 rounded-2xl text-sky-950 font-black text-base shadow-xs leading-relaxed">
                «عاش يا بطل! نتيجة جامدة جداً، إنت عارف تفاصيل كتير ومفيش شك إنكم صحاب بجد!» ⭐
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-amber-950 font-black text-base shadow-xs leading-relaxed">
                «إيه ده؟ زعلانين منك شوية! شكلك محتاج تركز وتعرف صاحبك أكتر!»
                <p className="text-xs text-amber-800 font-black mt-1">
                  «زعلان 😒 أنت وحش، متكلمنيش تاني 😒»
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('leaderboard', publicCode);
              }}
              className="py-3.5 bg-amber-500 hover:bg-amber-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              <span>لوحة المتصدرين</span>
            </button>

            <button
              onClick={handleShareResult}
              className="py-3.5 bg-pink-500 hover:bg-pink-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>شير نتيجتك مع الشلة</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onNavigate('create');
              }}
              className="py-3.5 bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>أنشئ اختباري أنا كمان</span>
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-sky-100">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-sky-950 font-['Cairo']">كشف درجات الـ 20 سؤال</h3>
              <p className="text-xs text-sky-700 font-bold mt-0.5">
                شوف إنت اخترت ايه وصاحبك {result.creatorName} كان مختار ايه
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{result.score} صح</span>
              </span>
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                <XCircle className="w-3.5 h-3.5" />
                <span>{20 - result.score} غلط</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {result.breakdown.map((item) => (
              <div
                key={item.questionOrder}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  item.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-black text-slate-500">
                    #{item.questionOrder}
                  </span>
                  <h4 className="flex-1 text-sm font-black text-slate-900 text-right">
                    {item.questionText}
                  </h4>
                  {item.isCorrect ? (
                    <span className="bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>صح ✓</span>
                    </span>
                  ) : (
                    <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>غلط ✗</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-slate-400">إجابتك إنت:</span>
                    <span className={item.isCorrect ? 'text-emerald-700 font-black' : 'text-rose-700 font-black line-through'}>
                      {item.selectedOptionText}
                    </span>
                  </div>

                  {!item.isCorrect && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <span className="text-slate-400">الإجابة الصح:</span>
                      <span className="font-black">{item.correctOptionText}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
