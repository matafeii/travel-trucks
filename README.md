# TravelTrucks

## Overview

TravelTrucks is a desktop-first camper rental application built from the supplied Figma design. Visitors can browse API-backed campers, narrow the catalog with server-side filters, open a camper in a separate tab, inspect its gallery and reviews, and send a booking request.

## Features

- Figma-matched home, catalog, and camper-details pages
- Backend filtering by location, camper form, engine, and transmission
- Four-item infinite pagination through a **Load More** control
- Details links that open in a new browser tab
- Keyboard-operable Swiper gallery and five-star review ratings
- Validated booking form with success and error notifications
- Route-level loading, error, and not-found states
- Unit, integration, and Playwright end-to-end coverage

## Routes

- `/` — home banner and catalog call to action
- `/catalog` — filterable and paginated camper catalog
- `/catalog/[camperId]` — camper details, gallery, reviews, and booking form

## Tech Stack

Next.js 16 App Router, React 19, TypeScript, CSS Modules, TanStack Query, React Hook Form, Zod, Swiper, Sonner, Vitest, Testing Library, MSW, and Playwright.

## API

The application uses the [TravelTrucks API](https://campers-api.goit.study/docs). Catalog requests always send `perPage=4`; booking requests send only `name` and `email`.

## Installation

Requirements: Node.js 20.9 or newer and npm.

```bash
git clone <repository-url>
cd travel-trucks
npm install
npx playwright install chromium
```

No secret is required. To override the public API origin, copy `.env.example` to `.env.local` and change its safe public value.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm test
npm run test:e2e
npm run lint
npm run typecheck
npm run format:check
```

The Playwright suite starts its own local server and mocks booking creation, so it never creates a real external booking.

## Production Build

```bash
npm run build
npm run start
```

## Deployment

Import the repository into Vercel or Netlify, use `npm run build`, and keep the default API URL or provide the optional value documented in `.env.example`. Deployment URLs are added only after an authorized deployment.

## Author

Kit_Kat
