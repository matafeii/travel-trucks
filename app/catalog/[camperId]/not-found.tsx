import Link from "next/link";
import { buttonClassNames } from "@/components/Button/Button";
import styles from "../../route-state.module.css";

export default function DetailsNotFound() {
  return (
    <main className={styles.state}>
      <div className={styles.content}>
        <h1>Camper not found</h1>
        <p>The requested camper is no longer available.</p>
        <Link
          className={`${buttonClassNames.primary} ${styles.action}`}
          href="/catalog"
        >
          Back to catalog
        </Link>
      </div>
    </main>
  );
}
