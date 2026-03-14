import styles from './page.module.css';
import HeroSection from '@/components/home/HeroSection';
import LatestNewsSection from '@/components/home/LatestNewsSection';
import VideoNewsSection from '@/components/home/VideoNewsSection';
import TrendingNews from '@/components/home/TrendingNews';
import CategoryBlocks from '@/components/home/CategoryBlocks';
import CommunityUpdates from '@/components/home/CommunityUpdates';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className={styles.homeLayout}>
      {/* 1. HERO SECTION */}
      <HeroSection />

      <div className={`container ${styles.mainGrid}`}>
        <div className={styles.mainContent}>
          {/* 2. LATEST NEWS SECTION */}
          <LatestNewsSection />
          
          {/* 3. VIDEO NEWS SECTION */}
          <VideoNewsSection />
          
          {/* 5. CATEGORY BLOCKS */}
          <CategoryBlocks />
        </div>
        
        <aside className={styles.sidebar}>
          {/* 4. TRENDING NEWS */}
          <TrendingNews />
          
          {/* 6. COMMUNITY UPDATES */}
          <CommunityUpdates />
        </aside>
      </div>

      {/* 7. NEWSLETTER SECTION */}
      <section className={styles.newsletter}>
        <div className="container">
          <h2>Subscribe to our Newsletter</h2>
          <p>Get the latest news and updates from Attappadi right in your inbox.</p>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit" className="btn btn-accent">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
