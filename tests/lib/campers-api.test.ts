import { describe, expect, it } from "vitest";
import {
  getCamper,
  getCamperReviews,
  getCampers,
  createBookingRequest,
} from "@/lib/api/campers";
import {
  camperDetails,
  camperReviews,
  campersResponse,
} from "@/tests/fixtures/campers";

describe("campers API", () => {
  it("requests a catalog page with the documented active filters", async () => {
    await expect(
      getCampers(
        {
          location: " Kyiv ",
          form: "panel_van",
          engine: "diesel",
          transmission: "",
        },
        2,
      ),
    ).resolves.toEqual(campersResponse);
  });

  it("encodes the camper identifier for details requests", async () => {
    await expect(getCamper("camper/one")).resolves.toEqual(camperDetails);
  });

  it("gets reviews from the documented camper child route", async () => {
    await expect(getCamperReviews("camper/one")).resolves.toEqual(
      camperReviews,
    );
  });

  it("sends exactly the documented booking body", async () => {
    await expect(
      createBookingRequest("camper/one", {
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
    ).resolves.toEqual({ message: "Booking created" });
  });
});
