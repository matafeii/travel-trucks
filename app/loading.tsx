import { Loader } from "@/components/Loader/Loader";
import styles from "./route-state.module.css";

export default function RootLoading() {
  return (
    <main className={styles.state}>
      <Loader label="Loading TravelTrucks" />
    </main>
  );
}
