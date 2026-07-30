import type { CmsDocument, SiteId } from "@/lib/cms/types";
import { getCmsEditSession } from "@/lib/cms/edit-session";

const DEFAULT_CMS_API = "https://editor.acropolis.adesa.com.do/api";

export function cmsApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3401";
    }
  }
  return DEFAULT_CMS_API;
}

export function cmsEditorOrigin() {
  return cmsApiBase().replace(/\/api$/i, "");
}

export function resolveCmsMediaUrl(src?: string): string | undefined {
  if (!src) return undefined;
  // Portadas del catálogo impreso: viven en la tienda, no en el CMS.
  if (src.startsWith("/uploads/bookstore_covers/")) return src;
  const uploadPath = src.match(
    /(\/uploads\/(?:acropolis|civis|editorial)\/[^\s"?#]+)/,
  )?.[1];
  if (uploadPath) return `${cmsEditorOrigin()}${uploadPath}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) return `${cmsEditorOrigin()}${src}`;
  return src;
}

export function cmsUploadPathExample(site: SiteId) {
  return `/uploads/${site}/mi-foto.webp`;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const DRAFT_CACHE_PREFIX = "cms-draft-cache:";
const DRAFT_CACHE_TTL_MS = 5 * 60 * 1000;
const inflightDrafts = new Map<string, Promise<CmsDocument>>();

type StoredDraft = { doc: CmsDocument; at: number };

function readDraftCache(site: string): CmsDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${DRAFT_CACHE_PREFIX}${site}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.doc || Date.now() - parsed.at > DRAFT_CACHE_TTL_MS) return null;
    return parsed.doc;
  } catch {
    return null;
  }
}

function writeDraftCache(site: string, doc: CmsDocument) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${DRAFT_CACHE_PREFIX}${site}`,
      JSON.stringify({ doc, at: Date.now() } satisfies StoredDraft),
    );
  } catch {
    // quota exceeded — skip cache
  }
}

export function invalidateCmsDraftCache(site?: SiteId) {
  if (site) {
    for (const key of inflightDrafts.keys()) {
      if (key.startsWith(`${site}:`)) inflightDrafts.delete(key);
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`${DRAFT_CACHE_PREFIX}${site}`);
    }
    return;
  }
  inflightDrafts.clear();
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(DRAFT_CACHE_PREFIX)) sessionStorage.removeItem(key);
  }
}

async function fetchCmsDraftFromNetwork(
  site: SiteId,
  bearer?: string,
): Promise<CmsDocument> {
  const headers: HeadersInit = bearer
    ? { Authorization: `Bearer ${bearer}` }
    : {};
  const res = await fetch(`${cmsApiBase()}/content/${site}/draft`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("No se pudo cargar el borrador");
  const doc = (await res.json()) as CmsDocument;
  writeDraftCache(site, doc);
  return doc;
}

export async function fetchCmsDraft(
  site: SiteId,
  token?: string,
  opts?: { force?: boolean },
): Promise<CmsDocument> {
  const bearer = token ?? getCmsEditSession()?.token;
  const force = opts?.force ?? false;

  if (!force) {
    const cached = readDraftCache(site);
    if (cached) {
      if (bearer) {
        void fetchCmsDraftFromNetwork(site, bearer).catch(() => {});
      }
      return cached;
    }
  }

  const inflightKey = `${site}:${bearer ?? ""}`;
  const existing = inflightDrafts.get(inflightKey);
  if (existing) return existing;

  const promise = fetchCmsDraftFromNetwork(site, bearer);
  inflightDrafts.set(inflightKey, promise);
  try {
    return await promise;
  } finally {
    inflightDrafts.delete(inflightKey);
  }
}

export async function saveCmsDraft(
  site: SiteId,
  token: string,
  doc: CmsDocument,
): Promise<void> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/draft`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error("Error al guardar borrador");
  writeDraftCache(site, doc);
}

export type BookstoreSyncResult = {
  ok: boolean;
  synced?: number;
  failed?: number;
  skipped?: number;
  message?: string;
  results?: Array<{
    cmsId?: string;
    title?: string;
    status: string;
    bibliotecaId?: number;
    error?: string;
    reason?: string;
  }>;
};

export async function publishCms(
  site: SiteId,
  token: string,
): Promise<BookstoreSyncResult | null> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    bookstoreSync?: BookstoreSyncResult;
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || data.message || "Error al publicar");
  }
  invalidateCmsDraftCache(site);
  return data.bookstoreSync ?? null;
}

export async function syncEditorialBooksCms(
  token: string,
): Promise<BookstoreSyncResult> {
  const res = await fetch(`${cmsApiBase()}/content/editorial/sync-books`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    bookstoreSync?: BookstoreSyncResult;
    error?: string;
  };
  if (!res.ok && !data.bookstoreSync) {
    throw new Error(data.error || "Error al sincronizar libros");
  }
  return data.bookstoreSync ?? { ok: false, message: "Sin respuesta de sync" };
}

export async function uploadCmsFile(
  site: SiteId,
  token: string,
  file: File,
  kind: "image" | "document" | "video" = "image",
): Promise<string> {
  const { assertCmsUploadFile } = await import("@/lib/cms/upload-file-validate");
  await assertCmsUploadFile(file, kind);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch(`${cmsApiBase()}/upload/${site}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      data.error ||
        (kind === "document"
          ? "Error al subir PDF"
          : kind === "video"
            ? "Error al subir video"
            : "Error al subir imagen"),
    );
  }
  const url = data.url as string;
  if (url.startsWith("/uploads/")) return url;
  const rel = url.match(
    /(\/uploads\/(?:acropolis|civis|editorial)\/[^\s"?#]+)/,
  )?.[1];
  if (rel) return rel;
  return url;
}

export async function uploadCmsImage(
  site: SiteId,
  token: string,
  file: File,
): Promise<string> {
  return uploadCmsFile(site, token, file, "image");
}
