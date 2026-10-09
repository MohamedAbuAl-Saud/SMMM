import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CreateQuizPage } from './pages/CreateQuizPage.tsx';
import { PlayQuizPage } from './pages/PlayQuizPage.tsx';
import { QuizResultPage } from './pages/QuizResultPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { ManageQuizPage } from './pages/ManageQuizPage.tsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('bestie_seen_splash');
      return !seen;
    }
    return true;
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');

  // Handle URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qCode = params.get('q');
    const resultParam = params.get('result');
    const leaderboardParam = params.get('leaderboard');
    const manageParam = params.get('manage');

    if (qCode) {
      setCurrentView('play');
      setViewParam(qCode);
    } else if (resultParam) {
      setCurrentView('result');
      setViewParam(resultParam);
    } else if (leaderboardParam) {
      setCurrentView('leaderboard');
      setViewParam(leaderboardParam);
    } else if (manageParam) {
      setCurrentView('manage');
      setViewParam(manageParam);
    }
  }, []);

  const handleFinishSplash = () => {
    sessionStorage.setItem('bestie_seen_splash', 'true');
    setShowSplash(false);
  };

  const handleNavigate = (view: string, param: string = '') => {
    // Update window state cleanly without full reload
    setCurrentView(view);
    setViewParam(param);

    let newUrl = window.location.pathname;
    if (view === 'play' && param) {
      newUrl += `?q=${param}`;
    } else if (view === 'result' && param) {
      newUrl += `?result=${param}`;
    } else if (view === 'leaderboard' && param) {
      newUrl += `?leaderboard=${param}`;
    } else if (view === 'manage' && param) {
      newUrl += `?manage=${param}`;
    }
    window.history.pushState({}, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-['Cairo',sans-serif] text-slate-800 bg-sky-50 selection:bg-pink-200 selection:text-pink-900">
      {/* 2-Second Animated Splash Screen */}
      {showSplash && <SplashScreen onFinish={handleFinishSplash} />}

      {/* Persistent Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Dynamic View Routing */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentView === 'my-quizzes' && (
          <div className="flex-1">
            <HomePage onNavigate={handleNavigate} />
          </div>
        )}
        {currentView === 'create' && <CreateQuizPage onNavigate={handleNavigate} />}
        {currentView === 'play' && <PlayQuizPage publicCode={viewParam} onNavigate={handleNavigate} />}
        {currentView === 'result' && <QuizResultPage publicCode={viewParam} onNavigate={handleNavigate} />}
        {currentView === 'leaderboard' && <LeaderboardPage publicCode={viewParam} onNavigate={handleNavigate} />}
        {currentView === 'manage' && <ManageQuizPage param={viewParam} onNavigate={handleNavigate} />}
        {currentView === 'privacy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentView === 'terms' && <TermsPage onNavigate={handleNavigate} />}
      </div>

      {/* Persistent Footer with required copyright */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
