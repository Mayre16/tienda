"use client";

import { EditorialNavigationProvider as Provider } from "@/lib/editorial-navigation";

export function EditorialNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider>{children}</Provider>;
}
