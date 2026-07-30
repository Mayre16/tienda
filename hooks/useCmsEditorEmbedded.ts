"use client";

import { useEffect, useState } from "react";
import {
  isCmsEditOrigin,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";

function isInEditorIframe() {
  if (typeof window === "undefined") return false;
  return window.parent !== window.self;
}

export function useCmsEditorEmbedded() {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    if (isInEditorIframe()) setEmbedded(true);

    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-edit-init") setEmbedded(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return embedded;
}
