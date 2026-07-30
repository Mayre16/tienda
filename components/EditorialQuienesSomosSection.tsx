"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { EditorialNaSectionLogo } from "@/components/EditorialNaSectionLogo";
import { useEditorialQuienesSomos } from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";

type QuienesTabId = "editorial" | "nueva-acropolis";

const TABS: { id: QuienesTabId; label: string }[] = [
  { id: "editorial", label: "Editorial Logos" },
  { id: "nueva-acropolis", label: "Nueva Acrópolis" },
];

function renderParagraph(text: string) {
  if (!text.includes("Escuela de Filosofía")) {
    return text;
  }
  const [before, ...rest] = text.split("Escuela de Filosofía");
  const after = rest.join("Escuela de Filosofía");
  return (
    <>
      {before}
      <strong className="text-na-ink">Escuela de Filosofía</strong>
      {after}
    </>
  );
}

function EditorialPanel({
  onShowNa,
  content,
  onEdit,
}: {
  onShowNa: () => void;
  content: ReturnType<typeof useEditorialQuienesSomos>["libreria"];
  onEdit?: () => void;
}) {
  return (
    <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
      {onEdit ? (
        <EditorialEditPencil label="Editar Editorial Logos" onClick={onEdit} />
      ) : null}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-editorial">
          {content.eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-2xl font-black text-na-ink sm:text-3xl">
          {content.title}
        </h2>
        {content.paragraphs.map((p) => (
          <p
            key={p.slice(0, 40)}
            className="mt-4 text-sm leading-relaxed text-na-muted sm:text-base"
          >
            {p}
          </p>
        ))}

        <div className="mt-8 rounded-2xl border border-na-editorial/15 bg-na-editorial/[0.05] p-5 sm:p-6">
          <p className="text-sm font-semibold text-na-ink">{content.naIntro}</p>
          <button
            type="button"
            onClick={onShowNa}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-na-editorial px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-na-editorial/25 transition hover:bg-na-editorialDark"
          >
            {content.naButton}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {content.highlights.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-na-heket/10 bg-white p-5 shadow-na-soft"
          >
            <p className="font-bold text-na-editorialDark">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-na-muted">
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NuevaAcropolisPanel({
  content,
  onEdit,
}: {
  content: ReturnType<typeof useEditorialQuienesSomos>["nuevaAcropolis"];
  onEdit?: () => void;
}) {
  return (
    <div className="relative grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
      {onEdit ? (
        <EditorialEditPencil label="Editar Nueva Acrópolis" onClick={onEdit} />
      ) : null}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] border border-na-heket/15 bg-na-heket/5 shadow-na-soft">
        <Image
          src={content.heroImage.src}
          alt={content.heroImage.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      <div className="overflow-visible">
        <div className="w-fit max-w-full overflow-visible py-1 pt-2 sm:pt-2.5">
          <EditorialNaSectionLogo align="left" size="content" />
        </div>
        <h2 className="mt-4 text-balance text-2xl font-black text-na-ink sm:text-3xl">
          {content.title}
        </h2>
        {content.paragraphs.map((p) => (
          <p
            key={p.slice(0, 40)}
            className="mt-4 text-sm leading-relaxed text-na-muted sm:text-base"
          >
            {renderParagraph(p)}
          </p>
        ))}
        <p className="mt-8 text-sm font-semibold text-na-ink sm:text-base">
          {content.ctaIntro}
        </p>
        <a
          href={content.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-heketDark"
        >
          {content.ctaLabel}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function EditorialQuienesSomosSection() {
  const [tab, setTab] = useState<QuienesTabId>("editorial");
  const { libreria, nuevaAcropolis } = useEditorialQuienesSomos();
  const edit = useEditorialCmsEdit();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <section aria-labelledby="editorial-quienes-title">
      <h1 id="editorial-quienes-title" className="sr-only">
        Quiénes somos — Editorial Logos
      </h1>

      <div
        className="inline-flex flex-wrap gap-2 rounded-2xl border border-na-heket/10 bg-white p-1.5 shadow-na-soft"
        role="tablist"
        aria-label="Secciones de Quiénes somos"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`editorial-quienes-panel-${item.id}`}
              id={`editorial-quienes-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-na-editorial text-white shadow-md shadow-na-editorial/20"
                  : "text-na-muted hover:bg-na-editorial/5 hover:text-na-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`editorial-quienes-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`editorial-quienes-tab-${tab}`}
        className="mt-8"
      >
        {tab === "editorial" ? (
          <EditorialPanel
            content={libreria}
            onShowNa={() => setTab("nueva-acropolis")}
            onEdit={
              edit?.ready ? () => edit.setSelectedId("quienes:libreria") : undefined
            }
          />
        ) : (
          <NuevaAcropolisPanel
            content={nuevaAcropolis}
            onEdit={
              edit?.ready ? () => edit.setSelectedId("quienes:na") : undefined
            }
          />
        )}
      </div>
    </section>
  );
}
