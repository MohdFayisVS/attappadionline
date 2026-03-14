import Link from 'next/link';
import styles from './articles.module.css';
import { getArticles } from './actions';

export default async function AdminArticles() {
  const { articles = [] } = await getArticles();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Articles</h1>
        <Link href="/admin/articles/create" className="btn btn-primary">Create New Article</Link>
      </header>
      
      <div className={styles.filters}>
        <input type="text" placeholder="Search articles..." className={styles.searchInput} />
        <select className={styles.select}>
          <option>All Statuses</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
        <select className={styles.select}>
          <option>All Categories</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles && articles.map((article: any) => (
              <tr key={article.id}>
                <td><div className={styles.articleTitle}>{article.title}</div></td>
                <td>{article.author.name || 'Admin'}</td>
                <td>{article.category.name}</td>
                <td>
                  <span className={`${styles.badge} ${article.published ? styles.badgePublished : ''}`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn}>✏️</button>
                    <Link href={`/article/${article.slug}`} className={styles.iconBtn} target="_blank">👁️</Link>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  No articles found. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className={styles.pagination}>
        <span>Showing 1 to 10 of 24 entries</span>
        <div className={styles.pageControls}>
          <button disabled>Prev</button>
          <button className={styles.active}>1</button>
          <button>2</button>
          <button>3</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  );
}
