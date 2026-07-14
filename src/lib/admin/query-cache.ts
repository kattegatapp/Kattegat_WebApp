import type { QueryClient } from "@tanstack/react-query";

/**
 * Drop all cached admin panel data. Call on logout and again on login so a
 * new staff session never inherits the previous user's identity or screens.
 */
export function resetAdminQueryCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ["admin"] });
}
