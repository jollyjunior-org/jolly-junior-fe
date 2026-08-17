import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Flame, ChevronRight, Home, User, LogOut, Instagram, Facebook, Youtube, Twitter, Linkedin, Globe, MessageCircle, Search, Loader2 } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToHome, goToShop } from '@/utils/navigate-shop';
import { productPath } from '@/utils/product-path';
import type { Product } from '@/types';

/**
 * Mobile hamburger drawer: search bar, home, categories, subcategories, live sales, login button, social icons.
 */
export const MobileSidebar: React.FC = () => {
  const router = useRouter();
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    categories,
    liveSales,
    storefrontConfig,
    products,
    isCustomerAuthenticated,
    setAuthModalOpen,
    setAccountPanelOpen,
    logoutCustomer,
  } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const disabledCategorySlugs = new Set(
    categories.filter((c) => c.isEnabled === false).map((c) => c.slug),
  );

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(() => {
      const filtered = products
        .filter(
          (p) =>
            p.isPublished !== false &&
            !disabledCategorySlugs.has(p.categorySlug || p.categoryId) &&
            (p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.categoryName?.toLowerCase().includes(q.toLowerCase()) ||
              (p.tags || []).some((t) => t.name.toLowerCase().includes(q.toLowerCase()))),
        )
        .slice(0, 5);
      setSearchResults(filtered);
      setSearchLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, products]);

  // Lock background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  if (!mobileMenuOpen) return null;

  const enabled = categories.filter((c) => c.isEnabled !== false);
  const socialLinks = storefrontConfig?.socialLinks || [];
  const whatsappNum = storefrontConfig?.whatsappNumber || '923001234567';

  /** Run shop search and close sidebar */
  const handleRunSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchQuery).trim();
    if (!q) return;
    goToShop(router, { searchQuery: q, categoryId: null, categoryIds: [], saleKey: null });
    setMobileMenuOpen(false);
  };

  /** Open selected product detail and close sidebar */
  const handleSelectProduct = (product: Product) => {
    router.push(productPath(product));
    setMobileMenuOpen(false);
  };

  /** Go to the main homepage. */
  const goHome = () => {
    goToHome(router);
    setMobileMenuOpen(false);
  };

  /** Open shop for a category slug. */
  const openCategory = (slug: string | null) => {
    goToShop(router, {
      categoryId: slug,
      categoryIds: slug ? [slug] : [],
      saleKey: null,
      searchQuery: '',
    });
    setMobileMenuOpen(false);
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-[#E4405F]" />;
    if (p.includes('facebook')) return <Facebook className="w-4 h-4 text-[#1877F2]" />;
    if (p.includes('whatsapp')) return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4 text-[#FF0000]" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4 text-[#0A66C2]" />;
    return <Globe className="w-4 h-4 text-[#0798AE]" />;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden touch-none overscroll-contain">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 touch-none"
        aria-label="Close menu"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col justify-between overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9F1F5] shrink-0">
          <span className="font-black text-[#0798AE] text-base">Menu</span>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Search Bar Section */}
        <div className="p-3 border-b border-[#D9F1F5] bg-[#F4FBFD] shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#0798AE] pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, toys, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
              className="w-full pl-9 pr-20 py-2 bg-white border border-[#BDE7EE] rounded-xl text-xs font-medium text-[#0798AE] placeholder-[#0798AE]/60 outline-none focus:ring-2 focus:ring-[#0798AE] shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handleRunSearch()}
              className="absolute right-1 px-3 py-1 bg-[#0798AE] hover:bg-[#068497] text-white text-[11px] font-bold rounded-lg cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Live Mobile Search Results */}
          {searchQuery.trim().length >= 2 && (
            <div className="mt-2 bg-white border border-[#D9F1F5] rounded-xl p-2 shadow-sm space-y-1 max-h-56 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#0798AE] uppercase px-1 pb-1 flex items-center justify-between">
                <span>{searchLoading ? 'Searching…' : `Results (${searchResults.length})`}</span>
                {searchLoading && <Loader2 className="w-3 h-3 animate-spin text-[#0798AE]" />}
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F4FBFD] cursor-pointer"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-9 h-9 rounded-md object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#0798AE] truncate">{prod.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Rs. {prod.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !searchLoading && (
                  <div className="text-[11px] text-slate-400 p-2 text-center">
                    No products matching &quot;{searchQuery}&quot;
                  </div>
                )
              )}
              <button
                type="button"
                onClick={() => handleRunSearch()}
                className="w-full text-center py-1.5 text-xs font-bold text-[#0798AE] hover:underline border-t border-slate-100 mt-1"
              >
                View all results &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {liveSales.length > 0 && (
            <div className="space-y-2 pb-2 border-b border-slate-100">
              <div className="text-[10px] font-black uppercase text-[#0798AE]">Live Sales</div>
              {liveSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => {
                    goToShop(router, {
                      saleKey: sale.key,
                      categoryId: null,
                      categoryIds: [],
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-2 text-sm font-bold text-[#EF4444]"
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    {sale.title}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-[#0798AE] mb-1">Categories</div>
            <button
              type="button"
              onClick={goHome}
              className="w-full text-left py-2 text-sm font-bold text-[#0798AE] flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              type="button"
              onClick={() => openCategory(null)}
              className="w-full text-left py-2 text-sm font-bold text-[#0798AE]"
            >
              Shop All
            </button>
            {enabled.map((cat) => (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() => openCategory(cat.slug)}
                  className="w-full flex items-center justify-between py-2 text-sm font-bold text-[#0798AE]"
                >
                  {cat.name}
                  <ChevronRight className="w-4 h-4 text-[#0798AE]" />
                </button>
                {(cat.subcategories || []).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      goToShop(router, {
                        categoryId: cat.slug,
                        categoryIds: [cat.slug],
                        searchQuery: sub,
                        saleKey: null,
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left pl-4 py-1.5 text-xs font-semibold text-[#0798AE]"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Drawer Section: Login Button + Social Media Icons */}
        <div className="p-4 border-t border-[#D9F1F5] bg-[#FFFDF7] shrink-0 space-y-3">
          {/* Login / Account Action Button */}
          {isCustomerAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAccountPanelOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 px-4 bg-[#0798AE] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <User className="w-4 h-4" />
                <span>My Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 text-slate-500 hover:text-rose-500 bg-white border border-slate-200 rounded-xl cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-[#0798AE] hover:bg-[#068497] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Log In / Register</span>
            </button>
          )}


          {/* Social Media Icons */}
          <div className="pt-2">
            <div className="text-[10px] font-bold text-[#607D80] uppercase tracking-wider mb-2 text-center">
              Follow Us
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {socialLinks.length > 0 ? (
                socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center hover:scale-110 transition-transform"
                    title={s.platform}
                  >
                    {getSocialIcon(s.platform)}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="https://www.instagram.com/jollyjuniors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-[#E4405F]" />
                  </a>
                  <a
                    href="https://www.facebook.com/jollyjuniors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center hover:scale-110 transition-transform"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                  </a>
                  <a
                    href={`https://wa.me/${whatsappNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

