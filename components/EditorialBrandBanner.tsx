import Image from "next/image";
import { SUBMARCA_LOGO } from "@/lib/site-config";
import { assetUrl } from "@/lib/asset-url";

/** Identificador oficial Editorial Logos a la izquierda; continuidad del naranja a la derecha. */
export function EditorialBrandBanner() {
  return (
    <header className="flex w-full items-stretch bg-na-amon">
      <div className="relative shrink-0">
        <Image
          src={assetUrl(SUBMARCA_LOGO.src)}
          alt={SUBMARCA_LOGO.alt}
          width={SUBMARCA_LOGO.width}
          height={SUBMARCA_LOGO.height}
          priority
          unoptimized
          className="block h-10 w-auto object-contain object-left sm:h-12"
        />
      </div>
      <div className="min-w-0 flex-1 bg-na-amon" aria-hidden />
    </header>
  );
}
