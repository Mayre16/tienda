"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isCmsEditOrigin, postToEditor, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { setCmsEditSession } from "@/lib/cms/edit-session";
import {
  isInEditorIframe,
  parseCmsEditParam,
  persistCmsEditMode,
  readStoredCmsEditMode,
} from "@/lib/cms/edit-mode";

export function CmsEditModeBootstrap() {
  const params = useSearchParams();
  const pathname = usePathname();
  const param = parseCmsEditParam(params.get("cmsEdit"));

  useLayoutEffect(() => {
    if (!isInEditorIframe()) return;

    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object" || msg.type !== "cms-edit-init") return;
      setCmsEditSession({ token: msg.token, site: msg.site });
    }

    window.addEventListener("message", onMessage);
    postToEditor({ type: "cms-request-init" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (param) persistCmsEditMode(param);
  }, [param]);

  useEffect(() => {
    if (!isInEditorIframe()) return;
    postToEditor({ type: "cms-ready" });
    const stored = readStoredCmsEditMode();
    if (stored || param) {
      postToEditor({ type: "cms-request-init" });
    }
  }, [pathname, param]);

  useEffect(() => {
    if (!isInEditorIframe()) return;
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      e.preventDefault();
      const mode =
        parseCmsEditParam(
          new URLSearchParams(window.location.search).get("cmsEdit"),
        ) ?? readStoredCmsEditMode();
      const sep = href.includes("?") ? "&" : "?";
      const next = mode ? `${href}${sep}cmsEdit=${mode}` : href;
      window.location.href = next;
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
