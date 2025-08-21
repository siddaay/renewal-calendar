// src/styles/styles.js
export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1rem 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: '0.75rem'
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: '0.25rem'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  grid: {
    display: 'grid',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  gridCols4: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  gridCols2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginLeft: '0.5rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem'
  },
  statContent: {
    display: 'flex',
    alignItems: 'center'
  },
  statIcon: {
    marginRight: '0.75rem'
  },
  statLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280'
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.5rem',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  uploadAreaHover: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  uploadIcon: {
    margin: '0 auto 1rem auto',
    color: '#9ca3af'
  },
  uploadTitle: {
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  uploadSubtitle: {
    color: '#6b7280',
    marginBottom: '1rem'
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  eventCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    transition: 'all 0.2s ease'
  },
  eventCardClickable: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  eventCardYellow: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    color: '#92400e'
  },
  eventCardBlue: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    color: '#1e40af'
  },
  eventCardRed: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    color: '#dc2626'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  eventVendor: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center'
  },
  eventDescription: {
    fontSize: '0.875rem',
    opacity: 0.9,
    marginBottom: '0.25rem'
  },
  eventFilename: {
    fontSize: '0.75rem',
    opacity: 0.75
  },
  eventDate: {
    textAlign: 'right'
  },
  eventDateValue: {
    fontWeight: '600'
  },
  eventDateType: {
    fontSize: '0.75rem',
    opacity: 0.75,
    textTransform: 'capitalize'
  },
  agreementCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  agreementCardHover: {
    backgroundColor: '#f9fafb'
  },
  agreementCardHighlighted: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: '2px',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
  },
  agreementVendor: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: '0.5rem'
  },
  agreementDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    fontSize: '0.875rem'
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '2px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '0.375rem',
    maxWidth: '28rem'
  },
  // Notification styles
  notification: {
    border: '1px solid',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  notificationSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    color: '#047857'
  },
  notificationError: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    color: '#dc2626'
  },
  notificationInfo: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    color: '#1e40af'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    marginLeft: '0.5rem',
    color: 'inherit',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s'
  }
};

// Add spinner animation to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}