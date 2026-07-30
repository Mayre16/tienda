"use client";

import { usePathname } from "next/navigation";
import { PageMediaCmsProvider } from "@/components/cms/PageMediaCmsContext";
import { PageMediaSections } from "@/components/cms/PageMediaSections";
import { pathnameToEditorialPageMedia } from "@/lib/cms/editorial-page-media";

export function EditorialPageMedia() {
  const pathname = usePathname();
  const pageId = pathnameToEditorialPageMedia(pathname);
  if (!pageId) return null;

  return (
    <PageMediaCmsProvider pageId={pageId} siteId="editorial">
      <PageMediaSections pageId={pageId} />
    </PageMediaCmsProvider>
  );
}
