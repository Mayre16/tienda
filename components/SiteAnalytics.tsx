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

/** Conteo interno de visitas (vistas, visitantes, tiempo por página/sección). */
export function SiteAnalytics({ site }: Props) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    return startAnalyticsSession(site, pathname);
  }, [site, pathname]);

  return null;
}
