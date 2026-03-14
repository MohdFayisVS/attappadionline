import Link from 'next/link';
import styles from './TrendingNews.module.css';
import { prisma } from '@/lib/prisma';

export default async function TrendingNews() {
  const trending = await prisma.article.findMany({
    where: { published: true },
    take: 5,
    orderBy: { updatedAt: 'desc' } // Proxy for 'trending' until view counts are added
  });

  if (trending.length === 0) return null;

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>Trending News</h3>
      <div className={styles.list}>
        {trending.map((item, index) => (
          <article key={item.id} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            <div className={styles.content}>
              <h4 className={styles.title}>
                <Link href={`/article/${item.slug}`}>{item.title}</Link>
              </h4>
              <span className={styles.views}>
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
