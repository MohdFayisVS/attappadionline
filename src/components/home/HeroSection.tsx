import Link from 'next/link';
import styles from './HeroSection.module.css';
import { prisma } from '@/lib/prisma';

export default async function HeroSection() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  if (articles.length === 0) {
    return (
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`} style={{ display: 'block', textAlign: 'center', padding: '4rem' }}>
          <h2>No articles published yet.</h2>
          <p>Check back later or visit the admin panel to create some.</p>
        </div>
      </section>
    );
  }

  const featured = articles[0];
  const secondary = articles.slice(1);

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        
        {/* Main Featured Story */}
        <article className={styles.featured}>
          <div className={styles.breakingLabel}>Breaking News</div>
          <div className={styles.imagePlaceholder}>
            <div 
              className={styles.mockImg} 
              style={{ backgroundImage: `url(${featured.coverImage || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2670&auto=format&fit=crop'})` }}
            ></div>
          </div>
          <div className={styles.featuredContent}>
            <span className={styles.category}>{featured.category.name}</span>
            <h1 className={styles.featuredTitle}>
              {featured.title}
            </h1>
            <p className={styles.featuredExcerpt}>
              {featured.excerpt || featured.content.substring(0, 150) + '...'}
            </p>
            <div className={styles.meta}>
              <time>{new Date(featured.createdAt).toLocaleDateString()}</time>
              <Link href={`/article/${featured.slug}`} className="btn btn-accent">Read More</Link>
            </div>
          </div>
        </article>

        {/* Secondary Stories */}
        <aside className={styles.secondaryStories}>
          {secondary.map((article, i) => (
             <article key={article.id} className={styles.secondaryCard}>
              <div 
                className={styles.mockImgSmall} 
                style={{ backgroundImage: `url(${article.coverImage || `https://images.unsplash.com/photo-${1541872703 + i}-74c5e44368f9?q=80&w=2606&auto=format&fit=crop`})` }}
              ></div>
              <div className={styles.secondaryContent}>
                <span className={styles.category}>{article.category.name}</span>
                <h3 className={styles.secondaryTitle}>{article.title}</h3>
                <time>{new Date(article.createdAt).toLocaleDateString()}</time>
              </div>
            </article>
          ))}
          
          <div className={styles.ctaGroup}>
            <Link href="/search?q=" className="btn btn-primary" style={{ border: '1px solid var(--color-accent)' }}>All News</Link>
            <Link href="/category/videos" className="btn btn-accent">Watch Videos</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
