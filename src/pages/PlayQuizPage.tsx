import React, { useState, useEffect } from 'react';
import {
  SamaCharacter,
  MohamedCharacter,
  CuteBear,
  CuteBunny,
  FluffyCloud,
  CartoonStar,
  CartoonPencil,
  CartoonAvatar
} from '../components/CartoonIllustrations.tsx';
import { Logo } from '../components/Logo.tsx';
import { sound } from '../lib/sound.ts';
import { PlayQuestion, StoredQuizItem } from '../lib/types.ts';
import { ArrowLeft, Trophy, Users, AlertCircle, ArrowRight, Copy, CheckCircle2, Eye, Share2 } from 'lucide-react';

interface PlayQuizPageProps {
  publicCode: string;
  onNavigate: (view: string, param?: string) => void;
}

export function PlayQuizPage({ publicCode, onNavigate }: PlayQuizPageProps) {
  const [stage, setStage] = useState<'welcome' | 'ask_name' | 'playing' | 'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [quizInfo, setQuizInfo] = useState<{
    id: number;
    creatorName: string;
    totalParticipants: number;
    optionalGender?: string;
    totalQuestions: number;
  } | null>(null);

  const [leaderboardPreview, setLeaderboardPreview] = useState<Array<{
    id: number;
    displayName: string;
    score: number;
    completedAt: string;
  }>>([]);

  // Check if current device is the creator
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [creatorAdminToken, setCreatorAdminToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  const [participantName, setParticipantName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [participantSession, setParticipantSession] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<PlayQuestion | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    // Check if creator
    const saved = localStorage.getItem('bestie_my_quizzes');
    if (saved) {
      try {
        const parsed: StoredQuizItem[] = JSON.parse(saved);
        const match = parsed.find(item => item.publicCode === publicCode);
        if (match) {
          setIsCreator(true);
          setCreatorAdminToken(match.adminToken);
        }
      } catch {}
    }

    loadQuizDetails();
  }, [publicCode]);

  const loadQuizDetails = async () => {
    try {
      const res = await fetch(`/api/quizzes/by-code/${publicCode}`);
      if (!res.ok) {
        setErrorMessage('الاختبار ده مش موجود أو اتمسح يا غالي');
        setStage('error');
        return;
      }
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('خطأ في الاتصال بالسيرفر');
      }
      setQuizInfo(data);

      // Also fetch public leaderboard preview for friendly scoreboard display
      try {
        const lbRes = await fetch(`/api/quizzes/by-code/${publicCode}/leaderboard`);
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboardPreview(lbData.participants || []);
        }
      } catch {}

      checkCurrentQuestion();
    } catch (err) {
      console.error(err);
      setErrorMessage('مش عارفين نتواصل مع السيرفر، اتأكد من النت');
      setStage('error');
    }
  };

  const checkCurrentQuestion = async () => {
    try {
      const res = await fetch(`/api/quizzes/by-code/${publicCode}/current-question`);
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          onNavigate('result', publicCode);
          return;
        } else if (data.question) {
          setCurrentQuestion(data.question);
          setStage('playing');
          return;
        }
      }
      setStage('welcome');
    } catch {
      setStage('welcome');
    }
  };

  const handleStartClicked = () => {
    sound.playPop();
    setStage('ask_name');
  };

  const getShareText = (name: string, url: string) => {
    return `${name} وريني، لو كنت صاحبي/تي  وحبيبي/تي \nبجد ولا متعرفنيش كويس ومش مهتم.. لو درجتك معجبتنيش هديك/ي احلي بلوك.. 🤨 ✨\n\n• الرابط:\n${url}`;
  };

  const handleCopyLink = () => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${publicCode}`;
    const shareMessage = getShareText(quizInfo?.creatorName || 'صاحبك', url);
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareLink = async () => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${publicCode}`;
    const shareMessage = getShareText(quizInfo?.creatorName || 'صاحبك', url);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `اختبار بيستي تشيك: ${quizInfo?.creatorName || ''}`,
          text: shareMessage,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
        return;
      } catch {}
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    navigator.clipboard.writeText(shareMessage).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    });
  };

  const handleSubmitName = async () => {
    sound.playDing();
    const trimmed = participantName.trim();
    if (!trimmed) {
      setNameError('اكتب اسمك الأول يا بطل عشان نبدأ!');
      return;
    }
    if (trimmed.length > 45) {
      setNameError('الاسم طويل شوية، متزودش عن 45 حرف');
      return;
    }

    try {
      setStage('loading');
      const res = await fetch(`/api/quizzes/by-code/${publicCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName: trimmed }),
      });
      
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('خطأ في الاتصال بالسيرفر');
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'حصلت مشكلة في بدء الاختبار');
        setStage('error');
        return;
      }

      if (data.alreadyCompleted) {
        onNavigate('result', publicCode);
        return;
      }

      if (data.participantSessionId) {
        setParticipantSession(data.participantSessionId);
      }

      const qRes = await fetch(`/api/quizzes/by-code/${publicCode}/current-question`, {
        headers: data.participantSessionId ? { 'x-participant-session': data.participantSessionId } : {},
      });
      const qData = await qRes.json();

      if (qData.question) {
        setCurrentQuestion(qData.question);
        setStage('playing');
        sound.playNext();
      } else {
        setErrorMessage('تعذر تحميل السؤال الأول');
        setStage('error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('حصل خطأ في الاتصال بالسيرفر');
      setStage('error');
    }
  };

  const handleSelectAnswer = async (optionId: number) => {
    if (submittingAnswer || !currentQuestion) return;
    sound.playDing();
    setSelectedOptionId(optionId);
    setSubmittingAnswer(true);

    try {
      const res = await fetch(`/api/quizzes/by-code/${publicCode}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(participantSession ? { 'x-participant-session': participantSession } : {}),
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId: optionId,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('خطأ في الاتصال بالسيرفر');
      }

      if (!res.ok) {
        alert(data.error || 'حصل خطأ في تسجيل الإجابة');
        setSubmittingAnswer(false);
        setSelectedOptionId(null);
        return;
      }

      if (data.completed) {
        onNavigate('result', publicCode);
      } else {
        const nextRes = await fetch(`/api/quizzes/by-code/${publicCode}/current-question`, {
          headers: participantSession ? { 'x-participant-session': participantSession } : {},
        });
        const nextData = await nextRes.json();
        if (nextData.completed) {
          onNavigate('result', publicCode);
        } else if (nextData.question) {
          setCurrentQuestion(nextData.question);
          setSelectedOptionId(null);
          setSubmittingAnswer(false);
          sound.playNext();
        }
      }
    } catch (err) {
      console.error(err);
      alert('النت قطع ومش عارفين نسجل الإجابة، جرب تاني');
      setSubmittingAnswer(false);
      setSelectedOptionId(null);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      {/* Floating Clouds */}
      <div className="absolute top-4 left-6 pointer-events-none opacity-80 animate-bounce-short">
        <FluffyCloud className="w-20 h-12" />
      </div>
      <div className="absolute top-10 right-8 pointer-events-none opacity-80">
        <FluffyCloud className="w-28 h-16" />
      </div>

      <div className="max-w-xl w-full mx-auto px-4 pt-8 flex-1">
        {stage === 'loading' && (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-sky-100 shadow-xl">
            <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-extrabold text-sky-800 text-sm">بنجهزلك الأسئلة على نار هادية...</p>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-rose-200 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 ring-4 ring-rose-200 text-rose-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">يا خسارة!</h3>
            <p className="text-sm font-semibold text-slate-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-2xl cursor-pointer"
            >
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* Welcome Screen for Creator or Friend */}
        {stage === 'welcome' && quizInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-sky-100 text-center animate-scale-up relative overflow-hidden">
            <div className="flex justify-center mb-4">
              {quizInfo.optionalGender === 'female' ? (
                <SamaCharacter className="w-28 h-28" />
              ) : (
                <MohamedCharacter className="w-28 h-28" />
              )}
            </div>

            {/* Header with Frameless Bubu character next to creator name */}
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <img
                src="https://block.youtest.me/static/assets/img/player/home/character-bubu.webp"
                alt="Bubu"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain select-none pointer-events-none drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <h2 className="text-lg sm:text-xl font-black text-sky-950 font-['Cairo'] flex items-center gap-1.5 flex-wrap justify-center">
                <span>اختبار الصداقة بتاع</span>
                <span className="text-sky-600 underline decoration-sky-300 font-black">{quizInfo.creatorName}</span>
              </h2>
            </div>

            {/* CREATOR DETECTED: NOT ALLOWED TO TAKE OWN TEST */}
            {isCreator ? (
              <div className="mb-6">
                <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-amber-950 font-black text-sm mb-6 leading-relaxed flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>«أنت صاحب الاختبار يا فنان! مينفعش تحل اختبارك بنفسك عشان عارف الإجابات الصح! ابعت الرابط لصحابك وشوف مين هيجيب أعلى سكور!»</span>
                </div>

                <div className="space-y-3 max-w-sm mx-auto">
                  {creatorAdminToken && (
                    <button
                      onClick={() => {
                        sound.playPop();
                        onNavigate('manage', `${quizInfo.id}:${creatorAdminToken}`);
                      }}
                      className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white text-base font-black rounded-2xl shadow-[0_5px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>دخول لوحة التحكم ومتابعة الصحاب</span>
                    </button>
                  )}

                  {/* زر مشاركة رابط */}
                  <button
                    onClick={handleShareLink}
                    className={`w-full py-3.5 text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      shared
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white'
                    }`}
                  >
                    {shared ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                    <span>{shared ? 'تم النسخ!' : 'مشاركة رابط الاختبار'}</span>
                  </button>

                  {/* زر نسخ */}
                  <button
                    onClick={handleCopyLink}
                    className={`w-full py-3 border-2 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-sky-600" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ رابط الاختبار'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      onNavigate('leaderboard', publicCode);
                    }}
                    className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>عرض لوحة المتصدرين</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FRIEND DETECTED: CAN PLAY THE TEST */
              <>
                {/* Friend intro bubble */}
                <div className="relative bg-gradient-to-br from-sky-50 to-pink-50 rounded-3xl p-5 sm:p-6 border-2 border-sky-200 shadow-inner mb-6 text-center overflow-hidden">
                  <p className="text-sm sm:text-base text-sky-950 font-black leading-relaxed max-w-sm mx-auto font-['Cairo']">
                    «يلا ورينا بقا فعلا احنا صحاب وحبايب ومهتمين بيا ولا لا؟»
                  </p>

                  <div className="flex items-center justify-center gap-2 text-xs font-black text-sky-700 bg-white/90 py-1.5 px-3 rounded-full mt-3 border border-sky-200 max-w-xs mx-auto shadow-xs">
                    <Users className="w-3.5 h-3.5 text-pink-500" />
                    <span>في {quizInfo.totalParticipants} من الصحاب دخلوا التحدي</span>
                  </div>
                </div>

                {/* Big 3D Start Button */}
                <div className="max-w-sm mx-auto mb-8">
                  <button
                    onClick={handleStartClicked}
                    className="w-full py-4 bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 active:translate-y-0.5 text-white text-lg font-black rounded-2xl shadow-[0_6px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>ابدأ الاختبار الآن يا بطل</span>
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Embedded Scoreboard below start button */}
                <div className="bg-sky-50/70 rounded-3xl p-5 border-2 border-sky-200 text-right">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-200">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-sky-950 text-sm sm:text-base">لوحة درجات المتصدرين</h3>
                    </div>
                    <button
                      onClick={() => {
                        sound.playPop();
                        onNavigate('leaderboard', publicCode);
                      }}
                      className="text-xs font-black text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
                    >
                      عرض الكل
                    </button>
                  </div>

                  {leaderboardPreview.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-sky-100">
                      <img
                        src="https://block.youtest.me/static/assets/img/user/scoreboard/dudu.webp"
                        alt="لسه مفيش مشاركين"
                        className="w-20 h-20 object-contain mx-auto mb-2 opacity-90"
                      />
                      <p className="text-xs font-bold text-sky-900 mb-1">لسه مفيش حد حل قبلك!</p>
                      <p className="text-[11px] font-black text-pink-600">كن أول المشاركين واقفل الـ 20/20!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboardPreview.slice(0, 5).map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-3 border border-sky-100 flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-xs transition-transform ${
                              idx === 0
                                ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-amber-500 ring-2 ring-amber-300 scale-105'
                                : idx === 1
                                ? 'bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 text-slate-800 border-slate-400 ring-2 ring-slate-200'
                                : idx === 2
                                ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 text-white border-amber-800 ring-1 ring-amber-600'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}>
                              {idx + 1}
                            </span>
                            <CartoonAvatar index={idx} className="w-8 h-8" />
                            <span className="font-black text-xs text-sky-950">{item.displayName}</span>
                          </div>

                          <div className="font-black text-xs text-sky-900 font-['Fredoka','Cairo']">
                            {item.score} <span className="text-[10px] text-sky-500">/ 20</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Ask Friend Name */}
        {stage === 'ask_name' && quizInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-sky-100 text-center animate-scale-up">
            <div className="flex justify-center mb-4">
              <CuteBear className="w-20 h-20" mood="thinking" />
            </div>

            <h2 className="text-2xl font-black text-sky-950 mb-2 font-['Cairo']">
              اكتب اسمك عشان نعرفك
            </h2>
            <p className="text-xs text-sky-700 font-bold mb-6">
              عشان نطلع نتيجتك ونحطك في لوحة الشرف لـ {quizInfo.creatorName}
            </p>

            <div className="max-w-sm mx-auto mb-6">
              <input
                type="text"
                value={participantName}
                maxLength={45}
                onChange={e => {
                  setParticipantName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmitName();
                }}
                placeholder="اكتب اسمك هنا (مثال: سما أو محمد)"
                className="w-full px-4 py-3.5 text-center text-base font-black text-sky-950 bg-sky-50 border-2 border-sky-200 rounded-2xl focus:border-sky-500 focus:outline-none shadow-inner"
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-rose-500 font-black mt-2">{nameError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 max-w-sm mx-auto">
              <button
                onClick={() => setStage('welcome')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl cursor-pointer"
              >
                رجوع
              </button>
              <button
                onClick={handleSubmitName}
                className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-base rounded-2xl shadow-[0_4px_0_#0284c7] cursor-pointer"
              >
                ادخل على أول سؤال
              </button>
            </div>
          </div>
        )}

        {/* Solving 20 Questions */}
        {stage === 'playing' && currentQuestion && (
          <div className="animate-fade-in">
            {/* Top Notebook Stripe */}
            <div className="bg-amber-100 rounded-t-3xl p-4 border-2 border-b-0 border-amber-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CartoonPencil className="w-6 h-6" />
                <span className="font-black text-amber-950 text-sm">
                  سؤال {currentQuestion.order} من {quizInfo?.totalQuestions || 20}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 max-w-xs mx-4 bg-amber-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-amber-400">
                <div
                  className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentQuestion.order / (quizInfo?.totalQuestions || 20)) * 100}%` }}
                />
              </div>

              <span className="text-xs font-black text-amber-800 font-mono">
                %{Math.round((currentQuestion.order / (quizInfo?.totalQuestions || 20)) * 100)}
              </span>
            </div>

            {/* Notebook Paper Body */}
            <div className="bg-white rounded-b-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(#0284c7_1px,transparent_1px)] bg-[size:100%_28px]" />

              <div className="mb-8 text-center relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-sky-950 leading-relaxed font-['Cairo']">
                  {currentQuestion.text}
                </h3>
              </div>

    {/* 4 Choices */}
              <div className="grid grid-cols-1 gap-3 relative z-10 mb-6">
                {currentQuestion.options.map(opt => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={submittingAnswer}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-2xl border-2 text-right font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-100 text-sky-950 scale-101 shadow-md'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 text-slate-800'
                      }`}
                    >
                      <span className="flex-1">{opt.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-3 ${
                          isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <button
                disabled={submittingAnswer || selectedOptionId === null}
                onClick={() => selectedOptionId !== null && handleSelectAnswer(selectedOptionId)}
                className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-[0_4px_0_#0369a1] transition-all ${
                    submittingAnswer || selectedOptionId === null
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-500 cursor-pointer active:translate-y-0.5'
                }`}
              >
                تأكيد إجابتي لهذا السؤال
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
