import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatDiscountLabel } from '../../utils/discount';
import { isComingSoonProduct } from '../../utils/product';
import { productPath } from '../../utils/product-path';
import { useShopStore } from '../../store/useShopStore';

import { LazyImage } from '../common/LazyImage';

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
  const [justAdded, setJustAdded] = useState(false);
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

  const reviewsList = product.reviews || [];
  const totalReviews = reviewsList.length > 0 ? reviewsList.length : (product.reviewCount || 0);
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : (product.rating ? Number(product.rating).toFixed(1) : '5.0');
  const hasReviews = totalReviews > 0;

  /** Open full product page (shareable link). */
  const openProductPage = () => {
    router.push(productPath(product));
  };

  /** Add to cart without navigating away. */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable) {
      addToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
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
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            loaderSize="sm"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover object-center"
          />

          {discountLabel && (
            <span className="absolute top-2 left-2 z-10 w-9 h-9 rounded-full bg-[#F47C4C] text-white text-[9px] font-black flex items-center justify-center shadow-sm leading-none">
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

          {/* Action icon buttons stacked top-right (Wishlist, Add to Cart, Quick View) */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                isWishlisted ? 'text-[#F47C4C]' : 'text-[#607D80] hover:text-[#F47C4C]'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-all active:scale-90 ${
                justAdded
                  ? 'bg-emerald-500 text-white'
                  : !isAvailable
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-white text-[#607D80] hover:bg-[#0798AE] hover:text-white cursor-pointer'
              }`}
              title={comingSoon ? 'Coming Soon' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
            >
              {justAdded ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-[#607D80] hover:text-[#0798AE] cursor-pointer transition-transform active:scale-90"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2.5 flex flex-col flex-1 gap-1">
          <p className="text-[10px] text-[#94A3B8] font-medium truncate">{product.categoryName}</p>
          <h3 className="text-[12px] font-semibold text-[#263238] line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {hasReviews && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#263238] mt-0.5">
              <Star className="w-3 h-3 fill-[#FFD52F] text-[#FFD52F]" />
              <span>{avgRating}</span>
              <span className="text-[#94A3B8] font-normal">({totalReviews})</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0 mt-auto pt-1">
            <div className="flex items-baseline gap-1.5">
              {hasSale && (
                <span className="text-[10px] text-[#94A3B8] line-through">
                  Rs.{product.originalPrice!.toLocaleString()}
                </span>
              )}
              <span className="text-[13px] font-bold text-[#0798AE]">
                Rs.{product.price.toLocaleString()}
              </span>
            </div>
            {!isAvailable && (
              <span className="text-[9px] font-bold text-slate-400">
                {comingSoon ? 'Soon' : 'Sold out'}
              </span>
            )}
          </div>
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
      className="group relative bg-white rounded-xl overflow-hidden border border-[#D9F1F5] shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div className="relative aspect-4/3 w-full bg-[#FFFDF7] overflow-hidden">
        <LazyImage
          src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          loaderSize="md"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {product.videoPreviewUrl && (
          <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D9F1F5] animate-pulse" />
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
            <span className="px-2.5 py-1 rounded-full bg-[#FFD52F] text-[#263238] text-[10px] font-extrabold shadow-xs">
              Only {stockQty} Left
            </span>
          ) : null}

          {discountLabel && (
            <span className="px-2.5 py-1 rounded-full bg-[#F47C4C] text-white text-[10px] font-extrabold shadow-xs">
              {discountLabel}
            </span>
          )}
          {product.badge && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-xs ${
                product.badge === 'Best Seller'
                  ? 'bg-[#FFD52F] text-[#263238]'
                  : product.badge === 'Flash Sale'
                    ? 'bg-[#F47C4C] text-white'
                    : 'bg-[#0798AE] text-white'
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Action icon buttons stacked top-right (Wishlist, Add to Cart, Quick View) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-8 h-8 rounded-full shadow-sm backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
              isWishlisted
                ? 'bg-[#F47C4C] text-white'
                : 'bg-white/90 hover:bg-white text-[#607D80] hover:text-[#F47C4C]'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-8 h-8 rounded-full shadow-sm backdrop-blur-md flex items-center justify-center transition-all active:scale-90 ${
              justAdded
                ? 'bg-emerald-500 text-white'
                : !isAvailable
                  ? 'bg-slate-100/90 text-slate-300 cursor-not-allowed border border-slate-200/60'
                  : 'bg-white/90 hover:bg-[#0798AE] text-[#607D80] hover:text-white cursor-pointer'
            }`}
            title={comingSoon ? 'Coming Soon' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#607D80] hover:text-[#0798AE] shadow-sm backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#607D80] mb-1">
            <span>{product.categoryName}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#D9F1F5] text-[#0798AE] font-bold text-[10px]">
              {product.ageGroup}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#263238] line-clamp-2 hover:text-[#0798AE] transition-colors leading-snug">
            {product.name}
          </h3>

          {hasReviews && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center text-[#FFD52F]">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-extrabold text-[#263238]">{avgRating}</span>
              <span className="text-[11px] text-[#607D80]">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#D9F1F5] flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-[#0798AE]">
              Rs. {product.price.toLocaleString()}
            </div>
            {hasSale && (
              <div className="text-[11px] text-[#607D80] line-through">
                Rs. {product.originalPrice!.toLocaleString()}
              </div>
            )}
          </div>

          {!isAvailable && (
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {comingSoon ? 'Coming Soon' : 'Sold Out'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

