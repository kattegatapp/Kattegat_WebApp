/** Display-only — API values stay as slugs/enums. */
export function humanizeSlug(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim();
  if (!words) return words;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
