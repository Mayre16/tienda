"use client";

import { useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CMS_EDIT_STORAGE_KEY,
  isInEditorIframe,
  parseCmsEditParam,
  persistCmsEditMode,
  readStoredCmsEditMode,
  type CmsEditMode,
} from "@/lib/cms/edit-mode";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { useCmsHydrated } from "@/lib/cms/hydration";

function resolveEditMode(param: CmsEditMode | null): CmsEditMode | null {
  if (param) return param;
  if (typeof window === "undefined") return null;
  if (!isInEditorIframe()) return null;
  return readStoredCmsEditMode();
}

export function useCmsEditMode(): CmsEditMode | null {
  const params = useSearchParams();
  const hydrated = useCmsHydrated();
  const [mode, setMode] = useState<CmsEditMode | null>(null);

  useLayoutEffect(() => {
    if (!hydrated) return;

    const next = resolveEditMode(parseCmsEditParam(params.get("cmsEdit")));
    setMode(next);
    if (next) {
      persistCmsEditMode(next);
      postToEditor({ type: "cms-request-init" });
    } else if (!isInEditorIframe()) {
      sessionStorage.removeItem(CMS_EDIT_STORAGE_KEY);
    }
  }, [params, hydrated]);

  return mode;
}
