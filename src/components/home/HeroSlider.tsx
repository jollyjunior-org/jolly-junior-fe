import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import type { HeroSlideConfig } from '@/types';

import { LazyImage } from '@/components/common/LazyImage';
import { HeroSliderSkeleton } from '@/components/common/Skeleton';

/**
 * Homepage hero slider — clean full-image slides with a Shop Now button at bottom-left.
 * Shows mobileImageUrl on small screens, falls back to imageUrl on desktop.
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
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (!slides.length) return <HeroSliderSkeleton />;

  const slide = slides[currentIndex] || slides[0];

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
    <section className="relative w-full px-3 sm:px-6 pt-2 max-w-7xl mx-auto">
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md h-[240px] sm:h-[360px] md:h-[420px] lg:h-[480px] bg-slate-100"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Desktop image — hidden on small screens when mobile image exists */}
            <LazyImage
              src={slide.imageUrl}
              alt={slide.title}
              referrerPolicy="no-referrer"
              loaderSize="lg"
              containerClassName={`w-full h-full ${slide.mobileImageUrl ? 'hidden sm:block' : ''}`}
              className="w-full h-full object-cover object-center"
            />
            {/* Mobile image — shown only on small screens */}
            {slide.mobileImageUrl && (
              <LazyImage
                src={slide.mobileImageUrl}
                alt={slide.title}
                referrerPolicy="no-referrer"
                loaderSize="lg"
                containerClassName="w-full h-full block sm:hidden"
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Shop Now button — bottom-left */}
            <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-10">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleSlideClick}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FFD52F] text-[#263238] font-extrabold text-xs sm:text-sm shadow-lg hover:bg-[#0798AE] hover:text-white transition-all cursor-pointer transform hover:scale-105 group"
              >
                <span>{slide.buttonText}</span>
                <ArrowRight className="w-4 h-4 text-[#263238] group-hover:text-white transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

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

