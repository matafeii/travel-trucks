import { expect, test, type Locator, type Page } from "@playwright/test";

interface BrowserIssues {
  warnings: string[];
  errors: string[];
  pageErrors: string[];
}

function watchConsole(
  page: Page,
  issues: BrowserIssues = { warnings: [], errors: [], pageErrors: [] },
) {
  page.on("console", (message) => {
    if (message.type() === "warning") issues.warnings.push(message.text());
    if (message.type() === "error") issues.errors.push(message.text());
  });
  page.on("pageerror", (error) => issues.pageErrors.push(error.message));
  return issues;
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

test("home CTA opens the catalog without console errors", async ({
  page,
}, testInfo) => {
  const issues = watchConsole(page);
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
  expect(issues).toEqual({ warnings: [], errors: [], pageErrors: [] });
});

test("filters, paging, popup details, gallery and booking work", async ({
  page,
  context,
}, testInfo) => {
  const issues = watchConsole(page);
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
  await expect(page.getByText("Ukraine, Lviv").first()).toBeVisible();
  await page.getByLabel("Location").fill("Kyiv");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/location=Kyiv/);
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.getByText("Ukraine, Lviv")).toHaveCount(0);
  await page.getByRole("button", { name: "Load More" }).click();
  await expect(page.getByRole("article")).toHaveCount(8);

  const detailIssues: BrowserIssues = {
    warnings: [],
    errors: [],
    pageErrors: [],
  };
  context.once("page", (popup) => watchConsole(popup, detailIssues));
  const popupPromise = context.waitForEvent("page");
  await page.getByRole("link", { name: "Show more" }).first().click();
  const details = await popupPromise;
  await expect(details.locator("html")).toHaveAttribute("lang", "en");
  await expect(details).toHaveTitle("Alpine Roamer S1 | TravelTrucks");
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
  const mainSwiper = details
    .getByRole("region", { name: "Alpine Roamer S1 gallery" })
    .locator(".swiper")
    .first();
  const initialTransform = await mainSwiper
    .locator(".swiper-wrapper")
    .getAttribute("style");
  await expect(mainSwiper.locator(".swiper-slide-active img")).toHaveAttribute(
    "alt",
    "Alpine Roamer S1 — image 1",
  );
  const secondThumbnail = details.getByRole("button", {
    name: "Show Alpine Roamer S1 image 2",
  });
  await secondThumbnail.click();
  await expect(mainSwiper.locator(".swiper-slide-active img")).toHaveAttribute(
    "alt",
    "Alpine Roamer S1 — image 2",
  );
  await expect(mainSwiper.locator(".swiper-slide-active img")).toHaveAttribute(
    "src",
    /road-bear-large/,
  );
  await expect(secondThumbnail.locator("..")).toHaveClass(
    /swiper-slide-thumb-active/,
  );
  await expect
    .poll(() => mainSwiper.locator(".swiper-wrapper").getAttribute("style"))
    .not.toBe(initialTransform);
  await details.getByLabel("Name").fill("Ada Lovelace");
  await details.getByLabel("Email").fill("ada@example.com");
  await details.getByRole("button", { name: "Send" }).click();
  await expect(details.getByRole("status")).toContainText("Booking successful");
  expect(issues).toEqual({ warnings: [], errors: [], pageErrors: [] });
  expect(detailIssues).toEqual({ warnings: [], errors: [], pageErrors: [] });
});
