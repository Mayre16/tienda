export type AnalyticsSiteId =
  | "acropolis"
  | "civis"
  | "editorial"
  | "circulodeamigos"
  | "biblioteca";

const VISITOR_STORAGE_KEY = "oina-analytics-vid";

function analyticsApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3401";
    }
  }
  return "https://editor.acropolis.adesa.com.do/api";
}

function shouldTrack(): boolean {
  if (typeof window === "undefined") return false;
  if (window.parent !== window) return false;
  if (window.location.hostname.endsWith(".github.io")) return false;
  if (document.documentElement.classList.contains("cms-edit-embedded")) {
    return false;
  }
  if (/[?&]cmsEdit=/.test(window.location.search)) return false;
  return true;
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

async function sendEvent(payload: Record<string, unknown>) {
  try {
    await fetch(`${analyticsApiBase()}/analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // métricas opcionales — no interrumpir la navegación
  }
}

export function trackPageview(site: AnalyticsSiteId, path: string) {
  if (!shouldTrack()) return;
  void sendEvent({
    site,
    event: "pageview",
    path,
    visitorId: getVisitorId(),
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
    host: typeof window !== "undefined" ? window.location.hostname : "",
  });
}

export function trackEngagement(
  site: AnalyticsSiteId,
  path: string,
  durationMs: number,
  section?: string,
) {
  if (!shouldTrack() || durationMs <= 0) return;
  void sendEvent({
    site,
    event: "engagement",
    path,
    section: section || undefined,
    durationMs: Math.round(durationMs),
    visitorId: getVisitorId(),
  });
}

export function trackFormSubmit(
  site: AnalyticsSiteId,
  formKey: string,
  path?: string,
) {
  if (!shouldTrack()) return;
  void sendEvent({
    site,
    event: "form",
    formKey,
    path: path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    visitorId: getVisitorId(),
  });
}

export function trackWhatsAppClick(site: AnalyticsSiteId, path?: string) {
  if (!shouldTrack()) return;
  void sendEvent({
    site,
    event: "whatsapp",
    path: path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    visitorId: getVisitorId(),
  });
}

function isWhatsAppHref(href: string): boolean {
  try {
    const u = new URL(href, window.location.href);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    return (
      host === "wa.me" ||
      host === "api.whatsapp.com" ||
      host === "web.whatsapp.com" ||
      host === "chat.whatsapp.com"
    );
  } catch {
    return /wa\.me|whatsapp\.com/i.test(href);
  }
}

export function startAnalyticsSession(site: AnalyticsSiteId, path: string) {
  if (!shouldTrack()) return () => {};

  trackPageview(site, path);

  let activeSection = "";
  let tickStartedAt = Date.now();
  let visible = document.visibilityState === "visible";

  const flush = (section = activeSection) => {
    const now = Date.now();
    const elapsed = visible ? now - tickStartedAt : 0;
    if (elapsed > 0) {
      trackEngagement(site, path, elapsed, section || undefined);
    }
    tickStartedAt = now;
  };

  const setSection = (next: string) => {
    if (next === activeSection) return;
    flush(activeSection);
    activeSection = next;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      let best: { id: string; ratio: number } | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.oinaSection?.trim();
        if (!id) continue;
        if (!best || entry.intersectionRatio > best.ratio) {
          best = { id, ratio: entry.intersectionRatio };
        }
      }
      if (best && best.ratio >= 0.2) setSection(best.id);
    },
    { threshold: [0.2, 0.35, 0.5, 0.75] },
  );

  for (const el of document.querySelectorAll("[data-oina-section]")) {
    observer.observe(el);
  }

  const tick = window.setInterval(() => {
    if (!visible) return;
    flush(activeSection);
  }, 15000);

  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      flush(activeSection);
      visible = false;
    } else {
      visible = true;
      tickStartedAt = Date.now();
    }
  };

  const onPageHide = () => flush(activeSection);

  const onClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement | null;
    const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!anchor?.href) return;
    if (!isWhatsAppHref(anchor.href)) return;
    trackWhatsAppClick(site, path);
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("click", onClick, true);

  return () => {
    flush(activeSection);
    window.clearInterval(tick);
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    document.removeEventListener("click", onClick, true);
  };
}
