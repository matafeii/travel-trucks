"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/Button/Button";
import { Loader } from "@/components/Loader/Loader";
import { getCampers } from "@/lib/api/campers";
import type { CatalogFilters as CatalogFilterValues } from "@/types/camper";
import { CamperList } from "./CamperList";
import { CatalogFilters } from "./CatalogFilters";
import { readFilters, writeFilters } from "./url-filters";
import styles from "./CatalogClient.module.css";

interface CatalogClientProps {
  initialFilters: CatalogFilterValues;
}

const emptyFilters: CatalogFilterValues = {
  location: "",
  form: "",
  engine: "",
  transmission: "",
};

function normalizeFilters(filters: CatalogFilterValues): CatalogFilterValues {
  return readFilters(writeFilters(filters));
}

export function CatalogClient({ initialFilters }: CatalogClientProps) {
  const router = useRouter();
  const initialFilterKey = writeFilters(initialFilters).toString();
  const previousInitialFilterKey = useRef(initialFilterKey);
  const [filters, setFilters] = useState(() =>
    normalizeFilters(initialFilters),
  );
  const [searchRevision, setSearchRevision] = useState(0);
  const query = useInfiniteQuery({
    queryKey: ["campers", filters, searchRevision],
    queryFn: ({ pageParam, signal }) => getCampers(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const campers = query.data?.pages.flatMap((page) => page.campers) ?? [];

  useEffect(() => {
    if (previousInitialFilterKey.current === initialFilterKey) return;

    previousInitialFilterKey.current = initialFilterKey;
    setFilters(readFilters(new URLSearchParams(initialFilterKey)));
    setSearchRevision((revision) => revision + 1);
  }, [initialFilterKey]);

  function applyFilters(nextFilters: CatalogFilterValues) {
    const normalizedFilters = normalizeFilters(nextFilters);
    const params = writeFilters(normalizedFilters);

    previousInitialFilterKey.current = params.toString();
    setFilters(normalizedFilters);
    setSearchRevision((revision) => revision + 1);
    router.replace(params.size ? `/catalog?${params.toString()}` : "/catalog");
  }

  return (
    <div className={styles.layout}>
      <CatalogFilters initialFilters={filters} onApply={applyFilters} />

      <section aria-labelledby="catalog-title" className={styles.results}>
        <h1 className={styles.srOnly} id="catalog-title">
          Camper catalog
        </h1>

        {query.isPending ? <Loader /> : null}
        {query.isError && campers.length === 0 ? (
          <div className={styles.errorState}>
            <p className={styles.errorMessage} role="alert">
              {query.error.message || "Unable to load campers."}
            </p>
            <Button
              disabled={query.isRefetching}
              type="button"
              variant="secondary"
              onClick={() => query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}
        {query.isSuccess && campers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyCopy}>
              <h2>No campers found</h2>
              <p>Try changing or clearing your filters to find a camper.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => applyFilters(emptyFilters)}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
        {campers.length > 0 ? <CamperList campers={campers} /> : null}

        {query.isFetchNextPageError && campers.length > 0 ? (
          <div className={`${styles.errorState} ${styles.nextPageError}`}>
            <p className={styles.errorMessage} role="alert">
              Unable to load more campers. {query.error.message}
            </p>
            <Button
              disabled={query.isFetchingNextPage}
              type="button"
              variant="secondary"
              onClick={() => query.fetchNextPage()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {query.hasNextPage && !query.isFetchNextPageError ? (
          <div className={styles.loadMore}>
            <Button
              disabled={query.isFetchingNextPage}
              type="button"
              variant="secondary"
              onClick={() => query.fetchNextPage()}
            >
              Load More
            </Button>
            {query.isFetchingNextPage ? (
              <Loader compact label="Loading more campers" />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
