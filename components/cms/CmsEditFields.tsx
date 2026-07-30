"use client";

import { useState, type ReactNode } from "react";
import {
  cmsUploadPathExample,
  resolveCmsMediaUrl,
  uploadCmsFile,
  uploadCmsImage,
} from "@/lib/cms/api-client";
import {
  CMS_IMAGE_ACCEPT,
  CMS_IMAGE_UPLOAD_HINT,
  CMS_PDF_ACCEPT,
} from "@/lib/cms/upload-file-validate";
import type { CmsMedia } from "@/lib/cms/types";

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export function EditSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EditField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck
          lang="es"
          className={fieldClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          lang="es"
          className={fieldClass}
        />
      )}
    </label>
  );
}

export function ImageField({
  label,
  media,
  token,
  onChange,
  objectPosition,
  onObjectPositionChange,
}: {
  label: string;
  media: CmsMedia & { objectPosition?: string };
  token: string | null;
  onChange: (m: CmsMedia & { objectPosition?: string }) => void;
  objectPosition?: string;
  onObjectPositionChange?: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(media.src);
  const pathHint = cmsUploadPathExample("editorial");

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const url = await uploadCmsImage("editorial", token, file);
      onChange({ ...media, src: url });
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <EditField
        label="Ruta de la imagen (URL)"
        value={media.src}
        onChange={(v) => onChange({ ...media, src: v })}
      />
      <p className="text-xs leading-relaxed text-slate-600">
        Al subir, la ruta queda guardada como{" "}
        <code className="rounded bg-slate-100 px-1">{pathHint}</code>.
      </p>
      <EditField
        label="Texto alternativo"
        value={media.alt}
        onChange={(v) => onChange({ ...media, alt: v })}
      />
      {onObjectPositionChange ? (
        <EditField
          label="Encuadre (object-position)"
          value={objectPosition ?? media.objectPosition ?? ""}
          onChange={(v) => {
            onObjectPositionChange(v);
            onChange({ ...media, objectPosition: v || undefined });
          }}
        />
      ) : null}
      <label className="block text-sm">
        <span className="font-semibold text-slate-700">
          Subir foto (WebP, &lt; 100 KB)
        </span>
        <input
          type="file"
          accept={CMS_IMAGE_ACCEPT}
          disabled={!token || uploading}
          className="mt-1 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-amber-900">{CMS_IMAGE_UPLOAD_HINT}</p>
      {uploading ? <p className="text-xs text-amber-700">Subiendo…</p> : null}
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt={media.alt || "Vista previa"}
          className="max-h-36 w-full rounded-lg object-cover"
          style={{ objectPosition: media.objectPosition ?? "50% 30%" }}
        />
      ) : media.src.trim() ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          No se pudo cargar la vista previa.
        </p>
      ) : null}
    </fieldset>
  );
}

export function UrlImageField({
  label,
  url,
  alt,
  token,
  onUrlChange,
  onAltChange,
}: {
  label: string;
  url: string;
  alt?: string;
  token: string | null;
  onUrlChange: (v: string) => void;
  onAltChange?: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = resolveCmsMediaUrl(url);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const uploaded = await uploadCmsImage("editorial", token, file);
      onUrlChange(uploaded);
    } catch (e) {
      window.alert(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <EditField label="Ruta de imagen" value={url} onChange={onUrlChange} />
      {onAltChange ? (
        <EditField label="Texto alternativo" value={alt ?? ""} onChange={onAltChange} />
      ) : null}
      <label className="block text-sm">
        <span className="font-semibold text-slate-700">
          Subir foto (WebP, &lt; 100 KB)
        </span>
        <input
          type="file"
          accept={CMS_IMAGE_ACCEPT}
          disabled={!token || uploading}
          className="mt-1 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-amber-900">{CMS_IMAGE_UPLOAD_HINT}</p>
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewSrc} alt={alt ?? ""} className="max-h-36 rounded-lg object-cover" />
      ) : null}
    </fieldset>
  );
}

export function UrlPdfField({
  label,
  url,
  token,
  onUrlChange,
}: {
  label: string;
  url: string;
  token: string | null;
  onUrlChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const publicUrl = resolveCmsMediaUrl(url);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const uploaded = await uploadCmsFile("editorial", token, file, "document");
      onUrlChange(uploaded);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <EditField
        label="URL o ruta del PDF"
        value={url}
        onChange={onUrlChange}
      />
      <label className="block text-sm">
        <span className="font-semibold text-slate-700">
          Subir PDF local (solo .pdf)
        </span>
        <input
          type="file"
          accept={CMS_PDF_ACCEPT}
          disabled={!token || uploading}
          className="mt-1 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-slate-500">
        Solo archivos PDF. Otros formatos serán rechazados.
      </p>
      {uploading ? (
        <p className="text-xs text-slate-500">Subiendo PDF…</p>
      ) : null}
      {publicUrl && publicUrl !== "#" ? (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-na-editorial hover:underline"
        >
          Ver PDF actual
        </a>
      ) : null}
    </fieldset>
  );
}

export function ParagraphsField({
  paragraphs,
  onChange,
  label = "Párrafos",
}: {
  paragraphs: string[];
  onChange: (v: string[]) => void;
  label?: string;
}) {
  const body = paragraphs.length > 0 ? paragraphs : [""];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
          onClick={() => onChange([...body, ""])}
        >
          + Párrafo
        </button>
      </div>
      {body.map((p, pi) => (
        <div key={pi} className="flex gap-2">
          <label className="min-w-0 flex-1 block text-sm">
            <span className="text-xs font-semibold text-slate-600">
              Párrafo {pi + 1}
            </span>
            <textarea
              value={p}
              onChange={(e) => {
                const next = [...body];
                next[pi] = e.target.value;
                onChange(next);
              }}
              rows={3}
              spellCheck
              lang="es"
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            className="shrink-0 self-start text-xs text-red-600"
            onClick={() => onChange(body.filter((_, j) => j !== pi))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function EditPanelChrome({
  title,
  dirty,
  busy,
  status,
  onClose,
  onSave,
  children,
}: {
  title: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-na-ink/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-bold text-na-ink">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <div className="space-y-2 border-t bg-slate-50 p-4">
          {status ? (
            <p className="text-center text-xs text-slate-600">{status}</p>
          ) : dirty ? (
            <p className="text-center text-xs text-amber-700">Cambios sin guardar.</p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="w-full rounded-lg bg-na-editorial py-3 text-sm font-bold text-white hover:bg-na-editorialDark disabled:opacity-50"
          >
            {busy ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border py-2 text-sm font-medium text-slate-600 hover:bg-white"
          >
            Cerrar panel
          </button>
        </div>
      </aside>
    </div>
  );
}

export function EditToolbar({
  label,
  dirty,
  busy,
  status,
  onSave,
  onPublish,
}: {
  label: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <div
      data-cms-edit-toolbar
      className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="text-xs font-semibold text-amber-950 sm:text-sm">
          Modo edición — {label}
          {dirty ? (
            <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Sin guardar
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="rounded-lg bg-na-editorial px-3 py-1.5 text-xs font-bold text-white hover:bg-na-editorialDark disabled:opacity-50 sm:text-sm"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 sm:text-sm"
          >
            Publicar
          </button>
        </div>
      </div>
      {status ? (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-xs text-amber-800">
          {status}
        </p>
      ) : (
        <p className="border-t border-amber-100 px-3 py-1 text-center text-[11px] text-amber-700">
          Clic en <strong>✎</strong> para editar.
        </p>
      )}
    </div>
  );
}

export function SectionCopyFields({
  value,
  onChange,
}: {
  value: { eyebrow?: string; title?: string; lede?: string };
  onChange: (patch: { eyebrow?: string; title?: string; lede?: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <EditField
        label="Etiqueta superior"
        value={value.eyebrow ?? ""}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <EditField
        label="Título"
        value={value.title ?? ""}
        onChange={(v) => onChange({ title: v })}
      />
      <EditField
        label="Texto introductorio"
        value={value.lede ?? ""}
        onChange={(v) => onChange({ lede: v })}
        multiline
      />
    </div>
  );
}

export function EditorialEditPencil({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-amber-950 shadow-md transition hover:bg-amber-500 ${className}`}
      aria-label={label}
      title={label}
    >
      ✎
    </button>
  );
}

export function CmsSectionEditBar({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
    >
      ✎ {label}
    </button>
  );
}
