// Path: src\components\GoogleAnalytics.tsx
'use client';

import { GoogleAnalytics as GA } from '@next/third-parties/google';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import posthog from 'posthog-js';

function AnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    posthog.capture('$pageview', {
      path: pathname + searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <GA gaId={gaId} />
      <Suspense fallback={null}>
        <AnalyticsTracking />
      </Suspense>
    </>
  );
}
