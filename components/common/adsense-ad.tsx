'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: {
      push: (args: {
        render: (element: HTMLElement) => void;
        reset: () => void;
        defineSlot: (slot: string) => void;
      }) => void;
    };
  }
}

export default function AdsenseAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const [adInitialized, setAdInitialized] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const renderTimer = setTimeout(() => {
      setShouldRender(true);
    }, 3500);

    return () => clearTimeout(renderTimer);
  }, []);

  useEffect(() => {
    if (!shouldRender || adInitialized) return;

    const initAd = () => {
      try {
        if (adRef.current && !adRef.current.id && window.adsbygoogle) {
          const uniqueId = `ad-${Math.random().toString(36).substring(2, 9)}`;
          adRef.current.id = uniqueId;

          window.adsbygoogle.push({
            render: (element: HTMLElement) => {
              element.id = uniqueId;
            },
            reset: () => {},
            defineSlot: (slot: string) => {},
          });
          setAdInitialized(true);
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    const checkInterval = 500;
    const maxChecks = 10;
    let checkCount = 0;

    const checkAdsbygoogle = () => {
      if (window.adsbygoogle) {
        initAd();
        return;
      }

      checkCount++;
      if (checkCount < maxChecks) {
        setTimeout(checkAdsbygoogle, checkInterval);
      }
    };

    const initialCheck = setTimeout(checkAdsbygoogle, checkInterval);

    const maxWaitTimeout = setTimeout(() => {
      checkCount = maxChecks;
    }, 5000);

    return () => {
      clearTimeout(initialCheck);
      clearTimeout(maxWaitTimeout);
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
