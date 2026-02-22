"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Manages URL-synced filter state for list pages.
 *
 * Filters are stored in URL search params so they:
 * - Survive page refresh
 * - Work with browser back/forward
 * - Are shareable via URL
 *
 * Usage:
 *   const { filters, setFilter, resetFilters, isPending } = useFilters({
 *     query: "",
 *     active: "true",
 *     page: "1",
 *   });
 *
 *   setFilter("query", "John")   // updates URL → ?query=John&page=1
 *   setFilter("page", "2")       // updates URL → ?query=John&page=2
 *   resetFilters()               // clears all params back to defaults
 */
export function useFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Merge defaults with whatever is currently in the URL
  const filters = {
    ...defaults,
    ...Object.fromEntries(searchParams.entries()),
  } as T;

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove param if it matches the default (keeps URLs clean)
      if (value === "" || value === String(defaults[key as string])) {
        params.delete(key as string);
      } else {
        params.set(key as string, value);
      }

      // Always reset to page 1 when a filter (not the page itself) changes
      if (key !== "page") {
        params.set("page", "1");
      }

      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname);
      });
    },
    [router, pathname, searchParams, defaults]
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasActiveFilters = Object.keys(defaults).some(
    (key) => filters[key] !== defaults[key]
  );

  return { filters, setFilter, resetFilters, isPending, hasActiveFilters };
}
