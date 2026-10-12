import React, { useState } from 'react';
import { CuteBear } from './CartoonIllustrations.tsx';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = '/SM.jpg';

  const sizeClasses = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28 sm:w-32 sm:h-32',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      <div className={`relative ${sizeClasses} flex-shrink-0 flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={logoUrl}
            alt="Bestie Check SM"
            className="w-full h-full object-contain rounded-full p-0.5 bg-white/95 ring-2 ring-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.5),0_0_20px_rgba(244,114,182,0.2)] hover:shadow-[0_0_18px_rgba(56,189,248,0.75)] hover:scale-105 transition-all duration-200"
            onError={() => setImgError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 p-1.5 shadow-[0_0_12px_rgba(56,189,248,0.5)] flex items-center justify-center">
            <CuteBear className="w-full h-full" mood="happy" />
          </div>
        )}
      </div>

      {showText && (
        <div className={`flex flex-col text-right leading-tight ${size === 'sm' ? 'justify-center max-w-[200px]' : ''}`}>
          <span className={`font-black text-sky-900 drop-shadow-xs font-['Fredoka','Cairo'] ${
            size === 'sm' 
              ? 'text-[11px] sm:text-xs md:text-sm tracking-widest leading-none scale-y-95 inline-flex items-baseline gap-1' 
              : 'text-lg sm:text-2xl tracking-wider leading-none'
          }`}>
            <span>Bestie Check</span> <span className="text-pink-500 font-black tracking-widest">SM</span>
          </span>
          <span className={`text-sky-600 font-extrabold tracking-wider ${
            size === 'sm' 
              ? 'text-[8.5px] sm:text-[9.5px] mt-0.5 opacity-90 leading-none' 
              : 'text-xs mt-1'
          }`}>
            اختبارات الصداقة والمرح
          </span>
        </div>
      )}
    </div>
  );
}
