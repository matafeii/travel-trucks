import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";

vi.mock("next/font/google", () => ({ Inter: () => ({ className: "inter" }) }));

import RootLayout from "@/app/layout";

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

it("declares English as the document language", () => {
  const layout = RootLayout({ children: <p>TravelTrucks ready</p> });
  expect(layout.props.lang).toBe("en");
});
