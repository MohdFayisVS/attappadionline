export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--color-text-light)' }}>Loading content...</p>
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(var(--color-primary-rgb), 0.1);
          border-left-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
