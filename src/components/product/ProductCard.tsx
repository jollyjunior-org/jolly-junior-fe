import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye, Star, MessageSquare, Flame } from 'lucide-react';
import { Product } from '../../types';
import { formatDiscountLabel } from '../../utils/discount';
import { isComingSoonProduct } from '../../utils/product';
import { useShopStore } from '../../store/useShopStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct, 
    setSelectedProductDetail 
  } = useShopStore();

  const isWishlisted = isInWishlist(product.id);

  const comingSoon = isComingSoonProduct(product);
  const stockQty = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = !comingSoon && product.inStock && stockQty > 0;
  const isLowStock = isAvailable && stockQty <= (product.lowStockThreshold || 5);

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const text = encodeURIComponent(
      `Hi JollyJuniors! 👋 I want to order:\n\n*${product.name}*\nPrice: Rs. ${product.price.toLocaleString()}\nAge: ${product.ageGroup}\nLink: JollyJuniors.com`
    );
    window.open(`https://wa.me/923001234567?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedProductDetail(product)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#F5F2ED] shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* 75% Height Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#FFFDF8] overflow-hidden">
        {/* Main Product Image or Hover Image */}
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Video Preview Indicator if available */}
        {product.videoPreviewUrl && (
          <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B4F8C8] animate-pulse"></span>
            Video
          </div>
        )}

        {/* Top Badges (Coming Soon / Stock / Discount / Flash Sale / Best Seller) */}
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

          {formatDiscountLabel(product.discountBadge) && (
            <span className="px-2.5 py-1 rounded-full bg-[#FFB7CE] text-white text-[10px] font-extrabold shadow-xs">
              {formatDiscountLabel(product.discountBadge)}
            </span>
          )}
          {product.badge && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-xs ${
              product.badge === 'Best Seller' ? 'bg-[#FFB347] text-white' :
              product.badge === 'Flash Sale' ? 'bg-[#FFB7CE] text-white' :
              'bg-[#A0D2EB] text-white'
            }`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-xs transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#FFB7CE] text-white'
              : 'bg-white/80 hover:bg-white text-[#5A5A40] hover:text-[#FFB7CE]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-[#5A5A40] text-xs font-bold rounded-full shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#FFB347]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Category & Age Group Tag */}
          <div className="flex items-center justify-between text-[11px] font-medium text-[#8C8C70] mb-1">
            <span>{product.categoryName}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#F5F2ED] text-[#5A5A40] font-bold text-[10px]">
              {product.ageGroup}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#5A5A40] line-clamp-2 hover:text-[#FFB347] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-[#FFB347]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-extrabold text-[#5A5A40]">{product.rating}</span>
            <span className="text-[11px] text-[#8C8C70]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-[#F5F2ED] flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="text-sm sm:text-base font-black text-[#FFB347]">
              Rs. {product.price.toLocaleString()}
            </div>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <div className="text-[11px] text-[#8C8C70] line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Order via WhatsApp */}
            <button
              onClick={handleWhatsAppOrder}
              disabled={!isAvailable}
              className={`p-2 rounded-full transition-colors ${
                isAvailable
                  ? 'bg-[#B4F8C8] text-[#2E6038] hover:bg-[#A0E8B8] cursor-pointer'
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

            {/* Add to Cart — blocked for Coming Soon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) addToCart(product);
              }}
              disabled={!isAvailable}
              className={`px-3 py-2 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-1 ${
                isAvailable
                  ? 'bg-[#5A5A40] hover:bg-[#FFB347] text-white cursor-pointer'
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
