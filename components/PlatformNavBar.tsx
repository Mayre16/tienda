import Link from "next/link";
import { Briefcase, ExternalLink, Globe, GraduationCap, Library, ShoppingBag } from "lucide-react";
import {
  BIBLIOTECA_URL,
  CIVIS_URL,
  DIPLOMADO_URL,
  PRINCIPAL_SITE_URL,
  SITE_URL,
} from "@/lib/site-config";

type PlatformId = "principal" | "biblioteca" | "editorial" | "civis" | "diplomado";

type NavItem = {
  id: PlatformId;
  label: string;
  href: string;
  icon: typeof Globe;
};

const ITEMS: NavItem[] = [
  {
    id: "principal",
    label: "Sitio oficial",
    href: PRINCIPAL_SITE_URL,
    icon: Globe,
  },
  {
    id: "biblioteca",
    label: "Biblioteca",
    href: BIBLIOTECA_URL,
    icon: Library,
  },
  {
    id: "editorial",
    label: "Librería",
    href: SITE_URL,
    icon: ShoppingBag,
  },
  {
    id: "civis",
    label: "Civis",
    href: CIVIS_URL,
    icon: Briefcase,
  },
  {
    id: "diplomado",
    label: "Diplomado",
    href: DIPLOMADO_URL,
    icon: GraduationCap,
  },
];

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function PlatformNavBar() {
  const current: PlatformId = "editorial";

  return (
    <div className="border-b border-na-heket/15 bg-na-heket text-white">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-end gap-2 px-4 sm:px-6">
        {ITEMS.filter((item) => item.id !== current).map((item) => {
          const Icon = item.icon;
          const external = isExternal(item.href);
          const className =
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition sm:px-3.5 sm:text-xs " +
            (item.id === "editorial"
              ? "bg-na-editorial text-white hover:bg-na-editorialDark"
              : item.id === "civis"
                ? "bg-na-civis text-white hover:bg-na-civisDark"
                : item.id === "biblioteca"
                  ? "bg-na-helios text-na-ink hover:brightness-105"
                  : item.id === "diplomado"
                    ? "bg-na-kefer text-white hover:brightness-110"
                    : "bg-white/15 text-white hover:bg-white/25");

          const content = (
            <>
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {item.label}
              {external ? (
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
              ) : null}
            </>
          );

          if (external) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
