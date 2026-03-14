import styles from './dashboard.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Articles</h3>
          <p className={styles.statValue}>1,245</p>
          <span className={styles.statTrend}>+12 this week</span>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Review</h3>
          <p className={styles.statValue}>8</p>
          <span className={`${styles.statTrend} ${styles.warning}`}>Needs attention</span>
        </div>
        <div className={styles.statCard}>
          <h3>Total Views</h3>
          <p className={styles.statValue}>452K</p>
          <span className={styles.statTrend}>+18% vs last month</span>
        </div>
        <div className={styles.statCard}>
          <h3>Active Users</h3>
          <p className={styles.statValue}>2,310</p>
          <span className={styles.statTrend}>+4% vs last week</span>
        </div>
      </div>

      <div className={styles.panelsGrid}>
        <div className={styles.panel}>
          <h2>Recent Articles</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>അട്ടപ്പാടിയിൽ പുതിയ സാംസ്കാരിക കേന്ദ്രം...</td>
                <td>Admin User</td>
                <td>Politics</td>
                <td><span className={`${styles.badge} ${styles.badgePublished}`}>Published</span></td>
                <td>Oct 24, 2023</td>
              </tr>
              <tr>
                <td>സ്കൂളുകളിൽ ഡിജിറ്റൽ ക്ലാസ് മുറികൾ വരുന്നു</td>
                <td>Publisher One</td>
                <td>Education</td>
                <td><span className={`${styles.badge} ${styles.badgeReview}`}>In Review</span></td>
                <td>Oct 24, 2023</td>
              </tr>
              <tr>
                <td>പുതിയ സ്പെഷ്യാലിറ്റി ആശുപത്രി തുറന്നു</td>
                <td>Publisher One</td>
                <td>Health</td>
                <td><span className={`${styles.badge} ${styles.badgeDraft}`}>Draft</span></td>
                <td>Oct 23, 2023</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <h2>Quick Actions</h2>
          <div className={styles.quickActions}>
            <button className="btn btn-primary">Write New Article</button>
            <button className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>Add Video News</button>
            <button className="btn btn-primary" style={{ backgroundColor: '#6366f1' }}>Upload Custom Font</button>
            <button className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>Review Comments (14)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
