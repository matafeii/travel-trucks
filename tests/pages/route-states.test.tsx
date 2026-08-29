import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RootError from "@/app/error";
import RootLoading from "@/app/loading";
import RootNotFound from "@/app/not-found";
import CatalogError from "@/app/catalog/error";
import CatalogLoading from "@/app/catalog/loading";
import DetailsError from "@/app/catalog/[camperId]/error";
import DetailsLoading from "@/app/catalog/[camperId]/loading";
import DetailsNotFound from "@/app/catalog/[camperId]/not-found";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));

describe("route states", () => {
  it.each([
    ["root", RootLoading, "Loading TravelTrucks"],
    ["catalog", CatalogLoading, "Loading camper catalog"],
    ["details", DetailsLoading, "Loading camper details"],
  ])("renders an accessible %s loading state", (_name, State, label) => {
    render(<State />);
    expect(screen.getByRole("status")).toHaveTextContent(label);
  });

  it.each([
    ["root", RootError],
    ["catalog", CatalogError],
    ["details", DetailsError],
  ])("lets the user retry the %s error boundary", async (_name, Boundary) => {
    const reset = vi.fn();
    render(<Boundary error={new Error("boom")} reset={reset} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it.each([RootNotFound, DetailsNotFound])(
    "links missing routes back to the catalog",
    (State) => {
      render(<State />);
      expect(
        screen.getByRole("link", { name: "Back to catalog" }),
      ).toHaveAttribute("href", "/catalog");
    },
  );
});
