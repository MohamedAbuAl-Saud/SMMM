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
  PlusCircle,
  Star,
  Frown,
  Heart
} from 'lucide-react';
import { formatResultShareText, shareLinkWithImage, SHARE_FOOTER, COPYRIGHT_TEXT } from '../lib/shareHelper.ts';

interface QuizResultPageProps {
  publicCode: string;
  onNavigate: (view: string, param?: string) => void;
}

export function QuizResultPage({ publicCode, onNavigate }: QuizResultPageProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
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

      const totalQ = data.total || 20;
      if (data.score >= Math.round(totalQ * 0.9)) {
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
    const totalQ = result.total || 20;
    const shareUrl = `${window.location.origin}/?q=${publicCode}`;
    const shareText = formatResultShareText(result.creatorName, result.score, totalQ, shareUrl);

    const shared = await shareLinkWithImage(`نتيجتي في اختبار ${result.creatorName}`, shareText, shareUrl);
    if (shared) {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2500);
      return;
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2500);
    });
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

  const totalQuestions = result.total || 20;
  const isPerfect = result.score === totalQuestions;
  const isHigh = result.score >= Math.round(totalQuestions * 0.7);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-12">
      <div className="max-w-2xl w-full mx-auto px-2.5 sm:px-4 pt-4 sm:pt-6 flex-1">
        {/* Main Result Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-xl border-2 border-sky-100 text-center animate-scale-up relative overflow-hidden mb-5">
          {/* Reaction Character with requested assets */}
          <div className="flex justify-center mb-3">
            {isPerfect ? (
              <div className="flex flex-col items-center">
                <img
                  src="https://block.youtest.me/static/assets/img/player/completed/dudu-8.webp"
                  alt={`${totalQuestions} من ${totalQuestions} صديقي المفضل`}
                  className="w-24 h-24 sm:w-30 sm:h-30 object-contain drop-shadow-md animate-bounce-short select-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black mt-2 shadow-xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                  <span>صديقي المفضل مقفل الامتحان!</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src="https://block.youtest.me/static/assets/img/player/completed/dudu-5.webp"
                  alt="زعلان"
                  className="w-24 h-24 sm:w-30 sm:h-30 object-contain drop-shadow-md select-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-black mt-2 shadow-xs">
                  <Frown className="w-3.5 h-3.5 text-rose-600" />
                  <span>مش مقفل الـ {totalQuestions}</span>
                </span>
              </div>
            )}
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-sky-950 mb-1 font-['Cairo']">
            نتيجة اختبار: <span className="text-sky-600">{result.creatorName}</span>
          </h2>
          <p className="text-xs text-slate-500 font-black mb-4">
            المشارك: {result.participantName} • المركز #{result.rank} في لوحة الشرف
          </p>

          {/* Big Score Bubble */}
          <div className="inline-flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-pink-50 border-2 border-sky-200 shadow-inner mb-4">
            <div className="text-3xl sm:text-5xl font-black text-sky-900 tracking-tight font-['Fredoka','Cairo']">
              {result.score} <span className="text-lg sm:text-xl text-sky-500 font-bold">/ {totalQuestions}</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-pink-600 mt-0.5">
              نسبة المعرفة: {result.percentage}%
            </div>
          </div>

          {/* Egyptian Commentary */}
          <div className="max-w-md mx-auto mb-6">
            {isPerfect ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-emerald-950 font-black text-sm sm:text-base shadow-xs leading-relaxed">
                <div className="flex items-center justify-center gap-2 text-base sm:text-lg mb-1 font-black">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <p>«{totalQuestions} من {totalQuestions}! وطلعت صديقي المفضل!»</p>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-xs text-emerald-800 font-extrabold flex items-center justify-center gap-1.5 mt-1">
                  <span>أحب اهتمامك وفهمك ليا بكل التفاصيل، إنت بطل وأكتر واحد فاهمني!</span>
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                </p>
              </div>
            ) : (
              <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl text-rose-950 font-black text-sm sm:text-base shadow-xs leading-relaxed">
                <div className="flex items-center justify-center gap-2 text-base sm:text-lg mb-1 font-black">
                  <Frown className="w-4 h-4 text-rose-600" />
                  <p>«زعلان.. أنت وحش متكلمنيش تاني»</p>
                  <Frown className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-xs text-rose-700 font-extrabold">
                  {result.score === totalQuestions - 1
                    ? `جايب ${result.score} من ${totalQuestions} وناقص درجة واحدة؟! كان نفسك تقفل بس برضه زعلان منك!`
                    : `جايب ${result.score} بس من ${totalQuestions}؟! ركز معايا شوية واعرفني أكتر يا عم!`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('leaderboard', publicCode);
              }}
              className="py-3 bg-amber-500 hover:bg-amber-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              <span>لوحة المتصدرين</span>
            </button>

            <button
              onClick={handleShareResult}
              className="py-3 bg-pink-500 hover:bg-pink-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedResult ? 'تم نسخ النتيجة والرابط!' : 'شير نتيجتك مع الشلة'}</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onNavigate('create');
              }}
              className="py-3 bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>أنشئ اختباري أنا كمان</span>
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-xl border-2 border-sky-100">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-sky-950 font-['Cairo']">
                كشف درجات الـ {totalQuestions} أسئلة
              </h3>
              <p className="text-[11px] sm:text-xs text-sky-700 font-bold mt-0.5">
                شوف إنت اخترت ايه وصاحبك {result.creatorName} كان مختار ايه
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{result.score} صح</span>
              </span>
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <XCircle className="w-3.5 h-3.5" />
                <span>{Math.max(0, totalQuestions - result.score)} غلط</span>
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
                    <span className="bg-emerald-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>إجابة صح</span>
                    </span>
                  ) : (
                    <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 shadow-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>إجابة خطأ</span>
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

        {/* Development Rights */}
        <div className="mt-8 text-center pb-4">
          <span dir="ltr" className="text-xs font-black text-sky-900 bg-white/90 py-1.5 px-4 rounded-full border border-sky-200 inline-block shadow-2xs">
            © Mohamed Abu AlSaud &amp; Sama ♥
          </span>
        </div>
      </div>
    </div>
  );
}
