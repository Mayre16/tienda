"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from "react";

import { PageMediaCmsPanels } from "@/components/cms/PageMediaCmsPanels";

import {

  fetchCmsDraft,

  saveCmsDraft,

} from "@/lib/cms/api-client";

import {

  isCmsEditOrigin,

  postToEditor,

  type CmsEditMessage,

} from "@/lib/cms/edit-bridge";

import { registerCmsEditInit } from "@/lib/cms/edit-session";

import { useCmsEditMode } from "@/hooks/useCmsEditMode";

import {

  arrayMove,

  emptyBlock,

  emptyPageMediaCard,

  emptyPageMediaSection,

  getSectionBlocks,

  mergePageMediaIntoDoc,

  moveArrayItem,

  pageMediaForPage,

} from "@/lib/cms/page-media";

import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";

import type {

  CmsDocument,

  CmsPageMediaBlock,

  CmsPageMediaBlockKind,

  CmsPageMediaCard,

  CmsPageMediaSection,

  CmsPageMediaTarget,
  SiteId,
} from "@/lib/cms/types";



export type PageMediaCmsEditContextValue = {

  ready: boolean;

  pageId: CmsPageMediaTarget;

  sections: CmsPageMediaSection[];

  selectedId: string | null;

  setSelectedId: (id: string | null) => void;

  patchSection: (id: string, patch: Partial<CmsPageMediaSection>) => void;

  patchBlock: (

    sectionId: string,

    blockId: string,

    patch: Partial<CmsPageMediaBlock>,

  ) => void;

  insertBlockAt: (

    sectionId: string,

    index: number,

    kind: CmsPageMediaBlockKind,

  ) => string;

  moveBlockUp: (sectionId: string, blockId: string) => void;

  moveBlockDown: (sectionId: string, blockId: string) => void;

  reorderBlocks: (sectionId: string, activeId: string, overId: string) => void;

  deleteBlock: (sectionId: string, blockId: string) => void;

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

  addSection: () => string;

  moveSectionUp: (id: string) => void;

  moveSectionDown: (id: string) => void;

  insertSectionAt: (index: number) => string;

  deleteSection: (id: string) => void;

  saveDraft: () => Promise<void>;

  dirty: boolean;

  busy: boolean;

  token: string | null;

};



const PageMediaCmsEditContext =

  createContext<PageMediaCmsEditContextValue | null>(null);



export function usePageMediaCmsEdit() {

  return useContext(PageMediaCmsEditContext);

}



export function usePageMediaDisplay(pageId: CmsPageMediaTarget) {

  const edit = usePageMediaCmsEdit();

  const cms = useCmsDocument();

  if (edit?.ready && edit.pageId === pageId) return edit.sections;

  if (isCmsEnabled()) {

    return pageMediaForPage(cms?.sections.pageMediaSections, pageId);

  }

  return [];

}



function updateSectionBlocks(

  section: CmsPageMediaSection,

  updater: (blocks: CmsPageMediaBlock[]) => CmsPageMediaBlock[],

): CmsPageMediaSection {

  return { ...section, blocks: updater(getSectionBlocks(section)) };

}



function PageMediaCmsEditInner({

  pageId,

  children,

  siteId,

}: {

  pageId: CmsPageMediaTarget;

  children: ReactNode;

  siteId: SiteId;

}) {

  const [token, setToken] = useState<string | null>(null);

  const [sections, setSections] = useState<CmsPageMediaSection[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [dirty, setDirty] = useState(false);

  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState("");

  const ready = !!token;



  const markDirty = useCallback(() => {

    setDirty(true);

    postToEditor({ type: "cms-dirty", dirty: true });

  }, []);



  const applyLoadedDoc = useCallback(

    (draft: CmsDocument) => {

      setSections(pageMediaForPage(draft.sections.pageMediaSections, pageId));

    },

    [pageId],

  );



  const saveDraft = useCallback(async () => {

    if (!token) return;

    setBusy(true);

    setStatus("Guardando secciones…");

    try {

      const latest = await fetchCmsDraft(siteId);

      const next = mergePageMediaIntoDoc(latest, pageId, sections);

      await saveCmsDraft(siteId, token, next);

      setDirty(false);

      setStatus("Borrador guardado.");

      postToEditor({ type: "cms-status", text: "Secciones guardadas.", ok: true });

    } catch (e) {

      setStatus(String(e));

      postToEditor({ type: "cms-status", text: String(e), ok: false });

    } finally {

      setBusy(false);

    }

  }, [token, pageId, sections, siteId]);



  const cms = useCmsDocument();



  useEffect(() => {

    const seeded = pageMediaForPage(cms?.sections.pageMediaSections, pageId);

    if (seeded.length > 0) {

      setSections((prev) => (prev.length > 0 ? prev : seeded));

    }

  }, [cms, pageId]);



  useEffect(() => {

    return registerCmsEditInit((initToken) => {

      setToken(initToken);

      fetchCmsDraft(siteId)

        .then((draft) => applyLoadedDoc(draft))

        .catch(() => setStatus("No se pudo cargar secciones."));

    }, siteId);

  }, [applyLoadedDoc, siteId]);



  useEffect(() => {

    function onMessage(ev: MessageEvent<CmsEditMessage>) {

      if (!isCmsEditOrigin(ev.origin)) return;

      const msg = ev.data;

      if (!msg || typeof msg !== "object") return;

      if (msg.type === "cms-save" && dirty) {

        window.setTimeout(() => void saveDraft(), 350);

      }

    }

    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);

  }, [saveDraft, dirty]);



  const patchSection = useCallback(

    (id: string, patch: Partial<CmsPageMediaSection>) => {

      setSections((prev) =>

        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),

      );

      markDirty();

    },

    [markDirty],

  );



  const patchBlock = useCallback(

    (

      sectionId: string,

      blockId: string,

      patch: Partial<CmsPageMediaBlock>,

    ) => {

      setSections((prev) =>

        prev.map((s) =>

          s.id !== sectionId

            ? s

            : updateSectionBlocks(s, (blocks) =>

                blocks.map((b) =>

                  b.id === blockId ? ({ ...b, ...patch } as CmsPageMediaBlock) : b,

                ),

              ),

        ),

      );

      markDirty();

    },

    [markDirty],

  );



  const insertBlockAt = useCallback(

    (sectionId: string, index: number, kind: CmsPageMediaBlockKind) => {

      const item = emptyBlock(kind);

      setSections((prev) =>

        prev.map((s) => {

          if (s.id !== sectionId) return s;

          return updateSectionBlocks(s, (blocks) => {

            const next = [...blocks];

            next.splice(Math.max(0, Math.min(index, next.length)), 0, item);

            return next;

          });

        }),

      );

      markDirty();

      return item.id;

    },

    [markDirty],

  );



  const moveBlock = useCallback(

    (sectionId: string, blockId: string, direction: -1 | 1) => {

      setSections((prev) =>

        prev.map((s) => {

          if (s.id !== sectionId) return s;

          return updateSectionBlocks(s, (blocks) => {

            const index = blocks.findIndex((b) => b.id === blockId);

            if (index < 0) return blocks;

            return moveArrayItem(blocks, index, direction);

          });

        }),

      );

      markDirty();

    },

    [markDirty],

  );



  const moveBlockUp = useCallback(

    (sectionId: string, blockId: string) =>

      moveBlock(sectionId, blockId, -1),

    [moveBlock],

  );



  const moveBlockDown = useCallback(

    (sectionId: string, blockId: string) => moveBlock(sectionId, blockId, 1),

    [moveBlock],

  );



  const reorderBlocks = useCallback(

    (sectionId: string, activeId: string, overId: string) => {

      setSections((prev) =>

        prev.map((s) => {

          if (s.id !== sectionId) return s;

          return updateSectionBlocks(s, (blocks) => {

            const from = blocks.findIndex((b) => b.id === activeId);

            const to = blocks.findIndex((b) => b.id === overId);

            if (from < 0 || to < 0) return blocks;

            return arrayMove(blocks, from, to);

          });

        }),

      );

      markDirty();

    },

    [markDirty],

  );



  const deleteBlock = useCallback(

    (sectionId: string, blockId: string) => {

      setSections((prev) =>

        prev.map((s) =>

          s.id !== sectionId

            ? s

            : updateSectionBlocks(s, (blocks) =>

                blocks.filter((b) => b.id !== blockId),

              ),

        ),

      );

      markDirty();

    },

    [markDirty],

  );



  const mutateGalleryBlock = useCallback(

    (

      sectionId: string,

      blockId: string,

      fn: (block: Extract<CmsPageMediaBlock, { kind: "gallery" }>) => CmsPageMediaBlock,

    ) => {

      setSections((prev) =>

        prev.map((s) => {

          if (s.id !== sectionId) return s;

          return updateSectionBlocks(s, (blocks) =>

            blocks.map((b) => {

              if (b.id !== blockId || b.kind !== "gallery") return b;

              return fn(b);

            }),

          );

        }),

      );

      markDirty();

    },

    [markDirty],

  );



  const addGalleryItem = useCallback(

    (sectionId: string, blockId: string) => {

      const item = emptyPageMediaCard();

      mutateGalleryBlock(sectionId, blockId, (b) => ({

        ...b,

        items: [...b.items, item],

      }));

      return item.id;

    },

    [mutateGalleryBlock],

  );



  const patchGalleryItem = useCallback(

    (

      sectionId: string,

      blockId: string,

      itemId: string,

      patch: Partial<CmsPageMediaCard>,

    ) => {

      mutateGalleryBlock(sectionId, blockId, (b) => ({

        ...b,

        items: b.items.map((c) => (c.id === itemId ? { ...c, ...patch } : c)),

      }));

    },

    [mutateGalleryBlock],

  );



  const deleteGalleryItem = useCallback(

    (sectionId: string, blockId: string, itemId: string) => {

      mutateGalleryBlock(sectionId, blockId, (b) => ({

        ...b,

        items: b.items.filter((c) => c.id !== itemId),

      }));

    },

    [mutateGalleryBlock],

  );



  const moveGalleryItem = useCallback(

    (

      sectionId: string,

      blockId: string,

      itemId: string,

      direction: -1 | 1,

    ) => {

      mutateGalleryBlock(sectionId, blockId, (b) => {

        const index = b.items.findIndex((c) => c.id === itemId);

        if (index < 0) return b;

        return { ...b, items: moveArrayItem(b.items, index, direction) };

      });

    },

    [mutateGalleryBlock],

  );



  const moveGalleryItemUp = useCallback(

    (sectionId: string, blockId: string, itemId: string) =>

      moveGalleryItem(sectionId, blockId, itemId, -1),

    [moveGalleryItem],

  );



  const moveGalleryItemDown = useCallback(

    (sectionId: string, blockId: string, itemId: string) =>

      moveGalleryItem(sectionId, blockId, itemId, 1),

    [moveGalleryItem],

  );



  const addSection = useCallback(() => {

    const item = emptyPageMediaSection(pageId);

    setSections((prev) => [...prev, item]);

    markDirty();

    return item.id;

  }, [markDirty, pageId]);



  const moveSection = useCallback(

    (id: string, direction: -1 | 1) => {

      setSections((prev) => {

        const index = prev.findIndex((s) => s.id === id);

        if (index < 0) return prev;

        return moveArrayItem(prev, index, direction);

      });

      markDirty();

    },

    [markDirty],

  );



  const moveSectionUp = useCallback(

    (id: string) => moveSection(id, -1),

    [moveSection],

  );



  const moveSectionDown = useCallback(

    (id: string) => moveSection(id, 1),

    [moveSection],

  );



  const insertSectionAt = useCallback(

    (index: number) => {

      const item = emptyPageMediaSection(pageId);

      setSections((prev) => {

        const at = Math.max(0, Math.min(index, prev.length));

        const next = [...prev];

        next.splice(at, 0, item);

        return next;

      });

      markDirty();

      return item.id;

    },

    [markDirty, pageId],

  );



  const deleteSection = useCallback(

    (id: string) => {

      setSections((prev) => prev.filter((s) => s.id !== id));

      markDirty();

    },

    [markDirty],

  );



  const value = useMemo(

    (): PageMediaCmsEditContextValue => ({

      ready,

      pageId,

      sections,

      selectedId,

      setSelectedId,

      patchSection,

      patchBlock,

      insertBlockAt,

      moveBlockUp,

      moveBlockDown,

      reorderBlocks,

      deleteBlock,

      addGalleryItem,

      patchGalleryItem,

      deleteGalleryItem,

      moveGalleryItemUp,

      moveGalleryItemDown,

      addSection,

      moveSectionUp,

      moveSectionDown,

      insertSectionAt,

      deleteSection,

      saveDraft,

      dirty,

      busy,

      token,

    }),

    [

      ready,

      pageId,

      sections,

      selectedId,

      patchSection,

      patchBlock,

      insertBlockAt,

      moveBlockUp,

      moveBlockDown,

      reorderBlocks,

      deleteBlock,

      addGalleryItem,

      patchGalleryItem,

      deleteGalleryItem,

      moveGalleryItemUp,

      moveGalleryItemDown,

      addSection,

      moveSectionUp,

      moveSectionDown,

      insertSectionAt,

      deleteSection,

      saveDraft,

      dirty,

      busy,

      token,

    ],

  );



  return (

    <PageMediaCmsEditContext.Provider value={value}>

      {children}

      <PageMediaCmsPanels

        selectedId={selectedId}

        setSelectedId={setSelectedId}

        sections={sections}

        patchSection={patchSection}

        patchBlock={patchBlock}

        addGalleryItem={addGalleryItem}

        patchGalleryItem={patchGalleryItem}

        deleteGalleryItem={deleteGalleryItem}

        moveGalleryItemUp={moveGalleryItemUp}

        moveGalleryItemDown={moveGalleryItemDown}

        moveSectionUp={moveSectionUp}

        moveSectionDown={moveSectionDown}

        moveBlockUp={moveBlockUp}

        moveBlockDown={moveBlockDown}

        deleteSection={deleteSection}

        deleteBlock={deleteBlock}

        dirty={dirty}

        busy={busy}

        status={status}

        onSave={() => void saveDraft()}

        token={token}

        siteId={siteId}

      />

    </PageMediaCmsEditContext.Provider>

  );

}



export function PageMediaCmsProvider({

  pageId,

  children,

  siteId = "editorial",

}: {

  pageId: CmsPageMediaTarget;

  children: ReactNode;

  siteId?: SiteId;

}) {

  const mode = useCmsEditMode();

  if (!mode) return <>{children}</>;

  return (

    <PageMediaCmsEditInner pageId={pageId} siteId={siteId}>

      {children}

    </PageMediaCmsEditInner>

  );

}


