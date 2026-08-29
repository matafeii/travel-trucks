import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogFilters } from "@/features/catalog/CatalogFilters";
import type { CatalogFilters as CatalogFilterValues } from "@/types/camper";

const emptyFilters: CatalogFilterValues = {
  location: "",
  form: "",
  engine: "",
  transmission: "",
};

it("applies the selected filters only when Search is submitted", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();

  render(<CatalogFilters initialFilters={emptyFilters} onApply={onApply} />);

  await user.type(screen.getByLabelText("Location"), "Kyiv");
  await user.click(screen.getByRole("radio", { name: "Panel Van" }));
  await user.click(screen.getByRole("radio", { name: "Diesel" }));

  expect(onApply).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(onApply).toHaveBeenCalledOnce();
  expect(onApply).toHaveBeenCalledWith({
    location: "Kyiv",
    form: "panel_van",
    engine: "diesel",
    transmission: "",
  });
});

it("keeps transmission choices mutually exclusive", async () => {
  const user = userEvent.setup();

  render(<CatalogFilters initialFilters={emptyFilters} onApply={vi.fn()} />);

  const automatic = screen.getByRole("radio", { name: "Automatic" });
  const manual = screen.getByRole("radio", { name: "Manual" });

  await user.click(automatic);
  expect(automatic).toBeChecked();
  expect(manual).not.toBeChecked();

  await user.click(manual);
  expect(automatic).not.toBeChecked();
  expect(manual).toBeChecked();
});

it("clears the form without applying filters", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();

  render(
    <CatalogFilters
      initialFilters={{
        location: "Kyiv",
        form: "alcove",
        engine: "petrol",
        transmission: "automatic",
      }}
      onApply={onApply}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Clear filters" }));

  expect(screen.getByLabelText("Location")).toHaveValue("");
  expect(screen.getByRole("radio", { name: "Alcove" })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "Petrol" })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "Automatic" })).not.toBeChecked();
  expect(onApply).not.toHaveBeenCalled();
});

it("resets every control when URL-derived initial filters change", async () => {
  const onApply = vi.fn();
  const { rerender } = render(
    <CatalogFilters
      initialFilters={{
        location: "Kyiv",
        form: "alcove",
        engine: "diesel",
        transmission: "automatic",
      }}
      onApply={onApply}
    />,
  );

  expect(screen.getByLabelText("Location")).toHaveValue("Kyiv");
  expect(screen.getByRole("radio", { name: "Alcove" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Diesel" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Automatic" })).toBeChecked();

  rerender(<CatalogFilters initialFilters={emptyFilters} onApply={onApply} />);

  await waitFor(() =>
    expect(screen.getByLabelText("Location")).toHaveValue(""),
  );
  expect(screen.getByRole("radio", { name: "Alcove" })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "Diesel" })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: "Automatic" })).not.toBeChecked();
  expect(onApply).not.toHaveBeenCalled();
});
