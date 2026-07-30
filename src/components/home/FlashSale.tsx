import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';

export const FlashSale: React.FC = () => {
  const { setCurrentView, setFilter, products, categories } = useShopStore();

  const disabledCategorySlugs = new Set(
    categories.filter(c => c.isEnabled === false).map(c => c.slug)
  );

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(
    p => p.isPublished !== false &&
         !disabledCategorySlugs.has(p.categoryId) &&
         (p.discountBadge || p.badge === 'Flash Sale')
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Box */}
      <div className="bg-[#FDFD96]/40 rounded-3xl p-6 sm:p-8 border border-[#F5F2ED] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB347] text-white flex items-center justify-center shadow-md animate-bounce">
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#5A5A40] tracking-tight">
                  Daily Flash Deals
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFB347] text-white text-xs font-black">
                  UP TO 30% OFF
                </span>
              </div>
              <p className="text-xs text-[#8C8C70] font-medium mt-0.5">
                Handpicked premium baby essentials at extra special prices. Ends soon!
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#F5F2ED] shadow-2xs self-start md:self-auto">
            <Clock className="w-4 h-4 text-[#FFB347]" />
            <span className="text-xs font-bold text-[#5A5A40] mr-1">Ends in:</span>
            <div className="flex items-center gap-1 font-black text-sm text-[#5A5A40]">
              <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-7 text-center">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-7 text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-7 text-center">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Slider */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {flashProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setFilter({ onSaleOnly: true });
              setCurrentView('shop');
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white border border-[#F5F2ED] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
          >
            <span>View All Flash Deals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
