import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import type { HeroSlideConfig } from '@/types';
import { HeroSliderSkeleton } from '@/components/common/Skeleton';

/**
 * Homepage hero slider — stacked permanent DOM slide elements with CSS opacity transition.
 * Preloads image assets once and avoids re-requesting images on slide transitions.
 */
export const HeroSlider: React.FC = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { storefrontConfig } = useShopStore();

  const slides = useMemo(() => {
    return (storefrontConfig.heroSlides || []).filter(
      (slide): slide is HeroSlideConfig & { imageUrl: string } => Boolean(slide.imageUrl),
    );
  }, [storefrontConfig.heroSlides]);

  // Preload all hero slide images into browser cache once when slide configuration changes
  useEffect(() => {
    if (!slides.length) return;
    slides.forEach((s) => {
      if (s.imageUrl) {
        const img = new Image();
        img.src = s.imageUrl;
      }
      if (s.mobileImageUrl) {
        const mImg = new Image();
        mImg.src = s.mobileImageUrl;
      }
    });
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (!slides.length) return <HeroSliderSkeleton />;

  return (
    <section className="relative w-full px-3 sm:px-6 pt-2 max-w-7xl mx-auto">
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md h-[340px] sm:h-[400px] md:h-[450px] lg:h-[500px] bg-slate-100"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;

          const handleSlideClick = () => {
            const type = slide.linkType || 'category';
            const value = slide.linkValue || '';
            if (type === 'none') return;
            if (type === 'url' && value) {
              window.open(value, '_blank', 'noopener,noreferrer');
              return;
            }
            if (type === 'shop') {
              goToShop(router, { categoryId: null, categoryIds: [], searchQuery: '', saleKey: null });
            } else {
              goToShop(router, {
                categoryId: value || null,
                categoryIds: value ? [value] : [],
                searchQuery: '',
                saleKey: null,
              });
            }
          };

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Desktop image */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center ${
                  slide.mobileImageUrl ? 'hidden sm:block' : ''
                }`}
              />
              {/* Mobile image */}
              {slide.mobileImageUrl && (
                <img
                  src={slide.mobileImageUrl}
                  alt={slide.title}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center block sm:hidden"
                />
              )}

              {/* Shop Now button — bottom-left */}
              <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-10">
                <button
                  onClick={handleSlideClick}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FFD52F] text-[#263238] font-extrabold text-xs sm:text-sm shadow-lg hover:bg-[#0798AE] hover:text-white transition-all cursor-pointer transform hover:scale-105 group"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-[#263238] group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          );
        })}

        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

