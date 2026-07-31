"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  CMS_EDIT_STORAGE_KEY,
  isInEditorIframe,
  parseCmsEditParam,
  persistCmsEditMode,
  readStoredCmsEditMode,
  type CmsEditMode,
} from "@/lib/cms/edit-mode";
import { postToEditor } from "@/lib/cms/edit-bridge";

/** Disparado por CmsEditModeBootstrap cuando cambia ?cmsEdit=… */
export const CMS_EDIT_MODE_CHANGE_EVENT = "acropolis-cms-edit-mode";

export function notifyCmsEditModeChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CMS_EDIT_MODE_CHANGE_EVENT));
}

function readUrlEditParam(): CmsEditMode | null {
  if (typeof window === "undefined") return null;
  return parseCmsEditParam(
    new URLSearchParams(window.location.search).get("cmsEdit"),
  );
}

function resolveEditMode(param: CmsEditMode | null): CmsEditMode | null {
  if (param) return param;
  if (typeof window === "undefined") return null;
  if (!isInEditorIframe()) return null;
  return readStoredCmsEditMode();
}

function getClientEditMode(): CmsEditMode | null {
  return resolveEditMode(readUrlEditParam());
}

function subscribeEditMode(onStoreChange: () => void): () => void {
  const refresh = () => onStoreChange();
  window.addEventListener("popstate", refresh);
  window.addEventListener(CMS_EDIT_MODE_CHANGE_EVENT, refresh);
  return () => {
    window.removeEventListener("popstate", refresh);
    window.removeEventListener(CMS_EDIT_MODE_CHANGE_EVENT, refresh);
  };
}

/**
 * Modo edición CMS. No usa `useSearchParams` para no forzar
 * BAILOUT_TO_CLIENT_SIDE_RENDERING (Suspense) en toda la página — crítico para LCP.
 */
export function useCmsEditMode(): CmsEditMode | null {
  const mode = useSyncExternalStore(
    subscribeEditMode,
    getClientEditMode,
    () => null,
  );

  useLayoutEffect(() => {
    if (mode) {
      persistCmsEditMode(mode);
      postToEditor({ type: "cms-request-init" });
    } else if (!isInEditorIframe()) {
      sessionStorage.removeItem(CMS_EDIT_STORAGE_KEY);
    }
  }, [mode]);

  return mode;
}
