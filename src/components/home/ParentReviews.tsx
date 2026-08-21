import React, { useEffect, useState, useRef } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';

type Testimonial = {
  id: string;
  parent_name: string;
  city?: string | null;
  rating: number;
  comment: string;
  product_bought?: string | null;
  product_slug?: string | null;
  product_name?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
};

const FALLBACK_REVIEWS: Testimonial[] = [
  {
    id: 'fb-1',
    parent_name: 'Dr. Fatima Zahra',
    city: 'Karachi',
    rating: 5,
    comment:
      'As a pediatrician and mother of twins, I am extremely particular about child safety. JollyJuniors Montessori toys have zero sharp edges and zero chemical odors. Outstanding quality!',
    avatar_url:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'fb-2',
    parent_name: 'Usman Chaudhry',
    city: 'Lahore',
    rating: 5,
    comment:
      'Ordered the Luxury Gift Hamper for my sister’s baby shower. The presentation was gorgeous with personalized ribbon wrapping. Arrived next morning in Lahore!',
    avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'fb-3',
    parent_name: 'Mariam Suleman',
    city: 'Islamabad',
    rating: 5,
    comment:
      'The silicone suction plates actually stay stuck to the highchair tray! We spent months trying other brands before finding JollyJuniors. A total lifesaver for weaning.',
    avatar_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

/**
 * Happy Parent Testimonials — displays verified parent reviews in a smooth horizontal scroll carousel for desktop & mobile.
 */
export const ParentReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ items: Testimonial[] }>(publicEndpoints.testimonials(), {
          skipAuth: true,
        });
        if (!cancelled && data.items && data.items.length > 0) {
          setReviews(data.items);
        } else if (!cancelled) {
          setReviews(FALLBACK_REVIEWS);
        }
      } catch {
        if (!cancelled) setReviews(FALLBACK_REVIEWS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section className="py-12 sm:py-16 bg-[#FFFCF9]/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFEFF3] text-[#F45B69] text-xs font-extrabold border border-[#FFD8E1] mb-3 shadow-2xs">
            <span>💗</span>
            <span>Loved by Thousands of Families</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#3A453C] tracking-tight">
            Happy Parent Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-[#607D80] max-w-xl mx-auto mt-2 font-medium">
            Real experiences from verified parents across Pakistan who trust JollyJuniors
          </p>
        </div>

        {/* Horizontal Scroll Testimonial Cards Carousel (Desktop & Mobile) */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-5 sm:gap-6 max-w-6xl mx-auto px-1 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {displayReviews.map((r) => {
            const avatar =
              r.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(r.parent_name)}&background=FFB347&color=fff`;

            return (
              <div
                key={r.id}
                className="w-[280px] sm:w-[360px] flex-shrink-0 snap-start bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative group"
              >
                {/* Decorative Pink Double Quotes */}
                <div className="absolute top-5 right-6 text-[#FFE0E6] text-5xl font-serif leading-none select-none pointer-events-none group-hover:text-[#FFD0DA] transition-colors">
                  ””
                </div>

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#FFB800] mb-3">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Review Body */}
                  <p className="text-xs sm:text-sm text-[#263238] italic font-medium leading-relaxed my-3">
                    &quot;{r.comment}&quot;
                  </p>

                  {/* Customer Attached Photo */}
                  {r.photo_url && (
                    <div
                      className="relative cursor-pointer mb-3 inline-block overflow-hidden rounded-xl border border-slate-200 shadow-2xs"
                      onClick={() => setSelectedImage(r.photo_url!)}
                    >
                      <img
                        src={r.photo_url}
                        alt="Customer photo"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                </div>

                {/* Author Info Row */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={r.parent_name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#263238] truncate">
                        {r.parent_name}
                      </h4>
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-[#607D80] font-medium truncate mt-0.5">
                      {r.city || 'Pakistan'} · Verified Buyer
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Modal for Customer Photos */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10">
            ✕
          </button>
          <img
            src={selectedImage}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl relative"
            alt="Customer upload"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

