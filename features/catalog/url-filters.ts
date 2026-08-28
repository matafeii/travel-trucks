import type { z } from "zod";
import type { CatalogFilters } from "@/types/camper";
import { catalogFiltersSchema } from "./filter-schema";

type SearchParamsReader = Pick<URLSearchParams, "get">;

function readChoice<T extends string>(
  schema: z.ZodType<T>,
  value: unknown,
): T | "" {
  const parsed = schema.safeParse(value ?? "");

  return parsed.success ? parsed.data : "";
}

function readLocation(value: unknown): string {
  const parsed = catalogFiltersSchema.shape.location.safeParse(value ?? "");

  return parsed.success ? parsed.data : "";
}

export function readFilters(searchParams: SearchParamsReader): CatalogFilters {
  return {
    location: readLocation(searchParams.get("location")),
    form: readChoice(catalogFiltersSchema.shape.form, searchParams.get("form")),
    engine: readChoice(
      catalogFiltersSchema.shape.engine,
      searchParams.get("engine"),
    ),
    transmission: readChoice(
      catalogFiltersSchema.shape.transmission,
      searchParams.get("transmission"),
    ),
  };
}

export function writeFilters(filters: CatalogFilters): URLSearchParams {
  const normalized: CatalogFilters = {
    location: readLocation(filters.location),
    form: readChoice(catalogFiltersSchema.shape.form, filters.form),
    engine: readChoice(catalogFiltersSchema.shape.engine, filters.engine),
    transmission: readChoice(
      catalogFiltersSchema.shape.transmission,
      filters.transmission,
    ),
  };
  const params = new URLSearchParams();

  if (normalized.location) params.set("location", normalized.location);
  if (normalized.form) params.set("form", normalized.form);
  if (normalized.engine) params.set("engine", normalized.engine);
  if (normalized.transmission)
    params.set("transmission", normalized.transmission);

  return params;
}
