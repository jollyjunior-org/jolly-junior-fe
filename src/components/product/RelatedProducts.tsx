'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import * as productService from '@/services/product-service';

interface RelatedProductsProps {
  /** Current product id or slug — used to load related items */
  productRef: string;
  limit?: number;
}

/**
 * "You may also like" horizontal slider — saves vertical space on the product page.
 * Hidden when empty. No admin config required.
 */
export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productRef,
  limit = 8,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productRef) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const related = await productService.fetchRelatedProducts(productRef, limit);
        if (!cancelled) setItems(related);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [productRef, limit]);

  /** Smooth-scroll the product rail — one “page” of cards at a time. */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    // On mobile ~2 cards visible; scroll by roughly two cards
    const amount = clientWidth * 0.95;
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - amount : scrollLeft + amount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="pt-4 border-t border-[#F1F5F9]">
        <p className="text-xs font-bold text-[#607D80]">Finding similar products…</p>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="pt-4 border-t border-[#F1F5F9] space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD52F]" />
          <h2 className="text-lg sm:text-xl font-black text-[#263238]">You may also like</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
            title="Previous"
            aria-label="Scroll related products left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
            title="Next"
            aria-label="Scroll related products right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x snap-mandatory"
      >
        {items.map((p) => (
          <div
            key={p.id}
            className="w-[calc(50%-4px)] sm:w-[200px] md:w-[220px] shrink-0 snap-start"
          >
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
};
