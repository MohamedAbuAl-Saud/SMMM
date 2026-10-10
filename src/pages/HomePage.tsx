import React, { useState, useEffect } from 'react';
import {
  CuteBear,
  CuteBunny,
  FluffyCloud,
  CartoonStar,
  CartoonTrophy,
  CartoonPencil
} from '../components/CartoonIllustrations.tsx';
import { sound } from '../lib/sound.ts';
import { StoredQuizItem } from '../lib/types.ts';
import {
  Share2,
  Eye,
  Trash2,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Copy,
  AlertCircle,
  Layers,
  Heart,
  PlusCircle,
  Award
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [myQuizzes, setMyQuizzes] = useState<StoredQuizItem[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sharedCode, setSharedCode] = useState<string | null>(null);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState<StoredQuizItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMyQuizzes();
  }, []);

  const loadMyQuizzes = async () => {
    try {
      const saved = localStorage.getItem('bestie_my_quizzes');
      if (!saved) return;
      const parsed: StoredQuizItem[] = JSON.parse(saved);
      if (parsed.length === 0) return;

      setLoadingQuizzes(true);
      const res = await fetch('/api/quizzes/my-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsed }),
      });
      const data = await res.json();
      if (data.quizzes) {
        setMyQuizzes(data.quizzes);
        localStorage.setItem('bestie_my_quizzes', JSON.stringify(data.quizzes));
      }
    } catch (err) {
      console.error('Error fetching my quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleCopyLink = (publicCode: string) => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${publicCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(publicCode);
      setTimeout(() => setCopiedCode(null), 2500);
    });
  };

  const handleShareLink = async (quiz: StoredQuizItem) => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${quiz.publicCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `اختبار بيستي تشيك: ${quiz.creatorName}`,
          text: `يلا ادخل حل اختباري وشوف هتعرفني بجد ولا هتهبد!`,
          url,
        });
        setSharedCode(quiz.publicCode);
        setTimeout(() => setSharedCode(null), 2500);
        return;
      } catch (err) {
        // user cancelled or share failed, fallback to copy
      }
    }
    navigator.clipboard.writeText(url).then(() => {
      setSharedCode(quiz.publicCode);
      setTimeout(() => setSharedCode(null), 2500);
    });
  };

  const handleDeleteQuiz = async () => {
    if (!deleteConfirmQuiz) return;
    setDeleting(true);
    sound.playBoing();
    try {
      const res = await fetch(`/api/quizzes/manage/${deleteConfirmQuiz.quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': deleteConfirmQuiz.adminToken,
        },
      });
      if (res.ok) {
        const remaining = myQuizzes.filter(q => q.quizId !== deleteConfirmQuiz.quizId);
        setMyQuizzes(remaining);
        localStorage.setItem('bestie_my_quizzes', JSON.stringify(remaining));
        setDeleteConfirmQuiz(null);
      } else {
        alert('حصل خطأ في حذف الاختبار');
      }
    } catch (err) {
      console.error(err);
      alert('مش قادرين نتواصل مع السيرفر لحذف الاختبار');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 overflow-hidden pb-12">
      {/* Animated Floating Clouds & Stars */}
      <div className="absolute top-4 left-6 pointer-events-none animate-bounce-short">
        <FluffyCloud className="w-24 h-14" />
      </div>
      <div className="absolute top-12 right-8 pointer-events-none animate-pulse">
        <FluffyCloud className="w-32 h-20" opacity="opacity-80" />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 relative z-10">
        {/* BIG FLOATING LOGO - Circular with subtle neon glow */}
        <div className="flex flex-col items-center justify-center pt-2 pb-6 text-center select-none relative">
          <img
            src="/SM.jpg"
            alt="Bestie Check SM"
            className="w-40 h-40 sm:w-52 sm:h-52 rounded-full object-contain p-2.5 bg-white/95 ring-4 ring-sky-300/80 shadow-[0_0_25px_rgba(56,189,248,0.6),0_0_45px_rgba(244,114,182,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)] hover:scale-105 transition-all duration-300"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight font-['Fredoka','Cairo'] mt-3 drop-shadow-xs">
            Bestie Check <span className="text-pink-500">SM</span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-700 font-extrabold mt-1">
            المنصة الكرتونية الاجتماعية لاختبارات الصداقة ومشاركة المرح والذكريات الجميلة!
          </p>
        </div>

        {/* Main Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_12px_30px_rgba(2,132,199,0.12)] border-2 border-sky-100 text-center relative overflow-hidden mb-12">
          {/* Top Rainbow Stripe */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-400 via-pink-400 to-yellow-300" />

          {/* Requested Characters illustration */}
          <div className="flex justify-center mb-4">
            <img
              src="https://block.youtest.me/static/assets/img/user/home/characters.webp"
              alt="شخصيات بيستي تشيك"
              className="w-48 sm:w-64 h-auto object-contain select-none drop-shadow-md hover:scale-105 transition-transform"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Cartoon Mascots */}
          <div className="flex justify-center items-center gap-4 mb-4 relative">
            <CuteBunny className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md hover:scale-105 transition-transform" />

            <div className="flex flex-col items-center">
              <CuteBear className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md animate-bounce-short" mood="celebrate" />
              <div className="flex items-center gap-1 text-pink-500 font-black text-xs mt-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>بيستي تشيك</span>
              </div>
            </div>

            <CartoonTrophy className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md hover:scale-105 transition-transform" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-sky-950 mb-3 tracking-tight font-['Cairo',sans-serif]">
            أنشئ اختبارك
          </h2>

          {/* Exact slogan as requested: انشأ اختبارك لكشف من يهتم لك ومن مزيف */}
          <p className="text-lg sm:text-xl text-sky-900 font-black max-w-lg mx-auto mb-4 leading-relaxed font-['Cairo']">
            «أنشئ اختبارك لكشف من يهتم لك ومن مزيف!»
          </p>

          <p className="text-xs sm:text-sm text-sky-700 font-bold max-w-lg mx-auto mb-6 leading-relaxed">
            جاوب على 20 سؤال فرفوش عن شخصيتك، واعرف مين أقرب صديق ومين بيخمن على عماه!
          </p>

          {/* Development Copyright in English */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-sky-850 font-black mb-6">
            <span className="text-pink-500 text-sm font-extrabold">©</span>
            <span dir="ltr">Mohamed Abu AlSaud &amp; Sama</span>
          </div>

          {/* Big Chunky 3D Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('create');
              }}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 active:translate-y-1 text-white text-lg font-black rounded-2xl shadow-[0_6px_0_#0284c7] hover:shadow-[0_4px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-3 group"
            >
              <PlusCircle className="w-6 h-6 text-yellow-300 group-hover:rotate-12 transition-transform" />
              <span>إنشاء اختبارك</span>
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Section: كيف نلعب؟ */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-black border border-yellow-300 mb-2 shadow-xs">
              <Award className="w-4 h-4 text-yellow-600" />
              <span>طريقة اللعب بسيطة وسريعة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-sky-950 font-['Cairo']">كيف نلعب؟</h2>
            <p className="text-sm text-sky-700 font-semibold mt-1">تلات خطوات وكل سنة وإنت طيب</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Step 1 with custom illustrated mascot badge */}
            <div className="bg-white rounded-3xl p-6 border-2 border-sky-100 shadow-md text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 rounded-full bg-sky-100 ring-2 ring-sky-300 flex items-center justify-center mb-3 text-sky-600 shadow-sm">
                <CartoonPencil className="w-10 h-10" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-black text-sky-800 mb-2 shadow-xs">
                <span>الخطوة الأولى</span>
              </div>
              <h3 className="font-extrabold text-base text-sky-900 mb-2">أنشئ اختبار عن نفسك</h3>
              <p className="text-xs text-sky-700 font-semibold leading-relaxed">
                حدد اسمك ونوعك واختار إجابتك الصح و3 إجابات غلط من 20 اختيار فرفوش في كل سؤال.
              </p>
            </div>

            {/* Step 2 with custom illustrated badge */}
            <div className="bg-white rounded-3xl p-6 border-2 border-pink-100 shadow-md text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 rounded-full bg-pink-100 ring-2 ring-pink-300 flex items-center justify-center mb-3 text-pink-600 shadow-sm">
                <CuteBunny className="w-12 h-12" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-black text-pink-800 mb-2 shadow-xs">
                <span>الخطوة الثانية</span>
              </div>
              <h3 className="font-extrabold text-base text-sky-900 mb-2">شارك رابط الاختبار</h3>
              <p className="text-xs text-sky-700 font-semibold leading-relaxed">
                انسخ الرابط وابعت لصحابك على واتساب وإنستغرام والجروبات عشان يحلوا التحدي.
              </p>
            </div>

            {/* Step 3 with custom trophy badge */}
            <div className="bg-white rounded-3xl p-6 border-2 border-yellow-100 shadow-md text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 rounded-full bg-yellow-100 ring-2 ring-yellow-300 flex items-center justify-center mb-3 text-yellow-600 shadow-sm">
                <CartoonTrophy className="w-12 h-12" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-black text-yellow-800 mb-2 shadow-xs">
                <span>الخطوة الثالثة</span>
              </div>
              <h3 className="font-extrabold text-base text-sky-900 mb-2">اكتشف درجاتهم</h3>
              <p className="text-xs text-sky-700 font-semibold leading-relaxed">
                شوف ترتيبهم في لوحة المتصدرين واعرف مين جاب 20 من 20 ومين محتاج يركز معاك!
              </p>
            </div>
          </div>
        </section>

        {/* Section: اختباراتي */}
        <section id="my-quizzes" className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-sky-950 flex items-center gap-2">
                <Layers className="w-6 h-6 text-sky-600" />
                <span>اختباراتي</span>
              </h2>
              <p className="text-xs text-sky-700 font-semibold mt-0.5">الاختبارات اللي أنشأتها من جهازك ده</p>
            </div>

            {myQuizzes.length > 0 && (
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('create');
                }}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                + إنشاء اختبار تاني
              </button>
            )}
          </div>

          {loadingQuizzes ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-sky-100 shadow-sm">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-sky-700">بنحمّل اختباراتك ثانية واحدة...</p>
            </div>
          ) : myQuizzes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-sky-200 text-center flex flex-col items-center">
              <CuteBear className="w-20 h-20 mb-3 opacity-90" mood="thinking" />
              <h3 className="text-lg font-extrabold text-sky-900 mb-1">لسه مفيش أي اختبارات هنا</h3>
              <p className="text-xs text-sky-600 font-bold mb-4 max-w-xs">
                أنشئ أول اختبار لك وشوف صحابك عارفينك قد إيه!
              </p>
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('create');
                }}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                أنشئ أول اختبار لك
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.quizId}
                  className="bg-white rounded-3xl p-5 border-2 border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Circular Logo with subtle neon glow & "اختبار 1", "اختبار 2" */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-full bg-white ring-2 ring-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.55),0_0_20px_rgba(244,114,182,0.25)] p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src="/SM.jpg"
                        alt="Bestie Check SM"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sky-950 text-base sm:text-lg font-['Cairo']">
                          اختبار {idx + 1}
                        </h4>
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          باسم: {quiz.creatorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-1">
                        <span>{new Date(quiz.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                        <span>•</span>
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black text-[11px] border border-amber-200">
                          {quiz.totalParticipants || 0} مشارك
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Creator */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* زر مشاركة رابط */}
                    <button
                      onClick={() => handleShareLink(quiz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sharedCode === quiz.publicCode
                          ? 'bg-emerald-500 text-white shadow-emerald-200'
                          : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white'
                      }`}
                    >
                      {sharedCode === quiz.publicCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white animate-scale-up" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>مشاركة رابط</span>
                        </>
                      )}
                    </button>

                    {/* زر نسخ */}
                    <button
                      onClick={() => handleCopyLink(quiz.publicCode)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedCode === quiz.publicCode
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200 shadow-xs'
                      }`}
                    >
                      {copiedCode === quiz.publicCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-scale-up" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-sky-600" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        sound.playPop();
                        onNavigate('manage', `${quiz.quizId}:${quiz.adminToken}`);
                      }}
                      className="px-3 py-2 bg-slate-50 hover:bg-sky-50 text-sky-800 border border-sky-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-600" />
                      <span>إدارة</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playPop();
                        onNavigate('leaderboard', quiz.publicCode);
                      }}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>المتصدرين</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playPop();
                        setDeleteConfirmQuiz(quiz);
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all cursor-pointer"
                      title="حذف الاختبار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmQuiz && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2 font-['Cairo']">
              عايز تحذف الاختبار بجد؟
            </h3>

            <p className="text-sm text-slate-600 font-semibold mb-6 leading-relaxed">
              متأكد إنك عايز تحذف الاختبار؟ حذف الاختبار سيؤدي إلى حذف نتائجه أيضًا، ولا يمكن التراجع عن ذلك.
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={deleting}
                onClick={handleDeleteQuiz}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-colors"
              >
                {deleting ? 'بنحذف...' : 'أيوه، احذف الاختبار'}
              </button>
              <button
                disabled={deleting}
                onClick={() => setDeleteConfirmQuiz(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl cursor-pointer transition-colors"
              >
                لأ خلاص
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
