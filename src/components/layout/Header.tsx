import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { getSettings } from '@/lib/settings';

export default async function Header() {
  const settings = await getSettings();
  const headerLogo = settings.headerLogo;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.logo}>
          <Link href="/">
             {headerLogo.type === 'image' && headerLogo.imageUrl ? (
                <div style={{ position: 'relative', width: '200px', height: '40px' }}>
                  <Image 
                    src={headerLogo.imageUrl} 
                    alt="Attappadi Online" 
                    fill 
                    style={{ objectFit: 'contain', objectPosition: 'left center' }} 
                    sizes="(max-width: 768px) 150px, 200px"
                  />
                </div>
              ) : (
                <span>{headerLogo.text}</span>
              )}
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/category/local">Local News</Link></li>
            <li><Link href="/category/videos">Videos</Link></li>
            <li><Link href="/category/community">Community Updates</Link></li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button className="btn btn-accent">Subscribe</button>
        </div>
      </div>
    </header>
  );
}
