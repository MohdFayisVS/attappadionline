import styles from './VideoNewsSection.module.css';

export default function VideoNewsSection() {
  const videos = [
    { id: 1, title: 'മുഖ്യമന്ത്രിയുടെ പ്രത്യേക അഭിമുഖം', duration: '12:45', image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2670&auto=format&fit=crop' },
    { id: 2, title: 'അട്ടപ്പാടിയിലെ പുതിയ വികസന പദ്ധതികൾ', duration: '08:20', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop' },
    { id: 3, title: 'ജനകീയ ഇടപെടൽ - ഡോക്യുമെന്ററി', duration: '24:10', image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2606&auto=format&fit=crop' },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Video News</h2>
        <a href="/videos" className={styles.viewAll}>More Videos</a>
      </div>

      <div className={styles.grid}>
        {videos.map((video) => (
          <article key={video.id} className={styles.videoCard}>
            <div className={styles.thumbnailContainer}>
              <div className={styles.mockImg} style={{ backgroundImage: `url(${video.image})` }}></div>
              <div className={styles.playOverlay}>
                <div className={styles.playIcon}>▶</div>
              </div>
              <span className={styles.duration}>{video.duration}</span>
            </div>
            <h3 className={styles.title}>{video.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
