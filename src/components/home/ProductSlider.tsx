'use client';

import React, { useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import { ProductCardSkeleton } from '../common/Skeleton';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products?: Product[];
  categoryFilterSlug?: string;
  sourceType?: string;
  sourceValue?: string;
  badge?: string;
  badgeColor?: string;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  subtitle,
  products: propProducts,
  categoryFilterSlug,
  sourceType,
  sourceValue,
  badge = 'Handpicked',
  badgeColor = 'bg-[#0798AE]/20 text-[#0798AE]'
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products: storeProducts, categories } = useShopStore();

  const disabledCategorySlugs = useMemo(
    () => new Set(categories.filter((c) => c.isEnabled === false).map((c) => c.slug)),
    [categories]
  );

  const rawList = propProducts || storeProducts;

  const visibleProducts = useMemo(() => {
    return rawList.filter(
      (p) => p.isPublished !== false && !disabledCategorySlugs.has(p.categoryId)
    );
  }, [rawList, disabledCategorySlugs]);

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

  /** Open shop and load that category/tag/badge filter from the API. */
  const handleViewAll = () => {
    if (sourceType === 'category' && (categoryFilterSlug || sourceValue)) {
      const slug = categoryFilterSlug || sourceValue;
      goToShop(router, {
        categoryId: slug,
        categoryIds: [slug],
        saleKey: null,
        searchQuery: '',
      });
    } else if (sourceType === 'discount' || (sourceType === 'rule' && sourceValue === 'sale')) {
      goToShop(router, {
        categoryId: null,
        categoryIds: [],
        saleKey: 'on-sale',
        searchQuery: '',
      });
    } else if (sourceValue && (sourceType === 'tag' || sourceType === 'badge')) {
      goToShop(router, {
        categoryId: null,
        categoryIds: [],
        saleKey: null,
        searchQuery: sourceValue,
      });
    } else {
      goToShop(router, {
        categoryId: null,
        categoryIds: [],
        saleKey: null,
        searchQuery: '',
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-[#0798AE] tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center gap-1 ${badgeColor}`}>
              <Sparkles className="w-3 h-3 text-[#FFD52F]" />
              {badge}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500 font-bold hidden md:inline-block">
              · {subtitle}
            </span>
          )}
        </div>

        {/* Scroll Arrows Controls */}
        <div className="flex items-center gap-1.5">
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

      {/* Products Horizontal Rail */}
      <div className="relative">
        {/* Mobile Floating Controls */}
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
          {visibleProducts.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[calc(50%-4px)] sm:w-[240px] md:w-[260px] shrink-0 snap-start"
              >
                <ProductCardSkeleton compact />
              </div>
            ))
          ) : (
            visibleProducts.map((product) => (
              <div
                key={product.id}
                className="w-[calc(50%-4px)] sm:w-[240px] md:w-[260px] shrink-0 snap-start"
              >
                <ProductCard product={product} compact />
              </div>
            ))
          )}
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
