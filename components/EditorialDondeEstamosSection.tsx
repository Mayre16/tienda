"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  type EditorialDondeContact,
  type EditorialSede,
  type EditorialSedeId,
  editorialMapsEmbedUrl,
  editorialMapsUrl,
  editorialSedeWhatsAppUrl,
  editorialTelHref,
} from "@/lib/editorial-locations";
import { useEditorialDonde } from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";

function LazyMapEmbed({ sede }: { sede: EditorialSede }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sede.id]);

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-2xl border border-na-heket/10 bg-na-heket/[0.04] shadow-na-soft"
    >
      {ready ? (
        <iframe
          title={`Mapa — ${sede.name}`}
          src={editorialMapsEmbedUrl(sede.mapsQuery)}
          className="aspect-[4/3] min-h-[280px] w-full border-0 lg:min-h-[360px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div
          className="flex aspect-[4/3] min-h-[280px] w-full items-center justify-center bg-na-heket/[0.06] lg:min-h-[360px]"
          aria-hidden
        />
      )}
    </div>
  );
}

function SedePanel({
  sede,
  contact,
  onEdit,
  onEditContact,
}: {
  sede: EditorialSede;
  contact: EditorialDondeContact;
  onEdit?: () => void;
  onEditContact?: () => void;
}) {
  return (
    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8">
      {onEdit ? (
        <EditorialEditPencil label={`Editar ${sede.name}`} onClick={onEdit} />
      ) : null}
      <div className="rounded-2xl border border-na-heket/10 bg-white p-5 shadow-na-soft sm:p-6">
        <span className="inline-flex rounded-full bg-na-editorial/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-na-editorialDark">
          Sede
        </span>
        <h3 className="mt-3 text-xl font-black text-na-ink">{sede.name}</h3>
        <p className="mt-1 text-sm font-semibold text-na-muted">
          {sede.zone} · {sede.city}
        </p>
        {sede.sala ? (
          <p className="mt-3 text-sm font-semibold text-na-editorialDark">
            {sede.sala}
          </p>
        ) : null}

        <ul className="relative mt-5 space-y-3 text-sm text-na-muted">
          {onEditContact ? (
            <EditorialEditPencil
              label="Editar teléfono, correo y WhatsApp"
              onClick={onEditContact}
              className="right-0 top-0"
            />
          ) : null}
          <li className="flex gap-3">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-na-heket"
              aria-hidden
            />
            <span>
              <span className="font-semibold text-na-ink">{sede.address}</span>
              {sede.reference ? (
                <span className="mt-0.5 block">{sede.reference}</span>
              ) : null}
            </span>
          </li>
          <li className="flex gap-3">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-na-heket"
              aria-hidden
            />
            <span>{sede.hours}</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-na-heket" aria-hidden />
            <a
              href={editorialTelHref(contact.phone)}
              className="font-semibold text-na-ink hover:text-na-heket"
            >
              {contact.phone}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-na-heket" aria-hidden />
            <a
              href={`mailto:${contact.email}`}
              className="font-semibold text-na-ink hover:text-na-heket"
            >
              {contact.email}
            </a>
          </li>
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-na-muted">{sede.note}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={editorialMapsUrl(sede.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-na-heket/20 px-4 py-2 text-xs font-bold text-na-heket transition hover:bg-na-heket/10"
          >
            Abrir en Google Maps
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <a
            href={editorialSedeWhatsAppUrl(sede.name, contact)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-na-heket px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            {contact.whatsappCtaLabel}
          </a>
        </div>
      </div>

      <LazyMapEmbed sede={sede} />
    </div>
  );
}

export function EditorialDondeEstamosSection() {
  const { page, contact, sedes } = useEditorialDonde();
  const edit = useEditorialCmsEdit();
  const [tab, setTab] = useState<EditorialSedeId>(sedes[0]?.id ?? "sede-naco");
  const sede = sedes.find((s) => s.id === tab) ?? sedes[0];

  if (!sede) return null;

  return (
    <section
      id="donde-estamos"
      className="scroll-mt-[var(--editorial-header-offset,7rem)] bg-gradient-to-br from-na-heket/[0.04] via-white to-na-editorial/[0.05] py-14 sm:py-16"
      aria-labelledby="editorial-donde-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative">
          {edit?.ready ? (
            <EditorialEditPencil
              label="Editar encabezado de la página"
              onClick={() => edit.setSelectedId("donde:page")}
              className="right-0 top-0"
            />
          ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-heket">
          {page.eyebrow}
        </p>
        <h2
          id="editorial-donde-title"
          className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl"
        >
          {page.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
          {page.lede}
        </p>
        </div>

        <div
          className="mt-8 inline-flex flex-wrap gap-2 rounded-2xl border border-na-heket/10 bg-white p-1.5 shadow-na-soft"
          role="tablist"
          aria-label="Sedes de Editorial Logos"
        >
          {sedes.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`editorial-sede-panel-${item.id}`}
                id={`editorial-sede-tab-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-na-editorial text-white shadow-md shadow-na-editorial/20"
                    : "text-na-muted hover:bg-na-editorial/5 hover:text-na-ink"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <div
          id={`editorial-sede-panel-${sede.id}`}
          role="tabpanel"
          aria-labelledby={`editorial-sede-tab-${sede.id}`}
          className="mt-8"
        >
          <SedePanel
            sede={sede}
            contact={contact}
            onEdit={
              edit?.ready
                ? () => edit.setSelectedId(`donde:sede:${sede.id}`)
                : undefined
            }
            onEditContact={
              edit?.ready ? () => edit.setSelectedId("donde:contact") : undefined
            }
          />
        </div>
      </div>
    </section>
  );
}
