"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { LeaveSiteDialog } from "@/components/LeaveSiteDialog";
import { useEditorialConfig } from "@/lib/editorial-config";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import type { RevistaItem } from "@/lib/editorial-extras";
import { PRINCIPAL_SITE_URL } from "@/lib/site-config";

function resolveRevistaHref(item: RevistaItem): string {
  if (item.href.startsWith("http")) return item.href;
  return `${PRINCIPAL_SITE_URL}${item.href.startsWith("/") ? item.href : `/${item.href}`}`;
}

function RevistaLinkContent({ item }: { item: RevistaItem }) {
  const label = item.linkLabel ?? "Ver revista";

  if (item.linkLogoUrl) {
    return (
      <>
        <Image
          src={preferWebpAssetUrl(item.linkLogoUrl)}
          alt={item.linkLogoAlt ?? label}
          width={432}
          height={156}
          unoptimized
          className="h-9 w-auto max-w-[min(100%,14rem)] object-contain object-left sm:h-10"
        />
        <span className="sr-only">{label}</span>
      </>
    );
  }

  return <span>{label}</span>;
}

export function RevistasSection() {
  const { revistas } = useEditorialConfig();
  const edit = useEditorialCmsEdit();
  const [leaveTarget, setLeaveTarget] = useState<RevistaItem | null>(null);

  return (
    <section id="revistas" className="scroll-mt-24">
      <div className="grid gap-5 sm:grid-cols-2">
        {revistas.map((item) => {
          const href = resolveRevistaHref(item);
          const external = item.href.startsWith("http");

          return (
            <article
              key={item.title}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-na-editorial/10 bg-white shadow-na-soft"
            >
              {edit?.ready ? (
                <EditorialEditPencil
                  label={`Editar ${item.title}`}
                  onClick={() => edit.setSelectedId(`revista:${item.title}`)}
                />
              ) : null}
              {item.imageUrl ? (
                <div className="relative aspect-[3/2] w-full bg-black/5">
                  <Image
                    src={preferWebpAssetUrl(item.imageUrl)}
                    alt={item.imageAlt ?? item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-bold text-na-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                {item.description}
              </p>
              {item.note ? (
                <p className="mt-3 text-xs text-na-muted">{item.note}</p>
              ) : null}
              {item.confirmLeave ? (
                <button
                  type="button"
                  onClick={() => setLeaveTarget(item)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-na-editorialDark transition hover:opacity-85"
                >
                  <RevistaLinkContent item={item} />
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-na-editorialDark transition hover:opacity-85"
                >
                  <RevistaLinkContent item={item} />
                  {external ? (
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  ) : null}
                </a>
              )}
              </div>
            </article>
          );
        })}
      </div>

      <LeaveSiteDialog
        open={leaveTarget !== null}
        destinationLabel={
          leaveTarget?.leaveLabel ?? leaveTarget?.title ?? "sitio externo"
        }
        destinationUrl={leaveTarget ? resolveRevistaHref(leaveTarget) : "#"}
        onCancel={() => setLeaveTarget(null)}
      />
    </section>
  );
}
