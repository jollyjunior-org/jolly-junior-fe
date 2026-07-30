import React from 'react';
import { BrandLogo } from './BrandLogo';
import { MessageSquare, Phone, Mail, MapPin, Heart, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

export const Footer: React.FC = () => {
  const { setCurrentView, setFilter } = useShopStore();

  const handleCategoryLink = (slug: string) => {
    setFilter({ categoryId: slug });
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white border-t border-[#F5F2ED] pt-12 pb-24 md:pb-12 mt-16 text-[#5A5A40]">
      {/* Decorative Wave Top Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 text-white fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.3,130.83,121.1,200,110.2,241.6,103.7,282.8,80.4,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#FFFDF8] rounded-3xl border border-[#F5F2ED] text-center">
          <div className="p-2 space-y-1">
            <Truck className="w-6 h-6 text-[#FFB7CE] mx-auto" />
            <h4 className="text-xs font-black text-[#5A5A40]">Free Shipping</h4>
            <p className="text-[11px] text-[#8C8C70]">On all orders over Rs. 3,000</p>
          </div>
          <div className="p-2 space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#2E6038] mx-auto" />
            <h4 className="text-xs font-black text-[#5A5A40]">100% Non-Toxic</h4>
            <p className="text-[11px] text-[#8C8C70]">Child-safe eco materials</p>
          </div>
          <div className="p-2 space-y-1">
            <MessageSquare className="w-6 h-6 text-[#A0D2EB] mx-auto" />
            <h4 className="text-xs font-black text-[#5A5A40]">WhatsApp Support</h4>
            <p className="text-[11px] text-[#8C8C70]">Instant parent assistance</p>
          </div>
          <div className="p-2 space-y-1">
            <Sparkles className="w-6 h-6 text-[#FFB347] mx-auto" />
            <h4 className="text-xs font-black text-[#5A5A40]">Easy Returns</h4>
            <p className="text-[11px] text-[#8C8C70]">7-Day replacement guarantee</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs text-[#8C8C70] leading-relaxed font-medium">
              JollyJuniors.com is Pakistan's premier online store for Montessori educational toys, certified organic baby care products, feeding sets, and luxury baby shower gift hampers.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://wa.me/923001234567" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#B4F8C8] text-[#2E6038] text-xs font-bold flex items-center gap-1.5 hover:bg-[#A0E8B8] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>+92 300 1234567</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#5A5A40] uppercase tracking-wider">
              Top Categories
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-[#8C8C70]">
              <li><button onClick={() => handleCategoryLink('educational-toys')} className="hover:text-[#FFB347] cursor-pointer">Educational Toys</button></li>
              <li><button onClick={() => handleCategoryLink('baby-toys')} className="hover:text-[#FFB347] cursor-pointer">Baby Toys & Rattles</button></li>
              <li><button onClick={() => handleCategoryLink('feeding')} className="hover:text-[#FFB347] cursor-pointer">Silicone Feeding Sets</button></li>
              <li><button onClick={() => handleCategoryLink('bath-care')} className="hover:text-[#FFB347] cursor-pointer">Tear-Free Bath Care</button></li>
              <li><button onClick={() => handleCategoryLink('newborn-essentials')} className="hover:text-[#FFB347] cursor-pointer">Newborn Organic Swaddles</button></li>
              <li><button onClick={() => handleCategoryLink('gift-sets')} className="hover:text-[#FFB347] cursor-pointer">Baby Shower Gift Hampers</button></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#5A5A40] uppercase tracking-wider">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-[#8C8C70]">
              <li className="hover:text-[#FFB347] cursor-pointer">Track Your Order</li>
              <li className="hover:text-[#FFB347] cursor-pointer">Shipping & Delivery Policy</li>
              <li className="hover:text-[#FFB347] cursor-pointer">7-Day Easy Returns</li>
              <li className="hover:text-[#FFB347] cursor-pointer">FAQs & Parent Help</li>
              <li className="hover:text-[#FFB347] cursor-pointer">Wholesale & Gift Registry</li>
            </ul>
          </div>

          {/* Payments & Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#5A5A40] uppercase tracking-wider">
              Accepting Payments
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#5A5A40]">
              <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#F5F2ED] rounded-lg">Cash on Delivery</span>
              <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#F5F2ED] rounded-lg">Visa / Mastercard</span>
              <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#F5F2ED] rounded-lg">JazzCash / EasyPaisa</span>
            </div>
            <p className="text-[11px] text-[#8C8C70] pt-2">
              📍 Dispatch Centers in Lahore, Karachi & Islamabad. Same-day delivery available.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#F5F2ED] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8C70] font-medium gap-3">
          <p>© {new Date().getFullYear()} JollyJuniors.com. All Rights Reserved. Crafted with ❤️ for parents & babies.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
