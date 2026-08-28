import { z } from "zod";
import type { CatalogFilters } from "@/types/camper";

export const catalogFiltersSchema = z.object({
  location: z.string().trim(),
  form: z
    .enum(["alcove", "panel_van", "integrated", "semi_integrated"])
    .or(z.literal("")),
  engine: z.enum(["diesel", "petrol", "hybrid", "electric"]).or(z.literal("")),
  transmission: z.enum(["automatic", "manual"]).or(z.literal("")),
}) satisfies z.ZodType<CatalogFilters>;
