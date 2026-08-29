import { apiFetch } from "@/lib/api/client";
import { buildCampersSearchParams } from "@/lib/api/query";
import type {
  BookingRequest,
  BookingResponse,
  CamperDetails,
  CamperListResponse,
  CatalogFilters,
  Review,
} from "@/types/camper";

export function getCampers(
  filters: CatalogFilters,
  page: number,
  signal?: AbortSignal,
): Promise<CamperListResponse> {
  return apiFetch<CamperListResponse>(
    `/campers?${buildCampersSearchParams(filters, page)}`,
    { signal },
  );
}

export function getCamper(camperId: string): Promise<CamperDetails> {
  return apiFetch<CamperDetails>(`/campers/${encodeURIComponent(camperId)}`);
}

export function getCamperReviews(camperId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/campers/${encodeURIComponent(camperId)}/reviews`);
}

export function createBookingRequest(
  camperId: string,
  data: BookingRequest,
): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(
    `/campers/${encodeURIComponent(camperId)}/booking-requests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    201,
  );
}
