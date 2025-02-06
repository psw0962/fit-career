'use client';
import { useEffect } from 'react';

export default function AdsenseInit() {
  useEffect(() => {
    document.cookie = 'cookieConsent=true; SameSite=None; Secure';

    if (document.querySelector("script[src*='adsbygoogle.js']")) {
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2830847395912425';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    script.onload = () => {
      try {
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}
