import styles from './AdBanner.module.css';

interface AdBannerProps {
  type: 'header' | 'inline' | 'sidebar';
}

export default function AdBanner({ type }: AdBannerProps) {
  return (
    <div className={`${styles.adContainer} ${styles[type]}`}>
      <span className={styles.adLabel}>Advertisement</span>
      <div className={styles.adPlaceholder}>
        {type === 'header' && 'Google AdSense (Header 728x90)'}
        {type === 'inline' && 'Sponsored Content / Inline Ad'}
        {type === 'sidebar' && 'Banner Ad (Sidebar 300x250)'}
      </div>
    </div>
  );
}
