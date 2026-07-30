"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { EditorialDondeEstamosSection } from "@/components/EditorialDondeEstamosSection";
import { EditorialHomeHub } from "@/components/EditorialHomeHub";
import { EditorialShop } from "@/components/EditorialShop";
import {
  isEditorialCatalogSection,
  pathnameToSection,
  useEditorialNavScroll,
  useEditorialRouteScroll,
  useEditorialSectionListener,
} from "@/lib/editorial-navigation";

export function EditorialPageBody() {
  const pathname = usePathname();
  const [section, setSection] = useState(() => pathnameToSection(pathname));
  const onSection = useCallback((next: string) => setSection(next), []);

  useEditorialSectionListener(onSection);
  useEditorialNavScroll();
  useEditorialRouteScroll();

  const showCatalog = isEditorialCatalogSection(section);
  const showHomeHub = !showCatalog && section === "";
  const showDondeEstamos = section === "donde-estamos";

  return (
    <>
      {showHomeHub ? <EditorialHomeHub /> : null}
      {showDondeEstamos ? <EditorialDondeEstamosSection /> : null}
      {showCatalog ? <EditorialShop section={section} /> : null}
    </>
  );
}
