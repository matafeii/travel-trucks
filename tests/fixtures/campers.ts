import type { CamperDetails, CamperListResponse, Review } from "@/types/camper";

export const camperDetails: CamperDetails = {
  id: "camper/one",
  name: "Travel Truck",
  price: 8000,
  rating: 4.8,
  totalReviews: 1,
  location: "Kyiv, Ukraine",
  description: "A compact camper for two.",
  form: "panel_van",
  length: "5.99m",
  width: "2.05m",
  height: "2.61m",
  tank: "65l",
  consumption: "7l/100km",
  transmission: "automatic",
  engine: "diesel",
  amenities: ["ac", "kitchen"],
  gallery: [
    {
      id: "image-1",
      camperId: "camper/one",
      thumb: "https://res.cloudinary.com/travel-trucks/image/upload/thumb.jpg",
      original:
        "https://res.cloudinary.com/travel-trucks/image/upload/original.jpg",
      order: 1,
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

export const campersResponse: CamperListResponse = {
  page: 2,
  perPage: 4,
  total: 1,
  totalPages: 1,
  campers: [
    {
      id: camperDetails.id,
      name: camperDetails.name,
      price: camperDetails.price,
      rating: camperDetails.rating,
      location: camperDetails.location,
      form: camperDetails.form,
      length: camperDetails.length,
      width: camperDetails.width,
      height: camperDetails.height,
      tank: camperDetails.tank,
      consumption: camperDetails.consumption,
      transmission: camperDetails.transmission,
      engine: camperDetails.engine,
      amenities: camperDetails.amenities,
      coverImage: camperDetails.gallery[0].thumb,
      totalReviews: camperDetails.totalReviews,
    },
  ],
};

export const camperReviews: Review[] = [
  {
    id: "review-1",
    camperId: camperDetails.id,
    reviewer_name: "Ada Lovelace",
    reviewer_rating: 5,
    comment: "Excellent trip.",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
];
