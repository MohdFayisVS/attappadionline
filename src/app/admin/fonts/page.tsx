import styles from './fonts.module.css';

export default function TypographyManager() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Typography & Font Manager</h1>
        <p className={styles.description}>Manage custom Malayalam fonts. You can assign these globally or per article.</p>
      </header>

      <div className={styles.panelsGrid}>
        
        <div className={styles.panel}>
          <h2>Global Typography Settings</h2>
          <div className={styles.fieldGroup}>
            <label>Default Heading Font</label>
            <select className={styles.select}>
              <option>System Default</option>
              <option>Manjari (Custom)</option>
              <option>Chilanka (Custom)</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label>Default Body Font</label>
            <select className={styles.select}>
              <option>System Default</option>
              <option>Manjari (Custom)</option>
              <option>Meera (Custom)</option>
            </select>
          </div>
          <button className="btn btn-primary">Save Global Settings</button>
        </div>

        <div className={styles.panel}>
          <h2>Upload New Font</h2>
          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>Tt</div>
            <p>Drag and drop your .TTF or .WOFF file here</p>
            <p className={styles.subtext}>or click to browse from your computer</p>
            <input type="file" accept=".ttf,.woff,.woff2" hidden />
            <button className="btn btn-accent" style={{ marginTop: '1rem' }}>Browse Files</button>
          </div>
        </div>

      </div>

      <div className={styles.fontListPanel}>
        <h2>Installed Fonts</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Font Name</th>
              <th>Preview</th>
              <th>Format</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Manjari</strong></td>
              <td className={styles.preview} style={{ fontFamily: 'serif' }}>അട്ടപ്പാടി ഓൺലൈൻ വാർത്തകൾ</td>
              <td>.ttf</td>
              <td>Oct 20, 2023</td>
              <td>
                <button className={styles.iconBtn}>🗑️</button>
              </td>
            </tr>
            <tr>
              <td><strong>Chilanka</strong></td>
              <td className={styles.preview} style={{ fontFamily: 'cursive' }}>പുതിയ സാംസ്കാരിക കേന്ദ്രം</td>
              <td>.woff2</td>
              <td>Sep 15, 2023</td>
              <td>
                <button className={styles.iconBtn}>🗑️</button>
              </td>
            </tr>
            <tr>
              <td><strong>Meera</strong></td>
              <td className={styles.preview} style={{ fontFamily: 'sans-serif' }}>കൂടുതൽ വികസന പദ്ധതികൾ</td>
              <td>.ttf</td>
              <td>Aug 02, 2023</td>
              <td>
                <button className={styles.iconBtn}>🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
