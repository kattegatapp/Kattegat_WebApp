export const BROWSE_RESUME_STORAGE_KEY = "kattegat-browse-resume";

export type BrowseResumeState = {
  q?: string;
  categoryId?: string;
  updatedAt: number;
};

export function readBrowseResume(): BrowseResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BROWSE_RESUME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowseResumeState;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.q?.trim() && !parsed.categoryId?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeBrowseResume(input: { q?: string; categoryId?: string }) {
  if (typeof window === "undefined") return;
  const q = input.q?.trim() || undefined;
  const categoryId = input.categoryId?.trim() || undefined;
  if (!q && !categoryId) {
    try {
      window.localStorage.removeItem(BROWSE_RESUME_STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  try {
    window.localStorage.setItem(
      BROWSE_RESUME_STORAGE_KEY,
      JSON.stringify({ q, categoryId, updatedAt: Date.now() } satisfies BrowseResumeState),
    );
  } catch {
    // ignore quota / private mode
  }
}
