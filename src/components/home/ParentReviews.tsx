import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { apiFetch } from '@/api/api-client';
import { publicEndpoints } from '@/api/endpoints/public';

type Testimonial = {
  id: string;
  parent_name: string;
  city?: string | null;
  rating: number;
  comment: string;
  product_bought?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
};

/**
 * Happy Parent Testimonials — loaded from approved DB testimonials.
 */
export const ParentReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB7CE]/20 text-[#5A5A40] text-xs font-bold mb-2">
          ❤️ Loved by Thousands of Families
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#5A5A40] tracking-tight">
          Happy Parent Testimonials
        </h2>
        <p className="text-xs sm:text-sm text-[#8C8C70] font-medium mt-1">
          Real experiences from verified parents across Pakistan who trust JollyJuniors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r) => {
          const avatar =
            r.avatar_url ||
            r.photo_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(r.parent_name)}&background=FFB347&color=fff`;
          return (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-[#F5F2ED] shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#FFB7CE]/30" />
              <div>
                <div className="flex items-center gap-1 text-[#FFB347] mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed font-medium italic mb-4">
                  &quot;{r.comment}&quot;
                </p>
                {r.photo_url && (
                  <img
                    src={r.photo_url}
                    alt="Customer photo"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-2xl mb-4 border border-[#F5F2ED]"
                  />
                )}
              </div>
              <div className="pt-4 border-t border-[#F5F2ED] flex items-center gap-3">
                <img
                  src={avatar}
                  alt={r.parent_name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#F5F2ED]"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-[#5A5A40]">{r.parent_name}</h4>
                    <CheckCircle className="w-3.5 h-3.5 text-[#2E6038] fill-[#B4F8C8]" />
                  </div>
                  <p className="text-[10px] text-[#8C8C70] font-medium">
                    {r.city || 'Pakistan'}
                    {r.product_bought ? ` · ${r.product_bought}` : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
