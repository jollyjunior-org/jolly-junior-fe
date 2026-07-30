import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Star, Heart, ShoppingBag, MessageSquare, Check, 
  Truck, ShieldCheck, RefreshCw, Play, Plus
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useShopStore } from '../../store/useShopStore';

export const ProductDetailModal: React.FC = () => {
  const { 
    products,
    selectedProductDetail, 
    setSelectedProductDetail, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    setCurrentView
  } = useShopStore();

  const product = selectedProductDetail;

  const [selectedImage, setSelectedImage] = useState<string | undefined>(product?.images[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedVariant(product.variants?.[0]);
      setQuantity(1);
      setActiveTab('description');
      setIsVideoPlaying(false);
    }
  }, [product?.id]);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  const stockQty = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isAvailable = product.inStock && stockQty > 0;
  const isLowStock = isAvailable && stockQty <= (product.lowStockThreshold || 5);

  // Bundle offer product
  const bundleProduct = product.frequentlyBoughtTogetherId
    ? products.find(p => p.id === product.frequentlyBoughtTogetherId)
    : null;

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Hi JollyJuniors! 👋 I want to order:\n\n*${product.name}*\nVariant: ${selectedVariant ? selectedVariant.name : 'Standard'}\nQuantity: ${quantity}\nTotal: Rs. ${(currentPrice * quantity).toLocaleString()}\n\nAddress Details:`
    );
    window.open(`https://wa.me/923001234567?text=${text}`, '_blank');
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    setSelectedProductDetail(null);
    setCurrentView('checkout');
  };

  const handleAddBundleToCart = () => {
    addToCart(product, selectedVariant, quantity);
    if (bundleProduct) {
      addToCart(bundleProduct, undefined, 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-[#F1F5F9] max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProductDetail(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image Gallery & Video */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#F1F5F9] shadow-xs">
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

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.discountBadge && (
                      <span className="px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-xs font-black">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>

                  {/* Video Toggle Badge */}
                  {product.videoPreviewUrl && !isVideoPlaying && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#FDE047]" />
                      <span>Watch Video</span>
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(img);
                        setIsVideoPlaying(false);
                      }}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImage === img && !isVideoPlaying
                          ? 'border-[#EC4899] scale-105 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Details & Variant Selection */}
              <div className="flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#EC4899] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full">
                      {product.categoryName}
                    </span>
                    <span className="text-xs font-extrabold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                      Age: {product.ageGroup}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] mt-2 leading-snug">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-[#F59E0B]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#1E293B]">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-2xl font-black text-[#1E293B]">
                      Rs. {currentPrice.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Pill Variant Selector */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-5">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                        Select Variant / Style:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setSelectedVariant(v);
                              if (v.image) setSelectedImage(v.image);
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                              selectedVariant?.id === v.id
                                ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-xs'
                                : 'bg-[#FFFDF8] hover:bg-[#FEF3C7] text-[#334155] border-[#E2E8F0]'
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Stock Status Indicator */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Inventory Status:</span>
                    {!isAvailable ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold flex items-center gap-1">
                        🔴 Currently Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center gap-1">
                        🟡 Low Stock ({stockQty} units remaining)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                        🟢 In Stock ({stockQty} units available)
                      </span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-[#E2E8F0] rounded-full p-1 bg-[#FFFDF8]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!isAvailable}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-extrabold text-xs text-[#1E293B]">
                        {isAvailable ? quantity : 0}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                        disabled={!isAvailable || quantity >= stockQty}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Purchase CTA Buttons */}
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => isAvailable && addToCart(product, selectedVariant, quantity)}
                      disabled={!isAvailable}
                      className={`py-3 px-4 rounded-full font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                        isAvailable
                          ? 'bg-gradient-to-r from-[#F472B6] to-[#FB923C] hover:opacity-95 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>

                    <button
                      onClick={() => isAvailable && handleBuyNow()}
                      disabled={!isAvailable}
                      className={`py-3 px-4 rounded-full font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-[#1E293B] hover:bg-slate-800 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <span>{isAvailable ? 'Buy Now' : 'Unavailable'}</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Order Button */}
                  <button
                    onClick={() => isAvailable && handleWhatsAppOrder()}
                    disabled={!isAvailable}
                    className={`w-full py-2.5 px-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                      isAvailable
                        ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] border border-[#86EFAC] cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 ${isAvailable ? 'fill-[#22C55E]' : 'fill-slate-300'}`} />
                    <span>{isAvailable ? 'Instant Order via WhatsApp' : 'WhatsApp Orders Disabled (Out of Stock)'}</span>
                  </button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-[11px] font-semibold text-[#64748B] text-center border-t border-[#F1F5F9]">
                    <div className="flex flex-col items-center gap-1">
                      <Truck className="w-4 h-4 text-[#3B82F6]" />
                      <span>Free Shipping over 3K</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>100% Non-Toxic</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <RefreshCw className="w-4 h-4 text-[#F59E0B]" />
                      <span>7-Day Easy Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Offer: Frequently Bought Together */}
            {bundleProduct && (
              <div className="bg-[#FFFDF8] rounded-2xl p-4 sm:p-5 border border-[#FEF3C7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E2E8F0]">
                    <img
                      src={bundleProduct.images[0]}
                      alt={bundleProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                      Frequently Bought Together
                    </span>
                    <h4 className="text-xs font-bold text-[#1E293B] mt-1">
                      Add {bundleProduct.name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#059669]">
                      Bundle Price: Rs. {(currentPrice + bundleProduct.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className="px-5 py-2.5 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Both to Cart</span>
                </button>
              </div>
            )}

            {/* Tabs for Description, Features, and Reviews */}
            <div>
              <div className="flex border-b border-[#F1F5F9] space-x-6">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'features', label: 'Key Features' },
                  { id: 'reviews', label: `Reviews (${product.reviews?.length || 0})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#EC4899] text-[#EC4899]'
                        : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-4 text-xs text-[#334155] leading-relaxed">
                {activeTab === 'description' && (
                  <p className="font-medium">{product.description}</p>
                )}

                {activeTab === 'features' && (
                  <ul className="space-y-2">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-[#10B981]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-xl bg-[#FFFDF8] border border-[#F1F5F9] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1E293B]">{rev.userName}</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <p className="text-[11px] text-[#475569]">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No reviews yet for this product.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
