'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/Container/Container';
import styles from './Header.module.css';

const links = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" aria-label="TravelTrucks home" className={styles.logo}>
          <Image src="/icons/logo.svg" alt="TravelTrucks" width={136} height={16} priority />
        </Link>
        <nav aria-label="Primary navigation" className={styles.nav}>
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
                {label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
