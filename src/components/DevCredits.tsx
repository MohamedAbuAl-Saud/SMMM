import React from 'react';

interface DevCreditsProps {
  className?: string;
}

export function DevCredits({ className = '' }: DevCreditsProps) {
  return (
    <div className={`mt-4 pt-3 border-t border-sky-100 text-center select-none ${className}`}>
      <p className="text-xs font-black text-sky-950 tracking-tight">Bestiecheck SM</p>
      <p className="text-xs font-bold text-pink-600 mt-0.5">© Mohamed Abu AlSaud & Sama ♥</p>
    </div>
  );
}
