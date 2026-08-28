import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";

const image = "/images/mavericks-large.png";
const thumb = "/images/mavericks-thumb.png";

function camper(id: string, name: string) {
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
    coverImage: image,
  };
}

const allCampers = [
  camper("cmqv06hzn004hyyxtjyv3y6nl", "Alpine Roamer S1"),
  ...Array.from({ length: 7 }, (_, index) =>
    camper(`camper-${index + 2}`, `Travel Truck ${index + 2}`),
  ),
];

async function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectBox(
  locator: Locator,
  expected: { x: number; y: number; width: number; height?: number },
) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeCloseTo(expected.x, 0);
  expect(box!.y).toBeCloseTo(expected.y, 0);
  expect(box!.width).toBeCloseTo(expected.width, 0);
  if (expected.height !== undefined) {
    expect(box!.height).toBeCloseTo(expected.height, 0);
  }
}

async function mockApi(context: BrowserContext) {
  await context.route(
    "https://campers-api.goit.study/campers**",
    async (route) => {
      const url = new URL(route.request().url());
      const match = url.pathname.match(
        /^\/campers\/([^/]+)(?:\/(reviews|booking-requests))?$/,
      );

      if (match) {
        const [, id, child] = match;
        if (child === "reviews") {
          return route.fulfill({
            json: [
              {
                id: "review-1",
                camperId: id,
                reviewer_name: "Ada",
                reviewer_rating: 5,
                comment: "Excellent trip.",
                createdAt: "2026-01-01",
              },
            ],
          });
        }
        if (child === "booking-requests") {
          return route.fulfill({ status: 201, json: { message: "Created" } });
        }
        const item = allCampers.find((entry) => entry.id === id);
        return route.fulfill({
          json: {
            ...item,
            gallery: [1, 2].map((order) => ({
              id: `image-${order}`,
              camperId: id,
              thumb,
              original: image,
              order,
            })),
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
          },
        });
      }

      const pageNumber = Number(url.searchParams.get("page") ?? "1");
      const start = (pageNumber - 1) * 4;
      return route.fulfill({
        json: {
          page: pageNumber,
          perPage: 4,
          total: 8,
          totalPages: 2,
          campers: allCampers.slice(start, start + 4),
        },
      });
    },
  );
}

test.beforeEach(async ({ context }) => mockApi(context));

test("home CTA opens the catalog without console errors", async ({
  page,
}, testInfo) => {
  const errors = await watchConsole(page);
  await page.setViewportSize({ width: 1440, height: 768 });
  await page.goto("/");
  await expectBox(page.locator("header"), {
    x: 0,
    y: 0,
    width: 1440,
    height: 72,
  });
  await expectBox(page.locator("main"), {
    x: 0,
    y: 72,
    width: 1440,
    height: 696,
  });
  await expectBox(page.getByRole("link", { name: "View Now" }), {
    x: 64,
    y: 387,
    width: 173,
    height: 56,
  });
  await page.screenshot({
    path: testInfo.outputPath("home-1440.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "View Now" }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole("article")).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("filters, paging, popup details, gallery and booking work", async ({
  page,
  context,
}, testInfo) => {
  const errors = await watchConsole(page);
  await page.goto("/catalog");
  await expectBox(page.locator("form").first(), { x: 64, y: 120, width: 360 });
  await expectBox(page.getByRole("article").first(), {
    x: 488,
    y: 120,
    width: 888,
    height: 312,
  });
  await page.screenshot({
    path: testInfo.outputPath("catalog-1440.png"),
    fullPage: true,
  });
  await page.getByLabel("Location").fill("Kyiv");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/location=Kyiv/);
  await page.getByRole("button", { name: "Load More" }).click();
  await expect(page.getByRole("article")).toHaveCount(8);

  const popupPromise = context.waitForEvent("page");
  await page.getByRole("link", { name: "Show more" }).first().click();
  const details = await popupPromise;
  const detailErrors = await watchConsole(details);
  await expect(
    details.getByRole("heading", { level: 1, name: "Alpine Roamer S1" }),
  ).toBeVisible();
  await expect(
    details.getByRole("img", { name: "Alpine Roamer S1 — image 1" }),
  ).toHaveAttribute("loading", "eager");
  await expectBox(
    details.getByRole("region", { name: "Alpine Roamer S1 gallery" }),
    {
      x: 64,
      y: 136,
      width: 638,
    },
  );
  await details.screenshot({
    path: testInfo.outputPath("details-1440.png"),
    fullPage: true,
  });
  await details
    .getByRole("button", { name: "Show Alpine Roamer S1 image 2" })
    .click();
  await expect(
    details.getByRole("region", { name: "Alpine Roamer S1 gallery" }),
  ).toBeVisible();
  await details.getByLabel("Name").fill("Ada Lovelace");
  await details.getByLabel("Email").fill("ada@example.com");
  await details.getByRole("button", { name: "Send" }).click();
  await expect(details.getByRole("status")).toContainText("Booking successful");
  expect(errors).toEqual([]);
  expect(detailErrors).toEqual([]);
});
