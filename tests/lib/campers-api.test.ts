import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import {
  getCamper,
  getCamperReviews,
  getCampers,
  createBookingRequest,
} from "@/lib/api/campers";
import { API_BASE_URL, ApiError } from "@/lib/api/client";
import {
  camperDetails,
  camperReviews,
  campersResponse,
} from "@/tests/fixtures/campers";
import { server } from "@/tests/msw/server";

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

  it("uses the backend message for JSON booking failures", async () => {
    server.use(
      http.post(`${API_BASE_URL}/campers/:camperId/booking-requests`, () =>
        HttpResponse.json({ message: "Email is invalid" }, { status: 422 }),
      ),
    );

    const error = await createBookingRequest("camper/one", {
      name: "Ada Lovelace",
      email: "ada@example.com",
    }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, message: "Email is invalid" });
  });

  it("uses a stable fallback for empty booking failures", async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/campers/:camperId/booking-requests`,
        () => new HttpResponse(null, { status: 503 }),
      ),
    );

    const error = await createBookingRequest("camper/one", {
      name: "Ada Lovelace",
      email: "ada@example.com",
    }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 503,
      message: "Request failed with status 503",
    });
  });
});
