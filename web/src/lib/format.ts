// Small presentation helpers shared across components.

/** Normalize a stored media path ("uploads/x.png") to a servable URL ("/uploads/x.png"). */
export function mediaUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  if (/^https?:\/\//.test(u)) return u;
  return "/" + u.replace(/^\/+/, "");
}

/** ISO instant -> "Aug 3, 2026". Null-safe. */
export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
