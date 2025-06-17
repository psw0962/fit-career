'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function AdsenseInit() {
  useEffect(() => {
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

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}
