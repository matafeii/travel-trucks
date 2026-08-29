import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container/Container";
import { CamperOverview } from "@/features/camper-details/CamperOverview";
import { getCamper, getCamperReviews } from "@/lib/api/campers";
import { ApiError } from "@/lib/api/client";
import styles from "./page.module.css";

interface CamperPageProps {
  params: Promise<{ camperId: string }>;
}

const missingCamperMetadata: Metadata = {
  title: "Camper not found",
  description: "The requested camper could not be found.",
};

function isApiNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export async function generateMetadata({
  params,
}: CamperPageProps): Promise<Metadata> {
  const { camperId } = await params;

  try {
    const camper = await getCamper(camperId);
    return {
      title: camper.name,
      description: camper.description.slice(0, 155),
    };
  } catch (error) {
    if (isApiNotFound(error)) {
      return missingCamperMetadata;
    }
    throw error;
  }
}

export default async function CamperPage({ params }: CamperPageProps) {
  const { camperId } = await params;
  const [camperResult, reviewsResult] = await Promise.allSettled([
    getCamper(camperId),
    getCamperReviews(camperId),
  ]);

  if (camperResult.status === "rejected") {
    if (isApiNotFound(camperResult.reason)) notFound();
    throw camperResult.reason;
  }

  if (reviewsResult.status === "rejected") throw reviewsResult.reason;

  return (
    <main className={styles.main}>
      <Container>
        <CamperOverview
          camper={camperResult.value}
          reviews={reviewsResult.value}
        />
      </Container>
    </main>
  );
}
