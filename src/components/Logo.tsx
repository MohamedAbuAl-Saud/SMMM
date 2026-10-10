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
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${sizeClasses} flex-shrink-0 flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={logoUrl}
            alt="Bestie Check SM"
            className="w-full h-full object-contain rounded-full p-1 bg-white/95 ring-2 ring-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.55),0_0_25px_rgba(244,114,182,0.25)] hover:shadow-[0_0_20px_rgba(56,189,248,0.75)] hover:scale-105 transition-all duration-200"
            onError={() => setImgError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 p-2 shadow-[0_0_15px_rgba(56,189,248,0.55)] flex items-center justify-center">
            <CuteBear className="w-full h-full" mood="happy" />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className="font-extrabold text-2xl tracking-tight text-sky-800 drop-shadow-sm font-['Fredoka','Cairo']">
            Bestie Check <span className="text-pink-500">SM</span>
          </span>
          <span className="text-xs text-sky-600 font-bold -mt-1 tracking-wider">
            اختبارات الصداقة والمرح
          </span>
        </div>
      )}
    </div>
  );
}
