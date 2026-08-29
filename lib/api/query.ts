import type { CatalogFilters } from "@/types/camper";

export function buildCampersSearchParams(
  filters: CatalogFilters,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams({ page: String(page), perPage: "4" });
  const location = filters.location.trim();

  if (location) params.set("location", location);
  if (filters.form) params.set("form", filters.form);
  if (filters.engine) params.set("engine", filters.engine);
  if (filters.transmission) params.set("transmission", filters.transmission);

  return params;
}
