// Path: src\hooks\use-analytics.ts
import { useCallback } from 'react';
import posthog from 'posthog-js';

type EventProperties = {
  [key: string]: string | number | boolean | null | undefined;
};

export function useAnalytics() {
  const trackEvent = useCallback(
    (eventName: string, properties?: EventProperties) => {
      posthog.capture(eventName, properties);

      if (typeof window !== 'undefined' && 'gtag' in window) {
        window.gtag('event', eventName, properties);
      }
    },
    []
  );

  return { trackEvent };
}
