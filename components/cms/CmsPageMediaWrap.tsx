"use client";

import { type ReactNode } from "react";
import { PageMediaCmsProvider } from "@/components/cms/PageMediaCmsContext";
import { PageMediaSections } from "@/components/cms/PageMediaSections";
import type { CmsPageMediaTarget } from "@/lib/cms/types";

export function CmsPageMediaWrap({
  pageId,
  children,
}: {
  pageId: CmsPageMediaTarget;
  children: ReactNode;
}) {
  return (
    <PageMediaCmsProvider pageId={pageId}>
      {children}
      <PageMediaSections pageId={pageId} />
    </PageMediaCmsProvider>
  );
}
