import { Container } from '@/components/Container/Container';
import { CatalogClient } from '@/features/catalog/CatalogClient';
import { readFilters } from '@/features/catalog/url-filters';
import styles from './page.module.css';

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const rawParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === 'string') params.set(key, value);
  }

  return (
    <main className={styles.main}>
      <Container>
        <CatalogClient initialFilters={readFilters(params)} />
      </Container>
    </main>
  );
}
