import Link from "next/link";
import { buttonClassNames } from "@/components/Button/Button";
import { Container } from "@/components/Container/Container";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <Container className={styles.content}>
        <div className={styles.copy}>
          <h1>Campers of your dreams</h1>
          <p>You can find everything you want in our catalog</p>
        </div>
        <Link
          href="/catalog"
          className={`${buttonClassNames.primary} ${styles.cta}`}
        >
          View Now
        </Link>
      </Container>
    </main>
  );
}
