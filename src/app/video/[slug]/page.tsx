import styles from './video.module.css';

export default function VideoArticlePage() {
  return (
    <article className={styles.videoPage}>
      <header className={styles.header}>
        <div className="container">
          <span className={styles.category}>Exclusively on Attappadi Online</span>
          <h1 className={styles.title}>
            മുഖ്യമന്ത്രിയുടെ പ്രത്യേക അഭിമുഖം: അട്ടപ്പാടി വികസനവും ഭാവി പദ്ധതികളും
          </h1>
          <div className={styles.meta}>
            <div className={styles.author}>
              By <span className={styles.authorName}>News Desk</span>
            </div>
            <time>October 24, 2023 | 08:00 PM</time>
          </div>
        </div>
      </header>

      <div className={styles.videoContainer}>
        <div className="container">
          <div className={styles.videoWrapper}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>

      <div className={`container ${styles.contentWrapper}`}>
        <main className={styles.mainContent}>
          <div className={styles.videoDescription}>
            <h3>About this video</h3>
            <p>
              അട്ടപ്പാടിയുടെ സമഗ്ര വികസനം ലക്ഷ്യമാക്കി സർക്കാർ നടപ്പിലാക്കാൻ ഉദ്ദേശിക്കുന്ന പുതിയ പദ്ധതികളെക്കുറിച്ച് മുഖ്യമന്ത്രി സംസാരിക്കുന്നു. വിദ്യാഭ്യാസ, ആരോഗ്യ മേഖലകളിലെ പ്രത്യേക ഇടപെടലുകൾ ഈ അഭിമുഖത്തിൽ വിശദീകരിക്കുന്നു.
            </p>
          </div>

          <section className={styles.commentsSection}>
            <h3>Comments (12)</h3>
            <div className={styles.commentForm}>
              <textarea placeholder="Share your thoughts..."></textarea>
              <button className="btn btn-primary">Post Comment</button>
            </div>
            {/* Dummy Comment */}
            <div className={styles.comment}>
              <strong>Rajesh P</strong>
              <time>1 day ago</time>
              <p>വളരെ വ്യക്തമായ മറുപടികൾ. പ്രതീക്ഷ നൽകുന്ന കാര്യങ്ങൾ.</p>
            </div>
          </section>
        </main>
        
        <aside className={styles.sidebar}>
          <div className={styles.relatedVideos}>
            <h3>Related Videos</h3>
            <ul className={styles.relatedList}>
              <li>
                <div className={styles.smallThumb}>▶</div>
                <div className={styles.relatedInfo}>
                  <a href="#">ഡോക്യുമെന്ററി: അട്ടപ്പാടിയുടെ ഇന്നലെകൾ</a>
                  <span>24:10</span>
                </div>
              </li>
              <li>
                <div className={styles.smallThumb}>▶</div>
                <div className={styles.relatedInfo}>
                  <a href="#">കൃഷിമന്ത്രിയുമായുള്ള സംവാദം</a>
                  <span>15:30</span>
                </div>
              </li>
              <li>
                <div className={styles.smallThumb}>▶</div>
                <div className={styles.relatedInfo}>
                  <a href="#">സ്പോർട്സ് മീറ്റ് പൂർണ്ണ രൂപം</a>
                  <span>45:00</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
