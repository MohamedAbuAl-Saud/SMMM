import React, { useState, useEffect } from 'react';
import {
  CuteBear,
  CuteBunny,
  CartoonTrophy,
  CartoonStar,
  CartoonAvatar,
  FluffyCloud
} from '../components/CartoonIllustrations.tsx';
import { sound } from '../lib/sound.ts';
import { LeaderboardEntry, StoredQuizItem } from '../lib/types.ts';
import { Trophy, Medal, Share2, ArrowRight, Play, Copy, CheckCircle2, AlertCircle, PlusCircle, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatQuizShareText, shareLinkWithImage, SHARE_FOOTER, COPYRIGHT_TEXT } from '../lib/shareHelper.ts';

interface LeaderboardPageProps {
  publicCode: string;
  onNavigate: (view: string, param?: string) => void;
}

export function LeaderboardPage({ publicCode, onNavigate }: LeaderboardPageProps) {
  const [creatorName, setCreatorName] = useState<string>('');
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [participants, setParticipants] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Creator check
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [creatorQuizItem, setCreatorQuizItem] = useState<StoredQuizItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bestie_my_quizzes');
    if (saved) {
      try {
        const parsed: StoredQuizItem[] = JSON.parse(saved);
        const match = parsed.find(item => item.publicCode === publicCode);
        if (match) {
          setIsCreator(true);
          setCreatorQuizItem(match);
        }
      } catch {}
    }

    fetchLeaderboard();
  }, [publicCode]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/by-code/${publicCode}/leaderboard`);
      if (!res.ok) {
        throw new Error('الاختبار غير متوفر');
      }
      const data = await res.json();
      setCreatorName(data.creatorName);
      setTotalQuestions(data.totalQuestions || 20);
      setParticipants(data.participants || []);
      if (data.participants && data.participants.length > 0) {
        sound.playFanfare();
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
          });
        } catch {}
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر جلب لوحة المتصدرين');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${publicCode}`;
    const shareMessage = formatQuizShareText(creatorName || 'صاحبك', url);
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareLink = async () => {
    sound.playPop();
    const url = `${window.location.origin}/?q=${publicCode}`;
    const shareMessage = formatQuizShareText(creatorName || 'صاحبك', url);
    const shared = await shareLinkWithImage(`اختبار بيستي تشيك: ${creatorName}`, shareMessage, url);
    if (shared) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
      return;
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    navigator.clipboard.writeText(shareMessage).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      {/* Clouds */}
      <div className="absolute top-4 left-6 pointer-events-none opacity-80 animate-bounce-short">
        <FluffyCloud className="w-20 h-12" />
      </div>
      <div className="absolute top-8 right-8 pointer-events-none opacity-80">
        <FluffyCloud className="w-24 h-14" />
      </div>

      <div className="max-w-2xl w-full mx-auto px-4 pt-6 flex-1">
        {/* Yellow Banner Header */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl border-3 border-amber-400 text-center relative overflow-hidden mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CartoonStar className="w-10 h-10 animate-pulse text-amber-500" />
            <CartoonTrophy className="w-16 h-16 animate-bounce-short" />
            <CartoonStar className="w-10 h-10 animate-pulse text-amber-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-['Cairo']">
            لوحة شرف والمتصدرين
          </h1>
          <p className="text-sm font-black text-amber-900 mt-1">
            اختبار الصداقة بتاع <span className="underline decoration-amber-500 font-extrabold">{creatorName}</span>
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-400/60 px-4 py-1.5 rounded-full text-xs font-black text-amber-950 border border-amber-500/50">
            <Trophy className="w-4 h-4 text-amber-800" />
            <span>عدد الأصحاب اللي كملوا الاختبار: {participants.length}</span>
          </div>
        </div>

        {/* Action strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-3 border-2 border-sky-100 shadow-sm mb-6">
          {/* If creator: DO NOT allow self test taking, show management button */}
          {isCreator ? (
            <button
              onClick={() => {
                sound.playPop();
                if (creatorQuizItem) {
                  onNavigate('manage', `${creatorQuizItem.quizId}:${creatorQuizItem.adminToken}`);
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>لوحة التحكم والإدارة</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('play', publicCode);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>حل الاختبار دلوقتي</span>
            </button>
          )}

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
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
            }`}
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-sky-600" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('create');
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>أنشئ اختباري</span>
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-sky-100 shadow-xl">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-extrabold text-amber-900 text-xs">بنرتب المراكز والأوائل...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-rose-200 shadow-xl">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">{error}</p>
          </div>
        ) : participants.length === 0 ? (
          /* Empty scoreboard state with requested dudu.webp illustration */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-amber-200 shadow-xl flex flex-col items-center animate-fade-in">
            <img
              src="https://block.youtest.me/static/assets/img/user/scoreboard/dudu.webp"
              alt="لسه مفيش مشاركين"
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto mb-4 drop-shadow-md animate-bounce-short select-none"
              onError={(e) => {
                // fallback if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2 font-['Cairo']">لسه محدش شارك!</h3>
            <p className="text-sm text-amber-800 font-bold mb-6 max-w-sm leading-relaxed">
              {isCreator
                ? 'ابعت الرابط لأصحابك على واتساب وإنستغرام وشوف مين هيسجل أعلى نتيجة!'
                : 'ابعت الاختبار لأصحابك وابدأ التحدي. كن من أول المشاركين وسجل أعلى نتيجة!'}
            </p>
            {isCreator ? (
              <button
                onClick={handleCopyLink}
                className="px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>انسخ رابط الاختبار وابعت لصحابك</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('play', publicCode);
                }}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_#b45309] hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
              >
                كن أول واحد يشارك دلوقتي!
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((entry, idx) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border-2 shadow-xs transition-all flex items-center justify-between gap-4 ${
                    isFirst
                      ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-300 shadow-md'
                      : isSecond
                      ? 'border-slate-300 bg-slate-50/50'
                      : isThird
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full flex items-center justify-center font-black flex-shrink-0 transition-transform ${
                        isFirst
                          ? 'w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-3 border-amber-500 shadow-[0_4px_14px_rgba(245,158,11,0.5)] ring-4 ring-amber-300 text-lg sm:text-xl scale-105'
                          : isSecond
                          ? 'w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 text-slate-800 border-2 border-slate-400 shadow-[0_2px_10px_rgba(148,163,184,0.4)] ring-3 ring-slate-300/80 text-base sm:text-lg'
                          : isThird
                          ? 'w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 text-white border-2 border-amber-700 shadow-sm ring-2 ring-amber-500/40 text-sm sm:text-base'
                          : 'w-9 h-9 sm:w-10 sm:h-10 bg-sky-50 text-sky-800 border-2 border-sky-200 text-xs sm:text-sm'
                      }`}
                    >
                      {entry.rank}
                    </div>

                    <CartoonAvatar index={idx} className="w-11 h-11 hidden sm:flex" />

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {entry.displayName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {new Date(entry.completedAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <div className="font-black text-lg sm:text-xl text-sky-900 font-['Fredoka','Cairo']">
                        {entry.score} <span className="text-xs text-sky-500 font-bold">/ {entry.total || totalQuestions || 20}</span>
                      </div>
                      <div className="text-xs font-black text-pink-600">
                        {entry.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
