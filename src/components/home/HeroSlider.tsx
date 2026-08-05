import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import type { HeroSlideConfig } from '@/types';

/**
 * Homepage hero slider — each slide is a category (image/name/description from Categories).
 */
export const HeroSlider: React.FC = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { storefrontConfig } = useShopStore();

  const slides = (storefrontConfig.heroSlides || []).filter(
    (slide): slide is HeroSlideConfig & { imageUrl: string } => Boolean(slide.imageUrl),
  );

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  useEffect(() => {
    if (currentIndex >= slides.length) setCurrentIndex(0);
  }, [slides.length, currentIndex]);

  if (!slides.length) {
    return null;
  }

  const slide = slides[currentIndex] || slides[0];

  /** Navigate based on slide link settings from admin. */
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
    <section
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#F5F2ED] bg-[#FFFDF8] h-[380px] sm:h-[460px] md:h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center p-6 sm:p-12 md:p-16">
              <div className="max-w-xl text-white space-y-3 sm:space-y-4">
                {slide.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB347]" />
                    <span>{slide.badge}</span>
                  </motion.div>
                )}

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm"
                >
                  {slide.title}
                </motion.h1>

                {slide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs sm:text-base text-slate-100 font-medium leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none"
                  >
                    {slide.subtitle}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <button
                    onClick={handleSlideClick}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#5A5A40] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#FFB347] transition-all cursor-pointer transform hover:scale-105"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#5A5A40] shadow-md backdrop-blur-xs transition-all cursor-pointer z-20 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#5A5A40] shadow-md backdrop-blur-xs transition-all cursor-pointer z-20 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

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
          </>
        )}
      </div>
    </section>
  );
};
