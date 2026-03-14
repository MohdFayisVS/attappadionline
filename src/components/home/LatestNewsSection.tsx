import Link from 'next/link';
import styles from './LatestNewsSection.module.css';
import { prisma } from '@/lib/prisma';

export default async function LatestNewsSection() {
  const news = await prisma.article.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    skip: 4, // Skip the ones shown in HeroSection
    take: 6,
  });

  if (news.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Latest News</h2>
        <Link href="/search?q=" className={styles.viewAll}>View All</Link>
      </div>

      <div className={styles.grid}>
        {news.map((item, i) => (
           <article key={item.id} className={styles.card}>
            <div className={styles.imagePlaceholder}>
              <Link href={`/article/${item.slug}`}>
                <div 
                  className={styles.mockImg} 
                  style={{ backgroundImage: `url(${item.coverImage || `https://images.unsplash.com/photo-${1542838132 + i}-92c53300491e?q=80&w=2574&auto=format&fit=crop`})` }}
                ></div>
              </Link>
            </div>
            <div className={styles.content}>
              <span className={styles.category}>{item.category.name}</span>
              <h3 className={styles.title}>
                <Link href={`/article/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className={styles.description}>
                {item.excerpt || (item.content.substring(0, 100) + '...')}
              </p>
              <time className={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
