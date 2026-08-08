import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Baby, Sparkles, Heart, Rocket, Smile } from 'lucide-react';
import { goToShop } from '@/utils/navigate-shop';

export const ShopByAge: React.FC = () => {
  const router = useRouter();

  const ageGroups = [
    {
      code: '0-6M',
      title: '0 - 6 Months',
      subtitle: 'Newborn Discovery & Soft Rattles',
      bgColor: 'bg-[#D9F1F5]/40',
      textColor: 'text-[#263238]',
      borderColor: 'border-[#D9F1F5]',
      icon: Baby
    },
    {
      code: '6-12M',
      title: '6 - 12 Months',
      subtitle: 'First Teethers & Crawling Toys',
      bgColor: 'bg-[#DDBB8A]/25',
      textColor: 'text-[#263238]',
      borderColor: 'border-[#D9F1F5]',
      icon: Smile
    },
    {
      code: '1-3Y',
      title: '1 - 3 Years',
      subtitle: 'Montessori Puzzles & Stacking',
      bgColor: 'bg-[#FFD52F]/25',
      textColor: 'text-[#263238]',
      borderColor: 'border-[#D9F1F5]',
      icon: Sparkles
    },
    {
      code: '3-5Y',
      title: '3 - 5 Years',
      subtitle: 'Pre-school Math & Activity Cubes',
      bgColor: 'bg-[#D9F1F5]/60',
      textColor: 'text-[#263238]',
      borderColor: 'border-[#D9F1F5]',
      icon: Rocket
    },
    {
      code: '5Y+',
      title: '5+ Years',
      subtitle: 'Outdoor Balance Bikes & Play Tents',
      bgColor: 'bg-[#F47C4C]/15',
      textColor: 'text-[#263238]',
      borderColor: 'border-[#D9F1F5]',
      icon: Heart
    }
  ];

  const handleAgeSelect = (ageCode: string) => {
    goToShop(router, { ageGroup: ageCode, categoryId: null, categoryIds: [], saleKey: null });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="flex items-center mb-4">
        <button
          onClick={() => goToShop(router, { categoryId: null, categoryIds: [], saleKey: null, searchQuery: '' })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
        >
          👶 Shop by Age
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ageGroups.map((group, idx) => {
          const Icon = group.icon;
          return (
            <motion.div
              key={group.code}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => handleAgeSelect(group.code)}
              className={`${group.bgColor} ${group.borderColor} border rounded-xl p-4 text-center cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col items-center gap-2`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center ${group.textColor} shadow-xs`}>
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="pt-0.5">
                <h3 className="text-xs font-extrabold text-[#263238] leading-tight">
                  {group.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
