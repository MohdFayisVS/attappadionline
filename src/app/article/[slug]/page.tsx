import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './article.module.css';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: true,
    }
  });

  if (!article || (!article.published && process.env.NODE_ENV === 'production')) {
    notFound();
  }

  // Related news based on the same category
  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      id: { not: article.id },
      published: true
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <article className={styles.articlePage}>
      <header className={styles.header}>
        <div className="container">
          <span className={styles.category}>{article.category.name}</span>
          <h1 className={styles.title}>
            {article.title}
          </h1>
          <div className={styles.meta}>
            <div className={styles.author}>
              By <span className={styles.authorName}>{article.author.name || 'Attappadi Desk'}</span>
            </div>
            <time>{new Date(article.createdAt).toLocaleDateString()} | {new Date(article.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
            <span className={styles.readTime}>
               {Math.max(1, Math.ceil(article.content.split(' ').length / 200))} min read
            </span>
          </div>
        </div>
      </header>

      {article.coverImage && (
        <div className={styles.heroImageContainer}>
          <div className="container">
            <div className={styles.heroImage} style={{ backgroundImage: `url(${article.coverImage})` }}></div>
          </div>
        </div>
      )}

      <div className={`container ${styles.contentWrapper}`}>
        <aside className={styles.socialShare}>
          <ul>
            <li><button className={styles.shareBtn} aria-label="Share on Facebook">F</button></li>
            <li><button className={styles.shareBtn} aria-label="Share on Twitter">X</button></li>
            <li><button className={styles.shareBtn} aria-label="Share on WhatsApp">W</button></li>
            <li><button className={styles.shareBtn} aria-label="Copy Link">🔗</button></li>
          </ul>
        </aside>

        <main className={styles.mainContent}>
          {/* Using dangerouslySetInnerHTML assuming the editor saves HTML */}
          <div 
            className={styles.bodyText}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <section className={styles.commentsSection}>
            <h3>Comments (0)</h3>
            <div className={styles.commentForm}>
              <textarea placeholder="Leave a comment..."></textarea>
              <button className="btn btn-primary">Post Comment</button>
            </div>
          </section>
        </main>
        
        <aside className={styles.sidebar}>
          <div className={styles.adSpace}>
            <p>Advertisement</p>
          </div>
          {relatedArticles.length > 0 && (
            <div className={styles.relatedNews}>
              <h3>Related News</h3>
              <ul className={styles.relatedList}>
                {relatedArticles.map(related => (
                  <li key={related.id}>
                    <a href={`/article/${related.slug}`}>{related.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
