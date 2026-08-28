"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/Button/Button";
import { createBookingRequest } from "@/lib/api/campers";
import { bookingSchema, type BookingFormValues } from "./booking-schema";
import styles from "./BookingForm.module.css";

interface BookingFormProps {
  camperId: string;
}

const successMessage = "Booking successful";
const errorMessage = "Booking failed. Please try again.";

export function BookingForm({ camperId }: BookingFormProps) {
  const [notification, setNotification] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", email: "" },
  });

  async function submit(values: BookingFormValues) {
    setNotification(null);

    try {
      await createBookingRequest(camperId, {
        name: values.name,
        email: values.email,
      });
      reset();
      setNotification({ kind: "success", message: successMessage });
      toast.success(successMessage);
    } catch {
      setNotification({ kind: "error", message: errorMessage });
      toast.error(errorMessage);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="booking-title">
      <div className={styles.intro}>
        <h2 id="booking-title">Book your campervan now</h2>
        <p>Stay connected! We are always ready to help you.</p>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
        <div className={styles.field}>
          <label htmlFor="booking-name">Name</label>
          <input
            id="booking-name"
            type="text"
            autoComplete="name"
            placeholder="Name*"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "booking-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="booking-name-error" className={styles.error}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="booking-email">Email</label>
          <input
            id="booking-email"
            type="email"
            autoComplete="email"
            placeholder="Email*"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "booking-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="booking-email-error" className={styles.error}>
              {errors.email.message}
            </p>
          )}
        </div>

        <Button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send"}
        </Button>
      </form>

      {notification && (
        <p
          className={styles.notification}
          role={notification.kind === "error" ? "alert" : "status"}
        >
          {notification.message}
        </p>
      )}
    </section>
  );
}
