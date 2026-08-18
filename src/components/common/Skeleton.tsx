import React from 'react';

/** Product card skeleton placeholder while products API is loading */
export const ProductCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8] flex flex-col h-full animate-pulse">
        <div className="aspect-square w-full bg-slate-200" />
        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
          <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-200 rounded-md w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-slate-200 rounded-md w-16" />
            <div className="w-7 h-7 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#D9F1F5] flex flex-col justify-between h-[360px] animate-pulse">
      <div className="aspect-4/3 w-full bg-slate-200" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded-md w-4/5" />
          <div className="h-3 bg-slate-200 rounded-md w-3/5" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="h-5 bg-slate-200 rounded-md w-20" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/** Category card skeleton placeholder while categories API is loading */
export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl overflow-hidden h-64 sm:h-72 border border-[#D9F1F5] flex-none w-[200px] sm:w-[240px] lg:w-[280px] bg-slate-200 animate-pulse p-4 flex flex-col justify-end">
      <div className="h-4 bg-slate-300 rounded-md w-3/4 mb-2" />
      <div className="h-3 bg-slate-300 rounded-md w-1/2" />
    </div>
  );
};

/** Hero slider skeleton placeholder while hero slides API is loading */
export const HeroSliderSkeleton: React.FC = () => {
  return (
    <div className="w-full px-3 sm:px-6 pt-2 max-w-7xl mx-auto">
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden h-[340px] sm:h-[400px] md:h-[450px] lg:h-[500px] bg-slate-200 animate-pulse relative p-6 flex flex-col justify-end">
        <div className="h-10 w-32 bg-slate-300 rounded-full" />
      </div>
    </div>
  );
};
