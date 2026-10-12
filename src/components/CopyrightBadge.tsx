import React from 'react';
import { COPYRIGHT_TEXT } from '../lib/shareHelper.ts';

interface CopyrightBadgeProps {
  className?: string;
  variant?: 'subtle' | 'card' | 'pill';
}

export function CopyrightBadge({ className = '', variant = 'subtle' }: CopyrightBadgeProps) {
  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black text-sky-900 bg-sky-50/80 px-3 py-1 rounded-full border border-sky-200 shadow-xs select-none ${className}`}>
        <span dir="ltr">{COPYRIGHT_TEXT}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-500 select-none ${className}`}>
        <span dir="ltr">{COPYRIGHT_TEXT}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-500 select-none ${className}`}>
      <span dir="ltr">{COPYRIGHT_TEXT}</span>
    </div>
  );
}
