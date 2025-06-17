'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function AdsenseAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const [adInitialized, setAdInitialized] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const renderTimer = setTimeout(() => {
      setShouldRender(true);
    }, 2000);

    return () => clearTimeout(renderTimer);
  }, []);

  useEffect(() => {
    if (!shouldRender || adInitialized) return;

    const waitForAdsense = setInterval(() => {
      if (window.adsbygoogle) {
        clearInterval(waitForAdsense);

        try {
          if (adRef.current && !adRef.current.id) {
            const uniqueId = `ad-${Math.random().toString(36).substring(2, 9)}`;
            adRef.current.id = uniqueId;

            window.adsbygoogle.push({});
            setAdInitialized(true);
          }
        } catch (err) {
          console.error('AdSense error:', err);
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(waitForAdsense);
    }, 5000);

    return () => {
      clearInterval(waitForAdsense);
      clearTimeout(timeout);
    };
  }, [adInitialized, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      ref={adRef}
      style={{
        minHeight: '0',
        height: '0px',
        overflow: 'hidden',
        contain: 'layout paint style',
        contentVisibility: 'auto',
      }}
    >
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-client='ca-pub-2830847395912425'
        data-ad-slot='6867921013'
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
    </div>
  );
}
