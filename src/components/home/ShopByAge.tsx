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
      bgColor: 'bg-[#FFB7CE]/20', // pink tint
      textColor: 'text-[#5A5A40]',
      borderColor: 'border-[#F5F2ED]',
      icon: Baby
    },
    {
      code: '6-12M',
      title: '6 - 12 Months',
      subtitle: 'First Teethers & Crawling Toys',
      bgColor: 'bg-[#FFB347]/20', // honey tint
      textColor: 'text-[#5A5A40]',
      borderColor: 'border-[#F5F2ED]',
      icon: Smile
    },
    {
      code: '1-3Y',
      title: '1 - 3 Years',
      subtitle: 'Montessori Puzzles & Stacking',
      bgColor: 'bg-[#A0D2EB]/20', // sky blue tint
      textColor: 'text-[#5A5A40]',
      borderColor: 'border-[#F5F2ED]',
      icon: Sparkles
    },
    {
      code: '3-5Y',
      title: '3 - 5 Years',
      subtitle: 'Pre-school Math & Activity Cubes',
      bgColor: 'bg-[#B4F8C8]/30', // mint tint
      textColor: 'text-[#5A5A40]',
      borderColor: 'border-[#F5F2ED]',
      icon: Rocket
    },
    {
      code: '5Y+',
      title: '5+ Years',
      subtitle: 'Outdoor Balance Bikes & Play Tents',
      bgColor: 'bg-[#FDFD96]/50', // yellow tint
      textColor: 'text-[#5A5A40]',
      borderColor: 'border-[#F5F2ED]',
      icon: Heart
    }
  ];

  const handleAgeSelect = (ageCode: string) => {
    goToShop(router, { ageGroup: ageCode, categoryId: null, categoryIds: [], saleKey: null });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="text-center max-w-xl mx-auto mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A0D2EB]/20 text-[#5A5A40] text-xs font-bold mb-2">
          👶 Tailored Growth Milestones
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#5A5A40] tracking-tight">
          Shop by Baby Age Group
        </h2>
        <p className="text-xs sm:text-sm text-[#8C8C70] font-medium mt-1">
          Every stage of childhood deserves age-appropriate toys that foster learning & joy
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ageGroups.map((group, idx) => {
          const Icon = group.icon;
          return (
            <motion.div
              key={group.code}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => handleAgeSelect(group.code)}
              className={`${group.bgColor} ${group.borderColor} border rounded-3xl p-5 text-center cursor-pointer shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xs flex items-center justify-center ${group.textColor} shadow-xs mb-3`}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <span className={`text-xs font-black uppercase tracking-wider ${group.textColor}`}>
                  {group.code}
                </span>
                <h3 className="text-sm font-extrabold text-[#1E293B] mt-0.5">
                  {group.title}
                </h3>
                <p className="text-[11px] text-[#64748B] font-medium line-clamp-2 mt-1">
                  {group.subtitle}
                </p>
              </div>

              <div className={`mt-3 text-[11px] font-bold ${group.textColor} underline`}>
                Shop Stage →
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
