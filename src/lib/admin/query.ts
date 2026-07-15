import { fetchAdminMe } from "@/lib/api/admin";

/** Shared options so shell / gates / pages hit `/me` once and reuse the cache. */
export const ADMIN_ME_QUERY_OPTIONS = {
  queryKey: ["admin", "me"] as const,
  queryFn: fetchAdminMe,
  staleTime: 60_000,
  refetchOnMount: false as const,
  retry: false as const,
};
