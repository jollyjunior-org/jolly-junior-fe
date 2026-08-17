import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Flame, ChevronRight, Home, User, LogOut, Instagram, Facebook, Youtube, Twitter, Linkedin, Globe, MessageCircle } from 'lucide-react';
import { useShopStore } from '@/store/useShopStore';
import { goToHome, goToShop } from '@/utils/navigate-shop';

/**
 * Mobile hamburger drawer: home, categories, subcategories, live sales, login button, social icons.
 */
export const MobileSidebar: React.FC = () => {
  const router = useRouter();
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    categories,
    liveSales,
    storefrontConfig,
    isCustomerAuthenticated,
    isAdminAuthenticated,
    setAuthModalOpen,
    setAccountPanelOpen,
    logoutCustomer,
    logoutAdmin,
  } = useShopStore();

  if (!mobileMenuOpen) return null;

  const enabled = categories.filter((c) => c.isEnabled !== false);
  const socialLinks = storefrontConfig?.socialLinks || [];
  const whatsappNum = storefrontConfig?.whatsappNumber || '923001234567';

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
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className="absolute left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9F1F5] shrink-0">
          <span className="font-black text-[#0798AE] text-base">Menu</span>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
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

