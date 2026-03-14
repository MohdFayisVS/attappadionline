import styles from './CommunityUpdates.module.css';

export default function CommunityUpdates() {
  const updates = [
    { type: 'Govt. Announcement', title: 'തിരഞ്ഞെടുപ്പ് കമ്മീഷന്റെ പ്രത്യേക അറിയിപ്പ്', date: 'Today' },
    { type: 'Local Alert', title: 'ജലവിതരണം തടസ്സപ്പെടും', date: 'Tomorrow, 9AM' },
    { type: 'Public Notice', title: 'പഞ്ചായത്ത് യോഗം മാറ്റിവെച്ചു', date: 'Oct 23' },
  ];

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>Community Updates</h3>
      <div className={styles.list}>
        {updates.map((update, idx) => (
          <div key={idx} className={styles.item}>
            <div className={styles.meta}>
              <span className={`
                ${styles.badge} 
                ${update.type === 'Local Alert' ? styles.alert : ''}
              `}>
                {update.type}
              </span>
              <span className={styles.date}>{update.date}</span>
            </div>
            <h4 className={styles.title}>{update.title}</h4>
          </div>
        ))}
      </div>
      <button className={`btn btn-primary ${styles.moreBtn}`}>View All Notices</button>
    </div>
  );
}
