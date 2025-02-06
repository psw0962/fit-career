'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function AdsenseAd() {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;
    adLoaded.current = true;

    try {
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-2830847395912425"
      data-ad-slot="6867921013"
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-privacy-sandbox="true"
    />
  );
}
