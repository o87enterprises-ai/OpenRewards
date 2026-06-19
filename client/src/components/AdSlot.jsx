import React from 'react';

// Stand-in for whatever first-party ad inventory you actually have. Swap this
// out for your own ad source — OpenRewards doesn't care where the ad comes
// from, only how long it was honestly visible (see RewardAdSlot.jsx).
const DEMO_ADS = [
  {
    id: 'demo-1',
    title: 'Sponsored: Try OpenRewards in your app',
    body: 'Drop-in, honest ad rewards for your users.',
    href: '#',
  },
  {
    id: 'demo-2',
    title: 'Sponsored: Ethical advertising, done right',
    body: 'No tracking. No dark patterns. Just ads.',
    href: '#',
  },
];

export const pickDemoAd = () => DEMO_ADS[Math.floor(Math.random() * DEMO_ADS.length)];
export const getDemoAdById = (id) => DEMO_ADS.find((ad) => ad.id === id) || null;

const AdSlot = ({ ad, className = '', compact = false }) => {
  if (!ad) return null;
  return (
    <a
      href={ad.href}
      className={`block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4 ${compact ? 'text-sm' : ''} ${className}`}
    >
      <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Advertisement</div>
      <div className="font-semibold">{ad.title}</div>
      <div className="text-white/60 text-sm mt-1">{ad.body}</div>
    </a>
  );
};

export default AdSlot;
