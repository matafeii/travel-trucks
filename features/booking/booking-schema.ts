import { z } from "zod";

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .max(80, "Enter no more than 80 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Enter no more than 254 characters"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
