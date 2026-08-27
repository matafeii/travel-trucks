'use client';

import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button/Button';
import type { CatalogFilters as CatalogFilterValues } from '@/types/camper';
import { catalogFiltersSchema } from './filter-schema';
import styles from './CatalogFilters.module.css';

interface CatalogFiltersProps {
  initialFilters: CatalogFilterValues;
  onApply: (filters: CatalogFilterValues) => void;
}

const emptyFilters: CatalogFilterValues = {
  location: '',
  form: '',
  engine: '',
  transmission: '',
};

const camperForms = [
  { label: 'Alcove', value: 'alcove' },
  { label: 'Panel Van', value: 'panel_van' },
  { label: 'Integrated', value: 'integrated' },
  { label: 'Semi Integrated', value: 'semi_integrated' },
] as const;

const engines = [
  { label: 'Diesel', value: 'diesel' },
  { label: 'Petrol', value: 'petrol' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Electric', value: 'electric' },
] as const;

const transmissions = [
  { label: 'Automatic', value: 'automatic' },
  { label: 'Manual', value: 'manual' },
] as const;

export function CatalogFilters({
  initialFilters,
  onApply,
}: CatalogFiltersProps) {
  const { handleSubmit, register, reset } = useForm<CatalogFilterValues>({
    defaultValues: initialFilters,
    resolver: zodResolver(catalogFiltersSchema),
  });

  return (
    <form
      className={styles.panel}
      onSubmit={handleSubmit((filters) => onApply(filters))}
    >
      <div className={styles.info}>
        <label className={styles.locationField}>
          <span className={styles.fieldLabel}>Location</span>
          <span className={styles.locationControl}>
            <Image
              aria-hidden
              src="/icons/map-filter.svg"
              alt=""
              width={20}
              height={20}
            />
            <input {...register('location')} placeholder="City" />
          </span>
        </label>

        <div className={styles.filters}>
          <h2>Filters</h2>
          <div className={styles.groups}>
            <fieldset className={styles.group}>
              <legend>Camper form</legend>
              <div className={styles.options}>
                {camperForms.map(({ label, value }) => (
                  <label className={styles.option} key={value}>
                    <input type="radio" value={value} {...register('form')} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend>Engine</legend>
              <div className={styles.options}>
                {engines.map(({ label, value }) => (
                  <label className={styles.option} key={value}>
                    <input type="radio" value={value} {...register('engine')} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend>Transmission</legend>
              <div className={styles.options}>
                {transmissions.map(({ label, value }) => (
                  <label className={styles.option} key={value}>
                    <input
                      type="radio"
                      value={value}
                      {...register('transmission')}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button fullWidth type="submit">
          Search
        </Button>
        <Button
          className={styles.clearButton}
          fullWidth
          type="button"
          variant="secondary"
          onClick={() => reset(emptyFilters)}
        >
          <span className={styles.clearIcon}>
            <Image
              aria-hidden
              src="/icons/close.svg"
              alt=""
              width={12}
              height={12}
            />
          </span>
          Clear filters
        </Button>
      </div>
    </form>
  );
}
