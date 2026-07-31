"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { CmsHydrationProvider } from "@/lib/cms/hydration";
import {
  EARLY_CMS_PUBLISHED_KEY,
  type EarlyCmsPublishedSlot,
} from "@/lib/cms/early-published-bootstrap";
import editorialPublishedSnapshot from "@/data/editorial/published.json";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "editorial";

function snapshotPublished(): CmsDocument | null {
  const bundled = editorialPublishedSnapshot as CmsDocument;
  if (bundled && typeof bundled === "object" && bundled.version === 1) {
    return bundled;
  }
  return null;
}

const BUNDLED_PUBLISHED = snapshotPublished();

let doc: CmsDocument | null = BUNDLED_PUBLISHED;
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

function earlySlot(): EarlyCmsPublishedSlot | undefined {
  if (typeof window === "undefined") return undefined;
  return window[EARLY_CMS_PUBLISHED_KEY as "__editorialCmsPublished"];
}

function earlyPublishedPromise(): Promise<CmsDocument | null> | null {
  const p = earlySlot()?.promise;
  if (!p || typeof p.then !== "function") return null;
  return p.then((data) => {
    if (data && typeof data === "object" && (data as CmsDocument).version === 1) {
      return data as CmsDocument;
    }
    return null;
  });
}

function isNewerPublished(next: CmsDocument, current: CmsDocument | null): boolean {
  if (!current?.updatedAt) return true;
  if (!next.updatedAt) return true;
  return next.updatedAt >= current.updatedAt;
}

function applyPublished(data: CmsDocument | null) {
  if (data?.version === 1 && isNewerPublished(data, doc)) {
    doc = data;
    emit();
  }
}

function loadPublished() {
  if (!CMS_URL) return;
  const early = earlyPublishedPromise();
  if (early) {
    early.then(applyPublished).catch(() => {});
    return;
  }
  fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: CmsDocument | null) => applyPublished(data))
    .catch(() => {});
}

export function useCmsDocument() {
  const [value, setValue] = useState<CmsDocument | null>(() => getSnapshot());

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
