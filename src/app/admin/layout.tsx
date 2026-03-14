import Link from 'next/link';
import styles from './adminLayout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/admin/dashboard">
            Attappadi <span>Admin</span>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <ul>
            <li><Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link></li>
            <li><Link href="/admin/articles" className={styles.navLink}>Articles</Link></li>
            <li><Link href="/admin/videos" className={styles.navLink}>Videos</Link></li>
            <li><Link href="/admin/categories" className={styles.navLink}>Categories</Link></li>
            <li><Link href="/admin/fonts" className={styles.navLink}>Typography & Fonts</Link></li>
            <li><Link href="/admin/users" className={styles.navLink}>Users & Roles</Link></li>
            <li><Link href="/admin/settings" className={styles.navLink}>Settings</Link></li>
          </ul>
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin User</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>Admin Panel</div>
          <div className={styles.actions}>
            <Link href="/" className="btn btn-primary" target="_blank">View Site</Link>
            <button className="btn btn-accent">Logout</button>
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
