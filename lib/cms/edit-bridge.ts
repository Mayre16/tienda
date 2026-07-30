export const CMS_EDIT_ORIGINS = [
  "http://localhost:3400",
  "https://editor.acropolis.adesa.com.do",
];

export type CmsEditMessage =
  | { type: "cms-edit-init"; token: string; site: "acropolis" | "civis" | "editorial" }
  | { type: "cms-request-init" }
  | { type: "cms-save" }
  | { type: "cms-publish" }
  | { type: "cms-status"; text: string; ok?: boolean }
  | { type: "cms-ready" }
  | { type: "cms-dirty"; dirty: boolean }
  | { type: "cms-published" };

export function isCmsEditOrigin(origin: string) {
  return CMS_EDIT_ORIGINS.includes(origin);
}

export function resolveEditorParentOrigin(): string | null {
  if (typeof window === "undefined" || window.parent === window) return null;
  if (document.referrer) {
    try {
      const origin = new URL(document.referrer).origin;
      if (isCmsEditOrigin(origin)) return origin;
    } catch {
      /* ignore */
    }
  }
  if (window.location.hostname === "localhost") {
    return "http://localhost:3400";
  }
  return CMS_EDIT_ORIGINS.find((o) => o.startsWith("https://editor.")) ?? null;
}

export function postToEditor(message: CmsEditMessage) {
  if (typeof window === "undefined" || window.parent === window) return;
  const origin = resolveEditorParentOrigin();
  if (!origin) return;
  window.parent.postMessage(message, origin);
}
