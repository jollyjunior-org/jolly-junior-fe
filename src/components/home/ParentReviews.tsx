import React from 'react';
import { Star, CheckCircle, Heart, Quote } from 'lucide-react';

export const ParentReviews: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      name: 'Dr. Fatima Zahra',
      city: 'Karachi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'As a pediatrician and mother of twins, I am extremely particular about child safety. JollyJuniors Montessori toys have zero sharp edges and zero chemical odors. Outstanding quality!',
      productBought: 'Montessori Wooden Sorting Tower'
    },
    {
      id: 'rev-2',
      name: 'Usman Chaudhry',
      city: 'Lahore',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'Ordered the Luxury Gift Hamper for my sister’s baby shower. The presentation was gorgeous with personalized ribbon wrapping. Arrived next morning in Lahore!',
      productBought: 'Luxury Welcome Baby Gift Hamper'
    },
    {
      id: 'rev-3',
      name: 'Mariam Suleman',
      city: 'Islamabad',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'The silicone suction plates actually stay stuck to the highchair tray! We spent months trying other brands before finding JollyJuniors. A total lifesaver for weaning.',
      productBought: 'Ergonomic Silicone Feeding Set'
    }
  ];

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
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-6 border border-[#F5F2ED] shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-[#FFB7CE]/30" />

            <div>
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-[#FFB347] mb-3">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed font-medium italic mb-4">
                "{r.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#F5F2ED] flex items-center gap-3">
              <img
                src={r.avatar}
                alt={r.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#F5F2ED]"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-black text-[#5A5A40]">{r.name}</h4>
                  <CheckCircle className="w-3.5 h-3.5 text-[#2E6038] fill-[#B4F8C8]" />
                </div>
                <div className="text-[11px] text-[#8C8C70] flex items-center gap-1">
                  <span>{r.city}</span>
                  <span>•</span>
                  <span className="text-[#5A5A40] font-bold">Verified Buyer</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
