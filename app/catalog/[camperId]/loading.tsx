import { Loader } from "@/components/Loader/Loader";
import styles from "../../route-state.module.css";

export default function DetailsLoading() {
  return (
    <main className={styles.state}>
      <Loader label="Loading camper details" />
    </main>
  );
}
