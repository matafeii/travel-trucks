"use client";

import { Button } from "@/components/Button/Button";
import styles from "../../route-state.module.css";

export default function DetailsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.state}>
      <div className={styles.content}>
        <h1>Camper unavailable</h1>
        <p>We could not load this camper.</p>
        <Button className={styles.action} type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
