import Link from 'next/link';
import styles from './CategoryBlocks.module.css';
import { prisma } from '@/lib/prisma';

export default async function CategoryBlocks() {
  const categoriesToFetch = await prisma.category.findMany({
    take: 2,
    orderBy: {
      name: 'asc' // Fetch first two alphabetically for now, or could order by article count
    }
  });

  if (categoriesToFetch.length === 0) return null;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const blocks = await Promise.all(
    categoriesToFetch.map(async (cat, i) => {
      const articles = await prisma.article.findMany({
        where: { categoryId: cat.id, published: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      return {
        category: cat.name,
        color: colors[i % colors.length],
        articles
      };
    })
  );

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {blocks.map((block) => {
          if (block.articles.length === 0) return null;
          return (
            <div key={block.category} className={styles.block}>
              <div className={styles.blockHeader} style={{ borderBottomColor: block.color }}>
                <h3 style={{ backgroundColor: block.color }}>{block.category}</h3>
              </div>
              
              <div className={styles.articleList}>
                {block.articles.length > 0 && (
                  <article className={styles.highlightArticle}>
                    <Link href={`/article/${block.articles[0].slug}`}>
                      <div 
                        className={styles.mockImg} 
                        style={{ backgroundImage: `url(${block.articles[0].coverImage || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2673&auto=format&fit=crop'})` }}
                      ></div>
                    </Link>
                    <h4><Link href={`/article/${block.articles[0].slug}`}>{block.articles[0].title}</Link></h4>
                    <time>{new Date(block.articles[0].createdAt).toLocaleDateString()}</time>
                  </article>
                )}

                {block.articles.length > 1 && (
                  <ul className={styles.list}>
                    {block.articles.slice(1).map((article) => (
                      <li key={article.id}>
                        <Link href={`/article/${article.slug}`}>
                          <h4>{article.title}</h4>
                          <time>{new Date(article.createdAt).toLocaleDateString()}</time>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
