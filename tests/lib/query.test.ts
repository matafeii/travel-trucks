import { describe, expect, it } from "vitest";
import { buildCampersSearchParams } from "@/lib/api/query";

describe("buildCampersSearchParams", () => {
  it("serializes paging and only active backend filters", () => {
    const params = buildCampersSearchParams(
      {
        location: " Kyiv ",
        form: "panel_van",
        engine: "diesel",
        transmission: "",
      },
      2,
    );

    expect(params.toString()).toBe(
      "page=2&perPage=4&location=Kyiv&form=panel_van&engine=diesel",
    );
  });

  it("omits empty filters", () => {
    const params = buildCampersSearchParams(
      { location: "", form: "", engine: "", transmission: "" },
      1,
    );

    expect(params.toString()).toBe("page=1&perPage=4");
  });
});
