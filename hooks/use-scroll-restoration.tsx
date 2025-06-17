'use client';

import { useEffect } from 'react';

export function useScrollRestoration(key: string) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll-${key}`, JSON.stringify({ scroll: window.scrollY }));
    };

    const restoreScroll = () => {
      const savedScroll = sessionStorage.getItem(`scroll-${key}`);
      if (savedScroll) {
        const { scroll } = JSON.parse(savedScroll);
        window.scrollTo(0, scroll);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    restoreScroll();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key]);
}
