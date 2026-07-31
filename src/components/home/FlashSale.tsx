import React, { useEffect, useState } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { useShopStore } from '../../store/useShopStore';
import * as storefrontService from '@/services/storefront-service';
import type { CampaignConfig, Product } from '@/types';

/** Compute Days:Hours:Minutes:Seconds left until endsAt ISO string. */
function diffToParts(endsAt: string | null | undefined, serverSkewMs: number) {
  if (!endsAt) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const end = new Date(endsAt).getTime();
  const now = Date.now() + serverSkewMs;
  const ms = Math.max(0, end - now);
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, expired: ms <= 0 };
}

/**
 * Home flash / sale rail — shows the first live admin campaign
 * (flash or seasonal like Azaadi / 11.11), with real countdown + tagged products.
 */
export const FlashSale: React.FC = () => {
  const { setCurrentView, setFilter } = useShopStore();
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [serverSkewMs, setServerSkewMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
        days: parts.days,
        hours: parts.hours,
        minutes: parts.minutes,
        seconds: parts.seconds,
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

  const bg = campaign.backgroundColor || '#FDFD96';
  const accent = campaign.accentColor || '#FFB347';
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl p-6 sm:p-8 border border-[#F5F2ED] shadow-xs" style={bgStyle}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md animate-bounce"
              style={{ backgroundColor: accent }}
            >
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#5A5A40] tracking-tight">
                  {campaign.title}
                </h2>
                {campaign.badgeText && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-white text-xs font-black"
                    style={{ backgroundColor: accent }}
                  >
                    {campaign.badgeText}
                  </span>
                )}
              </div>
              {campaign.subtitle && (
                <p className="text-xs text-[#8C8C70] font-medium mt-0.5">{campaign.subtitle}</p>
              )}
            </div>
          </div>

          {campaign.endsAt && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#F5F2ED] shadow-2xs self-start md:self-auto">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: accent }} />
                <span className="text-xs font-bold text-[#5A5A40]">Ends in:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-black text-sm text-[#5A5A40]">
                <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#8C8C70]">Days</span>
                <span>:</span>
                <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#8C8C70]">Hours</span>
                <span>:</span>
                <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#8C8C70]">Minutes</span>
                <span>:</span>
                <span className="bg-[#5A5A40] text-white px-2 py-1 rounded-md min-w-8 text-center">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#8C8C70]">Seconds</span>
              </div>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-[#8C8C70] font-medium text-center py-8">
            Tag products with this campaign&apos;s tags in Admin to show them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setFilter({
                saleKey: campaign.key,
                onSaleOnly: false,
                categoryId: null,
                categoryIds: [],
              });
              setCurrentView('shop');
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white border border-[#F5F2ED] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
