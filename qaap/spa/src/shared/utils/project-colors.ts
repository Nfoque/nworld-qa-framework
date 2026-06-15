const PROJECT_COLORS = [
  "#217BEE",
  "#16A34A",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#06B6D4",
  "#EF4444",
  "#14B8A6",
];

export function getProjectColor(name: string | null): string {
  if (!name) return "#D1D5DB";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}
