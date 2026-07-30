"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { resolvePageMediaButtonHref } from "@/lib/cms/page-media";
import { PageMediaGallery } from "@/components/cms/PageMediaGallery";
import { PageMediaVideo } from "@/components/cms/PageMediaVideo";
import { WHATSAPP_URL } from "@/lib/site-config";
import type {
  CmsPageMediaBlock,
  CmsPageMediaBlockWidth,
  CmsPageMediaButtonBlock,
} from "@/lib/cms/types";

function cardShell() {
  return "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm";
}

function widthClass(width: CmsPageMediaBlockWidth | undefined): string {
  return width === "full" ? "w-full max-w-none" : "max-w-3xl";
}

function columnAlign(
  width: CmsPageMediaBlockWidth | undefined,
  align: "left" | "center" | undefined,
): "left" | "center" | undefined {
  if (width === "full") return undefined;
  return align ?? "left";
}

function PageMediaButton({ block }: { block: CmsPageMediaButtonBlock }) {
  const href = resolvePageMediaButtonHref(block, WHATSAPP_URL);
  const variant = block.variant ?? "primary";
  const external = block.linkKind === "url";
  const className =
    variant === "whatsapp"
      ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md"
      : variant === "outline"
        ? "inline-flex items-center justify-center gap-2 rounded-full border-2 border-na-editorial px-6 py-3 text-sm font-bold text-na-editorialDark"
        : "inline-flex items-center justify-center gap-2 rounded-full bg-na-editorial px-6 py-3 text-sm font-bold text-white shadow-md";

  const inner = (
    <>
      {block.label}
      {external ? <ExternalLink className="h-4 w-4" aria-hidden /> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

export function PageMediaBlockView({
  block,
  index = 0,
}: {
  block: CmsPageMediaBlock;
  index?: number;
}) {
  const wrap = (children: ReactNode, align?: "left" | "center") => (
    <div className={`${widthClass(block.width)} ${align === "center" ? "mx-auto text-center" : ""}`}>
      {children}
    </div>
  );

  if (block.kind === "text") {
    return wrap(
      <div className="space-y-3">
        {block.heading ? <h3 className="text-xl font-black text-na-editorialDark sm:text-2xl">{block.heading}</h3> : null}
        {block.paragraphs.map((p, i) =>
          p.trim() ? (
            <p key={i} className="text-sm leading-relaxed text-slate-600 sm:text-base">{p}</p>
          ) : null,
        )}
      </div>,
    );
  }

  if (block.kind === "button") {
    return wrap(<PageMediaButton block={block} />, block.align ?? "left");
  }

  if (block.kind === "gallery") {
    return wrap(
      <PageMediaGallery block={block} index={index} />,
      columnAlign(block.width, block.align),
    );
  }

  const src = resolveCmsMediaUrl(block.src) ?? block.src;
  const poster = resolveCmsMediaUrl(block.poster) ?? block.poster;
  const layout = block.layout ?? "card";
  const mediaAlign = columnAlign(block.width, block.align);

  if (layout === "voluntariado") {
    return wrap(
      <article className={`flex flex-col ${cardShell()}`}>
        <div className="relative aspect-[16/10] w-full bg-na-editorial/5">
          {block.imageKind === "video" && src ? (
            <PageMediaVideo
              src={src}
              poster={poster}
              title={block.title || block.alt || "Video"}
              className="h-full w-full object-cover"
            />
          ) : src ? (
            <Image
              src={src}
              alt={block.alt || block.title || "Imagen"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-6">
          {block.area ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-na-editorial">{block.area}</p>
          ) : null}
          {block.title ? (
            <h3 className={`text-lg font-black text-na-editorialDark ${block.area ? "mt-2" : ""}`}>{block.title}</h3>
          ) : null}
          {block.body ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.body}</p> : null}
          {block.linkHref ? (
            <a
              href={block.linkHref}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-na-editorial hover:underline"
              target={block.linkHref.startsWith("http") ? "_blank" : undefined}
              rel={block.linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {block.linkLabel ?? "Ver más"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </article>,
      mediaAlign,
    );
  }

  if (layout === "overlay") {
    return wrap(
      <article className={`group relative aspect-[4/3] ${cardShell()}`}>
        {block.imageKind === "video" && src ? (
          <PageMediaVideo
            src={src}
            poster={poster}
            title={block.title || block.alt || "Video"}
            className="h-full w-full object-cover"
          />
        ) : src ? (
          <Image
            src={src}
            alt={block.alt || block.title || "Imagen"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : null}
        {(block.caption || block.title) ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {block.caption || block.title}
          </span>
        ) : null}
      </article>,
      mediaAlign,
    );
  }

  return wrap(
    <article className={cardShell()}>
      <div className="relative aspect-[4/3] bg-na-editorial/5">
        {block.imageKind === "video" && src ? (
          <PageMediaVideo
            src={src}
            poster={poster}
            title={block.title || block.alt || "Video"}
            className="h-full w-full object-cover"
          />
        ) : src ? (
          <Image
            src={src}
            alt={block.alt || block.title || "Imagen"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : null}
      </div>
      {(block.title || block.caption || block.linkHref) && (
        <div className="space-y-2 p-4">
          {block.title ? <h3 className="text-base font-bold text-na-editorialDark">{block.title}</h3> : null}
          {block.caption ? <p className="text-sm leading-relaxed text-slate-600">{block.caption}</p> : null}
          {block.linkHref ? (
            <a
              href={block.linkHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-na-editorial hover:underline"
              target={block.linkHref.startsWith("http") ? "_blank" : undefined}
              rel={block.linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {block.linkLabel ?? "Ver más"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      )}
    </article>,
    mediaAlign,
  );
}
