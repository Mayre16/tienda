import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";

export type CmsEditSession = {
  token: string;
  site: "acropolis" | "civis" | "editorial";
};

const CMS_EDIT_SESSION_KEY = "acropolis-cms-edit-session";

let session: CmsEditSession | null = null;
const listeners = new Set<(value: CmsEditSession) => void>();

function readStoredSession(): CmsEditSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CMS_EDIT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CmsEditSession;
    if (!parsed?.token || !parsed?.site) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(value: CmsEditSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      sessionStorage.setItem(CMS_EDIT_SESSION_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(CMS_EDIT_SESSION_KEY);
    }
  } catch {
    // quota exceeded — in-memory session still works this navigation
  }
}

if (typeof window !== "undefined") {
  session = readStoredSession();
}

export function setCmsEditSession(value: CmsEditSession) {
  if (session?.token === value.token && session.site === value.site) return;
  session = value;
  persistSession(value);
  for (const listener of listeners) listener(value);
}

export function clearCmsEditSession() {
  session = null;
  persistSession(null);
}

export function getCmsEditSession(): CmsEditSession | null {
  return session;
}

export function subscribeCmsEditSession(
  listener: (value: CmsEditSession) => void,
) {
  listeners.add(listener);
  if (session) listener(session);
  return () => listeners.delete(listener);
}

export function registerCmsEditInit(
  onInit: (token: string, site: "acropolis" | "civis" | "editorial") => void,
  site: "acropolis" | "civis" | "editorial",
) {
  let appliedToken: string | null = null;

  function apply(value: CmsEditSession) {
    if (value.site !== site) return;
    if (appliedToken === value.token) return;
    appliedToken = value.token;
    onInit(value.token, value.site);
  }

  const unsub = subscribeCmsEditSession(apply);

  function onMessage(ev: MessageEvent<CmsEditMessage>) {
    if (!isCmsEditOrigin(ev.origin)) return;
    const msg = ev.data;
    if (!msg || typeof msg !== "object" || msg.type !== "cms-edit-init") return;
    setCmsEditSession({ token: msg.token, site: msg.site });
  }

  window.addEventListener("message", onMessage);
  postToEditor({ type: "cms-request-init" });

  return () => {
    unsub();
    window.removeEventListener("message", onMessage);
  };
}
