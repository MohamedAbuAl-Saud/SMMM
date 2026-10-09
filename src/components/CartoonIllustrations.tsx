import React from 'react';

// Character "سما" (Sama) - Cute cartoon girl with pigtails, flower/bow, and rosy cheeks
export function SamaCharacter({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair Pigtails */}
      <circle cx="22" cy="46" r="14" fill="#6B3F20" stroke="#3D210F" strokeWidth="3.5" />
      <circle cx="98" cy="46" r="14" fill="#6B3F20" stroke="#3D210F" strokeWidth="3.5" />

      {/* Hair Bows */}
      <circle cx="28" cy="38" r="6" fill="#FF5376" />
      <circle cx="92" cy="38" r="6" fill="#FF5376" />

      {/* Face */}
      <circle cx="60" cy="62" r="38" fill="#FFE5D9" stroke="#3D210F" strokeWidth="3.5" />

      {/* Hair Bangs */}
      <path
        d="M26 50 Q60 22 94 50 Q85 36 60 36 Q35 36 26 50 Z"
        fill="#6B3F20"
        stroke="#3D210F"
        strokeWidth="3.5"
      />

      {/* Rosy Cheeks */}
      <ellipse cx="38" cy="74" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.9" />
      <ellipse cx="82" cy="74" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.9" />

      {/* Sparkling Big Eyes */}
      <ellipse cx="46" cy="60" rx="5" ry="6.5" fill="#2E1B0E" />
      <circle cx="44.5" cy="57" r="2.2" fill="#FFFFFF" />
      <circle cx="48" cy="63" r="1.2" fill="#FFFFFF" />

      <ellipse cx="74" cy="60" rx="5" ry="6.5" fill="#2E1B0E" />
      <circle cx="72.5" cy="57" r="2.2" fill="#FFFFFF" />
      <circle cx="76" cy="63" r="1.2" fill="#FFFFFF" />

      {/* Eyelashes */}
      <path d="M42 53 L38 50" stroke="#2E1B0E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 53 L82 50" stroke="#2E1B0E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Sweet Smile */}
      <path d="M54 74 Q60 81 66 74" stroke="#2E1B0E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Character "محمد" (Mohamed) - Cute cartoon boy with cheerful hair and rosy cheeks
export function MohamedCharacter({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="22" cy="62" r="9" fill="#FFE5D9" stroke="#261C14" strokeWidth="3.5" />
      <circle cx="98" cy="62" r="9" fill="#FFE5D9" stroke="#261C14" strokeWidth="3.5" />

      {/* Face */}
      <circle cx="60" cy="64" r="38" fill="#FFE5D9" stroke="#261C14" strokeWidth="3.5" />

      {/* Spiky / Fluffy Boy Hair */}
      <path
        d="M24 54 C20 30 35 18 60 18 C85 18 100 30 96 54 C92 40 78 30 60 30 C42 30 28 40 24 54 Z"
        fill="#3D2614"
        stroke="#261C14"
        strokeWidth="3.5"
      />
      {/* Hair Tuft on top */}
      <path d="M52 20 Q58 10 68 18" stroke="#261C14" strokeWidth="4" strokeLinecap="round" fill="#3D2614" />

      {/* Rosy Cheeks */}
      <ellipse cx="38" cy="74" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.85" />
      <ellipse cx="82" cy="74" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.85" />

      {/* Cheerful Eyes */}
      <ellipse cx="46" cy="60" rx="5" ry="6" fill="#261C14" />
      <circle cx="44.5" cy="58" r="2" fill="#FFFFFF" />

      <ellipse cx="74" cy="60" rx="5" ry="6" fill="#261C14" />
      <circle cx="72.5" cy="58" r="2" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M41 49 Q46 46 51 50" stroke="#261C14" strokeWidth="3" strokeLinecap="round" />
      <path d="M69 50 Q74 46 79 49" stroke="#261C14" strokeWidth="3" strokeLinecap="round" />

      {/* Big Boyish Grin */}
      <path d="M52 74 Q60 84 68 74" stroke="#261C14" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M55 76 Q60 82 65 76" fill="#D90429" />
    </svg>
  );
}

// Cute bear with rosy cheeks
export function CuteBear({ className = 'w-24 h-24', mood = 'happy' }: { className?: string; mood?: 'happy' | 'celebrate' | 'sad' | 'thinking' }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="28" cy="32" r="16" fill="#D4A373" stroke="#8C5832" strokeWidth="4" />
      <circle cx="28" cy="32" r="9" fill="#FFCCD5" />
      <circle cx="92" cy="32" r="16" fill="#D4A373" stroke="#8C5832" strokeWidth="4" />
      <circle cx="92" cy="32" r="9" fill="#FFCCD5" />

      {/* Head */}
      <rect x="20" y="24" width="80" height="74" rx="37" fill="#E8B991" stroke="#8C5832" strokeWidth="4" />

      {/* Rosy Cheeks */}
      <ellipse cx="36" cy="68" rx="8" ry="5" fill="#FF8FA3" opacity="0.85" />
      <ellipse cx="84" cy="68" rx="8" ry="5" fill="#FF8FA3" opacity="0.85" />

      {/* Snout */}
      <ellipse cx="60" cy="68" rx="16" ry="12" fill="#FAEDCD" />
      <polygon points="56,64 64,64 60,70" fill="#4A3525" />

      {/* Eyes based on mood */}
      {mood === 'happy' && (
        <>
          <ellipse cx="44" cy="54" rx="4.5" ry="5.5" fill="#3D2614" />
          <circle cx="42.5" cy="52.5" r="1.8" fill="#FFFFFF" />
          <ellipse cx="76" cy="54" rx="4.5" ry="5.5" fill="#3D2614" />
          <circle cx="74.5" cy="52.5" r="1.8" fill="#FFFFFF" />
          {/* Smile */}
          <path d="M54 71 Q60 77 66 71" stroke="#3D2614" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {mood === 'celebrate' && (
        <>
          {/* Closed smiling eyes */}
          <path d="M38 56 Q44 48 50 56" stroke="#3D2614" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M70 56 Q76 48 82 56" stroke="#3D2614" strokeWidth="3.5" strokeLinecap="round" />
          {/* Big open mouth */}
          <path d="M53 71 Q60 84 67 71 Z" fill="#D90429" stroke="#3D2614" strokeWidth="2.5" />
          <path d="M56 77 Q60 74 64 77" fill="#FFCCD5" />
          {/* Party Hat */}
          <polygon points="60,6 48,26 72,26" fill="#F72585" stroke="#7209B7" strokeWidth="2.5" />
          <circle cx="60" cy="5" r="4" fill="#FFD166" />
        </>
      )}

      {mood === 'sad' && (
        <>
          <ellipse cx="44" cy="54" rx="4.5" ry="5.5" fill="#3D2614" />
          <ellipse cx="76" cy="54" rx="4.5" ry="5.5" fill="#3D2614" />
          {/* Teardrop */}
          <path d="M85 64 Q87 69 83 71 Q79 69 81 64 Z" fill="#48CAE4" />
          {/* Grumpy / sad mouth */}
          <path d="M54 75 Q60 70 66 75" stroke="#3D2614" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {mood === 'thinking' && (
        <>
          <ellipse cx="44" cy="52" rx="4.5" ry="5.5" fill="#3D2614" />
          <ellipse cx="76" cy="52" rx="4.5" ry="5.5" fill="#3D2614" />
          {/* One raised eyebrow */}
          <path d="M38 44 Q44 40 48 44" stroke="#3D2614" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 44 Q76 47 80 44" stroke="#3D2614" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="74" r="3" fill="#3D2614" />
        </>
      )}
    </svg>
  );
}

// Cute Bunny with long ears
export function CuteBunny({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <rect x="36" y="8" width="16" height="42" rx="8" fill="#FFFFFF" stroke="#6B7280" strokeWidth="3.5" />
      <rect x="40" y="16" width="8" height="26" rx="4" fill="#FFCCD5" />

      <rect x="68" y="8" width="16" height="42" rx="8" fill="#FFFFFF" stroke="#6B7280" strokeWidth="3.5" />
      <rect x="72" y="16" width="8" height="26" rx="4" fill="#FFCCD5" />

      {/* Head */}
      <circle cx="60" cy="72" r="38" fill="#FFFFFF" stroke="#6B7280" strokeWidth="3.5" />

      {/* Cheeks */}
      <ellipse cx="38" cy="78" rx="7" ry="5" fill="#FFAFCC" opacity="0.9" />
      <ellipse cx="82" cy="78" rx="7" ry="5" fill="#FFAFCC" opacity="0.9" />

      {/* Eyes */}
      <circle cx="48" cy="66" r="4.5" fill="#1F2937" />
      <circle cx="46.5" cy="64.5" r="1.5" fill="#FFFFFF" />
      <circle cx="72" cy="66" r="4.5" fill="#1F2937" />
      <circle cx="70.5" cy="64.5" r="1.5" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="60" cy="74" rx="4" ry="3" fill="#FB7185" />
      <path d="M57 77 Q60 82 63 77" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Fluffy Cloud with cheerful eyes
export function FluffyCloud({ className = 'w-16 h-10', opacity = 'opacity-90' }: { className?: string; opacity?: string }) {
  return (
    <svg className={`${className} ${opacity}`} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 50 C12 50 5 44 5 36 C5 29 11 23 18 22 C20 12 30 5 42 5 C52 5 60 11 63 19 C68 17 73 17 77 20 C85 24 88 32 87 39 C93 41 97 46 96 52 C95 57 90 60 84 60 L20 60 Z"
        fill="#FFFFFF"
        stroke="#BAE6FD"
        strokeWidth="2.5"
      />
      <circle cx="45" cy="38" r="2" fill="#0284C7" />
      <circle cx="62" cy="38" r="2" fill="#0284C7" />
      <path d="M51 42 Q53.5 45 56 42" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="39" cy="40" rx="3" ry="1.8" fill="#F472B6" opacity="0.6" />
      <ellipse cx="68" cy="40" rx="3" ry="1.8" fill="#F472B6" opacity="0.6" />
    </svg>
  );
}

// Sparkling Star
export function CartoonStar({ className = 'w-8 h-8', fill = '#FBBF24' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14"
        fill={fill}
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Cartoon Trophy
export function CartoonTrophy({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="80" width="40" height="12" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="3" />
      <rect x="36" y="70" width="28" height="12" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />

      <path d="M30 30 C12 30 12 55 30 55" stroke="#D97706" strokeWidth="7" strokeLinecap="round" />
      <path d="M70 30 C88 30 88 55 70 55" stroke="#D97706" strokeWidth="7" strokeLinecap="round" />

      <path
        d="M26 22 L74 22 C74 22 74 58 50 68 C26 58 26 22 26 22 Z"
        fill="#FBBF24"
        stroke="#78350F"
        strokeWidth="3.5"
      />
      <polygon points="50,34 53,42 61,42 55,47 57,55 50,50 43,55 45,47 39,42 47,42" fill="#FFFFFF" />
    </svg>
  );
}

// Cartoon Pencil for Notebook
export function CartoonPencil({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="8" width="16" height="34" rx="3" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
      <polygon points="18,42 34,42 26,54" fill="#FDE68A" stroke="#78350F" strokeWidth="2.5" />
      <polygon points="23,49 29,49 26,54" fill="#374151" />
      <rect x="18" y="4" width="16" height="8" rx="2" fill="#F472B6" stroke="#78350F" strokeWidth="2" />
    </svg>
  );
}

// Avatar for Leaderboard
export function CartoonAvatar({ gender = 'unspecified', index = 0, className = 'w-14 h-14' }: { gender?: string; index?: number; className?: string }) {
  if (gender === 'female' || index % 2 === 1) {
    return (
      <div className={`${className} rounded-full border-3 border-pink-300 shadow-sm flex items-center justify-center p-1 bg-pink-100 overflow-hidden`}>
        <SamaCharacter className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-full border-3 border-sky-300 shadow-sm flex items-center justify-center p-1 bg-sky-100 overflow-hidden`}>
      <MohamedCharacter className="w-full h-full" />
    </div>
  );
}
