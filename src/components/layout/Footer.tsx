import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { getSettings } from '@/lib/settings';

export default async function Footer() {
  const settings = await getSettings();
  const footerLogo = settings.footerLogo;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerSection}>
          <div className={styles.logo} style={{ marginBottom: '1rem' }}>
            <Link href="/" style={{ display: 'inline-block' }}>
               {footerLogo.type === 'image' && footerLogo.imageUrl ? (
                  <div style={{ position: 'relative', width: '200px', height: '60px' }}>
                    <Image 
                      src={footerLogo.imageUrl} 
                      alt="Attappadi Online" 
                      fill 
                      style={{ objectFit: 'contain', objectPosition: 'left' }} 
                    />
                  </div>
                ) : (
                  <h3>{footerLogo.text}</h3>
                )}
            </Link>
          </div>
          <p className={styles.description}>
            Your premium, reliable source for the latest local news, videos, and community updates from Attappadi, Kerala.
          </p>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Categories</h4>
          <ul>
            <li><Link href="/category/local">Local News</Link></li>
            <li><Link href="/category/politics">Politics</Link></li>
            <li><Link href="/category/health">Health & Env</Link></li>
            <li><Link href="/category/events">Events</Link></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Attappadi Online. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
