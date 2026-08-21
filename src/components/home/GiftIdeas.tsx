import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Sparkles, Check, ArrowRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';

export const GiftIdeas: React.FC = () => {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<string>('0-6M');
  const [selectedBudget, setSelectedBudget] = useState<'all' | 'under-2000' | '2000-5000' | '5000-plus'>('all');
  const { products, categories } = useShopStore();

  const disabledCategorySlugs = new Set(
    categories.filter((c) => c.isEnabled === false).map((c) => c.slug)
  );

  const filteredGifts = products.filter((p) => {
    if (p.isPublished === false) return false;
    if (disabledCategorySlugs.has(p.categoryId)) return false;

    // Filter by age
    if (selectedAge && p.ageGroup !== selectedAge) return false;

    // Filter by budget
    if (selectedBudget === 'under-2000' && p.price >= 2000) return false;
    if (selectedBudget === '2000-5000' && (p.price < 2000 || p.price > 5000)) return false;
    if (selectedBudget === '5000-plus' && p.price <= 5000) return false;

    return true;
  });

  return (
    <section className="py-12 sm:py-16 bg-[#FFFDE8]/80 border-y border-[#F5F0D3] relative overflow-hidden">
      {/* Decorative Background Accent Graphics */}
      <div className="absolute top-6 right-10 w-12 h-16 rounded-full bg-[#FFDFD3]/40 blur-xs pointer-events-none rotate-12" />
      <div className="absolute bottom-6 left-8 w-10 h-10 rounded-xl bg-[#D8EFE8]/50 blur-2xs pointer-events-none -rotate-12" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#4A5538] text-xs font-extrabold border border-[#ECE6C6] shadow-2xs mb-3">
            <Gift className="w-4 h-4 text-[#F47C4C]" />
            <span>Interactive Gift Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#4A5538] tracking-tight">
            Find the Perfect Gift for Little Ones
          </h2>
          <p className="text-xs sm:text-sm text-[#738268] max-w-xl mx-auto mt-2 font-medium leading-relaxed">
            Select baby age &amp; your budget to discover curated toys, hampers and essentials
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-7 shadow-xs border border-[#ECE6C6] max-w-3xl mx-auto mb-8 space-y-4">
          {/* Age Selection */}
          <div>
            <label className="block text-xs font-black text-[#4A5538] uppercase tracking-wider mb-2.5">
              1. Choose Baby Age:
            </label>
            <div className="flex flex-wrap gap-2">
              {['0-6M', '6-12M', '1-3Y', '3-5Y', '5Y+'].map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    selectedAge === age
                      ? 'bg-[#0798AE] text-white shadow-xs'
                      : 'bg-[#FFFDF7] hover:bg-[#F2FAFC] text-[#4A5538] border border-slate-200'
                  }`}
                >
                  {selectedAge === age && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Selection */}
          <div>
            <label className="block text-xs font-black text-[#4A5538] uppercase tracking-wider mb-2.5">
              2. Select Price Budget:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Budgets' },
                { id: 'under-2000', label: 'Under Rs. 2,000' },
                { id: '2000-5000', label: 'Rs. 2,000 - Rs. 5,000' },
                { id: '5000-plus', label: 'Rs. 5,000+' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBudget(b.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    selectedBudget === b.id
                      ? 'bg-[#FFB800] text-white shadow-xs'
                      : 'bg-[#FFFDF7] hover:bg-[#FFFBEB] text-[#4A5538] border border-slate-200'
                  }`}
                >
                  {selectedBudget === b.id && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Curated Gift Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredGifts.length > 0 ? (
            filteredGifts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))
          ) : (
            <div className="col-span-full py-10 text-center bg-white rounded-3xl p-6 border border-[#ECE6C6]">
              <Gift className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#4A5538]">No products match this exact combination.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedAge('0-6M');
                  setSelectedBudget('all');
                }}
                className="mt-3 px-4 py-1.5 bg-[#EBF7F6] text-[#0798AE] text-xs font-bold rounded-full cursor-pointer hover:bg-[#D5EFEF]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Explore All CTA */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() =>
              goToShop(router, {
                categoryId: 'gift-sets',
                categoryIds: ['gift-sets'],
                saleKey: null,
                searchQuery: '',
              })
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3A453C] hover:bg-[#263238] text-white font-black text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer active:scale-95"
          >
            <span>Explore All Baby Shower Gift Hampers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
