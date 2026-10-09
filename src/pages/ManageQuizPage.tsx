import React, { useState, useEffect } from 'react';
import {
  CuteBear,
  CartoonTrophy,
  FluffyCloud
} from '../components/CartoonIllustrations.tsx';
import { sound } from '../lib/sound.ts';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Copy,
  Trash2,
  ArrowRight,
  Eye,
  AlertCircle,
  X,
  XCircle,
  Share2
} from 'lucide-react';

interface ManageQuizPageProps {
  param: string; // "quizId:adminToken"
  onNavigate: (view: string, param?: string) => void;
}

export function ManageQuizPage({ param, onNavigate }: ManageQuizPageProps) {
  const [quizIdStr, adminToken] = (param || '').split(':');
  const quizId = parseInt(quizIdStr, 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [participantDetail, setParticipantDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchQuizManagementData();
  }, [quizId, adminToken]);

  const fetchQuizManagementData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/manage/${quizId}`, {
        headers: { 'x-admin-token': adminToken },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'فشل جلب بيانات الاختبار');
      }
      const data = await res.json();
      setQuizData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر جلب لوحة الإدارة');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!quizData?.quiz?.publicCode) return;
    sound.playPop();
    const url = `${window.location.origin}/?q=${quizData.quiz.publicCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareLink = async () => {
    if (!quizData?.quiz?.publicCode) return;
    sound.playPop();
    const url = `${window.location.origin}/?q=${quizData.quiz.publicCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `اختبار بيستي تشيك: ${quizData.quiz.creatorName}`,
          text: `ادخل حل اختباري وشوف مين هيجيب أعلى سكور!`,
          url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {}
    }
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  const handleOpenParticipantDetail = async (pId: number) => {
    sound.playDing();
    setSelectedParticipantId(pId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/quizzes/manage/${quizId}/participants/${pId}`, {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setParticipantDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteQuiz = async () => {
    sound.playBoing();
    setDeleting(true);
    try {
      const res = await fetch(`/api/quizzes/manage/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
      });
      if (res.ok) {
        const saved = localStorage.getItem('bestie_my_quizzes');
        if (saved) {
          const list = JSON.parse(saved);
          const filtered = list.filter((item: any) => item.quizId !== quizId);
          localStorage.setItem('bestie_my_quizzes', JSON.stringify(filtered));
        }
        alert('تم حذف الاختبار بنجاح يا باشا');
        onNavigate('home');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 border-sky-100 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-black text-sky-900 text-sm">بنفتح لوحة التحكم الخاصة بيك...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 border-rose-200 max-w-sm w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800 mb-2">مش مسموح بالدخول!</h3>
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

  const { quiz, stats, participants } = quizData;

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 flex-1">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-sky-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-black mb-2">
              <span>لوحة الإدارة بتاعتك 👑</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-sky-950 font-['Cairo']">
              اختبار: {quiz.creatorName}
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1">
              تم الإنشاء في {new Date(quiz.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* زر مشاركة رابط */}
            <button
              onClick={handleShareLink}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                shared
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white'
              }`}
            >
              {shared ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
              <span>{shared ? 'تم النسخ!' : 'مشاركة رابط'}</span>
            </button>

            {/* زر نسخ */}
            <button
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-none px-4 py-2.5 border font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200'
              }`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-sky-600" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onNavigate('leaderboard', quiz.publicCode);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>لوحة المتصدرين</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setShowDeleteModal(true);
              }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-colors cursor-pointer"
              title="حذف الاختبار"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border-2 border-sky-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-950 font-['Fredoka','Cairo']">
              {stats.totalParticipants}
            </div>
            <div className="text-xs font-bold text-sky-700 mt-1">كل اللي شاركوا</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-['Fredoka','Cairo']">
              {stats.completedParticipants}
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1">كملوا الـ 20 سؤال</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 font-['Fredoka','Cairo']">
              {stats.averageScore}
            </div>
            <div className="text-xs font-bold text-amber-700 mt-1">متوسط الدرجات</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-pink-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-pink-950 font-['Fredoka','Cairo']">
              {stats.maxScore} <span className="text-xs text-pink-400 font-bold">/ 20</span>
            </div>
            <div className="text-xs font-bold text-pink-700 mt-1">أعلى سكور وصلوا له</div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-sky-100">
          <h2 className="text-xl font-black text-sky-950 mb-1 font-['Cairo']">صحابك اللي حلوا الاختبار</h2>
          <p className="text-xs text-sky-700 font-semibold mb-6">
            اضغط على اسم أي صاحب عشان تفضح إجاباته وتشوف ايه اللي جاوبه غلط!
          </p>

          {participants.length === 0 ? (
            <div className="text-center py-8">
              <img
                src="https://block.youtest.me/static/assets/img/user/scoreboard/dudu.webp"
                alt="لسه مفيش مشاركين"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain mx-auto mb-4 drop-shadow-md animate-bounce-short select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <p className="text-base font-extrabold text-slate-800 mb-1 font-['Cairo']">
                لسه محدش من أصحابك دخل حل الاختبار
              </p>
              <p className="text-xs text-slate-500 font-semibold mb-4 max-w-xs mx-auto">
                انسخ الرابط وابعت لصحابك على واتساب وجروبات الدفعة عشان يبدأوا يتنافسوا!
              </p>
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 mx-auto"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ يا باشا!' : 'انسخ الرابط وابعته ليهم دلوقتي'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((p: any) => {
                const isCompleted = p.status === 'completed';

                return (
                  <div
                    key={p.id}
                    onClick={() => isCompleted && handleOpenParticipantDetail(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      isCompleted
                        ? 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 cursor-pointer'
                        : 'border-slate-200 bg-slate-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center">
                        {p.rank ? `#${p.rank}` : '—'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{p.displayName}</h4>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {isCompleted
                            ? `خلص في ${new Date(p.completedAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'لسه بيحل في الأسئلة...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <div className="text-left sm:text-right">
                          <span className="font-black text-base text-sky-900 font-['Fredoka','Cairo']">
                            {p.score} / 20
                          </span>
                          <span className="block text-[11px] font-black text-pink-600">
                            {p.percentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          بيحل دلوقتي
                        </span>
                      )}

                      {isCompleted && (
                        <Eye className="w-4 h-4 text-slate-400 hover:text-sky-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipantId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-sky-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-sky-950 font-['Cairo']">
                  إجابات: {participantDetail?.participant?.display_name}
                </h3>
                <p className="text-xs text-sky-700 font-black">
                  جاب: {participantDetail?.participant?.score} من 20 سؤال
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedParticipantId(null);
                  setParticipantDetail(null);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingDetail ? (
                <div className="py-12 text-center text-xs font-bold text-sky-600">
                  بنحمّل التفاصيل...
                </div>
              ) : participantDetail?.breakdown?.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  المشارك لسه مخلصش الاختبار
                </div>
              ) : (
                participantDetail?.breakdown?.map((item: any) => (
                  <div
                    key={item.questionOrder}
                    className={`p-3.5 rounded-2xl border-2 text-xs ${
                      item.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5 font-extrabold text-slate-800">
                      <span>#{item.questionOrder}</span>
                      <span className="flex-1 text-right">{item.questionText}</span>
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/60 font-bold">
                      <div className="flex-1 text-slate-700">
                        <span className="text-slate-400">إجابته: </span>
                        <span className={item.isCorrect ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                          {item.selectedOptionText}
                        </span>
                      </div>
                      {!item.isCorrect && (
                        <div className="flex-1 text-emerald-800">
                          <span className="text-slate-400">الصح بتاعك: </span>
                          <span className="font-black">{item.correctOptionText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-200 text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2 font-['Cairo']">
              متأكد إنك عايز تحذف الاختبار؟
            </h3>

            <p className="text-sm text-slate-600 font-semibold mb-6 leading-relaxed">
              حذف الاختبار سيؤدي إلى حذف نتائجه أيضًا، ولا يمكن التراجع عن ذلك.
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
                onClick={() => setShowDeleteModal(false)}
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
