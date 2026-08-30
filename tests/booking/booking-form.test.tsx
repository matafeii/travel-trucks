import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "@/features/booking/BookingForm";

const { createBookingRequestMock, successMock, errorMock } = vi.hoisted(() => ({
  createBookingRequestMock: vi.fn(),
  successMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock("@/lib/api/campers", () => ({
  createBookingRequest: createBookingRequestMock,
}));

vi.mock("sonner", () => ({
  toast: { success: successMock, error: errorMock },
}));

beforeEach(() => {
  createBookingRequestMock.mockReset();
  successMock.mockReset();
  errorMock.mockReset();
});

it("keeps the exact 44px Figma panel padding", () => {
  const css = readFileSync(
    resolve(process.cwd(), "features/booking/BookingForm.module.css"),
    "utf8",
  );

  expect(css).toMatch(/\.panel\s*{[\s\S]*?padding:\s*44px;/);
  expect(css).toMatch(/\.submit\s*{[\s\S]*?width:\s*100%;/);
  expect(css).toMatch(
    /input\[aria-invalid="true"\]\s*{[\s\S]*?background:\s*var\(--color-error-light\);/,
  );
});

it("shows required errors and does not submit an empty form", async () => {
  const user = userEvent.setup();
  render(<BookingForm camperId="camper-1" />);

  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(
    await screen.findByText("Enter at least 2 characters"),
  ).toBeInTheDocument();
  expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  expect(createBookingRequestMock).not.toHaveBeenCalled();
});

it("rejects a malformed email without calling the API", async () => {
  const user = userEvent.setup();
  render(<BookingForm camperId="camper-1" />);

  await user.type(screen.getByLabelText("Name"), "Tymo");
  await user.type(screen.getByLabelText("Email"), "tymo@");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(
    await screen.findByText("Enter a valid email address"),
  ).toBeInTheDocument();
  expect(createBookingRequestMock).not.toHaveBeenCalled();
});

it("submits only trimmed name and email, announces success, and resets", async () => {
  const user = userEvent.setup();
  createBookingRequestMock.mockResolvedValue({ message: "Booking created" });
  render(<BookingForm camperId="camper-1" />);

  await user.type(screen.getByLabelText("Name"), "  Tymo  ");
  await user.type(screen.getByLabelText("Email"), "  tymo@example.com  ");
  await user.click(screen.getByRole("button", { name: "Send" }));

  await waitFor(() =>
    expect(createBookingRequestMock).toHaveBeenCalledWith("camper-1", {
      name: "Tymo",
      email: "tymo@example.com",
    }),
  );
  expect(successMock).toHaveBeenCalledOnce();
  expect(successMock).toHaveBeenCalledWith("Booking successful");
  expect(await screen.findByText("Booking successful")).toHaveAttribute(
    "role",
    "status",
  );
  expect(screen.getByLabelText("Name")).toHaveValue("");
  expect(screen.getByLabelText("Email")).toHaveValue("");
});

it("disables the controls and shows a pending label while submitting", async () => {
  const user = userEvent.setup();
  let resolveRequest: (value: { message: string }) => void = () => undefined;
  createBookingRequestMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  );
  render(<BookingForm camperId="camper-1" />);

  await user.type(screen.getByLabelText("Name"), "Tymo");
  await user.type(screen.getByLabelText("Email"), "tymo@example.com");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(
    await screen.findByRole("button", { name: "Sending…" }),
  ).toBeDisabled();
  expect(screen.getByLabelText("Name")).toBeDisabled();
  expect(screen.getByLabelText("Email")).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Sending…" }));
  expect(createBookingRequestMock).toHaveBeenCalledTimes(1);

  resolveRequest({ message: "Booking created" });
  await screen.findByRole("button", { name: "Send" });
});

it("keeps entered values and announces an error when submission fails", async () => {
  const user = userEvent.setup();
  createBookingRequestMock.mockRejectedValue(new Error("Server error"));
  render(<BookingForm camperId="camper-1" />);

  await user.type(screen.getByLabelText("Name"), "Tymo");
  await user.type(screen.getByLabelText("Email"), "tymo@example.com");
  await user.click(screen.getByRole("button", { name: "Send" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Booking failed. Please try again.",
  );
  expect(errorMock).toHaveBeenCalledOnce();
  expect(errorMock).toHaveBeenCalledWith("Booking failed. Please try again.");
  expect(screen.getByLabelText("Name")).toHaveValue("Tymo");
  expect(screen.getByLabelText("Email")).toHaveValue("tymo@example.com");
});
