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
    categories.filter(c => c.isEnabled === false).map(c => c.slug)
  );

  const filteredGifts = products.filter(p => {
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="bg-[#EEF5E8]/30 rounded-xl p-4 sm:p-6 border border-[#DDE8DC] shadow-xs">
        <div className="max-w-2xl text-center mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1C2B1E] text-xs font-bold shadow-2xs mb-2">
            <Gift className="w-3.5 h-3.5 text-[#C8A96A]" />
            <span>Interactive Gift Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B1E] tracking-tight">
            Find the Perfect Gift for Little Ones
          </h2>
          <p className="text-xs sm:text-sm text-[#5C7060] font-medium mt-1">
            Select baby age & your budget to discover curated toys, hampers and essentials
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#DDE8DC] max-w-3xl mx-auto mb-4 space-y-3">
          {/* Age Selection */}
          <div>
            <label className="block text-xs font-bold text-[#5C7060] uppercase tracking-wider mb-2">
              1. Choose Baby Age:
            </label>
            <div className="flex flex-wrap gap-2">
              {['0-6M', '6-12M', '1-3Y', '3-5Y', '5Y+'].map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    selectedAge === age
                      ? 'bg-[#1C2B1E] text-white shadow-xs'
                      : 'bg-[#F8FBF6] hover:bg-[#DDE8DC] text-[#1C2B1E] border border-[#DDE8DC]'
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
            <label className="block text-xs font-bold text-[#5C7060] uppercase tracking-wider mb-2">
              2. Select Price Budget:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Budgets' },
                { id: 'under-2000', label: 'Under Rs. 2,000' },
                { id: '2000-5000', label: 'Rs. 2,000 - Rs. 5,000' },
                { id: '5000-plus', label: 'Rs. 5,000+' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBudget(b.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    selectedBudget === b.id
                      ? 'bg-[#C8A96A] text-white shadow-xs'
                      : 'bg-[#F8FBF6] hover:bg-[#DDE8DC] text-[#1C2B1E] border border-[#DDE8DC]'
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredGifts.length > 0 ? (
            filteredGifts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))
          ) : (
            <div className="col-span-full py-10 text-center bg-white rounded-2xl p-6">
              <Gift className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1C2B1E]">No products match this exact combination.</p>
              <button
                onClick={() => {
                  setSelectedAge('0-6M');
                  setSelectedBudget('all');
                }}
                className="mt-3 px-4 py-1.5 bg-[#DDE8DC] text-[#1C2B1E] text-xs font-bold rounded-full cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() =>
              goToShop(router, {
                categoryId: 'gift-sets',
                categoryIds: ['gift-sets'],
                saleKey: null,
                searchQuery: '',
              })
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C2B1E] hover:bg-[#C8A96A] text-white font-extrabold text-xs rounded-full shadow-md transition-all cursor-pointer"
          >
            <span>Explore All Baby Shower Gift Hampers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
