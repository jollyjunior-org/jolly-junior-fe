'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import { LazyImage } from '../common/LazyImage';

export const FeaturedCategories: React.FC = () => {
  const router = useRouter();
  const { storefrontConfig, categories, products } = useShopStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const activeCategories = (
    (storefrontConfig.featuredCategories?.length
      ? storefrontConfig.featuredCategories
      : storefrontConfig.navCategories?.length
        ? storefrontConfig.navCategories
        : categories.filter((cat) => cat.isEnabled !== false)) || []
  )
    .slice()
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0) || a.name.localeCompare(b.name))
    .map((cat) => {
      const liveCount = products.filter(
        (p) =>
          p.isPublished !== false &&
          (p.categoryId === cat.id || p.categorySlug === cat.slug),
      ).length;
      return {
        ...cat,
        itemCount: cat.itemCount > 0 ? cat.itemCount : liveCount,
      };
    });

  const handleCategorySelect = (slug: string) => {
    goToShop(router, {
      categoryId: slug,
      categoryIds: [slug],
      saleKey: null,
      searchQuery: '',
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-[#0798AE] tracking-tight text-left">
            Categories
          </h2>
          <button
            onClick={() =>
              goToShop(router, {
                categoryId: null,
                categoryIds: [],
                saleKey: null,
                searchQuery: '',
              })
            }
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-[10px] sm:text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#FFD52F]" />
            <span>Discover by Category</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop Scroll Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Categories */}
      <div className="relative">
        {/* Mobile-only floating scroll arrows */}
        <button
          onClick={() => scroll('left')}
          className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -ml-2 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -mr-2 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain scroll-smooth no-scrollbar pb-4 snap-x snap-mandatory"
        >
          {activeCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => handleCategorySelect(cat.slug)}
              className="group relative rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 h-64 sm:h-72 border border-[#D9F1F5] flex-none w-[200px] sm:w-[240px] lg:w-[280px] snap-start"
              style={{ backgroundColor: cat.color }}
            >
              {/* Background Image with Hover Zoom */}
              {cat.image ? (
                <LazyImage
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  loaderSize="md"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}

              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-sm sm:text-base font-black leading-tight text-white group-hover:text-[#FFD52F] transition-colors">
                    {cat.name}
                  </h3>
                </div>

                {/* Hover Arrow Badge */}
                <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-1 border-t border-white/20">
                  <span className="text-[11px] font-bold text-[#FFD52F]">Shop Now</span>
                  <span className="w-6 h-6 rounded-full bg-white text-[#0798AE] flex items-center justify-center text-xs shadow-xs">
                    →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() =>
            goToShop(router, {
              categoryId: null,
              categoryIds: [],
              saleKey: null,
              searchQuery: '',
            })
          }
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0798AE] hover:bg-[#0798AE] hover:text-white border border-[#D9F1F5] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
