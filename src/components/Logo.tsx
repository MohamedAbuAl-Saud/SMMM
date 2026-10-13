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
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${sizeClasses} flex-shrink-0 flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={logoUrl}
            alt="Bestiecheck SM"
            className="w-full h-full object-contain rounded-full p-0.5 bg-white/95 ring-2 ring-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.55),0_0_20px_rgba(244,114,182,0.25)] hover:shadow-[0_0_16px_rgba(56,189,248,0.75)] hover:scale-105 transition-all duration-200"
            onError={() => setImgError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 p-1.5 shadow-[0_0_12px_rgba(56,189,248,0.55)] flex items-center justify-center">
            <CuteBear className="w-full h-full" mood="happy" />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className={`font-extrabold tracking-tight text-sky-950 drop-shadow-xs font-['Fredoka','Cairo'] ${size === 'sm' ? 'text-xs sm:text-sm font-black' : 'text-xl sm:text-2xl'}`}>
            Bestiecheck <span className="text-pink-500">SM</span>
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-sky-700 font-extrabold -mt-1 tracking-wider">
              بيستي تشيك
            </span>
          )}
        </div>
      )}
    </div>
  );
}
