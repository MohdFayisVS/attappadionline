import Link from 'next/link';
import styles from './search.module.css';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  const results = await prisma.article.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return (
    <div className={`container ${styles.searchPage}`}>
      <header className={styles.header}>
        <h1>Search Results</h1>
        <form action="/search" method="GET" className={styles.searchBar}>
          <input 
            type="text" 
            name="q"
            placeholder="Search news, videos, categories..." 
            defaultValue={query} 
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </header>

      <div className={styles.filtersWrapper}>
        <div className={styles.filtersConfig}>
          {/* Static filters placeholder for future updates */}
          <label>
            Category:
            <select className={styles.select}>
              <option>All Categories</option>
            </select>
          </label>
        </div>
        <div className={styles.resultsCount}>
          Showing <strong>{results.length}</strong> results {query && <span>for <em>&quot;{query}&quot;</em></span>}
        </div>
      </div>

      <div className={styles.resultsList}>
        {results.length === 0 ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', width: '100%', color: '#666' }}>
            <h2>No results found</h2>
            <p>Try adjusting your search query.</p>
          </div>
        ) : (
          results.map((article) => (
            <article key={article.id} className={styles.resultCard}>
              <Link href={`/article/${article.slug}`}>
                <div 
                  className={styles.resultThumb} 
                  style={{ backgroundImage: `url(${article.coverImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop'})` }}
                ></div>
              </Link>
              <div className={styles.resultContent}>
                <span className={styles.category}>{article.category.name}</span>
                <h2 className={styles.title}>
                  <Link href={`/article/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className={styles.excerpt}>
                  {article.excerpt || article.content.substring(0, 150) + '...'}
                </p>
                <time className={styles.time}>{new Date(article.createdAt).toLocaleDateString()}</time>
              </div>
            </article>
          ))
        )}
      </div>
      
      {results.length > 0 && (
        <div className={styles.pagination}>
          <button className={`btn ${styles.pageBtn}`} disabled>Previous</button>
          <button className={`btn ${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={`btn ${styles.pageBtn}`}>Next</button>
        </div>
      )}
    </div>
  );
}
