"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type StoreBook,
  filterStoreBooks,
  loadStoreBooksCatalog,
} from "@/lib/bookstore";

type CatalogFilters = {
  q?: string;
  authorGroup?: string;
  publisher?: string;
  area?: string;
  productType?: string;
};

/** Catálogo impreso en memoria: un solo fetch, filtros instantáneos. */
export function useStoreBooksCatalog(filters: CatalogFilters = {}) {
  const productType = filters.productType ?? "impreso";
  const [allItems, setAllItems] = useState<StoreBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loadStoreBooksCatalog(productType)
      .then((items) => {
        if (!cancelled) setAllItems(items);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error de conexión");
          setAllItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productType]);

  const items = useMemo(
    () => filterStoreBooks(allItems, filters),
    [allItems, filters.q, filters.authorGroup, filters.publisher, filters.area],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadStoreBooksCatalog(productType, { force: true });
      setAllItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [productType]);

  return { items, allItems, loading, error, reload };
}
