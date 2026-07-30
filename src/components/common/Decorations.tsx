import React from 'react';

export const BackgroundDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 select-none">
      {/* Floating Cloud Top Left */}
      <div className="absolute top-12 left-6 animate-float text-[#A0D2EB]">
        <svg width="64" height="40" viewBox="0 0 64 40" fill="currentColor">
          <path d="M16 32h36a12 12 0 0 0 2-23.8A16 16 0 0 0 22 10a12 12 0 0 0-6 22z" />
        </svg>
      </div>

      {/* Floating Star Top Right */}
      <div className="absolute top-20 right-10 animate-float-delayed text-[#FFB347]">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* Soft Pastel Balloon Right Center */}
      <div className="absolute top-1/3 right-8 animate-float text-[#FFB7CE]">
        <svg width="40" height="52" viewBox="0 0 24 32" fill="currentColor">
          <ellipse cx="12" cy="12" rx="10" ry="12" />
          <path d="M12 24l-1 4h2l-1-4z" />
          <path d="M12 28c-2 2-2 4 0 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Toy Block Left Center */}
      <div className="absolute top-1/2 left-8 animate-float-delayed text-[#B4F8C8]">
        <div className="w-9 h-9 border-2 border-[#5A5A40] text-[#5A5A40] rounded-lg flex items-center justify-center font-black text-xs transform -rotate-12 bg-[#B4F8C8]">
          J
        </div>
      </div>

      {/* Teddy Bear Silhouette Bottom Right */}
      <div className="absolute bottom-32 right-12 animate-float text-[#FFB347]/60">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="12" cy="14" r="8" />
          <circle cx="9.5" cy="12" r="1" fill="#FFF" />
          <circle cx="14.5" cy="12" r="1" fill="#FFF" />
        </svg>
      </div>

      {/* Cute Rainbow Bottom Left */}
      <div className="absolute bottom-20 left-10 animate-float-delayed">
        <svg width="60" height="35" viewBox="0 0 60 35" fill="none">
          <path d="M5 35 A25 25 0 0 1 55 35" stroke="#FFB7CE" strokeWidth="4" strokeLinecap="round" />
          <path d="M12 35 A18 18 0 0 1 48 35" stroke="#FFB347" strokeWidth="4" strokeLinecap="round" />
          <path d="M19 35 A11 11 0 0 1 41 35" stroke="#A0D2EB" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

