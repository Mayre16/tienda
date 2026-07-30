"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const CmsHydratedContext = createContext(false);

/** Un solo flag de hidratación compartido — evita N re-renders en cascada. */
export function CmsHydrationProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <CmsHydratedContext.Provider value={hydrated}>
      {children}
    </CmsHydratedContext.Provider>
  );
}

export function useCmsHydrated() {
  return useContext(CmsHydratedContext);
}
