import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { CamperCard } from "@/features/catalog/CamperCard";
import { campersResponse } from "@/tests/fixtures/campers";

it("links a camper card to a safe new details tab", () => {
  const camper = campersResponse.campers[0];

  render(<CamperCard camper={camper} />);

  expect(screen.getByRole("article")).toBeInTheDocument();
  expect(screen.getByText("€8000")).toBeInTheDocument();
  expect(screen.queryByText("€8000.00")).not.toBeInTheDocument();
  expect(screen.getByText("Automatic")).toBeInTheDocument();
  expect(screen.getByText("Diesel")).toBeInTheDocument();
  expect(screen.getByText("A compact camper for two.")).toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: "Travel Truck camper" }),
  ).toHaveAttribute("loading", "eager");

  const link = screen.getByRole("link", { name: "Show more" });
  expect(link).toHaveAttribute("href", `/catalog/${camper.id}`);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

it("uses the Figma surface and never clips equipment badges", () => {
  const css = readFileSync(
    resolve(process.cwd(), "features/catalog/CamperCard.module.css"),
    "utf8",
  );

  expect(css).toMatch(
    /\.card\s*{[\s\S]*?background:\s*var\(--color-surface\);/,
  );
  const featuresRule = css.match(/\.features\s*{([\s\S]*?)\}/)?.[1] ?? "";
  expect(featuresRule).not.toMatch(/max-height|overflow:\s*hidden/);
});
