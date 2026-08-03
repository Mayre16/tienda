"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  EditField,
  EditPanelChrome,
  EditSelectField,
  EditToolbar,
  ImageField,
  SectionCopyFields,
  UrlImageField,
  UrlPdfField,
} from "@/components/cms/CmsEditFields";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import {
  fetchCmsDraft,
  publishCms,
  saveCmsDraft,
  syncEditorialBooksCms,
} from "@/lib/cms/api-client";
import {
  buildEditorialDoc,
  cmsPrintedBookFromStore,
  codeToCmsRegalos,
  loadEditableDoc,
  newHeroImageId,
  newPrintedBookId,
  newRegaloId,
  newRegaloCategoryId,
  type EditorialEditableState,
} from "@/lib/cms/editorial-display";
import { REGALOS } from "@/lib/editorial-extras";
import { extractCmsSlugFromTags, fetchStoreBooks, type StoreBook } from "@/lib/bookstore";
import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { registerCmsEditInit } from "@/lib/cms/edit-session";
import type {
  CmsDocument,
  CmsEditorialDigitalBook,
  CmsEditorialHeroImage,
  CmsEditorialHomeCard,
  CmsEditorialPrintedBook,
  CmsEditorialRegalo,
  CmsEditorialRevista,
} from "@/lib/cms/types";
import { STORE_API_URL } from "@/lib/site-config";
import { useCmsHydrated } from "@/lib/cms/hydration";

type EditorialCmsEditContextValue = {
  ready: boolean;
  token: string | null;
  state: EditorialEditableState;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  patchWelcome: (patch: Partial<EditorialEditableState["welcome"]>) => void;
  patchFooter: (patch: Partial<EditorialEditableState["footer"]>) => void;
  patchHomeCard: (id: string, patch: Partial<CmsEditorialHomeCard>) => void;
  patchHeroImage: (id: string, patch: Partial<CmsEditorialHeroImage>) => void;
  addHeroImage: () => void;
  removeHeroImage: (id: string) => void;
  patchRevista: (title: string, patch: Partial<CmsEditorialRevista>) => void;
  patchRegalo: (id: string, patch: Partial<CmsEditorialRegalo>) => void;
  patchMemorion: (patch: Partial<CmsEditorialRegalo>) => void;
  addRegalo: (category: string, cloneFromId?: string) => void;
  addRegaloCategory: (label?: string) => void;
  removeRegaloCategory: (id: string) => void;
  patchRegaloCategory: (
    id: string,
    patch: Partial<EditorialEditableState["regaloCategories"][number]>,
  ) => void;
  patchDigitalGroup: (
    id: string,
    patch: Partial<EditorialEditableState["digitalBooks"][number]>,
  ) => void;
  patchDigitalBook: (
    groupId: string,
    title: string,
    patch: Partial<CmsEditorialDigitalBook>,
  ) => void;
  addDigitalBook: (groupId: string) => void;
  removeDigitalBook: (groupId: string, title: string) => void;
  patchQuienesLibreria: (
    patch: Partial<NonNullable<EditorialEditableState["quienesSomos"]["libreria"]>>,
  ) => void;
  patchQuienesNa: (
    patch: Partial<NonNullable<EditorialEditableState["quienesSomos"]["nuevaAcropolis"]>>,
  ) => void;
  patchDondeVisit: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["visit"]>>,
  ) => void;
  patchDondePage: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["page"]>>,
  ) => void;
  patchDondeContact: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["contact"]>>,
  ) => void;
  patchDondePhoto: (
    patch: Partial<NonNullable<EditorialEditableState["donde"]["storePhoto"]>>,
  ) => void;
  patchDondeSede: (
    id: string,
    patch: Partial<NonNullable<EditorialEditableState["donde"]["sedes"]>[number]>,
  ) => void;
  patchBookFilters: (
    patch: Partial<EditorialEditableState["bookFilters"]>,
  ) => void;
  addPrintedBook: () => void;
  importPrintedBookFromBiblioteca: (book: StoreBook) => void;
  patchPrintedBook: (
    id: string,
    patch: Partial<CmsEditorialPrintedBook>,
  ) => void;
  removePrintedBook: (id: string) => void;
  patchShopCategories: (
    patch: EditorialEditableState["shopCategories"],
  ) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  syncBooks: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

const EditorialCmsEditContext =
  createContext<EditorialCmsEditContextValue | null>(null);

export function useEditorialCmsEdit() {
  return useContext(EditorialCmsEditContext);
}

function RegaloAddPanel({
  defaultCategory,
  categoryOptions,
  cloneOptions,
  onAdd,
  onCancel,
}: {
  defaultCategory: string;
  categoryOptions: { value: string; label: string }[];
  cloneOptions: { value: string; label: string }[];
  onAdd: (category: string, cloneFromId?: string) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(defaultCategory || categoryOptions[0]?.value || "");
  const [cloneFromId, setCloneFromId] = useState("");

  return (
    <div className="space-y-4">
      <EditSelectField
        label="Categoría del producto"
        value={category}
        onChange={setCategory}
        options={categoryOptions}
        placeholder="Elegir categoría…"
      />
      <EditSelectField
        label="Basar en producto existente (opcional)"
        value={cloneFromId}
        onChange={setCloneFromId}
        options={cloneOptions}
        placeholder="Crear vacío"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!category}
          className="rounded-lg bg-na-editorial px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          onClick={() => onAdd(category, cloneFromId || undefined)}
        >
          Añadir producto
        </button>
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function printedBookListStatus(book: CmsEditorialPrintedBook): {
  text: string;
  className: string;
} {
  const price =
    book.price != null && !Number.isNaN(book.price)
      ? `${book.price} ${book.currency || "DOP"}`
      : "Precio a consultar";
  const stock = book.stock != null && book.stock > 0 ? `${book.stock} en stock` : "Agotado";
  return {
    text: `${price} · ${stock}`,
    className: book.stock != null && book.stock > 0 ? "text-emerald-700" : "text-amber-800",
  };
}

function BibliotecaOnlyBooksImport({
  printedBooks,
  onImport,
}: {
  printedBooks: CmsEditorialPrintedBook[];
  onImport: (book: StoreBook) => void;
}) {
  const [items, setItems] = useState<StoreBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchStoreBooks({ productType: "impreso" })
      .then((books) => {
        if (cancelled) return;
        const linkedIds = new Set(
          printedBooks
            .filter((b) => b.bibliotecaId && b.bibliotecaId > 0)
            .map((b) => b.bibliotecaId as number),
        );
        const linkedSlugs = new Set(printedBooks.map((b) => b.id));
        setItems(
          books.filter((b) => {
            if (b.id <= 0) return false;
            if (linkedIds.has(b.id)) return false;
            const slug = extractCmsSlugFromTags(b.tags);
            if (slug && linkedSlugs.has(slug)) return false;
            return true;
          }),
        );
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo cargar Biblioteca");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [printedBooks]);

  if (loading) {
    return <p className="text-xs text-slate-500">Cargando libros solo en Biblioteca…</p>;
  }
  if (error) {
    return <p className="text-xs text-red-700">{error}</p>;
  }
  if (!items.length) {
    return (
      <p className="text-xs text-slate-500">
        No hay libros impresos en Biblioteca sin vínculo CMS.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3">
      <p className="text-xs font-semibold text-slate-700">
        Solo en Biblioteca ({items.length}) — importar al CMS para rastrear
      </p>
      {items.slice(0, 12).map((book) => (
        <div
          key={book.id}
          className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 text-sm"
        >
          <span className="min-w-0 truncate">
            <span className="text-slate-500">#{book.id}</span> {book.title}
          </span>
          <button
            type="button"
            className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-semibold"
            onClick={() => onImport(book)}
          >
            Vincular
          </button>
        </div>
      ))}
      {items.length > 12 ? (
        <p className="text-xs text-slate-500">…y {items.length - 12} más en Biblioteca</p>
      ) : null}
    </div>
  );
}

function EditorialEditPanel({
  edit,
  selectedId,
  dirty,
  busy,
  status,
  onClose,
  onSave,
}: {
  edit: EditorialCmsEditContextValue;
  selectedId: string;
  dirty: boolean;
  busy: boolean;
  status: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const { state, token } = edit;
  const chrome = (title: string, children: ReactNode) => (
    <EditPanelChrome
      title={title}
      dirty={dirty}
      busy={busy}
      status={status}
      onClose={onClose}
      onSave={onSave}
    >
      {children}
    </EditPanelChrome>
  );

  if (selectedId === "welcome") {
    return chrome(
      "Texto de bienvenida",
      <div className="space-y-4">
        <EditField
          label="Título principal"
          value={state.welcome.title ?? ""}
          onChange={(v) => edit.patchWelcome({ title: v })}
        />
        <EditField
          label="Párrafo introductorio"
          value={state.welcome.lede ?? ""}
          onChange={(v) => edit.patchWelcome({ lede: v })}
          multiline
        />
        <EditField
          label="Etiquetas (separadas por ·)"
          value={state.welcome.tagline ?? ""}
          onChange={(v) => edit.patchWelcome({ tagline: v })}
        />
      </div>,
    );
  }

  if (selectedId === "heroImages") {
    return chrome(
      "Fotos del carrusel",
      <div className="space-y-3">
        {state.heroImages.map((img) => (
          <button
            key={img.id}
            type="button"
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => edit.setSelectedId(`heroImage:${img.id}`)}
          >
            {img.alt || img.src || img.id}
          </button>
        ))}
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
          onClick={() => edit.addHeroImage()}
        >
          + Añadir foto
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("heroImage:")) {
    const id = selectedId.slice("heroImage:".length);
    const img = state.heroImages.find((h) => h.id === id);
    if (!img) return null;
    return chrome(
      "Foto del carrusel",
      <div className="space-y-4">
        <ImageField
          label="Imagen"
          token={token}
          media={{ src: img.src ?? "", alt: img.alt ?? "", objectPosition: img.objectPosition }}
          onChange={(m) =>
            edit.patchHeroImage(id, {
              src: m.src,
              alt: m.alt,
              objectPosition: m.objectPosition,
            })
          }
        />
        <button
          type="button"
          className="text-xs text-red-600"
          onClick={() => {
            if (window.confirm("¿Quitar esta foto?")) {
              edit.removeHeroImage(id);
              edit.setSelectedId("heroImages");
            }
          }}
        >
          Eliminar foto
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("homeCard:")) {
    const id = selectedId.slice("homeCard:".length);
    const card = state.homeCards.find((c) => c.id === id);
    if (!card) return null;
    return chrome(
      "Tarjeta del inicio",
      <div className="space-y-4">
        <EditField label="Título" value={card.title ?? ""} onChange={(v) => edit.patchHomeCard(id, { title: v })} />
        <EditField
          label="Descripción"
          value={card.description ?? ""}
          onChange={(v) => edit.patchHomeCard(id, { description: v })}
          multiline
        />
        <EditField
          label="Ancla de sección (hash)"
          value={card.hash ?? ""}
          onChange={(v) => edit.patchHomeCard(id, { hash: v })}
        />
      </div>,
    );
  }

  if (selectedId === "footer") {
    return chrome(
      "Pie de página",
      <EditField
        label="Línea bajo el logo"
        value={state.footer.tagline ?? ""}
        onChange={(v) => edit.patchFooter({ tagline: v })}
        multiline
      />,
    );
  }

  if (selectedId.startsWith("revista:")) {
    const title = selectedId.slice("revista:".length);
    const item = state.revistas.find((r) => r.title === title);
    if (!item) return null;
    return chrome(
      "Revista",
      <div className="space-y-4">
        <EditField label="Título" value={item.title} onChange={(v) => edit.patchRevista(title, { title: v })} />
        <EditField label="Descripción" value={item.description ?? ""} onChange={(v) => edit.patchRevista(title, { description: v })} multiline />
        <EditField label="Enlace (href)" value={item.href ?? ""} onChange={(v) => edit.patchRevista(title, { href: v })} />
        <EditField label="Etiqueta del botón" value={item.linkLabel ?? ""} onChange={(v) => edit.patchRevista(title, { linkLabel: v })} />
        <UrlImageField label="Portada" url={item.imageUrl ?? ""} alt={item.imageAlt} token={token} onUrlChange={(v) => edit.patchRevista(title, { imageUrl: v })} onAltChange={(v) => edit.patchRevista(title, { imageAlt: v })} />
      </div>,
    );
  }

  if (selectedId === "regalos:categories") {
    return chrome(
      "Categorías de regalos",
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Filtros del catálogo de regalos. Cada categoría agrupa productos ya
          creados; al añadir un producto elija la categoría en el desplegable.
        </p>
        {state.regaloCategories.map((cat) => (
          <div
            key={cat.id}
            className="space-y-2 rounded-lg border border-slate-200 p-3"
          >
            <EditField
              label="Nombre visible"
              value={cat.label ?? ""}
              onChange={(v) => edit.patchRegaloCategory(cat.id, { label: v })}
            />
            <p className="text-xs text-slate-500">Filtro URL: /regalos/{cat.id}</p>
            <EditField
              label="Descripción de la sección"
              value={cat.description ?? ""}
              onChange={(v) =>
                edit.patchRegaloCategory(cat.id, { description: v })
              }
              multiline
            />
            <button
              type="button"
              className="text-sm font-semibold text-red-700"
              onClick={() => {
                if (
                  window.confirm(
                    `¿Quitar la categoría «${cat.label ?? cat.id}»? Los productos quedarán sin categoría visible hasta reasignarlos.`,
                  )
                ) {
                  edit.removeRegaloCategory(cat.id);
                }
              }}
            >
              Eliminar categoría
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
          onClick={() => edit.addRegaloCategory("Nueva categoría")}
        >
          + Añadir categoría
        </button>
      </div>,
    );
  }

  if (selectedId === "regalos:manage") {
    const categoryOptions = state.regaloCategories.map((c) => ({
      value: c.id,
      label: c.label ?? c.id,
    }));
    return chrome(
      "Productos de regalos",
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Elija un producto existente para editarlo o añada uno basado en un
          artículo ya creado.
        </p>
        {state.regaloCategories.map((cat) => {
          const items = state.regalos.filter((r) => r.category === cat.id);
          return (
            <div key={cat.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-bold text-slate-800">
                {cat.label ?? cat.id}
              </p>
              {items.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">Sin productos</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="text-left text-sm text-na-editorial hover:underline"
                        onClick={() => edit.setSelectedId(`regalo:${item.id}`)}
                      >
                        {item.title || item.id}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-na-editorial"
                onClick={() => edit.setSelectedId(`regalos:add:${cat.id}`)}
              >
                + Añadir en esta categoría
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="text-sm font-semibold text-slate-700"
          onClick={() => edit.setSelectedId("regalos:categories")}
        >
          Gestionar categorías →
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("regalos:add:")) {
    const defaultCategory = selectedId.slice("regalos:add:".length);
    const categoryOptions = state.regaloCategories.map((c) => ({
      value: c.id,
      label: c.label ?? c.id,
    }));
    const cloneOptions = state.regalos.map((r) => ({
      value: r.id,
      label: r.title || r.id,
    }));
    return chrome(
      "Añadir producto",
      <RegaloAddPanel
        defaultCategory={defaultCategory}
        categoryOptions={categoryOptions}
        cloneOptions={cloneOptions}
        onAdd={(category, cloneFromId) => {
          edit.addRegalo(category, cloneFromId);
          edit.setSelectedId("regalos:manage");
        }}
        onCancel={() => edit.setSelectedId("regalos:manage")}
      />,
    );
  }

  if (selectedId.startsWith("regalo:")) {
    const id = selectedId.slice("regalo:".length);
    const seedItem =
      id !== "memorion"
        ? codeToCmsRegalos(REGALOS.filter((r) => r.id === id))[0]
        : undefined;
    const item =
      id === "memorion"
        ? state.memorion
        : (state.regalos.find((r) => r.id === id) ?? seedItem);
    if (!item) return null;
    const onPatch = (patch: Partial<CmsEditorialRegalo>) =>
      id === "memorion"
        ? edit.patchMemorion(patch)
        : edit.patchRegalo(id, patch);
    const categoryOptions = state.regaloCategories.map((c) => ({
      value: c.id,
      label: c.label ?? c.id,
    }));
    return chrome(
      id === "memorion" ? "Memorion" : "Regalo",
      <div className="space-y-4">
        {id !== "memorion" ? (
          <EditSelectField
            label="Categoría"
            value={item.category ?? ""}
            onChange={(v) => onPatch({ category: v })}
            options={categoryOptions}
            placeholder="Elegir categoría…"
          />
        ) : null}
        <EditField label="Título" value={item.title ?? ""} onChange={(v) => onPatch({ title: v })} />
        <EditField label="Descripción" value={item.description ?? ""} onChange={(v) => onPatch({ description: v })} multiline />
        <EditField label="Cita" value={item.quote ?? ""} onChange={(v) => onPatch({ quote: v })} multiline />
        <EditField label="Autor de la cita" value={item.author ?? ""} onChange={(v) => onPatch({ author: v })} />
        <UrlImageField label="Foto principal" url={item.imageUrl ?? ""} token={token} onUrlChange={(v) => onPatch({ imageUrl: v })} />
        <UrlImageField label="Foto reverso" url={item.backImageUrl ?? ""} token={token} onUrlChange={(v) => onPatch({ backImageUrl: v })} />
        <EditField label="Precio (número)" value={item.price != null ? String(item.price) : ""} onChange={(v) => onPatch({ price: v ? Number(v) : null })} />
        <EditField label="Nota de precio" value={item.priceNote ?? ""} onChange={(v) => onPatch({ priceNote: v })} />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={item.sample === true}
            onChange={(e) => onPatch({ sample: e.target.checked })}
          />
          Mostrar etiqueta «Ejemplo»
        </label>
        <p className="text-xs text-slate-500">
          Desmarca el check para quitar el badge naranja «Ejemplo» de la
          tarjeta en la tienda.
        </p>
      </div>,
    );
  }

  if (selectedId === "libros:filters") {
    const filters = state.bookFilters;
    return chrome(
      "Filtros del catálogo de libros",
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-800">Temas</p>
          <div className="mt-2 space-y-2">
            {(filters.themes ?? []).map((theme, index) => (
              <div key={`${theme}-${index}`} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <EditField
                    label={`Tema ${index + 1}`}
                    value={theme}
                    onChange={(v) => {
                      const themes = [...(filters.themes ?? [])];
                      themes[index] = v;
                      edit.patchBookFilters({ themes });
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-6 rounded-lg border px-2 text-sm text-red-700"
                  onClick={() =>
                    edit.patchBookFilters({
                      themes: (filters.themes ?? []).filter((_, i) => i !== index),
                    })
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() =>
              edit.patchBookFilters({
                themes: [...(filters.themes ?? []), "Nuevo tema"],
              })
            }
          >
            + Añadir tema
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">Autores</p>
          <div className="mt-2 space-y-2">
            {(filters.authorFilters ?? []).map((author, index) => (
              <div key={`${author.id}-${index}`} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <EditField
                  label="ID interno"
                  value={author.id}
                  onChange={(v) => {
                    const authorFilters = [...(filters.authorFilters ?? [])];
                    authorFilters[index] = { ...authorFilters[index], id: v };
                    edit.patchBookFilters({ authorFilters });
                  }}
                />
                <EditField
                  label="Etiqueta visible"
                  value={author.label ?? ""}
                  onChange={(v) => {
                    const authorFilters = [...(filters.authorFilters ?? [])];
                    authorFilters[index] = { ...authorFilters[index], label: v };
                    edit.patchBookFilters({ authorFilters });
                  }}
                />
                {author.id !== "" ? (
                  <button
                    type="button"
                    className="text-sm text-red-700"
                    onClick={() =>
                      edit.patchBookFilters({
                        authorFilters: (filters.authorFilters ?? []).filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    Quitar autor
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() =>
              edit.patchBookFilters({
                authorFilters: [
                  ...(filters.authorFilters ?? []),
                  { id: `autor-${Date.now().toString(36)}`, label: "Nuevo autor" },
                ],
              })
            }
          >
            + Añadir autor
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">Editoriales</p>
          <div className="mt-2 space-y-2">
            {(filters.publishers ?? []).map((publisher, index) => (
              <div key={`${publisher}-${index}`} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <EditField
                    label={`Editorial ${index + 1}`}
                    value={publisher}
                    onChange={(v) => {
                      const publishers = [...(filters.publishers ?? [])];
                      publishers[index] = v;
                      edit.patchBookFilters({ publishers });
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-6 rounded-lg border px-2 text-sm text-red-700"
                  onClick={() =>
                    edit.patchBookFilters({
                      publishers: (filters.publishers ?? []).filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() =>
              edit.patchBookFilters({
                publishers: [...(filters.publishers ?? []), "Nueva editorial"],
              })
            }
          >
            + Añadir editorial
          </button>
        </div>

        <p className="text-xs text-slate-500">
          El catálogo impreso se edita en «Libros» (precio y stock). Los filtros
          de arriba solo organizan la búsqueda en la tienda.
        </p>
      </div>,
    );
  }

  if (selectedId === "libros:printed") {
    return chrome(
      "Catálogo de libros (tienda)",
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          La tienda es independiente de Biblioteca. Edita aquí título, portada,
          precio y disponibilidad; publica para ver los cambios en el sitio.
        </p>
        {state.printedBooks
          .filter((book) => !book.hidden)
          .map((book) => {
          const status = printedBookListStatus(book);
          return (
          <button
            key={book.id}
            type="button"
            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => edit.setSelectedId(`printedBook:${book.id}`)}
          >
            <span className="font-medium">{book.title || book.id}</span>
            <span className={`mt-0.5 block text-xs ${status.className}`}>
              {status.text}
            </span>
          </button>
          );
        })}
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
          onClick={() => edit.addPrintedBook()}
        >
          + Añadir libro
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("printedBook:")) {
    const id = selectedId.slice("printedBook:".length);
    const book = state.printedBooks.find((b) => b.id === id);
    if (!book) return null;
    return chrome(
      "Libro en la tienda",
      <div className="space-y-4">
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Precio y stock se publican en la tienda. Deja el precio vacío para
          «Consultar precio». Stock 0 = agotado.
        </p>
        <EditField label="Título" value={book.title} onChange={(v) => edit.patchPrintedBook(id, { title: v })} />
        <EditField label="Autor" value={book.author ?? ""} onChange={(v) => edit.patchPrintedBook(id, { author: v })} />
        <EditField label="ISBN" value={book.isbn ?? ""} onChange={(v) => edit.patchPrintedBook(id, { isbn: v })} />
        <UrlImageField label="Portada (URL)" url={book.coverUrl ?? ""} token={token} onUrlChange={(v) => edit.patchPrintedBook(id, { coverUrl: v })} />
        <EditField label="Resumen" value={book.summary ?? ""} onChange={(v) => edit.patchPrintedBook(id, { summary: v })} multiline />
        <EditField label="Tema" value={book.area_tema ?? ""} onChange={(v) => edit.patchPrintedBook(id, { area_tema: v })} />
        <EditField label="Editorial" value={book.publisher ?? ""} onChange={(v) => edit.patchPrintedBook(id, { publisher: v })} />
        <EditField label="Precio" value={book.price != null ? String(book.price) : ""} onChange={(v) => edit.patchPrintedBook(id, { price: v ? Number(v) : null })} />
        <EditField label="Moneda" value={book.currency ?? "DOP"} onChange={(v) => edit.patchPrintedBook(id, { currency: v })} />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={(book.stock ?? 0) > 0}
            onChange={(e) =>
              edit.patchPrintedBook(id, {
                stock: e.target.checked ? Math.max(book.stock ?? 0, 1) : 0,
              })
            }
          />
          Disponible en tienda
        </label>
        <EditField label="Disponibilidad (stock)" value={book.stock != null ? String(book.stock) : "0"} onChange={(v) => edit.patchPrintedBook(id, { stock: Number(v) || 0 })} />
        <EditField label="Nota de precio" value={book.priceNote ?? ""} onChange={(v) => edit.patchPrintedBook(id, { priceNote: v })} />
        <button
          type="button"
          className="text-sm font-semibold text-red-700"
          onClick={() => {
            edit.removePrintedBook(id);
            edit.setSelectedId("libros:printed");
          }}
        >
          Quitar del catálogo
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("libro-api:")) {
    const bookId = selectedId.slice("libro-api:".length);
    return chrome(
      "Libro del catálogo (Biblioteca)",
      <div className="space-y-4 text-sm text-slate-600">
        <p>
          Este título viene del catálogo de Biblioteca/Harmonía (ID {bookId}).
          Para modificar portada, stock, precio o dar de alta libros nuevos en el
          sistema, use el panel de administración.
        </p>
        <a
          href={STORE_API_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-na-editorial px-4 py-2 text-sm font-bold text-white"
        >
          Abrir panel Biblioteca
        </a>
        <button
          type="button"
          className="block text-sm font-semibold text-na-editorial"
          onClick={() => edit.setSelectedId("libros:printed")}
        >
          O añadir un libro manual en la tienda →
        </button>
      </div>,
    );
  }

  if (selectedId.startsWith("digitalGroup:")) {
    const id = selectedId.slice("digitalGroup:".length);
    const group = state.digitalBooks.find((g) => g.id === id);
    if (!group) return null;
    return chrome(
      "Grupo de libros digitales",
      <div className="space-y-4">
        <EditField label="Nombre del grupo" value={group.label ?? ""} onChange={(v) => edit.patchDigitalGroup(id, { label: v })} />
        <EditField label="Descripción" value={group.description ?? ""} onChange={(v) => edit.patchDigitalGroup(id, { description: v })} multiline />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Libros del grupo
          </p>
          {(group.books ?? [])
            .filter((b) => !b.hidden)
            .map((book) => (
              <button
                key={book.title}
                type="button"
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() =>
                  edit.setSelectedId(`digitalBook:${id}:${book.title}`)
                }
              >
                <span className="font-medium">{book.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {book.available === false
                    ? "No disponible"
                    : book.downloadUrl?.startsWith("/uploads/")
                      ? "PDF local"
                      : "Enlace externo / pendiente"}
                </span>
              </button>
            ))}
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold"
            onClick={() => edit.addDigitalBook(id)}
          >
            + Añadir libro digital (PDF)
          </button>
        </div>
      </div>,
    );
  }

  if (selectedId.startsWith("digitalBook:")) {
    const rest = selectedId.slice("digitalBook:".length);
    const sep = rest.indexOf(":");
    const groupId = rest.slice(0, sep);
    const bookTitle = rest.slice(sep + 1);
    const group = state.digitalBooks.find((g) => g.id === groupId);
    const book = group?.books?.find((b) => b.title === bookTitle);
    if (!book) return null;
    return chrome(
      "Libro digital",
      <div className="space-y-4">
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Sube el PDF aquí (queda en el editor) o pega una URL. Desactiva
          disponibilidad si aún no debe descargarse.
        </p>
        <EditField label="Título" value={book.title} onChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { title: v })} />
        <EditField label="Autor" value={book.author ?? ""} onChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { author: v })} />
        <UrlPdfField
          label="PDF de descarga"
          url={book.downloadUrl ?? ""}
          token={token}
          onUrlChange={(v) =>
            edit.patchDigitalBook(groupId, bookTitle, { downloadUrl: v })
          }
        />
        <EditField
          label="Tamaño (opcional)"
          value={book.fileSize ?? ""}
          onChange={(v) =>
            edit.patchDigitalBook(groupId, bookTitle, { fileSize: v })
          }
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={book.available !== false}
            onChange={(e) =>
              edit.patchDigitalBook(groupId, bookTitle, {
                available: e.target.checked,
              })
            }
          />
          Disponible para descarga
        </label>
        <UrlImageField label="Portada" url={book.coverUrl ?? ""} token={token} onUrlChange={(v) => edit.patchDigitalBook(groupId, bookTitle, { coverUrl: v })} />
        <button
          type="button"
          className="text-sm font-semibold text-red-700"
          onClick={() => {
            edit.removeDigitalBook(groupId, bookTitle);
            edit.setSelectedId(`digitalGroup:${groupId}`);
          }}
        >
          Quitar del catálogo digital
        </button>
      </div>,
    );
  }

  if (selectedId === "quienes:libreria") {
    const lib = state.quienesSomos.libreria ?? {};
    return chrome(
      "Editorial Logos — textos",
      <div className="space-y-4">
        <EditField label="Etiqueta" value={lib.eyebrow ?? ""} onChange={(v) => edit.patchQuienesLibreria({ eyebrow: v })} />
        <EditField label="Título" value={lib.title ?? ""} onChange={(v) => edit.patchQuienesLibreria({ title: v })} />
        {(lib.paragraphs ?? []).map((p, i) => (
          <EditField key={i} label={`Párrafo ${i + 1}`} value={p} onChange={(v) => {
            const paragraphs = [...(lib.paragraphs ?? [])];
            paragraphs[i] = v;
            edit.patchQuienesLibreria({ paragraphs });
          }} multiline />
        ))}
      </div>,
    );
  }

  if (selectedId === "quienes:na") {
    const na = state.quienesSomos.nuevaAcropolis ?? {};
    return chrome(
      "Qué es Nueva Acrópolis",
      <div className="space-y-4">
        <EditField label="Título" value={na.title ?? ""} onChange={(v) => edit.patchQuienesNa({ title: v })} />
        <ImageField label="Imagen" token={token} media={{ src: na.heroImage?.src ?? "", alt: na.heroImage?.alt ?? "" }} onChange={(m) => edit.patchQuienesNa({ heroImage: { src: m.src, alt: m.alt } })} />
        <EditField label="Etiqueta del botón" value={na.ctaLabel ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaLabel: v })} />
        <EditField label="URL del botón" value={na.ctaHref ?? ""} onChange={(v) => edit.patchQuienesNa({ ctaHref: v })} />
      </div>,
    );
  }

  if (selectedId === "donde:visit") {
    return chrome("Visítanos", <SectionCopyFields value={state.donde.visit ?? {}} onChange={(p) => edit.patchDondeVisit(p)} />);
  }

  if (selectedId === "donde:page") {
    return chrome("Página — encabezado", <SectionCopyFields value={state.donde.page ?? {}} onChange={(p) => edit.patchDondePage(p)} />);
  }

  if (selectedId === "donde:contact") {
    const contact = state.donde.contact ?? {};
    return chrome(
      "Contacto de las sedes",
      <div className="space-y-4">
        <EditField
          label="Teléfono"
          value={contact.phone ?? ""}
          onChange={(v) => edit.patchDondeContact({ phone: v })}
        />
        <EditField
          label="Correo"
          value={contact.email ?? ""}
          onChange={(v) => edit.patchDondeContact({ email: v })}
        />
        <EditField
          label="Número de WhatsApp (solo dígitos, con código de país)"
          value={contact.whatsappNumber ?? ""}
          onChange={(v) => edit.patchDondeContact({ whatsappNumber: v })}
        />
        <EditField
          label="Texto del botón WhatsApp"
          value={contact.whatsappCtaLabel ?? ""}
          onChange={(v) => edit.patchDondeContact({ whatsappCtaLabel: v })}
        />
        <EditField
          label="Mensaje de WhatsApp (use {sede} para el nombre de la sede)"
          value={contact.whatsappMessage ?? ""}
          onChange={(v) => edit.patchDondeContact({ whatsappMessage: v })}
          multiline
        />
      </div>,
    );
  }

  if (selectedId === "donde:photo") {
    const photo = state.donde.storePhoto ?? {};
    return chrome(
      "Foto de la librería",
      <div className="space-y-4">
        <UrlImageField label="Imagen principal" url={photo.src ?? ""} alt={photo.alt} token={token} onUrlChange={(v) => edit.patchDondePhoto({ src: v })} onAltChange={(v) => edit.patchDondePhoto({ alt: v })} />
      </div>,
    );
  }

  if (selectedId.startsWith("donde:sede:")) {
    const id = selectedId.slice("donde:sede:".length);
    const sede = state.donde.sedes?.find((s) => s.id === id);
    if (!sede) return null;
    return chrome(
      "Sede",
      <div className="space-y-4">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Dirección, zona y Maps se toman del sitio principal (
          <strong>Acrópolis → Dónde estamos</strong>). Aquí solo editas espacio,
          horario y nota de la librería.
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{sede.name}</span>
          {sede.zone ? ` · ${sede.zone}` : ""}
          {sede.city ? ` · ${sede.city}` : ""}
        </p>
        <p className="whitespace-pre-wrap text-sm text-slate-600">
          {sede.address || "—"}
        </p>
        {sede.reference ? (
          <p className="text-xs text-slate-500">{sede.reference}</p>
        ) : null}
        {sede.mapsQuery?.trim() ? (
          <a
            href={
              /^https?:\/\//i.test(sede.mapsQuery.trim())
                ? sede.mapsQuery.trim()
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede.mapsQuery.trim())}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold text-na-editorial hover:underline"
          >
            Ver en Google Maps ↗
          </a>
        ) : null}
        <EditField label="Espacio / sala" value={sede.sala ?? ""} onChange={(v) => edit.patchDondeSede(id, { sala: v })} />
        <EditField label="Horario" value={sede.hours ?? ""} onChange={(v) => edit.patchDondeSede(id, { hours: v })} />
        <EditField label="Nota" value={sede.note ?? ""} onChange={(v) => edit.patchDondeSede(id, { note: v })} multiline />
      </div>,
    );
  }

  return null;
}

function EditorialCmsEditInner({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [baseDoc, setBaseDoc] = useState<CmsDocument | null>(null);
  const [state, setState] = useState<EditorialEditableState | null>(null);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const hydrated = useCmsHydrated();
  const ready = hydrated && !!token && !!state;

  const markDirty = useCallback(() => {
    setDirty(true);
    postToEditor({ type: "cms-dirty", dirty: true });
  }, []);

  const updateState = useCallback(
    (fn: (s: EditorialEditableState) => EditorialEditableState) => {
      setState((prev) => (prev ? fn(prev) : prev));
      markDirty();
    },
    [markDirty],
  );

  /** Al editar un regalo solo-seed (Jornadas…), lo mete en el borrador. */
  const setSelectedId = useCallback((id: string | null) => {
    if (id?.startsWith("regalo:")) {
      const rid = id.slice("regalo:".length);
      if (rid && rid !== "memorion") {
        setState((prev) => {
          if (!prev || prev.regalos.some((r) => r.id === rid)) return prev;
          const seed = REGALOS.find((r) => r.id === rid);
          if (!seed) return prev;
          return {
            ...prev,
            regalos: [...prev.regalos, ...codeToCmsRegalos([seed])],
          };
        });
      }
    }
    setSelectedIdState(id);
  }, []);

  const applyLoaded = useCallback((draft: CmsDocument) => {
    setBaseDoc(draft);
    setState(loadEditableDoc(draft));
    setDirty(false);
    postToEditor({ type: "cms-dirty", dirty: false });
  }, []);

  const saveDraft = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    setBusy(true);
    setStatus("Guardando borrador…");
    try {
      const latest = await fetchCmsDraft("editorial");
      const next = buildEditorialDoc(latest, state);
      await saveCmsDraft("editorial", token, next);
      setBaseDoc(next);
      setDirty(false);
      setStatus("Borrador guardado.");
      postToEditor({ type: "cms-status", text: "Borrador guardado.", ok: true });
      postToEditor({ type: "cms-dirty", dirty: false });
    } catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, baseDoc, state]);

  const publish = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    if (!window.confirm("¿Publicar estos cambios en la tienda?")) return;
    setBusy(true);
    setStatus("Publicando…");
    try {
      const latest = await fetchCmsDraft("editorial");
      const next = buildEditorialDoc(latest, state);
      await saveCmsDraft("editorial", token, next);
      const sync = await publishCms("editorial", token);
      const refreshed = await fetchCmsDraft("editorial");
      applyLoaded(refreshed);
      setDirty(false);
      const syncMsg = sync?.message ? ` ${sync.message}` : "";
      setStatus(`Publicado.${syncMsg}`);
      postToEditor({
        type: "cms-status",
        text: `Publicado.${syncMsg}`,
        ok: sync?.ok !== false,
      });
    } catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, baseDoc, state, applyLoaded]);

  const syncBooks = useCallback(async () => {
    if (!token || !baseDoc || !state) return;
    setBusy(true);
    setStatus("Sincronizando catálogo…");
    try {
      await saveCmsDraft("editorial", token, buildEditorialDoc(baseDoc, state));
      const sync = await syncEditorialBooksCms(token);
      const refreshed = await fetchCmsDraft("editorial");
      applyLoaded(refreshed);
      setStatus(sync.message ?? "Sincronización completada.");
      postToEditor({
        type: "cms-status",
        text: sync.message ?? "Sincronización completada.",
        ok: sync.ok,
      });
    } catch (e) {
      setStatus(String(e));
      postToEditor({ type: "cms-status", text: String(e), ok: false });
    } finally {
      setBusy(false);
    }
  }, [token, baseDoc, state, applyLoaded]);

  useEffect(() => {
    return registerCmsEditInit((initToken) => {
      setToken(initToken);
      fetchCmsDraft("editorial")
        .then((draft) => {
          applyLoaded(draft);
          postToEditor({ type: "cms-ready" });
        })
        .catch(() => setStatus("No se pudo cargar el borrador."));
    }, "editorial");
  }, [applyLoaded]);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-save") void saveDraft();
      if (msg.type === "cms-publish") void publish();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [saveDraft, publish]);

  const value: EditorialCmsEditContextValue | null = state
    ? {
        ready,
        token,
        state,
        selectedId,
        setSelectedId,
        patchWelcome: (patch) =>
          updateState((s) => ({ ...s, welcome: { ...s.welcome, ...patch } })),
        patchFooter: (patch) =>
          updateState((s) => ({ ...s, footer: { ...s.footer, ...patch } })),
        patchHomeCard: (id, patch) =>
          updateState((s) => ({
            ...s,
            homeCards: s.homeCards.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        patchHeroImage: (id, patch) =>
          updateState((s) => ({
            ...s,
            heroImages: s.heroImages.map((h) =>
              h.id === id ? { ...h, ...patch } : h,
            ),
          })),
        addHeroImage: () => {
          const img: CmsEditorialHeroImage = {
            id: newHeroImageId(),
            src: "",
            alt: "Nueva foto",
          };
          updateState((s) => ({ ...s, heroImages: [...s.heroImages, img] }));
          setSelectedId(`heroImage:${img.id}`);
        },
        removeHeroImage: (id) =>
          updateState((s) => ({
            ...s,
            heroImages: s.heroImages.filter((h) => h.id !== id),
          })),
        patchRevista: (title, patch) =>
          updateState((s) => ({
            ...s,
            revistas: s.revistas.map((r) =>
              r.title === title ? { ...r, ...patch } : r,
            ),
          })),
        patchRegalo: (id, patch) =>
          updateState((s) => {
            const idx = s.regalos.findIndex((r) => r.id === id);
            if (idx >= 0) {
              return {
                ...s,
                regalos: s.regalos.map((r) =>
                  r.id === id ? { ...r, ...patch } : r,
                ),
              };
            }
            // Producto visible por seed pero aún no en el borrador CMS.
            return {
              ...s,
              regalos: [
                ...s.regalos,
                {
                  id,
                  title: "Producto",
                  description: "",
                  imageUrl: "",
                  ...patch,
                },
              ],
            };
          }),
        patchMemorion: (patch) =>
          updateState((s) => ({
            ...s,
            memorion: { ...s.memorion, ...patch },
          })),
        addRegalo: (category, cloneFromId) => {
          let newItemId = "";
          updateState((s) => {
            const source = cloneFromId
              ? s.regalos.find((r) => r.id === cloneFromId)
              : undefined;
            const item: CmsEditorialRegalo = source
              ? {
                  ...source,
                  id: newRegaloId(),
                  category,
                  title: `${source.title ?? "Producto"} (copia)`,
                }
              : {
                  id: newRegaloId(),
                  category,
                  title: "Nuevo regalo",
                  description: "",
                  imageUrl: "",
                };
            newItemId = item.id;
            return { ...s, regalos: [...s.regalos, item] };
          });
          if (newItemId) setSelectedId(`regalo:${newItemId}`);
        },
        addRegaloCategory: (label) => {
          const id = newRegaloCategoryId(label ?? "nueva-categoria");
          updateState((s) => ({
            ...s,
            regaloCategories: [
              ...s.regaloCategories,
              {
                id,
                label: label ?? "Nueva categoría",
                description: "",
              },
            ],
          }));
          setSelectedId("regalos:categories");
        },
        removeRegaloCategory: (id) => {
          updateState((s) => {
            const fallback =
              s.regaloCategories.find((c) => c.id !== id)?.id ?? "papeleria";
            return {
              ...s,
              regaloCategories: s.regaloCategories.filter((c) => c.id !== id),
              regalos: s.regalos.map((r) =>
                r.category === id ? { ...r, category: fallback } : r,
              ),
            };
          });
        },
        patchRegaloCategory: (id, patch) =>
          updateState((s) => ({
            ...s,
            regaloCategories: s.regaloCategories.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          })),
        patchDigitalGroup: (id, patch) =>
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id === id ? { ...g, ...patch } : g,
            ),
          })),
        patchDigitalBook: (groupId, bookTitle, patch) =>
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id !== groupId
                ? g
                : {
                    ...g,
                    books: (g.books ?? []).map((b) => {
                      if (b.title !== bookTitle) return b;
                      const next = { ...b, ...patch };
                      // Si cambió el título, mantener selección coherente vía id de estado.
                      return next;
                    }),
                  },
            ),
          })),
        addDigitalBook: (groupId) => {
          const book: CmsEditorialDigitalBook = {
            title: "Nuevo libro digital",
            author: "",
            downloadUrl: "",
            available: false,
          };
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id !== groupId
                ? g
                : { ...g, books: [...(g.books ?? []), book] },
            ),
          }));
          setSelectedId(`digitalBook:${groupId}:${book.title}`);
        },
        removeDigitalBook: (groupId, title) =>
          updateState((s) => ({
            ...s,
            digitalBooks: s.digitalBooks.map((g) =>
              g.id !== groupId
                ? g
                : {
                    ...g,
                    books: (g.books ?? []).map((b) =>
                      b.title === title ? { ...b, hidden: true } : b,
                    ),
                  },
            ),
          })),
        patchQuienesLibreria: (patch) =>
          updateState((s) => ({
            ...s,
            quienesSomos: {
              ...s.quienesSomos,
              libreria: { ...s.quienesSomos.libreria, ...patch },
            },
          })),
        patchQuienesNa: (patch) =>
          updateState((s) => ({
            ...s,
            quienesSomos: {
              ...s.quienesSomos,
              nuevaAcropolis: {
                ...s.quienesSomos.nuevaAcropolis,
                ...patch,
                heroImage: patch.heroImage
                  ? { ...s.quienesSomos.nuevaAcropolis?.heroImage, ...patch.heroImage }
                  : s.quienesSomos.nuevaAcropolis?.heroImage,
              },
            },
          })),
        patchDondeVisit: (patch) =>
          updateState((s) => ({
            ...s,
            donde: { ...s.donde, visit: { ...s.donde.visit, ...patch } },
          })),
        patchDondePage: (patch) =>
          updateState((s) => ({
            ...s,
            donde: { ...s.donde, page: { ...s.donde.page, ...patch } },
          })),
        patchDondeContact: (patch) =>
          updateState((s) => ({
            ...s,
            donde: { ...s.donde, contact: { ...s.donde.contact, ...patch } },
          })),
        patchDondePhoto: (patch) =>
          updateState((s) => ({
            ...s,
            donde: {
              ...s.donde,
              storePhoto: { ...s.donde.storePhoto, ...patch },
            },
          })),
        patchDondeSede: (id, patch) =>
          updateState((s) => ({
            ...s,
            donde: {
              ...s.donde,
              sedes: (s.donde.sedes ?? []).map((sed) =>
                sed.id === id ? { ...sed, ...patch } : sed,
              ),
            },
          })),
        patchBookFilters: (patch) =>
          updateState((s) => ({
            ...s,
            bookFilters: { ...s.bookFilters, ...patch },
          })),
        addPrintedBook: () => {
          const book: CmsEditorialPrintedBook = {
            id: newPrintedBookId(),
            title: "Nuevo libro",
            currency: "DOP",
            stock: 1,
            price: null,
            publisher: "Editorial Nueva Acrópolis",
          };
          updateState((s) => ({
            ...s,
            printedBooks: [...s.printedBooks, book],
          }));
          setSelectedId(`printedBook:${book.id}`);
        },
        importPrintedBookFromBiblioteca: (book) => {
          const entry = cmsPrintedBookFromStore(book);
          updateState((s) => {
            if (
              s.printedBooks.some(
                (b) =>
                  b.bibliotecaId === book.id ||
                  b.id === entry.id,
              )
            ) {
              return s;
            }
            return {
              ...s,
              printedBooks: [...s.printedBooks, entry],
            };
          });
          setSelectedId(`printedBook:${entry.id}`);
        },
        patchPrintedBook: (id, patch) =>
          updateState((s) => ({
            ...s,
            printedBooks: s.printedBooks.map((b) => {
              if (b.id !== id) return b;
              const next = { ...b, ...patch };
              if (
                b.bibliotecaId &&
                b.bibliotecaId > 0 &&
                b.syncStatus === "synced"
              ) {
                next.syncStatus = "pending";
              }
              return next;
            }),
          })),
        removePrintedBook: (id) =>
          updateState((s) => {
            const exists = s.printedBooks.some((b) => b.id === id);
            if (!exists) {
              return {
                ...s,
                printedBooks: [
                  ...s.printedBooks,
                  { id, title: id, hidden: true, currency: "DOP", stock: 0 },
                ],
              };
            }
            return {
              ...s,
              printedBooks: s.printedBooks.map((b) =>
                b.id === id ? { ...b, hidden: true } : b,
              ),
            };
          }),
        patchShopCategories: (categories) =>
          updateState((s) => ({ ...s, shopCategories: categories })),
        saveDraft,
        publish,
        syncBooks,
        dirty,
        busy,
      }
    : null;

  return (
    <EditorialCmsEditContext.Provider value={value}>
      {ready ? (
        <EditToolbar
          label="Librería Editorial Logos"
          dirty={dirty}
          busy={busy}
          status={status}
          onSave={() => void saveDraft()}
          onPublish={() => void publish()}
        />
      ) : null}
      {children}
      {value && selectedId ? (
        <EditorialEditPanel
          edit={value}
          selectedId={selectedId}
          dirty={dirty}
          busy={busy}
          status={status}
          onClose={() => setSelectedId(null)}
          onSave={() => void saveDraft()}
        />
      ) : null}
    </EditorialCmsEditContext.Provider>
  );
}

export function EditorialCmsEditProvider({ children }: { children: ReactNode }) {
  const editMode = useCmsEditMode();
  if (editMode !== "1") return <>{children}</>;
  return <EditorialCmsEditInner>{children}</EditorialCmsEditInner>;
}

export { editorialStateAsDoc } from "@/lib/cms/editorial-display";
