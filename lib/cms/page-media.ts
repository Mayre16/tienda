import type {

  CmsDocument,

  CmsPageMediaBlock,

  CmsPageMediaBlockKind,

  CmsPageMediaCard,

  CmsPageMediaSection,

  CmsPageMediaTarget,

} from "@/lib/cms/types";



export const PAGE_MEDIA_SECTION_ID = "__page-media-section__";



export function moveArrayItem<T>(

  list: readonly T[],

  fromIndex: number,

  direction: -1 | 1,

): T[] {

  const toIndex = fromIndex + direction;

  if (

    fromIndex < 0 ||

    fromIndex >= list.length ||

    toIndex < 0 ||

    toIndex >= list.length

  ) {

    return [...list];

  }

  const next = [...list];

  [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];

  return next;

}



export function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {

  const next = [...list];

  if (from < 0 || from >= next.length || to < 0 || to >= next.length) {

    return next;

  }

  const [item] = next.splice(from, 1);

  next.splice(to, 0, item);

  return next;

}



export function newPageMediaSectionId() {

  return `pms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

}



export function newPageMediaCardId() {

  return `pmc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

}



export function newPageMediaBlockId() {

  return `pmb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

}



export function pageMediaSectionSelectedId(id: string) {

  return `page-media-section:${id}`;

}



export function pageMediaBlockSelectedId(sectionId: string, blockId: string) {

  return `page-media-block:${sectionId}:${blockId}`;

}



export function pageMediaCardSelectedId(sectionId: string, cardId: string) {

  return `page-media-card:${sectionId}:${cardId}`;

}



export function parsePageMediaSectionSelectedId(selectedId: string | null) {

  if (!selectedId?.startsWith("page-media-section:")) return null;

  return selectedId.slice("page-media-section:".length);

}



export function parsePageMediaBlockSelectedId(selectedId: string | null) {

  if (!selectedId?.startsWith("page-media-block:")) return null;

  const rest = selectedId.slice("page-media-block:".length);

  const colon = rest.indexOf(":");

  if (colon < 0) return null;

  return {

    sectionId: rest.slice(0, colon),

    blockId: rest.slice(colon + 1),

  };

}



export function parsePageMediaCardSelectedId(selectedId: string | null) {

  if (!selectedId?.startsWith("page-media-card:")) return null;

  const rest = selectedId.slice("page-media-card:".length);

  const colon = rest.indexOf(":");

  if (colon < 0) return null;

  return {

    sectionId: rest.slice(0, colon),

    cardId: rest.slice(colon + 1),

  };

}



export function emptyPageMediaCard(): CmsPageMediaCard {

  return {

    id: newPageMediaCardId(),

    kind: "image",

    src: "",

    alt: "",

    title: "",

    caption: "",

  };

}



export function emptyTextBlock(): CmsPageMediaBlock {

  return {

    id: newPageMediaBlockId(),

    kind: "text",

    width: "normal",

    heading: "",

    paragraphs: [""],

  };

}



export function emptyMediaBlock(): CmsPageMediaBlock {

  return {

    id: newPageMediaBlockId(),

    kind: "media",

    width: "normal",

    layout: "voluntariado",

    imageKind: "image",

    src: "",

    alt: "",

    area: "",

    title: "",

    body: "",

    caption: "",

  };

}



export function emptyGalleryBlock(): CmsPageMediaBlock {

  return {

    id: newPageMediaBlockId(),

    kind: "gallery",

    width: "full",

    display: "grid",

    columns: 3,

    layout: "overlay",

    items: [],

  };

}



export function emptyButtonBlock(): CmsPageMediaBlock {

  return {

    id: newPageMediaBlockId(),

    kind: "button",

    width: "normal",

    align: "left",

    label: "Ver más",

    linkKind: "internal",

    href: "/",

    variant: "primary",

  };

}



export function emptyBlock(kind: CmsPageMediaBlockKind): CmsPageMediaBlock {

  switch (kind) {

    case "text":

      return emptyTextBlock();

    case "media":

      return emptyMediaBlock();

    case "gallery":

      return emptyGalleryBlock();

    case "button":

      return emptyButtonBlock();

  }

}



export function cardToMediaBlock(card: CmsPageMediaCard): CmsPageMediaBlock {

  return {

    id: newPageMediaBlockId(),

    kind: "media",

    width: "normal",

    layout: card.title || card.caption ? "voluntariado" : "card",

    imageKind: card.kind,

    src: card.src,

    poster: card.poster,

    alt: card.alt,

    title: card.title,

    caption: card.caption,

    body: card.caption,

    linkHref: card.linkHref,

    linkLabel: card.linkLabel,

  };

}



export function migrateCardsToBlocks(cards: CmsPageMediaCard[]): CmsPageMediaBlock[] {

  if (cards.length === 0) return [];

  if (cards.length === 1) {

    return [cardToMediaBlock(cards[0])];

  }

  return [

    {

      id: newPageMediaBlockId(),

      kind: "gallery",

      width: "full",

      columns: 3,

      layout: "card",

      items: cards.map((c) => ({ ...c })),

    },

  ];

}



function normalizeBlock(block: CmsPageMediaBlock, seen: Set<string>): CmsPageMediaBlock {

  let id = block.id;

  if (!id || seen.has(id)) id = newPageMediaBlockId();

  seen.add(id);



  if (block.kind === "gallery") {

    const seenItems = new Set<string>();

    const items = (block.items ?? []).map((item) => {

      let itemId = item.id;

      if (!itemId || seenItems.has(itemId)) itemId = newPageMediaCardId();

      seenItems.add(itemId);

      return { ...item, id: itemId };

    });

    return { ...block, id, items };

  }



  if (block.kind === "text") {

    return {

      ...block,

      id,

      paragraphs: block.paragraphs?.length > 0 ? block.paragraphs : [""],

    };

  }



  return { ...block, id };

}



export function normalizeBlocks(blocks: CmsPageMediaBlock[]): CmsPageMediaBlock[] {

  const seen = new Set<string>();

  return blocks.map((b) => normalizeBlock(b, seen));

}



export function getSectionBlocks(section: CmsPageMediaSection): CmsPageMediaBlock[] {

  if (section.blocks && section.blocks.length > 0) {

    return normalizeBlocks(section.blocks);

  }

  return migrateCardsToBlocks(section.cards ?? []);

}



export function normalizePageMediaPage(

  sections: CmsPageMediaSection[],

  pageId: CmsPageMediaTarget,

): CmsPageMediaSection[] {

  const seenSectionIds = new Set<string>();

  return sections.map((section) => {

    let id = section.id;

    if (!id || seenSectionIds.has(id)) {

      id = newPageMediaSectionId();

    }

    seenSectionIds.add(id);



    const blocks = getSectionBlocks({ ...section, id, pageId });



    return {

      id,

      pageId: section.pageId ?? pageId,

      eyebrow: section.eyebrow,

      title: section.title,

      intro: section.intro,

      blocks,

    };

  });

}



export function pageMediaForPage(

  sections: CmsPageMediaSection[] | undefined,

  pageId: CmsPageMediaTarget,

): CmsPageMediaSection[] {

  const filtered = (sections ?? []).filter(

    (s) => s.pageId === pageId || !s.pageId,

  );

  return normalizePageMediaPage(filtered, pageId);

}



export function mergePageMediaForPage(

  all: CmsPageMediaSection[] | undefined,

  pageId: CmsPageMediaTarget,

  updated: CmsPageMediaSection[],

): CmsPageMediaSection[] {

  const rest = (all ?? []).filter((s) => s.pageId !== pageId);

  const normalized = updated.map((s) => ({

    ...s,

    pageId,

    blocks: getSectionBlocks(s),

    cards: undefined,

  }));

  return [...rest, ...normalized];

}



export function mergePageMediaIntoDoc(

  base: CmsDocument,

  pageId: CmsPageMediaTarget,

  sections: CmsPageMediaSection[],

): CmsDocument {

  return {

    ...base,

    sections: {

      ...base.sections,

      pageMediaSections: mergePageMediaForPage(

        base.sections.pageMediaSections,

        pageId,

        sections,

      ),

    },

  };

}



export function emptyPageMediaSection(

  pageId: CmsPageMediaTarget,

): CmsPageMediaSection {

  return {

    id: newPageMediaSectionId(),

    pageId,

    eyebrow: "Galería",

    title: "Nueva sección",

    intro: "",

    blocks: [],

  };

}



export function blockKindLabel(kind: CmsPageMediaBlockKind): string {

  switch (kind) {

    case "text":

      return "Texto";

    case "media":

      return "Foto o video";

    case "gallery":

      return "Galería";

    case "button":

      return "Botón";

  }

}



export function paragraphsToText(paragraphs: string[]): string {

  return paragraphs.join("\n\n");

}



export function textToParagraphs(text: string): string[] {

  const parts = text

    .split(/\n\s*\n/)

    .map((p) => p.trim())

    .filter(Boolean);

  return parts.length > 0 ? parts : [""];

}



export function resolvePageMediaButtonHref(

  block: Extract<CmsPageMediaBlock, { kind: "button" }>,

  defaultWhatsAppUrl: string,

): string {

  if (block.linkKind === "whatsapp") {

    const phone = (block.whatsappPhone ?? "").replace(/\D/g, "");

    const base = phone

      ? `https://wa.me/${phone}`

      : defaultWhatsAppUrl.replace(/\?.*$/, "");

    const msg = block.whatsappMessage?.trim();

    if (!msg) return base;

    const sep = base.includes("?") ? "&" : "?";

    return `${base}${sep}text=${encodeURIComponent(msg)}`;

  }

  if (block.linkKind === "internal") {

    const href = block.href?.trim() || "/";

    return href.startsWith("/") ? href : `/${href}`;

  }

  return block.href?.trim() || "#";

}


