import { expect } from "vitest";
import { http, HttpResponse } from "msw";
import {
  camperDetails,
  campersResponse,
  camperReviews,
} from "@/tests/fixtures/campers";

export const API_BASE_URL = "https://campers-api.goit.study";

export const handlers = [
  http.get(`${API_BASE_URL}/campers`, ({ request }) => {
    const url = new URL(request.url);

    if (
      url.searchParams.get("page") !== "2" ||
      url.searchParams.get("perPage") !== "4" ||
      url.searchParams.get("location") !== "Kyiv" ||
      url.searchParams.get("form") !== "panel_van" ||
      url.searchParams.get("engine") !== "diesel" ||
      url.searchParams.has("transmission")
    ) {
      return HttpResponse.json(
        { message: "Unexpected catalog query" },
        { status: 400 },
      );
    }

    return HttpResponse.json(campersResponse);
  }),
  http.get(`${API_BASE_URL}/campers/:camperId`, ({ params, request }) => {
    if (
      params.camperId !== "camper/one" ||
      new URL(request.url).pathname !== "/campers/camper%2Fone"
    ) {
      return HttpResponse.json({ message: "Unknown camper" }, { status: 404 });
    }

    return HttpResponse.json(camperDetails);
  }),
  http.get(
    `${API_BASE_URL}/campers/:camperId/reviews`,
    ({ params, request }) => {
      if (
        params.camperId !== "camper/one" ||
        new URL(request.url).pathname !== "/campers/camper%2Fone/reviews"
      ) {
        return HttpResponse.json(
          { message: "Unknown camper" },
          { status: 404 },
        );
      }

      return HttpResponse.json(camperReviews);
    },
  ),
  http.post(
    `${API_BASE_URL}/campers/:camperId/booking-requests`,
    async ({ params, request }) => {
      if (
        params.camperId !== "camper/one" ||
        new URL(request.url).pathname !==
          "/campers/camper%2Fone/booking-requests"
      ) {
        return HttpResponse.json(
          { message: "Unknown camper" },
          { status: 404 },
        );
      }

      expect(request.headers.get("content-type")).toContain("application/json");
      expect(await request.json()).toEqual({
        name: "Ada Lovelace",
        email: "ada@example.com",
      });

      return HttpResponse.json({ message: "Booking created" }, { status: 201 });
    },
  ),
];
