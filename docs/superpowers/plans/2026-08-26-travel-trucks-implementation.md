# TravelTrucks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Побудувати готовий до здачі десктопний Next.js-застосунок TravelTrucks, який точно відтворює Figma та реалізує серверну фільтрацію, пагінацію, деталі кемпера, галерею, відгуки й бронювання.

**Architecture:** Next.js App Router відповідає за маршрути, metadata і серверне завантаження деталей. Інтерактивні фільтри, `useInfiniteQuery`, Swiper і форма бронювання ізольовані у клієнтських feature-компонентах; API-контракт і query builder живуть у `lib/api` та не залежать від UI.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, TanStack Query 5, React Hook Form, Zod, Swiper, Sonner, React Icons, Vitest, Testing Library, MSW, Playwright, ESLint, Prettier.

## Global Constraints

- Використовувати Next.js, TypeScript і App Router.
- Каталог зобов'язаний використовувати `useInfiniteQuery`.
- `GET /campers` завжди отримує `perPage=4`; `Load More` додає наступні чотири картки.
- Фільтрація виконується backend-ом через `location`, `form`, `engine`, `transmission`.
- `form`, `engine` і `transmission` допускають лише один активний варіант у кожній групі.
- `Show more` відкриває `/catalog/[camperId]` у новій вкладці.
- Обов'язковий UI scope — десктопна версія, максимально точна до Figma.
- Не вигадувати дані або поля API: бронювання надсилає `{ name, email }`.
- Не завершувати роботу з помилками typecheck, lint, tests, production build або browser console.
- Джерело дизайну: `https://www.figma.com/design/6vTbzaB3EPgOreQz2jOJJe/Campers?node-id=48730-474&p=f`.
- Джерело API: `https://campers-api.goit.study/docs`.

---

## Planned File Map

```text
app/
  catalog/[camperId]/{error,loading,not-found,page}.tsx
  catalog/{error,loading,page}.tsx
  {error,globals,layout,loading,not-found,page}.tsx
  providers.tsx
components/
  Button/
  Container/
  Header/
  Loader/
features/
  booking/BookingForm.tsx
  camper-details/{CamperGallery,CamperOverview,ReviewsList}.tsx
  catalog/{CamperCard,CamperList,CatalogClient,CatalogFilters}.tsx
lib/
  api/{campers,client,query}.ts
  formatters.ts
styles/tokens.css
types/camper.ts
public/images/
tests/
  e2e/travel-trucks.spec.ts
  fixtures/campers.ts
  msw/{handlers,server}.ts
  setup.ts
```

## Task 1: Application Foundation and Test Harness

**Files:**

- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, `styles/tokens.css`
- Create: `tests/setup.ts`, `tests/smoke/providers.test.tsx`
- Modify: `.gitignore`

**Interfaces:**

- Produces: `Providers({ children }: { children: React.ReactNode }): JSX.Element`
- Produces: global CSS variables and the root TanStack Query/Sonner providers used by every later task.

- [ ] **Step 1: Scaffold the App Router project and install runtime/test dependencies**

Run:

```powershell
npx create-next-app@latest . --ts --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-tailwind
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod swiper sonner react-icons clsx
npm install -D prettier vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @playwright/test
```

Expected: `package.json` contains Next.js, React, TanStack Query and the listed test dependencies; `app/` uses App Router.

- [ ] **Step 2: Add test scripts and the failing provider smoke test**

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Create `tests/smoke/providers.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";

describe("Providers", () => {
  it("renders children inside application providers", () => {
    render(
      <Providers>
        <p>TravelTrucks ready</p>
      </Providers>,
    );
    expect(screen.getByText("TravelTrucks ready")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the smoke test and verify the missing provider failure**

Run: `npm test -- tests/smoke/providers.test.tsx`

Expected: FAIL because `@/app/providers` does not exist.

- [ ] **Step 4: Implement test configuration and application providers**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `app/providers.tsx`:

```tsx
"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    },
  });
}

let browserClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
```

Create `app/layout.tsx` with `<html lang="uk">`, global styles, `Providers`, base metadata, and no route-specific content.

- [ ] **Step 5: Add exact global token categories and reset**

Create `styles/tokens.css` with named variables for the values to be extracted from Figma:

```css
:root {
  --color-text: #101828;
  --color-text-muted: #475467;
  --color-border: #dadde1;
  --color-surface: #f7f7f7;
  --color-accent: #e44848;
  --color-accent-hover: #d84343;
  --color-rating: #ffc531;
  --container-width: 1312px;
  --radius-control: 12px;
  --radius-card: 20px;
}
```

Import it before the reset in `app/globals.css`; use `box-sizing: border-box`, remove default body margin, inherit font on controls, and preserve visible `:focus-visible` outlines.

- [ ] **Step 6: Verify foundation and commit**

Run:

```powershell
npm test -- tests/smoke/providers.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

Commit:

```powershell
git add .
git commit -m "chore: scaffold TravelTrucks application"
```

## Task 2: Figma Inventory, Assets, and Shared Shell

**Files:**

- Create: `components/Container/Container.tsx`, `components/Container/Container.module.css`
- Create: `components/Header/Header.tsx`, `components/Header/Header.module.css`
- Create: `components/Button/Button.tsx`, `components/Button/Button.module.css`
- Create: `public/icons/logo.svg`, exact image assets under `public/images/`
- Modify: `styles/tokens.css`, `app/layout.tsx`
- Test: `tests/components/header.test.tsx`

**Interfaces:**

- Produces: `Container`, `Header`, and polymorphism-free `Button`/link styles reused by all pages.
- Consumes: `Providers` and global tokens from Task 1.

- [ ] **Step 1: Load Figma design-to-code guidance and inventory the supplied root node**

Use the `figma-design-to-code` skill before any `get_design_context` call. Query file key `6vTbzaB3EPgOreQz2jOJJe`, node `48730:474`, then enumerate the child frames for Home, Catalog and Camper Details. Record exact frame sizes, fonts, colors, spacing, radii, header dimensions, icons and image nodes in implementation notes.

Expected: every page frame and exportable asset has a concrete Figma node ID; no visual value is estimated while Figma exposes it.

- [ ] **Step 2: Download the original Figma assets**

Use `download_assets` for each page frame identified in Step 1. Save original raster images in their returned formats and SVG vectors as SVG files. Use descriptive lowercase filenames and do not substitute stock imagery.

Expected: `public/images/` and `public/icons/` contain only assets referenced by the three routes.

- [ ] **Step 3: Write the failing Header navigation test**

Create `tests/components/header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/Header/Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/catalog" }));

it("marks Catalog as the current route", () => {
  render(<Header />);
  expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
  );
});
```

- [ ] **Step 4: Run the test and verify failure**

Run: `npm test -- tests/components/header.test.tsx`

Expected: FAIL because `Header` does not exist.

- [ ] **Step 5: Implement the shared shell using measured Figma values**

Implement `Header.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container/Container";
import styles from "./Header.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" aria-label="TravelTrucks home" className={styles.logo}>
          <Image
            src="/icons/logo.svg"
            alt="TravelTrucks"
            width={136}
            height={16}
            priority
          />
        </Link>
        <nav aria-label="Primary navigation" className={styles.nav}>
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
```

Bind exact measurements from Step 1 in the CSS Modules and update token values to match Figma.

- [ ] **Step 6: Verify the shell and commit**

Run: `npm test -- tests/components/header.test.tsx && npm run typecheck && npm run lint`

Expected: all commands exit 0.

Commit: `git add app/layout.tsx components public styles tests/components; git commit -m "feat: add Figma-based application shell"`.

## Task 3: Typed API Client and Query Contract

**Files:**

- Create: `types/camper.ts`
- Create: `lib/api/client.ts`, `lib/api/query.ts`, `lib/api/campers.ts`
- Create: `lib/formatters.ts`
- Test: `tests/lib/query.test.ts`, `tests/lib/campers-api.test.ts`
- Create: `tests/fixtures/campers.ts`, `tests/msw/handlers.ts`, `tests/msw/server.ts`
- Modify: `tests/setup.ts`, `next.config.ts`

**Interfaces:**

- Produces: `CatalogFilters`, `CamperListResponse`, `CamperDetails`, `Review`, `BookingRequest`.
- Produces: `buildCampersSearchParams(filters, page): URLSearchParams`.
- Produces: `getCampers`, `getCamper`, `getCamperReviews`, `createBookingRequest`.

- [ ] **Step 1: Define API types from the OpenAPI schema**

Create discriminated literal unions and response models in `types/camper.ts`:

```ts
export type CamperForm =
  "alcove" | "panel_van" | "integrated" | "semi_integrated";
export type Transmission = "automatic" | "manual";
export type Engine = "diesel" | "petrol" | "hybrid" | "electric";
export type Amenity =
  | "ac"
  | "bathroom"
  | "kitchen"
  | "tv"
  | "radio"
  | "refrigerator"
  | "microwave"
  | "gas"
  | "water";

export interface CatalogFilters {
  location: string;
  form: CamperForm | "";
  transmission: Transmission | "";
  engine: Engine | "";
}

export interface CamperListItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: string;
  form: CamperForm;
  length: string;
  width: string;
  height: string;
  tank: string;
  consumption: string;
  transmission: Transmission;
  engine: Engine;
  amenities: Amenity[];
  coverImage: string;
  totalReviews: number;
}

export interface CamperListResponse {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  campers: CamperListItem[];
}

export interface CamperImage {
  id: string;
  camperId: string;
  thumb: string;
  original: string;
  order: number;
}
export interface CamperDetails {
  id: string;
  name: string;
  price: number;
  rating: number;
  totalReviews: number;
  location: string;
  description: string;
  form: CamperForm;
  length: string;
  width: string;
  height: string;
  tank: string;
  consumption: string;
  transmission: Transmission;
  engine: Engine;
  amenities: Amenity[];
  gallery: CamperImage[];
  createdAt: string;
  updatedAt: string;
}
export interface Review {
  id: string;
  camperId: string;
  reviewer_name: string;
  reviewer_rating: number;
  comment: string;
  createdAt: string;
}
export interface BookingRequest {
  name: string;
  email: string;
}
export interface BookingResponse {
  message: string;
}
```

- [ ] **Step 2: Write query builder tests**

Create `tests/lib/query.test.ts`:

```ts
import { buildCampersSearchParams } from "@/lib/api/query";

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
```

- [ ] **Step 3: Run query tests and verify failure**

Run: `npm test -- tests/lib/query.test.ts`

Expected: FAIL because the query module does not exist.

- [ ] **Step 4: Implement query builder and strict fetch wrapper**

Create `lib/api/query.ts`:

```ts
import type { CatalogFilters } from "@/types/camper";

export function buildCampersSearchParams(
  filters: CatalogFilters,
  page: number,
) {
  const params = new URLSearchParams({ page: String(page), perPage: "4" });
  const location = filters.location.trim();
  if (location) params.set("location", location);
  if (filters.form) params.set("form", filters.form);
  if (filters.engine) params.set("engine", filters.engine);
  if (filters.transmission) params.set("transmission", filters.transmission);
  return params;
}
```

Create `lib/api/client.ts` with `API_BASE_URL`, an `ApiError` carrying `status`, and `apiFetch<T>` that parses JSON and throws for non-2xx responses. Add `next.config.ts` remote image patterns only for the actual API image hosts observed in a real camper response.

- [ ] **Step 5: Implement endpoint functions and MSW contract tests**

Implement these exact exports in `lib/api/campers.ts`:

```ts
export function getCampers(
  filters: CatalogFilters,
  page: number,
  signal?: AbortSignal,
): Promise<CamperListResponse>;
export function getCamper(camperId: string): Promise<CamperDetails>;
export function getCamperReviews(camperId: string): Promise<Review[]>;
export function createBookingRequest(
  camperId: string,
  data: BookingRequest,
): Promise<BookingResponse>;
```

`getCampers` calls `/campers?${buildCampersSearchParams(filters, page)}`. `getCamper` calls `/campers/${encodeURIComponent(camperId)}`. Reviews and booking use the exact documented child routes; booking sends `Content-Type: application/json` and `JSON.stringify(data)`.

Use MSW to assert that a catalog request contains `page=2`, `perPage=4`, and all active filter parameters, and that booking receives exactly `{ name, email }`.

- [ ] **Step 6: Verify API contract and commit**

Run: `npm test -- tests/lib/query.test.ts tests/lib/campers-api.test.ts && npm run typecheck`

Expected: all tests pass and typecheck exits 0.

Commit: `git add types lib tests next.config.ts; git commit -m "feat: add typed campers API client"`.

## Task 4: Pixel-Accurate Home Page

**Files:**

- Modify: `app/page.tsx`
- Create: `app/page.module.css`
- Test: `tests/pages/home.test.tsx`

**Interfaces:**

- Consumes: Figma hero asset, `Container`, header shell and global tokens.
- Produces: accessible `View Now` link to `/catalog`.

- [ ] **Step 1: Write the failing Home page test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the hero CTA linking to the catalog", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Campers of your dreams",
  );
  expect(screen.getByRole("link", { name: "View Now" })).toHaveAttribute(
    "href",
    "/catalog",
  );
});
```

- [ ] **Step 2: Run test and verify failure against scaffold content**

Run: `npm test -- tests/pages/home.test.tsx`

Expected: FAIL because the scaffold page does not contain the TravelTrucks hero.

- [ ] **Step 3: Implement semantic hero markup**

```tsx
import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.content}>
        <h1>Campers of your dreams</h1>
        <p>You can find everything you want in our catalog</p>
        <Link href="/catalog" className={styles.cta}>
          View Now
        </Link>
      </div>
    </main>
  );
}
```

Use the exact hero export, overlay, content position and dimensions measured in Task 2. Preserve the Figma crop with `background-position` and `background-size: cover`.

- [ ] **Step 4: Compare Home at the exact Figma desktop viewport**

Run the dev server and capture `/` at the frame width/height recorded in Task 2. Compare header, hero crop, text baseline, CTA size and vertical offsets to Figma; change only values that differ from the measured design.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/pages/home.test.tsx && npm run lint && npm run typecheck`

Expected: all commands exit 0.

Commit: `git add app/page.tsx app/page.module.css tests/pages/home.test.tsx; git commit -m "feat: build pixel-accurate home page"`.

## Task 5: Catalog Filters and URL State

**Files:**

- Create: `features/catalog/CatalogFilters.tsx`, `features/catalog/CatalogFilters.module.css`
- Create: `features/catalog/filter-schema.ts`, `features/catalog/url-filters.ts`
- Test: `tests/catalog/filters.test.tsx`, `tests/catalog/url-filters.test.ts`

**Interfaces:**

- Produces: `CatalogFilters({ initialFilters, onApply })`.
- Produces: `readFilters(searchParams)` and `writeFilters(filters)`.
- Consumes: `CatalogFilters` type from Task 3.

- [ ] **Step 1: Write failing filter interaction tests**

Test that the form:

```tsx
const onApply = vi.fn();
render(
  <CatalogFilters
    initialFilters={{ location: "", form: "", engine: "", transmission: "" }}
    onApply={onApply}
  />,
);
await user.type(screen.getByLabelText("Location"), "Kyiv");
await user.click(screen.getByRole("radio", { name: "Van" }));
await user.click(screen.getByRole("radio", { name: "Diesel" }));
await user.click(screen.getByRole("button", { name: "Search" }));
expect(onApply).toHaveBeenCalledWith({
  location: "Kyiv",
  form: "panel_van",
  engine: "diesel",
  transmission: "",
});
```

Also assert that selecting `Automatic` then `Manual` leaves only `Manual` checked.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- tests/catalog/filters.test.tsx tests/catalog/url-filters.test.ts`

Expected: FAIL because filter modules do not exist.

- [ ] **Step 3: Implement Zod schema and URL serialization**

Use `z.enum(['alcove', 'panel_van', 'integrated', 'semi_integrated']).or(z.literal(''))` for `form`, `z.enum(['diesel', 'petrol', 'hybrid', 'electric']).or(z.literal(''))` for `engine`, `z.enum(['automatic', 'manual']).or(z.literal(''))` for `transmission`, and `z.string().trim()` for location. `readFilters` must reject unknown URL values to `''`; `writeFilters` must omit empty values.

- [ ] **Step 4: Implement accessible single-choice controls**

Use native radio inputs grouped by `name`, visually styled labels, and visible checked/focus states. Keep the exact Figma option order and icon mapping. Submit through React Hook Form's `handleSubmit`; do not trigger network requests while the user merely changes a control.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/catalog/filters.test.tsx tests/catalog/url-filters.test.ts && npm run typecheck`

Expected: all tests pass.

Commit: `git add features/catalog tests/catalog; git commit -m "feat: add catalog filter controls"`.

## Task 6: Infinite Catalog, Camper Cards, and Load More

**Files:**

- Modify: `app/catalog/page.tsx`
- Create: `app/catalog/page.module.css`
- Create: `features/catalog/CatalogClient.tsx`, `features/catalog/CatalogClient.module.css`
- Create: `features/catalog/CamperList.tsx`, `features/catalog/CamperCard.tsx`, corresponding CSS Modules
- Create: `components/Loader/Loader.tsx`, `components/Loader/Loader.module.css`
- Test: `tests/catalog/catalog-client.test.tsx`, `tests/catalog/camper-card.test.tsx`

**Interfaces:**

- Consumes: `getCampers`, `CatalogFilters`, URL helpers and `CamperListItem`.
- Produces: route `/catalog` with four-item backend pages and `Show more` links.

- [ ] **Step 1: Write failing infinite-query behavior tests**

Use MSW with page 1 and page 2 fixtures. Assert:

```tsx
expect(await screen.findAllByRole("article")).toHaveLength(4);
await user.click(screen.getByRole("button", { name: "Load More" }));
expect(await screen.findAllByRole("article")).toHaveLength(8);
expect(
  screen.queryByRole("button", { name: "Load More" }),
).not.toBeInTheDocument();
```

Submit a new filter and assert that only the new filtered first page remains, proving the query key resets pagination.

- [ ] **Step 2: Write failing card-link test**

Render a fixture card and assert:

```tsx
const link = screen.getByRole("link", { name: "Show more" });
expect(link).toHaveAttribute("href", `/catalog/${camper.id}`);
expect(link).toHaveAttribute("target", "_blank");
expect(link).toHaveAttribute("rel", "noopener noreferrer");
```

- [ ] **Step 3: Run catalog tests and verify failure**

Run: `npm test -- tests/catalog/catalog-client.test.tsx tests/catalog/camper-card.test.tsx`

Expected: FAIL because catalog components do not exist.

- [ ] **Step 4: Implement `useInfiniteQuery` with filter-aware key**

Core hook configuration in `CatalogClient.tsx`:

```tsx
const query = useInfiniteQuery({
  queryKey: ["campers", filters],
  queryFn: ({ pageParam, signal }) => getCampers(filters, pageParam, signal),
  initialPageParam: 1,
  getNextPageParam: (lastPage) =>
    lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
});

const campers = query.data?.pages.flatMap((page) => page.campers) ?? [];
```

On apply, update local filters and call `router.replace()` with serialized filters. Render distinct initial pending, error, empty and fetching-next-page states. Disable `Load More` only while its request is active and hide it when `hasNextPage` is false.

- [ ] **Step 5: Implement exact Figma cards**

Use `<article>`, Next Image with the API cover image, formatted `€{price.toFixed(2)}`, location/rating rows, description/features exposed by the list schema, and the exact Figma truncation. Every item uses `camper.id` as React key.

- [ ] **Step 6: Verify backend requests and visual layout**

In a real browser, apply each filter independently and in combination. Confirm request URLs contain the selected query parameters and every Load More request keeps them with `page + 1` and `perPage=4`.

- [ ] **Step 7: Verify and commit**

Run: `npm test -- tests/catalog && npm run typecheck && npm run lint`

Expected: all commands exit 0.

Commit: `git add app/catalog features/catalog components/Loader tests/catalog; git commit -m "feat: add filtered infinite camper catalog"`.

## Task 7: Camper Details Route and Dynamic Metadata

**Files:**

- Create: `app/catalog/[camperId]/page.tsx`, `app/catalog/[camperId]/page.module.css`
- Create: `features/camper-details/CamperOverview.tsx`, corresponding CSS Module
- Test: `tests/details/details-page.test.tsx`, `tests/details/metadata.test.ts`

**Interfaces:**

- Consumes: `getCamper(id)` and `CamperDetails`.
- Produces: server route using `params: Promise<{ camperId: string }>` and dynamic metadata.

- [ ] **Step 1: Write failing details and metadata tests**

Mock `getCamper` and assert that the page renders the camper name, formatted price, location, rating and description. Assert `generateMetadata({ params: Promise.resolve({ camperId: 'camper-1' }) })` returns a title containing the camper name.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- tests/details/details-page.test.tsx tests/details/metadata.test.ts`

Expected: FAIL because the dynamic route does not exist.

- [ ] **Step 3: Implement async route and metadata**

Use current Next.js async params:

```tsx
export async function generateMetadata({
  params,
}: PageProps<"/catalog/[camperId]">): Promise<Metadata> {
  const { camperId } = await params;
  const camper = await getCamper(camperId);
  return {
    title: `${camper.name} | TravelTrucks`,
    description: camper.description.slice(0, 155),
  };
}

export default async function CamperPage({
  params,
}: PageProps<"/catalog/[camperId]">) {
  const { camperId } = await params;
  const camper = await getCamper(camperId);
  return (
    <main>
      <CamperOverview camper={camper} />
    </main>
  );
}
```

Map API 404 to `notFound()` inside `getCamper` consumption; rethrow other failures so `error.tsx` handles them.

- [ ] **Step 4: Match the details heading and information grid to Figma**

Use the exact page frame measurements, content order and typography from Task 2. Do not expose list-only labels or invented characteristics.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/details/details-page.test.tsx tests/details/metadata.test.ts && npm run typecheck`

Expected: all tests pass.

Commit: `git add app/catalog/[camperId] features/camper-details tests/details; git commit -m "feat: add camper details route"`.

## Task 8: Gallery and Reviews

**Files:**

- Create: `features/camper-details/CamperGallery.tsx`, `features/camper-details/CamperGallery.module.css`
- Create: `features/camper-details/ReviewsList.tsx`, `features/camper-details/ReviewsList.module.css`
- Create: `components/RatingStars/RatingStars.tsx`, corresponding CSS Module
- Modify: `app/catalog/[camperId]/page.tsx`
- Test: `tests/details/gallery.test.tsx`, `tests/details/reviews.test.tsx`

**Interfaces:**

- Consumes: `CamperImage[]` from `camper.gallery`, `Review[]`, `getCamperReviews(camperId)`.
- Produces: keyboard-operable Swiper gallery and five-star review rendering.

- [ ] **Step 1: Write failing five-star test**

```tsx
render(<RatingStars rating={3} />);
const stars = screen.getAllByTestId("rating-star");
expect(stars).toHaveLength(5);
expect(stars.filter((star) => star.dataset.active === "true")).toHaveLength(3);
expect(screen.getByLabelText("3 out of 5 stars")).toBeInTheDocument();
```

- [ ] **Step 2: Write failing gallery test**

Render three gallery records and assert three accessible slide images use `image.original` with alt text `${camperName} — image ${index + 1}`. Mock Swiper CSS and components only at the library boundary.

- [ ] **Step 3: Run tests and verify failure**

Run: `npm test -- tests/details/gallery.test.tsx tests/details/reviews.test.tsx`

Expected: FAIL because gallery/review components do not exist.

- [ ] **Step 4: Implement Swiper and rating components**

Import only required Swiper modules/styles. Use `original` for main slides and `thumb` for thumbnail controls. Preserve Figma thumbnail/slide sizes and crop with `object-fit: cover`. `RatingStars` renders exactly five icons and includes a single readable `aria-label`; decorative icons use `aria-hidden`.

- [ ] **Step 5: Fetch and render reviews on the details route**

Fetch details and reviews concurrently with `Promise.all([getCamper(camperId), getCamperReviews(camperId)])`. Render reviewer initial/avatar from `reviewer_name`, rating from `reviewer_rating`, and comment in API order. Render a neutral empty message only when the returned array is empty.

- [ ] **Step 6: Verify interaction and commit**

Run: `npm test -- tests/details/gallery.test.tsx tests/details/reviews.test.tsx && npm run typecheck`

Expected: all tests pass.

Commit: `git add app/catalog/[camperId] features/camper-details components/RatingStars tests/details; git commit -m "feat: add camper gallery and reviews"`.

## Task 9: Booking Form and Notifications

**Files:**

- Create: `features/booking/BookingForm.tsx`, `features/booking/BookingForm.module.css`, `features/booking/booking-schema.ts`
- Modify: `app/catalog/[camperId]/page.tsx`
- Test: `tests/booking/booking-form.test.tsx`

**Interfaces:**

- Consumes: `createBookingRequest(camperId, { name, email })`.
- Produces: validated form, 201 success notification, reset, pending/error states.

- [ ] **Step 1: Write failing validation and submission tests**

Assert that empty submit shows required messages without API call. Then:

```tsx
await user.type(screen.getByLabelText("Name"), "Tymo");
await user.type(screen.getByLabelText("Email"), "tymo@example.com");
await user.click(screen.getByRole("button", { name: "Send" }));
await waitFor(() =>
  expect(createBookingRequest).toHaveBeenCalledWith("camper-1", {
    name: "Tymo",
    email: "tymo@example.com",
  }),
);
expect(toast.success).toHaveBeenCalledWith("Booking successful");
expect(screen.getByLabelText("Name")).toHaveValue("");
```

Also reject `tymo@` and verify a 500 response keeps entered values and calls `toast.error`.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- tests/booking/booking-form.test.tsx`

Expected: FAIL because booking components do not exist.

- [ ] **Step 3: Implement strict schema and form**

Create schema:

```ts
export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").max(254),
});
```

Use `useForm<BookingRequest>({ resolver: zodResolver(bookingSchema), defaultValues: { name: '', email: '' } })`. Submit only schema fields. Disable inputs/button while `isSubmitting`; show inline field errors and preserve values on catch.

- [ ] **Step 4: Match booking panel to Figma**

Apply exact panel width, border, radius, padding, typography, control height and button placement measured in Task 2. Use actual Figma copy for heading, supporting text, labels/placeholders and submit button.

- [ ] **Step 5: Verify against real endpoint and commit**

Create one clearly identified manual test booking with non-sensitive test data only after confirming the endpoint is intended for test traffic. Confirm the request body contains exactly `name` and `email`, response is 201, toast appears once, and the form resets.

Run: `npm test -- tests/booking/booking-form.test.tsx && npm run typecheck && npm run lint`

Expected: all automated checks pass.

Commit: `git add app/catalog/[camperId] features/booking tests/booking; git commit -m "feat: add camper booking flow"`.

## Task 10: Route States, E2E Coverage, Visual QA, and Handoff

**Files:**

- Create: `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Create: `app/catalog/loading.tsx`, `app/catalog/error.tsx`
- Create: `app/catalog/[camperId]/loading.tsx`, `app/catalog/[camperId]/error.tsx`, `app/catalog/[camperId]/not-found.tsx`
- Create: `tests/e2e/travel-trucks.spec.ts`
- Create: `README.md`, `.env.example`
- Modify: `app/layout.tsx`, route metadata, `.gitignore`

**Interfaces:**

- Consumes: all completed routes and features.
- Produces: complete scoring-criteria coverage and deploy-ready repository.

- [ ] **Step 1: Add failing Playwright journeys**

Create tests that:

```ts
test("home CTA opens the catalog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "View Now" }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole("article")).toHaveCount(4);
});

test("filters and Load More use backend paging", async ({ page }) => {
  await page.goto("/catalog");
  await page.getByLabel("Location").fill("Kyiv");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/location=Kyiv/);
  await page.getByRole("button", { name: "Load More" }).click();
  await expect(page.getByRole("article")).toHaveCount(8);
});
```

Add a popup assertion for `Show more`, details content, gallery movement and a mocked successful booking response. Attach a console listener that fails on `console.error` and uncaught page errors.

- [ ] **Step 2: Run E2E and verify missing-state failures**

Run: `npm run test:e2e`

Expected: at least the state/visual journeys fail before final route states and selectors are completed.

- [ ] **Step 3: Implement route-level loading, error and not-found UI**

Every `error.tsx` is a client component accepting `{ error, reset }`, logs no error during normal rendering, displays a concise message and a `Try again` button calling `reset`. Loading UI uses the shared Loader/Skeleton without layout shift. Not-found pages link back to `/catalog`.

- [ ] **Step 4: Complete metadata and semantic/accessibility audit**

Verify one `<h1>` per route, ordered subheadings, landmarks, labels, alt text, `aria-current`, keyboard focus and no nested interactive controls. Ensure root metadata has title template, description, application name, icons and Open Graph values; details metadata remains dynamic.

- [ ] **Step 5: Write README and environment guidance**

README sections: Overview, Features, Routes, Tech Stack, API, Installation, Development, Tests, Production Build, Deployment, Author. Commands must be copy-pasteable. `.env.example` contains only optional public configuration names with safe example values and no credentials.

- [ ] **Step 6: Run the full automated gate**

Run:

```powershell
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: every command exits 0; production build lists `/`, `/catalog`, and `/catalog/[camperId]`; browser console listener reports no errors.

- [ ] **Step 7: Perform three-route visual comparison**

At the exact desktop viewport from Figma, capture Home, Catalog first page, Catalog filtered/loading states, and Camper Details. Compare against Figma for geometry, typography, colors, borders, image crops and control states. Correct every measurable mismatch, then rerun Step 6.

- [ ] **Step 8: Audit repository cleanliness**

Run:

```powershell
git status --short
git ls-files | rg "(^|/)(\.env$|node_modules|\.next|playwright-report|test-results)(/|$)"
```

Expected: first command shows only intended final changes; second command returns no tracked secret/build/test-output paths.

- [ ] **Step 9: Commit verified application**

```powershell
git add .
git commit -m "test: verify production-ready TravelTrucks app"
```

- [ ] **Step 10: Deploy only with explicit user authorization**

After the user selects Vercel or Netlify and authorizes account/repository actions, deploy the verified production build, set only documented environment values, open the public URL, and repeat the core Playwright smoke journey against production. Add repository and deployed URLs to README in a final documentation commit.
