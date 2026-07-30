"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { CmsHydrationProvider } from "@/lib/cms/hydration";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "editorial";

let doc: CmsDocument | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return doc;
}

function loadPublished() {
  if (!CMS_URL) return;
  fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: CmsDocument | null) => {
      if (data?.version === 1 && data !== doc) {
        doc = data;
        emit();
      }
    })
    .catch(() => {});
}

export function useCmsDocument() {
  const [value, setValue] = useState<CmsDocument | null>(null);

  useEffect(() => {
    const sync = () => {
      setValue((prev) => {
        const next = getSnapshot();
        return Object.is(prev, next) ? prev : next;
      });
    };
    sync();
    return subscribe(sync);
  }, []);

  return value;
}

export function isCmsEnabled() {
  return Boolean(CMS_URL);
}

export function CmsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const run = () => loadPublished();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-published") loadPublished();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <CmsHydrationProvider>{children}</CmsHydrationProvider>;
}
