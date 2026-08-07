import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye, Star, MessageSquare } from 'lucide-react';
import { Product } from '../../types';
import { formatDiscountLabel } from '../../utils/discount';
import { isComingSoonProduct } from '../../utils/product';
import { productPath } from '../../utils/product-path';
import { useShopStore } from '../../store/useShopStore';

interface ProductCardProps {
  product: Product;
  /** Dense 2-col mobile card (shop, home rails, related). */
  compact?: boolean;
}

/**
 * Storefront product card.
 * Args: product — catalog item; compact — smaller layout for 2-up mobile grids/sliders.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useShopStore();

  const isWishlisted = isInWishlist(product.id);
  const comingSoon = isComingSoonProduct(product);
  const stockQty = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = !comingSoon && product.inStock && stockQty > 0;
  const isLowStock = isAvailable && stockQty <= (product.lowStockThreshold || 5);
  const discountLabel = formatDiscountLabel(product.discountBadge);
  const hasSale =
    product.originalPrice != null && product.originalPrice > product.price;

  /** Open full product page (shareable link). */
  const openProductPage = () => {
    router.push(productPath(product));
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const text = encodeURIComponent(
      `Hi JollyJuniors! 👋 I want to order:\n\n*${product.name}*\nPrice: Rs. ${product.price.toLocaleString()}\nAge: ${product.ageGroup}\nLink: JollyJuniors.com`,
    );
    window.open(`https://wa.me/923001234567?text=${text}`, '_blank');
  };

  /** Add to cart without navigating away. */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable) addToCart(product);
  };

  // ——— Compact card (2-up mobile / dense catalogs) ———
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25 }}
        onClick={openProductPage}
        className="group relative bg-white rounded-xl overflow-hidden border border-[#E8E8E8] flex flex-col cursor-pointer h-full"
      >
        <div className="relative aspect-square w-full bg-[#FAFAFA] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {discountLabel && (
            <span className="absolute top-2 left-2 z-10 w-9 h-9 rounded-full bg-[#3D6B4F] text-white text-[9px] font-black flex items-center justify-center shadow-sm leading-none">
              -{discountLabel.replace('% OFF', '%')}
            </span>
          )}
          {!discountLabel && comingSoon && (
            <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded-full bg-slate-700 text-white text-[8px] font-black uppercase">
              Soon
            </span>
          )}
          {!discountLabel && !comingSoon && !isAvailable && (
            <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded-full bg-slate-800 text-white text-[8px] font-black uppercase">
              Sold
            </span>
          )}

          {/* Wishlist + quick view stacked like reference */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center cursor-pointer ${
                isWishlisted ? 'text-[#3D6B4F]' : 'text-[#64748B]'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-[#64748B] cursor-pointer"
              title="Quick view"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2.5 flex flex-col flex-1 gap-1">
          <p className="text-[10px] text-[#94A3B8] font-medium truncate">{product.categoryName}</p>
          <h3 className="text-[12px] font-semibold text-[#334155] line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 mt-0.5">
            {hasSale && (
              <span className="text-[10px] text-[#94A3B8] line-through">
                Rs.{product.originalPrice!.toLocaleString()}
              </span>
            )}
            <span className="text-[13px] font-bold text-[#3D6B4F]">
              Rs.{product.price.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`mt-auto w-full py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
              isAvailable
                ? 'border-[#3D6B4F] text-[#3D6B4F] hover:bg-[#EEF5E8] cursor-pointer'
                : 'border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{comingSoon ? 'Coming Soon' : isAvailable ? 'Add To Cart' : 'Sold Out'}</span>
            {isAvailable && <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.div>
    );
  }

  // ——— Standard card ———
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={openProductPage}
      className="group relative bg-white rounded-xl overflow-hidden border border-[#DDE8DC] shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div className="relative aspect-4/3 w-full bg-[#F8FBF6] overflow-hidden">
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {product.videoPreviewUrl && (
          <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C6E0BC] animate-pulse" />
            Video
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {comingSoon ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-700/95 text-white text-[10px] font-black uppercase tracking-wider shadow-xs backdrop-blur-xs">
              Coming Soon
            </span>
          ) : !isAvailable ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider shadow-xs backdrop-blur-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-xs">
              Only {stockQty} Left
            </span>
          ) : null}

          {discountLabel && (
            <span className="px-2.5 py-1 rounded-full bg-[#B5C9A8] text-white text-[10px] font-extrabold shadow-xs">
              {discountLabel}
            </span>
          )}
          {product.badge && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-xs ${
                product.badge === 'Best Seller'
                  ? 'bg-[#C8A96A] text-white'
                  : product.badge === 'Flash Sale'
                    ? 'bg-[#B5C9A8] text-white'
                    : 'bg-[#8FAF7E] text-white'
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-xs transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#B5C9A8] text-white'
              : 'bg-white/80 hover:bg-white text-[#1C2B1E] hover:text-[#B5C9A8]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-[#1C2B1E] text-xs font-bold rounded-full shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C8A96A]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#5C7060] mb-1">
            <span>{product.categoryName}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#DDE8DC] text-[#1C2B1E] font-bold text-[10px]">
              {product.ageGroup}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#1C2B1E] line-clamp-2 hover:text-[#C8A96A] transition-colors leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-[#C8A96A]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-extrabold text-[#1C2B1E]">{product.rating}</span>
            <span className="text-[11px] text-[#5C7060]">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#DDE8DC] flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-[#C8A96A]">
              Rs. {product.price.toLocaleString()}
            </div>
            {hasSale && (
              <div className="text-[11px] text-[#5C7060] line-through">
                Rs. {product.originalPrice!.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              disabled={!isAvailable}
              className={`p-2 rounded-full transition-colors ${
                isAvailable
                  ? 'bg-[#C6E0BC] text-[#2D5A3D] hover:bg-[#A0E8B8] cursor-pointer'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title={
                comingSoon
                  ? 'Coming Soon'
                  : isAvailable
                    ? 'Order via WhatsApp'
                    : 'Product Out of Stock'
              }
            >
              <MessageSquare className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-3 py-2 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-1 ${
                isAvailable
                  ? 'bg-[#1C2B1E] hover:bg-[#C8A96A] text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">
                {comingSoon ? 'Soon' : isAvailable ? 'Add' : 'Sold Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
