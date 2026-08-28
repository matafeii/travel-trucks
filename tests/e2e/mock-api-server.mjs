import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 3200;
const image = "/images/mavericks-large.png";
const thumb = "/images/mavericks-thumb.png";

function camper(id, name) {
  return {
    id,
    name,
    price: 8000,
    rating: 4.8,
    totalReviews: 1,
    location: "Ukraine, Kyiv",
    description: "A comfortable camper for memorable trips.",
    form: "panel_van",
    length: "5.99m",
    width: "2.05m",
    height: "2.61m",
    tank: "65l",
    consumption: "7l/100km",
    transmission: "automatic",
    engine: "diesel",
    amenities: ["ac", "kitchen"],
    coverImage: thumb,
  };
}

const campers = [
  camper("camper-1", "Alpine Roamer S1"),
  ...Array.from({ length: 7 }, (_, index) =>
    camper(`camper-${index + 2}`, `Travel Truck ${index + 2}`),
  ),
];

function send(response, status, data) {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(data));
}

const server = createServer((request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, null);
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  if (url.pathname === "/health") return send(response, 200, { ok: true });

  const match = url.pathname.match(
    /^\/campers\/([^/]+)(?:\/(reviews|booking-requests))?$/,
  );
  if (match) {
    const [, id, child] = match;
    const item = campers.find((entry) => entry.id === id);
    if (!item) return send(response, 404, { message: "Camper not found" });
    if (child === "reviews") {
      return send(response, 200, [
        {
          id: "review-1",
          camperId: id,
          reviewer_name: "Ada",
          reviewer_rating: 5,
          comment: "Excellent trip.",
          createdAt: "2026-01-01",
        },
      ]);
    }
    if (child === "booking-requests" && request.method === "POST") {
      return send(response, 201, { message: "Created" });
    }
    return send(response, 200, {
      ...item,
      gallery: [1, 2].map((order) => ({
        id: `image-${order}`,
        camperId: id,
        thumb: order === 1 ? thumb : "/images/road-bear-thumb.png",
        original: order === 1 ? image : "/images/road-bear-large.png",
        order,
      })),
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
  }

  if (url.pathname === "/campers") {
    const page = Number(url.searchParams.get("page") ?? "1");
    const start = (page - 1) * 4;
    return send(response, 200, {
      page,
      perPage: 4,
      total: 8,
      totalPages: 2,
      campers: campers.slice(start, start + 4),
    });
  }

  return send(response, 404, { message: "Not found" });
});

server.listen(port, host);

function close() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", close);
process.on("SIGTERM", close);
