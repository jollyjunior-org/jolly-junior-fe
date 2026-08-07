'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star, Heart, ShoppingBag, MessageSquare, Check,
  Truck, ShieldCheck, RefreshCw, Play, Plus, ArrowLeft, Share2, Link2,
} from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import { formatDiscountLabel } from '@/utils/discount';
import { isComingSoonProduct } from '@/utils/product';
import { productPath } from '@/utils/product-path';
import { useShopStore } from '@/store/useShopStore';
import { goToShop } from '@/utils/navigate-shop';
import { RelatedProducts } from '@/components/product/RelatedProducts';

interface ProductDetailViewProps {
  product: Product;
}

/**
 * Full-page product detail (shareable URL) — same content as the old popup, without overlay.
 */
export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const router = useRouter();
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    showToast,
  } = useShopStore();

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  React.useEffect(() => {
    setSelectedImage(product.images[0]);
    setSelectedVariant(product.variants?.[0]);
    setQuantity(1);
    setActiveTab('description');
    setIsVideoPlaying(false);
  }, [product.id]);

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  // Prefer selected variant stock when product has color/size options
  const stockQty = selectedVariant
    ? selectedVariant.stockQuantity ?? 0
    : product.stockQuantity ?? (product.inStock ? 10 : 0);
  const comingSoon = isComingSoonProduct(product);
  const variantAvailable = selectedVariant
    ? selectedVariant.inStock && (selectedVariant.stockQuantity ?? 0) > 0
    : product.inStock && stockQty > 0;
  const isAvailable = !comingSoon && variantAvailable;
  const isLowStock = isAvailable && stockQty <= (product.lowStockThreshold || 5);

  const bundleProduct = product.frequentlyBoughtTogetherId
    ? products.find((p) => p.id === product.frequentlyBoughtTogetherId)
    : null;

  /** Copy product link to clipboard for sharing. */
  const handleShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${productPath(product)}`
        : productPath(product);
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Product link copied — ready to share!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Product link copied!');
      } catch {
        showToast(url);
      }
    }
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Hi JollyJuniors! 👋 I want to order:\n\n*${product.name}*\nVariant: ${selectedVariant ? selectedVariant.name : 'Standard'}\nQuantity: ${quantity}\nTotal: Rs. ${(currentPrice * quantity).toLocaleString()}\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nAddress Details:`,
    );
    window.open(`https://wa.me/923001234567?text=${text}`, '_blank');
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    setCurrentView('checkout');
    router.push('/');
  };

  const handleAddBundleToCart = () => {
    addToCart(product, selectedVariant, quantity);
    if (bundleProduct) addToCart(bundleProduct, undefined, 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Back + share */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] hover:text-[#FFB347] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F2ED] text-[#5A5A40] text-xs font-bold hover:bg-[#FFB347] hover:text-white transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FFFDF8] border border-[#F1F5F9]">
              {isVideoPlaying && product.videoPreviewUrl ? (
                <video
                  src={product.videoPreviewUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {formatDiscountLabel(product.discountBadge) && (
                  <span className="px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-xs font-black">
                    {formatDiscountLabel(product.discountBadge)}
                  </span>
                )}
                {comingSoon && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-700 text-white text-xs font-black">
                    Coming Soon
                  </span>
                )}
              </div>
              {product.videoPreviewUrl && !isVideoPlaying && (
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#FDE047]" />
                  Watch Video
                </button>
              )}
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img);
                    setIsVideoPlaying(false);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                    selectedImage === img && !isVideoPlaying
                      ? 'border-[#EC4899] scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const slug = product.categorySlug || product.categoryId;
                    if (!slug) return;
                    goToShop(router, {
                      categoryId: slug,
                      categoryIds: [slug],
                      saleKey: null,
                      searchQuery: '',
                    });
                  }}
                  className="text-xs font-bold text-[#EC4899] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-[#F9A8D4]"
                >
                  {product.categoryName}
                </button>
                <span className="text-xs font-extrabold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                  Age: {product.ageGroup}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 mt-2">
                <h1 className="text-xl sm:text-3xl font-black text-[#1E293B] leading-snug">
                  {product.name}
                </h1>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-full shrink-0 cursor-pointer ${
                    isWishlisted ? 'bg-[#FFB7CE] text-white' : 'bg-[#F5F2ED] text-[#5A5A40]'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                  Rs. {currentPrice.toLocaleString()}
                </span>
                {product.originalPrice != null && product.originalPrice > currentPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Link2 className="w-3 h-3" />
                {productPath(product)}
              </p>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Select Variant / Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.inStock || (v.stockQuantity ?? 0) <= 0}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.image) setSelectedImage(v.image);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-bold border ${
                          !v.inStock || (v.stockQuantity ?? 0) <= 0
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : selectedVariant?.id === v.id
                              ? 'bg-[#1E293B] text-white border-[#1E293B] cursor-pointer'
                              : 'bg-[#FFFDF8] text-[#334155] border-[#E2E8F0] cursor-pointer'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Inventory Status</span>
                {comingSoon ? (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">Coming Soon</span>
                ) : !isAvailable ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    Low Stock ({stockQty})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    In Stock ({stockQty})
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-bold text-[#64748B] uppercase">Quantity</span>
                <div className="flex items-center border border-[#E2E8F0] rounded-full p-1 bg-[#FFFDF8]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!isAvailable}
                    className="w-8 h-8 rounded-full font-bold cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-xs">
                    {isAvailable ? quantity : 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                    disabled={!isAvailable || quantity >= stockQty}
                    className="w-8 h-8 rounded-full font-bold cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => isAvailable && addToCart(product, selectedVariant, quantity)}
                  disabled={!isAvailable}
                  className={`py-3 px-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-[#F472B6] to-[#FB923C] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {comingSoon ? 'Coming Soon' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => isAvailable && handleBuyNow()}
                  disabled={!isAvailable}
                  className={`py-3 px-4 rounded-full font-extrabold text-xs ${
                    isAvailable
                      ? 'bg-[#1E293B] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {comingSoon ? 'Coming Soon' : isAvailable ? 'Buy Now' : 'Unavailable'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => isAvailable && handleWhatsAppOrder()}
                disabled={!isAvailable}
                className={`w-full py-2.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 ${
                  isAvailable
                    ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {comingSoon ? 'Coming Soon' : isAvailable ? 'Order via WhatsApp' : 'Unavailable'}
              </button>
              <div className="grid grid-cols-3 gap-2 pt-3 text-[11px] font-semibold text-[#64748B] text-center border-t border-[#F1F5F9]">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#3B82F6]" />
                  Free Shipping over 3K
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  100% Non-Toxic
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-[#F59E0B]" />
                  7-Day Easy Return
                </div>
              </div>
            </div>
          </div>
        </div>

        {bundleProduct && (
          <div className="bg-[#FFFDF8] rounded-lg p-4 border border-[#FEF3C7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={bundleProduct.images[0]}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  Frequently Bought Together
                </span>
                <h4 className="text-xs font-bold mt-1">Add {bundleProduct.name}</h4>
                <p className="text-xs font-extrabold text-[#059669]">
                  Bundle: Rs. {(currentPrice + bundleProduct.price).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddBundleToCart}
              className="px-5 py-2.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Both to Cart
            </button>
          </div>
        )}

        <div>
          <div className="flex border-b border-[#F1F5F9] space-x-6">
            {[
              { id: 'description' as const, label: 'Description' },
              { id: 'features' as const, label: 'Key Features' },
              { id: 'reviews' as const, label: `Reviews (${product.reviews?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 text-xs font-extrabold border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#EC4899] text-[#EC4899]'
                    : 'border-transparent text-[#64748B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pt-4 text-sm text-[#334155] leading-relaxed">
            {activeTab === 'description' && <p className="font-medium">{product.description}</p>}
            {activeTab === 'features' && (
              <ul className="space-y-2">
                {(product.features || []).map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    {feat}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-[#FFFDF8] border border-[#F1F5F9]">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">{rev.userName}</span>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-[#475569] mt-1">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs">No reviews yet for this product.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related products from dedicated API */}
      <RelatedProducts productRef={product.slug || product.id} limit={8} />
    </div>
  );
};
