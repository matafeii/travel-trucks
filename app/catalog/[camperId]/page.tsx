import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container/Container';
import { CamperOverview } from '@/features/camper-details/CamperOverview';
import { getCamper, getCamperReviews } from '@/lib/api/campers';
import { ApiError } from '@/lib/api/client';
import type { CamperDetails } from '@/types/camper';
import styles from './page.module.css';

interface CamperPageProps {
  params: Promise<{ camperId: string }>;
}

const missingCamperMetadata: Metadata = {
  title: 'Camper not found | TravelTrucks',
  description: 'The requested camper could not be found.',
};

function isApiNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

async function getCamperOrNotFound(camperId: string): Promise<CamperDetails> {
  try {
    return await getCamper(camperId);
  } catch (error) {
    if (isApiNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: CamperPageProps): Promise<Metadata> {
  const { camperId } = await params;

  try {
    const camper = await getCamper(camperId);
    return {
      title: `${camper.name} | TravelTrucks`,
      description: camper.description.slice(0, 155),
    };
  } catch (error) {
    if (isApiNotFound(error)) {
      return missingCamperMetadata;
    }
    throw error;
  }
}

export default async function CamperPage({
  params,
}: CamperPageProps) {
  const { camperId } = await params;
  const [camper, reviews] = await Promise.all([
    getCamperOrNotFound(camperId),
    getCamperReviews(camperId),
  ]);

  return (
    <main className={styles.main}>
      <Container>
        <CamperOverview camper={camper} reviews={reviews} />
      </Container>
    </main>
  );
}
