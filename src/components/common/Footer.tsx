import React from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import {
  MessageSquare, ShieldCheck, Sparkles, Truck, Instagram,
} from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';

/** Simple Facebook glyph for the footer social row. */
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M14 13.5h2.5l.5-3H14V8.5c0-.9.3-1.5 1.6-1.5H17V4.1C16.4 4 15.5 4 14.6 4 12.2 4 10.5 5.5 10.5 8.2V10.5H8v3h2.5V20h3.5v-6.5z" />
  </svg>
);

export const Footer: React.FC = () => {
  const router = useRouter();
  const { storefrontConfig } = useShopStore();

  /** Open shop filtered to one category slug. */
  const handleCategoryLink = (slug: string) => {
    goToShop(router, { categoryId: slug, categoryIds: [slug], saleKey: null, searchQuery: '' });
  };

  const topCategories = storefrontConfig.footerCategories || [];
  const instagramUrl = storefrontConfig.footerInstagramUrl || 'https://www.instagram.com/JollyJuniorsStore/';
  const facebookUrl = storefrontConfig.footerFacebookUrl || 'https://www.facebook.com/';

  return (
    <footer className="relative bg-white border-t border-[#DDE8DC] pt-12 pb-24 md:pb-12 mt-16 text-[#1C2B1E]">
      {/* Decorative Wave Top Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 text-white fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.3,130.83,121.1,200,110.2,241.6,103.7,282.8,80.4,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#F8FBF6] rounded-3xl border border-[#DDE8DC] text-center">
          <div className="p-2 space-y-1">
            <Truck className="w-6 h-6 text-[#B5C9A8] mx-auto" />
            <h4 className="text-xs font-black text-[#1C2B1E]">Free Shipping</h4>
            <p className="text-[11px] text-[#5C7060]">On all orders over Rs. 3,000</p>
          </div>
          <div className="p-2 space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#2D5A3D] mx-auto" />
            <h4 className="text-xs font-black text-[#1C2B1E]">100% Non-Toxic</h4>
            <p className="text-[11px] text-[#5C7060]">Child-safe eco materials</p>
          </div>
          <div className="p-2 space-y-1">
            <MessageSquare className="w-6 h-6 text-[#8FAF7E] mx-auto" />
            <h4 className="text-xs font-black text-[#1C2B1E]">WhatsApp Support</h4>
            <p className="text-[11px] text-[#5C7060]">Instant parent assistance</p>
          </div>
          <div className="p-2 space-y-1">
            <Sparkles className="w-6 h-6 text-[#C8A96A] mx-auto" />
            <h4 className="text-xs font-black text-[#1C2B1E]">Easy Returns</h4>
            <p className="text-[11px] text-[#5C7060]">7-Day replacement guarantee</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info + social */}
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs text-[#5C7060] leading-relaxed font-medium">
              JollyJuniors.com is Pakistan&apos;s premier online store for Montessori educational toys, certified organic baby care products, feeding sets, and luxury baby shower gift hampers.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#C6E0BC] text-[#2D5A3D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#A0E8B8] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>+92 300 1234567</span>
              </a>
            </div>
            {/* Social icons + Instagram handle */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-[#DDE8DC] text-[#1C2B1E] hover:bg-[#C8A96A] hover:text-white transition-colors"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-[#DDE8DC] text-[#1C2B1E] hover:bg-[#C8A96A] hover:text-white transition-colors"
                title="Facebook"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-[#DDE8DC] text-[#1C2B1E] hover:bg-[#22C55E] hover:text-white transition-colors"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#1C2B1E] hover:text-[#C8A96A] transition-colors"
              >
                @JollyJuniorsStore
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#1C2B1E] uppercase tracking-wider">
              Top Categories
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-[#5C7060]">
              {topCategories.length > 0 ? (
                topCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryLink(cat.slug)}
                      className="hover:text-[#C8A96A] cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-[11px] italic">Mark categories as “Show in footer” in Admin</li>
              )}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#1C2B1E] uppercase tracking-wider">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-[#5C7060]">
              <li className="hover:text-[#C8A96A] cursor-pointer">Track Your Order</li>
              <li className="hover:text-[#C8A96A] cursor-pointer">Shipping & Delivery Policy</li>
              <li className="hover:text-[#C8A96A] cursor-pointer">7-Day Easy Returns</li>
              <li className="hover:text-[#C8A96A] cursor-pointer">FAQs & Parent Help</li>
              <li className="hover:text-[#C8A96A] cursor-pointer">Wholesale & Gift Registry</li>
            </ul>
          </div>

          {/* Payments & Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#1C2B1E] uppercase tracking-wider">
              Accepting Payments
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#1C2B1E]">
              <span className="px-2.5 py-1 bg-[#F8FBF6] border border-[#DDE8DC] rounded-lg">Cash on Delivery</span>
              <span className="px-2.5 py-1 bg-[#F8FBF6] border border-[#DDE8DC] rounded-lg">JazzCash / EasyPaisa</span>
            </div>
            <p className="text-[11px] text-[#5C7060] pt-2">
              📍 Dispatch Centers in Lahore, Karachi & Islamabad. Same-day delivery available.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#DDE8DC] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C7060] font-medium gap-3">
          <p suppressHydrationWarning>© {new Date().getFullYear()} JollyJuniors.com. All Rights Reserved. Crafted with ❤️ for parents & babies.</p>
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
