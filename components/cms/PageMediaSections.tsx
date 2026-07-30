"use client";

import { Fragment } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { CmsSectionEditBar } from "@/components/cms/CmsEditFields";
import {
  usePageMediaCmsEdit,
  usePageMediaDisplay,
} from "@/components/cms/PageMediaCmsContext";
import {
  PageMediaSortableBlocks,
} from "@/components/cms/PageMediaSortableBlocks";
import { getSectionBlocks, pageMediaSectionSelectedId } from "@/lib/cms/page-media";
import type { CmsPageMediaTarget } from "@/lib/cms/types";

export function PageMediaSections({ pageId }: { pageId: CmsPageMediaTarget }) {
  const edit = usePageMediaCmsEdit();
  const published = usePageMediaDisplay(pageId);
  const sections =
    edit && edit.pageId === pageId ? edit.sections : published;
  const editing = !!(edit && edit.pageId === pageId);

  if (sections.length === 0 && !editing) return null;

  return (
    <>
      {sections.map((section, index) => {
        const blocks = getSectionBlocks(section);
        return (
          <Fragment key={section.id}>
            {editing ? (
              <div className="border-t border-dashed border-amber-200/80 bg-amber-50/30 py-2">
                <div className="mx-auto flex max-w-6xl justify-center px-4">
                  <button
                    type="button"
                    onClick={() => {
                      const id = edit?.insertSectionAt(index);
                      if (id) {
                        edit?.setSelectedId(pageMediaSectionSelectedId(id));
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-white px-3 py-1 text-[11px] font-bold uppercase text-amber-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Insertar sección aquí
                  </button>
                </div>
              </div>
            ) : null}
            <section className="relative border-t border-na-heket/10 bg-na-surface py-14 sm:py-16">
              {editing ? (
                <div className="absolute right-4 top-4 z-10 flex flex-wrap justify-end gap-2 sm:right-6">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => edit?.moveSectionUp(section.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase text-slate-700 disabled:opacity-40"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={index === sections.length - 1}
                    onClick={() => edit?.moveSectionDown(section.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase text-slate-700 disabled:opacity-40"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Bajar
                  </button>
                  <CmsSectionEditBar
                    label="Editar sección"
                    onClick={() =>
                      edit?.setSelectedId(pageMediaSectionSelectedId(section.id))
                    }
                  />
                </div>
              ) : null}
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {section.eyebrow ? (
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                    {section.eyebrow}
                  </p>
                ) : null}
                {section.title ? (
                  <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
                    {section.title}
                  </h2>
                ) : null}
                {section.intro ? (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
                    {section.intro}
                  </p>
                ) : null}
                <div className={section.title || section.intro ? "mt-8" : ""}>
                  <PageMediaSortableBlocks
                    sectionId={section.id}
                    blocks={blocks}
                    editing={editing}
                    edit={edit && edit.pageId === pageId ? edit : null}
                  />
                </div>
              </div>
            </section>
          </Fragment>
        );
      })}

      {editing ? (
        <div className="border-t border-dashed border-amber-300 bg-amber-50/50 py-6">
          <div className="mx-auto flex max-w-6xl justify-center px-4">
            <button
              type="button"
              onClick={() => {
                const id = edit?.addSection();
                if (id) {
                  edit?.setSelectedId(pageMediaSectionSelectedId(id));
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-bold text-amber-950 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Agregar sección con bloques
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
