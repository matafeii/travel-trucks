import { render, screen } from "@testing-library/react";
import { ApiError } from "@/lib/api/client";
import { camperDetails, camperReviews } from "@/tests/fixtures/campers";

const { getCamperMock, getCamperReviewsMock, notFoundMock } = vi.hoisted(
  () => ({
    getCamperMock: vi.fn(),
    getCamperReviewsMock: vi.fn(),
    notFoundMock: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  }),
);

vi.mock("@/lib/api/campers", () => ({
  getCamper: getCamperMock,
  getCamperReviews: getCamperReviewsMock,
}));
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CamperPage from "@/app/catalog/[camperId]/page";

beforeEach(() => {
  getCamperMock.mockReset();
  getCamperReviewsMock.mockReset();
  getCamperReviewsMock.mockResolvedValue([]);
  notFoundMock.mockClear();
});

it("renders the camper overview from the requested id", async () => {
  getCamperMock.mockResolvedValue(camperDetails);
  getCamperReviewsMock.mockResolvedValue(camperReviews);

  render(
    await CamperPage({
      params: Promise.resolve({ camperId: "camper/one" }),
    }),
  );

  expect(getCamperMock).toHaveBeenCalledWith("camper/one");
  expect(getCamperReviewsMock).toHaveBeenCalledWith("camper/one");
  expect(
    screen.getByRole("heading", { level: 1, name: "Travel Truck" }),
  ).toBeInTheDocument();
  expect(screen.getByText("€8000.00")).toBeInTheDocument();
  expect(screen.getByText("Kyiv, Ukraine")).toBeInTheDocument();
  expect(screen.getByText("4.8 (1 Review)")).toBeInTheDocument();
  expect(screen.getByText("A compact camper for two.")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: "Vehicle details" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("Panel truck")).toHaveLength(2);
  expect(
    screen.getByRole("region", { name: "Travel Truck gallery" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: "Travel Truck — image 1" }),
  ).toHaveAttribute("loading", "eager");
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.getByText("Excellent trip.")).toBeInTheDocument();
});

it("starts camper and review requests concurrently", async () => {
  let resolveCamper: (value: typeof camperDetails) => void = () => undefined;
  getCamperMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveCamper = resolve;
      }),
  );
  getCamperReviewsMock.mockResolvedValue([]);

  const page = CamperPage({
    params: Promise.resolve({ camperId: "camper/one" }),
  });
  await vi.waitFor(() =>
    expect(getCamperReviewsMock).toHaveBeenCalledWith("camper/one"),
  );
  resolveCamper(camperDetails);
  await page;
});

it("maps only an API 404 to the not-found route", async () => {
  getCamperMock.mockRejectedValue(new ApiError("Missing camper", 404));

  await expect(
    CamperPage({ params: Promise.resolve({ camperId: "missing" }) }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
  expect(notFoundMock).toHaveBeenCalledOnce();
});

it("prioritizes a missing camper over an earlier reviews failure", async () => {
  let rejectCamper: (reason: ApiError) => void = () => undefined;
  getCamperMock.mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        rejectCamper = reject;
      }),
  );
  getCamperReviewsMock.mockRejectedValue(
    new ApiError("Reviews route missing", 404),
  );

  const page = CamperPage({
    params: Promise.resolve({ camperId: "missing" }),
  });
  await vi.waitFor(() => expect(getCamperReviewsMock).toHaveBeenCalledOnce());
  rejectCamper(new ApiError("Missing camper", 404));

  await expect(page).rejects.toThrow("NEXT_NOT_FOUND");
  expect(notFoundMock).toHaveBeenCalledOnce();
});

it("rethrows a reviews failure when the camper exists", async () => {
  const reviewsError = new ApiError("Reviews unavailable", 503);
  getCamperMock.mockResolvedValue(camperDetails);
  getCamperReviewsMock.mockRejectedValue(reviewsError);

  await expect(
    CamperPage({ params: Promise.resolve({ camperId: "camper-1" }) }),
  ).rejects.toBe(reviewsError);
  expect(notFoundMock).not.toHaveBeenCalled();
});

it.each([
  ["another API status", new ApiError("Server error", 500)],
  ["a network failure", new TypeError("fetch failed")],
])("rethrows %s", async (_label, error) => {
  getCamperMock.mockRejectedValue(error);

  await expect(
    CamperPage({ params: Promise.resolve({ camperId: "camper-1" }) }),
  ).rejects.toBe(error);
  expect(notFoundMock).not.toHaveBeenCalled();
});
