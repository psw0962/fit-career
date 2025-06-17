'use client';

import { useEffect } from 'react';

export default function AdsenseInit() {
  useEffect(() => {
    const loadAdsScript = () => {
      if (document.querySelector("script[src*='adsbygoogle.js']")) {
        return;
      }

      document.cookie = 'cookieConsent=true; SameSite=None; Secure';

      const script = document.createElement('script');
      script.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2830847395912425';
      script.async = true;
      script.crossOrigin = 'anonymous';

      document.head.appendChild(script);
    };

    if (document.readyState === 'complete') {
      setTimeout(loadAdsScript, 3000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadAdsScript, 3000);
      });
    }

    return () => {
      window.removeEventListener('load', loadAdsScript);
    };
  }, []);

  return null;
}
