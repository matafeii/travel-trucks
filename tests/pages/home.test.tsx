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
