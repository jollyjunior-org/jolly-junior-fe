import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';

export const FeaturedCategories: React.FC = () => {
  const router = useRouter();
  const { storefrontConfig, categories, products } = useShopStore();

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
      // Prefer API item_count; fall back to live product list if missing
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
      {/* Section Header — badge + View All on same line */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD52F]" />
          <span>Discover by Category</span>
        </div>
        <button
          onClick={() =>
            goToShop(router, {
              categoryId: null,
              categoryIds: [],
              saleKey: null,
              searchQuery: '',
            })
          }
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0798AE] hover:text-[#0798AE] group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
            className="group relative rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 h-64 sm:h-72 border border-[#D9F1F5]"
            style={{ backgroundColor: cat.color }}
          >
            {/* Background Image with Hover Zoom */}
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
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
    </section>
  );
};
