import React, { useState } from 'react';
import { Instagram, Heart, ShoppingBag, Send, Check } from 'lucide-react';
import { useShopStore } from '../../store/useShopStore';

export const InstagramGallery: React.FC = () => {
  const { showToast } = useShopStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const posts = [
    {
      id: 'ig-1',
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80',
      tag: 'Montessori Wooden Sorting Tower',
      likes: '1.2k'
    },
    {
      id: 'ig-2',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
      tag: 'Soft Bunny Snuggle Plush',
      likes: '890'
    },
    {
      id: 'ig-3',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=500&q=80',
      tag: 'Silicone Feeding Set',
      likes: '2.4k'
    },
    {
      id: 'ig-4',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80',
      tag: 'Organic Muslin Swaddle',
      likes: '1.5k'
    },
    {
      id: 'ig-5',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=500&q=80',
      tag: 'Luxury Gift Hamper',
      likes: '3.1k'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      showToast('🎉 Discount code JOLLY10 activated! Check your inbox.');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Instagram Gallery Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-xs font-bold">
            <Instagram className="w-3.5 h-3.5 text-[#FFD52F]" />
            <span>#JollyJuniors Community</span>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#0798AE] hover:text-[#0798AE]"
          >
            Follow Us →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-lg overflow-hidden aspect-square bg-[#D9F1F5] cursor-pointer border border-[#D9F1F5]"
            >
              <img
                src={p.image}
                alt={p.tag}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                <div className="flex items-center justify-end">
                  <span className="flex items-center gap-1 text-[11px] font-bold">
                    <Heart className="w-3.5 h-3.5 fill-current text-[#D9F1F5]" />
                    {p.likes}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold line-clamp-1">{p.tag}</p>
                  <span className="text-[10px] text-[#FFD52F] font-semibold">Shop Look 🛍️</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Box */}
      <div className="bg-[#0798AE] rounded-xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg">
        {/* Soft Background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-[#FFD52F]/20 text-[#FFD52F] font-extrabold text-xs uppercase tracking-wider backdrop-blur-md border border-[#FFD52F]/30">
            🎁 Exclusive Parent Perk
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            Get Rs. 500 OFF Your First Order!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            Subscribe to our newsletter for weekly parenting tips, flash sale alerts, and new toy arrivals.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-white text-[#263238] text-xs font-semibold placeholder-[#607D80] outline-none shadow-md"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FFD52F] hover:bg-[#48B8CA] text-[#263238] hover:text-white font-extrabold text-xs shadow-md shrink-0 cursor-pointer transition-all"
              >
                Claim Voucher
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0798AE] font-extrabold text-xs rounded-full shadow-md">
              <Check className="w-4 h-4" />
              <span>Voucher Code JOLLY10 Activated!</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
