'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import * as storefrontService from '@/services/storefront-service';
import type { CampaignConfig, Product } from '@/types';
import { goToShop } from '@/utils/navigate-shop';

/** Compute Days:Hours:Minutes:Seconds left until endsAt ISO string. */
function diffToParts(endsAt: string | null | undefined, serverSkewMs: number) {
  if (!endsAt) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const end = new Date(endsAt).getTime();
  const now = Date.now() + serverSkewMs;
  const ms = Math.max(0, end - now);
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { hours, minutes, seconds, expired: ms <= 0 };
}

/**
 * Home flash / sale rail — shows the first live admin campaign
 * (flash or seasonal like Azaadi / 11.11), with real countdown + tagged products.
 */
export const FlashSale: React.FC = () => {
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [serverSkewMs, setServerSkewMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await storefrontService.fetchHomepageCampaign();
        if (cancelled) return;
        if (!data) {
          setCampaign(null);
          setProducts([]);
          setIsLive(false);
          return;
        }
        setCampaign(data.campaign);
        setProducts(data.products);
        setIsLive(data.isLive);
        const serverMs = new Date(data.serverTime).getTime();
        if (Number.isFinite(serverMs)) {
          setServerSkewMs(serverMs - Date.now());
        }
      } catch {
        if (!cancelled) {
          setCampaign(null);
          setProducts([]);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!campaign?.endsAt) return;
    const tick = () => {
      const parts = diffToParts(campaign.endsAt, serverSkewMs);
      setTimeLeft({
        hours: parts.hours,
        minutes: parts.minutes,
        seconds: parts.seconds,
        expired: parts.expired,
      });
      if (parts.expired) setIsLive(false);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [campaign?.endsAt, serverSkewMs]);

  if (loading || !campaign || !isLive) {
    return null;
  }

  const bg = campaign.backgroundColor || '#FFFDF7';
  const accent = campaign.accentColor || '#FFD52F';
  const bgStyle: React.CSSProperties = {
    backgroundColor: `${bg}66`,
    ...(campaign.backgroundImageUrl
      ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.72)), url(${campaign.backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="rounded-xl p-4 sm:p-6 border border-[#D9F1F5] shadow-xs" style={bgStyle}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md animate-bounce"
              style={{ backgroundColor: accent }}
            >
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#0798AE] tracking-tight">
                  {campaign.title}
                </h2>
                {campaign.badgeText && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0798AE]/15 text-[#0798AE] text-xs font-bold">
                    <span>{campaign.badgeText}</span>
                  </div>
                )}
              </div>
              {campaign.subtitle && (
                <p className="text-xs text-[#0798AE] font-medium mt-0.5">{campaign.subtitle}</p>
              )}
            </div>
          </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          {campaign.endsAt && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#D9F1F5] shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: accent }} />
                <span className="text-xs font-bold text-[#0798AE]">Ends in:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-black text-sm text-[#0798AE]">
                <span className="bg-[#0798AE] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#0798AE]">Hours</span>
                <span>:</span>
                <span className="bg-[#0798AE] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#0798AE]">Minutes</span>
                <span>:</span>
                <span className="bg-[#0798AE] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#0798AE]">Seconds</span>
              </div>
            </div>
          )}

          {/* Desktop Scroll Controls */}
          {products.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 self-start md:self-auto md:ml-4">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-[#D9F1F5] hover:bg-[#D9F1F5] text-[#0798AE] transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-[#0798AE] font-medium text-center py-8">
            Tag products with this campaign&apos;s tags in Admin to show them here.
          </p>
        ) : (
          <div className="relative">
            {/* Mobile-only floating scroll arrows */}
            <button
              onClick={() => scroll('left')}
              className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -ml-2 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-[#D9F1F5] shadow-md text-[#0798AE] -mr-2 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div 
              ref={scrollRef}
              className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x snap-mandatory"
            >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[calc(50%-4px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] snap-start"
              >
                <ProductCard product={product} compact={false} />
              </div>
            ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() =>
              goToShop(router, {
                saleKey: campaign.key,
                onSaleOnly: false,
                categoryId: null,
                categoryIds: [],
              })
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0798AE] hover:bg-[#0798AE] hover:text-white border border-[#D9F1F5] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
