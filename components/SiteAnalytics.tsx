"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  startAnalyticsSession,
  type AnalyticsSiteId,
} from "@/lib/site-analytics";

type Props = {
  site: AnalyticsSiteId;
};

/** Conteo interno de visitas — arranca en idle para no competir con LCP. */
export function SiteAnalytics({ site }: Props) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      if (cancelled) return;
      cleanup = startAnalyticsSession(site, pathname);
    };

    const ric = window.requestIdleCallback?.bind(window);
    if (ric) {
      const id = ric(start, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
        cleanup?.();
      };
    }

    const timer = window.setTimeout(start, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, [site, pathname]);

  return null;
}
