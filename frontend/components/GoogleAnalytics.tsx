'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/analytics';
import { Suspense } from 'react';

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when route changes
    const url = pathname + searchParams.toString();
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}
