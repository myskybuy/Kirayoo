'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Re-renders the server page every `seconds` while the tab is visible (chat inbox polling). */
export default function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
