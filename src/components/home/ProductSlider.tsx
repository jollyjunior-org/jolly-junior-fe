import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';

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
  badgeColor = 'bg-[#A0D2EB]/20 text-[#5A5A40]'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setCurrentView, setFilter, categories } = useShopStore();

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

  const handleViewAll = () => {
    if (categoryFilterSlug) {
      setFilter({ categoryId: categoryFilterSlug });
    } else {
      setFilter({ categoryId: null });
    }
    setCurrentView('shop');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          {badge && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold mb-2 ${badgeColor}`}>
              <Sparkles className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-[#5A5A40] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#8C8C70] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-[#F5F2ED] hover:bg-[#F5F2ED] text-[#5A5A40] transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-[#F5F2ED] hover:bg-[#F5F2ED] text-[#5A5A40] transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FFB347] hover:text-[#5A5A40] cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory"
      >
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className="w-[260px] sm:w-[280px] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
