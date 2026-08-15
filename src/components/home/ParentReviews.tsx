import React, { useEffect, useState, useRef } from 'react';
import { Star, CheckCircle, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
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

/**
 * Happy Parent Testimonials — loaded from approved DB testimonials.
 */
export const ParentReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ items: Testimonial[] }>(publicEndpoints.testimonials(), {
          skipAuth: true,
        });
        if (!cancelled) setReviews(data.items || []);
      } catch {
        if (!cancelled) setReviews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-xs font-bold">
          ❤️ Happy Parent Reviews
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white border border-[#D9F1F5] text-[#0798AE] hover:bg-[#D9F1F5]/40 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white border border-[#D9F1F5] text-[#0798AE] hover:bg-[#D9F1F5]/40 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-3 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {reviews.map((r) => {
          const avatar =
            r.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(r.parent_name)}&background=FFB347&color=fff`;
          return (
            <div
              key={r.id}
              className={`w-[260px] sm:w-[300px] flex-shrink-0 snap-start bg-white rounded-2xl p-4 border border-[#D9F1F5] shadow-2xs hover:shadow-md transition-shadow relative flex flex-col justify-between ${
                !r.photo_url ? 'h-fit' : ''
              }`}
            >
              <Quote className="absolute top-3 right-3 w-5 h-5 text-[#D9F1F5]/40" />
              <div>
                <div className="flex items-center gap-0.5 text-[#FFD52F] mb-2">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#0798AE] leading-snug font-medium italic mb-2.5">
                  &quot;{r.comment}&quot;
                </p>
                {r.photo_url && (
                  <div
                    className="relative group cursor-pointer mb-2.5 inline-block overflow-hidden rounded-lg border border-[#D9F1F5] shadow-xs"
                    onClick={() => setSelectedImage(r.photo_url!)}
                  >
                    <img
                      src={r.photo_url}
                      alt="Customer photo"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-bold px-1 py-0.5 bg-black/60 rounded">
                        View
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2.5 border-t border-[#D9F1F5] flex items-center gap-2.5">
                <img
                  src={avatar}
                  alt={r.parent_name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-[#D9F1F5]"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-[#0798AE]">{r.parent_name}</h4>
                    <CheckCircle className="w-3.5 h-3.5 text-[#0798AE] fill-[#D9F1F5]" />
                  </div>
                  <p className="text-[10px] text-[#0798AE] font-medium mt-0.5">
                    {r.city || 'Pakistan'}
                    {r.product_slug ? (
                      <>
                        {' · '}
                        <a
                          href={`/product/${r.product_slug}`}
                          className="hover:underline text-[#0798AE] cursor-pointer"
                        >
                          {r.product_name}
                        </a>
                      </>
                    ) : (
                      r.product_bought ? ` · ${r.product_bought}` : ''
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10">
            ✕
          </button>
          <img
            src={selectedImage}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl relative"
            alt="Expanded view"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
