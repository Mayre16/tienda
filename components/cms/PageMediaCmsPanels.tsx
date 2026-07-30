"use client";

import { useState } from "react";
import {
  EditField,
  EditPanelChrome,
  ImageField,
  ParagraphsField,
} from "@/components/cms/CmsEditFields";
import { resolveCmsMediaUrl, uploadCmsFile } from "@/lib/cms/api-client";
import { CMS_PDF_ACCEPT, CMS_VIDEO_ACCEPT } from "@/lib/cms/upload-file-validate";
import {
  PAGE_MEDIA_SECTION_ID,
  blockKindLabel,
  getSectionBlocks,
  parsePageMediaBlockSelectedId,
  parsePageMediaSectionSelectedId,
} from "@/lib/cms/page-media";
import type {
  CmsPageMediaBlock,
  CmsPageMediaCard,
  CmsPageMediaSection,
  SiteId,
} from "@/lib/cms/types";

type Props = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  sections: CmsPageMediaSection[];
  patchSection: (id: string, patch: Partial<CmsPageMediaSection>) => void;
  patchBlock: (
    sectionId: string,
    blockId: string,
    patch: Partial<CmsPageMediaBlock>,
  ) => void;
  addGalleryItem: (sectionId: string, blockId: string) => string;
  patchGalleryItem: (
    sectionId: string,
    blockId: string,
    itemId: string,
    patch: Partial<CmsPageMediaCard>,
  ) => void;
  deleteGalleryItem: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  moveGalleryItemUp: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  moveGalleryItemDown: (
    sectionId: string,
    blockId: string,
    itemId: string,
  ) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  moveBlockUp: (sectionId: string, blockId: string) => void;
  moveBlockDown: (sectionId: string, blockId: string) => void;
  deleteSection: (id: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  dirty: boolean;
  busy: boolean;
  status: string;
  onSave: () => void;
  token: string | null;
  siteId: SiteId;
};

function MediaUploadField({
  label,
  href,
  token,
  siteId,
  onChange,
  accept = CMS_VIDEO_ACCEPT,
  uploadLabel = "Subir archivo",
  kind = "video",
}: {
  label: string;
  href: string;
  token: string | null;
  siteId: SiteId;
  onChange: (href: string) => void;
  accept?: string;
  uploadLabel?: string;
  kind?: "image" | "document" | "video";
}) {
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | null) {
    if (!file || !token) return;
    setUploading(true);
    try {
      const url = await uploadCmsFile(siteId, token, file, kind);
      onChange(url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  const resolved = resolveCmsMediaUrl(href) ?? href;

  return (
    <div className="space-y-2">
      <EditField label={`${label} (URL)`} value={href} onChange={onChange} />
      <label className="block text-xs font-semibold text-slate-600">
        {uploadLabel}
        <input
          type="file"
          accept={accept}
          disabled={!token || uploading}
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </label>
      {uploading ? (
        <p className="text-xs text-slate-500">Subiendo…</p>
      ) : resolved ? (
        <a
          href={resolved}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-na-kefer hover:underline"
        >
          Ver archivo actual
        </a>
      ) : null}
    </div>
  );
}

function WidthField({
  value,
  onChange,
}: {
  value: "normal" | "full" | undefined;
  onChange: (v: "normal" | "full") => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      Ancho
      <select
        value={value ?? "normal"}
        onChange={(e) => onChange(e.target.value as "normal" | "full")}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="normal">Columna (normal)</option>
        <option value="full">Ancho completo</option>
      </select>
    </label>
  );
}

function AlignField({
  width,
  value,
  onChange,
}: {
  width: "normal" | "full" | undefined;
  value: "left" | "center" | undefined;
  onChange: (v: "left" | "center") => void;
}) {
  if (width === "full") return null;
  return (
    <label className="block text-xs font-semibold text-slate-600">
      Alineación
      <select
        value={value ?? "left"}
        onChange={(e) => onChange(e.target.value as "left" | "center")}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="left">Izquierda</option>
        <option value="center">Centro</option>
      </select>
      <p className="mt-1 text-[11px] font-normal text-slate-500">
        Útil cuando el bloque es solo foto o video, sin texto al lado.
      </p>
    </label>
  );
}

function BlockOrderButtons({
  sectionId,
  blockId,
  blocks,
  moveBlockUp,
  moveBlockDown,
}: {
  sectionId: string;
  blockId: string;
  blocks: CmsPageMediaBlock[];
  moveBlockUp: (sectionId: string, blockId: string) => void;
  moveBlockDown: (sectionId: string, blockId: string) => void;
}) {
  const index = blocks.findIndex((b) => b.id === blockId);
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={index <= 0}
        onClick={() => moveBlockUp(sectionId, blockId)}
        className="rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
      >
        Subir bloque
      </button>
      <button
        type="button"
        disabled={index < 0 || index >= blocks.length - 1}
        onClick={() => moveBlockDown(sectionId, blockId)}
        className="rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
      >
        Bajar bloque
      </button>
    </div>
  );
}

function BlockEditPanel({
  block,
  sectionId,
  blocks,
  patchBlock,
  addGalleryItem,
  patchGalleryItem,
  deleteGalleryItem,
  moveGalleryItemUp,
  moveGalleryItemDown,
  moveBlockUp,
  moveBlockDown,
  deleteBlock,
  token,
  siteId,
}: {
  block: CmsPageMediaBlock;
  sectionId: string;
  blocks: CmsPageMediaBlock[];
  patchBlock: Props["patchBlock"];
  addGalleryItem: Props["addGalleryItem"];
  patchGalleryItem: Props["patchGalleryItem"];
  deleteGalleryItem: Props["deleteGalleryItem"];
  moveGalleryItemUp: Props["moveGalleryItemUp"];
  moveGalleryItemDown: Props["moveGalleryItemDown"];
  moveBlockUp: Props["moveBlockUp"];
  moveBlockDown: Props["moveBlockDown"];
  deleteBlock: Props["deleteBlock"];
  token: string | null;
  siteId: SiteId;
}) {
  if (block.kind === "text") {
    return (
      <>
        <WidthField
          value={block.width}
          onChange={(width) => patchBlock(sectionId, block.id, { width })}
        />
        <EditField
          label="Subtítulo (opcional)"
          value={block.heading ?? ""}
          onChange={(heading) => patchBlock(sectionId, block.id, { heading })}
        />
        <ParagraphsField
          paragraphs={block.paragraphs?.length ? block.paragraphs : [""]}
          onChange={(paragraphs) =>
            patchBlock(sectionId, block.id, {
              paragraphs: paragraphs.length > 0 ? paragraphs : [""],
            })
          }
        />
      </>
    );
  }

  if (block.kind === "button") {
    return (
      <>
        <WidthField
          value={block.width}
          onChange={(width) => patchBlock(sectionId, block.id, { width })}
        />
        <EditField
          label="Texto del botón"
          value={block.label}
          onChange={(label) => patchBlock(sectionId, block.id, { label })}
        />
        <label className="block text-xs font-semibold text-slate-600">
          Tipo de enlace
          <select
            value={block.linkKind}
            onChange={(e) =>
              patchBlock(sectionId, block.id, {
                linkKind: e.target.value as typeof block.linkKind,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="internal">Página del sitio</option>
            <option value="url">URL externa</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        {block.linkKind === "whatsapp" ? (
          <>
            <EditField
              label="Teléfono WhatsApp (opcional, solo números)"
              value={block.whatsappPhone ?? ""}
              onChange={(whatsappPhone) =>
                patchBlock(sectionId, block.id, { whatsappPhone })
              }
            />
            <EditField
              label="Mensaje prefijado"
              value={block.whatsappMessage ?? ""}
              onChange={(whatsappMessage) =>
                patchBlock(sectionId, block.id, { whatsappMessage })
              }
              multiline
            />
          </>
        ) : (
          <EditField
            label={block.linkKind === "internal" ? "Ruta (ej. /cursos)" : "URL"}
            value={block.href ?? ""}
            onChange={(href) => patchBlock(sectionId, block.id, { href })}
          />
        )}
        <label className="block text-xs font-semibold text-slate-600">
          Estilo
          <select
            value={block.variant ?? "primary"}
            onChange={(e) =>
              patchBlock(sectionId, block.id, {
                variant: e.target.value as typeof block.variant,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="primary">Primario (verde)</option>
            <option value="outline">Contorno</option>
            <option value="whatsapp">WhatsApp (verde)</option>
          </select>
        </label>
        <AlignField
          width={block.width}
          value={block.align}
          onChange={(align) => patchBlock(sectionId, block.id, { align })}
        />
      </>
    );
  }

  if (block.kind === "gallery") {
    const isCarousel = (block.display ?? "grid") === "carousel";
    return (
      <>
        <WidthField
          value={block.width}
          onChange={(width) => patchBlock(sectionId, block.id, { width })}
        />
        <AlignField
          width={block.width}
          value={block.align}
          onChange={(align) => patchBlock(sectionId, block.id, { align })}
        />
        <label className="block text-xs font-semibold text-slate-600">
          Presentación
          <select
            value={block.display ?? "grid"}
            onChange={(e) =>
              patchBlock(sectionId, block.id, {
                display: e.target.value as "grid" | "carousel",
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="grid">Cuadrícula (columnas y filas)</option>
            <option value="carousel">Carrusel con mensaje</option>
          </select>
        </label>
        {isCarousel ? (
          <>
            <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-950">
              El <strong>título y texto del bloque</strong> se muestran fijos en
              todo el carrusel. En cada foto puede añadir un{" "}
              <strong>título y texto propios</strong> que cambian al avanzar.
            </p>
            <EditField
              label="Título fijo del carrusel (opcional)"
              value={block.carouselTitle ?? ""}
              onChange={(carouselTitle) =>
                patchBlock(sectionId, block.id, { carouselTitle })
              }
            />
            <EditField
              label="Texto fijo del carrusel (opcional)"
              value={block.carouselText ?? ""}
              onChange={(carouselText) =>
                patchBlock(sectionId, block.id, { carouselText })
              }
              multiline
            />
            <label className="block text-xs font-semibold text-slate-600">
              Mensaje a la
              <select
                value={block.carouselSide ?? "left"}
                onChange={(e) =>
                  patchBlock(sectionId, block.id, {
                    carouselSide: e.target.value as "left" | "right",
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="left">Izquierda (fotos a la derecha)</option>
                <option value="right">Derecha (fotos a la izquierda)</option>
              </select>
            </label>
          </>
        ) : (
          <label className="block text-xs font-semibold text-slate-600">
            Columnas
            <select
              value={block.columns ?? 3}
              onChange={(e) =>
                patchBlock(sectionId, block.id, {
                  columns: Number(e.target.value) as 2 | 3,
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value={2}>2 columnas</option>
              <option value={3}>3 columnas</option>
            </select>
          </label>
        )}
        <label className="block text-xs font-semibold text-slate-600">
          Estilo de foto
          <select
            value={block.layout ?? "overlay"}
            onChange={(e) =>
              patchBlock(sectionId, block.id, {
                layout: e.target.value as "card" | "overlay",
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="overlay">Pie al hover (home)</option>
            <option value="card">Tarjeta con texto debajo</option>
          </select>
        </label>
        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Fotos de la galería
          </p>
          {block.items.map((item, i) => (
            <div key={item.id} className="rounded-md bg-slate-50 p-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs font-semibold text-slate-600">
                  Foto {i + 1}
                </span>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveGalleryItemUp(sectionId, block.id, item.id)}
                  className="text-xs font-bold disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i >= block.items.length - 1}
                  onClick={() =>
                    moveGalleryItemDown(sectionId, block.id, item.id)
                  }
                  className="text-xs font-bold disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    deleteGalleryItem(sectionId, block.id, item.id)
                  }
                  className="text-xs font-bold text-red-600"
                >
                  Quitar
                </button>
              </div>
              <ImageField
                label="Imagen"
                media={{ src: item.src, alt: item.alt }}
                token={token}
                onChange={(m) =>
                  patchGalleryItem(sectionId, block.id, item.id, {
                    src: m.src,
                    alt: m.alt,
                  })
                }
              />
              <EditField
                label={
                  isCarousel
                    ? "Título de esta foto (carrusel)"
                    : "Título / pie"
                }
                value={item.title ?? ""}
                onChange={(title) =>
                  patchGalleryItem(sectionId, block.id, item.id, { title })
                }
              />
              {isCarousel ? (
                <EditField
                  label="Texto de esta foto (carrusel)"
                  value={item.caption ?? ""}
                  onChange={(caption) =>
                    patchGalleryItem(sectionId, block.id, item.id, { caption })
                  }
                  multiline
                />
              ) : (
                <EditField
                  label="Pie de foto"
                  value={item.caption ?? ""}
                  onChange={(caption) =>
                    patchGalleryItem(sectionId, block.id, item.id, { caption })
                  }
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addGalleryItem(sectionId, block.id)}
            className="w-full rounded-lg border border-na-editorial/20 py-2 text-sm font-semibold"
          >
            Agregar foto
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <WidthField
        value={block.width}
        onChange={(width) => patchBlock(sectionId, block.id, { width })}
      />
      <AlignField
        width={block.width}
        value={block.align}
        onChange={(align) => patchBlock(sectionId, block.id, { align })}
      />
      <label className="block text-xs font-semibold text-slate-600">
        Estilo visual
        <select
          value={block.layout ?? "voluntariado"}
          onChange={(e) =>
            patchBlock(sectionId, block.id, {
              layout: e.target.value as typeof block.layout,
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="voluntariado">Voluntariado (área + título + texto)</option>
          <option value="overlay">Pie al hover</option>
          <option value="card">Tarjeta simple</option>
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        Tipo
        <select
          value={block.imageKind}
          onChange={(e) =>
            patchBlock(sectionId, block.id, {
              imageKind: e.target.value as "image" | "video",
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="image">Imagen</option>
          <option value="video">Video</option>
        </select>
      </label>
      {block.imageKind === "image" ? (
        <ImageField
          label="Imagen"
          media={{ src: block.src, alt: block.alt }}
          token={token}
          onChange={(m) =>
            patchBlock(sectionId, block.id, { src: m.src, alt: m.alt })
          }
        />
      ) : (
        <>
          <MediaUploadField
            label="Video"
            href={block.src}
            token={token}
            siteId={siteId}
            onChange={(src) => patchBlock(sectionId, block.id, { src })}
          />
          <p className="text-xs text-slate-500">
            Archivo mp4/webm subido al servidor, o enlace de YouTube/Vimeo (se
            reproduce embebido).
          </p>
          <ImageField
            label="Poster (opcional)"
            media={{ src: block.poster ?? "", alt: block.alt }}
            token={token}
            onChange={(m) =>
              patchBlock(sectionId, block.id, { poster: m.src, alt: m.alt })
            }
          />
        </>
      )}
      <EditField
        label="Área / etiqueta (estilo voluntariado)"
        value={block.area ?? ""}
        onChange={(area) => patchBlock(sectionId, block.id, { area })}
      />
      <EditField
        label="Título"
        value={block.title ?? ""}
        onChange={(title) => patchBlock(sectionId, block.id, { title })}
      />
      <EditField
        label="Texto bajo la foto"
        value={block.body ?? ""}
        onChange={(body) => patchBlock(sectionId, block.id, { body })}
        multiline
      />
      <EditField
        label="Pie de foto (hover / tarjeta)"
        value={block.caption ?? ""}
        onChange={(caption) => patchBlock(sectionId, block.id, { caption })}
      />
      <EditField
        label="Enlace (opcional)"
        value={block.linkHref ?? ""}
        onChange={(linkHref) => patchBlock(sectionId, block.id, { linkHref })}
      />
      <EditField
        label="Texto del enlace"
        value={block.linkLabel ?? ""}
        onChange={(linkLabel) => patchBlock(sectionId, block.id, { linkLabel })}
      />
    </>
  );
}

export function PageMediaCmsPanels({
  selectedId,
  setSelectedId,
  sections,
  patchSection,
  patchBlock,
  addGalleryItem,
  patchGalleryItem,
  deleteGalleryItem,
  moveGalleryItemUp,
  moveGalleryItemDown,
  moveSectionUp,
  moveSectionDown,
  moveBlockUp,
  moveBlockDown,
  deleteSection,
  deleteBlock,
  dirty,
  busy,
  status,
  onSave,
  token,
  siteId,
}: Props) {
  const sectionId = parsePageMediaSectionSelectedId(selectedId);
  const sectionIndex = sectionId
    ? sections.findIndex((s) => s.id === sectionId)
    : -1;
  const section = sectionIndex >= 0 ? sections[sectionIndex] : undefined;
  const blockRef = parsePageMediaBlockSelectedId(selectedId);
  const blockSection = blockRef
    ? sections.find((s) => s.id === blockRef.sectionId)
    : undefined;
  const blocks = blockSection ? getSectionBlocks(blockSection) : [];
  const block = blockRef
    ? blocks.find((b) => b.id === blockRef.blockId)
    : undefined;

  return (
    <>
      {selectedId === PAGE_MEDIA_SECTION_ID ? (
        <EditPanelChrome
          title="Secciones con bloques"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <p className="text-sm text-slate-600">
            Agregue secciones con bloques de texto, fotos, galerías y botones. Use
            «+ Bloque» en la vista previa o arrastre con la asa ⋮⋮.
          </p>
        </EditPanelChrome>
      ) : null}

      {section ? (
        <EditPanelChrome
          title="Sección — encabezado"
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <EditField
              label="Etiqueta superior"
              value={section.eyebrow ?? ""}
              onChange={(v) => patchSection(section.id, { eyebrow: v })}
            />
            <EditField
              label="Título"
              value={section.title ?? ""}
              onChange={(v) => patchSection(section.id, { title: v })}
            />
            <EditField
              label="Introducción"
              value={section.intro ?? ""}
              onChange={(v) => patchSection(section.id, { intro: v })}
              multiline
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={sectionIndex <= 0}
                onClick={() => moveSectionUp(section.id)}
                className="rounded-lg border border-slate-200 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Subir sección
              </button>
              <button
                type="button"
                disabled={sectionIndex < 0 || sectionIndex >= sections.length - 1}
                onClick={() => moveSectionDown(section.id)}
                className="rounded-lg border border-slate-200 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Bajar sección
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Eliminar esta sección y todos sus bloques?")) {
                  deleteSection(section.id);
                  setSelectedId(null);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Eliminar sección
            </button>
          </div>
        </EditPanelChrome>
      ) : null}

      {block && blockRef && blockSection ? (
        <EditPanelChrome
          title={`Bloque — ${blockKindLabel(block.kind)}`}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        >
          <div className="space-y-4">
            <BlockEditPanel
              block={block}
              sectionId={blockRef.sectionId}
              blocks={blocks}
              patchBlock={patchBlock}
              addGalleryItem={addGalleryItem}
              patchGalleryItem={patchGalleryItem}
              deleteGalleryItem={deleteGalleryItem}
              moveGalleryItemUp={moveGalleryItemUp}
              moveGalleryItemDown={moveGalleryItemDown}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
              deleteBlock={deleteBlock}
              token={token}
              siteId={siteId}
            />
            <BlockOrderButtons
              sectionId={blockRef.sectionId}
              blockId={block.id}
              blocks={blocks}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Quitar este bloque?")) {
                  deleteBlock(blockRef.sectionId, block.id);
                  setSelectedId(null);
                }
              }}
              className="w-full rounded-lg border border-red-200 py-2 text-sm font-semibold text-red-700"
            >
              Eliminar bloque
            </button>
          </div>
        </EditPanelChrome>
      ) : null}
    </>
  );
}

export function BrochurePdfField({
  siteId = "editorial",
  accept = CMS_PDF_ACCEPT,
  uploadLabel = "Subir PDF",
  ...props
}: {
  label: string;
  href: string;
  token: string | null;
  siteId?: SiteId;
  onChange: (href: string) => void;
  accept?: string;
  uploadLabel?: string;
}) {
  return (
    <MediaUploadField
      {...props}
      siteId={siteId}
      accept={accept}
      uploadLabel={uploadLabel}
      kind="document"
    />
  );
}
