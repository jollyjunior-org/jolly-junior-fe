import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

export const FeaturedCategories: React.FC = () => {
  const { setCurrentView, setFilter, categories } = useShopStore();

  const activeCategories = categories.filter(cat => cat.isEnabled !== false);

  const handleCategorySelect = (slug: string) => {
    setFilter({ categoryId: slug });
    setCurrentView('shop');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A0D2EB]/20 text-[#5A5A40] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB347]" />
            <span>Discover by Category</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#5A5A40] tracking-tight">
            Explore Jolly Collections
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8C70] font-medium mt-1">
            Carefully curated baby essentials & educational toys for every growth milestone
          </p>
        </div>

        <button
          onClick={() => {
            setFilter({ categoryId: null });
            setCurrentView('shop');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB347] hover:text-[#5A5A40] group cursor-pointer"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Large Colorful Category Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {activeCategories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => handleCategorySelect(cat.slug)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 h-64 sm:h-72 border border-[#F5F2ED]"
            style={{ backgroundColor: cat.color }}
          >
            {/* Background Image with Hover Zoom */}
            <img
              src={cat.image}
              alt={cat.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
              <div className="transform group-hover:-translate-y-1 transition-transform duration-300 space-y-1">
                {/* Item Count Pill */}
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/30 mb-1">
                  {cat.itemCount} Items
                </span>

                <h3 className="text-base sm:text-lg font-black leading-tight text-white group-hover:text-[#FFB347] transition-colors">
                  {cat.name}
                </h3>

                <p className="text-[11px] text-slate-200 line-clamp-1 opacity-90 font-medium">
                  {cat.description}
                </p>
              </div>

              {/* Hover Arrow Badge */}
              <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-1 border-t border-white/20">
                <span className="text-[11px] font-bold text-[#FFB347]">Shop Now</span>
                <span className="w-6 h-6 rounded-full bg-white text-[#5A5A40] flex items-center justify-center text-xs shadow-xs">
                  →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
