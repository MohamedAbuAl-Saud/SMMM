import React, { useState, useEffect } from 'react';
import {
  SamaCharacter,
  MohamedCharacter,
  CuteBear,
  CuteBunny,
  FluffyCloud,
  CartoonStar,
  CartoonPencil
} from '../components/CartoonIllustrations.tsx';
import { Logo } from '../components/Logo.tsx';
import { sound } from '../lib/sound.ts';
import { QuestionDraft, StoredQuizItem } from '../lib/types.ts';
import { DefaultQuestion } from '../server/defaultQuestions.ts';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  RefreshCw,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trophy,
  Heart,
  PlusCircle
} from 'lucide-react';

interface CreateQuizPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export function CreateQuizPage({ onNavigate }: CreateQuizPageProps) {
  // 1 = Name, 2 = Info (Sama / Mohamed), 3 = Questions (1..20), 4 = Review, 5 = Published Success
  const [step, setStep] = useState<number>(1);

  // Step 1: Name
  const [creatorName, setCreatorName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  // Step 2: Gender (Sama / Mohamed) & Country
  const [optionalCountry, setOptionalCountry] = useState<string>('مصر');
  const [optionalGender, setOptionalGender] = useState<'female' | 'male' | ''>('female');

  // Questions state
  const [pool, setPool] = useState<DefaultQuestion[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [currentQIndex, setCurrentQIndex] = useState<number>(0); // 0 to 19

  // Stored 20 questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  // Current Question Builder Phase: 'pick_correct' | 'pick_wrong'
  const [questionPhase, setQuestionPhase] = useState<'pick_correct' | 'pick_wrong'>('pick_correct');
  const [currentText, setCurrentText] = useState<string>('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedCorrectText, setSelectedCorrectText] = useState<string | null>(null);
  const [selectedWrongTexts, setSelectedWrongTexts] = useState<string[]>([]);

  // Search/Filter for the 20 options
  const [optionSearch, setOptionSearch] = useState<string>('');

  // Warning when trying to pick 4th wrong option
  const [wrongOptionWarning, setWrongOptionWarning] = useState<string | null>(null);
  const [shakingOption, setShakingOption] = useState<string | null>(null);

  // Custom choice modal
  const [showAddOptionModal, setShowAddOptionModal] = useState<boolean>(false);
  const [newOptionInput, setNewOptionInput] = useState<string>('');

  // Custom question modal
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState<boolean>(false);
  const [customQuestionStep, setCustomQuestionStep] = useState<number>(1);
  const [customQText, setCustomQText] = useState<string>('');
  const [customQCorrect, setCustomQCorrect] = useState<string>('');
  const [customQWrongs, setCustomQWrongs] = useState<string[]>(['', '', '']);

  // Publishing
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ publicCode: string; adminToken: string; quizId: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Load pool
  useEffect(() => {
    fetch('/api/default-questions')
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          setPool(data.questions);
        }
      })
      .catch(err => console.error('Failed to load default questions:', err));
  }, []);

  // Sync current question
  useEffect(() => {
    if (step === 3 && pool.length > 0) {
      loadQuestionForIndex(currentQIndex);
    }
  }, [step, currentQIndex, pool]);

  const loadQuestionForIndex = (index: number) => {
    setOptionSearch('');
    if (questions[index]) {
      const q = questions[index];
      setCurrentText(q.text);
      const correct = q.options.find(o => o.isCorrect)?.text || '';
      const wrongs = q.options.filter(o => !o.isCorrect).map(o => o.text);

      // Find original question in pool to show all 20 choices if possible
      const poolItem = pool.find(p => p.text === q.text);
      const allOpts = poolItem
        ? Array.from(new Set([...q.options.map(o => o.text), ...poolItem.defaultOptions]))
        : q.options.map(o => o.text);

      setCurrentOptions(allOpts);
      setSelectedCorrectText(correct);
      setSelectedWrongTexts(wrongs);
      setQuestionPhase('pick_wrong');
      return;
    }

    const available = pool.filter(p => !usedQuestionIds.has(p.id));
    const nextQ = available.length > 0 ? available[0] : pool[index % pool.length];

    if (nextQ) {
      setCurrentText(nextQ.text);
      setCurrentOptions([...nextQ.defaultOptions]);
      setSelectedCorrectText(null);
      setSelectedWrongTexts([]);
      setQuestionPhase('pick_correct');
      setUsedQuestionIds(prev => new Set(prev).add(nextQ.id));
    }
  };

  const handleProceedName = () => {
    sound.playPop();
    const trimmed = creatorName.trim();
    if (!trimmed) {
      setNameError('يا غالي اكتب اسمك عشان أصحابك يعرفوك!');
      return;
    }
    if (trimmed.length > 45) {
      setNameError('الاسم طويل شوية، متزودش عن 45 حرف');
      return;
    }
    setNameError('');
    setCreatorName(trimmed);
    setStep(2);
  };

  const handleSkipQuestion = () => {
    sound.playPop();
    const available = pool.filter(p => !usedQuestionIds.has(p.id));
    if (available.length === 0) {
      alert('خلصت كل الأسئلة الجاهزة يا بطل! تقدر تدوس "إضافة سؤال جديد" وتكتب سؤال من دماغك.');
      return;
    }
    const nextQ = available[0];
    setCurrentText(nextQ.text);
    setCurrentOptions([...nextQ.defaultOptions]);
    setSelectedCorrectText(null);
    setSelectedWrongTexts([]);
    setQuestionPhase('pick_correct');
    setOptionSearch('');
    setUsedQuestionIds(prev => new Set(prev).add(nextQ.id));
  };

  const handleSelectCorrect = (optText: string) => {
    sound.playDing();
    setSelectedCorrectText(optText);
  };

  const handleConfirmCorrect = () => {
    if (!selectedCorrectText) return;
    sound.playPop();
    setQuestionPhase('pick_wrong');
    setOptionSearch('');
  };

  const handleToggleWrong = (optText: string) => {
    if (optText === selectedCorrectText) return;

    if (selectedWrongTexts.includes(optText)) {
      sound.playPop();
      setSelectedWrongTexts(selectedWrongTexts.filter(t => t !== optText));
      setWrongOptionWarning(null);
      return;
    }

    if (selectedWrongTexts.length >= 3) {
      sound.playBoing();
      setShakingOption(optText);
      setWrongOptionWarning(
        'يا سيدي بالراحة! لو عايز تختار إجابة تانية، ارجع للاختيارات اللي اخترتها قبل كده وشيل واحدة منها، وبعدها اختار غيرها.'
      );
      setTimeout(() => setShakingOption(null), 800);
      return;
    }

    sound.playPop();
    setSelectedWrongTexts([...selectedWrongTexts, optText]);
    setWrongOptionWarning(null);
  };

  const handleAddCustomOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (currentOptions.includes(trimmed)) {
      alert('الاختيار ده موجود بالفعل يا فنان!');
      return;
    }
    sound.playPop();
    setCurrentOptions([trimmed, ...currentOptions]);
    setNewOptionInput('');
    setShowAddOptionModal(false);
  };

  const handleSaveQuestionAndNext = () => {
    if (!selectedCorrectText || selectedWrongTexts.length !== 3) {
      alert('لازم تختار إجابة صحيحة واحدة و3 إجابات غلط بالظبط!');
      return;
    }

    sound.playNext();

    const finishedQuestion: QuestionDraft = {
      order: currentQIndex + 1,
      text: currentText,
      options: [
        { text: selectedCorrectText, isCorrect: true },
        ...selectedWrongTexts.map(t => ({ text: t, isCorrect: false })),
      ],
    };

    const updated = [...questions];
    updated[currentQIndex] = finishedQuestion;
    setQuestions(updated);

    if (currentQIndex < 19) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setStep(4);
    }
  };

  const handlePreviousQuestion = () => {
    sound.playPop();
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else {
      setStep(2);
    }
  };

  const handleCustomQuestionDone = () => {
    const qText = customQText.trim();
    const correct = customQCorrect.trim();
    const wrongs = customQWrongs.map(w => w.trim()).filter(Boolean);

    if (!qText || !correct || wrongs.length !== 3) {
      alert('املا السؤال وإجابتك الصحيحة و3 إجابات غلط مظبوطين!');
      return;
    }

    sound.playNext();

    const finishedQuestion: QuestionDraft = {
      order: currentQIndex + 1,
      text: qText,
      options: [
        { text: correct, isCorrect: true },
        ...wrongs.map(w => ({ text: w, isCorrect: false })),
      ],
    };

    const updated = [...questions];
    updated[currentQIndex] = finishedQuestion;
    setQuestions(updated);

    setShowCustomQuestionModal(false);
    setCustomQuestionStep(1);
    setCustomQText('');
    setCustomQCorrect('');
    setCustomQWrongs(['', '', '']);

    if (currentQIndex < 19) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setStep(4);
    }
  };

  const handlePublishQuiz = async () => {
    if (questions.length !== 20) {
      alert('لازم تكمل الـ 20 سؤال كلهم يا بطل!');
      return;
    }

    sound.playPop();
    setPublishing(true);
    setPublishError(null);

    try {
      const payload = {
        creatorName,
        optionalCountry,
        optionalGender,
        questions: questions.map((q, idx) => ({
          questionOrder: idx + 1,
          questionText: q.text,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حصلت مشكلة في السيرفر أثناء حفظ الاختبار');
      }

      const storedItem: StoredQuizItem = {
        quizId: data.quizId,
        publicCode: data.publicCode,
        adminToken: data.adminToken,
        creatorName: data.creatorName,
        createdAt: new Date().toISOString(),
      };

      const existingSaved = localStorage.getItem('bestie_my_quizzes');
      const parsed: StoredQuizItem[] = existingSaved ? JSON.parse(existingSaved) : [];
      localStorage.setItem('bestie_my_quizzes', JSON.stringify([storedItem, ...parsed]));

      setCreatedResult({
        publicCode: data.publicCode,
        adminToken: data.adminToken,
        quizId: data.quizId,
      });

      setStep(5);
      sound.playFanfare();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setPublishError(err.message || 'فشل نشر الاختبار');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!createdResult) return;
    sound.playPop();
    const url = `${window.location.origin}/?q=${createdResult.publicCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleNativeShare = async () => {
    if (!createdResult) return;
    sound.playPop();
    const url = `${window.location.origin}/?q=${createdResult.publicCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `اختبار بيستي تشيك: ${creatorName}`,
          text: `يلا وروني مين عارفني بجد ومين بيهبد! ادخل حل اختباري:`,
          url,
        });
      } catch {}
    } else {
      handleCopyShareLink();
    }
  };

  const filteredOptions = currentOptions.filter(o =>
    optionSearch ? o.toLowerCase().includes(optionSearch.toLowerCase()) : true
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-50 to-pink-50 pb-16">
      {/* Decorative Floating Clouds and Stars */}
      <div className="absolute top-2 left-4 pointer-events-none opacity-80 animate-bounce-short">
        <FluffyCloud className="w-20 h-12" />
      </div>
      <div className="absolute top-8 right-6 pointer-events-none opacity-80">
        <FluffyCloud className="w-24 h-14" />
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 pt-6 flex-1">
        {/* Step 1: Creator Name */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-sky-100 text-center animate-scale-up">
            <div className="flex justify-center mb-4 gap-3">
              <MohamedCharacter className="w-20 h-20 -rotate-6 hover:rotate-0 transition-transform" />
              <SamaCharacter className="w-20 h-20 rotate-6 hover:rotate-0 transition-transform" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-sky-950 mb-2 font-['Cairo']">
              اسمك ايه يا بطل؟
            </h2>
            <p className="text-sm text-sky-700 font-bold mb-6">
              اكتب اسمك عشان يظهر لأصحابك أول ما يفتحوا الاختبار ويشوفوا نتيجتهم معاك!
            </p>

            <div className="max-w-sm mx-auto mb-6">
              <input
                type="text"
                value={creatorName}
                maxLength={45}
                onChange={e => {
                  setCreatorName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleProceedName();
                }}
                placeholder="مثال: سما أو محمد"
                className="w-full px-5 py-4 text-center text-lg font-black text-sky-950 bg-sky-50 border-2 border-sky-200 rounded-2xl focus:border-sky-500 focus:outline-none transition-colors shadow-inner"
                autoFocus
              />
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-2 px-1">
                <span>{nameError && <span className="text-rose-500 font-black">{nameError}</span>}</span>
                <span>{creatorName.length} / 45</span>
              </div>
            </div>

            <button
              onClick={handleProceedName}
              className="w-full max-w-sm py-4 bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white text-base font-black rounded-2xl shadow-[0_5px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <span>يلا بينا نكمل</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Info (Sama vs Mohamed) */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-sky-100 text-center animate-scale-up">
            <h2 className="text-2xl sm:text-3xl font-black text-sky-950 mb-2">
              شخصيتك ايه؟
            </h2>
            <p className="text-sm text-sky-700 font-bold mb-8">
              اختر مظهر شخصيتك الكرتونية (سما أو محمد)
            </p>

            {/* Sama & Mohamed Gender Selection Cards */}
            <div className="grid grid-cols-2 gap-5 max-w-md mx-auto mb-8">
              {/* Sama Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playDing();
                  setOptionalGender('female');
                }}
                className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center cursor-pointer ${
                  optionalGender === 'female'
                    ? 'border-pink-500 bg-pink-50 shadow-lg scale-102 ring-4 ring-pink-200'
                    : 'border-slate-200 bg-white hover:border-pink-300'
                }`}
              >
                <SamaCharacter className="w-20 h-20 mb-2 drop-shadow-sm" />
                <span className="font-black text-base text-pink-700">سما 👧🏻 (بنت)</span>
                <span className="text-xs text-pink-500 font-bold mt-1">كيوت وقمورة</span>
              </button>

              {/* Mohamed Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playDing();
                  setOptionalGender('male');
                }}
                className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center cursor-pointer ${
                  optionalGender === 'male'
                    ? 'border-sky-500 bg-sky-50 shadow-lg scale-102 ring-4 ring-sky-200'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <MohamedCharacter className="w-20 h-20 mb-2 drop-shadow-sm" />
                <span className="font-black text-base text-sky-700">محمد 👦🏻 (ولد)</span>
                <span className="text-xs text-sky-500 font-bold mt-1">فرفوش وبطل</span>
              </button>
            </div>

            {/* Country input */}
            <div className="max-w-sm mx-auto mb-8">
              <input
                type="text"
                value={optionalCountry}
                onChange={e => setOptionalCountry(e.target.value)}
                placeholder="البلد / المحافظة (مثال: مصر، إسكندرية...)"
                className="w-full px-4 py-3 text-center text-sm font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 max-w-sm mx-auto">
              <button
                onClick={() => {
                  sound.playPop();
                  setStep(1);
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-colors cursor-pointer"
              >
                رجوع
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setStep(3);
                }}
                className="flex-1 py-4 bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white font-black text-base rounded-2xl shadow-[0_5px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ادخل على الأسئلة!</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Question Builder with 20 AVAILABLE CHOICES! */}
        {step === 3 && (
          <div className="relative animate-fade-in">
            {/* Notebook Card Header */}
            <div className="bg-amber-100 rounded-t-3xl p-4 border-2 border-b-0 border-amber-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CartoonPencil className="w-7 h-7" />
                <span className="font-black text-amber-950 text-sm">
                  سؤال {currentQIndex + 1} من 20
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 max-w-xs mx-4 bg-amber-200/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-amber-400">
                <div
                  className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / 20) * 100}%` }}
                />
              </div>

              <span className="text-xs font-black text-amber-800 font-mono">
                %{Math.round(((currentQIndex + 1) / 20) * 100)}
              </span>
            </div>

            {/* Notebook Lined Paper Body */}
            <div className="bg-white rounded-b-3xl p-5 sm:p-8 border-2 border-amber-200 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(#0284c7_1px,transparent_1px)] bg-[size:100%_28px]" />

              {/* Question Text */}
              <div className="mb-4 relative z-10 text-center">
                <h3 className="text-xl sm:text-2xl font-black text-sky-950 leading-relaxed font-['Cairo']">
                  {currentText}
                </h3>
              </div>

              {/* Phase Banner */}
              <div className="mb-4 text-center">
                {questionPhase === 'pick_correct' ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 px-4 py-2 rounded-full text-xs sm:text-sm font-black border border-emerald-300 shadow-xs">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>الخطوة 1: اختار إجابتك الحقيقية من الـ 20 اختيار اللي تحت دول 👇</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-950 px-4 py-2 rounded-full text-xs sm:text-sm font-black border border-pink-300 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-pink-600" />
                    <span>الخطوة 2: اختار 3 إجابات غلط عشان نلخبط بيهم صحابك! ({selectedWrongTexts.length} من 3 محددين)</span>
                  </div>
                )}
              </div>

              {/* Warning tooltip for 4th selection */}
              {wrongOptionWarning && (
                <div className="mb-4 bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-black p-3 rounded-2xl flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                  <span>{wrongOptionWarning}</span>
                </div>
              )}

              {/* Search / Filter for options if list is long */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-sky-800">
                  قائمة الاختيارات ({currentOptions.length} اختيار متنوع):
                </span>
                <input
                  type="text"
                  value={optionSearch}
                  onChange={e => setOptionSearch(e.target.value)}
                  placeholder="ابحث في الاختيارات..."
                  className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* 20 Options Scrollable / Responsive Grid */}
              <div className="max-h-96 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 relative z-10">
                {filteredOptions.map((optText, optIdx) => {
                  const isCorrectSelected = selectedCorrectText === optText;
                  const isWrongSelected = selectedWrongTexts.includes(optText);
                  const isShaking = shakingOption === optText;

                  if (questionPhase === 'pick_correct') {
                    return (
                      <button
                        key={optText}
                        type="button"
                        onClick={() => handleSelectCorrect(optText)}
                        className={`p-3.5 rounded-2xl border-2 text-right font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                          isCorrectSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-300'
                            : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 text-slate-800'
                        }`}
                      >
                        <span className="flex-1">{optText}</span>
                        {isCorrectSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mr-2 shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  }

                  // Phase: 'pick_wrong'
                  if (isCorrectSelected) {
                    return (
                      <div
                        key={optText}
                        className="p-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-xs opacity-95"
                      >
                        <span className="flex-1">{optText}</span>
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mr-2">
                          إجابتك الصح ✓
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={optText}
                      type="button"
                      onClick={() => handleToggleWrong(optText)}
                      className={`p-3.5 rounded-2xl border-2 text-right font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                        isShaking ? 'border-rose-500 bg-rose-100 text-rose-900 animate-shake' : ''
                      } ${
                        isWrongSelected
                          ? 'border-pink-500 bg-pink-50 text-pink-950 shadow-md'
                          : 'border-slate-200 bg-white hover:border-pink-200 text-slate-800'
                      }`}
                    >
                      <span className="flex-1">{optText}</span>
                      {isWrongSelected ? (
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center flex-shrink-0 mr-2">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mr-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Extra Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 mb-5">
                <button
                  type="button"
                  onClick={() => setShowAddOptionModal(true)}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة اختيار تاني</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تخطي السؤال ده</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setShowCustomQuestionModal(true);
                    }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>اكتب سؤالك بنفسك</span>
                  </button>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviousQuestion}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-colors cursor-pointer"
                >
                  السابق
                </button>

                {questionPhase === 'pick_correct' ? (
                  <button
                    type="button"
                    disabled={!selectedCorrectText}
                    onClick={handleConfirmCorrect}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                      selectedCorrectText
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-[0_4px_0_#0284c7] cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>تم، اختار الـ 3 إجابات الغلط</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={selectedWrongTexts.length !== 3}
                    onClick={handleSaveQuestionAndNext}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                      selectedWrongTexts.length === 3
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-[0_4px_0_#0284c7] cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{currentQIndex === 19 ? 'عاش! راجع واطبع الاختبار' : 'تم، انقل على السؤال اللي بعده'}</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review and Publish */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-sky-100 text-center animate-scale-up">
            <div className="flex justify-center mb-4 gap-3">
              <MohamedCharacter className="w-24 h-24" />
              <SamaCharacter className="w-24 h-24" />
            </div>

            <Logo size="md" showText={false} className="justify-center mb-3" />

            <h2 className="text-3xl font-black text-sky-950 mb-2 font-['Cairo']">
              اختبارك جاهز أخيرًا يا فنان!
            </h2>
            <p className="text-base text-sky-800 font-black max-w-md mx-auto mb-6 leading-relaxed">
              يلا بقى نشوف مين يعرفك بجد ومين محتاج يركز معاك أكتر! جهزنا الـ 20 سؤال بالتمام والكمال!
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-sky-850 font-black mb-6">
              <span className="text-pink-500 text-sm font-extrabold">©</span>
              <span>محمد أبو السعود &amp; Sama</span>
            </div>

            {publishError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl">
                {publishError}
              </div>
            )}

            <div className="space-y-3 max-w-sm mx-auto">
              <button
                disabled={publishing}
                onClick={handlePublishQuiz}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:translate-y-0.5 text-white font-black text-lg rounded-2xl shadow-[0_6px_0_#0284c7] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-yellow-300" />
                <span>{publishing ? 'جاري النشر والحفظ في السيرفر...' : 'انشر الاختبار وطلع الرابط!'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setStep(3);
                  setCurrentQIndex(0);
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-colors cursor-pointer text-sm"
              >
                مراجعة الـ 20 سؤال
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('home');
                }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Published Success & Share */}
        {step === 5 && createdResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-sky-100 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h2 className="text-3xl font-black text-sky-950 mb-2">عاش يا بطل! اختبارك بقى جاهز!</h2>
            <p className="text-sm text-sky-700 font-bold mb-6">
              انسخ الرابط ده وابعته في الشات وعلى واتساب وإنستغرام وشوف مين هيجيب 20 من 20!
            </p>

            {/* Share Link Box */}
            <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-200 mb-6 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?q=${createdResult.publicCode}`}
                className="w-full bg-white px-3 py-2 text-center sm:text-right text-xs font-mono font-bold text-slate-800 rounded-xl border border-sky-200 select-all"
              />

              <button
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'تم النسخ يا باشا!' : 'نسخ الرابط'}</span>
              </button>
            </div>

            {/* Share Actions - NO self test taking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleNativeShare}
                className="py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>شير الرابط مع الشلة</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('manage', `${createdResult.quizId}:${createdResult.adminToken}`);
                }}
                className="py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span>لوحة التحكم ومتابعة الصحاب</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('leaderboard', createdResult.publicCode);
                }}
                className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>عرض لوحة المتصدرين</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('home');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Option */}
      {showAddOptionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-sky-200 animate-scale-up">
            <h3 className="text-lg font-black text-sky-950 mb-2 text-center">إضافة اختيار جديد</h3>
            <p className="text-xs text-sky-600 font-semibold mb-4 text-center">
              اكتب اختيار مخصص خاص بيك
            </p>

            <input
              type="text"
              value={newOptionInput}
              maxLength={100}
              onChange={e => setNewOptionInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddCustomOption();
              }}
              placeholder="اكتب الاختيار هنا..."
              className="w-full px-4 py-3 text-sm font-bold bg-sky-50 border-2 border-sky-200 rounded-xl mb-4 focus:border-sky-500 focus:outline-none"
              autoFocus
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCustomOption}
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm rounded-xl cursor-pointer"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddOptionModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Question */}
      {showCustomQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-purple-200 animate-scale-up">
            <h3 className="text-xl font-black text-purple-950 mb-1 text-center font-['Cairo']">
              اكتب سؤالك بنفسك ({customQuestionStep} من 3)
            </h3>

            {customQuestionStep === 1 && (
              <div className="mt-4">
                <label className="block text-xs font-black text-slate-700 mb-2">اكتب السؤال:</label>
                <textarea
                  rows={3}
                  value={customQText}
                  maxLength={200}
                  onChange={e => setCustomQText(e.target.value)}
                  placeholder="مثال: ايه أكتر حاجة بتفرحني لما أكون زعلان؟"
                  className="w-full p-3 text-sm font-bold bg-purple-50/50 border-2 border-purple-200 rounded-2xl mb-4 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    disabled={!customQText.trim()}
                    onClick={() => {
                      sound.playPop();
                      setCustomQuestionStep(2);
                    }}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-black text-sm rounded-xl cursor-pointer"
                  >
                    تمام، اكتب إجابتك الصح
                  </button>
                  <button
                    onClick={() => setShowCustomQuestionModal(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {customQuestionStep === 2 && (
              <div className="mt-4">
                <label className="block text-xs font-black text-emerald-700 mb-2">إجابتك الصحيحة ايه؟</label>
                <input
                  type="text"
                  value={customQCorrect}
                  maxLength={100}
                  onChange={e => setCustomQCorrect(e.target.value)}
                  placeholder="الإجابة الحقيقية بتاعتك"
                  className="w-full p-3 text-sm font-bold bg-emerald-50/50 border-2 border-emerald-300 rounded-2xl mb-4 focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    disabled={!customQCorrect.trim()}
                    onClick={() => {
                      sound.playPop();
                      setCustomQuestionStep(3);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black text-sm rounded-xl cursor-pointer"
                  >
                    تمام، اكتب 3 إجابات غلط
                  </button>
                  <button
                    onClick={() => setCustomQuestionStep(1)}
                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer"
                  >
                    رجوع
                  </button>
                </div>
              </div>
            )}

            {customQuestionStep === 3 && (
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-black text-rose-700">اكتب 3 إجابات غلط عشان يتلخبطوا:</label>
                {[0, 1, 2].map(idx => (
                  <input
                    key={idx}
                    type="text"
                    value={customQWrongs[idx]}
                    maxLength={100}
                    onChange={e => {
                      const updated = [...customQWrongs];
                      updated[idx] = e.target.value;
                      setCustomQWrongs(updated);
                    }}
                    placeholder={`إجابة غلط رقم ${idx + 1}`}
                    className="w-full p-2.5 text-xs font-bold bg-rose-50/40 border-2 border-rose-200 rounded-xl focus:border-rose-400 focus:outline-none"
                  />
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    disabled={customQWrongs.some(w => !w.trim())}
                    onClick={handleCustomQuestionDone}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-black text-sm rounded-xl cursor-pointer"
                  >
                    ضيف السؤال للاختبار
                  </button>
                  <button
                    onClick={() => setCustomQuestionStep(2)}
                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer"
                  >
                    رجوع
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
