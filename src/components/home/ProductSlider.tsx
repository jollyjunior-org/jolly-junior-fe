'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categoryFilterSlug?: string;
  badge?: string;
  badgeColor?: string;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  products,
  categoryFilterSlug,
  badge = 'Handpicked',
  badgeColor = 'bg-[#0798AE]/20 text-[#0798AE]'
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { categories } = useShopStore();

  const disabledCategorySlugs = new Set(
    categories.filter(c => c.isEnabled === false).map(c => c.slug)
  );

  const visibleProducts = products.filter(
    p => p.isPublished !== false && !disabledCategorySlugs.has(p.categoryId)
  );

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

  /** Open shop and load that category from the API. */
  const handleViewAll = () => {
    const slug = categoryFilterSlug || null;
    goToShop(router, {
      categoryId: slug,
      categoryIds: slug ? [slug] : [],
      saleKey: null,
      searchQuery: '',
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleViewAll}
              className="text-xl sm:text-2xl font-black text-[#0798AE] tracking-tight cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              {title}
            </button>
            {badge && (
              <button
                onClick={handleViewAll}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-[10px] sm:text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#FFD52F]" />
                <span>{badge}</span>
              </button>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#0798AE] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Controls */}
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

      {/* Horizontal swipe — 2 cards visible on mobile */}
      <div className="relative">
        {/* Mobile-only floating scroll arrows */}
        <button
          onClick={() => scroll('left')}
          className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -ml-1 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -mr-1 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x snap-mandatory"
        >
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="w-[calc(50%-4px)] sm:w-[240px] md:w-[260px] shrink-0 snap-start"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0798AE] hover:bg-[#0798AE] hover:text-white border border-[#D9F1F5] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
