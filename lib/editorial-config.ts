"use client";

import { useMemo } from "react";
import {
  useEditorialBookFilters,
  useEditorialHeaderNav,
  useEditorialRegaloCategories,
  useEditorialRegalos,
  useEditorialRevistas,
  useEditorialShopCategories,
  useEditorialWelcome,
} from "@/lib/cms/hooks";
import {
  EDITORIAL_HASH_TO_CATEGORY,
  type EditorialNavItem,
} from "@/lib/editorial-content";
import {
  REGALO_CATEGORIES,
  type RegaloItem,
  type RevistaItem,
} from "@/lib/editorial-extras";

export type EditorialWelcome = {
  title: string;
  lede: string;
  tagline: string;
};

export type EditorialConfig = {
  headerNav: EditorialNavItem[];
  welcome: EditorialWelcome;
  shopCategories: { id: string; label: string; hash: string }[];
  themes: string[];
  authorFilters: { id: string; label: string }[];
  revistas: RevistaItem[];
  regaloCategories: typeof REGALO_CATEGORIES;
  regalos: RegaloItem[];
};

export function editorialHashToCategory(hash: string) {
  return EDITORIAL_HASH_TO_CATEGORY[hash] ?? null;
}

export function useEditorialConfig(): EditorialConfig {
  const headerNav = useEditorialHeaderNav();
  const welcome = useEditorialWelcome();
  const shopCategories = useEditorialShopCategories();
  const { themes, authorFilters } = useEditorialBookFilters();
  const revistas = useEditorialRevistas();
  const regaloCategories = useEditorialRegaloCategories();
  const regalos = useEditorialRegalos();

  return useMemo(
    () => ({
      headerNav,
      welcome,
      shopCategories,
      themes,
      authorFilters,
      revistas,
      regaloCategories,
      regalos,
    }),
    [
      headerNav,
      welcome,
      shopCategories,
      themes,
      authorFilters,
      revistas,
      regaloCategories,
      regalos,
    ],
  );
}
