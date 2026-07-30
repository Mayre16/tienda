import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { PRINCIPAL_SITE_URL, SUBMARCA_LOGO } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";

export function SubdomainHeader() {
  return (
    <header className="border-b border-na-editorial/15 bg-na-surface/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Image
          src={assetUrl(SUBMARCA_LOGO.src)}
          alt={SUBMARCA_LOGO.alt}
          width={SUBMARCA_LOGO.width}
          height={SUBMARCA_LOGO.height}
          unoptimized
          className="h-11 w-auto max-w-[min(100%,18rem)] object-contain sm:h-[3.25rem]"
          priority
        />
        <a
          href={PRINCIPAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-na-muted transition hover:text-na-editorialDark sm:text-sm"
        >
          acropolis.org.do
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </header>
  );
}
