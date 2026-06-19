import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRewards } from '../context/RewardsContext';
import AdSlot, { pickDemoAd, getDemoAdById } from './AdSlot';

const formatCents = (cents) => `$${(Math.max(0, cents || 0) / 100).toFixed(2)}`;

const POLL_MS = 500;

/*
 * Reward-eligible ad slot: renders an ad and, for users opted into the
 * Rewards Program, honestly measures real cumulative visible time via
 * IntersectionObserver and claims a small cash reward once the server's
 * minimum visible-time threshold is met.
 *
 * For users who are not opted in, this behaves identically to a plain
 * AdSlot: same ad, no session calls, no extra tracking. The earn() call is
 * still verified server-side against real wall-clock time (see
 * server/src/routes/rewards.js), so a tampered client can never claim more
 * than honest viewing would allow.
 */
const RewardAdSlot = ({ zone = 'demo', adId, className = '', compact = false }) => {
  const { optedIn, config, startImpressionSession, earn } = useRewards();

  const ad = useMemo(() => (adId ? getDemoAdById(adId) : null) || pickDemoAd(), [adId]);

  const containerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionPendingRef = useRef(false);
  const visibleSinceRef = useRef(null);
  const accumulatedMsRef = useRef(0);
  const earnedRef = useRef(false);
  const [earned, setEarned] = useState(false);

  const minVisibleMs = config?.minVisibleMs ?? 4000;
  const trackingEnabled = optedIn && !!ad;

  useEffect(() => {
    if (!trackingEnabled || !containerRef.current) return;
    let cancelled = false;

    const ensureSession = () => {
      if (sessionIdRef.current || sessionPendingRef.current) return;
      sessionPendingRef.current = true;
      startImpressionSession(ad.id, zone).then((result) => {
        sessionPendingRef.current = false;
        if (!cancelled && result.success) sessionIdRef.current = result.sessionId;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && document.visibilityState === 'visible';
        if (isVisible) {
          if (!visibleSinceRef.current) visibleSinceRef.current = Date.now();
          ensureSession();
        } else if (visibleSinceRef.current) {
          accumulatedMsRef.current += Date.now() - visibleSinceRef.current;
          visibleSinceRef.current = null;
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible' && visibleSinceRef.current) {
        accumulatedMsRef.current += Date.now() - visibleSinceRef.current;
        visibleSinceRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const interval = setInterval(async () => {
      if (cancelled || earnedRef.current || !sessionIdRef.current) return;
      const liveMs =
        accumulatedMsRef.current + (visibleSinceRef.current ? Date.now() - visibleSinceRef.current : 0);
      if (liveMs >= minVisibleMs) {
        earnedRef.current = true;
        const sessionId = sessionIdRef.current;
        sessionIdRef.current = null;
        const result = await earn(sessionId, liveMs);
        if (!cancelled && result.success) setEarned(true);
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [trackingEnabled, ad, zone, minVisibleMs, startImpressionSession, earn]);

  if (!ad) return null;

  return (
    <div ref={containerRef} className="relative">
      <AdSlot ad={ad} className={className} compact={compact} />
      {trackingEnabled && earned && (
        <span className="absolute -top-2 -right-2 z-10 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow">
          +{formatCents(config?.centsPerImpression)} earned
        </span>
      )}
    </div>
  );
};

export default RewardAdSlot;
