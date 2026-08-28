'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Keyboard, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/thumbs';
import type { CamperImage } from '@/types/camper';
import styles from './CamperGallery.module.css';

interface CamperGalleryProps {
  camperName: string;
  images: CamperImage[];
}

export function CamperGallery({ camperName, images }: CamperGalleryProps) {
  const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);

  if (images.length === 0) return null;

  return (
    <section className={styles.gallery} aria-label={`${camperName} gallery`}>
      <Swiper
        className={styles.mainSwiper}
        keyboard={{ enabled: true }}
        modules={[Keyboard, Thumbs]}
        onSwiper={setMainSwiper}
        slidesPerView={1}
        tabIndex={0}
        thumbs={{ swiper: thumbsSwiper?.destroyed ? null : thumbsSwiper }}
      >
        {images.map((image, index) => (
          <SwiperSlide className={styles.mainSlide} key={image.id}>
            <Image
              src={image.original}
              alt={`${camperName} — image ${index + 1}`}
              fill
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="638px"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        className={styles.thumbnails}
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView={4}
        spaceBetween={32}
        watchSlidesProgress
      >
        {images.map((image, index) => (
          <SwiperSlide className={styles.thumbnailSlide} key={image.id}>
            <button
              className={styles.thumbnailButton}
              type="button"
              aria-label={`Show ${camperName} image ${index + 1}`}
              onClick={() => mainSwiper?.slideTo(index)}
            >
              <Image src={image.thumb} alt="" fill sizes="136px" />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
