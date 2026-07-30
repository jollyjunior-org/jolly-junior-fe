import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  categorySlug: string;
  image: string;
  buttonText: string;
  accentColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: '✨ Premium Montessori Collection',
    title: 'Nurture Curiosity with Sustainable Wooden Toys',
    subtitle: 'Thoughtfully designed wooden puzzles, stacking blocks & cognitive sorting toys for little minds.',
    categorySlug: 'educational-toys',
    image: '/src/assets/images/jolly_hero_banner_1_1785146193121.jpg',
    buttonText: 'Explore Educational Toys',
    accentColor: '#F59E0B'
  },
  {
    id: 'slide-2',
    badge: '🍼 Soft Mealtime & Baby Care',
    title: 'BPA-Free Silicone Feeding & Nursery Essentials',
    subtitle: 'Suction plates, ergonomic training cups and organic bath washes designed for gentle care.',
    categorySlug: 'feeding',
    image: '/src/assets/images/jolly_hero_banner_2_1785146211724.jpg',
    buttonText: 'Shop Feeding Accessories',
    accentColor: '#EC4899'
  },
  {
    id: 'slide-3',
    badge: '🌙 Organic Sleep & Newborn Bliss',
    title: '100% Organic Muslin Swaddles & Snuggle Rattles',
    subtitle: 'Breathable, cloud-soft organic cotton blankets and soothing plush rattles for serene nursery dreams.',
    categorySlug: 'newborn-essentials',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Discover Newborn Essentials',
    accentColor: '#3B82F6'
  },
  {
    id: 'slide-4',
    badge: '🎁 Welcome Baby Gift Sets',
    title: 'Curated Keepsake Hampers for Baby Showers',
    subtitle: 'Handwoven seagrass baskets filled with milestone blocks, plush toys, and organic onesies.',
    categorySlug: 'gift-sets',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Browse Gift Hampers',
    accentColor: '#10B981'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setCurrentView, setFilter } = useShopStore();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentIndex];

  const handleSlideClick = (categorySlug: string) => {
    setFilter({ categoryId: categorySlug });
    setCurrentView('shop');
  };

  return (
    <section 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Banner Card with Rounded Corners & Soft Shadow */}
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
            {/* Background Lifestyle Image */}
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center p-6 sm:p-12 md:p-16">
              <div className="max-w-xl text-white space-y-3 sm:space-y-4">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB347]" />
                  <span>{slide.badge}</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm"
                >
                  {slide.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs sm:text-base text-slate-100 font-medium leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Shop Now Button */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => handleSlideClick(slide.categorySlug)}
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

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#5A5A40] shadow-md backdrop-blur-xs transition-all cursor-pointer z-20 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#5A5A40] shadow-md backdrop-blur-xs transition-all cursor-pointer z-20 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
