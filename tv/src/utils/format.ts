export function formatYear(releaseDate?: string): string {
  if (!releaseDate) return '—';
  const year = new Date(releaseDate).getFullYear();
  return Number.isFinite(year) ? String(year) : '—';
}

export function formatRating(value?: number): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toFixed(1);
}
