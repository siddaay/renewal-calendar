// src/components/Dashboard.jsx
import React from 'react';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, getDaysUntil, isAgreementExpired } from '../utils/dateHelpers';
import { styles } from '../styles/styles';

const Dashboard = ({ agreements, events }) => {
  // Filter out expired agreements for active stats
  const activeAgreements = agreements.filter(agreement => !isAgreementExpired(agreement));
  const expiredAgreements = agreements.filter(agreement => isAgreementExpired(agreement));
  
  const totalValue = activeAgreements.reduce((sum, agreement) => sum + (agreement.total_value || 0), 0);
  const upcomingEvents = events.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil <= 90 && daysUntil >= 0;
  });
  const urgentEvents = events.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil <= 30 && daysUntil >= 0;
  });

  return (
    <div style={{ ...styles.grid, ...styles.gridCols4 }}>
      <div style={styles.statCard}>
        <div style={styles.statContent}>
          <FileText size={32} color="#3b82f6" style={styles.statIcon} />
          <div>
            <p style={styles.statLabel}>Active Agreements</p>
            <p style={styles.statValue}>{activeAgreements.length}</p>
            {expiredAgreements.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {expiredAgreements.length} expired
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={styles.statContent}>
          <div style={{ ...styles.statIcon, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>$</div>
          <div>
            <p style={styles.statLabel}>Active Value</p>
            <p style={styles.statValue}>{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={styles.statContent}>
          <Clock size={32} color="#f59e0b" style={styles.statIcon} />
          <div>
            <p style={styles.statLabel}>Upcoming (90 days)</p>
            <p style={styles.statValue}>{upcomingEvents.length}</p>
          </div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={styles.statContent}>
          <AlertCircle size={32} color="#ef4444" style={styles.statIcon} />
          <div>
            <p style={styles.statLabel}>Urgent (30 days)</p>
            <p style={styles.statValue}>{urgentEvents.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;