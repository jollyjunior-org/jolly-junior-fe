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
 * Storefront product card — matches modern soft rounded aesthetic.
 * Displays category, age group, product title, tags, star rating, price, quick view overlay, and simple Add button.
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
    : (product.rating ? Number(product.rating).toFixed(1) : '4.9');
  const hasReviews = totalReviews > 0 || Boolean(product.rating);

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
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openProductPage}
        className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
      >
        {/* Top Image Container */}
        <div className="relative aspect-square w-full bg-[#F8F9FA] overflow-hidden p-1.5">
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <LazyImage
              src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              loaderSize="sm"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Badges Stacked Top-Left */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
              {isLowStock && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFB800] text-white text-[9px] font-black shadow-2xs">
                  Only {stockQty} Left
                </span>
              )}
              {discountLabel && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF8A8A] text-white text-[9px] font-black shadow-2xs">
                  {discountLabel}
                </span>
              )}
              {product.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black shadow-2xs ${
                    product.badge === 'Best Seller'
                      ? 'bg-[#FFB800] text-white'
                      : product.badge === 'Flash Sale'
                        ? 'bg-[#F47C4C] text-white'
                        : 'bg-[#0798AE] text-white'
                  }`}
                >
                  {product.badge}
                </span>
              )}
              {comingSoon ? (
                <span className="px-2 py-0.5 rounded-full bg-slate-700/90 text-white text-[8px] font-black uppercase">
                  Soon
                </span>
              ) : !isAvailable && !isLowStock ? (
                <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-white text-[8px] font-black uppercase">
                  Sold
                </span>
              ) : null}
            </div>

            {/* Top Right Floating Action Buttons (Wishlist + Quick View Eye on Mobile) */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                  isWishlisted ? 'text-[#FF5A79]' : 'text-slate-600 hover:text-[#FF5A79]'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewProduct(product);
                }}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-[#0798AE] transition-transform active:scale-90 cursor-pointer"
                title="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 flex flex-col justify-between flex-1 bg-white">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#8696A0] font-semibold mb-1">
              <span className="truncate">{product.categoryName}</span>
              {product.ageGroup && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-black text-[9px]">
                  {product.ageGroup}
                </span>
              )}
            </div>

            <h3 className="text-xs font-bold text-[#263238] line-clamp-2 leading-snug hover:text-[#0798AE] transition-colors">
              {product.name}
            </h3>

            {/* Product Tags Display */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {product.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#0798AE]/10 text-[#0798AE]"
                  >
                    #{tag.label}
                  </span>
                ))}
              </div>
            )}

            {hasReviews && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#263238] mt-1">
                <Star className="w-3 h-3 fill-[#FFD52F] text-[#FFD52F]" />
                <span>{avgRating}</span>
                <span className="text-[#94A3B8] font-normal">({totalReviews})</span>
              </div>
            )}
          </div>

          {/* Bottom Price & Simple Add Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
            <div>
              <div className="text-xs sm:text-sm font-black text-[#F47C4C]">
                Rs. {product.price.toLocaleString()}
              </div>
              {hasSale && (
                <div className="text-[10px] text-[#94A3B8] line-through font-medium">
                  Rs. {product.originalPrice!.toLocaleString()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-500 text-white'
                  : !isAvailable
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-[#3A453C] hover:bg-[#263238] text-white'
              }`}
            >
              {justAdded ? (
                <Check className="w-3 h-3" />
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>Add</span>
                </>
              )}
            </button>
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={openProductPage}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square sm:aspect-4/3 w-full bg-[#F8F9FA] overflow-hidden p-2">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <LazyImage
            src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            loaderSize="md"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Video Preview Pill */}
          {product.videoPreviewUrl && (
            <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Video</span>
            </div>
          )}

          {/* Top Left Badges (Stacked Vertically) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {isLowStock && (
              <span className="px-3 py-1 rounded-full bg-[#FFB800] text-white text-[10px] sm:text-xs font-black shadow-xs">
                Only {stockQty} Left
              </span>
            )}
            {discountLabel && (
              <span className="px-3 py-1 rounded-full bg-[#FF8A8A] text-white text-[10px] sm:text-xs font-black shadow-xs">
                {discountLabel}
              </span>
            )}
            {product.badge && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-xs ${
                  product.badge === 'Best Seller'
                    ? 'bg-[#FFB800] text-white'
                    : product.badge === 'Flash Sale'
                      ? 'bg-[#F47C4C] text-white'
                      : 'bg-[#0798AE] text-white'
                }`}
              >
                {product.badge}
              </span>
            )}
            {comingSoon ? (
              <span className="px-3 py-1 rounded-full bg-slate-700/90 text-white text-[10px] sm:text-xs font-black shadow-xs backdrop-blur-xs">
                Coming Soon
              </span>
            ) : !isAvailable && !isLowStock ? (
              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-white text-[10px] sm:text-xs font-black shadow-xs backdrop-blur-xs">
                Out of Stock
              </span>
            ) : null}
          </div>

          {/* Top Right Floating Buttons (Wishlist Heart + Eye Icon for Mobile) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                isWishlisted ? 'text-[#FF5A79]' : 'text-slate-600 hover:text-[#FF5A79]'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Mobile Eye Icon Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="flex sm:hidden w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-xs items-center justify-center text-slate-600 hover:text-[#0798AE] transition-transform active:scale-90 cursor-pointer"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick View Button Overlay for Desktop (Hover Fade-in) */}
          <div className="hidden sm:flex absolute bottom-3 inset-x-3 z-10 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="w-auto px-5 py-2 rounded-full bg-white/95 text-slate-800 font-extrabold text-xs sm:text-sm shadow-md backdrop-blur-xs flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#0798AE]" />
              <span>Quick View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Category Name + Age Group Badge */}
          <div className="flex items-center justify-between text-xs text-[#8696A0] font-semibold mb-1.5">
            <span className="truncate">{product.categoryName}</span>
            {product.ageGroup && (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px]">
                {product.ageGroup}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-extrabold text-[#263238] line-clamp-2 leading-snug hover:text-[#0798AE] transition-colors">
            {product.name}
          </h3>

          {/* Product Tags Display */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0798AE]/10 text-[#0798AE]"
                >
                  #{tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Rating & Reviews */}
          {hasReviews && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-3.5 h-3.5 fill-[#FFD52F] text-[#FFD52F]" />
              <span className="text-xs font-black text-[#263238]">{avgRating}</span>
              <span className="text-[11px] text-[#8696A0] font-medium">({totalReviews})</span>
            </div>
          )}
        </div>

        {/* Bottom Price & Simple Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-[#F47C4C]">
              Rs. {product.price.toLocaleString()}
            </div>
            {hasSale && (
              <div className="text-xs text-[#94A3B8] line-through font-medium">
                Rs. {product.originalPrice!.toLocaleString()}
              </div>
            )}
          </div>

          {/* Simple Add Pill Button (No Chat Button) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
              justAdded
                ? 'bg-emerald-500 text-white'
                : !isAvailable
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#3A453C] hover:bg-[#263238] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};


