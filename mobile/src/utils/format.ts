export function formatRating(voteAverage: number) {
  return `${voteAverage.toFixed(1)} / 10`;
}

export function formatYear(date?: string | null) {
  if (!date) return "N/A";
  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? "N/A" : String(year);
}
