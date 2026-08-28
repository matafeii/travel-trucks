import { catalogFiltersSchema } from "@/features/catalog/filter-schema";
import { readFilters, writeFilters } from "@/features/catalog/url-filters";

it("reads valid URL filters and trims the location", () => {
  const filters = readFilters(
    new URLSearchParams(
      "location=%20Kyiv%2C%20Ukraine%20&form=panel_van&engine=diesel&transmission=manual",
    ),
  );

  expect(filters).toEqual({
    location: "Kyiv, Ukraine",
    form: "panel_van",
    engine: "diesel",
    transmission: "manual",
  });
});

it("replaces unknown URL values with empty filters without discarding valid values", () => {
  const filters = readFilters(
    new URLSearchParams("form=motorhome&engine=hybrid&transmission=cvt"),
  );

  expect(filters).toEqual({
    location: "",
    form: "",
    engine: "hybrid",
    transmission: "",
  });
});

it("writes only non-empty filters and normalizes location whitespace", () => {
  const params = writeFilters({
    location: "  Lviv  ",
    form: "",
    engine: "electric",
    transmission: "",
  });

  expect(params.toString()).toBe("location=Lviv&engine=electric");
});

it("defines the backend filter literals in the shared Zod schema", () => {
  expect(
    catalogFiltersSchema.safeParse({
      location: "Kyiv",
      form: "motorhome",
      engine: "diesel",
      transmission: "automatic",
    }).success,
  ).toBe(false);
});
