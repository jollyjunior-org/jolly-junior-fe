import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  /** Navigate to home when the logo is clicked. */
  onNavigateHome?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true,
  onNavigateHome,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWinking, setIsWinking] = useState(false);

  const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 md:w-13 md:h-13',
    lg: 'w-16 h-16 md:w-20 md:h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl'
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] md:text-[11px]',
    lg: 'text-xs'
  };

  /** Wink animation + go to the main/home page. */
  const handleLogoClick = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 1200);
    onNavigateHome?.();
  };

  return (
    <div 
      className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleLogoClick}
      role="link"
      aria-label="Jolly Juniors home"
    >
      {/* Cartoon Mascot Emblem - "Jolly the Cub" */}
      <div className="relative flex items-center justify-center">
        {/* Soft Glowing Aura on Hover */}
        <div className={`absolute -inset-1 bg-gradient-to-tr from-[#FFB7CE] via-[#FFB347] to-[#A0D2EB] rounded-full blur-xs opacity-40 transition-opacity duration-300 ${isHovered ? 'opacity-90 scale-105' : ''}`} />

        {/* Outer Circular Badge */}
        <div className={`${containerSizes[size]} relative rounded-full bg-gradient-to-b from-[#FFFDF8] to-[#FFF3DC] border-2 border-[#FFB347]/40 shadow-sm overflow-visible flex items-center justify-center transform transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
          
          {/* Floating Sparkles on Hover */}
          {(isHovered || isWinking) && (
            <>
              <span className="absolute -top-2 -right-1 text-xs animate-star-twinkle z-20">✨</span>
              <span className="absolute -bottom-1 -left-2 text-[10px] animate-star-twinkle z-20" style={{ animationDelay: '0.4s' }}>⭐</span>
              <span className="absolute top-0 -left-2 text-[10px] animate-star-twinkle z-20" style={{ animationDelay: '0.8s' }}>💖</span>
            </>
          )}

          {/* Animated Cartoon Bear SVG - "Jolly" */}
          <div className="w-full h-full p-1 relative flex items-center justify-center animate-mascot-bounce">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full drop-shadow-xs overflow-visible"
            >
              <defs>
                {/* Bear Fur Gradients */}
                <linearGradient id="bearFur" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFAA33" />
                  <stop offset="100%" stopColor="#E68A00" />
                </linearGradient>
                <linearGradient id="innerEar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFC0CB" />
                  <stop offset="100%" stopColor="#FF94A8" />
                </linearGradient>
                <linearGradient id="snoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" />
                  <stop offset="100%" stopColor="#FFEBB3" />
                </linearGradient>
                <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FF9900" />
                </linearGradient>
              </defs>

              {/* 1. Ears with Wiggle Animation */}
              <g className="animate-ear-left">
                <circle cx="28" cy="28" r="14" fill="url(#bearFur)" stroke="#C67600" strokeWidth="2" />
                <circle cx="28" cy="28" r="8" fill="url(#innerEar)" />
              </g>
              <g className="animate-ear-right">
                <circle cx="72" cy="28" r="14" fill="url(#bearFur)" stroke="#C67600" strokeWidth="2" />
                <circle cx="72" cy="28" r="8" fill="url(#innerEar)" />
              </g>

              {/* 2. Main Head */}
              <ellipse cx="50" cy="54" rx="34" ry="30" fill="url(#bearFur)" stroke="#C67600" strokeWidth="2.5" />

              {/* 3. Tiny Party Crown with Star */}
              <g transform="translate(38, 12)">
                <polygon points="0,15 6,0 12,12 18,0 24,15" fill="url(#crownGrad)" stroke="#B36B00" strokeWidth="1.5" />
                <circle cx="12" cy="-3" r="3" fill="#FF4D4D" />
                <path d="M 12 -5 L 13 -1 L 17 -1 L 14 1 L 15 5 L 12 3 L 9 5 L 10 1 L 7 -1 L 11 -1 Z" fill="#FFFFFF" transform="scale(0.5) translate(12, -8)" />
              </g>

              {/* 4. Rosy Cheeks */}
              <ellipse cx="28" cy="58" rx="7" ry="4" fill="#FFB7CE" opacity="0.85" className="animate-pulse-soft" />
              <ellipse cx="72" cy="58" rx="7" ry="4" fill="#FFB7CE" opacity="0.85" className="animate-pulse-soft" />

              {/* 5. Snout & Nose */}
              <ellipse cx="50" cy="62" rx="15" ry="11" fill="url(#snoutGrad)" stroke="#D9A05B" strokeWidth="1.5" />
              {/* Cute Shiny Nose */}
              <path d="M 44 56 Q 50 53 56 56 Q 50 64 44 56 Z" fill="#4A2E10" />
              <ellipse cx="48" cy="56" rx="2" ry="1" fill="#FFFFFF" opacity="0.8" />

              {/* Cheerful Mouth */}
              <path d="M 45 64 Q 50 68 55 64" fill="none" stroke="#4A2E10" strokeWidth="2" strokeLinecap="round" />
              {(isHovered || isWinking) && (
                <path d="M 47 65 Q 50 71 53 65 Z" fill="#FF6B8B" />
              )}

              {/* 6. Cartoon Eyes (Normal or Wink) */}
              {isWinking || (isHovered && Math.random() > 0.5) ? (
                /* Winking Face */
                <g>
                  {/* Left Eye - Wide Open & Happy */}
                  <circle cx="34" cy="48" r="5" fill="#3D2314" />
                  <circle cx="32" cy="46" r="2" fill="#FFFFFF" />
                  
                  {/* Right Eye - Playful Wink ^ */}
                  <path d="M 61 50 L 66 45 L 71 50" fill="none" stroke="#3D2314" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : (
                /* Normal Eyes with Blinking Animation */
                <g className="animate-eye-blink">
                  {/* Left Eye */}
                  <circle cx="34" cy="48" r="5" fill="#3D2314" />
                  <circle cx="32" cy="46" r="2" fill="#FFFFFF" />
                  <circle cx="36" cy="50" r="0.8" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <circle cx="66" cy="48" r="5" fill="#3D2314" />
                  <circle cx="64" cy="46" r="2" fill="#FFFFFF" />
                  <circle cx="68" cy="50" r="0.8" fill="#FFFFFF" />
                </g>
              )}

              {/* 7. Cute Waving Paw on Right */}
              <g className={`animate-paw-wave ${isHovered ? 'scale-110' : ''}`}>
                <ellipse cx="80" cy="74" rx="7" ry="9" fill="url(#bearFur)" stroke="#C67600" strokeWidth="2" transform="rotate(-20 80 74)" />
                <ellipse cx="80" cy="74" rx="4" ry="5" fill="url(#innerEar)" transform="rotate(-20 80 74)" />
              </g>

              {/* 8. JJ Badge Bowtie */}
              <g transform="translate(50, 80)">
                <path d="M -12 -3 L 0 2 L -12 7 Z" fill="#FF5252" />
                <path d="M 12 -3 L 0 2 L 12 7 Z" fill="#FF5252" />
                <circle cx="0" cy="2" r="5" fill="#FFD700" stroke="#B38F00" strokeWidth="1" />
                <text x="0" y="4.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#4A2E10" fontFamily="sans-serif">JJ</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Text Styling */}
      <div className="flex flex-col justify-center">
        <div className={`font-extrabold tracking-tight flex items-center gap-0.5 text-[#5A5A40] ${textSizes[size]}`}>
          <span className="text-[#FFB347] font-black group-hover:animate-bounce inline-block">J</span>
          <span className="group-hover:text-[#FFB347] transition-colors">olly</span>
          <span className="text-[#A0D2EB] font-black group-hover:animate-bounce inline-block" style={{ animationDelay: '0.1s' }}>J</span>
          <span className="group-hover:text-[#A0D2EB] transition-colors">uniors</span>
          <span className="text-[#FFB7CE] font-black text-xl animate-pulse">.</span>
        </div>

        {showSubtitle && (
          <span className={`${subtitleSizes[size]} font-bold tracking-wider text-[#8C8C70] uppercase -mt-0.5 flex items-center gap-1`}>
            <span>Baby Care & Sustainable Toys</span>
            <span className={`inline-block transition-transform duration-300 ${isHovered ? 'rotate-12 scale-125 text-[#FFB347]' : 'text-slate-400'}`}>🎈</span>
          </span>
        )}
      </div>
    </div>
  );
};


