"use client";

import {
  mergeEditorialBookFilters,
  mergeEditorialMemorion,
  mergeEditorialPrintedBooks,
  mergeEditorialDigitalBooks,
  mergeEditorialDondePage,
  mergeEditorialDondeContact,
  mergeEditorialFooterTagline,
  mergeEditorialHeaderNav,
  mergeEditorialHeroImages,
  mergeEditorialHomeCards,
  mergeEditorialQuienesSomosLibreria,
  mergeEditorialQuienesSomosNa,
  mergeEditorialRegaloCategories,
  mergeEditorialRegalos,
  mergeEditorialRevistas,
  mergeEditorialSedes,
  mergeEditorialShopCategories,
  mergeEditorialStorePhoto,
  mergeEditorialVisit,
  mergeEditorialWelcome,
  DIGITAL_BOOK_GROUPS,
  EDITORIAL_DONDE,
  EDITORIAL_DONDE_CONTACT,
  EDITORIAL_HEADER_NAV,
  EDITORIAL_HOME_CARDS,
  EDITORIAL_LIBRERIA,
  EDITORIAL_QUIENES_SOMOS,
  EDITORIAL_SEDES,
  EDITORIAL_STORE_PHOTO,
  EDITORIAL_VISIT,
  EDITORIAL_WELCOME,
  EDITORIAL_HERO_IMAGES,
  REGALO_CATEGORIES,
  REGALOS,
  REVISTAS,
} from "@/lib/cms/merge-content";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { useCmsHydrated } from "@/lib/cms/hydration";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import { editorialStateAsDoc } from "@/lib/cms/editorial-display";

export { useCmsHydrated } from "@/lib/cms/hydration";

function useEditOrPublishedCms() {
  const cms = useCmsDocument();
  const edit = useEditorialCmsEdit();
  if (edit?.ready) return editorialStateAsDoc(edit.state);
  return cms;
}

export function useEditorialHeaderNav() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return EDITORIAL_HEADER_NAV;
  if (!isCmsEnabled()) return EDITORIAL_HEADER_NAV;
  return mergeEditorialHeaderNav(EDITORIAL_HEADER_NAV, cms);
}

export function useEditorialWelcome() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return { ...EDITORIAL_WELCOME };
  if (!isCmsEnabled()) return { ...EDITORIAL_WELCOME };
  return mergeEditorialWelcome(EDITORIAL_WELCOME, cms);
}

export function useEditorialHomeCards() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return EDITORIAL_HOME_CARDS;
  if (!isCmsEnabled()) return EDITORIAL_HOME_CARDS;
  return mergeEditorialHomeCards(EDITORIAL_HOME_CARDS, cms);
}

export function useEditorialFooterTagline() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) {
    return mergeEditorialFooterTagline(null);
  }
  if (!isCmsEnabled()) return mergeEditorialFooterTagline(null);
  return mergeEditorialFooterTagline(cms);
}

export function useEditorialQuienesSomos() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) {
    return {
      libreria: EDITORIAL_LIBRERIA,
      nuevaAcropolis: EDITORIAL_QUIENES_SOMOS,
    };
  }
  if (!isCmsEnabled()) {
    return {
      libreria: EDITORIAL_LIBRERIA,
      nuevaAcropolis: EDITORIAL_QUIENES_SOMOS,
    };
  }
  return {
    libreria: mergeEditorialQuienesSomosLibreria(cms),
    nuevaAcropolis: mergeEditorialQuienesSomosNa(cms),
  };
}

export function useEditorialDonde() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) {
    return {
      visit: EDITORIAL_VISIT,
      page: EDITORIAL_DONDE,
      contact: EDITORIAL_DONDE_CONTACT,
      sedes: EDITORIAL_SEDES,
      storePhoto: EDITORIAL_STORE_PHOTO,
    };
  }
  if (!isCmsEnabled()) {
    return {
      visit: EDITORIAL_VISIT,
      page: EDITORIAL_DONDE,
      contact: EDITORIAL_DONDE_CONTACT,
      sedes: EDITORIAL_SEDES,
      storePhoto: EDITORIAL_STORE_PHOTO,
    };
  }
  return {
    visit: mergeEditorialVisit(cms),
    page: mergeEditorialDondePage(cms),
    contact: mergeEditorialDondeContact(cms),
    sedes: mergeEditorialSedes(EDITORIAL_SEDES, cms),
    storePhoto: mergeEditorialStorePhoto(cms),
  };
}

export function useEditorialRevistas() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return REVISTAS;
  if (!isCmsEnabled()) return REVISTAS;
  return mergeEditorialRevistas(REVISTAS, cms);
}

export function useEditorialRegalos() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return REGALOS;
  if (!isCmsEnabled()) return REGALOS;
  return mergeEditorialRegalos(REGALOS, cms);
}

export function useEditorialRegaloCategories() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return REGALO_CATEGORIES;
  if (!isCmsEnabled()) return REGALO_CATEGORIES;
  return mergeEditorialRegaloCategories(REGALO_CATEGORIES, cms);
}

export function useEditorialShopCategories() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return mergeEditorialShopCategories(null);
  if (!isCmsEnabled()) return mergeEditorialShopCategories(null);
  return mergeEditorialShopCategories(cms);
}

export function useEditorialBookFilters() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return mergeEditorialBookFilters(null);
  if (!isCmsEnabled()) return mergeEditorialBookFilters(null);
  return mergeEditorialBookFilters(cms);
}

export function useEditorialMemorion() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return mergeEditorialMemorion(null);
  if (!isCmsEnabled()) return mergeEditorialMemorion(null);
  return mergeEditorialMemorion(cms);
}

export function useEditorialPrintedBooks() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return mergeEditorialPrintedBooks(null);
  if (!isCmsEnabled()) return mergeEditorialPrintedBooks(null);
  return mergeEditorialPrintedBooks(cms);
}

export function useEditorialDigitalBooks() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return DIGITAL_BOOK_GROUPS;
  if (!isCmsEnabled()) return DIGITAL_BOOK_GROUPS;
  return mergeEditorialDigitalBooks(DIGITAL_BOOK_GROUPS, cms);
}

export function useEditorialHeroImages() {
  const cms = useEditOrPublishedCms();
  const hydrated = useCmsHydrated();
  if (!hydrated) return EDITORIAL_HERO_IMAGES;
  if (!isCmsEnabled()) return EDITORIAL_HERO_IMAGES;
  return mergeEditorialHeroImages(EDITORIAL_HERO_IMAGES, cms);
}
