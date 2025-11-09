"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, getApiBase } from "@/lib/api";
import {
  HydraCollection,
  getHydraMembers,
  getHydraTotalItems,
} from "@/types/hydra";

export interface UseHydraPaginatedResourceOptions<T> {
  /** The base collection endpoint, e.g. /api/orders */
  endpoint: string;
  /** Additional static query params (without page) */
  params?: Record<string, string | number | undefined | null>;
  /** Items per page hint (if API supports page size param). If omitted we infer from first page. */
  pageSizeParam?: { name: string; value: number };
  /** Abort fetches when component unmounts (default true). */
  abortOnUnmount?: boolean;
  /** Whether to refetch current page when endpoint changes (default true). */
  refetchOnEndpointChange?: boolean;
  /** Optional transform for each member. */
  mapItem?: (item: any) => T;
}

export interface PaginatedState<T> {
  page: number;
  setPage: (p: number) => void;
  items: T[];
  totalItems: number;
  totalPages: number;
  perPage: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic Hydra paginated resource hook.
 * Handles: fetch, stable perPage inference, page clamping, total page calculation.
 */
export function useHydraPaginatedResource<T = any>(
  options: UseHydraPaginatedResourceOptions<T>
): PaginatedState<T> {
  const {
    endpoint,
    params,
    pageSizeParam,
    abortOnUnmount = true,
    refetchOnEndpointChange = true,
    mapItem,
  } = options;

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endpointRef = useRef(endpoint);

  // Reset page when endpoint changes (optional behavior)
  useEffect(() => {
    if (refetchOnEndpointChange && endpoint !== endpointRef.current) {
      endpointRef.current = endpoint;
      setPage(1);
    }
  }, [endpoint, refetchOnEndpointChange]);

  const buildUrl = useCallback(() => {
    // If endpoint is absolute (starts with http), use as-is; otherwise join with API base.
    const isAbsolute = /^https?:\/\//i.test(endpoint);
    const base = isAbsolute ? "" : getApiBase().replace(/\/+$/,'');
    const path = isAbsolute ? endpoint : `${base}/${endpoint.replace(/^\/+/, "")}`;
    const url = new URL(path);
    // static params
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    // page param
    url.searchParams.set("page", String(page));
    if (pageSizeParam) {
      url.searchParams.set(pageSizeParam.name, String(pageSizeParam.value));
    }
    return url.toString();
  }, [endpoint, params, page, pageSizeParam]);

  const fetchPage = useCallback(async () => {
    const controller = new AbortController();
    try {
      setIsLoading(true);
      setError(null);
      const url = buildUrl();
      const res = await apiFetch(url, {
        method: "GET",
        headers: { Accept: "application/ld+json, application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch (status ${res.status})`);

      const data: HydraCollection<any> = await res.json();
      const members = getHydraMembers(data);
      const itemsCount = getHydraTotalItems(data) ?? 0;

      if (perPage === null && members.length > 0) {
        setPerPage(members.length);
      }

      setItems(mapItem ? members.map(mapItem) : members);
      setTotalItems(itemsCount);

      // Derive pages
      const effectivePerPage = perPage || members.length || itemsCount || 1;
      const pages = Math.max(1, Math.ceil(itemsCount / effectivePerPage));
      setTotalPages(pages);

      // Clamp page if out of range (could happen if dataset shrank)
      if (page > pages) {
        setPage(pages);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load resource");
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  }, [buildUrl, mapItem, page, perPage]);

  useEffect(() => {
    let cleanup: any;
    fetchPage().then((c) => (cleanup = c));
    return () => {
      if (abortOnUnmount && cleanup) cleanup();
    };
  }, [fetchPage, abortOnUnmount]);

  const refetch = useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    page,
    setPage: (p: number) => setPage(Math.max(1, p)),
    items,
    totalItems,
    totalPages,
    perPage,
    isLoading,
    error,
    refetch,
  };
}
